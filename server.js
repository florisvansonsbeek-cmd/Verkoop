"use strict";
/*
 * Verkoopwebsite van Floris van Sonsbeek.
 * Eén Node-server: de site, het contactformulier (opslaan in Postgres en een melding sturen),
 * de websitecheck en /beheer om aanvragen en checks te bekijken.
 *
 * Variabelen (zie ook README.md):
 *   DATABASE_URL     Postgres. Zonder database bewaart de site aanvragen alleen tot de volgende herstart.
 *   APP_PASSWORD     wachtwoord voor /beheer. Zonder wachtwoord blijft /beheer dicht.
 *   CONTACT_PHONE    telefoonnummer dat op de site staat (bijv. 06 12345678); geeft ook een WhatsApp-link.
 *   CONTACT_EMAIL    e-mailadres dat op de site staat.
 *
 * Pagina per soort bedrijf: /voor/<slug>, gemaakt uit templates/branche.html en public/js/plannen.js.
 * Voorbeelden per vak: /voorbeelden, gemaakt uit templates/voorbeelden.html en public/js/vakken.js.
 * Echte ervaringen van klanten: content/ervaringen.json, bijvoorbeeld [{ "tekst": "...", "naam": "...", "zaak": "..." }].
 * Zonder CONTACT_PHONE blijven de app- en belknoppen weg.
 *   NTFY_TOPIC       pushmelding op je telefoon bij een nieuwe aanvraag (app ntfy). NTFY_SERVER en NTFY_TOKEN optioneel.
 *   RESEND_API_KEY   mail bij een nieuwe aanvraag via Resend, met MAIL_TO en eventueel MAIL_FROM.
 *   SITE_URL         het eigen adres van de site, bijv. https://verkoop.vsonsbeek.nl (voor canonical, sitemap,
 *                    deel-links en de link in meldingen). De server controleert zelf of dat adres al bij hem
 *                    uitkomt. Zodra dat zo is, stuurt het railway.app-adres bezoekers door naar het eigen adres;
 *                    tot die tijd blijft alles op het adres waarop de bezoeker binnenkwam.
 */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const crypto = require("node:crypto");
const vm = require("node:vm");
const { checkWebsite, CheckError } = require("./lib/check");

const PORT = Number(process.env.PORT) || 3000;
const APP_PASSWORD = process.env.APP_PASSWORD || "";
const SITE_URL = (process.env.SITE_URL || "").replace(/\/+$/, "");
const SITE_HOST = (() => { try { return SITE_URL ? new URL(SITE_URL).host.toLowerCase() : ""; } catch { return ""; } })();
/* Kenmerk waarmee de server zichzelf herkent als hij zijn eigen adres opvraagt; gelijk voor elke uitrol van deze service. */
const INSTANTIE = crypto.createHash("sha256").update("verkoop:" + (process.env.RAILWAY_SERVICE_ID || "lokaal")).digest("hex").slice(0, 16);
/* true zodra SITE_URL echt bij deze server uitkomt. Een http://-adres (lokaal testen) wordt niet gecontroleerd. */
let siteLive = !!SITE_HOST && !SITE_URL.startsWith("https://");
const PUBLIC_DIR = path.join(__dirname, "public");
const TEMPLATE_DIR = path.join(__dirname, "templates");
const CONTENT_DIR = path.join(__dirname, "content");
const VERSION = (process.env.RAILWAY_GIT_COMMIT_SHA || Date.now().toString(36)).slice(0, 10);
let VAKKEN = [];            // de elf vakken uit public/js/plannen.js, gevuld bij het laden
const WENSEN = ["Nieuwe website", "Website vernieuwen", "Dashboard mail en facturen", "Weet ik nog niet"];
const STATUSSEN = [["nieuw", "Nieuw"], ["gebeld", "Contact gehad"], ["afspraak", "Afspraak gepland"], ["offerte", "Offerte gestuurd"], ["klant", "Klant"], ["geen", "Geen interesse"]];

function log(...a) { console.log(new Date().toISOString(), ...a); }
function esc(s) { return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------- Database ---------------- */
let pool = null;
const mem = { aanvragen: [], checks: [], id: 0 };
if (process.env.DATABASE_URL) {
  const { Pool } = require("pg");
  pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5, ssl: /sslmode=require/.test(process.env.DATABASE_URL) ? { rejectUnauthorized: false } : undefined });
  pool.on("error", (e) => log("Database-fout:", e.message));
}
let dbReady = false;
async function migrate() {
  if (!pool) { log("Geen DATABASE_URL: aanvragen blijven alleen tot de volgende herstart bewaard."); return; }
  for (let i = 1; i <= 10; i++) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS aanvragen (
          id bigserial PRIMARY KEY,
          ontvangen timestamptz NOT NULL DEFAULT now(),
          naam text NOT NULL, zaak text, contact text NOT NULL, wensen text[] NOT NULL DEFAULT '{}', bericht text,
          vak text, voorbeeld text, check_url text,
          status text NOT NULL DEFAULT 'nieuw', notitie text, bijgewerkt timestamptz NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS checks (
          id bigserial PRIMARY KEY, gecheckt timestamptz NOT NULL DEFAULT now(),
          host text NOT NULL, url text NOT NULL, score int, oordeel text, details jsonb
        );
        CREATE TABLE IF NOT EXISTS app_meta (sleutel text PRIMARY KEY, waarde text NOT NULL);
      `);
      dbReady = true; log("Database klaar"); return;
    } catch (e) { log(`Database nog niet bereikbaar (poging ${i}): ${e.message}`); await sleep(Math.min(1000 * i, 8000)); }
  }
}
async function saveAanvraag(a) {
  if (pool && dbReady) {
    const r = await pool.query(
      "INSERT INTO aanvragen (naam, zaak, contact, wensen, bericht, vak, voorbeeld, check_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id",
      [a.naam, a.zaak || null, a.contact, a.wensen, a.bericht || null, a.vak, a.voorbeeld || null, a.check_url || null]);
    return Number(r.rows[0].id);
  }
  const id = ++mem.id;
  mem.aanvragen.unshift({ id, ontvangen: new Date(), status: "nieuw", notitie: "", ...a });
  return id;
}
async function saveCheck(r) {
  const details = { groepen: r.groepen, ms: r.ms, titel: r.titel };
  if (pool && dbReady) return pool.query("INSERT INTO checks (host, url, score, oordeel, details) VALUES ($1,$2,$3,$4,$5)", [r.host, r.url, r.score, r.oordeel, details]);
  mem.checks.unshift({ gecheckt: new Date(), host: r.host, url: r.url, score: r.score, oordeel: r.oordeel });
  mem.checks.length = Math.min(mem.checks.length, 200);
}
async function listAanvragen() {
  if (pool && dbReady) return (await pool.query("SELECT * FROM aanvragen ORDER BY ontvangen DESC LIMIT 500")).rows;
  return mem.aanvragen;
}
async function listChecks() {
  if (pool && dbReady) return (await pool.query("SELECT gecheckt, host, url, score, oordeel FROM checks ORDER BY gecheckt DESC LIMIT 150")).rows;
  return mem.checks;
}
async function updateStatus(id, status, notitie) {
  if (pool && dbReady) return pool.query("UPDATE aanvragen SET status = $2, notitie = $3, bijgewerkt = now() WHERE id = $1", [id, status, notitie]);
  const a = mem.aanvragen.find((x) => x.id === id);
  if (a) { a.status = status; a.notitie = notitie; }
}

/* ---------------- Sessies voor /beheer ---------------- */
let sessionKey = null;
async function initSession() {
  let secret = crypto.randomBytes(32).toString("hex");
  if (pool && dbReady) {
    await pool.query("INSERT INTO app_meta (sleutel, waarde) VALUES ('sessie_geheim', $1) ON CONFLICT (sleutel) DO NOTHING", [secret]);
    secret = (await pool.query("SELECT waarde FROM app_meta WHERE sleutel = 'sessie_geheim'")).rows[0].waarde;
  }
  // Het wachtwoord zit in de sleutel: wijzig je APP_PASSWORD, dan vervallen alle sessies.
  sessionKey = crypto.createHash("sha256").update(secret + "\u0000" + APP_PASSWORD).digest();
}
const sign = (s) => crypto.createHmac("sha256", sessionKey).update(s).digest("base64url");
function makeToken() { const body = Buffer.from(JSON.stringify({ exp: Date.now() + 12 * 3600e3 })).toString("base64url"); return body + "." + sign(body); }
function validToken(t) {
  if (!t || !sessionKey || !APP_PASSWORD) return false;
  const [body, sig] = String(t).split(".");
  if (!body || !sig) return false;
  const a = Buffer.from(sig), b = Buffer.from(sign(body));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try { return JSON.parse(Buffer.from(body, "base64url").toString()).exp > Date.now(); } catch { return false; }
}
function passwordOk(p) {
  if (!APP_PASSWORD) return false;
  const a = crypto.createHash("sha256").update(String(p || "")).digest();
  const b = crypto.createHash("sha256").update(APP_PASSWORD).digest();
  return crypto.timingSafeEqual(a, b);
}
function cookies(req) {
  const out = {};
  String(req.headers.cookie || "").split(";").forEach((c) => { const i = c.indexOf("="); if (i > 0) out[c.slice(0, i).trim()] = decodeURIComponent(c.slice(i + 1).trim()); });
  return out;
}

/* ---------------- Hulpjes ---------------- */
const buckets = new Map();
function limited(key, max, windowMs) {
  const now = Date.now();
  const arr = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  const hit = arr.length >= max;
  if (!hit) arr.push(now);
  buckets.set(key, arr);
  return hit;
}
setInterval(() => { const now = Date.now(); for (const [k, v] of buckets) if (!v.some((t) => now - t < 3600e3)) buckets.delete(k); }, 600e3).unref();
function clientIp(req) {
  return String(req.headers["x-real-ip"] || String(req.headers["x-forwarded-for"] || "").split(",")[0] || req.socket.remoteAddress || "?").trim();
}
function isHttps(req) { return String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim() === "https"; }
function sameOrigin(req) {
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "");
  const o = req.headers.origin;
  if (o) { try { return new URL(o).host === host; } catch { return false; } }
  const sfs = req.headers["sec-fetch-site"];
  return !sfs || sfs === "same-origin" || sfs === "none";
}
/* Komt het eigen adres al bij deze server uit? Een keer gelukt is genoeg om over te stappen;
 * pas na drie mislukte pogingen op rij valt de site terug op het binnenkomende adres. */
let domeinMislukt = 0, eersteCheck = true;
function controleerDomein() {
  return new Promise((resolve) => {
    const klaar = (ok, reden) => {
      domeinMislukt = ok ? 0 : domeinMislukt + 1;
      const nu = ok || (siteLive && domeinMislukt < 3);
      if (eersteCheck && !nu) log(`Eigen adres ${SITE_HOST} nog niet bereikbaar (${reden}); de site blijft op het adres waarop bezoekers binnenkomen en probeert het elke twee minuten opnieuw.`);
      eersteCheck = false;
      if (nu !== siteLive) {
        siteLive = nu;
        log(nu ? `Eigen adres ${SITE_HOST} werkt: canonical en sitemap wijzen ernaar, het railway.app-adres stuurt door.`
               : `Eigen adres ${SITE_HOST} niet bereikbaar (${reden}): de site gebruikt weer het adres waarop bezoekers binnenkomen.`);
      }
      resolve();
    };
    const vraag = require("node:https").get(SITE_URL + "/healthz", { timeout: 8000, headers: { "User-Agent": "verkoop-zelfcheck" } }, (r) => {
      r.resume();
      klaar(r.statusCode === 200 && r.headers["x-instantie"] === INSTANTIE, "status " + r.statusCode);
    });
    vraag.on("timeout", () => vraag.destroy(new Error("geen antwoord")));
    vraag.on("error", (e) => klaar(false, e.code || e.message));
  });
}
function startDomeinCheck() {
  if (!SITE_HOST || !SITE_URL.startsWith("https://")) return;
  const ronde = () => controleerDomein().then(() => setTimeout(ronde, siteLive ? 600e3 : 120e3).unref());
  ronde();
}
function originOf(req) {
  if (SITE_URL && siteLive) return SITE_URL;
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "");
  if (!/^[a-z0-9.-]+(:\d{1,5})?$/i.test(host)) return "";
  return (isHttps(req) ? "https://" : "http://") + host;
}
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size <= limit) chunks.push(c);
      else if (size > limit * 8) req.destroy(); // veel te groot: verbinding dicht
    });
    req.on("end", () => size > limit ? reject(Object.assign(new Error("te groot"), { status: 413 })) : resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}
async function readJson(req, limit) {
  const raw = await readBody(req, limit);
  try { return JSON.parse(raw || "{}"); } catch { throw Object.assign(new Error("geen JSON"), { status: 400 }); }
}
async function readForm(req, limit) { return Object.fromEntries(new URLSearchParams(await readBody(req, limit))); }
function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Content-Length": Buffer.byteLength(body) });
  res.end(body);
}
function sendHtml(res, status, html, extra = {}) {
  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", ...extra });
  res.end(html);
}
function redirect(res, to, extra = {}) { res.writeHead(303, { Location: to, "Cache-Control": "no-store", ...extra }); res.end(); }
function secHeaders(req, res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; font-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'");
  if (isHttps(req)) res.setHeader("Strict-Transport-Security", "max-age=15552000");
}

/* ---------------- Statische bestanden ---------------- */
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml",
  ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".xml": "application/xml; charset=utf-8", ".webmanifest": "application/manifest+json" };
const files = new Map();
let indexTemplate = "";
const indexCache = new Map();
function telefoon() {
  const tel = (process.env.CONTACT_PHONE || "").trim();
  if (!tel) return null;
  const d = tel.replace(/[^\d+]/g, "");
  const intl = d.startsWith("+") ? d : d.startsWith("00") ? "+" + d.slice(2) : d.startsWith("0") ? "+31" + d.slice(1) : d;
  return { tel, intl, mobiel: /^\+316\d{8}$/.test(intl) };
}
const APP_TEKST = encodeURIComponent("Hoi Floris, ik heb een vraag over een website voor mijn zaak.");
const APP_ICOON = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4.5 19.5l1.2-3.6A8 8 0 1 1 8.6 19z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 9.2c.2 2.6 2.2 4.7 4.8 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
function contactBlock() {
  const out = [];
  const t = telefoon();
  const mail = (process.env.CONTACT_EMAIL || "").trim();
  if (t) {
    out.push(`<p><span data-i18n="t283">Bellen</span><a href="tel:${esc(t.intl)}">${esc(t.tel)}</a></p>`);
    if (t.mobiel) out.push(`<p><span>WhatsApp</span><a href="https://wa.me/${esc(t.intl.slice(1))}?text=${APP_TEKST}" target="_blank" rel="noopener" data-i18n="t284">Stuur me een appje</a></p>`);
  }
  if (mail && /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(mail)) out.push(`<p><span data-i18n="t285">Mailen</span><a href="mailto:${esc(mail)}">${esc(mail)}</a></p>`);
  return out.join("\n");
}
// grote app-knop bij contact en een zwevende knop op de telefoon; alleen met een 06-nummer
function appKnop() {
  const t = telefoon();
  return t && t.mobiel ? `<a class="btn btn--app" href="https://wa.me/${esc(t.intl.slice(1))}?text=${APP_TEKST}" target="_blank" rel="noopener">${APP_ICOON}<span data-i18n="t281">Stuur een appje</span></a>` : "";
}
function appZweef() {
  const t = telefoon();
  return t && t.mobiel ? `<a class="app-zweef" href="https://wa.me/${esc(t.intl.slice(1))}?text=${APP_TEKST}" target="_blank" rel="noopener" aria-label="Stuur een appje via WhatsApp" data-i18n-aria="t282">${APP_ICOON}</a>` : "";
}
// echte ervaringen van klanten staan in content/ervaringen.json: [{ "tekst": "...", "naam": "...", "zaak": "..." }]
function ervaringen() {
  let lijst = [];
  try { lijst = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, "ervaringen.json"), "utf8")); } catch { lijst = []; }
  lijst = (Array.isArray(lijst) ? lijst : []).filter((e) => e && e.tekst && e.naam);
  if (!lijst.length) return "";
  return `<div class="ervaringen"><h3 data-i18n="t279">Wat klanten zeggen</h3><div class="ervaringen-lijst">` +
    lijst.map((e) => `<figure class="ervaring"><blockquote><p>${esc(e.tekst)}</p></blockquote><figcaption><b>${esc(e.naam)}</b>${e.zaak ? `<span>${esc(e.zaak)}</span>` : ""}</figcaption></figure>`).join("") +
    `</div></div>`;
}
function loadStatic() {
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]);
  for (const f of walk(PUBLIC_DIR)) {
    const rel = "/" + path.relative(PUBLIC_DIR, f).split(path.sep).join("/");
    const buf = fs.readFileSync(f);
    if (rel === "/index.html") {
      const foto = fs.existsSync(path.join(PUBLIC_DIR, "img", "floris.jpg")) ? `<img src="/img/floris.jpg" alt="" width="440" height="440">` : "FvS";
      indexTemplate = buf.toString("utf8").replaceAll("{{V}}", VERSION).replace("{{CONTACT}}", contactBlock()).replace("{{FOTO}}", foto)
        .replace("{{APPKNOP}}", appKnop()).replace("{{APPZWEEF}}", appZweef()).replace("{{ERVARINGEN}}", ervaringen());
      continue;
    }
    files.set(rel, packFile(buf, TYPES[path.extname(f).toLowerCase()] || "application/octet-stream"));
  }
  loadBranches();
  log(`${files.size + 1} bestanden en ${BRANCHES.size} pagina's per bedrijfssoort geladen`);
}

/* ---------------- Pagina's per soort bedrijf: /voor/<slug> ---------------- */
const BRANCHES = new Map();
const brancheCache = new Map();
let PLANNEN = [];
function stuk(html, begin, eindTag) {
  const i = html.indexOf(begin);
  if (i < 0) throw new Error("Niet gevonden in index.html: " + begin);
  // zoek de bijbehorende sluittag door te tellen
  const tag = begin.match(/^<(\w+)/)[1];
  const re = new RegExp(`<${tag}[\\s>]|</${tag}>`, "g");
  re.lastIndex = i;
  let diep = 0, m;
  while ((m = re.exec(html))) {
    diep += m[0].startsWith("</") ? -1 : 1;
    if (diep === 0) return html.slice(i, m.index + m[0].length);
  }
  throw new Error("Geen einde voor " + begin + (eindTag || ""));
}
const naarVoorpagina = (h) => h.replace(/href="#/g, 'href="/#');
const hoofdletter = (t) => t.charAt(0).toUpperCase() + t.slice(1);
// de systemen waar een vak op aansluit, als lijstjes (namen zijn soms per taal anders, zoals Google Agenda)
const koppelNamen = (pl) => ((pl.koppel && pl.koppel.namen) || []).map((n) => `<li>${esc(typeof n === "string" ? n : n.nl)}</li>`).join("");
function inkorten(t, n) { if (t.length <= n) return t; const k = t.slice(0, n - 1); return k.slice(0, k.lastIndexOf(" ")) + "…"; }
function loadBranches() {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(PUBLIC_DIR, "js", "plannen.js"), "utf8"), ctx);
  vm.runInNewContext(fs.readFileSync(path.join(PUBLIC_DIR, "js", "voorbeelden.js"), "utf8"), ctx);
  PLANNEN = ctx.window.PLANNEN || [];
  VAKKEN = PLANNEN.map((pl) => pl.id);
  PLANNEN.forEach((pl) => { VAK_LABEL[pl.id] = pl.naam.nl; });
  const VB = ctx.window.VOORBEELDEN || {};
  const tpl = fs.readFileSync(path.join(TEMPLATE_DIR, "branche.html"), "utf8");
  const delen = {
    KOP: naarVoorpagina(stuk(indexTemplate, '<header class="top">')),
    VOET: naarVoorpagina(stuk(indexTemplate, '<footer class="foot">')),
    PAKKETTEN: stuk(indexTemplate, '<div class="pakketten">'),
    ZEKERHEDEN: stuk(indexTemplate, '<div class="zeker-blok">'),
    KAARTJE: stuk(indexTemplate, '<div class="kaartje">'),
  };
  BRANCHES.clear(); brancheCache.clear();
  PLANNEN.forEach((pl, i) => {
    if (!pl.slug) return;
    const groep = pl.groep.nl;
    const wie = (k) => ((VB[pl.id] || {}).punten || [])[k]?.wie || "k";
    const legenda = pl.punten.map((p, k) => `<li class="pk" data-n="${k + 1}" data-wie="${wie(k)}"><div class="pk-rij"><div class="pk-kop"><span class="nr">${k + 1}</span><span class="pk-tekst"><b>${esc(p.t.nl)}</b><span>${esc(p.u.nl)}</span></span></div></div></li>`).join("");
    const andere = PLANNEN.filter((x) => x.slug && x.id !== pl.id).map((x) => `<li><a data-groep="${esc(x.id)}" href="/voor/${esc(x.slug)}">${esc(hoofdletter(x.groep.nl))}</a></li>`).join("");
    const pad = "/voor/" + pl.slug;
    const jsonld = JSON.stringify({ "@context": "https://schema.org", "@type": "Service", name: `Websites en slimme systemen voor ${groep}`,
      provider: { "@type": "Person", name: "Floris van Sonsbeek" }, areaServed: { "@type": "City", name: "Utrecht" }, url: "{{ORIGIN}}" + pad,
      offers: { "@type": "Offer", priceCurrency: "EUR", priceSpecification: { "@type": "PriceSpecification", minPrice: 895, priceCurrency: "EUR" } } }).replace(/</g, "\\u003c");
    const waarden = {
      ...delen, V: VERSION, PAD: pad, PLAN: esc(pl.id), JSONLD: jsonld,
      TITEL: esc(`Website voor ${groep} in Utrecht | Van Sonsbeek`), OGTITEL: esc(`Een website voor ${groep}`),
      BESCHRIJVING: esc(inkorten(pl.intro.nl, 158)), H1: esc(`Een website voor ${groep}`),
      LEAD: esc(`Ik bouw websites en slimme systemen voor ${groep} in Utrecht en omgeving. Hieronder zie je wat dat in de praktijk kan betekenen.`),
      GROEP_HOOFD: esc(hoofdletter(groep)), PLAN_TITEL: esc(pl.titel.nl), PLAN_INTRO: esc(pl.intro.nl), BLAD: `${i + 1} van ${PLANNEN.length}`,
      LEGENDA: legenda, ANDERE: andere, APPKNOP: appKnop(), APPZWEEF: appZweef(),
      KOPPEL_TEKST: esc(pl.koppel ? pl.koppel.t.nl : ""), KOPPEL_NAMEN: koppelNamen(pl),
    };
    const html = tpl.replace(/\{\{([A-Z0-9_]+)\}\}/g, (m, k) => (k === "ORIGIN" ? m : k in waarden ? waarden[k] : m));
    BRANCHES.set(pl.slug, html);
  });
  loadVoorbeelden(delen);
}

/* ---------------- Voorbeelden per vak: /voorbeelden ----------------
   De pagina werkt met JavaScript (voorbeeldsite, demo, check), maar de keuze, de uitleg en de links staan er ook zonder. */
let voorbeeldenTpl = "", VAKDATA = {}, HANDIG = [];
const voorbeeldenCache = new Map();
const OUDE_VAKKEN = { streek: "boerderij" };
const UIT_ICOON = '<svg class="uit" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3h7v7M13 3 4 12"/></svg>';
const nl = (o) => (o == null ? "" : typeof o === "string" ? o : o.nl);
function linksLijst(lijst, metWie) {
  return lijst.map((l) => {
    const url = nl(l.url), host = url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];
    return `<li class="link${metWie ? " link--" + l.wie : ""}">` + (metWie ? `<span class="link-wie">${l.wie === "k" ? "Voor je klanten" : "Voor jou"}</span>` : "") +
      `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(nl(l.t))}${UIT_ICOON}<span class="sr"> (opent in een nieuw tabblad)</span></a>` +
      `<p>${esc(nl(l.u))}</p><span class="link-bron">${esc(host)}</span></li>`;
  }).join("");
}
function loadVoorbeelden(delen) {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(PUBLIC_DIR, "js", "vakken.js"), "utf8"), ctx);
  VAKDATA = ctx.window.VAKKEN || {};
  HANDIG = ctx.window.HANDIG || [];
  const jsonld = JSON.stringify({ "@context": "https://schema.org", "@type": "CollectionPage", name: "Voorbeelden per vak", url: "{{ORIGIN}}/voorbeelden",
    about: { "@type": "Service", name: "Websites en dashboards voor kleine zaken", areaServed: { "@type": "City", name: "Utrecht" } } }).replace(/</g, "\\u003c");
  const vast = { ...delen, KOP: delen.KOP.replace('href="/voorbeelden"', 'href="/voorbeelden" aria-current="page"'), V: VERSION, JSONLD: jsonld,
    HANDIG: linksLijst(HANDIG, false), APPKNOP: appKnop(), APPZWEEF: appZweef() };
  voorbeeldenTpl = fs.readFileSync(path.join(TEMPLATE_DIR, "voorbeelden.html"), "utf8")
    .replace(/\{\{([A-Z0-9_]+)\}\}/g, (m, k) => (k in vast ? vast[k] : m));
  voorbeeldenCache.clear();
}
function voorbeeldenHtml(vak) {
  const pl = PLANNEN.find((x) => x.id === vak), v = VAKDATA[vak];
  const groep = hoofdletter(pl.groep.nl);
  const waarden = {
    CHIPS: PLANNEN.filter((x) => VAKDATA[x.id]).map((x) => `<label class="chip"><input type="radio" name="vak" value="${esc(x.id)}"${x.id === vak ? " checked" : ""}><span>${esc(hoofdletter(x.naam.nl))}</span></label>`).join(""),
    GROEP: esc(groep), LINKSKOP: esc(`Handig voor ${pl.groep.nl}`),
  };
  return voorbeeldenTpl.replace(/\{\{(CHIPS|GROEP|LINKSKOP)\}\}/g, (m, k) => waarden[k])
    .replace('<ul class="vb-site" id="vb-site"></ul>', () => `<ul class="vb-site" id="vb-site">${v.k.map((i) => `<li><b>${esc(pl.punten[i].t.nl)}</b><span>${esc(pl.punten[i].u.nl)}</span></li>`).join("")}</ul>`)
    .replace('<ul class="vb-achter" id="vb-achter"></ul>', () => `<ul class="vb-achter" id="vb-achter">${v.j.map((i) => `<li>${esc(pl.punten[i].t.nl)}</li>`).join("")}</ul>`)
    .replace('<p class="vb-koppel-tekst" id="vb-koppel-tekst"></p>', () => `<p class="vb-koppel-tekst" id="vb-koppel-tekst">${esc(pl.koppel ? pl.koppel.t.nl : "")}</p>`)
    .replace('<ul class="vb-koppel" id="vb-koppel"></ul>', () => `<ul class="vb-koppel" id="vb-koppel">${koppelNamen(pl)}</ul>`)
    .replace('<ul class="links" id="vb-links"></ul>', () => `<ul class="links" id="vb-links">${linksLijst(v.links, true)}</ul>`)
    .replace('href="/voor/kappers-en-barbiers" id="vb-plan">Bekijk de plattegrond</a>', () => `href="/voor/${esc(pl.slug)}" id="vb-plan">Bekijk de plattegrond voor ${esc(pl.groep.nl)}</a>`);
}
function serveVoorbeelden(req, res, url) {
  let vak = url.searchParams.get("vak") || "";
  vak = OUDE_VAKKEN[vak] || vak;
  if (!VAKDATA[vak]) vak = VAKDATA.kapper ? "kapper" : Object.keys(VAKDATA)[0];
  const origin = originOf(req), key = origin + " " + vak;
  if (!voorbeeldenCache.has(key)) {
    if (voorbeeldenCache.size > 40) voorbeeldenCache.clear();
    voorbeeldenCache.set(key, packFile(Buffer.from(voorbeeldenHtml(vak).replaceAll("{{ORIGIN}}", esc(origin))), TYPES[".html"]));
  }
  serveFile(req, res, voorbeeldenCache.get(key), "no-cache");
}
function serveBranche(req, res, p) {
  const slug = p.replace(/^\/voor\/?/, "").replace(/\/+$/, "");
  if (!slug) return redirect(res, "/#begin");
  const html = BRANCHES.get(slug);
  if (!html) return serveStatic(req, res, p);
  const origin = originOf(req), key = origin + p;
  if (!brancheCache.has(key)) {
    if (brancheCache.size > 40) brancheCache.clear();
    brancheCache.set(key, packFile(Buffer.from(html.replaceAll("{{ORIGIN}}", esc(origin))), TYPES[".html"]));
  }
  serveFile(req, res, brancheCache.get(key), "no-cache");
}
function sitemap(req, res) {
  const base = originOf(req);
  const urls = ["/", "/voorbeelden", ...[...BRANCHES.keys()].map((s) => "/voor/" + s)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${esc(base + u)}</loc></url>`).join("\n") + "\n</urlset>\n";
  res.writeHead(200, { "Content-Type": TYPES[".xml"], "Cache-Control": "public, max-age=3600" });
  res.end(req.method === "HEAD" ? undefined : xml);
}
function robots(req, res) {
  const txt = `User-agent: *\nDisallow: /beheer\n\nSitemap: ${originOf(req)}/sitemap.xml\n`;
  res.writeHead(200, { "Content-Type": TYPES[".txt"], "Cache-Control": "public, max-age=3600" });
  res.end(req.method === "HEAD" ? undefined : txt);
}
function packFile(buf, type) {
  const zip = /text|svg|json|javascript|xml/.test(type) && buf.length > 800;
  return { buf, type, etag: '"' + crypto.createHash("sha1").update(buf).digest("base64url").slice(0, 16) + '"',
    br: zip ? zlib.brotliCompressSync(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } }) : null,
    gz: zip ? zlib.gzipSync(buf, { level: 9 }) : null };
}
function indexFor(req) {
  const origin = originOf(req);
  if (!indexCache.has(origin)) {
    if (indexCache.size > 8) indexCache.clear();
    indexCache.set(origin, packFile(Buffer.from(indexTemplate.replaceAll("{{ORIGIN}}", esc(origin))), TYPES[".html"]));
  }
  return indexCache.get(origin);
}
function serveFile(req, res, f, cache) {
  if (req.headers["if-none-match"] === f.etag) { res.writeHead(304, { ETag: f.etag, "Cache-Control": cache }); return res.end(); }
  const ae = String(req.headers["accept-encoding"] || "");
  let body = f.buf, enc = null;
  if (f.br && /\bbr\b/.test(ae)) { body = f.br; enc = "br"; } else if (f.gz && /\bgzip\b/.test(ae)) { body = f.gz; enc = "gzip"; }
  const h = { "Content-Type": f.type, "Content-Length": body.length, ETag: f.etag, "Cache-Control": cache, Vary: "Accept-Encoding" };
  if (enc) h["Content-Encoding"] = enc;
  res.writeHead(200, h);
  res.end(req.method === "HEAD" ? undefined : body);
}
function serveStatic(req, res, p) {
  if (p === "/" || p === "/index.html") return serveFile(req, res, indexFor(req), "no-cache");
  let f = files.get(p);
  if (!f) {
    return sendHtml(res, 404, page("Pagina niet gevonden", `<main class="wrap leeg-pagina"><h1>Deze pagina bestaat niet</h1><p class="lead">Misschien is het adres verkeerd overgenomen.</p><p><a class="btn" href="/">Naar de voorpagina</a></p></main>`));
  }
  const versioned = /[?&]v=/.test(req.url);
  const cache = /\.(woff2|webp|png|jpg|svg|ico)$/.test(p) ? "public, max-age=2592000" : versioned ? "public, max-age=31536000, immutable" : "public, max-age=300";
  serveFile(req, res, f, cache);
}
const LOGO = '<span class="logo"><svg aria-hidden="true" class="logo-mark" viewBox="0 0 48 48"><path d="M11 41V22a13 13 0 0 1 26 0v19" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M6 41.5h36" stroke="currentColor" stroke-linecap="round" stroke-width="2.6"/><path d="M24 40V25" stroke="#a8742f" stroke-linecap="round" stroke-width="2.2"/><path d="M24 33c-6 0-8.5-3.6-8.5-8 5.4 0 8.5 3.2 8.5 8z" fill="#a8742f"/><path d="M24 28.5c5.2 0 7.8-3.2 7.8-7.2-5 0-7.8 2.9-7.8 7.2z" fill="#7d8f68"/></svg><span class="logo-txt"><b>VAN SONSBEEK</b><i>WEBSITES &amp; SLIMME SYSTEMEN</i></span></span>';
function page(title, body, opts = {}) {
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>${esc(title)}</title><link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/css/site.css?v=${VERSION}">${opts.beheer ? `<link rel="stylesheet" href="/css/beheer.css?v=${VERSION}">` : ""}</head>
<body${opts.beheer ? ' class="beheer"' : ""}><header class="top"><div class="wrap top-in"><a class="brand" href="/" aria-label="Van Sonsbeek, naar de voorpagina">${LOGO}</a>${opts.beheer ? '<span class="muted small">beheer</span>' : ""}${opts.right || ""}</div></header>
${body}</body></html>`;
}

/* ---------------- API: aanvraag ---------------- */
const clean = (v, n) => String(v ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, n);
function validContact(s) {
  const digits = s.replace(/\D/g, "");
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) || (/^[\d\s()+\-./]+$/.test(s) && digits.length >= 9 && digits.length <= 15);
}
async function apiAanvraag(req, res) {
  if (!sameOrigin(req)) return sendJson(res, 403, { message: "Dit verzoek komt niet van deze site." });
  const ip = clientIp(req);
  if (limited("aanvraag:" + ip, 5, 15 * 60e3)) return sendJson(res, 429, { message: "Je stuurde net al een paar berichten. Probeer het over een kwartier nog eens." });
  const b = await readJson(req, 16 * 1024);
  if (clean(b.fax, 60) || !(Number(b.t) >= 2500)) { log("Aanvraag tegengehouden door het spamfilter"); return sendJson(res, 200, { ok: true }); }
  const a = {
    naam: clean(b.naam, 80), zaak: clean(b.zaak, 80), contact: clean(b.contact, 120), bericht: clean(b.bericht, 2000),
    wensen: (Array.isArray(b.wensen) ? b.wensen : []).map((w) => clean(w, 40)).filter((w) => WENSEN.includes(w)),
    vak: VAKKEN.includes(b.vak) ? b.vak : null, voorbeeld: clean(b.voorbeeld, 40), check_url: clean(b.check_url, 300),
  };
  if (!a.naam) return sendJson(res, 400, { field: "naam", message: "Vul je naam in." });
  if (!validContact(a.contact)) return sendJson(res, 400, { field: "contact", message: "Vul een telefoonnummer of e-mailadres in waarop ik je kan bereiken." });
  const id = await saveAanvraag(a);
  log(`Nieuwe aanvraag #${id}`);
  notify(a, id, originOf(req)).catch((e) => log("Melding mislukt:", e.message));
  sendJson(res, 200, { ok: true });
}
async function notify(a, id, origin) {
  const title = "Nieuwe aanvraag: " + (a.zaak || a.naam);
  const lines = [`Naam: ${a.naam}`, a.zaak && `Zaak: ${a.zaak}`, `Contact: ${a.contact}`, a.wensen.length && `Wil: ${a.wensen.join(", ")}`,
    a.bericht && `Bericht: ${a.bericht}`, a.check_url && `Websitecheck: ${a.check_url}`, a.vak && `Voorbeeld bekeken: ${a.voorbeeld || "zonder naam"} (${a.vak})`].filter(Boolean);
  const text = lines.join("\n");
  const link = origin ? origin + "/beheer#a" + id : "";
  const jobs = [];
  if (process.env.NTFY_TOPIC) {
    const headers = { "Content-Type": "application/json" };
    if (process.env.NTFY_TOKEN) headers.Authorization = "Bearer " + process.env.NTFY_TOKEN;
    jobs.push(fetch((process.env.NTFY_SERVER || "https://ntfy.sh").replace(/\/+$/, ""), {
      method: "POST", headers, signal: AbortSignal.timeout(10000),
      body: JSON.stringify({ topic: process.env.NTFY_TOPIC.trim(), title, message: text, priority: 4, tags: ["incoming_envelope"], ...(link ? { click: link } : {}) }),
    }).then((r) => { if (!r.ok) throw new Error("ntfy gaf " + r.status); }));
  }
  if (process.env.RESEND_API_KEY && process.env.MAIL_TO) {
    jobs.push(fetch("https://api.resend.com/emails", {
      method: "POST", signal: AbortSignal.timeout(10000),
      headers: { Authorization: "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.MAIL_FROM || "Website <onboarding@resend.dev>", to: process.env.MAIL_TO.split(/[,;\s]+/).filter(Boolean),
        subject: title, text: text + (link ? "\n\nAlle aanvragen: " + link : ""), ...(a.contact.includes("@") ? { reply_to: a.contact } : {}) }),
    }).then(async (r) => { if (!r.ok) throw new Error("Resend gaf " + r.status + " " + (await r.text()).slice(0, 200)); }));
  }
  const out = await Promise.allSettled(jobs);
  out.forEach((o) => { if (o.status === "rejected") log("Melding mislukt:", o.reason.message); });
}

/* ---------------- API: websitecheck ---------------- */
const checkCache = new Map();
let checksBusy = 0;
async function apiCheck(req, res) {
  if (!sameOrigin(req)) return sendJson(res, 403, { message: "Dit verzoek komt niet van deze site." });
  const ip = clientIp(req);
  if (limited("check:" + ip, 12, 10 * 60e3) || limited("check:alle", 150, 10 * 60e3)) return sendJson(res, 429, { message: "Even rustig aan: probeer het over een paar minuten nog eens." });
  const b = await readJson(req, 4096);
  const input = clean(b.url, 300);
  const key = input.toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const hit = checkCache.get(key);
  if (hit && Date.now() - hit.t < 10 * 60e3) return sendJson(res, 200, hit.r);
  if (checksBusy >= 4) return sendJson(res, 503, { message: "Het is even druk. Probeer het over een minuutje nog eens." });
  checksBusy++;
  try {
    const r = await checkWebsite(input);
    if (checkCache.size > 300) checkCache.clear();
    checkCache.set(key, { t: Date.now(), r });
    saveCheck(r).catch((e) => log("Check opslaan mislukt:", e.message));
    log(`Websitecheck ${r.host}: ${r.score}`);
    sendJson(res, 200, r);
  } catch (e) {
    if (e instanceof CheckError) return sendJson(res, 422, { message: e.message, code: e.code });
    log("Websitecheck mislukt:", e.message);
    sendJson(res, 500, { message: "De check lukte niet. Probeer het zo nog eens." });
  } finally { checksBusy--; }
}

/* ---------------- /beheer ---------------- */
const fmtDatum = new Intl.DateTimeFormat("nl-NL", { timeZone: "Europe/Amsterdam", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
// namen van de vakken; de oude ids staan erbij voor aanvragen van voor november 2026
const VAK_LABEL = { schoenmaker: "Schoenmaker", stomerij: "Stomerij", bakkerij: "Bakkerij", ijzerwaren: "IJzerwaren", lijstenmaker: "Lijstenmaker", kleding: "Kledingwinkel", streek: "Streekproducten", anders: "Iets anders" };
function cookieOpts(req, maxAge) { return `Path=/beheer; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${isHttps(req) ? "; Secure" : ""}`; }
function contactLink(c) {
  if (c.includes("@")) return `<a href="mailto:${esc(c)}">${esc(c)}</a>`;
  const d = c.replace(/[^\d+]/g, ""); const intl = d.startsWith("0") ? "+31" + d.slice(1) : d;
  const wa = /^\+316\d{8}$/.test(intl) ? ` <a href="https://wa.me/${esc(intl.slice(1))}" target="_blank" rel="noopener">WhatsApp</a>` : "";
  return `<a href="tel:${esc(intl)}">${esc(c)}</a>${wa}`;
}
function loginPage(msg, disabled) {
  return page("Inloggen", `<main class="wrap login">
<form class="login-form" method="post" action="/beheer/login">
  <h1>Beheer</h1><p class="muted">Aanvragen en websitechecks.</p>
  ${msg ? `<p class="login-msg">${esc(msg)}</p>` : ""}
  <label class="field-label" for="wachtwoord">Wachtwoord</label>
  <input class="field" id="wachtwoord" name="wachtwoord" type="password" autocomplete="current-password" required ${disabled ? "disabled" : "autofocus"}>
  <button class="btn" type="submit" ${disabled ? "disabled" : ""}>Inloggen</button>
</form></main>`, { beheer: true });
}
async function beheer(req, res, url) {
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  const p = url.pathname.replace(/\/+$/, "") || "/beheer";
  const authed = validToken(cookies(req).vs_sessie);
  const ip = clientIp(req);

  if (p === "/beheer/login" && req.method === "POST") {
    if (!APP_PASSWORD) return sendHtml(res, 503, loginPage("Er is nog geen wachtwoord ingesteld. Zet APP_PASSWORD bij Variables in Railway.", true));
    if (limited("login:" + ip, 5, 15 * 60e3)) return sendHtml(res, 429, loginPage("Te veel pogingen. Probeer het over een kwartier opnieuw."));
    const f = await readForm(req, 2048);
    if (!passwordOk(f.wachtwoord)) { await sleep(400); return sendHtml(res, 401, loginPage("Dat wachtwoord klopt niet.")); }
    return redirect(res, "/beheer", { "Set-Cookie": `vs_sessie=${makeToken()}; ${cookieOpts(req, 12 * 3600)}` });
  }
  if (p === "/beheer/uitloggen" && req.method === "POST") return redirect(res, "/beheer", { "Set-Cookie": `vs_sessie=; ${cookieOpts(req, 0)}` });
  if (!authed) {
    if (!APP_PASSWORD) return sendHtml(res, 503, loginPage("Er is nog geen wachtwoord ingesteld. Zet APP_PASSWORD bij Variables in Railway.", true));
    return sendHtml(res, req.method === "GET" ? 200 : 401, loginPage(""));
  }
  if (p === "/beheer/status" && req.method === "POST") {
    if (!sameOrigin(req)) return sendHtml(res, 403, loginPage("Dit verzoek komt niet van deze site."));
    const f = await readForm(req, 8192);
    const id = Number(f.id);
    const status = STATUSSEN.some(([k]) => k === f.status) ? f.status : "nieuw";
    if (Number.isInteger(id) && id > 0) await updateStatus(id, status, clean(f.notitie, 500));
    return redirect(res, "/beheer#a" + id);
  }
  if (p === "/beheer/aanvragen.csv" && req.method === "GET") {
    const rows = await listAanvragen();
    const q = (v) => '"' + String(v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ") + '"';
    const head = ["Ontvangen", "Naam", "Zaak", "Contact", "Wil", "Bericht", "Voorbeeld", "Vak", "Websitecheck", "Status", "Notitie"];
    const lines = rows.map((r) => [fmtDatum.format(new Date(r.ontvangen)), r.naam, r.zaak, r.contact, (r.wensen || []).join(", "), r.bericht, r.voorbeeld, VAK_LABEL[r.vak] || "", r.check_url, (STATUSSEN.find(([k]) => k === r.status) || [, r.status])[1], r.notitie].map(q).join(";"));
    res.writeHead(200, { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="aanvragen.csv"', "Cache-Control": "no-store" });
    return res.end("﻿" + [head.map(q).join(";"), ...lines].join("\r\n"));
  }
  if (p !== "/beheer") return sendHtml(res, 404, loginPage("Deze pagina bestaat niet."));

  const [aanvragen, checks] = await Promise.all([listAanvragen(), listChecks()]);
  const nieuw = aanvragen.filter((a) => a.status === "nieuw").length;
  const items = aanvragen.map((a) => {
    const voorbeeld = a.vak ? `<a href="/voorbeelden?${new URLSearchParams({ vak: a.vak, zaak: a.voorbeeld || "" })}#voorbeeld" target="_blank" rel="noopener">${esc(a.voorbeeld || "zonder naam")} (${esc(VAK_LABEL[a.vak] || a.vak)})</a>` : "";
    return `<article class="bh-item${a.status === "nieuw" ? " is-nieuw" : ""}" id="a${a.id}">
  <div class="bh-kop"><h2>${esc(a.naam)}${a.zaak ? ` <span class="muted">van ${esc(a.zaak)}</span>` : ""}</h2><time>${esc(fmtDatum.format(new Date(a.ontvangen)))}</time></div>
  <dl class="bh-dl">
    <div><dt>Contact</dt><dd>${contactLink(a.contact)}</dd></div>
    ${(a.wensen || []).length ? `<div><dt>Wil</dt><dd>${esc(a.wensen.join(", "))}</dd></div>` : ""}
    ${a.bericht ? `<div><dt>Bericht</dt><dd>${esc(a.bericht)}</dd></div>` : ""}
    ${voorbeeld ? `<div><dt>Voorbeeld</dt><dd>${voorbeeld}</dd></div>` : ""}
    ${a.check_url ? `<div><dt>Websitecheck</dt><dd>${esc(a.check_url)}</dd></div>` : ""}
  </dl>
  <form class="bh-form" method="post" action="/beheer/status">
    <input type="hidden" name="id" value="${esc(a.id)}">
    <label><span class="sr">Status</span><select class="field" name="status">${STATUSSEN.map(([k, l]) => `<option value="${k}"${a.status === k ? " selected" : ""}>${l}</option>`).join("")}</select></label>
    <label class="bh-notitie"><span class="sr">Notitie</span><input class="field" name="notitie" maxlength="500" placeholder="Notitie" value="${esc(a.notitie || "")}"></label>
    <button class="btn btn--small" type="submit">Opslaan</button>
  </form>
</article>`;
  }).join("\n");
  const checkRows = checks.map((c) => `<tr><td>${esc(fmtDatum.format(new Date(c.gecheckt)))}</td><td><a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">${esc(c.host)}</a></td><td class="num">${esc(c.score)}</td><td>${esc(c.oordeel)}</td></tr>`).join("");
  const opslag = pool && dbReady ? "" : `<p class="bh-waarschuwing">Er is geen database gekoppeld: aanvragen verdwijnen bij een herstart. Zet DATABASE_URL in Railway.</p>`;
  const right = `<form class="bh-uit" method="post" action="/beheer/uitloggen"><button class="textlink" type="submit">Uitloggen</button></form>`;
  sendHtml(res, 200, page("Beheer: aanvragen", `<main class="wrap bh">
${opslag}
<div class="bh-titel"><h1>Aanvragen</h1><p class="muted">${aanvragen.length} in totaal, ${nieuw} nieuw. <a href="/beheer/aanvragen.csv">Download als CSV</a></p></div>
<div class="bh-lijst">${items || `<p class="muted">Nog geen aanvragen. Zodra iemand het formulier invult, staat het hier.</p>`}</div>
<h2 class="bh-h2">Websitechecks</h2>
${checks.length ? `<div class="bh-scroll"><table class="bh-table"><thead><tr><th>Wanneer</th><th>Site</th><th class="num">Score</th><th>Oordeel</th></tr></thead><tbody>${checkRows}</tbody></table></div>` : `<p class="muted">Nog geen checks gedaan.</p>`}
</main>`, { beheer: true, right }));
}

/* ---------------- Server ---------------- */
const server = http.createServer(async (req, res) => {
  try {
    secHeaders(req, res);
    const url = new URL(req.url, "http://localhost");
    const p = url.pathname;
    if (p === "/healthz") { res.writeHead(200, { "Content-Type": "text/plain", "Cache-Control": "no-store", "X-Instantie": INSTANTIE }); return res.end("ok"); }
    if (siteLive && (req.method === "GET" || req.method === "HEAD")) {
      // Wie via het railway.app-adres binnenkomt, gaat door naar het eigen adres (formulieren en /healthz niet).
      const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").toLowerCase();
      if (host !== SITE_HOST && host.endsWith(".up.railway.app")) {
        res.writeHead(301, { Location: SITE_URL + p + url.search, "Cache-Control": "public, max-age=86400" });
        return res.end();
      }
    }
    if (p === "/api/aanvraag") return req.method === "POST" ? await apiAanvraag(req, res) : sendJson(res, 405, { message: "Gebruik POST." });
    if (p === "/api/check") return req.method === "POST" ? await apiCheck(req, res) : sendJson(res, 405, { message: "Gebruik POST." });
    if (p === "/beheer" || p.startsWith("/beheer/")) return await beheer(req, res, url);
    if (req.method !== "GET" && req.method !== "HEAD") { res.writeHead(405, { Allow: "GET, HEAD" }); return res.end(); }
    if (p === "/voorbeelden" || p === "/voorbeelden/") return serveVoorbeelden(req, res, url);
    // oude links naar een voorbeeld op de voorpagina (/?vak=…&zaak=…#voorbeeld) staan nu op /voorbeelden
    if (p === "/" && url.searchParams.has("vak")) {
      res.writeHead(301, { Location: "/voorbeelden" + url.search, "Cache-Control": "public, max-age=86400" });
      return res.end();
    }
    if (p === "/voor" || p.startsWith("/voor/")) return serveBranche(req, res, p);
    if (p === "/sitemap.xml") return sitemap(req, res);
    if (p === "/robots.txt") return robots(req, res);
    return serveStatic(req, res, p);
  } catch (e) {
    const status = e.status || 500;
    if (status === 500) log("Fout:", e.stack || e.message);
    if (!res.headersSent) sendJson(res, status, { message: status === 413 ? "Dat bericht is te lang." : status === 400 ? "Dat verzoek kon ik niet lezen." : "Er ging iets mis aan mijn kant. Probeer het nog eens." });
    else res.end();
  }
});

(async () => {
  loadStatic();
  await migrate();
  await initSession().catch((e) => { log("Sessiesleutel uit database mislukt, tijdelijke sleutel gebruikt:", e.message); sessionKey = crypto.randomBytes(32); });
  if (!APP_PASSWORD) log("APP_PASSWORD niet ingesteld: /beheer blijft dicht.");
  if (!process.env.NTFY_TOPIC && !process.env.RESEND_API_KEY) log("Geen NTFY_TOPIC of RESEND_API_KEY: nieuwe aanvragen zie je alleen in /beheer.");
  server.listen(PORT, () => { log(`Site luistert op poort ${PORT} (versie ${VERSION})`); startDomeinCheck(); });
})();
process.on("SIGTERM", () => { server.close(() => process.exit(0)); setTimeout(() => process.exit(0), 5000).unref(); });

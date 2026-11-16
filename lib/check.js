"use strict";
/*
 * Websitecheck: haalt één pagina op en beoordeelt die op veiligheid, telefoon, vindbaarheid,
 * snelheid, actualiteit en contact. Alleen http(s) op poort 80/443, nooit naar interne adressen
 * (elk opgezocht IP-adres wordt gecontroleerd vlak voor het verbinden), maximaal 5 doorverwijzingen,
 * 1,5 MB en 9 seconden.
 */
const http = require("node:http");
const https = require("node:https");
const dns = require("node:dns");
const net = require("node:net");
const zlib = require("node:zlib");

const MAX_BYTES = 1.5 * 1024 * 1024;
const MAX_REDIRECTS = 5;
const TOTAL_MS = 9000;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36 Websitecheck/1.0";
const ALLOW_PRIVATE = process.env.CHECK_ALLOW_PRIVATE === "1"; // alleen voor lokale tests

class CheckError extends Error {
  constructor(message, code) { super(message); this.code = code || "CHECK"; this.expose = true; }
}

/* ---------- Adressen die we nooit benaderen ---------- */
function v4Blocked(ip) {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a, b, c] = p;
  return a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
    (a === 192 && b === 0 && (c === 0 || c === 2)) || (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) || (a === 203 && b === 0 && c === 113);
}
function isBlocked(ip) {
  if (ALLOW_PRIVATE) return false;
  if (net.isIPv4(ip)) return v4Blocked(ip);
  if (!net.isIPv6(ip)) return true;
  const s = ip.toLowerCase().replace(/%.*$/, "");
  if (s === "::" || s === "::1") return true;
  let m = s.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (m) return v4Blocked(m[1]);
  m = s.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (m) {
    const hi = parseInt(m[1], 16), lo = parseInt(m[2], 16);
    return v4Blocked([hi >> 8, hi & 255, lo >> 8, lo & 255].join("."));
  }
  if (s.startsWith("::") || s.startsWith("64:ff9b") || s.startsWith("2001:db8") || s.startsWith("2002:")) return true;
  const first = parseInt(s.split(":")[0] || "0", 16);
  if ((first & 0xfe00) === 0xfc00) return true; // fc00::/7 (ook Railway intern)
  if ((first & 0xffc0) === 0xfe80) return true; // fe80::/10
  if ((first & 0xff00) === 0xff00) return true; // multicast
  return false;
}
function safeLookup(hostname, options, cb) {
  if (typeof options === "function") { cb = options; options = {}; }
  dns.lookup(hostname, { all: true, verbatim: true }, (err, addrs) => {
    if (err) return cb(err);
    if (!addrs.length || addrs.some((a) => isBlocked(a.address))) {
      const e = new Error("Adres niet toegestaan"); e.code = "EBLOCKED"; return cb(e);
    }
    if (options && options.all) return cb(null, addrs);
    cb(null, addrs[0].address, addrs[0].family);
  });
}

/* ---------- Ophalen ---------- */
function requestOnce(u, deadline, opts = {}) {
  return new Promise((resolve, reject) => {
    const left = deadline - Date.now();
    if (left <= 0) return reject(Object.assign(new Error("timeout"), { code: "ETIMEDOUT" }));
    // Bij een IP-adres in de URL slaat Node de lookup over; controleer het daarom hier zelf.
    const bare = u.hostname.replace(/^\[|\]$/g, "");
    if (net.isIP(bare) && isBlocked(bare)) return reject(Object.assign(new Error("Adres niet toegestaan"), { code: "EBLOCKED" }));
    const mod = u.protocol === "https:" ? https : http;
    const t0 = Date.now();
    let ttfb = 0, done = false;
    const req = mod.request({
      protocol: u.protocol, hostname: u.hostname.replace(/^\[|\]$/g, ""), port: u.port || (u.protocol === "https:" ? 443 : 80),
      path: (u.pathname || "/") + (u.search || ""), method: "GET", lookup: safeLookup, agent: false,
      rejectUnauthorized: !opts.insecure, // alleen na een certificaatfout, om de inhoud toch te kunnen beoordelen
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5", "Accept-Language": "nl-NL,nl;q=0.9,en;q=0.6", "Accept-Encoding": "gzip, deflate, br" },
    }, (res) => {
      ttfb = Date.now() - t0;
      if (opts.headOnly || (res.statusCode >= 300 && res.statusCode < 400)) {
        res.resume(); done = true; clearTimeout(timer);
        return resolve({ status: res.statusCode, headers: res.headers, body: "", ttfb, ms: Date.now() - t0, bytes: 0 });
      }
      const enc = String(res.headers["content-encoding"] || "").toLowerCase();
      let stream = res;
      if (enc.includes("br")) stream = res.pipe(zlib.createBrotliDecompress());
      else if (enc.includes("gzip")) stream = res.pipe(zlib.createGunzip());
      else if (enc.includes("deflate")) stream = res.pipe(zlib.createInflate());
      const chunks = []; let size = 0, raw = 0, truncated = false;
      res.on("data", (c) => { raw += c.length; });
      stream.on("data", (c) => {
        if (truncated) return;
        size += c.length; chunks.push(c);
        if (size > MAX_BYTES) { truncated = true; finish(); req.destroy(); }
      });
      stream.on("end", finish);
      stream.on("error", (e) => { if (!done) { done = true; clearTimeout(timer); reject(e); } });
      function finish() {
        if (done) return; done = true; clearTimeout(timer);
        resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString("utf8"), ttfb, ms: Date.now() - t0, bytes: raw || size, truncated });
      }
    });
    const timer = setTimeout(() => { req.destroy(Object.assign(new Error("timeout"), { code: "ETIMEDOUT" })); }, Math.min(left, TOTAL_MS));
    req.on("error", (e) => { if (!done) { done = true; clearTimeout(timer); reject(e); } });
    req.end();
  });
}

function validUrl(u) {
  if (!/^https?:$/.test(u.protocol)) throw new CheckError("Alleen adressen die met http of https beginnen kan ik checken.", "PROTO");
  if (u.username || u.password) throw new CheckError("Haal de inloggegevens uit het adres.", "CREDS");
  if (u.port && !["80", "443"].includes(u.port)) throw new CheckError("Dit adres gebruikt een ongebruikelijke poort; dat check ik niet.", "PORT");
  const h = u.hostname;
  const bare = h.replace(/^\[|\]$/g, "");
  if (!h || (!h.includes(".") && !net.isIP(bare))) throw new CheckError("Dat lijkt geen volledig webadres. Probeer het als jouwzaak.nl.", "HOST");
  if (net.isIP(bare) && isBlocked(bare)) throw new CheckError("Dit adres is niet openbaar bereikbaar.", "PRIVATE");
  if (/\.(local|internal|localhost|lan|home|corp)$/i.test(h) || /^localhost$/i.test(h)) {
    if (!ALLOW_PRIVATE) throw new CheckError("Dit adres is niet openbaar bereikbaar.", "PRIVATE");
  }
}

async function fetchFollow(start, deadline, opts = {}) {
  let u = start; const chain = [];
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    validUrl(u);
    const r = await requestOnce(u, deadline, opts);
    chain.push({ url: u.href, status: r.status });
    if (r.status >= 300 && r.status < 400 && r.headers.location) {
      let next;
      try { next = new URL(r.headers.location, u); } catch { throw new CheckError("De site verwijst door naar een ongeldig adres.", "REDIR"); }
      u = next; continue;
    }
    return { ...r, url: u, chain };
  }
  throw new CheckError("De site blijft doorverwijzen. Klopt het adres?", "REDIRS");
}

const TLS_CODES = new Set(["CERT_HAS_EXPIRED", "DEPTH_ZERO_SELF_SIGNED_CERT", "SELF_SIGNED_CERT_IN_CHAIN", "ERR_TLS_CERT_ALTNAME_INVALID",
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE", "UNABLE_TO_GET_ISSUER_CERT_LOCALLY", "CERT_NOT_YET_VALID", "ERR_SSL_WRONG_VERSION_NUMBER", "EPROTO"]);

function friendlyNetError(e) {
  if (e instanceof CheckError) return e;
  if (e.code === "EBLOCKED") return new CheckError("Dit adres is niet openbaar bereikbaar.", "PRIVATE");
  if (e.code === "ENOTFOUND" || e.code === "EAI_AGAIN") return new CheckError("Dit adres bestaat niet of is niet te vinden. Klopt de spelling?", "DNS");
  if (e.code === "ETIMEDOUT" || e.code === "ESOCKETTIMEDOUT") return new CheckError("De site reageerde niet binnen 9 seconden.", "TIMEOUT");
  if (e.code === "ECONNREFUSED" || e.code === "ECONNRESET" || e.code === "EHOSTUNREACH") return new CheckError("De site is nu niet bereikbaar.", "CONN");
  return new CheckError("Ophalen lukte niet. Probeer het zo nog eens.", "FETCH");
}

function normalizeInput(raw) {
  let s = String(raw || "").trim();
  if (!s) throw new CheckError("Vul het adres van je website in, bijvoorbeeld jouwzaak.nl.", "EMPTY");
  if (s.length > 300) throw new CheckError("Dat adres is te lang.", "LONG");
  const explicit = /^https?:\/\//i.test(s);
  if (!explicit) s = "https://" + s.replace(/^\/+/, "");
  let u;
  try { u = new URL(s); } catch { throw new CheckError("Dat lijkt geen geldig webadres. Probeer het als jouwzaak.nl.", "PARSE"); }
  u.hash = "";
  return { url: u, explicit };
}

/* ---------- Beoordelen ---------- */
function strip(html) { return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " "); }
function textOf(html) { return strip(html).replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&copy;/gi, "©").replace(/\s+/g, " "); }
function metaContent(html, attr, val) {
  const re = new RegExp("<meta\\b[^>]*\\b" + attr + "\\s*=\\s*[\"']?" + val + "[\"']?[^>]*>", "i");
  const tag = (html.match(re) || [])[0];
  if (!tag) return null;
  const c = tag.match(/\bcontent\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
  return c ? (c[2] ?? c[3] ?? c[4] ?? "").trim() : "";
}
function decodeEntities(s) {
  return s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}
const ST = { goed: 1, let: 0.5, slecht: 0 };

function analyse(page, extra) {
  const html = page.body || "";
  const low = html.toLowerCase();
  const text = textOf(html);
  const now = new Date().getFullYear();
  const G = { veilig: [], telefoon: [], vindbaar: [], snel: [], actueel: [], contact: [] };
  const add = (g, status, label, uitleg, gewicht) => G[g].push({ status, label, uitleg: uitleg || "", gewicht: gewicht || 1 });

  // Veiligheid
  const httpsOk = page.url.protocol === "https:" && !extra.tlsError;
  if (extra.tlsError) add("veilig", "slecht", "Het beveiligingscertificaat klopt niet", "Bezoekers krijgen een waarschuwing van hun browser voordat ze je site zien.", 3);
  else if (httpsOk) add("veilig", "goed", "Beveiligde verbinding (https)", "", 3);
  else add("veilig", "slecht", "Geen beveiligde verbinding", "Browsers zetten 'Niet veilig' naast je adres.", 3);
  if (extra.httpRedirect === true) add("veilig", "goed", "Wie http typt, komt vanzelf op de veilige versie", "", 1);
  else if (extra.httpRedirect === false && httpsOk) add("veilig", "let", "De onveilige versie blijft ook bereikbaar", "Wie http:// typt, komt niet automatisch op de beveiligde site.", 1);

  // Telefoon
  const vp = metaContent(html, "name", "viewport");
  if (vp && /width\s*=\s*device-width/i.test(vp)) add("telefoon", "goed", "Past zich aan op een telefoon", "", 3);
  else add("telefoon", "slecht", "Niet gemaakt voor telefoons", "Op een telefoon moet je inzoomen om iets te lezen. De meeste bezoekers komen juist via hun telefoon.", 3);
  if (/\.swf\b|application\/x-shockwave-flash/i.test(html)) add("telefoon", "slecht", "Gebruikt Flash", "Geen enkele browser toont Flash nog; dat deel van je site is leeg.", 2);
  if (/<frameset\b|<frame\b/i.test(html)) add("telefoon", "slecht", "Opgebouwd uit frames", "Frames werken slecht op telefoons en in Google.", 2);

  // Vindbaar
  const title = decodeEntities(((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").replace(/\s+/g, " ").trim());
  if (!title) add("vindbaar", "slecht", "Geen titel voor Google", "Google laat dan zelf iets zien boven je zoekresultaat.", 1.5);
  else if (title.length < 10 || title.length > 70) add("vindbaar", "let", "Titel is " + (title.length < 10 ? "erg kort" : "te lang") + ": “" + title.slice(0, 60) + (title.length > 60 ? "…" : "") + "”", "Een goede titel noemt je zaak, je vak en je plaats.", 1.5);
  else add("vindbaar", "goed", "Titel: “" + title + "”", "", 1.5);
  const desc = metaContent(html, "name", "description");
  if (!desc) add("vindbaar", "slecht", "Geen omschrijving voor Google", "Google kiest dan zelf een stukje tekst onder je naam.", 1);
  else if (desc.length < 50 || desc.length > 170) add("vindbaar", "let", "Omschrijving is " + (desc.length < 50 ? "kort" : "lang"), "Twee zinnen over wat je doet en waar, werkt het best.", 1);
  else add("vindbaar", "goed", "Heeft een omschrijving voor Google", "", 1);
  if (/<h1\b/i.test(html)) add("vindbaar", "goed", "Heeft een duidelijke hoofdkop", "", 0.5);
  else add("vindbaar", "let", "Geen hoofdkop op de pagina", "Google gebruikt de hoofdkop om te snappen waar de pagina over gaat.", 0.5);
  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  const noAlt = imgs.filter((t) => !/\balt\s*=\s*("[^"]+"|'[^']+'|[^\s>"']+)/i.test(t)).length;
  if (imgs.length >= 3) {
    if (noAlt / imgs.length > 0.5) add("vindbaar", "let", noAlt + " van de " + imgs.length + " foto's hebben geen omschrijving", "Google en mensen met een voorleesfunctie weten dan niet wat erop staat.", 0.5);
    else add("vindbaar", "goed", "Foto's hebben een omschrijving", "", 0.5);
  }
  if (/application\/ld\+json/i.test(html) && /localbusiness|store|restaurant|bakery|hairsalon|beautysalon|organization|professionalservice/i.test(html)) add("vindbaar", "goed", "Bedrijfsgegevens voor Google staan erin", "", 0.5);
  else add("vindbaar", "let", "Geen bedrijfsgegevens voor Google", "Met een paar regels code toont Google je adres en openingstijden direct in de zoekresultaten.", 0.5);
  if (metaContent(html, "property", "og:image")) add("vindbaar", "goed", "Toont een plaatje als je de link deelt", "", 0.5);
  else add("vindbaar", "let", "Geen plaatje bij delen", "Deelt iemand je site via WhatsApp, dan verschijnt er geen foto.", 0.5);

  // Snelheid
  const sec = page.ms < 950 ? "binnen 1 seconde" : (page.ms / 1000).toLocaleString("nl-NL", { maximumFractionDigits: 1 }) + " s";
  if (page.ms < 1500) add("snel", "goed", "Laadt snel (" + sec + ")", "", 1.5);
  else if (page.ms < 3500) add("snel", "let", "Laadt wat traag (" + sec + ")", "Na drie seconden haken veel bezoekers af.", 1.5);
  else add("snel", "slecht", "Laadt traag (" + sec + ")", "Na drie seconden haken veel bezoekers af.", 1.5);
  const kb = Math.round((page.bytes || html.length) / 1024);
  if (kb > 600) add("snel", "let", "Zware pagina (" + kb + " kB tekst en code)", "Vooral op mobiel internet merk je dat.", 1);
  const enc = String(page.headers["content-encoding"] || "");
  if (!enc && html.length > 20000) add("snel", "let", "Pagina wordt niet ingepakt verstuurd", "Ingepakt is hij vaak drie keer kleiner en dus sneller.", 0.5);
  const scripts = (html.match(/<script\b[^>]*\bsrc=/gi) || []).length;
  if (scripts > 25) add("snel", "let", scripts + " losse scripts", "Elk script is een extra download voordat je site klaar is.", 0.5);

  // Actueel
  let jaar = 0;
  const copyRe = /(?:©|\(c\)|copyright)[^0-9]{0,40}((?:19|20)\d{2})(?:\s*[-–—\/]\s*((?:19|20)\d{2}))?/gi;
  let m; while ((m = copyRe.exec(text))) { jaar = Math.max(jaar, Number(m[2] || m[1])); }
  if (jaar && jaar <= now) {
    if (jaar <= now - 2) add("actueel", "slecht", "In de voettekst staat © " + jaar, "Bezoekers denken dan dat de site niet meer wordt bijgehouden.", 1);
    else add("actueel", "goed", "Jaartal in de voettekst is actueel (" + jaar + ")", "", 1);
  }
  if (/\b19\s?%\s*(?:btw|b\.t\.w\.)|(?:btw|b\.t\.w\.)[^.%]{0,20}\b19\s?%/i.test(text)) add("actueel", "slecht", "Er staat nog 19% btw op", "Dat tarief is al sinds oktober 2012 21%.", 1.5);
  const gen = metaContent(html, "name", "generator") || "";
  let gm;
  if (/frontpage|golive|dreamweaver|netobjects|web\s*builder 1/i.test(gen) || /<!--\s*InstanceBegin template|Microsoft FrontPage/i.test(html)) add("actueel", "slecht", "Gemaakt met een programma van rond 2005", gen ? "Volgens de pagina zelf: " + gen.slice(0, 60) + "." : "", 1);
  else if ((gm = gen.match(/wordpress\s+(\d+)\.(\d+)/i)) && Number(gm[1]) < 6) add("actueel", "let", "Draait op een oude WordPress (" + gm[1] + "." + gm[2] + ")", "Oude versies krijgen geen beveiligingsupdates meer.", 1);
  else if ((gm = gen.match(/joomla!?\s*(\d+)\.(\d+)/i)) && Number(gm[1]) < 4) add("actueel", "let", "Draait op een oude Joomla (" + gm[1] + "." + gm[2] + ")", "Oude versies krijgen geen beveiligingsupdates meer.", 1);
  const jq = low.match(/jquery[.-]?(1\.\d+)(?:\.\d+)?(?:\.min)?\.js/);
  if (jq) add("actueel", "let", "Gebruikt verouderde onderdelen (jQuery " + jq[1] + ")", "Oude onderdelen werken steeds slechter samen met nieuwe browsers.", 0.5);
  const oud = (html.match(/<(font|center|marquee|blink)\b/gi) || []).length;
  const tabellen = (html.match(/<table\b[^>]*\b(width|bgcolor|cellpadding|background)\s*=/gi) || []).length;
  if (oud > 0 || tabellen >= 2) add("actueel", "slecht", "Opgemaakt op de manier van vroeger", oud ? "Er staan codes in als <" + ((html.match(/<(font|center|marquee|blink)\b/i) || [])[1] || "font").toLowerCase() + ">, die al lang niet meer gebruikt worden." : "De pagina is opgebouwd met tabellen; daardoor past hij zich niet aan op een telefoon.", 1);
  const htm = (html.match(/href\s*=\s*["'][^"'#?]+\.html?["']/gi) || []).length;
  if (htm >= 3) add("actueel", "let", "Losse .htm-pagina's", "Zo werden sites rond 2005 gebouwd.", 0.5);
  if ((text.match(/klik hier/gi) || []).length >= 2) add("actueel", "let", "Links met ‘klik hier’", "Bezoekers en Google zien niet waar zo'n link heen gaat.", 0.5);
  if (!G.actueel.length) add("actueel", "goed", "Geen tekenen van een verouderde site gevonden", "", 1);

  // Contact
  if (/href\s*=\s*["']tel:/i.test(html)) add("contact", "goed", "Bellen met één tik", "", 1.5);
  else add("contact", "slecht", "Niet te bellen met één tik", "Op een telefoon moeten bezoekers je nummer overtypen.", 1.5);
  if (/href\s*=\s*["']mailto:/i.test(html) || /<form\b/i.test(html)) add("contact", "goed", "Mailen of een formulier invullen kan", "", 1);
  else add("contact", "let", "Geen mailknop of formulier op de voorpagina", "", 1);
  if (/wa\.me\/|api\.whatsapp\.com|whatsapp:\/\//i.test(html)) add("contact", "goed", "Je bent te appen via WhatsApp", "", 0.5);
  if (/openingstijden|openingsuren|geopend|opening hours/i.test(text)) add("contact", "goed", "Openingstijden staan erop", "", 1);
  else add("contact", "let", "Geen openingstijden op de voorpagina", "Dat is vaak het eerste wat mensen zoeken.", 1);
  if (/\b[1-9]\d{3}\s?(?!SA|SD|SS)[A-Z]{2}\b/.test(text)) add("contact", "goed", "Adres staat erop", "", 0.5);
  else add("contact", "let", "Geen adres gevonden", "", 0.5);

  const titels = { veilig: "Veiligheid", telefoon: "Op de telefoon", vindbaar: "Vindbaar in Google", snel: "Snelheid", actueel: "Actueel", contact: "Contact" };
  let som = 0, max = 0;
  const groepen = Object.keys(G).map((k) => {
    G[k].forEach((i) => { som += (ST[i.status] ?? 0) * i.gewicht; max += i.gewicht; });
    return { id: k, titel: titels[k], items: G[k].map(({ status, label, uitleg }) => ({ status, label, uitleg })) };
  });
  let score = max ? Math.round((som / max) * 100) : 0;
  // Zonder https of zonder telefoonweergave kan een site niet 'goed op orde' zijn.
  if (!httpsOk) score = Math.min(score, 74);
  if (!(vp && /width\s*=\s*device-width/i.test(vp))) score = Math.min(score, 54);
  const oordeel = score >= 80 ? "Je site staat er goed voor." : score >= 55 ? "Je site werkt, maar er valt winst te halen." : "Je site is toe aan een opknapbeurt.";
  return { score, oordeel, titel: title || null, groepen };
}

/* ---------- Hoofdfunctie ---------- */
async function checkWebsite(input) {
  const { url, explicit } = normalizeInput(input);
  validUrl(url);
  const deadline = Date.now() + TOTAL_MS;
  let page, tlsError = null;
  try {
    page = await fetchFollow(url, deadline);
  } catch (e) {
    if (e instanceof CheckError) throw e;
    const tls = TLS_CODES.has(e.code) || /certificate|ssl|tls/i.test(e.message || "");
    if (tls) {
      tlsError = e.code || "TLS";
      try { page = await fetchFollow(url, deadline, { insecure: true }); } catch (e2) { throw friendlyNetError(e2); }
    } else if (url.protocol === "https:" && !explicit && ["ECONNREFUSED", "ECONNRESET", "EHOSTUNREACH"].includes(e.code)) {
      const alt = new URL(url.href); alt.protocol = "http:";
      try { page = await fetchFollow(alt, deadline); } catch (e2) { throw friendlyNetError(e2); }
    } else throw friendlyNetError(e);
  }
  if (page.status === 401 || page.status === 403 || page.status === 429) throw new CheckError("Deze site laat geen automatische checks toe (" + page.status + "). Op je eigen telefoon kun je hem wel gewoon bekijken.", "BLOCKED_BY_SITE");
  if (page.status >= 400) throw new CheckError("De site geeft een foutmelding (" + page.status + "). Bezoekers zien dan ook een foutpagina.", "HTTP_" + page.status);
  const type = String(page.headers["content-type"] || "");
  if (type && !/html|xml|text\/plain/i.test(type)) throw new CheckError("Op dit adres staat geen webpagina maar een bestand.", "TYPE");
  if (!page.body || page.body.length < 40) throw new CheckError("De pagina is leeg. Klopt het adres?", "EMPTY_PAGE");

  // Komt wie http typt automatisch op https?
  let httpRedirect = null;
  if (page.url.protocol === "https:" && !tlsError) {
    try {
      const plain = new URL(page.url.origin.replace(/^https:/, "http:") + "/");
      const r = await requestOnce(plain, Math.min(deadline, Date.now() + 3500), { headOnly: true });
      const loc = r.headers.location ? new URL(r.headers.location, plain) : null;
      httpRedirect = !!(r.status >= 300 && r.status < 400 && loc && loc.protocol === "https:");
    } catch { httpRedirect = null; }
  }
  const res = analyse(page, { tlsError, httpRedirect });
  return { url: page.url.href, host: page.url.hostname.replace(/^www\./, ""), ms: page.ms, ...res };
}

module.exports = { checkWebsite, CheckError, isBlocked, analyse };

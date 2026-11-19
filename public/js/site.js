/* Floris van Sonsbeek: voorbeeldsites, dashboard-demo, websitecheck, schermen, contactformulier en de kopbalk.
   Draait op de voorpagina en op /voorbeelden. Elk onderdeel start alleen als het op de pagina staat. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var eurFmt = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" });
  function euro(n) { return eurFmt.format(n); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function tijd(h) { var u = Math.floor(h), m = Math.round((h - u) * 60); return u + "." + (m < 10 ? "0" : "") + m; }
  var modusMeta = document.querySelector('meta[name="vs-modus"]');
  var voorvertoning = !!modusMeta && modusMeta.getAttribute("content") === "voorbeeld";
  var T = function (k, v) { return window.T ? window.T(k, v) : k; };
  var DAGEN = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];
  var PL = window.PLANNEN || [], V = window.VAKKEN || {}, HANDIG = window.HANDIG || [];
  var VAK_IDS = PL.map(function (p) { return p.id; }).filter(function (id) { return V[id]; });
  function plan(id) { return PL.filter(function (p) { return p.id === id; })[0]; }
  function taal() { return window.TAAL ? window.TAAL() : "nl"; }
  function tt(o) { if (o == null) return ""; if (typeof o === "string") return o; return o[taal()] || o.nl; }
  function hoofdletter(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function bewaar(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* geen opslag */ } }
  function lees(k) { try { var v = sessionStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }

  /* Oude adressen: de voorbeeldsite, de demo en de check staan nu op /voorbeelden */
  function naarVoorbeelden() {
    if (document.body.getAttribute("data-pagina") !== "thuis" || !/^#(voorbeeld|dashboard|check)$/.test(location.hash)) return false;
    location.replace("/voorbeelden" + location.search + location.hash);
    return true;
  }
  if (naarVoorbeelden()) return;
  window.addEventListener("hashchange", naarVoorbeelden);

  /* ---------------- Iconen per vak ---------------- */
  var I = {
    boerderij: '<path d="M16 54h88l-12 42H28z"/><path d="M40 54 54 28M80 54 66 28M32 70h56M36 84h48"/>',
    installateur: '<path d="M60 16C47 36 34 50 34 68a26 26 0 0 0 52 0c0-18-13-32-26-52z"/><path d="M48 72a12 12 0 0 0 12 12"/>',
    schilder: '<rect x="18" y="22" width="66" height="24" rx="5"/><path d="M84 34h14v24H60v16"/><rect x="53" y="74" width="14" height="30" rx="4"/>',
    aannemer: '<path d="M18 60 60 24l42 36"/><path d="M28 52v46h64V52"/><path d="M50 98V74h20v24"/>',
    "dak-tuin": '<path d="M14 58 60 22l46 36"/><path d="M60 100V66"/><path d="M60 82c-14 0-22-8-22-20 14 0 22 8 22 20z"/><path d="M60 74c0-12 8-20 22-20 0 12-8 20-22 20z"/>',
    kapper: '<circle cx="36" cy="92" r="11"/><circle cx="76" cy="92" r="11"/><path d="M43 84 80 18M69 84 32 18"/><circle cx="56" cy="61" r="2.5" fill="currentColor"/>',
    garage: '<path d="M14 76V64l12-4 12-18h40l16 18h12v16"/><path d="M14 76h10M46 76h28M96 76h10"/><circle cx="35" cy="78" r="10"/><circle cx="85" cy="78" r="10"/>',
    fysio: '<circle cx="60" cy="22" r="9"/><path d="M60 34v34M60 44 34 30M60 44l26-14M60 68l-16 32M60 68l16 32"/>',
    schoonmaak: '<path d="M44 46h28l8 14v38a6 6 0 0 1-6 6H42a6 6 0 0 1-6-6V60z"/><path d="M50 46V30h22l14 8"/><path d="M92 30v2M98 25v2M98 35v2"/>',
    tandarts: '<path d="M38 20c-13 0-20 11-18 26 2 13 7 20 9 32 2 13 5 22 11 22s7-15 20-15 14 15 20 15 9-9 11-22c2-12 7-19 9-32 2-15-5-26-18-26-9 0-14 4-22 4s-13-4-22-4z"/>',
    accountant: '<rect x="30" y="16" width="60" height="88" rx="7"/><rect x="40" y="26" width="40" height="18" rx="2"/><path d="M42 60h6M57 60h6M72 60h6M42 74h6M57 74h6M72 74h6M42 88h6M57 88h6M72 88h6"/>'
  };
  function icon(id, cls) {
    return '<svg class="' + (cls || "") + '" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (I[id] || "") + "</svg>";
  }
  var KAART = '<svg viewBox="0 0 320 150" aria-hidden="true"><rect width="320" height="150" fill="#e8edf1"/>' +
    '<path d="M0 34h320M0 112h320M78 0v150M214 0v150M140 0l26 150" stroke="#fff" stroke-width="7"/>' +
    '<path d="M-10 58C60 78 96 30 158 62s104 56 172 34" stroke="#a9c6d9" stroke-width="16" fill="none"/>' +
    '<g transform="translate(166 70)"><path class="pin" d="M0-30C-13-30-20-20-20-11-20 3 0 20 0 20S20 3 20-11C20-20 13-30 0-30Z"/><circle cy="-11" r="7" fill="#fff"/></g></svg>';
  var UIT = '<svg class="uit" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3h7v7M13 3 4 12"/></svg>';

  /* ---------------- Voorbeeldsite (Nederlands, net als de zaak zelf) ---------------- */
  function openInfo(uren) {
    var nu = new Date(), d = (nu.getDay() + 6) % 7, h = nu.getHours() + nu.getMinutes() / 60, slot = uren[d];
    if (slot && h >= slot[0] && h < slot[1]) return { open: true, tekst: "Nu open tot " + tijd(slot[1]) };
    if (slot && h < slot[0]) return { open: false, tekst: "Vandaag open om " + tijd(slot[0]) };
    for (var i = 1; i <= 7; i++) {
      var s = uren[(d + i) % 7];
      if (s) return { open: false, tekst: (i === 1 ? "Morgen" : DAGEN[(d + i) % 7]) + " open om " + tijd(s[0]) };
    }
    return { open: false, tekst: "Gesloten" };
  }
  function prijsTekst(p) {
    if (typeof p[1] === "string") return p[1];
    if (p[2] === "gratis") return "gratis";
    return (p[2] ? p[2] + " " : "") + euro(p[1]);
  }
  function signSize(naam, breed) {
    var n = naam.length;
    if (breed) return n > 30 ? 24 : n > 22 ? 27 : 30;
    return n > 28 ? 16 : n > 20 ? 18 : 21;
  }
  function mockHtml(id, naam, swing) {
    var s = V[id].site, info = openInfo(s.uren), vandaag = (new Date().getDay() + 6) % 7;
    var prijzen = s.prijzen.map(function (p) {
      return "<li><span>" + esc(p[0]) + '</span><span class="lead-dots"></span><span class="price">' + esc(prijsTekst(p)) + "</span></li>";
    }).join("");
    var metBedrag = s.prijzen.some(function (p) { return typeof p[1] === "number" && p[1] > 0; });
    var uren = s.uren.map(function (u, i) {
      var cls = (i === vandaag ? "is-today" : "") + (u ? "" : " is-dicht");
      return '<li class="' + cls.trim() + '"><span>' + DAGEN[i] + '</span><span class="lead-dots"></span><span class="price">' + (u ? tijd(u[0]) + "–" + tijd(u[1]) : "gesloten") + "</span></li>";
    }).join("");
    return '<header class="ms-top"><span class="ms-sign' + (swing && !reduce ? " swing" : "") + '"><span class="ms-sign-name">' + esc(naam) + "</span></span>" +
      '<nav class="ms-nav" aria-hidden="true"><span>' + esc(s.prijsKop) + "</span><span>Openingstijden</span><span>Route</span><span>Contact</span></nav>" +
      '<span class="ms-open' + (info.open ? "" : " is-dicht") + '"><i></i>' + esc(info.tekst) + "</span></header>" +
      (s.luifel ? '<div class="ms-luifel" aria-hidden="true"></div>' : '<div class="ms-streep" aria-hidden="true"></div>') +
      '<section class="ms-hero"><div class="ms-art">' + icon(id) + "</div><div>" +
      '<p class="ms-tag">' + esc(s.tag) + '</p><div class="ms-ctas"><span class="ms-btn">' + esc(s.knoppen[0]) + '</span><span class="ms-btn ms-btn--ghost">' + esc(s.knoppen[1]) + "</span></div></div></section>" +
      '<div class="ms-info">' +
      '<section class="ms-sec"><h3>' + esc(s.prijsKop) + '</h3><ul class="ms-list">' + prijzen + "</ul>" + (metBedrag ? '<p class="ms-fine">Voorbeeldprijzen</p>' : "") + "</section>" +
      '<section class="ms-sec"><h3>Openingstijden</h3><ul class="ms-list">' + uren + "</ul></section>" +
      '<section class="ms-sec"><h3>Zo vind je ons</h3><div class="ms-map">' + KAART + '</div><p class="ms-fine">Utrecht</p></section>' +
      '<section class="ms-sec ms-story"><h3>Over ons</h3><p>' + esc(s.verhaal) + "</p></section>" +
      "</div>" +
      '<footer class="ms-foot">© ' + new Date().getFullYear() + " " + esc(naam) + "</footer>";
  }
  var zoomOk = window.CSS && CSS.supports && CSS.supports("zoom", "0.5");
  function pasZoom(mock, scherm, breed) {
    var w = scherm.clientWidth; if (!w) return;
    var z = w / (breed ? 1280 : 390);
    if (zoomOk) { mock.style.zoom = z; mock.style.transform = ""; return; }
    mock.style.transformOrigin = "top left";
    mock.style.transform = "scale(" + z + ")";
    mock.style.marginBottom = (mock.offsetHeight * (z - 1)) + "px";
  }
  function plaatsMock(mock, scherm, id, naam, breed, swing) {
    var s = V[id].site; naam = naam || s.zaak;
    mock.className = "ms" + (breed ? " ms--breed" : "") + (s.luifel ? "" : " ms--strak");
    mock.style.setProperty("--ms-acc", s.kleur[0]);
    mock.style.setProperty("--ms-acc-2", s.kleur[1]);
    mock.style.setProperty("--ms-bg", s.kleur[2]);
    mock.innerHTML = mockHtml(id, naam, swing);
    $(".ms-sign", mock).style.fontSize = signSize(naam, breed) + "px";
    pasZoom(mock, scherm, breed);
  }
  function linksHtml(lijst, metWie) {
    return lijst.map(function (l) {
      var url = tt(l.url), host = url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];
      return '<li class="link' + (metWie ? " link--" + l.wie : "") + '">' +
        (metWie ? '<span class="link-wie">' + esc(T(l.wie === "k" ? "linkK" : "linkJ")) + "</span>" : "") +
        '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(tt(l.t)) + UIT + '<span class="sr"> (' + esc(T("linkNieuw")) + ")</span></a>" +
        "<p>" + esc(tt(l.u)) + "</p>" +
        '<span class="link-bron">' + esc(host) + "</span></li>";
    }).join("");
  }

  /* Voorbeelden in het begin van de voorpagina */
  var losseMocks = $$("[data-mock]").filter(function (m) { return V[m.getAttribute("data-mock")]; });
  function tekenLosse() {
    losseMocks.forEach(function (m) {
      var scherm = m.closest(".device-screen"), dev = m.closest(".device");
      plaatsMock(m, scherm, m.getAttribute("data-mock"), "", dev && dev.getAttribute("data-device") === "laptop", false);
    });
  }
  tekenLosse();

  /* ---------------- /voorbeelden: kies je vak ---------------- */
  var maker = $("#maker");
  var qs = new URLSearchParams(location.search);
  var eerder = lees("vs-voorbeeld") || {};
  var OUD = { streek: "boerderij" };                       // vakken van de vorige versie
  var startVak = qs.get("vak") || eerder.vak;
  startVak = OUD[startVak] || startVak;
  var state = {
    vak: VAK_IDS.indexOf(startVak) >= 0 ? startVak : (VAK_IDS.indexOf("kapper") >= 0 ? "kapper" : VAK_IDS[0]),
    naam: (qs.get("zaak") || (qs.get("vak") ? "" : eerder.naam) || "").trim().slice(0, 40),
    device: "phone"
  };
  var mock = $("#mock"), device = $("#device"), scherm = $("#device-screen"), naamInput = $("#zaaknaam");

  function tekenMock(swing) { if (mock) plaatsMock(mock, scherm, state.vak, state.naam, state.device === "laptop", swing); }
  function updateNaam() {
    var el = mock && $(".ms-sign-name", mock), foot = mock && $(".ms-foot", mock), naam = state.naam || V[state.vak].site.zaak;
    if (!el) return tekenMock(false);
    el.textContent = naam;
    $(".ms-sign", mock).style.fontSize = signSize(naam, state.device === "laptop") + "px";
    if (foot) foot.textContent = "© " + new Date().getFullYear() + " " + naam;
  }
  function renderChips() {
    var plek = $("#vakken"); if (!plek) return;
    plek.innerHTML = VAK_IDS.map(function (id) {
      return '<label class="chip"><input type="radio" name="vak" value="' + id + '"' + (id === state.vak ? " checked" : "") + "><span>" + icon(id) + esc(hoofdletter(tt(plan(id).naam))) + "</span></label>";
    }).join("");
  }
  function renderInfo() {
    var pl = plan(state.vak), v = V[state.vak]; if (!pl || !$("#vb-groep")) return;
    $("#vb-groep").textContent = hoofdletter(tt(pl.groep));
    $("#vb-site").innerHTML = v.k.map(function (i) { var p = pl.punten[i]; return "<li><b>" + esc(tt(p.t)) + "</b><span>" + esc(tt(p.u)) + "</span></li>"; }).join("");
    $("#vb-achter").innerHTML = v.j.map(function (i) { return "<li>" + esc(tt(pl.punten[i].t)) + "</li>"; }).join("");
    var a = $("#vb-plan"); a.href = "/voor/" + pl.slug; a.textContent = T("vbPlan", { groep: tt(pl.groep) });
    $("#vb-links-kop").textContent = T("vbLinksKop", { groep: tt(pl.groep) });
    $("#vb-links").innerHTML = linksHtml(v.links, true);
    var dz = $("#demo-zaak"); if (dz) dz.textContent = T("demoZaak", { zaak: state.naam || v.site.zaak });
  }
  function onthoud() {
    bewaar("vs-voorbeeld", { vak: state.vak, naam: state.naam.trim() });
    if (maker && history.replaceState) {
      var p = new URLSearchParams(location.search);
      p.set("vak", state.vak);
      if (state.naam.trim()) p.set("zaak", state.naam.trim()); else p.delete("zaak");
      history.replaceState(null, "", location.pathname + "?" + p.toString() + location.hash);
    }
  }

  if (maker) {
    renderChips();
    renderInfo();
    $("#vakken").addEventListener("change", function (e) {
      if (e.target.name !== "vak") return;
      state.vak = e.target.value;
      tekenMock(true); renderInfo(); onthoud();
      if ($("#demo")) resetDemo();
    });
    naamInput.value = state.naam;
    var naamTimer;
    naamInput.addEventListener("input", function () {
      state.naam = naamInput.value.replace(/\s+/g, " ").trimStart().slice(0, 40);
      updateNaam();
      var dz = $("#demo-zaak"); if (dz) dz.textContent = T("demoZaak", { zaak: state.naam || V[state.vak].site.zaak });
      clearTimeout(naamTimer); naamTimer = setTimeout(onthoud, 400);
    });
    maker.addEventListener("submit", function (e) { e.preventDefault(); naamInput.blur(); });
    $$(".toggle-btn").forEach(function (b) {
      b.addEventListener("click", function () {
        if (state.device === b.dataset.device) return;
        state.device = b.dataset.device;
        $$(".toggle-btn").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        device.dataset.device = state.device;
        device.classList.remove("is-switching"); void device.offsetWidth; device.classList.add("is-switching");
        scherm.scrollTop = 0;
        tekenMock(false);
      });
    });
    var deel = $("#deel-link");
    if (deel) {
      if (voorvertoning) deel.hidden = true;
      deel.addEventListener("click", function () {
        var p = new URLSearchParams();
        p.set("vak", state.vak);
        if (state.naam.trim()) p.set("zaak", state.naam.trim());
        var link = location.origin + "/voorbeelden?" + p.toString() + "#voorbeeld";
        var klaar = function (ok) {
          deel.textContent = ok ? T("gekopieerd") : link;
          setTimeout(function () { deel.textContent = T("kopieer"); }, ok ? 2200 : 8000);
        };
        if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(link).then(function () { klaar(true); }, function () { klaar(false); });
        else klaar(false);
      });
    }
    var vraag = $("#vb-vraag");
    if (vraag) vraag.addEventListener("click", function () {
      var pl = plan(state.vak), naam = state.naam.trim(), soort = tt(pl.naam);
      if (taal() !== "de") soort = soort.toLowerCase();       // Duitse zelfstandige naamwoorden houden hun hoofdletter
      bewaar("vs-wens", { bericht: naam ? T("wensVbNaam", { soort: soort, naam: naam }) : T("wensVb", { soort: soort }) });
      onthoud();
    });
    tekenMock(true);
    if (qs.get("vak")) onthoud();
  }

  /* Handig voor elke ondernemer */
  function renderHandig() { var l = $("#handig-lijst"); if (l && HANDIG.length) l.innerHTML = linksHtml(HANDIG, false); }
  renderHandig();

  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      if (mock) pasZoom(mock, scherm, state.device === "laptop");
      losseMocks.forEach(function (m) { var d = m.closest(".device"); pasZoom(m, m.closest(".device-screen"), d && d.getAttribute("data-device") === "laptop"); });
    }, 80);
  });

  /* ---------------- Dashboard-demo ---------------- */
  var demoEl = $("#demo");
  var mailsEl = $("#mails"), bon = $("#bon"), todo = $("#todo"), runBtn = $("#demo-run");
  var demo = { mails: [], done: {}, sel: null, running: false, timers: [], kpi: { aandacht: 0, betalen: 0, tegen: 0 } };
  var datum = new Intl.DateTimeFormat("nl-NL", { weekday: "short", day: "numeric", month: "long" });
  function dag(off) { var d = new Date(); d.setDate(d.getDate() + off); return datum.format(d); }

  function maakMails(vak) {
    var t = V[vak].mail;
    return [
      { id: "m1", van: t.lev1, tijd: "07.12", onderwerp: "Factuur F-2026-118", soort: "Factuur", status: ["goed", "Goed"],
        rijen: [["Van", t.lev1], ["Factuurnummer", "F-2026-118"], ["Bedrag", euro(412.35)], ["Waarvan btw (21%)", euro(71.56)], ["Uiterlijk betalen", dag(14)], ["Rekeningnummer", "eindigt op 4417"]], zeker: 99,
        checks: [["goed", "Bedrag klopt met je bestelling van " + dag(-6)], ["goed", "Btw is goed uitgerekend"], ["goed", "Zelfde rekeningnummer als vorige keer"], ["goed", "Nog niet eerder betaald"]],
        stempel: ["goed", "Klaar om te betalen"], todo: ["goed", "Betaal " + t.lev1 + ": " + euro(412.35) + ", uiterlijk " + dag(14) + "."], kpi: { betalen: 412.35 } },
      { id: "m2", van: t.lev2, tijd: "08.03", onderwerp: "Factuur 2026-0412, graag vandaag betalen", soort: "Factuur", status: ["stop", "Niet betalen"],
        rijen: [["Van", t.lev2], ["Factuurnummer", "2026-0412"], ["Bedrag", euro(268.4)], ["Waarvan btw (21%)", euro(46.58)], ["Uiterlijk betalen", "vandaag"], ["Rekeningnummer", "eindigt op 0937"]], zeker: 98,
        checks: [["goed", "Bedrag past bij je eerdere bestellingen"], ["stop", "Ander rekeningnummer dan op de vorige 6 facturen (die eindigden op 2210)"], ["stop", "De mail zet haast: betalen moet vandaag"]],
        stempel: ["stop", "Niet betalen: eerst bellen"], todo: ["stop", "Bel " + t.lev2 + " op het nummer dat je al had: klopt het nieuwe rekeningnummer?"], kpi: { aandacht: 1, tegen: 268.4 } },
      { id: "m3", van: t.klant, tijd: "09.26", onderwerp: t.vraag, soort: "Vraag", status: ["info", "Beantwoorden"],
        rijen: [["Van", t.klant + ", via je website"], ["Vraag", t.vraag]], zeker: 97,
        checks: [["info", "Nieuwe klant: nog niet eerder gemaild"], ["info", "Concept-antwoord staat klaar"]], quote: t.antwoord,
        stempel: ["info", "Beantwoorden"], todo: ["info", "Beantwoord " + t.klant + ". Een concept staat klaar."], kpi: { aandacht: 1 } },
      { id: "m4", van: "Stroomwerk Energie", tijd: "10.41", onderwerp: "Herinnering: factuur 7781 staat nog open", soort: "Herinnering", status: ["let", "Al betaald"],
        rijen: [["Van", "Stroomwerk Energie"], ["Gaat over", "factuur 7781"], ["Bedrag", euro(96.8)]], zeker: 99,
        checks: [["goed", "Factuur 7781 is betaald op " + dag(-9)], ["let", "De herinnering is verstuurd voordat je betaling binnen was"]],
        stempel: ["let", "Al betaald: niet nog eens"], todo: ["let", "Stuur Stroomwerk Energie je betaalbewijs. Een concept staat klaar."], kpi: { aandacht: 1, tegen: 96.8 } },
      { id: "m5", van: t.lev1, tijd: "11.58", onderwerp: "Factuur F-2026-118", soort: "Factuur", status: ["stop", "Dubbel"],
        rijen: [["Van", t.lev1], ["Factuurnummer", "F-2026-118"], ["Bedrag", euro(412.35)]], zeker: 99,
        checks: [["stop", "Zelfde nummer en bedrag als de factuur van vanochtend 07.12"], ["goed", "Rekeningnummer is bekend"]],
        stempel: ["stop", "Dubbel: niet nog eens betalen"], todo: null, kpi: { tegen: 412.35 } },
      { id: "m6", van: "Groothandel Aanbiedingen", tijd: "12.30", onderwerp: "Nu 20% korting op " + t.promo, soort: "Reclame", status: ["grijs", "Opgeborgen"],
        rijen: [["Van", "Groothandel Aanbiedingen"], ["Soort", "Nieuwsbrief"]], zeker: 96,
        checks: [["info", "Geen factuur en geen vraag: hoeft niets mee"]],
        stempel: ["grijs", "Opgeborgen"], todo: null, kpi: {} }
    ];
  }
  function renderMails() {
    mailsEl.innerHTML = demo.mails.map(function (m) {
      var klaar = demo.done[m.id];
      var tag = klaar ? '<span class="pill pill--soort">' + esc(m.soort) + '</span><span class="pill pill--' + m.status[0] + '">' + esc(m.status[1]) + "</span>" : esc(T("ongelezen"));
      return '<li><button type="button" class="mail' + (klaar ? "" : " is-new") + '" data-id="' + m.id + '" aria-pressed="' + (demo.sel === m.id) + '">' +
        '<span class="mail-from">' + esc(m.van) + '</span><span class="mail-time">' + m.tijd + '</span><span class="mail-subj">' + esc(m.onderwerp) + "</span>" +
        '<span class="mail-tag">' + tag + "</span></button></li>";
    }).join("");
  }
  var IC = { goed: "✓", stop: "!", let: "!", info: "i", grijs: "–" };
  function renderBon(m, pop) {
    if (!m) { bon.innerHTML = '<p class="bon-leeg">' + T("bonLeeg") + "</p>"; return; }
    bon.innerHTML =
      '<div class="bon-kop"><strong>' + esc(m.soort) + '</strong><span class="pill pill--' + m.status[0] + '">' + esc(m.status[1]) + "</span></div>" +
      '<dl class="bon-rows">' + m.rijen.map(function (r) { return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("") + "</dl>" +
      '<p class="bon-zeker">Zekerheid bij het lezen: ' + m.zeker + "%</p>" +
      '<ul class="bon-checks">' + m.checks.map(function (c) { return '<li><span class="ic ic--' + (c[0] === "grijs" ? "info" : c[0]) + '" aria-hidden="true">' + IC[c[0]] + "</span><span>" + esc(c[1]) + "</span></li>"; }).join("") + "</ul>" +
      (m.quote ? '<p class="bon-quote">' + esc(m.quote) + "</p>" : "") +
      '<span class="stempel stempel--' + m.stempel[0] + (pop && !reduce ? " pop" : "") + '">' + esc(m.stempel[1]) + "</span>";
  }
  function setKpi(name, val) {
    var el = $('[data-kpi="' + name + '"]');
    var fmt = name === "aandacht" ? function (n) { return String(Math.round(n)); } : euro;
    var from = demo.kpi[name]; demo.kpi[name] = val;
    if (reduce) { el.textContent = fmt(val); return; }
    var t0 = performance.now();
    (function step(t) {
      var k = Math.min(1, (t - t0) / 500), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(from + (val - from) * e);
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }
  function renderTodo() {
    var items = demo.mails.filter(function (m) { return demo.done[m.id] && m.todo; });
    var order = { stop: 0, let: 1, info: 2, goed: 3 };
    items.sort(function (a, b) { return order[a.todo[0]] - order[b.todo[0]]; });
    todo.innerHTML = items.length ? items.map(function (m) { return '<li class="t--' + m.todo[0] + (m.justDone ? " in" : "") + '">' + esc(m.todo[1]) + "</li>"; }).join("")
      : '<li class="todo-leeg">' + esc(T("todoLeeg")) + "</li>";
    demo.mails.forEach(function (m) { m.justDone = false; });
  }
  function verwerk(m) {
    demo.done[m.id] = true; m.justDone = true;
    Object.keys(m.kpi).forEach(function (k) { setKpi(k, demo.kpi[k] + m.kpi[k]); });
    demo.sel = m.id;
    renderMails(); renderBon(m, true); renderTodo();
  }
  function leesMail(m, cb) {
    var btn = $('.mail[data-id="' + m.id + '"]', mailsEl);
    if (btn) btn.classList.add("is-reading");
    demo.timers.push(setTimeout(function () { verwerk(m); if (cb) cb(); }, reduce ? 0 : 750));
  }
  function runAll() {
    if (demo.running) return;
    if (demo.mails.every(function (m) { return demo.done[m.id]; })) { resetDemo(); }
    demo.running = true; runBtn.disabled = true; runBtn.textContent = T("lezen");
    var rest = demo.mails.filter(function (m) { return !demo.done[m.id]; });
    (function next(i) {
      if (i >= rest.length) {
        demo.running = false; runBtn.disabled = false; runBtn.textContent = T("opnieuw");
        var m2 = demo.mails[1]; demo.sel = m2.id; renderMails(); renderBon(m2, false);
        return;
      }
      leesMail(rest[i], function () { demo.timers.push(setTimeout(function () { next(i + 1); }, reduce ? 0 : 260)); });
    })(0);
  }
  function resetDemo() {
    if (!demoEl) return;
    demo.timers.forEach(clearTimeout); demo.timers = [];
    demo.mails = maakMails(state.vak); demo.done = {}; demo.sel = null; demo.running = false;
    ["aandacht", "betalen", "tegen"].forEach(function (k) { demo.kpi[k] = 0; $('[data-kpi="' + k + '"]').textContent = k === "aandacht" ? "0" : euro(0); });
    runBtn.disabled = false; runBtn.textContent = T("leesMail");
    renderMails(); renderBon(null); renderTodo();
  }
  if (demoEl) {
    runBtn.addEventListener("click", runAll);
    mailsEl.addEventListener("click", function (e) {
      var b = e.target.closest(".mail"); if (!b || demo.running) return;
      var m = demo.mails.filter(function (x) { return x.id === b.dataset.id; })[0];
      if (!demo.done[m.id]) { demo.running = true; leesMail(m, function () { demo.running = false; if (demo.mails.every(function (x) { return demo.done[x.id]; })) runBtn.textContent = T("opnieuw"); }); return; }
      demo.sel = m.id; renderMails(); renderBon(m, false);
    });
  }

  /* ---------------- Naar het contactformulier, ook vanaf een andere pagina ---------------- */
  var laatsteCheck = "";
  function vulFormulier(w) {
    var ta = $("#c-bericht"); if (!ta) return false;
    if (w.bericht && !ta.value) ta.value = w.bericht;
    var nw = $('input[name="wensen"][value="Nieuwe website"]'), ver = $('input[name="wensen"][value="Website vernieuwen"]');
    if (w.vernieuwen) { if (ver) ver.checked = true; } else if (nw) nw.checked = true;
    var db = $('input[name="wensen"][value="Dashboard mail en facturen"]'); if (db && w.dashboard) db.checked = true;
    if (w.check) laatsteCheck = w.check;
    var c = $("#contact"); if (c) c.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    setTimeout(function () { var nm = $("#c-naam"); if (nm) nm.focus({ preventScroll: true }); }, reduce ? 0 : 700);
    return true;
  }

  /* ---------------- Websitecheck ---------------- */
  var checkForm = $("#check-form");
  if (checkForm) {
    var checkInput = $("#check-url"), checkBtn = $("#check-btn"), checkRes = $("#check-result");
    var GROEP_IC = { goed: ["goed", "✓"], let: ["let", "!"], slecht: ["stop", "✕"] };
    var rapport = function (r) {
      var aan = Math.round(r.score / 10), kleur = r.score >= 80 ? "var(--groen)" : r.score >= 55 ? "#c47a00" : "var(--rood)";
      var segs = ""; for (var i = 0; i < 10; i++) segs += "<i" + (i < aan ? ' class="aan"' : "") + "></i>";
      var groepen = r.groepen.filter(function (g) { return g.items.length; }).map(function (g) {
        return '<div class="groep"><h4>' + esc(g.titel) + "</h4><ul>" + g.items.map(function (it) {
          var ic = GROEP_IC[it.status] || ["info", "i"];
          return '<li><span class="ic ic--' + ic[0] + '" aria-hidden="true">' + ic[1] + "</span><span>" + esc(it.label) + (it.uitleg ? "<small>" + esc(it.uitleg) + "</small>" : "") + "</span></li>";
        }).join("") + "</ul></div>";
      }).join("");
      var actie = r.score >= 80 ? T("checkGoed") : T("checkSlecht");
      checkRes.innerHTML = '<div class="rapport">' +
        '<div class="rapport-kop"><h3>' + esc(r.host) + '</h3><p class="rapport-oordeel">' + esc(r.oordeel) + " " + T("score", { n: r.score }) + "</p>" +
        '<div class="meter meter--' + (r.score >= 80 ? "goed" : r.score >= 55 ? "let" : "stop") + '" role="img" aria-label="Score ' + r.score + ' van de 100">' + segs + "</div>" +
        '<div class="meter-label"><span>0</span><span>100</span></div></div>' +
        '<div class="rapport-groepen">' + groepen + "</div>" +
        '<div class="rapport-actie"><p>' + esc(actie) + '</p><a class="btn" href="/#contact" id="check-voorstel">' + esc(T("voorstel")) + "</a></div></div>";
      $(".meter", checkRes).style.setProperty("--meter", kleur);
      $("#check-voorstel").addEventListener("click", function (e) {
        laatsteCheck = r.url;
        var w = { bericht: T("gecheckt", { host: r.host, n: r.score }), vernieuwen: true, check: r.url };
        if ($("#contact-form")) { e.preventDefault(); vulFormulier(w); } else bewaar("vs-wens", w);
      });
    };
    checkForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var url = checkInput.value.trim();
      if (!url) { checkRes.innerHTML = '<div class="check-fout">' + esc(T("checkLeeg")) + "</div>"; checkInput.focus(); return; }
      if (voorvertoning) { checkRes.innerHTML = '<div class="check-fout">' + esc(T("checkPreview")) + "</div>"; return; }
      var host = url.replace(/^https?:\/\//i, "").split("/")[0];
      checkRes.innerHTML = '<div class="check-laden"><span class="spinner" aria-hidden="true"></span><span>' + esc(T("checkBezig", { host: host })) + "</span></div>";
      checkBtn.disabled = true;
      fetch("/api/check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: url }) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw j; return j; }); })
        .then(function (j) { laatsteCheck = j.url || url; rapport(j); })
        .catch(function (err) {
          var msg = (err && err.message) || T("checkFout");
          checkRes.innerHTML = '<div class="check-fout">' + esc(msg) + "</div>";
        })
        .then(function () { checkBtn.disabled = false; });
    });
  }

  /* ---------------- Schermen van mijn werk ---------------- */
  $$("[data-shots]").forEach(function (fig) {
    var tabs = $$('[role="tab"]', fig), img = $(".browser-view img", fig), url = $(".browser-url", fig), panel = $('[role="tabpanel"]', fig);
    function kies(t, focus) {
      tabs.forEach(function (x) { var on = x === t; x.setAttribute("aria-selected", String(on)); x.tabIndex = on ? 0 : -1; });
      img.classList.remove("wissel"); void img.offsetWidth; img.classList.add("wissel");
      img.srcset = t.dataset.src + "-800.webp 800w, " + t.dataset.src + "-1600.webp 1600w";
      img.src = t.dataset.src + "-800.webp";
      img.alt = t.dataset.alt;
      var a = img.closest("a"); if (a) a.href = t.dataset.src + "-1600.webp";
      url.textContent = t.dataset.url;
      panel.setAttribute("aria-labelledby", t.id);
      if (focus) t.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { kies(t); });
      t.addEventListener("keydown", function (e) {
        var n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (n === undefined) return;
        e.preventDefault(); kies(tabs[(n + tabs.length) % tabs.length], true);
      });
    });
  });

  /* ---------------- Contactformulier ---------------- */
  var form = $("#contact-form");
  if (form) {
    var status = $("#c-status"), verstuur = $("#c-verstuur"), geopend = Date.now();
    var gezien = lees("vs-voorbeeld") || {};
    var czaak = $("#c-zaak");
    if (gezien.naam && !czaak.value) czaak.value = gezien.naam;
    var wens = lees("vs-wens");
    if (wens) { try { sessionStorage.removeItem("vs-wens"); } catch (e) { /* niets */ } vulFormulier(wens); }
    var fout = function (veld, msg) {
      $$(".field", form).forEach(function (f) { f.removeAttribute("aria-invalid"); });
      if (veld) { var el = form.elements[veld]; if (el && el.setAttribute) { el.setAttribute("aria-invalid", "true"); el.focus(); } }
      status.className = "form-status is-fout"; status.textContent = msg;
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var naam = form.elements.naam.value.trim(), contact = form.elements.contact.value.trim();
      if (!naam) return fout("naam", T("naamNodig"));
      var cijfers = contact.replace(/\D/g, "");
      if (!(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact) || (/^[\d\s()+\-./]+$/.test(contact) && cijfers.length >= 9))) return fout("contact", T("contactNodig"));
      var data = {
        naam: naam, zaak: form.elements.zaak.value.trim(), contact: contact, bericht: form.elements.bericht.value.trim(),
        wensen: $$('input[name="wensen"]:checked', form).map(function (x) { return x.value; }),
        vak: gezien.vak || "", voorbeeld: gezien.naam || "", check_url: laatsteCheck, fax: form.elements.fax.value, t: Date.now() - geopend
      };
      if (voorvertoning) { status.className = "form-status is-fout"; status.textContent = T("preview"); return; }
      verstuur.disabled = true; verstuur.textContent = T("versturen"); status.textContent = ""; status.className = "form-status";
      fetch("/api/aanvraag", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw j; return j; }); })
        .then(function () {
          form.innerHTML = '<div class="bedankt" tabindex="-1"><h3>' + esc(T("bedankt", { naam: naam.split(" ")[0] })) + "</h3><p>" + esc(T("bedanktTekst")) + "</p></div>";
          $(".bedankt", form).focus();
        })
        .catch(function (err) {
          verstuur.disabled = false; verstuur.textContent = T("stuur");
          fout(err && err.field, (err && err.message) || T("fout"));
        });
    });
  }

  /* ---------------- Namen van de vakken in de strook en de voet ---------------- */
  function vakTeksten() {
    $$("[data-groep]").forEach(function (a) { var p = plan(a.getAttribute("data-groep")); if (p) a.textContent = hoofdletter(tt(p.groep)); });
    $$("[data-vaknaam]").forEach(function (a) {
      var id = a.getAttribute("data-vaknaam"), p = plan(id);
      if (I[id] && !a.querySelector("svg")) a.insertAdjacentHTML("afterbegin", icon(id));
      if (p && a.lastElementChild) a.lastElementChild.textContent = hoofdletter(tt(p.naam));
    });
  }
  document.addEventListener("taal", function () {
    vakTeksten();
    if (maker) { renderChips(); renderInfo(); }
    renderHandig();
    if (demoEl && !demo.running) resetDemo();
  });

  /* ---------------- Kopbalk: donker zolang hij boven de groene tafel staat; app-knop pas na het begin ---------------- */
  var kopbalk = $(".top"), tafel = $("#intro-tafel"), zweef = $(".app-zweef"), contactEl = $("#contact") || $(".vb-slot");
  if ((kopbalk && tafel) || zweef) {
    var tik = false;
    var kleur = function () {
      tik = false;
      if (kopbalk && tafel) kopbalk.classList.toggle("is-donker", tafel.getBoundingClientRect().bottom > kopbalk.offsetHeight / 2);
      if (zweef) {
        var c = contactEl && contactEl.getBoundingClientRect(), opContact = c && c.top < window.innerHeight - 80 && c.bottom > 0;
        zweef.classList.toggle("is-zichtbaar", window.scrollY > 520 && !opContact);
      }
    };
    window.addEventListener("scroll", function () { if (!tik) { tik = true; requestAnimationFrame(kleur); } }, { passive: true });
    window.addEventListener("resize", kleur);
    kleur();
  }

  /* ---------------- Start ---------------- */
  var jaar = $("#jaar"); if (jaar) jaar.textContent = String(new Date().getFullYear());
  vakTeksten();
  resetDemo();
  // een uitklapper waar een link naartoe wijst (zoals /#mogelijkheden) gaat vanzelf open
  function openDoel() { var d = location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1))); if (d && d.tagName === "DETAILS") d.open = true; }
  openDoel();
  window.addEventListener("hashchange", openDoel);
  setInterval(function () {
    $$(".ms").forEach(function (m) {
      var o = $(".ms-open", m), id = m.getAttribute("data-mock") || (m === mock ? state.vak : null);
      if (!o || !V[id]) return;
      var info = openInfo(V[id].site.uren); o.lastChild.textContent = info.tekst; o.classList.toggle("is-dicht", !info.open);
    });
  }, 60000);
})();

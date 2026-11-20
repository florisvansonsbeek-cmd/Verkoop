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
  var UIT = '<svg class="uit" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3h7v7M13 3 4 12"/></svg>';

  /* ---------------- Voorbeeldsite (Nederlands, net als de zaak zelf) ----------------
     Opgebouwd als een presentatieblad: de gevel van het pand bovenaan, daaronder een strak raster. */
  var PIN = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 15s-5-4.6-5-8.6a5 5 0 0 1 10 0C13 10.4 8 15 8 15z"/><circle cx="8" cy="6.4" r="1.8"/></svg>';
  var TEL = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.2 1.8 6.6 5 5.1 6.3a8.6 8.6 0 0 0 4.6 4.6L11 9.4l3.2 1.4-.5 2.6a1.5 1.5 0 0 1-1.6 1.2C6.6 14.2 1.8 9.4 1.4 3.9a1.5 1.5 0 0 1 1.2-1.6z"/></svg>';
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
  /* kleuren per zaak: alles afgeleid van de merkkleur, de tweede kleur en het papier */
  function rgb(h) { h = h.replace("#", ""); return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }
  function hex(a) { return "#" + a.map(function (v) { return ("0" + Math.round(Math.max(0, Math.min(255, v))).toString(16)).slice(-2); }).join(""); }
  function meng(a, b, t) { var A = rgb(a), B = rgb(b); return hex(A.map(function (v, i) { return v + (B[i] - v) * t; })); }
  function alfa(a, t) { return "rgba(" + rgb(a).join(",") + "," + t + ")"; }
  function zetKleuren(el, k) {
    var acc = k[0], acc2 = k[1], bg = k[2], ink = meng(acc, "#0a0c0b", 0.52), v = {
      "--ms-acc": acc, "--ms-acc-2": acc2, "--ms-bg": bg, "--ms-ink": ink, "--ms-ink-2": alfa(ink, 0.8), "--ms-ink-3": alfa(ink, 0.56),
      "--ms-ink-4": alfa(ink, 0.4), "--ms-ink-5": alfa(ink, 0.15), "--ms-lijn": alfa(ink, 0.14), "--ms-raster": alfa(ink, 0.045),
      "--ms-glas": meng(acc, "#ffffff", 0.84), "--ms-zacht": meng(acc, bg, 0.9), "--ms-boom": meng(acc, bg, 0.8), "--ms-papier": meng(bg, "#ffffff", 0.55),
      "--ms-figuur": alfa(ink, 0.86), "--ms-schaduw": alfa(ink, 0.1), "--ms-acc-licht": meng(acc2, bg, 0.6)
    };
    for (var key in v) el.style.setProperty(key, v[key]);
  }
  /* De boekmodule op de voorbeeldsite: afspraak, opname, pakket of prijs. Tijden en datums rekenen mee met vandaag,
     zodat het er echt uitziet. De aantekening eronder (noot) vertelt waar het op aansluit, zoals een maatlijn op een tekening. */
  var DAG_KORT = ["ma", "di", "wo", "do", "vr", "za", "zo"];
  var MAAND = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  var MAAND_LANG = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
  var STEKKER = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.6 1.5v3.2M10.4 1.5v3.2M3.6 4.7h8.8v2.6a4.4 4.4 0 0 1-8.8 0zM8 11.7v2.8"/></svg>';
  function zaad(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973; return h; }
  // de eerstvolgende open dagen; vandaag alleen als er nog genoeg tijd over is
  function openDagen(uren, n, vanMorgen, stap, tot) {
    var nu = new Date(), uur = nu.getHours() + nu.getMinutes() / 60, res = [];
    for (var i = vanMorgen ? 1 : 0; i < 21 && res.length < n; i++) {
      var d = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate() + i), w = (d.getDay() + 6) % 7, slot = uren[w];
      if (!slot) continue;
      var van = slot[0], eind = Math.min(slot[1], tot || slot[1]);
      if (i === 0) van = Math.max(van, Math.ceil((uur + 1) / stap) * stap);
      if (i === 0 && eind - van < stap * 4) continue;
      res.push({ d: d, i: i, w: w, van: van, tot: eind, open: slot });
    }
    return res;
  }
  function dagNaam(dg) { return dg.i === 0 ? "Vandaag" : dg.i === 1 ? "Morgen" : DAGEN[dg.w]; }
  function dagKort(dg) { return DAG_KORT[dg.w] + " " + dg.d.getDate() + " " + MAAND[dg.d.getMonth()]; }
  function boekHtml(id, b, s, breed) {
    if (!b) return "";
    var z = zaad(id), keuze = b.keuze ? '<div class="ms-keuze">' + b.keuze.map(function (k, i) { return "<span" + (i === 0 ? ' class="is-aan"' : "") + ">" + esc(k) + "</span>"; }).join("") + "</div>" : "";
    var kaart = "", samen = "";
    if (b.soort === "tijden" || b.soort === "kenteken") {
      var stap = b.stap || 0.5, dagen = openDagen(s.uren, breed ? 4 : 3, false, stap, b.tot), eerste = dagen[0];
      var tijden = [];
      for (var t = eerste.van; t <= eerste.tot - stap + 1e-9; t += stap) tijden.push(t);
      if (tijden.length > 8) { var gekozen = []; for (var k = 0; k < 8; k++) gekozen.push(tijden[Math.round(k * (tijden.length - 1) / 7)]); tijden = gekozen; }
      if (tijden.length > 4 && tijden.length < 8) tijden = tijden.slice(0, 4);     // hele rijen van vier
      var bezet = tijden.map(function (t, i) { return (i * 5 + z) % 4 === 0; }), aan = bezet.indexOf(false);
      kaart = (b.soort === "kenteken" ? '<div class="ms-kenteken"><span class="ms-plaat"><i>NL</i>' + esc(b.kenteken) + '</span><span class="ms-auto"><b>' + esc(b.auto) + "</b><span>" + esc(b.apk) + "</span></span></div>" : "") +
        keuze +
        '<div class="ms-dagen">' + dagen.map(function (dg, i) { return "<span" + (i === 0 ? ' class="is-aan"' : "") + "><b>" + esc(dagNaam(dg)) + "</b><i>" + esc(dg.d.getDate() + " " + MAAND[dg.d.getMonth()]) + "</i></span>"; }).join("") + "</div>" +
        '<ul class="ms-tijden">' + tijden.map(function (t, i) { return '<li class="' + (bezet[i] ? "is-bezet" : i === aan ? "is-aan" : "") + '">' + tijd(t) + "</li>"; }).join("") + "</ul>";
      samen = b.keuze[0] + ", " + dagNaam(eerste).toLowerCase() + " om " + tijd(tijden[aan]);
    } else if (b.soort === "dagdeel") {
      var dd = openDagen(s.uren, 3, true, 0.5), keus = null;
      kaart = keuze + '<ul class="ms-dagdelen">' + dd.map(function (dg, r) {
        var delen = [["ochtend", dg.open[0], 12], ["middag", 12, dg.open[1]]];
        return "<li><b>" + esc(hoofdletter(dagKort(dg))) + "</b>" + delen.map(function (dl, c) {
          var vol = (r * 3 + c * 2 + z) % 5 === 0, kies = !vol && !keus;
          if (kies) keus = { dg: dg, dl: dl };
          return '<span class="' + (vol ? "is-vol" : kies ? "is-aan" : "") + '"><b>' + dl[0] + "</b><i>" + (vol ? "vol" : tijd(dl[1]) + "–" + tijd(dl[2])) + "</i></span>";
        }).join("") + "</li>";
      }).join("") + "</ul>";
      samen = b.keuze[0] + ", " + dagKort(keus.dg) + ", " + keus.dl[0];
    } else if (b.soort === "pakket") {
      var nu = new Date(), w = (nu.getDay() + 6) % 7, plus = (b.ophalen[0] - w + 7) % 7;
      if (w > 3) plus += 7;                                       // na donderdag is het pakket voor volgende week
      var dag = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate() + plus);
      kaart = '<ul class="ms-opties">' + b.opties.map(function (o, i) { return "<li" + (i === 0 ? ' class="is-aan"' : "") + "><i></i><span>" + esc(o[0]) + "</span><b>" + esc(euro(o[1])) + "</b></li>"; }).join("") + "</ul>" +
        '<p class="ms-ophalen"><span>Ophalen</span><b>' + DAGEN[b.ophalen[0]].toLowerCase() + " " + dag.getDate() + " " + MAAND_LANG[dag.getMonth()] + ", " + tijd(b.ophalen[1]) + "–" + tijd(b.ophalen[2]) + "</b></p>";
      samen = "Totaal <b>" + esc(euro(b.opties[0][1])) + "</b>";
    } else if (b.soort === "prijs") {
      kaart = '<dl class="ms-velden">' + b.velden.map(function (v) { return "<div><dt>" + esc(v[0]) + "</dt><dd>" + esc(v[1]) + "</dd></div>"; }).join("") + "</dl>" +
        '<p class="ms-uitkomst"><span>Richtprijs</span><b>' + esc(euro(b.prijs).replace(/,00$/, "")) + "</b><i>" + esc(b.per) + "</i></p>";
    }
    return '<section class="ms-sectie ms-boek"><div class="ms-boek-tekst"><p class="ms-h2">' + esc(b.kop) + '</p><p class="ms-boek-sub">' + esc(b.sub) + "</p></div>" +
      '<div class="ms-boek-kaart">' + kaart + '<div class="ms-boek-voet">' + (samen ? '<span class="ms-boek-samen">' + (b.soort === "pakket" ? samen : esc(samen)) + "</span>" : "") +
      '<span class="ms-knop">' + esc(b.knop) + "</span></div></div>" +
      '<p class="ms-koppel">' + STEKKER + "<span>" + esc(b.noot) + "</span></p></section>";
  }
  function mockHtml(id, naam, breed) {
    var s = V[id].site, info = openInfo(s.uren), vandaag = (new Date().getDay() + 6) % 7, G = window.GEVELS;
    var prijzen = s.prijzen.map(function (p) {
      return "<li><span>" + esc(p[0]) + '</span><i></i><span class="ms-bedrag">' + esc(prijsTekst(p)) + "</span></li>";
    }).join("");
    var metBedrag = s.prijzen.some(function (p) { return typeof p[1] === "number" && p[1] > 0; });
    var uren = s.uren.map(function (u, i) {
      return '<li class="' + (i === vandaag ? "is-vandaag" : "") + (u ? "" : " is-dicht") + '"><span>' + DAGEN[i] + '</span><i></i><span class="ms-bedrag">' + (u ? tijd(u[0]) + "–" + tijd(u[1]) : "gesloten") + "</span></li>";
    }).join("");
    var lijst = function (rijen, cls) { return '<ul class="' + cls + '">' + rijen.map(function (r) { return "<li><b>" + esc(r[0]) + "</b><span>" + esc(r[1]) + "</span></li>"; }).join("") + "</ul>"; };
    var tekening = G ? G.teken(s.tekening || id, naam, { stijl: s.stijl, focus: !breed, label: "Gevel van " + naam }) : "";
    var kaart = G ? G.kaart(s.kaart, naam, s.stijl) : "";
    return '<header class="ms-kop"><span class="ms-merk"><span class="ms-bol">' + esc(naam.charAt(0).toUpperCase()) + '</span><span class="ms-naam ms-woordmerk">' + esc(naam) + "</span></span>" +
      '<span class="ms-menu">' + (s.menu || []).map(function (m) { return "<span>" + esc(m) + "</span>"; }).join("") + "</span>" +
      '<span class="ms-open' + (info.open ? "" : " is-dicht") + '"><i></i>' + esc(info.tekst) + "</span>" +
      '<span class="ms-knop ms-knop--klein">' + esc(s.knoppen[0]) + '</span><span class="ms-burger"><i></i><i></i><i></i></span></header>' +
      '<section class="ms-held"><div class="ms-held-tekst"><p class="ms-h1">' + esc(s.kop) + '</p><p class="ms-intro">' + esc(s.intro) + "</p>" +
      '<div class="ms-knoppen"><span class="ms-knop">' + esc(s.knoppen[0]) + '</span><span class="ms-knop ms-knop--lijn">' + esc(s.knoppen[1]) + "</span></div>" +
      '<p class="ms-adresregel">' + PIN + "<span>" + esc(s.adres) + "</span></p>" +
      '<p class="ms-open ms-open--los' + (info.open ? "" : " is-dicht") + '"><i></i>' + esc(info.tekst) + "</p></div>" +
      '<figure class="ms-blad"><div class="ms-tek">' + tekening + '</div><figcaption><span>Gevel ' + esc(s.plek || s.adres) + "</span><span>schaal 1:100</span></figcaption></figure></section>" +
      lijst(s.feiten, "ms-feiten") +
      boekHtml(id, s.boek, s, breed) +
      '<section class="ms-sectie"><div class="ms-sectie-kop"><p class="ms-h2">' + esc(s.dienstKop || "Wat we doen") + "</p></div>" + lijst(s.diensten, "ms-diensten") + "</section>" +
      '<section class="ms-sectie ms-sectie--twee"><div><p class="ms-h2">' + esc(s.prijsKop) + '</p><ul class="ms-lijst">' + prijzen + "</ul>" + (metBedrag ? '<p class="ms-fijn">Voorbeeldprijzen</p>' : "") + "</div>" +
      '<div><p class="ms-h2">Openingstijden</p><ul class="ms-lijst">' + uren + "</ul></div></section>" +
      '<section class="ms-sectie"><div class="ms-sectie-kop"><p class="ms-h2">Zo werkt het</p></div><ol class="ms-stappen">' +
      s.stappen.map(function (st, i) { return '<li><span class="ms-nr">' + (i + 1) + "</span><b>" + esc(st[0]) + "</b><span>" + esc(st[1]) + "</span></li>"; }).join("") + "</ol></section>" +
      '<section class="ms-sectie ms-sectie--route"><div class="ms-kaart ms-tek">' + kaart + "</div>" +
      '<div class="ms-adres"><p class="ms-h2">Zo vind je ons</p><p class="ms-adresregel">' + PIN + "<span>" + esc(s.adres) + '</span></p><p class="ms-adresregel">' + TEL + "<span>" + esc(s.tel) + "</span></p>" +
      '<p class="ms-gebied">' + esc(s.gebied || "") + '</p><span class="ms-knop ms-knop--lijn">Plan je route</span></div></section>' +
      '<section class="ms-verhaal"><p>' + esc(s.verhaal) + "</p></section>" +
      '<section class="ms-slot"><p class="ms-h2">' + esc(s.slot || s.kop) + '</p><div class="ms-knoppen"><span class="ms-knop ms-knop--wit">' + esc(s.knoppen[0]) + '</span><span class="ms-slot-tel">' + TEL + esc(s.tel) + "</span></div></section>" +
      '<footer class="ms-titelblok"><div class="ms-tb-groot"><span>Zaak</span><b class="ms-naam">' + esc(naam) + "</b></div>" +
      "<div><span>Adres</span><b>" + esc(s.adres) + "</b></div><div><span>Telefoon</span><b>" + esc(s.tel) + "</b></div>" +
      "<div><span>Website</span><b>Van Sonsbeek, " + new Date().getFullYear() + "</b></div></footer>";
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
  /* namen in de tekening: te lang voor het bord? dan iets smaller zetten */
  function pasNamen(root) {
    $$("text.ms-naam[data-w]", root).forEach(function (t) {
      t.removeAttribute("textLength"); t.removeAttribute("lengthAdjust");
      var max = parseFloat(t.getAttribute("data-w"));
      try { if (t.getComputedTextLength() > max) { t.setAttribute("textLength", max); t.setAttribute("lengthAdjust", "spacingAndGlyphs"); } } catch (e) { /* nog niet zichtbaar */ }
    });
  }
  function plaatsMock(mock, scherm, id, naam, breed, teken) {
    var s = V[id].site; naam = naam || s.zaak;
    mock.className = "ms ms--" + (s.stijl || "serif") + (breed ? " ms--breed" : "") + (teken && !reduce ? " ms--teken" : "");
    zetKleuren(mock, s.kleur);
    mock.innerHTML = mockHtml(id, naam, breed);
    pasZoom(mock, scherm, breed);
    pasNamen(mock);
  }
  /* alleen de naam veranderd: tekst vervangen en de tekeningen opnieuw maken */
  function wisselNaam(mock, id, naam, breed) {
    var s = V[id].site, G = window.GEVELS; naam = naam || s.zaak;
    mock.classList.remove("ms--teken");                     // de tekening tekent zich alleen bij een nieuw vak opnieuw
    $$(".ms-naam", mock).forEach(function (el) { if (el.tagName.toLowerCase() !== "text") el.textContent = naam; });
    var bol = $(".ms-bol", mock); if (bol) bol.textContent = naam.charAt(0).toUpperCase();
    if (G) {
      var t = $(".ms-blad .ms-tek", mock), k = $(".ms-kaart", mock);
      if (t) t.innerHTML = G.teken(s.tekening || id, naam, { stijl: s.stijl, focus: !breed, label: "Gevel van " + naam });
      if (k) k.innerHTML = G.kaart(s.kaart, naam, s.stijl);
    }
    pasNamen(mock);
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

  function tekenMock(teken) { if (mock) plaatsMock(mock, scherm, state.vak, state.naam, state.device === "laptop", teken); }
  var naamKlok;
  function updateNaam() {
    if (!mock || !$(".ms-kop", mock)) return tekenMock(false);
    clearTimeout(naamKlok);
    naamKlok = setTimeout(function () { wisselNaam(mock, state.vak, state.naam, state.device === "laptop"); }, 90);
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
    var kp = pl.koppel, kt = $("#vb-koppel-tekst"), kl = $("#vb-koppel");
    if (kp && kt && kl) {
      kt.textContent = tt(kp.t);
      kl.innerHTML = kp.namen.map(function (n) { return "<li>" + esc(tt(n)) + "</li>"; }).join("");
    }
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
    var voorbeeldLink = function () {
      var p = new URLSearchParams();
      p.set("vak", state.vak);
      if (state.naam.trim()) p.set("zaak", state.naam.trim());
      return location.origin + "/voorbeelden?" + p.toString() + "#voorbeeld";
    };
    if (deel) {
      if (voorvertoning) deel.hidden = true;
      deel.addEventListener("click", function () {
        var link = voorbeeldLink();
        var klaar = function (ok) {
          deel.textContent = ok ? T("gekopieerd") : link;
          setTimeout(function () { deel.textContent = T("kopieer"); }, ok ? 2200 : 8000);
        };
        if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(link).then(function () { klaar(true); }, function () { klaar(false); });
        else klaar(false);
      });
    }
    /* QR-code naar dit voorbeeld: op de computer kijken en op je telefoon openen, of in de zaak laten scannen.
       De QR-maker (/js/qr.js) laadt pas bij de eerste klik. */
    if (deel && !voorvertoning && window.HTMLDialogElement) {
      var qrKnop = document.createElement("button"), qrDialoog = null;
      qrKnop.type = "button";
      qrKnop.className = "textlink textlink--small";
      qrKnop.id = "qr-knop";
      qrKnop.setAttribute("aria-haspopup", "dialog");
      qrKnop.textContent = T("qrKnop");
      deel.insertAdjacentElement("afterend", qrKnop);
      document.addEventListener("taal", function () { qrKnop.textContent = T("qrKnop"); });
      var toonQR = function () {
        if (!qrDialoog) {
          qrDialoog = document.createElement("dialog");
          qrDialoog.className = "qr-dialoog";
          qrDialoog.setAttribute("aria-labelledby", "qr-titel");
          document.body.appendChild(qrDialoog);
          // sluiten met de knop of door naast het venster te tikken; Esc doet de browser zelf
          qrDialoog.addEventListener("click", function (e) { if (e.target === qrDialoog || e.target.closest("[data-sluit]")) qrDialoog.close(); });
          qrDialoog.addEventListener("close", function () { qrKnop.focus(); });
        }
        var naam = state.naam.trim() || V[state.vak].site.zaak;
        qrDialoog.innerHTML = '<div class="qr-binnen"><h2 id="qr-titel">' + esc(T("qrTitel", { zaak: naam })) + "</h2>" +
          window.QR.svg(voorbeeldLink(), { titel: T("qrTitel", { zaak: naam }), kleur: "#1f3628" }) +
          "<p>" + esc(T("qrUitleg")) + '</p><button type="button" class="btn btn--small" data-sluit>' + esc(T("qrSluit")) + "</button></div>";
        qrDialoog.showModal();
      };
      qrKnop.addEventListener("click", function () {
        if (window.QR) return toonQR();
        var s = document.createElement("script"), eigen = $('script[src*="/js/site.js"]');
        var v = eigen ? (eigen.getAttribute("src").split("?")[1] || "") : "";
        s.src = "/js/qr.js" + (v ? "?" + v : "");
        s.onload = toonQR;
        s.onerror = function () { qrKnop.hidden = true; };
        document.head.appendChild(s);
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

  /* ---------------- Aansluitschema op de voorpagina ----------------
     De leidingen tekenen zich één keer, als het schema in beeld komt. "Vraag het na" zet een vraag klaar in het formulier. */
  var schema = $("#schema");
  if (schema && !reduce && "IntersectionObserver" in window) {
    schema.classList.add("schema--anim");
    var schemaKijker = new IntersectionObserver(function (items) {
      items.forEach(function (it) { if (it.isIntersecting) { schema.classList.add("is-aan"); schemaKijker.disconnect(); } });
    }, { threshold: 0.15 });
    schemaKijker.observe(schema);
  }
  var koppelVraag = $("#koppel-vraag");
  if (koppelVraag) koppelVraag.addEventListener("click", function (e) {
    if ($("#contact-form")) { e.preventDefault(); vulFormulier({ bericht: T("wensKoppel") }); }
  });

  /* ---------------- Start ---------------- */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { $$(".ms").forEach(pasNamen); });
  var jaar = $("#jaar"); if (jaar) jaar.textContent = String(new Date().getFullYear());
  vakTeksten();
  resetDemo();
  // een uitklapper waar een link naartoe wijst (zoals /#mogelijkheden) gaat vanzelf open
  function openDoel() { var d = location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1))); if (d && d.tagName === "DETAILS") d.open = true; }
  openDoel();
  window.addEventListener("hashchange", openDoel);
  setInterval(function () {
    $$(".ms").forEach(function (m) {
      var id = m.getAttribute("data-mock") || (m === mock ? state.vak : null);
      if (!V[id]) return;
      var info = openInfo(V[id].site.uren);
      $$(".ms-open", m).forEach(function (o) { o.lastChild.textContent = info.tekst; o.classList.toggle("is-dicht", !info.open); });
    });
  }, 60000);
})();

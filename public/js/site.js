/* Floris van Sonsbeek: voorbeeldsite, dashboard-demo, websitecheck, schermen en contactformulier. */
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
  var DAGEN = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];

  /* ---------------- Iconen per vak ---------------- */
  var I = {
    kapper: '<circle cx="36" cy="92" r="11"/><circle cx="76" cy="92" r="11"/><path d="M43 84 80 18M69 84 32 18"/><circle cx="56" cy="61" r="2.5" fill="currentColor"/>',
    schoenmaker: '<path d="M14 82c0-10 6-16 15-18l26-6c9-2 14-9 17-16l4-8 14 5c-2 9 1 15 8 19l8 5c4 3 5 7 5 11v8H14z"/><path d="M14 90h97M40 63l3 9M54 60l3 9"/>',
    stomerij: '<path d="M52 30a8 8 0 1 1 8 8v8"/><path d="M60 46 18 76c-4 3-2 8 3 8h78c5 0 7-5 3-8L60 46"/>',
    bakkerij: '<path d="M20 74c0-24 18-36 40-36s40 12 40 36v8c0 3-3 6-6 6H26c-3 0-6-3-6-6z"/><path d="M42 52l-7 14M60 48l-7 16M78 52l-7 14"/>',
    ijzerwaren: '<path d="M80 20a20 20 0 0 0-18 28L24 86a8 8 0 0 0 11 11l38-38a20 20 0 0 0 28-18l-12 12-12-3-3-12z"/>',
    lijstenmaker: '<rect x="20" y="24" width="80" height="72" rx="2"/><rect x="33" y="37" width="54" height="46"/><path d="M20 24l13 13M100 24 87 37M20 96l13-13M100 96 87 83M38 78l14-16 10 10 8-7 12 13"/>',
    anders: '<path d="M26 52v42h68V52"/><path d="M20 34h80l-6 18H26z"/><path d="M50 94V70h20v24M32 62h10v10H32zM78 62h10v10H78z"/>'
  };
  function icon(vak, cls) {
    return '<svg class="' + (cls || "") + '" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + I[vak] + "</svg>";
  }
  var KAART = '<svg viewBox="0 0 320 150" aria-hidden="true"><rect width="320" height="150" fill="#e8edf1"/>' +
    '<path d="M0 34h320M0 112h320M78 0v150M214 0v150M140 0l26 150" stroke="#fff" stroke-width="7"/>' +
    '<path d="M-10 58C60 78 96 30 158 62s104 56 172 34" stroke="#a9c6d9" stroke-width="16" fill="none"/>' +
    '<g transform="translate(166 70)"><path class="pin" d="M0-30C-13-30-20-20-20-11-20 3 0 20 0 20S20 3 20-11C20-20 13-30 0-30Z"/><circle cy="-11" r="7" fill="#fff"/></g></svg>';

  /* ---------------- De vakken ---------------- */
  var VAKKEN = {
    kapper: { label: "Kapper", kleur: ["#1d4a3a", "#e3c27e", "#f3f1ec"], tag: "Knippen, scheren en baard trimmen. Met of zonder afspraak.",
      knoppen: ["Afspraak maken", "Bel direct"],
      prijzen: [["Knippen heren", 27.5], ["Knippen en baard", 39.5], ["Baard trimmen", 17.5], ["Kinderen tot 12 jaar", 19.5]],
      uren: [null, [9, 18], [9, 18], [9, 18], [9, 20], [9, 18], null],
      verhaal: "Al jaren de kapper van de buurt. Loop gerust binnen, of plan je afspraak online.",
      mail: { lev1: "Haarwerk Groothandel", lev2: "Barbier Supplies Kuipers", klant: "Youssef", vraag: "Kan ik zaterdag om 11.00 uur terecht voor knippen en baard?", antwoord: "Hoi Youssef, zaterdag om 11.00 uur kan. Je staat erin voor knippen en baard. Tot dan!", promo: "kappersscharen" } },
    schoenmaker: { label: "Schoenmaker", kleur: ["#5e3521", "#e0aa6c", "#f6f0e8"], tag: "Hakken, zolen en sleutels. Vaak klaar terwijl je wacht.",
      knoppen: ["Bel direct", "Route"],
      prijzen: [["Nieuwe hakken", 14.5, "vanaf"], ["Halve zolen", 34.5], ["Sleutel bijmaken", 4.5, "vanaf"], ["Rits vervangen", 19.5, "vanaf"]],
      uren: [[13, 18], [9, 18], [9, 18], [9, 18], [9, 18], [9, 17], null],
      verhaal: "Vakwerk met leer en sleutels, al generaties lang. Breng je schoenen langs, dan zeggen we meteen wat het kost.",
      mail: { lev1: "Lederhandel Brabant", lev2: "Sleutelgroothandel Kuipers", klant: "Sanne", vraag: "Kunnen jullie mijn laarzen voor zaterdag van nieuwe zolen voorzien?", antwoord: "Hoi Sanne, dat lukt. Breng ze uiterlijk woensdag langs, dan zijn ze vrijdag klaar.", promo: "sleutelblanco's" } },
    stomerij: { label: "Stomerij", kleur: ["#0e6672", "#9fd8df", "#f2f8f9"], tag: "Stomen, wassen en vermaken. Binnen twee werkdagen klaar.",
      knoppen: ["Bel direct", "Route"],
      prijzen: [["Overhemd wassen en strijken", 4.25], ["Colbert stomen", 12.95], ["Broek inkorten", 14.5], ["Rits in jas vervangen", 29.5]],
      uren: [[8.5, 18], [8.5, 18], [8.5, 18], [8.5, 18], [8.5, 18], [9, 17], null],
      verhaal: "Je kleding in goede handen: van overhemd tot trouwjurk. Vermaken doen we in ons eigen atelier.",
      mail: { lev1: "Textielzorg Groothandel", lev2: "Hangers en Hoezen Kuipers", klant: "Mark", vraag: "Kan mijn pak vóór vrijdag gestoomd zijn? Ik heb een bruiloft.", antwoord: "Hoi Mark, breng het pak uiterlijk woensdag, dan ligt het donderdagmiddag voor je klaar.", promo: "kledinghoezen" } },
    bakkerij: { label: "Bakkerij", kleur: ["#9a4a17", "#f2cf8a", "#fbf5ec"], tag: "Elke ochtend vers uit eigen oven: brood, simit en baklava.",
      knoppen: ["Bestellen voor morgen", "Bel direct"],
      prijzen: [["Desembrood", 3.95], ["Turks brood", 1.75], ["Simit", 1.25], ["Baklava, 250 gram", 6.95]],
      uren: [[7, 19], [7, 19], [7, 19], [7, 19], [7, 19], [7, 19], [8, 14]],
      verhaal: "Elke nacht staan we aan de oven, zodat jij 's ochtends vers brood haalt. Voor feesten bakken we op bestelling.",
      mail: { lev1: "Meelhandel Van Dijk", lev2: "Verpakkingen Kuipers", klant: "Elif", vraag: "Kunnen jullie zaterdag 40 simits en een schaal baklava klaarzetten?", antwoord: "Hoi Elif, dat kan. Zaterdag vanaf 9.00 uur staat alles voor je klaar.", promo: "taartdozen" } },
    ijzerwaren: { label: "IJzerwaren", kleur: ["#2d3b4b", "#f08a4b", "#f2f4f6"], tag: "Schroeven per stuk, sleutels en gereedschap. En goede raad erbij.",
      knoppen: ["Bel direct", "Route"],
      prijzen: [["Sleutel bijmaken", 4.5, "vanaf"], ["Ketting op maat, per meter", 3.95], ["Gereedschap slijpen", 6.5, "vanaf"], ["Advies", 0, "gratis"]],
      uren: [null, [8.5, 17.5], [8.5, 17.5], [8.5, 17.5], [8.5, 17.5], [9, 17], null],
      verhaal: "Een winkel waar je nog één schroef kunt kopen. Vertel wat je wilt maken, dan zoeken we samen wat je nodig hebt.",
      mail: { lev1: "Bouwbeslag Groothandel Midden", lev2: "Sleutelgroothandel Kuipers", klant: "Peter", vraag: "Hebben jullie nog scharnieren voor een oude kast? Ik kan zaterdag langskomen.", antwoord: "Hoi Peter, we hebben ze op voorraad. Neem het oude scharnier mee, dan zoeken we de juiste maat.", promo: "accuboormachines" } },
    lijstenmaker: { label: "Lijstenmaker", kleur: ["#232323", "#d2b25a", "#fafaf8"], tag: "Lijsten op maat voor foto's, posters en kunst.",
      knoppen: ["Afspraak maken", "Bel direct"],
      prijzen: [["Lijst op maat", 39, "vanaf"], ["Passe-partout snijden", 12.5, "vanaf"], ["Museumglas", 25, "meerprijs vanaf"], ["Doek opspannen", 29, "vanaf"]],
      uren: [null, [10, 17.5], [10, 17.5], [10, 17.5], [10, 17.5], [10, 17], null],
      verhaal: "Elk werk verdient de juiste lijst. Kom langs met je foto of schilderij, dan kiezen we samen.",
      mail: { lev1: "Lijstprofielen Groothandel", lev2: "Glashandel Kuipers", klant: "Noor", vraag: "Kunnen jullie een poster van 50 x 70 inlijsten met museumglas?", antwoord: "Hoi Noor, dat kan. Kom gerust langs om samen een lijst uit te kiezen.", promo: "passe-partoutkarton" } },
    anders: { label: "Iets anders", kleur: ["#164a8a", "#ffd166", "#f3f6fa"], tag: "Vakwerk uit Utrecht. Kom langs of bel even.",
      knoppen: ["Neem contact op", "Bel direct"],
      prijzen: [["Eerste advies", 0, "gratis"], ["Reparatie", 25, "vanaf"], ["Spoedservice", 15, "meerprijs"], ["Ophalen en bezorgen", 7.5]],
      uren: [[9, 17.5], [9, 17.5], [9, 17.5], [9, 17.5], [9, 17.5], [10, 16], null],
      verhaal: "Hier vertel je wie je bent en wat je zaak bijzonder maakt. Dat schrijf ik graag samen met je.",
      mail: { lev1: "Groothandel Midden", lev2: "Leverancier Kuipers", klant: "Sanne", vraag: "Kunnen jullie mij volgende week helpen? Wat kost dat ongeveer?", antwoord: "Hoi Sanne, dat kan. Ik bel je morgen even om het door te nemen.", promo: "kantoorartikelen" } }
  };
  var VAK_IDS = Object.keys(VAKKEN);

  /* ---------------- Staat ---------------- */
  var qs = new URLSearchParams(location.search);
  var state = {
    naam: (qs.get("zaak") || "").trim().slice(0, 40),
    vak: VAK_IDS.indexOf(qs.get("vak")) >= 0 ? qs.get("vak") : "kapper",
    device: "phone"
  };

  /* ---------------- Voorbeeldsite ---------------- */
  var mock = $("#mock"), device = $("#device"), screen = $("#device-screen"), naamInput = $("#zaaknaam");
  var zoomOk = window.CSS && CSS.supports && CSS.supports("zoom", "0.5");

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
    if (p[2] === "gratis") return "gratis";
    return (p[2] ? p[2] + " " : "") + euro(p[1]);
  }
  function signSize(naam) {
    var n = naam.length, breed = state.device === "laptop";
    if (breed) return n > 30 ? 24 : n > 22 ? 27 : 30;
    return n > 28 ? 16 : n > 20 ? 18 : 21;
  }
  function renderMock(swing) {
    var v = VAKKEN[state.vak], naam = state.naam || "Jouw zaak", info = openInfo(v.uren), vandaag = (new Date().getDay() + 6) % 7;
    mock.className = "ms" + (state.device === "laptop" ? " ms--breed" : "");
    mock.style.setProperty("--ms-acc", v.kleur[0]);
    mock.style.setProperty("--ms-acc-2", v.kleur[1]);
    mock.style.setProperty("--ms-bg", v.kleur[2]);
    var prijzen = v.prijzen.map(function (p) {
      return '<li><span>' + esc(p[0]) + '</span><span class="lead-dots"></span><span class="price">' + esc(prijsTekst(p)) + "</span></li>";
    }).join("");
    var uren = v.uren.map(function (u, i) {
      var cls = (i === vandaag ? "is-today" : "") + (u ? "" : " is-dicht");
      return '<li class="' + cls.trim() + '"><span>' + DAGEN[i] + '</span><span class="lead-dots"></span><span class="price">' + (u ? tijd(u[0]) + "–" + tijd(u[1]) : "gesloten") + "</span></li>";
    }).join("");
    mock.innerHTML =
      '<header class="ms-top"><span class="ms-sign' + (swing && !reduce ? " swing" : "") + '"><span class="ms-sign-name">' + esc(naam) + "</span></span>" +
      '<nav class="ms-nav" aria-hidden="true"><span>Prijzen</span><span>Openingstijden</span><span>Route</span><span>Contact</span></nav>' +
      '<span class="ms-open' + (info.open ? "" : " is-dicht") + '"><i></i>' + esc(info.tekst) + "</span></header>" +
      '<div class="ms-luifel" aria-hidden="true"></div>' +
      '<section class="ms-hero"><div class="ms-art">' + icon(state.vak) + "</div><div>" +
      '<p class="ms-tag">' + esc(v.tag) + '</p><div class="ms-ctas"><span class="ms-btn">' + esc(v.knoppen[0]) + '</span><span class="ms-btn ms-btn--ghost">' + esc(v.knoppen[1]) + "</span></div></div></section>" +
      '<div class="ms-info">' +
      '<section class="ms-sec"><h3>Prijzen</h3><ul class="ms-list">' + prijzen + '</ul><p class="ms-fine">Voorbeeldprijzen</p></section>' +
      '<section class="ms-sec"><h3>Openingstijden</h3><ul class="ms-list">' + uren + "</ul></section>" +
      '<section class="ms-sec"><h3>Zo vind je ons</h3><div class="ms-map">' + KAART + '</div><p class="ms-fine">Utrecht</p></section>' +
      '<section class="ms-sec ms-story"><h3>Over ons</h3><p>' + esc(v.verhaal) + "</p></section>" +
      "</div>" +
      '<footer class="ms-foot">© ' + new Date().getFullYear() + " " + esc(naam) + "</footer>";
    var sign = $(".ms-sign", mock);
    sign.style.fontSize = signSize(naam) + "px";
    fitZoom();
  }
  function fitZoom() {
    var base = state.device === "laptop" ? 1280 : 390;
    var w = screen.clientWidth;
    if (!w) return;
    var z = w / base;
    if (zoomOk) { mock.style.zoom = z; mock.style.transform = ""; return; }
    mock.style.transformOrigin = "top left";
    mock.style.transform = "scale(" + z + ")";
    mock.style.marginBottom = (mock.offsetHeight * (z - 1)) + "px";
  }
  function updateName() {
    var nameEl = $(".ms-sign-name", mock), foot = $(".ms-foot", mock), naam = state.naam || "Jouw zaak";
    if (!nameEl) return renderMock(false);
    nameEl.textContent = naam;
    $(".ms-sign", mock).style.fontSize = signSize(naam) + "px";
    if (foot) foot.textContent = "© " + new Date().getFullYear() + " " + naam;
  }

  // Vak-keuze
  var chips = $("#vakken");
  chips.innerHTML = VAK_IDS.map(function (id) {
    return '<label class="chip"><input type="radio" name="vak" value="' + id + '"' + (id === state.vak ? " checked" : "") + "><span>" + icon(id) + esc(VAKKEN[id].label) + "</span></label>";
  }).join("");
  chips.addEventListener("change", function (e) {
    if (e.target.name !== "vak") return;
    state.vak = e.target.value;
    renderMock(true);
    resetDemo();
  });
  naamInput.value = state.naam;
  var zaakDirty = false;
  naamInput.addEventListener("input", function () {
    state.naam = naamInput.value.replace(/\s+/g, " ").trimStart().slice(0, 40);
    updateName();
    var cz = $("#c-zaak");
    if (cz && !zaakDirty) cz.value = state.naam.trim();
  });
  $("#maker").addEventListener("submit", function (e) {
    e.preventDefault();
    naamInput.blur();
    if (window.innerWidth <= 980) $(".stage").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  });

  // Telefoon of computer
  $$(".toggle-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      if (state.device === b.dataset.device) return;
      state.device = b.dataset.device;
      $$(".toggle-btn").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      device.dataset.device = state.device;
      device.classList.remove("is-switching"); void device.offsetWidth; device.classList.add("is-switching");
      screen.scrollTop = 0;
      renderMock(false);
    });
  });
  var rt;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(fitZoom, 80); });

  // Deel-link: handig om een zaak een eigen voorbeeld te sturen
  var deel = $("#deel-link");
  if (voorvertoning) deel.hidden = true;
  deel.addEventListener("click", function () {
    var p = new URLSearchParams();
    if (state.naam.trim()) p.set("zaak", state.naam.trim());
    p.set("vak", state.vak);
    var link = location.origin + location.pathname + "?" + p.toString() + "#voorbeeld";
    var klaar = function (ok) {
      deel.textContent = ok ? "Link gekopieerd" : link;
      setTimeout(function () { deel.textContent = "Kopieer link naar dit voorbeeld"; }, ok ? 2200 : 8000);
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(link).then(function () { klaar(true); }, function () { klaar(false); });
    else klaar(false);
  });

  /* ---------------- Dashboard-demo ---------------- */
  var mailsEl = $("#mails"), bon = $("#bon"), todo = $("#todo"), runBtn = $("#demo-run");
  var demo = { mails: [], done: {}, sel: null, running: false, timers: [], kpi: { aandacht: 0, betalen: 0, tegen: 0 } };
  var datum = new Intl.DateTimeFormat("nl-NL", { weekday: "short", day: "numeric", month: "long" });
  function dag(off) { var d = new Date(); d.setDate(d.getDate() + off); return datum.format(d); }

  function maakMails(vak) {
    var t = VAKKEN[vak].mail;
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
      var tag = klaar ? '<span class="pill pill--soort">' + esc(m.soort) + '</span><span class="pill pill--' + m.status[0] + '">' + esc(m.status[1]) + "</span>" : "Nog niet gelezen";
      return '<li><button type="button" class="mail' + (klaar ? "" : " is-new") + '" data-id="' + m.id + '" aria-pressed="' + (demo.sel === m.id) + '">' +
        '<span class="mail-from">' + esc(m.van) + '</span><span class="mail-time">' + m.tijd + '</span><span class="mail-subj">' + esc(m.onderwerp) + "</span>" +
        '<span class="mail-tag">' + tag + "</span></button></li>";
    }).join("");
  }
  var IC = { goed: "✓", stop: "!", let: "!", info: "i", grijs: "–" };
  function renderBon(m, pop) {
    if (!m) { bon.innerHTML = '<p class="bon-leeg">Druk op <strong>Lees mijn mail</strong>. Daarna zie je hier per bericht wat het dashboard eruit haalde en wat het controleerde.</p>'; return; }
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
      : '<li class="todo-leeg">Nog niets. Het dashboard zet hier wat jij vandaag moet doen.</li>';
    demo.mails.forEach(function (m) { m.justDone = false; });
  }
  function verwerk(m) {
    demo.done[m.id] = true; m.justDone = true;
    Object.keys(m.kpi).forEach(function (k) { setKpi(k, demo.kpi[k] + m.kpi[k]); });
    demo.sel = m.id;
    renderMails(); renderBon(m, true); renderTodo();
  }
  function lees(m, cb) {
    var btn = $('.mail[data-id="' + m.id + '"]', mailsEl);
    if (btn) btn.classList.add("is-reading");
    demo.timers.push(setTimeout(function () { verwerk(m); if (cb) cb(); }, reduce ? 0 : 750));
  }
  function runAll() {
    if (demo.running) return;
    if (demo.mails.every(function (m) { return demo.done[m.id]; })) { resetDemo(); }
    demo.running = true; runBtn.disabled = true; runBtn.textContent = "Bezig met lezen";
    var rest = demo.mails.filter(function (m) { return !demo.done[m.id]; });
    (function next(i) {
      if (i >= rest.length) {
        demo.running = false; runBtn.disabled = false; runBtn.textContent = "Opnieuw";
        var m2 = demo.mails[1]; demo.sel = m2.id; renderMails(); renderBon(m2, false);
        return;
      }
      lees(rest[i], function () { demo.timers.push(setTimeout(function () { next(i + 1); }, reduce ? 0 : 260)); });
    })(0);
  }
  function resetDemo() {
    demo.timers.forEach(clearTimeout); demo.timers = [];
    demo.mails = maakMails(state.vak); demo.done = {}; demo.sel = null; demo.running = false;
    ["aandacht", "betalen", "tegen"].forEach(function (k) { demo.kpi[k] = 0; $('[data-kpi="' + k + '"]').textContent = k === "aandacht" ? "0" : euro(0); });
    runBtn.disabled = false; runBtn.textContent = "Lees mijn mail";
    renderMails(); renderBon(null); renderTodo();
  }
  runBtn.addEventListener("click", runAll);
  mailsEl.addEventListener("click", function (e) {
    var b = e.target.closest(".mail"); if (!b || demo.running) return;
    var m = demo.mails.filter(function (x) { return x.id === b.dataset.id; })[0];
    if (!demo.done[m.id]) { demo.running = true; lees(m, function () { demo.running = false; if (demo.mails.every(function (x) { return demo.done[x.id]; })) runBtn.textContent = "Opnieuw"; }); return; }
    demo.sel = m.id; renderMails(); renderBon(m, false);
  });

  /* ---------------- Websitecheck ---------------- */
  var checkForm = $("#check-form"), checkInput = $("#check-url"), checkBtn = $("#check-btn"), checkRes = $("#check-result");
  var laatsteCheck = "";
  var GROEP_IC = { goed: ["goed", "✓"], let: ["let", "!"], slecht: ["stop", "✕"] };
  function rapport(r) {
    var aan = Math.round(r.score / 10), kleur = r.score >= 80 ? "var(--groen)" : r.score >= 55 ? "#c47a00" : "var(--rood)";
    var segs = ""; for (var i = 0; i < 10; i++) segs += "<i" + (i < aan ? ' class="aan"' : "") + "></i>";
    var groepen = r.groepen.filter(function (g) { return g.items.length; }).map(function (g) {
      return '<div class="groep"><h4>' + esc(g.titel) + "</h4><ul>" + g.items.map(function (it) {
        var ic = GROEP_IC[it.status] || ["info", "i"];
        return '<li><span class="ic ic--' + ic[0] + '" aria-hidden="true">' + ic[1] + "</span><span>" + esc(it.label) + (it.uitleg ? "<small>" + esc(it.uitleg) + "</small>" : "") + "</span></li>";
      }).join("") + "</ul></div>";
    }).join("");
    var actie = r.score >= 80 ? "Je site staat er goed voor. Wil je er een dashboard bij, of een frisse look?" : "Wil je dat ik dit oplos? Ik maak er graag een voorstel voor, met een vaste prijs.";
    checkRes.innerHTML = '<div class="rapport">' +
      '<div class="rapport-kop"><h3>' + esc(r.host) + '</h3><p class="rapport-oordeel">' + esc(r.oordeel) + " Score: <strong>" + r.score + "</strong> van de 100.</p>" +
      '<div class="meter meter--' + (r.score >= 80 ? "goed" : r.score >= 55 ? "let" : "stop") + '" role="img" aria-label="Score ' + r.score + ' van de 100">' + segs + "</div>" +
      '<div class="meter-label"><span>0</span><span>100</span></div></div>' +
      '<div class="rapport-groepen">' + groepen + "</div>" +
      '<div class="rapport-actie"><p>' + esc(actie) + '</p><button type="button" class="btn" id="check-voorstel">Vraag een voorstel</button></div></div>';
    $(".meter", checkRes).style.setProperty("--meter", kleur);
    $("#check-voorstel").addEventListener("click", function () {
      laatsteCheck = r.url;
      var ver = $('input[name="wensen"][value="Website vernieuwen"]'); if (ver) ver.checked = true;
      var ber = $("#c-bericht"); if (ber && !ber.value) ber.value = "Ik heb " + r.host + " gecheckt (score " + r.score + ").";
      $("#contact").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      setTimeout(function () { $("#c-naam").focus({ preventScroll: true }); }, reduce ? 0 : 500);
    });
  }
  checkForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var url = checkInput.value.trim();
    if (!url) { checkRes.innerHTML = '<div class="check-fout">Vul het adres van je website in, bijvoorbeeld jouwzaak.nl.</div>'; checkInput.focus(); return; }
    if (voorvertoning) { checkRes.innerHTML = '<div class="check-fout">In deze voorvertoning werkt de websitecheck nog niet. Op de live site haalt hij je pagina echt op.</div>'; return; }
    var host = url.replace(/^https?:\/\//i, "").split("/")[0];
    checkRes.innerHTML = '<div class="check-laden"><span class="spinner" aria-hidden="true"></span><span>Ik haal ' + esc(host) + " op en kijk hem na…</span></div>";
    checkBtn.disabled = true;
    fetch("/api/check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: url }) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw j; return j; }); })
      .then(function (j) { laatsteCheck = j.url || url; rapport(j); })
      .catch(function (err) {
        var msg = (err && err.message) || "De check lukte niet. Is je internet in orde?";
        checkRes.innerHTML = '<div class="check-fout">' + esc(msg) + "</div>";
      })
      .then(function () { checkBtn.disabled = false; });
  });

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
  var form = $("#contact-form"), status = $("#c-status"), verstuur = $("#c-verstuur"), geopend = Date.now();
  var czaak = $("#c-zaak");
  czaak.addEventListener("input", function () { zaakDirty = true; });
  if (state.naam && !czaak.value) czaak.value = state.naam;
  function fout(veld, msg) {
    $$(".field", form).forEach(function (f) { f.removeAttribute("aria-invalid"); });
    if (veld) { var el = form.elements[veld]; if (el && el.setAttribute) { el.setAttribute("aria-invalid", "true"); el.focus(); } }
    status.className = "form-status is-fout"; status.textContent = msg;
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var naam = form.elements.naam.value.trim(), contact = form.elements.contact.value.trim();
    if (!naam) return fout("naam", "Vul je naam in.");
    var cijfers = contact.replace(/\D/g, "");
    if (!(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact) || (/^[\d\s()+\-./]+$/.test(contact) && cijfers.length >= 9))) return fout("contact", "Vul een telefoonnummer of e-mailadres in waarop ik je kan bereiken.");
    var data = {
      naam: naam, zaak: form.elements.zaak.value.trim(), contact: contact, bericht: form.elements.bericht.value.trim(),
      wensen: $$('input[name="wensen"]:checked', form).map(function (x) { return x.value; }),
      vak: state.vak, voorbeeld: state.naam.trim(), check_url: laatsteCheck, fax: form.elements.fax.value, t: Date.now() - geopend
    };
    if (voorvertoning) { status.className = "form-status is-fout"; status.textContent = "Dit is een voorvertoning: er wordt nog niets verstuurd. Op de live site komt je bericht wel aan."; return; }
    verstuur.disabled = true; verstuur.textContent = "Versturen…"; status.textContent = ""; status.className = "form-status";
    fetch("/api/aanvraag", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw j; return j; }); })
      .then(function () {
        form.innerHTML = '<div class="bedankt" tabindex="-1"><h3>Dank je, ' + esc(naam.split(" ")[0]) + ".</h3><p>Je bericht is binnen. Ik neem zo snel mogelijk contact met je op.</p></div>";
        $(".bedankt", form).focus();
      })
      .catch(function (err) {
        verstuur.disabled = false; verstuur.textContent = "Stuur bericht";
        fout(err && err.field, (err && err.message) || "Versturen lukte niet. Probeer het nog eens.");
      });
  });

  /* ---------------- Start ---------------- */
  var jaar = $("#jaar"); if (jaar) jaar.textContent = String(new Date().getFullYear());
  renderMock(true);
  resetDemo();
  setInterval(function () { var o = $(".ms-open", mock); if (o) { var info = openInfo(VAKKEN[state.vak].uren); o.lastChild.textContent = info.tekst; o.classList.toggle("is-dicht", !info.open); } }, 60000);
})();

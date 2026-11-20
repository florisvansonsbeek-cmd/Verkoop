/* Van Sonsbeek: de plattegrond op /voor/... (de slider-code is er nog voor het geval hij terugkomt),
   met per punt een voorbeeldscherm, aantikken wat je wilt en een titelblok dat het pakket uitrekent.
   Ook: de kopbalk die meekleurt boven de groene tafel en de zwevende app-knop. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var T = function (k, v) { return window.T ? window.T(k, v) : k; };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function tt(o) { var l = window.TAAL ? window.TAAL() : "nl"; return (o && (o[l] || o.nl)) || ""; }
  function hoofdletter(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  var PL = window.PLANNEN || [], VB = window.VOORBEELDEN || {};
  var vast = document.body.getAttribute("data-plan");          // op /voor/... staat één bedrijf vast
  var planIdx = 0, openN = 1, keuzes = {};
  if (vast) PL.forEach(function (p, i) { if (p.id === vast) planIdx = i; });

  var tabsEl = $("#plan-tabs"), imgEl = $("#plan-img"), lijnenEl = $("#plan-lijnen"), labelsEl = $("#plan-labels"), lijstEl = $("#plan-lijst"), vlakEl = $(".plan-vlak");

  // de lijntjes tekenen zich pas als de tekening in beeld komt, zodat je het ziet gebeuren
  var planGezien = !("IntersectionObserver" in window), planWacht = false;
  if (!planGezien && vlakEl) {
    var planIo = new IntersectionObserver(function (es) {
      if (!es.some(function (e) { return e.isIntersecting; })) return;
      planGezien = true; planIo.disconnect();
      if (planWacht) vlakEl.classList.add("is-geladen");
    }, { threshold: 0.2 });
    planIo.observe(vlakEl);
  }

  /* ---------- voorbeeldschermen (de inhoud staat in voorbeelden.js) ---------- */
  function st(s) { return '<i class="vb-st vb-st--' + esc(s) + '" aria-hidden="true"></i>'; }
  function kop(a, b) { return '<div class="vb-kop"><b>' + esc(a) + "</b>" + (b ? "<span>" + esc(b) + "</span>" : "") + "</div>"; }
  function knop(t) { return t ? '<span class="vb-knop">' + esc(t) + "</span>" : ""; }
  function notitie(t) { return t ? '<p class="vb-notitie">' + esc(t) + "</p>" : ""; }
  function foto(klein) { return '<div class="vb-foto' + (klein ? " vb-foto--klein" : "") + '"><span>foto.jpg</span></div>'; }
  var STERREN = '<p class="vb-sterren" aria-label="5 sterren">★★★★★</p>';
  var R = {
    site: function (v, z) {
      return '<div class="vb-tel"><div class="vb-site-top"><b>' + esc(z) + '</b><i aria-hidden="true"></i></div><div class="vb-site-held"><p>' + esc(v.kop) + "</p></div>" +
        '<ul class="vb-site-regels">' + v.regels.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("") + "</ul>" + knop(v.knop) + "</div>";
    },
    bericht: function (v, z) {
      var ini = z.split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w.charAt(0); }).join("").toUpperCase();
      return '<div class="vb-chat-kop"><span class="vb-avatar">' + esc(ini) + "</span><b>" + esc(z) + '</b></div><div class="vb-chat">' +
        (v.fotos ? '<div class="vb-fotos"><i></i><i></i><i></i></div>' : "") +
        '<p class="vb-bubbel">' + esc(v.tekst) + "<time>9.12</time></p>" + (v.knop ? '<span class="vb-chip">' + esc(v.knop) + "</span>" : "") + "</div>";
    },
    boeken: function (v, z) {
      return kop(z, "Afspraak maken") + '<div class="vb-diensten">' + v.diensten.map(function (d, i) { return '<span class="' + (i === 0 ? "is-aan" : "") + '">' + esc(d) + "</span>"; }).join("") + "</div>" +
        '<p class="vb-dag">' + esc(v.dag) + '</p><div class="vb-tijden">' + v.tijden.map(function (t, i) { return '<span class="' + (i === v.gekozen ? "is-aan" : "") + '">' + esc(t) + "</span>"; }).join("") + "</div>" + knop(v.knop);
    },
    aanvraag: function (v, z) {
      return kop(z, v.titel) + (v.foto ? foto() : "") + '<dl class="vb-velden">' + v.velden.map(function (f) { return "<div><dt>" + esc(f[0]) + "</dt><dd>" + esc(f[1]) + "</dd></div>"; }).join("") + "</dl>" +
        (v.uitkomst ? '<p class="vb-uitkomst">' + esc(v.uitkomst) + "</p>" : "") + knop(v.knop);
    },
    overzicht: function (v, z) {
      return kop(v.titel, z) + '<div class="vb-tegels">' + v.tegels.map(function (t) { return "<div><span>" + esc(t[0]) + "</span><b>" + esc(t[1]) + "</b></div>"; }).join("") + "</div>" +
        (v.melding ? '<p class="vb-melding">' + esc(v.melding) + "</p>" : "");
    },
    lijst: function (v, z) {
      return kop(v.titel, z) + '<ul class="vb-rijen">' + v.items.map(function (r) { return "<li>" + st(r[2]) + "<span>" + esc(r[0]) + "</span><small>" + esc(r[1]) + "</small></li>"; }).join("") + "</ul>" + notitie(v.notitie);
    },
    factuur: function (v) {
      return kop("Factuur", v.van) + '<p class="vb-bedrag">' + esc(v.bedrag) + '</p><ul class="vb-checks">' + v.checks.map(function (c) { return "<li>" + st(c[0]) + "<span>" + esc(c[1]) + "</span></li>"; }).join("") + "</ul>";
    },
    planning: function (v, z) {
      return kop(v.titel, z) + '<ul class="vb-plan">' + v.rijen.map(function (r) { return "<li><time>" + esc(r[0]) + '</time><span class="vb-wie">' + esc(r[1]) + "</span><span>" + esc(r[2]) + "</span></li>"; }).join("") + "</ul>" +
        (v.voorstel ? '<p class="vb-voorstel">' + esc(v.voorstel) + "</p>" : "");
    },
    review: function (v, z) {
      return kop("Nieuwe review", z) + STERREN + "<blockquote>" + esc(v.tekst) + '</blockquote><p class="vb-naam">' + esc(v.naam) + "</p>" +
        (v.concept ? '<p class="vb-concept"><span>Concept-antwoord</span>' + esc(v.concept) + "</p>" : "");
    },
    offerte: function (v, z) {
      return kop(v.titel, z) + (v.foto ? foto(true) : "") + '<dl class="vb-regels">' + v.regels.map(function (r) { return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("") + "</dl>" +
        (v.totaal ? '<p class="vb-totaal"><span>Totaal</span><b>' + esc(v.totaal) + "</b></p>" : "") + notitie(v.notitie) + knop(v.knop);
    },
    voorna: function (v) {
      return '<div class="vb-voorna"><figure class="vb-voor"><span>Voor</span></figure><figure class="vb-na"><span>Na</span></figure></div>' +
        '<p class="vb-voorna-titel"><b>' + esc(v.titel) + "</b>" + esc(v.tekst) + "</p>" + STERREN + "<blockquote>" + esc(v.review) + "</blockquote>";
    },
    zoek: function (v) {
      return '<div class="vb-zoekbalk"><svg aria-hidden="true" viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>' + esc(v.zoek) + "</div>" +
        '<div class="vb-resultaat"><span class="vb-url">' + esc(v.adres) + "</span><b>" + esc(v.titel) + "</b><p>" + esc(v.tekst) + "</p></div>";
    },
    mail: function (v, z) {
      return kop(v.titel, z) + '<ul class="vb-inbox">' + v.items.map(function (m) { return "<li><b>" + esc(m[0]) + "</b><span>" + esc(m[1]) + '</span><em class="vb-tag">' + esc(m[2]) + "</em></li>"; }).join("") + "</ul>";
    },
  };
  function voorbeeld(vb, zaak) {
    if (!vb || !R[vb.type]) return "";
    return '<div class="vb vb--' + vb.type + '">' + R[vb.type](vb, zaak || "") + "</div>";
  }

  /* ---------- tekening ---------- */
  function info(n) { var v = VB[PL[planIdx].id]; return (v && v.punten[n - 1]) || { wie: "k", pk: 1 }; }
  function indeling(punten) {
    var items = punten.map(function (p, i) { return { p: p, n: i + 1, side: p.x < 700 ? "l" : "r" }; });
    var tel = function (s) { return items.filter(function (it) { return it.side === s; }).length; };
    while (Math.abs(tel("l") - tel("r")) > 1) {               // kolommen in balans
      var groot = tel("l") > tel("r") ? "l" : "r";
      var kand = items.filter(function (it) { return it.side === groot; }).sort(function (a, b) { return Math.abs(a.p.x - 700) - Math.abs(b.p.x - 700); })[0];
      kand.side = groot === "l" ? "r" : "l";
    }
    ["l", "r"].forEach(function (s) {
      var c = items.filter(function (it) { return it.side === s; }).sort(function (a, b) { return a.p.y - b.p.y; });
      var gap = 104, top = s === "r" && !vast ? 140 : 84, bodem = 832;   // rechtsboven staan de pijltjes
      c.forEach(function (it, i) { it.ly = Math.max(Math.min(Math.max(it.p.y, top), bodem), i ? c[i - 1].ly + gap : top); });
      for (var i = c.length - 1; i >= 0; i--) { var max = i === c.length - 1 ? bodem : c[i + 1].ly - gap; if (c[i].ly > max) c[i].ly = max; }
    });
    return items;
  }
  function renderTabs() {
    if (!tabsEl) return;
    tabsEl.innerHTML = PL.map(function (pl, i) {
      return '<button type="button" role="tab" id="plan-tab-' + i + '" aria-controls="plan-paneel" aria-selected="' + (i === planIdx) + '" tabindex="' + (i === planIdx ? 0 : -1) + '">' + esc(tt(pl.naam)) + "</button>";
    }).join("");
  }
  var VINK = '<svg aria-hidden="true" viewBox="0 0 16 16"><path class="vk-plus" d="M8 3.5v9M3.5 8h9"/><path class="vk-vink" d="M3.5 8.5l3 3 6-7"/></svg>';
  var PIJL = '<svg class="pk-pijl" aria-hidden="true" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4"/></svg>';
  function renderLijst() {
    var pl = PL[planIdx], keuze = keuzes[pl.id] || (keuzes[pl.id] = {}), zaak = (VB[pl.id] || {}).zaak;
    lijstEl.innerHTML = pl.punten.map(function (p, k) {
      var n = k + 1, i = info(n), open = n === openN, gek = !!keuze[n], pk = i.pk || 1;
      return '<li class="pk' + (open ? " is-open" : "") + (gek ? " is-gekozen" : "") + '" data-n="' + n + '" data-wie="' + i.wie + '">' +
        '<div class="pk-rij"><button type="button" class="pk-kop" aria-expanded="' + open + '" aria-controls="pk-vb-' + n + '"><span class="nr">' + n + "</span>" +
        '<span class="pk-tekst"><b>' + esc(tt(p.t)) + "</b></span>" + PIJL + "</button>" +
        '<button type="button" class="pk-kies" aria-pressed="' + gek + '" aria-label="' + esc(T("kiesLabel", { t: tt(p.t) })) + '">' + VINK + "<span>" + esc(gek ? T("gekozen") : T("kies")) + "</span></button></div>" +
        '<div class="pk-vb" id="pk-vb-' + n + '"' + (open ? "" : " hidden") + '>' +
        '<div class="pk-uitleg"><p>' + esc(tt(p.u)) + '</p><p class="pk-meta"><span class="pk-wie">' + esc(T(i.wie === "k" ? "wieK" : "wieJ")) + "</span><span>" +
        esc(T("metaPakket")) + " <b>" + esc(T("pk" + pk)) + "</b>, " + esc(T("vanafPrijs", { p: T("pp" + pk) })) + "</span></p></div>" +
        '<div class="pk-scherm"><p class="pk-vb-kop">' + esc(T("vbKop")) + "</p>" + voorbeeld(i.vb, zaak) + "</div></div></li>";
    }).join("");
    var sl = $("#plan-sleutel");
    if (sl) sl.innerHTML = '<span class="sl sl--k">' + esc(T("wieK")) + '</span><span class="sl sl--j">' + esc(T("wieJlang")) + "</span>";
  }
  function markeer() {
    var keuze = keuzes[PL[planIdx].id] || {};
    $$("[data-n]", $("#plan-paneel")).forEach(function (el) {
      var n = Number(el.getAttribute("data-n"));
      el.classList.toggle("is-open", n === openN);
      el.classList.toggle("is-gekozen", !!keuze[n]);
    });
  }
  function werkKeuzeBij() {
    var pl = PL[planIdx], keuze = keuzes[pl.id] || {};
    var gekozen = Object.keys(keuze).filter(function (k) { return keuze[k]; }).map(Number).sort(function (a, b) { return a - b; });
    var pk = gekozen.reduce(function (m, n) { return Math.max(m, info(n).pk || 1); }, 0);
    var zet = function (id, t) { var el = $(id); if (el) el.textContent = t; };
    zet("#tb-keuze", gekozen.length === 0 ? T("keuzeNiets") : gekozen.length === 1 ? T("keuzeEen") : T("keuzeMeer", { n: gekozen.length }));
    zet("#tb-pakket", pk ? T("pk" + pk) : "–");
    zet("#tb-vanaf", pk ? T("pp" + pk) : "–");
    zet("#keuze-hint", gekozen.length ? T("keuzeTip") : T("keuzeHint"));
    var tb = $(".titelblok"); if (tb) tb.classList.toggle("heeft-keuze", gekozen.length > 0);
    return { gekozen: gekozen, pk: pk };
  }
  function toonPlan(i, focus) {
    if (!PL.length || !imgEl) return;
    planIdx = (i + PL.length) % PL.length;
    openN = 1;
    var pl = PL[planIdx];
    if (tabsEl) {
      $$('[role="tab"]', tabsEl).forEach(function (b, k) { var on = k === planIdx; b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; if (on) { if (focus) b.focus({ preventScroll: true }); tabsEl.scrollTo({ left: b.offsetLeft - tabsEl.clientWidth / 2 + b.clientWidth / 2, behavior: reduce ? "auto" : "smooth" }); } });
      $("#plan-paneel").setAttribute("aria-labelledby", "plan-tab-" + planIdx);
    }
    $("#plan-titel").textContent = tt(pl.titel);
    $("#plan-intro").textContent = tt(pl.intro);
    var ond = $("#plan-onderschrift"); if (ond) ond.textContent = T("onderschrift");
    var meer = $("#plan-meer");
    if (meer && pl.slug) { meer.href = "/voor/" + pl.slug; meer.textContent = T("brMeer", { groep: tt(pl.groep) }); }
    var tbP = $("#tb-project"), tbB = $("#tb-blad");
    if (tbP) tbP.textContent = tt(pl.titel);
    if (tbB) tbB.textContent = T("blad", { n: planIdx + 1, m: PL.length });
    // de tekening eerst laden; daarna tekenen de lijntjes zich
    var src = "/img/plannen/" + pl.id + ".svg", klaar = function () { if (planGezien) vlakEl.classList.add("is-geladen"); else planWacht = true; };
    vlakEl.classList.remove("is-geladen");
    if (imgEl.getAttribute("src") === src && imgEl.complete) requestAnimationFrame(klaar);
    else { imgEl.onload = klaar; imgEl.onerror = klaar; imgEl.src = src; }
    clearTimeout(toonPlan.t); toonPlan.t = setTimeout(klaar, 1500);
    imgEl.alt = tt(pl.titel);
    // labels staan op een liggend lijntje, zoals op een bouwtekening; groen ziet je klant, messing is voor jou
    var items = indeling(pl.punten), svg = "";
    labelsEl.innerHTML = "";
    items.forEach(function (it) {
      var links = it.side === "l", knik = links ? 306 : 1094, w = info(it.n).wie;
      svg += '<path class="pl-lijn n' + it.n + '" data-n="' + it.n + '" pathLength="1" d="M' + it.p.x + " " + it.p.y + "L" + knik + " " + it.ly + '"/>';
      var lab = document.createElement("div");
      lab.className = "plan-label plan-label--" + it.side + " plan-label--" + w + " n" + it.n;
      lab.setAttribute("data-n", it.n);
      lab.innerHTML = '<span class="nr">' + it.n + "</span><span>" + esc(tt(it.p.t)) + "</span>";
      lab.style[links ? "right" : "left"] = ((links ? 1400 - knik : knik) / 14) + "%";   // het label begint waar het lijntje knikt
      lab.style.bottom = ((900 - it.ly) / 9) + "%";
      labelsEl.appendChild(lab);
    });
    items.forEach(function (it) {
      var x = it.p.x, y = it.p.y;
      svg += '<g class="pl-pin pl-pin--' + info(it.n).wie + " n" + it.n + '" data-n="' + it.n + '"><circle class="pl-halo" cx="' + x + '" cy="' + y + '" r="21"/><circle class="pl-ring" cx="' + x + '" cy="' + y + '" r="21"/><circle class="pl-kern" cx="' + x + '" cy="' + y + '" r="14"/><text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle">' + it.n + "</text></g>";
    });
    lijnenEl.innerHTML = svg;
    renderLijst();
    markeer();
    werkKeuzeBij();
    if (!vast && !reduce) { vlakEl.classList.remove("wissel"); void vlakEl.offsetWidth; vlakEl.classList.add("wissel"); }
    if (!vast) { var volgend = PL[(planIdx + 1) % PL.length]; (new Image()).src = "/img/plannen/" + volgend.id + ".svg"; }
  }

  /* ---------- openen, aanwijzen en kiezen ---------- */
  function openPunt(n, scrollen) {
    openN = openN === n && !scrollen ? 0 : n;
    $$(".pk", lijstEl).forEach(function (li) {
      var on = Number(li.getAttribute("data-n")) === openN;
      li.querySelector(".pk-kop").setAttribute("aria-expanded", String(on));
      li.querySelector(".pk-vb").hidden = !on;
    });
    markeer();
    var li = $('.pk[data-n="' + n + '"]', lijstEl);
    if (scrollen && li) li.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }
  function kies(n) {
    var keuze = keuzes[PL[planIdx].id] || (keuzes[PL[planIdx].id] = {});
    keuze[n] = !keuze[n];
    var li = $('.pk[data-n="' + n + '"]', lijstEl), b = li && li.querySelector(".pk-kies");
    if (b) { b.setAttribute("aria-pressed", String(keuze[n])); b.querySelector("span").textContent = keuze[n] ? T("gekozen") : T("kies"); }
    markeer();
    werkKeuzeBij();
  }
  // wijs je een punt aan in de uitleg of op de tekening, dan licht het bijbehorende nummer op
  function licht(n) {
    $$("[data-n]", $("#plan-paneel")).forEach(function (el) { el.classList.toggle("is-aan", n != null && el.getAttribute("data-n") === String(n)); });
  }
  if (lijstEl) {
    lijstEl.addEventListener("click", function (e) {
      var li = e.target.closest(".pk"); if (!li) return;
      var n = Number(li.getAttribute("data-n"));
      if (e.target.closest(".pk-kies")) kies(n); else if (e.target.closest(".pk-kop")) openPunt(n, false);
    });
  }
  [lijstEl, labelsEl].forEach(function (el) {
    if (!el) return;
    el.addEventListener("mouseover", function (e) { var t = e.target.closest("[data-n]"); licht(t ? t.getAttribute("data-n") : null); });
    el.addEventListener("mouseleave", function () { licht(null); });
  });
  [lijnenEl, labelsEl].forEach(function (el) {
    if (!el) return;
    el.addEventListener("click", function (e) { var t = e.target.closest("[data-n]"); if (t) openPunt(Number(t.getAttribute("data-n")), true); });
  });

  /* ---------- je keuze meesturen naar het contactformulier ---------- */
  function vulFormulier(w) {
    var ta = $("#c-bericht"); if (!ta) return false;
    ta.value = w.bericht;
    var nw = $('input[name="wensen"][value="Nieuwe website"]'); if (nw) nw.checked = true;
    var db = $('input[name="wensen"][value="Dashboard mail en facturen"]'); if (db && w.dashboard) db.checked = true;
    var c = $("#contact"); if (c) c.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    setTimeout(function () { var nm = $("#c-naam"); if (nm) nm.focus({ preventScroll: true }); }, reduce ? 0 : 700);
    return true;
  }
  var keuzeKnop = $("#keuze-knop");
  if (keuzeKnop) keuzeKnop.addEventListener("click", function (e) {
    var pl = PL[planIdx], r = werkKeuzeBij();
    var namen = r.gekozen.map(function (n) { return tt(pl.punten[n - 1].t); });
    var w = { bericht: namen.length ? T("wensBericht", { groep: tt(pl.groep), lijst: namen.join(", ") }) : T("wensLeeg", { groep: tt(pl.groep) }), dashboard: r.pk === 3 };
    if ($("#contact-form")) { e.preventDefault(); vulFormulier(w); }
    else { try { sessionStorage.setItem("vs-wens", JSON.stringify(w)); } catch (x) { /* dan zonder meegegeven keuze */ } }
  });
  try {
    var bewaard = sessionStorage.getItem("vs-wens");
    if (bewaard && $("#contact-form")) { sessionStorage.removeItem("vs-wens"); vulFormulier(JSON.parse(bewaard)); }
  } catch (x) { /* geen opslag beschikbaar */ }

  if (tabsEl && PL.length) {
    renderTabs();
    tabsEl.addEventListener("click", function (e) { var b = e.target.closest('[role="tab"]'); if (b) toonPlan(Number(b.id.replace("plan-tab-", ""))); });
    tabsEl.addEventListener("keydown", function (e) {
      var d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (e.key === "Home") { e.preventDefault(); toonPlan(0, true); } else if (e.key === "End") { e.preventDefault(); toonPlan(PL.length - 1, true); }
      else if (d) { e.preventDefault(); toonPlan(planIdx + d, true); }
    });
    $("#plan-vorige").addEventListener("click", function () { toonPlan(planIdx - 1); });
    $("#plan-volgende").addEventListener("click", function () { toonPlan(planIdx + 1); });
    var sx = null, sy = null;
    vlakEl.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    vlakEl.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) toonPlan(planIdx + (dx < 0 ? 1 : -1));
    });
  }
  if (imgEl && PL.length) toonPlan(planIdx);

  // teksten die uit de gegevens per bedrijf komen: de kop op /voor/... en de lijst "Voor wie" in de voet
  function groepTeksten() {
    var pl = PL[planIdx];
    if (vast && pl) {
      var kopEl = $("#br-titel"), lead = $("#br-lead");
      if (kopEl) kopEl.textContent = T("brTitel", { groep: tt(pl.groep) });
      if (lead) lead.textContent = T("brLead", { groep: tt(pl.groep) });
      var kz = $("#br-koppel-zin"), kn = $("#br-koppel-namen");
      if (pl.koppel && kz) kz.textContent = tt(pl.koppel.t);
      if (pl.koppel && kn) kn.innerHTML = pl.koppel.namen.map(function (n) { return "<li>" + esc(typeof n === "string" ? n : tt(n)) + "</li>"; }).join("");
      document.title = T("brDocTitel", { groep: tt(pl.groep) });
      var md = $('meta[name="description"]'); if (md) md.setAttribute("content", tt(pl.intro));
    }
    $$("[data-groep]").forEach(function (a) {
      var p = PL.filter(function (x) { return x.id === a.getAttribute("data-groep"); })[0];
      if (p) a.textContent = hoofdletter(tt(p.groep));
    });
  }
  document.addEventListener("taal", function () {
    if (tabsEl && PL.length) renderTabs();
    if (imgEl && PL.length) { var o = openN; toonPlan(planIdx); if (o !== 1) openPunt(o, false); }
    groepTeksten();
  });

  /* ---------------- Kopbalk: donker zolang hij boven de tekentafel staat; app-knop pas na het begin ---------------- */
  var kopbalk = $(".top"), tafel = $("#intro-tafel"), zweef = $(".app-zweef"), contactEl = $("#contact") || $(".br-contact");
  if ((kopbalk && tafel) || zweef) {
    var tik = false;
    var kleur = function () {
      tik = false;
      if (kopbalk && tafel) kopbalk.classList.toggle("is-donker", tafel.getBoundingClientRect().bottom > kopbalk.offsetHeight / 2);
      if (zweef) {
        // niet over het contactblok heen: daar staat de app-knop al
        var c = contactEl && contactEl.getBoundingClientRect(), opContact = c && c.top < window.innerHeight - 80 && c.bottom > 0;
        zweef.classList.toggle("is-zichtbaar", window.scrollY > 520 && !opContact);
      }
    };
    window.addEventListener("scroll", function () { if (!tik) { tik = true; requestAnimationFrame(kleur); } }, { passive: true });
    window.addEventListener("resize", kleur);
    kleur();
  }
})();

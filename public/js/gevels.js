/* Van Sonsbeek: architectonische tekeningen voor de voorbeeldsites.
   Per vak een gevel (aanzicht, schaal 1:100) met de naam van de zaak erin, en een situatietekening voor de route.
   Lijndiktes: l1 omtrek, l2 aanzicht, l3 detail, l4 maatvoering. Vullingen: fw wit, fg glas, fa accent, fb tweede kleur,
   fd donker, fk boom, fp figuur, fz zacht. Alles in eenheden van 30 per meter; maaiveld op y = 440. */
(function () {
  "use strict";
  var G = 440, S = 30, uid = 0, stijl = "serif";
  var BREED = { serif: 0.53, conde: 0.41, sans: 0.54 };

  function n(v) { return Math.round(v * 10) / 10; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function el(tag, a, inner) {
    var s = "<" + tag;
    for (var k in a) if (a[k] != null && a[k] !== "") s += " " + k + '="' + a[k] + '"';
    return inner == null ? s + "/>" : s + ">" + inner + "</" + tag + ">";
  }
  function L(x1, y1, x2, y2, c) { return el("line", { x1: n(x1), y1: n(y1), x2: n(x2), y2: n(y2), "class": c }); }
  function R(x, y, w, h, c, rx) { return el("rect", { x: n(x), y: n(y), width: n(w), height: n(h), rx: rx, "class": c }); }
  function C(cx, cy, r, c) { return el("circle", { cx: n(cx), cy: n(cy), r: n(r), "class": c }); }
  function E(cx, cy, rx, ry, c) { return el("ellipse", { cx: n(cx), cy: n(cy), rx: n(rx), ry: n(ry), "class": c }); }
  function P(d, c) { return d ? el("path", { d: d, "class": c }) : ""; }
  function T(x, y, s, c, anker, extra) {
    var a = { x: n(x), y: n(y), "class": c, "text-anchor": anker };
    if (extra) for (var k in extra) a[k] = extra[k];
    return el("text", a, esc(s));
  }
  function M(pts, dicht) {
    var d = "";
    for (var i = 0; i < pts.length; i++) d += (i ? "L" : "M") + n(pts[i][0]) + "," + n(pts[i][1]);
    return d + (dicht ? "Z" : "");
  }
  function groep(c, inner) { return el("g", { "class": c }, inner); }
  function knip(id, d) { return '<clipPath id="' + id + '"><path d="' + d + '"/></clipPath>'; }
  function geknipt(id, inner) { return '<g clip-path="url(#' + id + ')">' + inner + "</g>"; }

  /* ---------- arcering ---------- */
  function arceer(x, y, w, h, stap, c) {                 // schuin, 45 graden
    var d = "", s = stap * Math.SQRT2;
    for (var k = x + y + s / 2; k < x + w + y + h; k += s) {
      var xs = Math.max(x, k - (y + h)), xe = Math.min(x + w, k - y);
      if (xe - xs > 0.4) d += "M" + n(xs) + "," + n(k - xs) + "L" + n(xe) + "," + n(k - xe);
    }
    return P(d, c);
  }
  function lagen(x, y, w, h, hoogte, voeg, c) {           // metselwerk of pannen: lagen met verspringende voegen
    var d = "", rij = 0;
    for (var yy = y + hoogte; yy < y + h - 0.6; yy += hoogte, rij++) {
      d += "M" + n(x) + "," + n(yy) + "H" + n(x + w);
      if (voeg) for (var xx = x + (rij % 2 ? voeg / 2 : voeg); xx < x + w - 1; xx += voeg) d += "M" + n(xx) + "," + n(yy) + "V" + n(Math.max(y, yy - hoogte));
    }
    return P(d, c);
  }
  function verticaal(x, y, w, h, stap, c) {               // delen, lamellen
    var d = "";
    for (var xx = x + stap; xx < x + w - 0.6; xx += stap) d += "M" + n(xx) + "," + n(y) + "V" + n(y + h);
    return P(d, c);
  }

  /* ---------- onderdelen ---------- */
  function glans(x, y, w, h) {                           // twee schuine streepjes op glas
    var a = Math.min(w, h);
    return P("M" + n(x + w * 0.16) + "," + n(y + a * 0.52) + "L" + n(x + w * 0.16 + a * 0.36) + "," + n(y + a * 0.16) +
      "M" + n(x + w * 0.16 + a * 0.1) + "," + n(y + a * 0.62) + "L" + n(x + w * 0.16 + a * 0.46) + "," + n(y + a * 0.26), "l3 gl");
  }
  function raam(x, y, w, h, o) {
    o = o || {};
    var s = "", b = o.boog || 0, vul = o.vul || "fg", d = "";
    if (b) s += P("M" + n(x) + "," + n(y + h) + "V" + n(y + b) + "Q" + n(x + w / 2) + "," + n(y - b) + " " + n(x + w) + "," + n(y + b) + "V" + n(y + h) + "Z", "l2 " + vul);
    else s += R(x, y, w, h, "l2 " + vul);
    if (o.schaduw !== false && !b) s += P("M" + n(x) + "," + n(y) + "H" + n(x + w) + "l-4,4H" + n(x + 4) + "V" + n(y + h) + "l-4,-4Z", "fs");
    if (o.glans !== false && w > 18) s += glans(x + 3, y + b + 3, w - 6, h - b - 6);
    var v = o.v || 1, hz = o.h || 1, i;
    for (i = 1; i < v; i++) d += "M" + n(x + w * i / v) + "," + n(y + b * 0.9) + "V" + n(y + h);
    for (i = 1; i < hz; i++) d += "M" + n(x) + "," + n(y + b + (h - b) * i / hz) + "H" + n(x + w);
    s += P(d, "l3");
    if (!b && o.kozijn !== false) s += R(x + 2.4, y + 2.4, w - 4.8, h - 4.8, "l3");
    if (o.dorpel !== false) s += L(x - 3, y + h + 1.6, x + w + 3, y + h + 1.6, "l2");
    if (o.latei) s += R(x - 2, y - 6, w + 4, 6, "l3 fz");
    if (o.luiken) s += luik(x - o.luiken - 1.5, y, o.luiken, h) + luik(x + w + 1.5, y, o.luiken, h);
    return s;
  }
  function luik(x, y, w, h) {                            // Hollandse luiken: zandloper
    return R(x, y, w, h, "l2 fa") + P("M" + n(x) + "," + n(y) + "L" + n(x + w) + "," + n(y + h / 2) + "L" + n(x) + "," + n(y + h) + "M" + n(x + w) + "," + n(y) + "L" + n(x) + "," + n(y + h / 2) + "L" + n(x + w) + "," + n(y + h), "l3 lw");
  }
  function deur(x, y, w, h, o) {
    o = o || {};
    var s = R(x, y, w, h, "l2 " + (o.vul || "fa"));
    if (o.glas) s += R(x + 5, y + 6, w - 10, h * 0.56, "l3 fg") + glans(x + 6, y + 8, w - 12, h * 0.5);
    else s += R(x + 5, y + 7, w - 10, h * 0.38, "l3 lw") + R(x + 5, y + h * 0.52, w - 10, h * 0.4, "l3 lw");
    s += C(o.links ? x + 5.5 : x + w - 5.5, y + h * 0.53, 1.5, "fb");
    return s;
  }
  function boom(x, r, top, o) {                          // top = hoogte van de kruin boven de voet
    o = o || {};
    var B = o.basis || G, cy = B - top + r, m = o.lobben || 12, d = "", i, k = o.plat || 0.9;
    for (i = 0; i <= m; i++) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / m, a0 = a - Math.PI / m;
      var px = x + r * Math.cos(a), py = cy + r * Math.sin(a) * k;
      d += i === 0 ? "M" + n(px) + "," + n(py) : "Q" + n(x + r * 1.16 * Math.cos(a0)) + "," + n(cy + r * 1.16 * Math.sin(a0) * k) + " " + n(px) + "," + n(py);
    }
    var voet = cy + r * k * 0.55;
    var stam = "M" + n(x - 3) + "," + B + "Q" + n(x - 2) + "," + n((B + voet) / 2) + " " + n(x - 1.4) + "," + n(voet) +
      "M" + n(x + 3) + "," + B + "Q" + n(x + 2) + "," + n((B + voet) / 2) + " " + n(x + 1.4) + "," + n(voet);
    var tak = "M" + n(x) + "," + n(voet) + "L" + n(x - r * 0.48) + "," + n(cy - r * 0.18) + "M" + n(x) + "," + n(cy + r * 0.3) + "L" + n(x + r * 0.52) + "," + n(cy - r * 0.32) +
      "M" + n(x) + "," + n(voet) + "L" + n(x + r * 0.05) + "," + n(cy - r * 0.62) + "M" + n(x - r * 0.24) + "," + n(cy + r * 0.04) + "L" + n(x - r * 0.62) + "," + n(cy + r * 0.12);
    return P(d + "Z", "l2 fk") + P(tak, "l3") + P(stam, "l2");
  }
  function struik(x, w, h) {
    var d = "M" + n(x) + "," + G, k = Math.max(3, Math.round(w / 14)), i;
    for (i = 0; i < k; i++) {
      var x0 = x + w * i / k, x1 = x + w * (i + 1) / k, top = G - h * (0.78 + 0.22 * Math.sin(i * 1.7 + 0.6));
      d += "Q" + n(x0 - 2) + "," + n(top) + " " + n((x0 + x1) / 2) + "," + n(top) + "Q" + n(x1 + 2) + "," + n(top) + " " + n(x1) + "," + n(G - h * 0.35);
    }
    return P(d + "L" + n(x + w) + "," + G + "Z", "l2 fk");
  }
  function heg(x, w, h) {
    var s = R(x, G - h, w, h, "l2 fk", 6), d = "";
    for (var i = 0; i < w / 9; i++) {
      var xx = x + 5 + i * 9, yy = G - h + 7 + (i % 3) * 7;
      d += "M" + n(xx) + "," + n(yy) + "q3,-4 6,0";
      if (yy + 14 < G - 4) d += "M" + n(xx + 3) + "," + n(yy + 14) + "q3,-4 6,0";
    }
    return s + P(d, "l3");
  }
  var LICHAAM = {
    staan: [[-6.8, -40.5], [6.8, -40.5], [5.6, -21], [4.8, 0], [1.4, 0], [0.4, -17], [-0.4, -17], [-1.4, 0], [-4.8, 0], [-5.6, -21]],
    lopen: [[-6.6, -40.5], [6.6, -40.5], [5.6, -21], [9.2, 0], [5.6, 0], [0.8, -16], [-1.2, -16], [-5.6, 0], [-9.2, 0], [-5.6, -21]]
  };
  function mens(x, hoogte, houding, spiegel, basis) {    // schaalfiguur; hoogte 52 = 1,75 m
    var k = hoogte / 52, f = spiegel ? -1 : 1, pts = LICHAAM[houding || "staan"], d = "", i, B = basis || G;
    for (i = 0; i < pts.length; i++) d += (i ? "L" : "M") + n(x + pts[i][0] * k * f) + "," + n(B + pts[i][1] * k);
    d += "Z";
    var arm = houding === "lopen" ? [[-6.6, -40], [-10.4, -27], [-8.6, -26], [-5.2, -36]] : [[-6.8, -40], [-8.8, -37], [-9, -22.5], [-7.2, -22.5], [-6.4, -33]];
    var arm2 = houding === "lopen" ? [[6.6, -40], [9.6, -25.5], [7.8, -25], [5.4, -35]] : [[6.8, -40], [8.8, -37], [9, -22.5], [7.2, -22.5], [6.4, -33]];
    [arm, arm2].forEach(function (a) { for (i = 0; i < a.length; i++) d += (i ? "L" : "M") + n(x + a[i][0] * k * f) + "," + n(B + a[i][1] * k); d += "Z"; });
    return P(d, "fp") + C(x, B - 46.6 * k, 4.4 * k, "fp");
  }
  function fiets(x, spiegel, basis) {
    var f = spiegel ? -1 : 1, y = (basis || G) - 10.5;
    function p(dx, dy) { return n(x + dx * f) + "," + n(y + dy); }
    return C(x, y, 10.5, "l2") + C(x + 34 * f, y, 10.5, "l2") +
      P("M" + p(0, 0) + "L" + p(14, 0) + "L" + p(9, -17) + "Z" + "M" + p(14, 0) + "L" + p(29, -16) + "L" + p(9.6, -15.6) + "M" + p(29, -16) + "L" + p(34, 0) + "M" + p(27, -20.5) + "L" + p(32, -20.5) + "M" + p(5.5, -18.5) + "L" + p(12.5, -18.5), "l2");
  }
  function bus(x, naam) {                                // bestelbus, rijdt naar rechts; 5,3 m
    var b = G - 7, s = "";
    s += P("M" + x + "," + (b - 6) + "V" + (G - 69) + "Q" + x + "," + (G - 73) + " " + (x + 5) + "," + (G - 73) + "H" + (x + 113) +
      "Q" + (x + 121) + "," + (G - 73) + " " + (x + 126) + "," + (G - 65) + "L" + (x + 142) + "," + (G - 41) + "Q" + (x + 158) + "," + (G - 38) + " " + (x + 159) + "," + (G - 30) + "V" + (b - 6) + "Z", "l1 fw");
    s += P("M" + (x + 115) + "," + (G - 66) + "H" + (x + 121) + "L" + (x + 136) + "," + (G - 44) + "H" + (x + 115) + "Z", "l2 fg");
    s += L(x + 111, G - 71, x + 111, b - 6, "l3") + L(x + 74, G - 71, x + 74, b - 6, "l3") + L(x + 74, G - 50, x + 78, G - 50, "l2");
    s += R(x, G - 30, 159, 5, "fa") + R(x, G - 25, 159, 2, "fb");
    s += C(x + 31, b, 11, "l2 fd") + C(x + 31, b, 4.2, "fw") + C(x + 131, b, 11, "l2 fd") + C(x + 131, b, 4.2, "fw");
    s += naamTekst(x + 9, G - 41, 96, 15, naam, "start");
    return s;
  }
  function auto(x, vul, spiegel, basis) {                // personenauto, 4,2 m
    var f = spiegel ? -1 : 1, B = basis || G, b = B - 6;
    function p(dx, dy) { return n(x + dx * f) + "," + n(B + dy); }
    var s = P("M" + p(0, -12) + "L" + p(0, -27) + "Q" + p(1, -31) + " " + p(12, -32) + "L" + p(32, -34) + "L" + p(48, -47) + "Q" + p(54, -50) + " " + p(63, -50) +
      "L" + p(89, -50) + "Q" + p(97, -50) + " " + p(103, -42) + "L" + p(111, -33) + "Q" + p(125, -31) + " " + p(126, -23) + "L" + p(126, -12) + "Z", "l1 " + (vul || "fw"));
    s += P("M" + p(50, -45) + "L" + p(61, -46.5) + "L" + p(75, -46.5) + "L" + p(75, -35) + "L" + p(41, -35) + "Z" + "M" + p(79, -46.5) + "L" + p(89, -46.5) + "Q" + p(95, -46) + " " + p(99, -40) + "L" + p(103, -35) + "L" + p(79, -35) + "Z", "l2 fg");
    s += L(x + 77 * f, B - 47, x + 77 * f, B - 14, "l3") + L(x + 45 * f, B - 35, x + 45 * f, B - 14, "l3");
    s += C(x + 25 * f, b, 10, "l2 fd") + C(x + 25 * f, b, 4, "fw") + C(x + 101 * f, b, 10, "l2 fd") + C(x + 101 * f, b, 4, "fw");
    return s;
  }
  function naamTekst(x, y, w, h, naam, anker, c, hTwee) { // y = basislijn, h = hoogte van de hoofdletters; hTwee = ruimte voor twee regels
    var r = BREED[stijl] || 0.52, size = Math.min(h / 0.7, w / Math.max(5, naam.length * r));
    var ax = anker === "start" ? x : anker === "end" ? x + w : x + w / 2, cls = "tn ms-naam " + (c || "");
    if (hTwee && naam.indexOf(" ") > 0) {
      var spaties = [], i; for (i = 0; i < naam.length; i++) if (naam[i] === " ") spaties.push(i);
      var knip = spaties.reduce(function (b, k) { return Math.abs(k - naam.length / 2) < Math.abs(b - naam.length / 2) ? k : b; }, spaties[0]);
      var a = naam.slice(0, knip), z = naam.slice(knip + 1), s2 = Math.min(hTwee / 2.15 / 0.7, w / (Math.max(a.length, z.length, 4) * r));
      if (s2 > size * 1.2) {
        var y1 = y - s2 * 0.62;
        return el("text", { x: n(ax), y: n(y1), "class": cls, "text-anchor": anker || "middle", "font-size": n(s2) },
          el("tspan", { x: n(ax) }, esc(a)) + el("tspan", { x: n(ax), dy: n(s2 * 1.12) }, esc(z)));
      }
    }
    return T(ax, y, naam, cls, anker || "middle", { "font-size": n(size), "data-w": n(w) });
  }

  /* ---------- maatvoering ---------- */
  function maaiveld(x0, x1) {
    return arceer(x0, G, x1 - x0, 11, 4.2, "l4") + L(x0, G, x1, G, "l1");
  }
  function maten(xs, y) {                                // maatketting onder de tekening
    var s = "", d = "", i;
    d += "M" + n(xs[0]) + "," + n(y) + "H" + n(xs[xs.length - 1]);
    for (i = 0; i < xs.length; i++) {
      d += "M" + n(xs[i] - 4) + "," + n(y + 4) + "L" + n(xs[i] + 4) + "," + n(y - 4) + "M" + n(xs[i]) + "," + n(G + 15) + "V" + n(y + 6);
      if (i) s += T((xs[i - 1] + xs[i]) / 2, y - 5, String(Math.round((xs[i] - xs[i - 1]) / S * 10) * 100), "tm", "middle");
    }
    return P(d, "l4") + s;
  }
  function peilen(x, niveaus, basis, links) {           // peilmaten: [hoogte in m, ...]; links = tekst links van de markering
    var s = "", B = basis || G;
    niveaus.forEach(function (h) {
      var y = B - h * S, t = h === 0 ? "±0" : "+" + h.toFixed(3).replace(".", ",");
      s += P("M" + n(x) + "," + n(y) + "l-4.5,-7h9z", "l4 fz") + (links ? L(x - 34, y, x + 10, y, "l4") + T(x - 36, y - 3, t, "tm", "end") : L(x - 10, y, x + 34, y, "l4") + T(x + 36, y + 3.5, t, "tm", "start"));
    });
    return s;
  }
  function stramien(assen, onder, y) {                   // stramienlijnen met bollen bovenaan
    var s = "", by = y || 25;
    assen.forEach(function (a) {
      s += L(a[0], by + 12, a[0], onder || G - 2, "l4 ls") + C(a[0], by, 11, "l4 fv") + T(a[0], by + 4, a[1], "tm tb", "middle");
    });
    return s;
  }
  function annotatie(o) {
    return groep("g-annotatie", stramien(o.assen || [], o.asOnder, o.asY) + maten(o.maten, 486) + (o.peilX ? peilen(o.peilX, o.peilen || [0], o.peilBasis, o.peilLinks) : ""));
  }

  /* ---------- de gevels ---------- */
  var TEK = {};

  /* Kapper: winkelpui met luifel en naambord, twee verdiepingen erboven, buren links en rechts */
  TEK.kapper = function (naam, id) {
    var s = "", x0 = 266, x1 = 506, w = x1 - x0, i;
    // buurpand links: tuitgevel, terughoudend getekend
    s += P(M([[132, G], [132, 158], [199, 92], [266, 158], [266, G]], true), "l2 fz");
    [[158, 186], [210, 186], [158, 262], [210, 262]].forEach(function (p) { s += raam(p[0], p[1], 36, 52, { v: 2, glans: false, dorpel: true }); });
    s += raam(184, 124, 30, 34, { boog: 6, glans: false }) + raam(156, 344, 84, 70, { v: 3, glans: false });
    // buurpand rechts: lager, strak
    s += R(x1, 214, 146, G - 214, "l2 fz") + R(x1 - 2, 208, 150, 6, "l2 fw");
    s += raam(522, 238, 112, 48, { v: 4, glans: false }) + raam(522, 318, 112, 48, { v: 4, glans: false }) + deur(600, 380, 34, 60, { vul: "fw" }) + raam(522, 380, 66, 48, { v: 2, glans: false });
    // hoofdpand: muur en metselwerk
    var id1 = "k" + id + "a";
    s += knip(id1, M([[x0, 104], [x1, 104], [x1, 300], [x0, 300]], true));
    s += R(x0, 104, w, G - 104, "fw") + geknipt(id1, lagen(x0, 104, w, 196, 7.5, 0, "l3 lb"));
    // kroonlijst met tandlijst
    s += R(x0 - 7, 96, w + 14, 10, "l2 fw") + R(x0 - 3, 106, w + 6, 5, "l2 fw");
    var tand = ""; for (i = x0 + 2; i < x1 - 4; i += 9) tand += "M" + n(i) + ",111v5h4.5v-5";
    s += P(tand, "l3");
    s += R(x0, 116, w, 6, "fs");
    // ramen verdiepingen: segmentbogen met strek
    [290, 386, 482].forEach(function (cx) {
      [[132, 62], [218, 64]].forEach(function (r) {
        s += P("M" + n(cx - 27) + "," + n(r[0] + 6) + "Q" + cx + "," + n(r[0] - 9) + " " + n(cx + 27) + "," + n(r[0] + 6), "l2");
        s += raam(cx - 23, r[0], 46, r[1], { boog: 6, h: 2, v: 2, glans: true });
      });
    });
    // waterlijst tussen pui en verdieping
    s += R(x0 - 4, 292, w + 8, 8, "l2 fw");
    // pui: penanten, naambord, luifel, etalage en deur
    s += R(x0, 300, 10, G - 300, "l2 fw") + R(x1 - 10, 300, 10, G - 300, "l2 fw");
    s += R(x0 + 10, 304, w - 20, 30, "l2 fa") + naamTekst(x0 + 24, 326, w - 48, 17, naam, "middle", "tn-bord");
    // luifel met strepen en geschulpte rand
    var lx = x0 + 14, lw = 152, ly = 336, d = "", st = "";
    for (i = 0; i < 8; i++) if (i % 2 === 0) st += R(lx + i * lw / 8, ly, lw / 8, 26, "fa");
    s += R(lx, ly, lw, 26, "fw") + st + R(lx, ly, lw, 26, "l2");
    d = "M" + n(lx) + "," + n(ly + 26);
    for (i = 0; i < 8; i++) d += "q" + n(lw / 16) + ",12 " + n(lw / 8) + ",0";
    s += P(d + "Z", "l2 fb");
    s += P("M" + lx + "," + (ly + 32) + "h" + lw + "l10,16h-" + lw + "z", "fs");
    // etalage met stoel en spiegel
    s += raam(x0 + 18, 368, 144, 52, { v: 2, dorpel: false, glans: true });
    s += R(x0 + 18, 420, 144, 20, "l2 fw") + lagen(x0 + 18, 420, 144, 20, 6.6, 12, "l3 lb");
    s += P("M" + (x0 + 46) + ",414v-14h10v-12M" + (x0 + 40) + ",400h22M" + (x0 + 52) + ",414h-8M" + (x0 + 51) + ",414h8", "l3") + R(x0 + 104, 380, 26, 30, "l3", 13);
    // deur met bovenlicht en barbierspaal
    s += raam(x0 + 176, 340, 44, 22, { v: 2, dorpel: false, glans: false }) + deur(x0 + 176, 364, 44, 76, { glas: true });
    s += R(x1 - 26, 356, 10, 46, "l2 fw", 5) + P("M" + (x1 - 26) + ",364l10,-6M" + (x1 - 26) + ",376l10,-6M" + (x1 - 26) + ",388l10,-6M" + (x1 - 26) + ",400l10,-6", "l2 lr") + C(x1 - 21, 352, 5, "l2 fb") + C(x1 - 21, 406, 3.5, "l2 fb");
    // omtrek en straat
    s += R(x0, 96, w, G - 96, "l1");
    s += boom(96, 46, 236) + fiets(158, false) + mens(574, 52, "lopen", true) + mens(244, 50, "staan");
    s += maaiveld(28, 772);
    s += annotatie({ assen: [[x0, "A"], [(x0 + x1) / 2, "B"], [x1, "C"]], maten: [x0 - 134, x0, x1, x1 + 146], peilX: 700, peilen: [0, 4.667, 7.733, 11.467] });
    return { svg: s, focus: [150, 70, 470, 440] };
  };

  /* Boerderij: schuur met hoog dak, uilenbord en open deeldeur */
  TEK.boerderij = function (naam, id) {
    var s = "", cx = 400, x0 = 228, x1 = 572, i;
    // dakvlak met pannen
    var dak = M([[x0 - 20, 250], [cx, 58], [x1 + 20, 250]], true), kd = "b" + id + "d";
    s += knip(kd, dak) + P(dak, "fz") + geknipt(kd, lagen(x0 - 20, 58, x1 - x0 + 40, 192, 9, 0, "l3 lb")) + P(dak, "l1");
    // topgevel met houten delen
    var top = M([[x0, 250], [cx, 84], [x1, 250]], true), kt = "b" + id + "t";
    s += knip(kt, top) + P(top, "fw") + geknipt(kt, verticaal(x0, 84, x1 - x0, 166, 8, "l3 lb")) + P(top, "l2");
    // uilenbord
    s += P("M" + cx + ",72L" + (cx - 12) + ",112L" + cx + ",136L" + (cx + 12) + ",112Z", "l2 fb") + C(cx, 110, 4, "l2 fw");
    s += raam(cx - 22, 186, 44, 40, { v: 2, h: 2, glans: false });
    // onderbouw in baksteen
    var ko = "b" + id + "o";
    s += knip(ko, M([[x0, 250], [x1, 250], [x1, G], [x0, G]], true)) + R(x0, 250, x1 - x0, G - 250, "fw") + geknipt(ko, lagen(x0, 250, x1 - x0, G - 250, 7.5, 15, "l3 lb"));
    s += R(x0 - 4, 246, x1 - x0 + 8, 6, "l2 fw");
    // naambord boven de deur
    s += R(cx - 104, 262, 208, 30, "l2 fa") + naamTekst(cx - 94, 284, 188, 16, naam, "middle", "tn-bord");
    // open deeldeur: donker interieur met kisten
    s += P("M" + (cx - 70) + "," + G + "V320Q" + cx + ",296 " + (cx + 70) + ",320V" + G, "l2 fd");
    s += P("M" + (cx - 70) + "," + G + "V320Q" + cx + ",296 " + (cx + 70) + ",320V" + G, "l2");
    for (i = 0; i < 3; i++) {
      var kx = cx - 56 + i * 38;
      s += R(kx, 404, 34, 18, "l2 fb") + R(kx, 386, 34, 18, "l2 fb") + L(kx, 395, kx + 34, 395, "l3") + L(kx, 413, kx + 34, 413, "l3");
      s += C(kx + 8, 382, 5, "l2 " + (i % 2 ? "fa" : "fw")) + C(kx + 18, 380, 5.5, "l2 " + (i % 2 ? "fw" : "fa")) + C(kx + 28, 382, 5, "l2 " + (i % 2 ? "fa" : "fw"));
    }
    s += R(cx - 58, 422, 116, 18, "l2 fw") + L(cx - 58, 431, cx + 58, 431, "l3");
    // deuren opengeklapt
    s += R(cx - 112, 322, 40, G - 322, "l2 fa") + P("M" + (cx - 112) + ",322l40," + (G - 322) + "M" + (cx - 72) + ",322l-40," + (G - 322), "l3 lw");
    s += R(cx + 72, 322, 40, G - 322, "l2 fa") + P("M" + (cx + 72) + ",322l40," + (G - 322) + "M" + (cx + 112) + ",322l-40," + (G - 322), "l3 lw");
    // stalramen met luiken
    s += raam(x0 + 22, 318, 34, 40, { v: 2, h: 2, glans: false, luiken: 15 }) + raam(x1 - 56, 318, 34, 40, { v: 2, h: 2, glans: false, luiken: 15 });
    s += R(x0, 250, x1 - x0, G - 250, "l1");
    // erf: stoepbord, kisten, boom, figuren
    s += P("M612,440l12,-44h28l12,44M624,396l-4,44M652,396l4,44", "l2") + R(622, 400, 32, 22, "l2 fd") + P("M628,408h20M628,414h14", "l3 lw");
    s += boom(84, 54, 292, { lobben: 14 }) + boom(714, 40, 214);
    s += mens(196, 52, "staan", true) + mens(186, 34, "staan") + fiets(560, true);
    s += maaiveld(28, 772);
    s += annotatie({ assen: [[x0, "1"], [cx, "2"], [x1, "3"]], maten: [x0, cx, x1], peilX: 724, peilen: [0, 6.333, 12.733] });
    return { svg: s, focus: [150, 50, 500, 446] };
  };

  /* Installateur: woning in doorsnede met ketel, leidingen, radiator en badkamer; de bus voor de deur */
  TEK.installateur = function (naam, id) {
    var s = "", x0 = 196, x1 = 456, mid = (x0 + x1) / 2, mw = 9, i;
    // zolderruimte en dak in doorsnede (zwart gesneden)
    s += P(M([[x0 + mw, 240], [mid, 124], [x1 - mw, 240]], true), "fz");
    s += P(M([[x0 - 22, 250], [mid, 104], [x1 + 22, 250], [x1 + 6, 250], [mid, 120], [x0 - 6, 250]], true), "l1 fd");
    s += R(x0, 240, mw, G - 240, "l1 fd") + R(x1 - mw, 240, mw, G - 240, "l1 fd");
    s += R(x0 + mw, 332, x1 - x0 - 2 * mw, 9, "l1 fd") + R(x0 + mw, 234, x1 - x0 - 2 * mw, 8, "l1 fd");
    s += R(x0 + mw, 341, x1 - x0 - 2 * mw, G - 341, "fw") + R(x0 + mw, 242, x1 - x0 - 2 * mw, 90, "fw");
    // ramen in de doorsnede: glas als dubbele lijn
    s += R(x0, 262, mw, 44, "fw") + L(x0 + 3, 262, x0 + 3, 306, "l3") + L(x0 + 6, 262, x0 + 6, 306, "l3");
    s += R(x1 - mw, 362, mw, 52, "fw") + L(x1 - 6, 362, x1 - 6, 414, "l3") + L(x1 - 3, 362, x1 - 3, 414, "l3");
    // zolder: cv-ketel met expansievat
    var kx = mid - 18;
    s += R(kx, 178, 36, 52, "l2 fw", 3) + C(kx + 18, 196, 7, "l2 fz") + L(kx + 8, 220, kx + 28, 220, "l3") + R(kx + 46, 204, 14, 26, "l2 fw", 7);
    // badkamer: bad en douche; woonkamer: radiator; keuken: kraan
    s += R(x1 - 104, 302, 78, 26, "l2 fw", 11) + P("M" + (x1 - 40) + ",246v26q0,6 -6,6h-8", "l2") + C(x1 - 48, 283, 4.5, "l2 fz");
    s += P("M" + (x1 - 52) + ",289v6M" + (x1 - 47) + ",290v7M" + (x1 - 42) + ",289v6", "l3");
    s += R(x0 + 26, 400, 58, 32, "l2 fw", 2) + verticaal(x0 + 26, 400, 58, 32, 7, "l3");
    s += R(x1 - 98, 404, 74, 36, "l2 fw") + L(x1 - 98, 412, x1 - 24, 412, "l3") + P("M" + (x1 - 56) + ",404v-14h8v5", "l2");
    // leidingen in de tweede kleur: stijgleiding van de ketel, aftakkingen naar bad, radiator en keuken
    var lei = "M" + (kx + 12) + ",230V384M" + (kx + 24) + ",230V378" +
      "M" + (kx + 24) + ",292H" + (x1 - 40) + "V300" +
      "M" + (kx + 12) + ",384H" + (x0 + 84) + "M" + (kx + 24) + ",378H" + (x1 - 52) + "V390";
    s += P(lei, "l1 lp");
    // lekkage
    s += P("M" + (kx + 12) + ",352q-6,9 0,12q6,-3 0,-12z", "l2 fb") + P("M" + (kx + 2) + ",346l-4,-4M" + (kx + 22) + ",346l4,-4", "l3");
    // warmtepomp buiten
    s += R(x1 + 14, 392, 50, 44, "l2 fw", 3) + C(x1 + 39, 414, 15, "l2") + P("M" + (x1 + 39) + ",399v30M" + (x1 + 24) + ",414h30", "l3") + L(x1 + 18, 436, x1 + 18, G, "l2") + L(x1 + 60, 436, x1 + 60, G, "l2");
    s += P("M" + x1 + ",404h14", "l1 lp");
    // buurwoning rechts in aanzicht
    s += P(M([[x1 + 80, G], [x1 + 80, 250], [x1 + 162, 140], [x1 + 244, 250], [x1 + 244, G]], false), "l3");
    s += raam(x1 + 102, 280, 40, 48, { v: 2, glans: false }) + raam(x1 + 182, 280, 40, 48, { v: 2, glans: false }) + raam(x1 + 147, 190, 30, 30, { glans: false, dorpel: false });
    s += deur(x1 + 106, 370, 34, 70, { vul: "fw" }) + raam(x1 + 172, 370, 56, 46, { v: 2, glans: false });
    // bus op straat, monteur, boom
    s += bus(x1 + 96, naam) + mens(x1 + 82, 52, "lopen", true);
    s += boom(76, 34, 226, { lobben: 12 });
    s += maaiveld(28, 772);
    s += annotatie({ asY: 62, assen: [[x0, "A"], [x1, "B"]], maten: [x0, x1, x1 + 80], peilX: 186, peilLinks: true, peilen: [0, 3.3, 6.533] });
    return { svg: s, focus: [150, 84, 580, 420], breed: [0, 40, 800, 480] };
  };

  /* Schilder: grachtenpand met trapgevel, half in de steiger; het steigerdoek met de naam */
  TEK.schilder = function (naam, id) {
    var s = "", x0 = 252, x1 = 492, w = x1 - x0, i;
    var trap = M([[x0, G], [x0, 170], [x0 + 24, 170], [x0 + 24, 140], [x0 + 52, 140], [x0 + 52, 110], [x0 + 84, 110], [x0 + 84, 74], [x1 - 84, 74], [x1 - 84, 110], [x1 - 52, 110], [x1 - 52, 140], [x1 - 24, 140], [x1 - 24, 170], [x1, 170], [x1, G]], true);
    var k = "s" + id + "g";
    s += knip(k, trap) + P(trap, "fw") + geknipt(k, lagen(x0, 74, w, G - 74, 7.5, 0, "l3 lb"));
    // afdekkingen van de trappen
    [[x0 - 3, 166, 30], [x0 + 21, 136, 34], [x0 + 49, 106, 38], [x0 + 81, 70, w - 162], [x1 - 87, 106, 38], [x1 - 55, 136, 34], [x1 - 27, 166, 30]].forEach(function (t) { s += R(t[0], t[1], t[2], 5, "l2 fw"); });
    // ramen: links vers geschilderd (kozijnen in accent), rechts nog oud
    var rijen = [[200, 64], [282, 64]], kolom = [x0 + 26, x0 + 98, x0 + 170];
    rijen.forEach(function (r) { kolom.forEach(function (x, j) { s += raam(x, r[0], 44, r[1], { v: 2, h: 2, vul: j < 2 ? "fg" : "fg", latei: true }); if (j < 2) s += R(x, r[0], 44, r[1], "l2 lk"); }); });
    s += raam(x0 + 98, 120, 44, 44, { boog: 8, v: 2, glans: false });
    s += deur(x0 + 28, 368, 40, 72, {}) + raam(x0 + 28, 352, 40, 14, { v: 2, dorpel: false, glans: false }) + raam(x0 + 98, 364, 116, 60, { v: 3, h: 2 });
    s += R(x0 + 26, 364, 44, 76, "l2 lk");
    s += P(trap, "l1");
    // steiger over de rechterhelft
    var sx = [x0 + 150, x0 + 196, x1 + 2, x1 + 36], liften = [G - 4, 358, 276, 194];
    var st = "";
    sx.forEach(function (x) { st += "M" + x + "," + G + "V" + 186; });
    liften.forEach(function (y) { st += "M" + (sx[0] - 4) + "," + y + "H" + (sx[3] + 4); });
    s += P(st, "l2 lw2");
    for (i = 1; i < liften.length; i++) s += R(sx[0] - 4, liften[i], sx[3] - sx[0] + 8, 4, "l2 fb") + L(sx[2], liften[i - 1], sx[3], liften[i], "l3");
    // steigerdoek met naam
    s += R(sx[0] + 4, 288, sx[3] - sx[0] - 8, 62, "l2 fa") + P("M" + (sx[0] + 4) + ",288l6,6M" + (sx[3] - 4) + ",288l-6,6M" + (sx[0] + 4) + ",350l6,-6M" + (sx[3] - 4) + ",350l-6,-6", "l3 lw");
    s += naamTekst(sx[0] + 12, 326, sx[3] - sx[0] - 24, 16, naam, "middle", "tn-bord", 44);
    // schilder op de steiger met roller, ladder, verf
    s += mens(x0 + 214, 50, "staan", true, 276);
    s += ladder(x1 + 64, 288, G);
    s += R(x0 + 120, 426, 16, 14, "l2 fb") + P("M" + (x0 + 120) + ",426q8,-8 16,0", "l3");
    // buurpand links, vlak
    s += P(M([[x0 - 120, G], [x0 - 120, 196], [x0 - 60, 136], [x0, 196]], false), "l3");
    s += raam(x0 - 98, 230, 34, 52, { v: 2, glans: false }) + raam(x0 - 52, 230, 34, 52, { v: 2, glans: false }) + raam(x0 - 98, 330, 80, 60, { v: 2, glans: false });
    s += boom(74, 40, 226) + mens(616, 52, "lopen", true) + fiets(650, false);
    s += maaiveld(28, 772);
    s += annotatie({ assen: [[x0, "A"], [x1, "B"]], maten: [x0, x1], peilX: 694, peilen: [0, 5.667, 12.2] });
    return { svg: s, focus: [130, 50, 520, 438] };
  };
  function ladder(x, top, bodem) {
    var d = "M" + x + "," + bodem + "L" + (x - 10) + "," + top + "M" + (x + 16) + "," + bodem + "L" + (x + 6) + "," + top;
    for (var y = bodem - 12; y > top + 4; y -= 12) { var t = (bodem - y) / (bodem - top); d += "M" + n(x - 10 * t) + "," + n(y) + "H" + n(x + 16 - 10 * t); }
    return P(d, "l2");
  }

  /* Aannemer: woning met nieuwe aanbouw in houtskelet, torenkraan en bouwbord */
  TEK.aannemer = function (naam, id) {
    var s = "", x0 = 188, x1 = 388, i;
    // bestaande woning
    var huis = M([[x0, G], [x0, 236], [(x0 + x1) / 2, 118], [x1, 236], [x1, G]], true), kh = "a" + id + "h";
    s += knip(kh, huis) + P(huis, "fw") + geknipt(kh, lagen(x0, 236, x1 - x0, G - 236, 7.5, 15, "l3 lb"));
    s += P(M([[x0 - 16, 242], [(x0 + x1) / 2, 108], [x1 + 16, 242]], false), "l1");
    s += raam(x0 + 30, 268, 50, 56, { v: 2, latei: true }) + raam(x1 - 80, 268, 50, 56, { v: 2, latei: true }) + raam((x0 + x1) / 2 - 18, 168, 36, 40, { v: 2, glans: false });
    s += deur(x0 + 34, 366, 40, 74, {}) + raam(x1 - 92, 366, 62, 56, { v: 2 });
    s += P(huis, "l1");
    // aanbouw in aanbouw: skelet, bovenste deel gestippeld
    var ax0 = x1, ax1 = x1 + 152;
    s += R(ax0, 330, ax1 - ax0, G - 330, "fz") + verticaal(ax0, 336, ax1 - ax0, G - 336, 19, "l2");
    s += R(ax0, 324, ax1 - ax0 + 8, 10, "l1 fb") + R(ax0, 336, ax1 - ax0, G - 336, "l2");
    s += P("M" + ax0 + "," + G + "L" + (ax0 + 76) + ",336L" + ax1 + "," + G, "l3");
    s += P("M" + ax0 + ",324L" + ax0 + ",296L" + (ax1 + 8) + ",310", "l3 ls");
    // steiger tegen de aanbouw
    s += P("M" + (ax1 + 14) + "," + G + "V300M" + (ax1 + 46) + "," + G + "V300M" + (ax1 + 10) + ",372H" + (ax1 + 50) + "M" + (ax1 + 10) + ",304H" + (ax1 + 50) + "M" + (ax1 + 14) + ",440L" + (ax1 + 46) + ",372", "l2 lw2");
    s += R(ax1 + 10, 368, 40, 4, "l2 fb") + R(ax1 + 10, 300, 40, 4, "l2 fb");
    s += mens(ax1 + 30, 50, "staan", true, 368);
    // torenkraan, rechts achter
    var kx = 712, kt = 70;
    var mast = "M" + (kx - 8) + "," + G + "V" + kt + "M" + (kx + 8) + "," + G + "V" + kt;
    for (var y = G; y > kt + 10; y -= 16) mast += "M" + (kx - 8) + "," + y + "L" + (kx + 8) + "," + (y - 16);
    s += P(mast, "l3 lk2");
    var giek = "M" + (kx - 196) + "," + kt + "H" + (kx + 52) + "M" + (kx - 196) + "," + (kt + 12) + "H" + (kx + 52) + "M" + kx + "," + (kt - 26) + "L" + (kx - 196) + "," + kt + "M" + kx + "," + (kt - 26) + "L" + (kx + 52) + "," + kt;
    for (var gx = kx - 196; gx < kx + 52; gx += 14) giek += "M" + gx + "," + (kt + 12) + "L" + (gx + 7) + "," + kt + "L" + (gx + 14) + "," + (kt + 12);
    s += P(giek, "l3 lk2") + R(kx + 30, kt + 12, 24, 22, "l2 fd") + L(kx - 10, kt - 30, kx + 10, kt - 30, "l2");
    // last aan de haak, boven de aanbouw
    var hx = ax0 + 76;
    s += L(hx, kt + 12, hx, 226, "l3") + R(hx - 30, 226, 60, 8, "l2 fb") + L(hx - 30, 226, hx, 210, "l3") + L(hx + 30, 226, hx, 210, "l3");
    // bouwbord met naam, voor de kraan
    var bx = 36, by = 352;
    s += L(bx + 14, by + 40, bx + 14, G, "l2") + L(bx + 130, by + 40, bx + 130, G, "l2");
    s += R(bx, by - 6, 144, 56, "l2 fw") + R(bx, by - 6, 144, 13, "fa") + T(bx + 8, by + 4, "HIER BOUWT", "tm tw", "start");
    s += naamTekst(bx + 8, by + 27, 128, 13, naam, "start") + T(bx + 8, by + 43, "aanbouw en renovatie", "tm", "start");
    s += boom(646, 34, 214) + mens(204, 52, "lopen") + mens(612, 50, "staan", true);
    s += maaiveld(28, 772);
    s += annotatie({ assen: [[x0, "A"], [x1, "B"], [ax1, "C"]], maten: [x0, x1, ax1] });
    return { svg: s, focus: [24, 40, 600, 452] };
  };

  /* Dak en tuin: woning met pannendak en dakkapel, sedumdak op de aanbouw, tuin ervoor */
  TEK["dak-tuin"] = function (naam, id) {
    var s = "", x0 = 224, x1 = 470, mid = (x0 + x1) / 2, i;
    // dak met pannen
    var dak = M([[x0 - 22, 236], [mid, 96], [x1 + 22, 236]], true), kd = "d" + id + "d";
    s += knip(kd, dak) + P(dak, "fz") + geknipt(kd, lagen(x0 - 22, 96, x1 - x0 + 44, 140, 8, 13, "l3 lb")) + P(dak, "l1");
    // dakkapel
    s += R(mid - 44, 150, 88, 54, "l2 fw") + R(mid - 50, 144, 100, 8, "l2 fa") + raam(mid - 34, 160, 68, 36, { v: 3, dorpel: false });
    // schoorsteen
    s += R(x1 - 66, 108, 20, 52, "l2 fw") + R(x1 - 70, 104, 28, 6, "l2 fw") + lagen(x1 - 66, 110, 20, 50, 7.5, 10, "l3 lb");
    // dakgoot in de tweede kleur
    s += R(x0 - 26, 236, x1 - x0 + 52, 7, "l2 fb");
    // gevel
    var kg = "d" + id + "g";
    s += knip(kg, M([[x0, 243], [x1, 243], [x1, G], [x0, G]], true)) + R(x0, 243, x1 - x0, G - 243, "fw") + geknipt(kg, lagen(x0, 243, x1 - x0, G - 243, 7.5, 15, "l3 lb"));
    s += raam(x0 + 28, 266, 56, 58, { v: 2, latei: true }) + raam(x1 - 84, 266, 56, 58, { v: 2, latei: true });
    s += deur(mid - 20, 366, 40, 74, {}) + R(mid - 28, 358, 56, 6, "l2 fw") + raam(x0 + 22, 366, 64, 56, { v: 2 }) + raam(x1 - 86, 366, 64, 56, { v: 2 });
    s += R(x0, 243, x1 - x0, G - 243, "l1");
    // aanbouw met sedumdak
    var ax = x1, aw = 130;
    s += R(ax, 346, aw, G - 346, "l1 fw") + raam(ax + 18, 366, 94, 62, { v: 3, dorpel: false });
    s += R(ax - 2, 338, aw + 6, 8, "l2 fw");
    var sedum = "M" + ax + ",338";
    for (i = 0; i < 16; i++) sedum += "q" + n(aw / 32) + "," + (i % 2 ? -7 : -10) + " " + n(aw / 16) + ",0";
    s += P(sedum, "l2 fk");
    // ladder tegen de goot met dakdekker
    s += ladder(x0 - 6, 230, G);
    s += mens(x0 - 8, 48, "staan", false, 326);
    // tuin: heg, struiken, boom, kruiwagen, bord met naam
    s += heg(36, 120, 34) + struik(ax + aw + 18, 64, 26) + boom(694, 42, 226, { lobben: 13 });
    s += P("M594,440l-6,-14h-14M588,426h40l-8,14z", "l2 fb") + C(624, 434, 6, "l2 fw");
    s += L(186, 382, 186, G, "l2") + R(120, 352, 132, 34, "l2 fa", 3) + naamTekst(128, 375, 116, 13, naam, "middle", "tn-bord");
    s += maaiveld(28, 772);
    s += annotatie({ asY: 56, assen: [[x0, "A"], [x1, "B"], [ax + aw, "C"]], maten: [x0, x1, ax + aw], peilX: 210, peilLinks: true, peilen: [6.567, 11.467] });
    return { svg: s, focus: [100, 40, 560, 446], breed: [0, 32, 800, 488] };
  };

  /* Garage: hal met sheddak, twee roldeuren en grote letters op de gevel */
  TEK.garage = function (naam, id) {
    var s = "", x0 = 150, x1 = 640, i;
    // sheddak: vier tanden met glas
    var tw = (x1 - x0) / 4, shed = "";
    for (i = 0; i < 4; i++) {
      var a = x0 + i * tw;
      s += P(M([[a, 236], [a, 176], [a + tw, 236]], true), "fw") + R(a + 2, 182, 10, 50, "fg") + L(a + 7, 182, a + 7, 232, "l3");
      shed += "M" + n(a) + ",236L" + n(a) + ",176L" + n(a + tw) + ",236";
    }
    s += P(shed, "l1");
    // gevel met lijst en grote letters
    var kg = "g" + id + "g";
    s += knip(kg, M([[x0, 236], [x1, 236], [x1, G], [x0, G]], true)) + R(x0, 236, x1 - x0, G - 236, "fw") + geknipt(kg, lagen(x0, 300, x1 - x0, G - 300, 7.5, 15, "l3 lb"));
    s += R(x0, 236, x1 - x0, 58, "l2 fa") + naamTekst(x0 + 24, 280, x1 - x0 - 48, 30, naam, "middle", "tn-bord");
    // roldeuren: links dicht, rechts open met auto op de brug
    var d1 = x0 + 34, dw = 150;
    s += R(d1, 318, dw, G - 318, "l2 fw") + lagen(d1, 318, dw, G - 318, 8, 0, "l3") + R(d1 - 4, 312, dw + 8, 6, "l2 fw");
    var d2 = d1 + dw + 34;
    s += R(d2, 318, dw, G - 318, "l2 fd") + R(d2, 318, dw, 18, "l2 fw") + lagen(d2, 318, dw, 18, 6, 0, "l3") + R(d2 - 4, 312, dw + 8, 6, "l2 fw");
    s += L(d2 + 22, 350, d2 + 22, G, "l2 lw") + L(d2 + dw - 22, 350, d2 + dw - 22, G, "l2 lw") + R(d2 + 14, 384, dw - 28, 5, "fb");
    s += auto(d2 + 12, "fw", false, 384);
    // kantoor met raam en deur
    var kx = d2 + dw + 30;
    s += raam(kx, 330, x1 - kx - 24, 56, { v: 2 }) + deur(kx + 8, 392, 34, 48, { glas: true });
    s += R(x0, 236, x1 - x0, G - 236, "l1");
    // bandenstapel en auto voor de deur
    for (i = 0; i < 4; i++) s += R(d1 - 28, G - 12 - i * 12, 20, 12, "l2 fd", 5);
    s += auto(668, "fa", true);
    s += mens(108, 52, "staan") + boom(64, 36, 210);
    s += maaiveld(28, 772);
    s += annotatie({ asY: 130, assen: [[x0, "1"], [x0 + tw, "2"], [x0 + 2 * tw, "3"], [x0 + 3 * tw, "4"], [x1, "5"]], maten: [x0, x0 + 2 * tw, x1], peilX: 700, peilen: [0, 6.8, 8.8] });
    return { svg: s, focus: [120, 104, 560, 396], breed: [0, 106, 800, 414] };
  };

  /* Fysio: modern praktijkgebouw, glazen pui beneden, houten lamellen boven, letters op de gevel */
  TEK.fysio = function (naam, id) {
    var s = "", x0 = 200, x1 = 590, i;
    // bovenverdieping met lamellen en bandraam
    s += R(x0, 200, x1 - x0, 128, "fw") + verticaal(x0, 200, x1 - x0, 128, 6, "l3 lb");
    s += raam(x0 + 140, 236, 220, 40, { v: 4, dorpel: false });
    s += R(x0 - 10, 188, x1 - x0 + 20, 12, "l1 fw") + R(x0, 200, x1 - x0, 8, "fs");
    // naam in losse letters op de lamellen
    s += naamTekst(x0 + 24, 306, 210, 22, naam, "start", "tn-groot");
    // begane grond: vliesgevel
    s += R(x0, 328, x1 - x0, 6, "l2 fd") + R(x0 + 6, 334, x1 - x0 - 12, 10, "fs");
    s += R(x0 + 6, 334, x1 - x0 - 12, G - 334, "l2 fg");
    var stijlen = ""; for (var x = x0 + 6 + 54; x < x1 - 10; x += 54) stijlen += "M" + x + ",334V" + G;
    s += P(stijlen + "M" + (x0 + 6) + ",404H" + (x1 - 6), "l2");
    s += glans(x0 + 66, 342, 48, 50) + glans(x0 + 282, 342, 48, 50);
    // binnen: behandeltafel, bal en een figuur
    s += P("M" + (x0 + 128) + ",402h76M" + (x0 + 136) + ",402v34M" + (x0 + 196) + ",402v34", "l2") + C(x0 + 250, 420, 16, "l2 fb");
    s += mens(x0 + 300, 50, "staan", true);
    // ingang met luifel
    s += R(x1 - 112, 374, 52, 66, "l2 fw") + R(x1 - 126, 368, 82, 6, "l2 fa") + L(x1 - 86, 374, x1 - 86, G, "l3");
    s += R(x0, 188, x1 - x0, G - 188, "l1");
    // terrein
    s += boom(122, 54, 272, { lobben: 13, plat: 1 }) + boom(680, 40, 226) + mens(640, 52, "lopen", true) + fiets(70, false);
    s += maaiveld(28, 772);
    s += annotatie({ asY: 142, assen: [[x0, "A"], [(x0 + x1) / 2, "B"], [x1, "C"]], maten: [x0, (x0 + x1) / 2, x1], peilX: 712, peilen: [0, 3.533, 8.4] });
    return { svg: s, focus: [110, 120, 560, 380], breed: [0, 118, 800, 402] };
  };

  /* Schoonmaak: kantoorgebouw met vliesgevel en een glazenwassersbak met de naam */
  TEK.schoonmaak = function (naam, id) {
    var s = "", x0 = 240, x1 = 560, top = 96, i, j;
    s += R(x0, top, x1 - x0, G - top, "fw");
    var vak = 64, lagenY = [], y;
    for (y = top + 20; y < G - 80; y += 66) lagenY.push(y);
    lagenY.forEach(function (yy, r) {
      for (j = 0; j < 5; j++) s += R(x0 + 8 + j * vak, yy, vak - 8, 52, "l2 fg") + (r < 2 ? glans(x0 + 12 + j * vak, yy + 4, vak - 16, 44) : "");
      s += L(x0, yy + 58, x1, yy + 58, "l3");
    });
    // schitteringen op de schone ramen
    [[x0 + 50, top + 34], [x0 + 186, top + 96], [x0 + 260, top + 40]].forEach(function (p) {
      s += P("M" + p[0] + "," + (p[1] - 9) + "v18M" + (p[0] - 9) + "," + p[1] + "h18M" + (p[0] - 4) + "," + (p[1] - 4) + "l8,8M" + (p[0] + 4) + "," + (p[1] - 4) + "l-8,8", "l2 lp");
    });
    // entree met luifel
    s += R(x0 + 120, 372, 80, 68, "l2 fg") + L(x0 + 160, 372, x0 + 160, G, "l2") + R(x0 + 104, 362, 112, 8, "l2 fa");
    s += R(x0, top, x1 - x0, G - top, "l1") + R(x0 - 6, top - 10, x1 - x0 + 12, 10, "l1 fw");
    // dakwagen met kabels en de bak
    var bx = x0 + 150, by = 214;
    s += R(x0 + 30, top - 16, x1 - x0 - 60, 6, "l2 fw");
    [bx + 6, bx + 154].forEach(function (x) { s += R(x - 3, top - 44, 6, 28, "l2 fw") + R(x - 8, top - 48, 16, 5, "l2 fd") + L(x, top - 44, x, by + 10, "l3"); });
    s += mens(bx + 60, 48, "staan", false, by + 46);
    s += R(bx, by + 10, 160, 40, "l2 fa", 2) + naamTekst(bx + 10, by + 37, 140, 14, naam, "middle", "tn-bord");
    // figuren en bomen
    s += boom(140, 50, 262, { lobben: 13 }) + boom(660, 46, 248) + mens(612, 52, "lopen", true) + mens(196, 52, "staan");
    s += maaiveld(28, 772);
    s += annotatie({ assen: [[x0, "A"], [x0 + 160, "B"], [x1, "C"]], maten: [x0, x0 + 160, x1], peilX: 712, peilen: [0, 4.4, 11.467] });
    return { svg: s, focus: [130, 50, 540, 440] };
  };

  /* Tandarts: een huis in de geest van De Stijl, vlakken en lijnen in de twee kleuren */
  TEK.tandarts = function (naam, id) {
    var s = "", x0 = 210, x1 = 560, i;
    // hoofdvolume wit
    s += R(x0, 170, 250, G - 170, "l1 fw");
    // gekleurde vlakken
    s += R(x0 + 250, 230, 100, G - 230, "l1 fz") + R(x0 - 24, 158, 180, 12, "l1 fd") + R(x0 + 190, 300, 190, 10, "l1 fd");
    s += R(x0 + 20, 196, 70, 92, "l1 fa") + R(x0 + 262, 250, 76, 40, "l1 fb");
    // ramen met zwarte kozijnen, asymmetrisch verdeeld
    s += raam(x0 + 104, 196, 126, 92, { v: 3, h: 2, dorpel: false }) + R(x0 + 104, 196, 126, 92, "l1");
    s += raam(x0 + 20, 330, 110, 80, { v: 2, dorpel: false }) + R(x0 + 20, 330, 110, 80, "l1");
    s += raam(x0 + 262, 324, 76, 60, { v: 2, dorpel: false }) + R(x0 + 262, 324, 76, 60, "l1");
    // deur met luifelplaat
    s += deur(x0 + 160, 356, 40, 84, { vul: "fb", glas: true }) + R(x0 + 146, 346, 70, 8, "l1 fd");
    // kolommen en balk
    s += R(x0 + 368, 310, 6, G - 310, "l1 fd") + R(x0 - 18, 170, 6, 120, "l1 fd");
    // naam op het witte vlak
    s += naamTekst(x0 + 24, 318, 124, 12, naam, "start", "tn-klein");
    s += L(x0 + 24, 324, x0 + 148, 324, "l2");
    s += boom(110, 46, 250, { lobben: 12, plat: 1 }) + boom(668, 38, 214) + mens(620, 52, "lopen", true) + mens(600, 32, "lopen", true) + fiets(150, true);
    s += maaiveld(28, 772);
    s += annotatie({ asY: 112, assen: [[x0, "A"], [x0 + 250, "B"], [x0 + 350, "C"]], maten: [x0, x0 + 250, x0 + 350], peilX: 712, peilen: [0, 4.667, 9] });
    return { svg: s, focus: [110, 92, 560, 404], breed: [0, 88, 800, 432] };
  };

  /* Administratiekantoor: Utrechts grachtenpand met halsgevel, de werf en het water eronder */
  TEK.accountant = function (naam, id) {
    var s = "", x0 = 290, x1 = 500, w = x1 - x0, cx = (x0 + x1) / 2, i, straat = 352;
    // werf en water onder de straat
    s += R(28, straat, 744, 46, "fz") + lagen(28, straat, 744, 46, 7.5, 15, "l3 lb") + L(28, straat, 772, straat, "l1");
    [150, 330, 510, 690].forEach(function (x) {
      s += P("M" + (x - 34) + "," + (straat + 46) + "V" + (straat + 24) + "A34,26 0 0 1 " + (x + 34) + "," + (straat + 24) + "V" + (straat + 46) + "Z", "l2 fd");
    });
    var golf = ""; for (i = 0; i < 4; i++) { golf += "M" + (34 + (i % 2) * 9) + "," + (straat + 56 + i * 8); for (var gx = 0; gx < 52; gx++) golf += "q7," + (gx % 2 ? 2.6 : -2.6) + " 14,0"; }
    s += R(28, straat + 46, 744, 42, "fg") + P(golf, "l3") + L(28, straat + 46, 772, straat + 46, "l2");
    // leuning langs de werf
    s += P("M28," + (straat - 14) + "H772", "l2") + verticaal(28, straat - 14, 744, 14, 24, "l3");
    // het pand met halsgevel
    var hals = M([[x0, straat], [x0, 152], [x0 + 46, 152], [x0 + 46, 112], [x1 - 46, 112], [x1 - 46, 152], [x1, 152], [x1, straat]], true);
    var kh = "v" + id + "h";
    s += knip(kh, hals) + P(hals, "fw") + geknipt(kh, lagen(x0, 112, w, straat - 112, 7.5, 0, "l3 lb"));
    // klauwstukken en fronton
    s += P("M" + x0 + ",152Q" + (x0 + 12) + ",124 " + (x0 + 46) + ",124M" + x1 + ",152Q" + (x1 - 12) + ",124 " + (x1 - 46) + ",124", "l2");
    s += P(M([[x0 + 40, 112], [cx, 78], [x1 - 40, 112]], true), "l2 fw") + C(cx, 100, 6, "l2 fb");
    // ramen met roeden
    [{ y: 172, h: 58 }].forEach(function (r) { [x0 + 22, cx - 22, x1 - 66].forEach(function (x) { s += raam(x, r.y, 44, r.h, { v: 2, h: 3, latei: true }); }); });
    s += raam(cx - 18, 128, 36, 22, { v: 2, glans: false });
    // stoep, deur en bovenlicht met de naam in goud
    s += P("M" + (cx - 34) + "," + straat + "v-8h68v8M" + (cx - 28) + "," + (straat - 8) + "v-8h56v8", "l2 fw");
    s += R(x0 - 2, 238, w + 4, 22, "l2 fd") + naamTekst(x0 + 10, 254, w - 20, 11, naam, "middle", "tn-goud");
    s += deur(cx - 20, 290, 40, 54, { vul: "fa" }) + raam(cx - 20, 272, 40, 16, { v: 3, dorpel: false, glans: false });
    s += raam(x0 + 18, 278, 50, 60, { v: 2, h: 2, glans: false }) + raam(x1 - 68, 278, 50, 60, { v: 2, h: 2, glans: false });
    s += P(hals, "l1");
    // buren, iets terug
    s += P(M([[x0 - 150, straat], [x0 - 150, 184], [x0 - 75, 120], [x0, 184]], false), "l3");
    s += raam(x0 - 126, 214, 38, 52, { v: 2, glans: false }) + raam(x0 - 62, 214, 38, 52, { v: 2, glans: false }) + raam(x0 - 126, 290, 38, 46, { v: 2, glans: false });
    s += P(M([[x1, straat], [x1, 194], [x1 + 160, 194], [x1 + 160, straat]], false), "l3") + R(x1 - 4, 188, 168, 6, "l3");
    s += raam(x1 + 22, 220, 48, 52, { v: 2, glans: false }) + raam(x1 + 92, 220, 48, 52, { v: 2, glans: false }) + raam(x1 + 22, 290, 118, 48, { v: 3, glans: false });
    // bomen en fietsen op de straat
    s += boom(96, 46, 196, { lobben: 13, basis: straat - 14 });
    s += fiets(566, false, straat - 14) + fiets(250, true, straat - 14);
    s += L(28, G + 0, 772, G, "l4");
    s += groep("g-annotatie", stramien([[x0, "A"], [x1, "B"]], straat) + maten([x0, cx, x1], 486) + peilenOp(724, straat, [0, 2.867, 5.2, 7.533]));
    return { svg: s, focus: [150, 64, 500, 420] };
  };
  function peilenOp(x, y0, niveaus) {
    var s = "";
    niveaus.forEach(function (h) {
      var y = y0 - h * S;
      s += P("M" + n(x) + "," + n(y) + "l-4.5,-7h9z", "l4 fz") + L(x - 10, y, x + 34, y, "l4") + T(x + 36, y + 3.5, h === 0 ? "±0" : "+" + h.toFixed(3).replace(".", ","), "tm", "start");
    });
    return s;
  }

  /* ---------- situatietekening voor de route ----------
     Vier bouwblokken met kavelgrenzen en binnenterrein, een straat of gracht ertussen, het perceel van de zaak in kleur. */
  function situatie(o, naam) {
    var s = "", W = 640, H = 420, i, hb = [0, 168, W, 52], vb = [272, 0, 56, 380];
    var blokken = [[16, 16, 240, 136], [344, 16, 280, 136], [16, 236, 240, 128], [344, 236, 280, 128]];
    s += R(0, 0, W, 380, "fz");
    blokken.forEach(function (b, k) {
      if (o.park === k) {
        s += R(b[0], b[1], b[2], b[3], "l2 fk");
        var pad = "M" + n(b[0]) + "," + n(b[1] + b[3] * 0.62) + "Q" + n(b[0] + b[2] * 0.45) + "," + n(b[1] + b[3] * 0.2) + " " + n(b[0] + b[2]) + "," + n(b[1] + b[3] * 0.45);
        s += P(pad, "l2 lw3");
        for (i = 0; i < 11; i++) s += C(b[0] + 22 + (i * 47) % (b[2] - 40), b[1] + 20 + ((i * 29) % (b[3] - 36)), 9 + (i % 3) * 2, "l3 fw");
        return;
      }
      if (o.land === k) {
        s += R(b[0], b[1], b[2], b[3], "l2 fk");
        for (i = 0; i < 4; i++) s += verticaal(b[0] + i * b[2] / 4, b[1], b[2] / 4, b[3], i % 2 ? 9 : 13, "l3");
        s += verticaal(b[0], b[1], b[2], b[3], b[2] / 4, "l2");
        return;
      }
      var dik = 26;
      s += R(b[0], b[1], b[2], b[3], "fw") + arceer(b[0], b[1], b[2], b[3], 5.5, "l3 lb");
      s += R(b[0] + dik, b[1] + dik, b[2] - 2 * dik, b[3] - 2 * dik, "l3 fz");
      // kavelgrenzen langs de randen
      var d = "", x, y;
      for (x = b[0] + 22; x < b[0] + b[2] - 10; x += 22 + (Math.round(x) % 3) * 4) d += "M" + n(x) + "," + n(b[1]) + "V" + n(b[1] + dik) + "M" + n(x) + "," + n(b[1] + b[3] - dik) + "V" + n(b[1] + b[3]);
      for (y = b[1] + 24; y < b[1] + b[3] - 10; y += 24) d += "M" + n(b[0]) + "," + n(y) + "H" + n(b[0] + dik) + "M" + n(b[0] + b[2] - dik) + "," + n(y) + "H" + n(b[0] + b[2]);
      s += P(d, "l3") + R(b[0], b[1], b[2], b[3], "l2");
    });
    // horizontale band: gracht of straat
    if (o.water) {
      s += R(hb[0], hb[1] + 6, hb[2], hb[3] - 12, "l2 fg");
      var golf = ""; for (i = 0; i < 9; i++) { var gx = 20 + i * 70 + (i % 2) * 14, gy = hb[1] + 20 + (i % 3) * 7; golf += "M" + gx + "," + gy + "q6,-3.5 12,0t12,0t12,0"; }
      s += P(golf, "l3") + T(W - 96, hb[1] + hb[3] / 2 + 4, o.water, "tm tk", "middle");
    } else {
      s += T(W - 96, hb[1] + hb[3] / 2 + 4, o.straat || "", "tm tk", "middle");
      s += L(0, hb[1] + hb[3] / 2, vb[0], hb[1] + hb[3] / 2, "l4 ls") + L(vb[0] + vb[2], hb[1] + hb[3] / 2, W, hb[1] + hb[3] / 2, "l4 ls");
    }
    // bomen langs de kade of de straat
    for (i = 0; i < 9; i++) { var tx = 34 + i * 72; if (tx > vb[0] - 8 && tx < vb[0] + vb[2] + 8) continue; s += C(tx, hb[1] - 1, 7.5, "l3 fk") + C(tx, hb[1] + hb[3] + 1, 7.5, "l3 fk"); }
    // dwarsstraat
    if (o.dwars) s += T(vb[0] + vb[2] / 2 + 4, 98, o.dwars, "tm tk", "middle", { transform: "rotate(-90 " + (vb[0] + vb[2] / 2 + 4) + " 98)" });
    // het perceel van de zaak
    var p = o.perceel || [196, 92, 60, 60];
    s += R(p[0], p[1], p[2], p[3], "l1 fa") + C(p[0] + p[2] / 2, p[1] + p[3] / 2, 4.5, "fw") + C(p[0] + p[2] / 2, p[1] + p[3] / 2, 11, "l2 lw");
    s += naamTekst(p[0] + p[2] / 2 - 110, p[1] - 12, 220, 13, naam, "middle", "tn-kaart");
    // legenda: schaalstok en noordpijl
    s += L(0, 380, W, 380, "l2");
    s += R(16, 396, 32, 6, "l2 fd") + R(48, 396, 32, 6, "l2 fw") + R(80, 396, 64, 6, "l2 fd") + T(16, 415, "0", "tm") + T(80, 415, "20", "tm", "middle") + T(144, 415, "50 m", "tm", "middle");
    s += T(W - 58, 404, "situatie", "tm", "end") + T(W - 58, 416, "1:2000", "tm", "end");
    s += C(W - 30, 400, 15, "l2 fw") + P("M" + (W - 30) + ",388l6,20l-6,-5l-6,5z", "fd");
    return s;
  }

  /* ---------- uitgang ---------- */
  window.GEVELS = {
    soorten: Object.keys(TEK),
    teken: function (soort, naam, o) {
      o = o || {};
      stijl = o.stijl || "serif";
      var r = (TEK[soort] || TEK.kapper)(naam, ++uid);
      var vb = o.focus ? r.focus : (r.breed || [0, 0, 800, 520]);
      return '<svg viewBox="' + vb.join(" ") + '" role="img" aria-label="' + esc(o.label || "Tekening van de gevel") + '" preserveAspectRatio="xMidYMid meet">' + r.svg + "</svg>";
    },
    kaart: function (o, naam, stijlKey) {
      stijl = stijlKey || "serif";
      return '<svg viewBox="0 0 640 420" role="img" aria-label="Situatietekening">' + situatie(o || {}, naam) + "</svg>";
    }
  };
})();

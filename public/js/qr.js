/* Van Sonsbeek: QR-codes maken, zonder iets van een andere site te laden.
   Werkt in de browser (window.QR) en op de server (require). Tekst gaat als UTF-8 in byte-modus;
   foutcorrectie L, M, Q of H (standaard M: een kwart van de code mag beschadigd zijn).
   Volgt ISO/IEC 18004. De tabellen en de werkwijze zijn dezelfde als in de bekende QR-generator van Project Nayuki.
     QR.maak("https://…")              -> { grootte, versie, rijen }   rijen[y][x] is true voor een donker vakje
     QR.svg("https://…", { titel, kleur, rand, klasse })  -> "<svg …>"  met een witte rand van 4 vakjes */
(function (wortel, bouw) {
  var QR = bouw();
  if (typeof module === "object" && module.exports) module.exports = QR;
  else wortel.QR = QR;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  var NIVEAU = { L: 0, M: 1, Q: 2, H: 3 };
  var FORMAAT = [1, 0, 3, 2];                       // de twee bits voor het niveau in de formaatinformatie
  // per niveau (L, M, Q, H) en per versie (1 t/m 40): foutcorrectie-codewoorden per blok, en het aantal blokken
  var ECC_PER_BLOK = [
    [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
  ];
  var BLOKKEN = [
    [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
    [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
    [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]
  ];

  // vakjes waar data in past, na aftrek van zoekers, tijdlijnen, uitlijning, formaat en versie
  function ruweVakjes(v) {
    var r = (16 * v + 128) * v + 64;
    if (v >= 2) {
      var n = Math.floor(v / 7) + 2;
      r -= (25 * n - 10) * n - 55;
      if (v >= 7) r -= 36;
    }
    return r;
  }
  function dataWoorden(v, e) { return Math.floor(ruweVakjes(v) / 8) - ECC_PER_BLOK[e][v] * BLOKKEN[e][v]; }

  /* Reed-Solomon in GF(256) met x^8 + x^4 + x^3 + x^2 + 1 */
  function maal(x, y) {
    var z = 0;
    for (var i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11d);
      z ^= ((y >>> i) & 1) * x;
    }
    return z;
  }
  function deler(graad) {
    var r = [], i, j, w = 1;
    for (i = 0; i < graad - 1; i++) r.push(0);
    r.push(1);
    for (i = 0; i < graad; i++) {
      for (j = 0; j < r.length; j++) {
        r[j] = maal(r[j], w);
        if (j + 1 < r.length) r[j] ^= r[j + 1];
      }
      w = maal(w, 0x02);
    }
    return r;
  }
  function rest(data, d) {
    var r = d.map(function () { return 0; });
    data.forEach(function (b) {
      var f = b ^ r.shift();
      r.push(0);
      d.forEach(function (c, i) { r[i] ^= maal(c, f); });
    });
    return r;
  }

  function utf8(s) {
    if (typeof TextEncoder !== "undefined") return Array.prototype.slice.call(new TextEncoder().encode(s));
    var u = unescape(encodeURIComponent(s)), r = [];
    for (var i = 0; i < u.length; i++) r.push(u.charCodeAt(i));
    return r;
  }

  function maak(tekst, o) {
    o = o || {};
    var e = NIVEAU[String(o.ecc || "M").toUpperCase()];
    if (e == null) e = 1;
    var data = utf8(String(tekst)), v, cap, i, j, x, y;

    /* 1. kleinste versie waar de tekst in past */
    for (v = 1; v <= 40; v++) {
      cap = dataWoorden(v, e) * 8;
      if (4 + (v < 10 ? 8 : 16) + data.length * 8 <= cap) break;
    }
    if (v > 40) throw new Error("Te lang voor een QR-code");

    /* 2. bits: modus (byte), lengte, data, afsluiter, opvulling */
    var bits = [];
    function zet(waarde, lengte) { for (var k = lengte - 1; k >= 0; k--) bits.push((waarde >>> k) & 1); }
    zet(4, 4);
    zet(data.length, v < 10 ? 8 : 16);
    data.forEach(function (b) { zet(b, 8); });
    zet(0, Math.min(4, cap - bits.length));
    zet(0, (8 - bits.length % 8) % 8);
    for (var p = 0xec; bits.length < cap; p ^= 0xec ^ 0x11) zet(p, 8);
    var woorden = [];
    for (i = 0; i < bits.length; i += 8) {
      var b = 0;
      for (j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
      woorden.push(b);
    }

    /* 3. foutcorrectie per blok, daarna de blokken verweven */
    var aantal = BLOKKEN[e][v], eccLen = ECC_PER_BLOK[e][v], ruw = Math.floor(ruweVakjes(v) / 8);
    var kort = aantal - ruw % aantal, kortLen = Math.floor(ruw / aantal), d = deler(eccLen), blokken = [];
    for (i = 0, j = 0; i < aantal; i++) {
      var stuk = woorden.slice(j, j + kortLen - eccLen + (i < kort ? 0 : 1));
      j += stuk.length;
      var ecc = rest(stuk, d);
      if (i < kort) stuk.push(0);
      blokken.push(stuk.concat(ecc));
    }
    var alles = [];
    for (i = 0; i < blokken[0].length; i++) {
      for (j = 0; j < blokken.length; j++) {
        if (i !== kortLen - eccLen || j >= kort) alles.push(blokken[j][i]);
      }
    }

    /* 4. het raster met de vaste patronen */
    var n = v * 4 + 17, m = [], f = [];
    for (y = 0; y < n; y++) {
      m.push([]); f.push([]);
      for (x = 0; x < n; x++) { m[y].push(false); f[y].push(false); }
    }
    function vast(x, y, donker) { m[y][x] = donker; f[y][x] = true; }
    for (i = 0; i < n; i++) { vast(6, i, i % 2 === 0); vast(i, 6, i % 2 === 0); }
    function zoeker(cx, cy) {
      for (var dy = -4; dy <= 4; dy++) {
        for (var dx = -4; dx <= 4; dx++) {
          var xx = cx + dx, yy = cy + dy, afst = Math.max(Math.abs(dx), Math.abs(dy));
          if (xx >= 0 && xx < n && yy >= 0 && yy < n) vast(xx, yy, afst !== 2 && afst !== 4);
        }
      }
    }
    zoeker(3, 3); zoeker(n - 4, 3); zoeker(3, n - 4);
    var pos = [];
    if (v > 1) {
      var stuks = Math.floor(v / 7) + 2, stap = v === 32 ? 26 : Math.ceil((v * 4 + 4) / (stuks * 2 - 2)) * 2;
      pos = [6];
      for (var q = n - 7; pos.length < stuks; q -= stap) pos.splice(1, 0, q);
    }
    pos.forEach(function (a, ai) {
      pos.forEach(function (b, bi) {
        var hoek = (ai === 0 && bi === 0) || (ai === 0 && bi === pos.length - 1) || (ai === pos.length - 1 && bi === 0);
        if (hoek) return;
        for (var dy = -2; dy <= 2; dy++) {
          for (var dx = -2; dx <= 2; dx++) vast(a + dx, b + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
      });
    });
    function formaat(masker) {
      var dd = FORMAAT[e] << 3 | masker, r = dd, k;
      for (k = 0; k < 10; k++) r = (r << 1) ^ ((r >>> 9) * 0x537);
      var fb = (dd << 10 | r) ^ 0x5412;
      var bit = function (k) { return ((fb >>> k) & 1) !== 0; };
      for (k = 0; k <= 5; k++) vast(8, k, bit(k));
      vast(8, 7, bit(6)); vast(8, 8, bit(7)); vast(7, 8, bit(8));
      for (k = 9; k < 15; k++) vast(14 - k, 8, bit(k));
      for (k = 0; k < 8; k++) vast(n - 1 - k, 8, bit(k));
      for (k = 8; k < 15; k++) vast(8, n - 15 + k, bit(k));
      vast(8, n - 8, true);
    }
    formaat(0);
    if (v >= 7) {
      var r = v;
      for (i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1f25);
      var vb = v << 12 | r;
      for (i = 0; i < 18; i++) {
        var dk = ((vb >>> i) & 1) !== 0, a = n - 11 + i % 3, c = Math.floor(i / 3);
        vast(a, c, dk); vast(c, a, dk);
      }
    }

    /* 5. de data in een zigzag van rechtsonder naar boven */
    var k2 = 0, totaal = alles.length * 8;
    for (var rechts = n - 1; rechts >= 1; rechts -= 2) {
      if (rechts === 6) rechts = 5;
      for (var vert = 0; vert < n; vert++) {
        for (j = 0; j < 2; j++) {
          x = rechts - j;
          y = ((rechts + 1) & 2) === 0 ? n - 1 - vert : vert;
          if (!f[y][x] && k2 < totaal) {
            m[y][x] = ((alles[k2 >>> 3] >>> (7 - (k2 & 7))) & 1) !== 0;
            k2++;
          }
        }
      }
    }

    /* 6. het masker met de laagste strafpunten */
    function masker(nr) {
      for (var yy = 0; yy < n; yy++) {
        for (var xx = 0; xx < n; xx++) {
          if (f[yy][xx]) continue;
          var inv;
          switch (nr) {
            case 0: inv = (xx + yy) % 2 === 0; break;
            case 1: inv = yy % 2 === 0; break;
            case 2: inv = xx % 3 === 0; break;
            case 3: inv = (xx + yy) % 3 === 0; break;
            case 4: inv = (Math.floor(xx / 3) + Math.floor(yy / 2)) % 2 === 0; break;
            case 5: inv = xx * yy % 2 + xx * yy % 3 === 0; break;
            case 6: inv = (xx * yy % 2 + xx * yy % 3) % 2 === 0; break;
            default: inv = ((xx + yy) % 2 + xx * yy % 3) % 2 === 0;
          }
          if (inv) m[yy][xx] = !m[yy][xx];
        }
      }
    }
    function straf() {
      var s = 0, yy, xx, t;
      for (var richting = 0; richting < 2; richting++) {
        for (var a1 = 0; a1 < n; a1++) {
          var lijn = [];
          for (var b1 = 0; b1 < n; b1++) lijn.push(richting ? m[b1][a1] : m[a1][b1]);
          var run = 1;
          for (t = 1; t <= n; t++) {                       // regel 1: vijf of meer gelijke op een rij
            if (t < n && lijn[t] === lijn[t - 1]) run++;
            else { if (run >= 5) s += run - 2; run = 1; }
          }
          for (t = 0; t + 7 <= n; t++) {                   // regel 3: iets dat op een zoeker lijkt
            if (lijn[t] && !lijn[t + 1] && lijn[t + 2] && lijn[t + 3] && lijn[t + 4] && !lijn[t + 5] && lijn[t + 6]) {
              var voor = true, na = true;
              for (var u = 1; u <= 4; u++) {
                if (t - u >= 0 && lijn[t - u]) voor = false;
                if (t + 6 + u < n && lijn[t + 6 + u]) na = false;
              }
              if (voor) s += 40;
              if (na) s += 40;
            }
          }
        }
      }
      for (yy = 0; yy < n - 1; yy++) {                     // regel 2: blokjes van twee bij twee
        for (xx = 0; xx < n - 1; xx++) {
          var c1 = m[yy][xx];
          if (c1 === m[yy][xx + 1] && c1 === m[yy + 1][xx] && c1 === m[yy + 1][xx + 1]) s += 3;
        }
      }
      var donker = 0;                                      // regel 4: verhouding donker en licht
      for (yy = 0; yy < n; yy++) for (xx = 0; xx < n; xx++) if (m[yy][xx]) donker++;
      var stap5 = Math.ceil(Math.abs(donker * 20 - n * n * 10) / (n * n)) - 1;
      return s + Math.max(0, stap5) * 10;
    }
    var beste = 0, laagste = Infinity;
    for (var nr = 0; nr < 8; nr++) {
      masker(nr); formaat(nr);
      var st = straf();
      if (st < laagste) { laagste = st; beste = nr; }
      masker(nr);                                          // terugdraaien: een masker is zijn eigen omgekeerde
    }
    masker(beste); formaat(beste);
    return { grootte: n, versie: v, rijen: m };
  }

  function escXml(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function svg(tekst, o) {
    o = o || {};
    var q = maak(tekst, o), rand = o.rand == null ? 4 : o.rand, n = q.grootte, w = n + 2 * rand, d = "";
    for (var y = 0; y < n; y++) {
      for (var x = 0; x < n;) {
        if (!q.rijen[y][x]) { x++; continue; }
        var s = x;
        while (x < n && q.rijen[y][x]) x++;
        d += "M" + (s + rand) + " " + (y + rand) + "h" + (x - s) + "v1h-" + (x - s) + "z";
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + " " + w + '"' + (o.klasse ? ' class="' + escXml(o.klasse) + '"' : "") +
      (o.titel ? ' role="img" aria-label="' + escXml(o.titel) + '"' : ' aria-hidden="true"') + ' shape-rendering="crispEdges">' +
      '<rect width="' + w + '" height="' + w + '" fill="#fff"/><path d="' + d + '" fill="' + escXml(o.kleur || "#000") + '"/></svg>';
  }

  return { maak: maak, svg: svg };
});

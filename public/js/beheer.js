/* Beheer: kopieerknoppen en printen. Alles werkt ook zonder dit script, alleen kopieer je dan zelf. */
(function () {
  "use strict";
  document.addEventListener("click", function (e) {
    var k = e.target.closest("[data-kopieer]");
    if (k) {
      var veld = document.getElementById(k.getAttribute("data-kopieer"));
      if (!veld) return;
      var klaar = function (ok) {
        k.textContent = ok ? "Gekopieerd" : "Kopieer zelf";
        if (!ok) { veld.focus(); veld.select(); }
        setTimeout(function () { k.textContent = "Kopieer"; }, 2200);
      };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(veld.value).then(function () { klaar(true); }, function () { klaar(false); });
      else klaar(false);
      return;
    }
    if (e.target.closest("[data-print]")) window.print();
  });
  // de printknop onderaan Langsgaan doet pas iets als er een zaak is aangevinkt
  var form = document.querySelector(".bh-links");
  if (form) {
    var knop = form.querySelector('button[type="submit"]');
    var stand = function () { knop.disabled = !form.querySelector('input[name="code"]:checked'); };
    form.addEventListener("change", stand);
    stand();
  }
})();

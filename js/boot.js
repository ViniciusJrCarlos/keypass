/* Carregado antes do CSS para aplicar o tema sem "piscar" (CSP não permite script inline). */
(function () {
  try {
    var cores = { claro: "#2F7D52", contraste: "#0B3D22", escuro: "#10241A" };
    var t = localStorage.getItem("keypass-tema");
    if (!cores[t]) t = "claro";
    document.documentElement.setAttribute("data-tema", t);
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", cores[t]);
    var c = JSON.parse(localStorage.getItem("keypass-config-v1") || "{}");
    if (c && c.discreet) document.title = c.discreetName || "Notas";
  } catch (e) {}
})();

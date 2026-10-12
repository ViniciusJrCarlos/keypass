/* Início: categorias grandes e visuais. */
import * as vault from "../vault.js";
import { CATEGORIES } from "../categories.js";
import { h } from "../ui/dom.js";
import { catIcon, icon } from "../ui/icons.js";

export function render({ app }) {
  const all = vault.entries();
  const count = (id) => all.filter((e) => e.category === id).length;

  const tiles = CATEGORIES.map((c) => {
    const n = count(c.id);
    return h(
      "a",
      { class: `tile tile-${c.id}`, href: `#/cat/${c.id}`, "aria-label": `${c.label}: ${n} senha${n === 1 ? "" : "s"}` },
      catIcon(c.icon),
      h("span", { class: "tile-label", text: c.label }),
      n ? h("span", { class: "tile-count", text: String(n) }) : null
    );
  });

  const node = h(
    "section",
    { class: "screen home" },
    h(
      "div",
      { class: "hero" },
      h("div", { class: "hero-txt" }, h("h2", { class: "hero-title", text: "Olá!" }), h("p", { class: "hero-sub", text: "Aqui estão suas categorias de senhas." })),
      h("img", { src: "assets/img/planta.png", alt: "", class: "hero-img", width: "110", height: "146" })
    ),
    h(
      "form",
      { class: "search", role: "search", onsubmit: (e) => { e.preventDefault(); const q = e.target.q.value.trim(); app.go(q ? `senhas/${encodeURIComponent(q)}` : "senhas"); } },
      icon("search"),
      h("input", { name: "q", type: "search", class: "search-input", placeholder: "Buscar senha", "aria-label": "Buscar senha", autocomplete: "off" })
    ),
    h("div", { class: "tiles" }, tiles),
    all.length
      ? null
      : h("div", { class: "hint-card" }, icon("plus"), h("p", { text: "Toque no botão + para guardar sua primeira senha." }))
  );
  return { node, nav: "inicio", fab: true };
}

/* Lista de acessos: por categoria (#/cat/banco) ou todas (#/senhas[/busca]). */
import * as vault from "../vault.js";
import { category } from "../categories.js";
import { h, hostOf, openSite } from "../ui/dom.js";
import { icon } from "../ui/icons.js";
import { copySecret } from "../ui/clipboard.js";

function norm(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function card(e, app) {
  const c = category(e.category);
  const host = hostOf(e.url);
  return h(
    "article",
    { class: "entry" },
    h(
      "a",
      { class: "entry-main", href: `#/item/${encodeURIComponent(e.id)}` },
      h("span", { class: `avatar avatar-${c.id}`, "aria-hidden": "true", text: (e.name || "?").trim().charAt(0).toUpperCase() }),
      h("span", { class: "entry-txt" },
        h("span", { class: "entry-name", text: e.name || "(sem nome)" }),
        h("span", { class: "entry-user", text: e.user || host || c.label }))
    ),
    h(
      "div",
      { class: "entry-actions" },
      e.password
        ? h("button", { type: "button", class: "btn btn-soft btn-sm", onclick: () => copySecret(e.password) }, icon("copy"), "Copiar Senha")
        : null,
      host
        ? h("button", { type: "button", class: "link-btn link-site", onclick: () => openSite(e.url) }, icon("globe"), "Abrir Site")
        : null
    )
  );
}

export function render({ app, name, arg }) {
  const isCat = name === "cat";
  const cat = isCat ? category(arg) : null;
  const title = isCat ? cat.plural : "Minhas senhas";
  const list = h("div", { class: "entries" });
  const empty = h("div", { class: "empty" });
  const search = h("input", {
    type: "search",
    class: "search-input",
    placeholder: "Buscar pelo nome, usuário ou site",
    "aria-label": "Buscar",
    autocomplete: "off",
    value: !isCat && arg ? arg : "",
  });

  const base = vault.entries().filter((e) => !isCat || e.category === cat.id);

  const draw = () => {
    const q = norm(search.value.trim());
    const items = q ? base.filter((e) => norm(`${e.name} ${e.user} ${e.url} ${e.note}`).includes(q)) : base;
    list.replaceChildren(...items.map((e) => card(e, app)));
    empty.replaceChildren();
    if (!items.length) {
      empty.append(
        h("p", { class: "empty-txt", text: q ? "Nada encontrado." : "Nenhuma senha guardada aqui ainda." }),
        q ? null : h("a", { class: "btn btn-primary", href: isCat ? `#/novo/${cat.id}` : "#/novo" }, icon("plus"), "Adicionar senha")
      );
    }
  };
  search.addEventListener("input", draw);
  draw();

  const node = h(
    "section",
    { class: "screen list" },
    isCat ? h("h2", { class: "screen-title", text: title }) : null,
    h("div", { class: "search" }, icon("search"), search),
    base.length ? h("p", { class: "tip" }, icon("shield"), "Toque no nome para ver tudo. O botão copia a senha.") : null,
    list,
    empty
  );
  return {
    node,
    title,
    nav: isCat ? "inicio" : "senhas",
    fab: true,
    header: isCat ? { back: "inicio", title: cat.label } : { sub: "Minhas senhas" },
  };
}

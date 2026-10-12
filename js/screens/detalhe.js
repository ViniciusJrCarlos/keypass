/* Detalhes de um acesso: copiar, revelar por alguns segundos, abrir site, editar, excluir. */
import * as vault from "../vault.js";
import { category } from "../categories.js";
import { h, hostOf, openSite } from "../ui/dom.js";
import { icon, catIcon } from "../ui/icons.js";
import { copySecret, copyText } from "../ui/clipboard.js";
import { confirmDlg } from "../ui/dialog.js";
import { toast } from "../ui/toast.js";

const MASK = "••••••••••";

export function render({ app, arg }) {
  const e = vault.getEntry(arg);
  if (!e) {
    return {
      node: h("section", { class: "screen" }, h("div", { class: "empty" }, h("p", { class: "empty-txt", text: "Esta senha não existe mais." }), h("a", { class: "btn btn-primary", href: "#/inicio" }, "Voltar ao início"))),
      header: { back: "inicio", title: "Senha" },
    };
  }
  const c = category(e.category);
  const host = hostOf(e.url);

  const pwText = h("span", { class: "secret", text: e.password ? MASK : "—" });
  let t = null;
  const eye = h("button", { type: "button", class: "icon-btn soft", "aria-label": "Mostrar senha", title: "Mostrar senha" }, icon("eye"));
  const show = (on) => {
    pwText.textContent = on ? e.password : MASK;
    pwText.classList.toggle("shown", on);
    eye.replaceChildren(icon(on ? "eyeOff" : "eye"));
    eye.setAttribute("aria-label", on ? "Esconder senha" : "Mostrar senha");
    clearTimeout(t);
    if (on) t = setTimeout(() => show(false), 10000);
  };
  eye.addEventListener("click", () => show(!pwText.classList.contains("shown")));

  const row = (ic, label, value, extra) =>
    h("div", { class: "detail-row" }, h("span", { class: "row-ic" }, icon(ic)), h("div", { class: "row-txt" }, h("span", { class: "row-label", text: label }), value), extra || null);

  const node = h(
    "section",
    { class: "screen detail" },
    h("div", { class: "detail-head" },
      h("span", { class: `detail-cat tile-${c.id}` }, catIcon(c.icon)),
      h("div", {}, h("h2", { class: "detail-name", text: e.name }), h("span", { class: "chip", text: c.label }))),
    h(
      "div",
      { class: "card" },
      row("user", "Usuário", h("span", { class: "row-value", text: e.user || "—" }),
        e.user ? h("button", { type: "button", class: "icon-btn soft", "aria-label": "Copiar usuário", title: "Copiar usuário", onclick: () => copyText(e.user, "Usuário copiado!") }, icon("copy")) : null),
      row("lock", "Senha", pwText, e.password ? eye : null),
      row("globe", "Site", h("span", { class: "row-value", text: host || "—" })),
      e.note ? row("note", "Observação", h("span", { class: "row-value pre", text: e.note })) : null
    ),
    h(
      "div",
      { class: "big-actions" },
      e.password ? h("button", { type: "button", class: "btn btn-primary btn-xl", onclick: () => copySecret(e.password) }, icon("copy"), "Copiar Senha") : null,
      e.user ? h("button", { type: "button", class: "btn btn-soft btn-lg", onclick: () => copyText(e.user, "Usuário copiado!") }, icon("user"), "Copiar Usuário") : null,
      host ? h("button", { type: "button", class: "btn btn-soft btn-lg", onclick: () => openSite(e.url) }, icon("globe"), "Abrir Site") : null
    ),
    h(
      "div",
      { class: "row-actions" },
      h("a", { class: "btn btn-outline", href: `#/editar/${encodeURIComponent(e.id)}` }, icon("edit"), "Editar"),
      h("button", {
        type: "button",
        class: "btn btn-danger-soft",
        onclick: async () => {
          const ok = await confirmDlg("Excluir esta senha?", `“${e.name}” será apagada deste aparelho. Isso não pode ser desfeito.`, { ok: "Excluir", danger: true });
          if (!ok) return;
          await vault.deleteEntry(e.id);
          toast("Senha excluída.");
          app.go(`cat/${c.id}`, { replace: true });
        },
      }, icon("trash"), "Excluir")
    ),
    h("p", { class: "muted small", text: `Atualizado em ${new Date(e.updatedAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}` })
  );
  return { node, title: e.name, nav: "senhas", header: { back: `cat/${c.id}`, title: "Detalhes" } };
}

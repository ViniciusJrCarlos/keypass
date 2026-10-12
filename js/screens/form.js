/* Nova senha / editar senha. */
import * as vault from "../vault.js";
import { CATEGORIES, category } from "../categories.js";
import { generate } from "../generator.js";
import { h, safeUrl } from "../ui/dom.js";
import { icon } from "../ui/icons.js";
import { passwordField } from "../ui/password-field.js";
import { toast } from "../ui/toast.js";

export function render({ app, name, arg }) {
  const editing = name === "editar";
  const e = editing ? vault.getEntry(arg) : null;
  if (editing && !e) {
    app.go("inicio", { replace: true });
    return { node: h("div") };
  }
  const presetCat = !editing && arg ? category(arg).id : "";

  const text = (fname, label, placeholder, value, attrs = {}) => {
    const input = h("input", { name: fname, class: "input", placeholder, value: value || "", autocomplete: "off", ...attrs });
    return { input, el: h("label", { class: "field" }, h("span", { class: "field-label", text: label }), input) };
  };
  const fName = text("name", "Nome do site", "Ex.: Gmail, Banco, Netflix", e && e.name, { required: true, maxlength: "120" });
  const fUrl = text("url", "Link", "Ex.: https://www.exemplo.com", e && e.url, { type: "url", inputmode: "url", autocapitalize: "off", maxlength: "500" });
  const fUser = text("user", "Usuário", "Ex.: seuemail@email.com", e && e.user, { autocapitalize: "off", spellcheck: "false", maxlength: "200" });
  const fPw = passwordField({ label: "Senha", placeholder: "Digite sua senha", autocomplete: "new-password", value: e ? e.password : "" });
  if (app.state.pendingPassword) {
    fPw.input.value = app.state.pendingPassword;
    app.state.pendingPassword = null;
  }
  const genBtn = h("button", {
    type: "button",
    class: "link-btn gen-link",
    onclick: () => {
      fPw.input.value = generate({ length: 16 });
      fPw.input.type = "text";
      setTimeout(() => fPw.hide(), 8000);
      toast("Senha forte criada.");
    },
  }, icon("wand"), "Gerar senha forte");

  const sel = h("select", { name: "category", class: "input select", required: true },
    h("option", { value: "", text: "Selecione uma categoria", disabled: true }),
    CATEGORIES.map((c) => h("option", { value: c.id, text: c.label })));
  sel.value = e ? e.category : presetCat || "";
  const fCat = h("label", { class: "field" }, h("span", { class: "field-label", text: "Categoria" }), sel);

  const note = h("textarea", { name: "note", class: "input textarea", rows: "3", placeholder: "Opcional (ex.: pergunta de segurança)", maxlength: "2000" });
  note.value = e ? e.note : "";
  const fNote = h("label", { class: "field" }, h("span", { class: "field-label", text: "Observação" }), note);

  const err = h("p", { class: "form-erro", role: "alert" });
  const withIc = (ic, field, extra) => h("div", { class: "form-row" }, h("span", { class: "row-ic big" }, icon(ic)), h("div", { class: "form-col" }, field, extra || null));

  const node = h(
    "form",
    {
      class: "screen form",
      autocomplete: "off",
      novalidate: true,
      onsubmit: async (ev) => {
        ev.preventDefault();
        err.textContent = "";
        if (!fName.input.value.trim()) { err.textContent = "Digite o nome do site."; fName.input.focus(); return; }
        if (fUrl.input.value.trim() && !safeUrl(fUrl.input.value)) { err.textContent = "O link não parece válido."; fUrl.input.focus(); return; }
        if (!sel.value) { err.textContent = "Escolha uma categoria."; sel.focus(); return; }
        const saved = await vault.saveEntry({
          id: e ? e.id : undefined,
          name: fName.input.value,
          url: fUrl.input.value.trim() ? safeUrl(fUrl.input.value) : "",
          user: fUser.input.value,
          password: fPw.input.value,
          category: sel.value,
          note: note.value,
        });
        fPw.input.value = "";
        toast(editing ? "Alterações salvas!" : "Senha guardada!");
        app.go(`item/${encodeURIComponent(saved.id)}`, { replace: true });
      },
    },
    h("div", { class: "form-head" },
      h("span", { class: "head-ic" }, icon("lock")),
      h("div", {}, h("h2", { class: "screen-title", text: editing ? "Editar Senha" : "Nova Senha" }), h("p", { class: "muted", text: "Preencha as informações abaixo" }))),
    h("div", { class: "card form-card" },
      withIc("globe", fName.el),
      withIc("link", fUrl.el),
      withIc("user", fUser.el),
      withIc("lock", fPw.el, genBtn),
      withIc("grid", fCat),
      withIc("note", fNote)),
    err,
    h("button", { type: "submit", class: "btn btn-primary btn-xl" }, "Salvar", icon("check")),
    h("div", { class: "safe-note" }, icon("shield"),
      h("p", {}, "Suas informações são protegidas e armazenadas com segurança. ", h("strong", { text: "Você tem o controle total." })))
  );
  return {
    node,
    title: editing ? "Editar senha" : "Nova senha",
    header: { back: editing ? `item/${encodeURIComponent(e.id)}` : "inicio", title: editing ? "Editar" : "Nova Senha" },
    focus: () => { if (!editing) fName.input.focus(); },
  };
}

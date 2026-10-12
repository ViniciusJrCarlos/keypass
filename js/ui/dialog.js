/* Diálogos (folha que sobe no celular, janela central no PC). Retornam Promise. */
import { h } from "./dom.js";
import { passwordField } from "./password-field.js";

let openCount = 0;

/**
 * sheet({ title, text, body, actions:[{label, value, kind}], onSubmit })
 * Resolve com o value da ação escolhida (ou null ao cancelar).
 * onSubmit(value) pode retornar false para manter aberto (validação).
 */
export function sheet({ title, text, body, actions = [{ label: "OK", value: true, kind: "primary" }], onSubmit, icon } = {}) {
  return new Promise((resolve) => {
    const prevFocus = document.activeElement;
    const close = (v) => {
      wrap.classList.remove("show");
      document.removeEventListener("keydown", onKey);
      setTimeout(() => wrap.remove(), 200);
      openCount--;
      if (prevFocus && prevFocus.focus) prevFocus.focus();
      resolve(v);
    };
    const choose = async (v) => {
      if (onSubmit && v !== null && v !== false) {
        const ok = await onSubmit(v);
        if (ok === false) return;
      }
      close(v);
    };
    const onKey = (e) => { if (e.key === "Escape") close(null); };

    const form = h(
      "form",
      { class: "sheet", role: "dialog", "aria-modal": "true", "aria-label": title || "Aviso", onsubmit: (e) => { e.preventDefault(); const p = actions.find((a) => a.kind === "primary" || a.kind === "danger"); choose(p ? p.value : true); } },
      h("div", { class: "sheet-grip", "aria-hidden": "true" }),
      icon || null,
      title ? h("h2", { class: "sheet-title", text: title }) : null,
      text ? h("p", { class: "sheet-text", text }) : null,
      body || null,
      h(
        "div",
        { class: "sheet-actions" },
        actions.map((a) =>
          h("button", {
            type: a.kind === "primary" || a.kind === "danger" ? "submit" : "button",
            class: "btn " + (a.kind === "primary" ? "btn-primary" : a.kind === "danger" ? "btn-danger" : "btn-soft"),
            onclick: a.kind === "primary" || a.kind === "danger" ? null : () => choose(a.value),
          }, a.label)
        )
      )
    );
    const wrap = h("div", { class: "sheet-wrap", onclick: (e) => { if (e.target === wrap) close(null); } }, form);
    document.body.append(wrap);
    openCount++;
    document.addEventListener("keydown", onKey);
    requestAnimationFrame(() => {
      wrap.classList.add("show");
      const f = form.querySelector("input, select, textarea") || form.querySelector(".btn-primary, .btn-danger, .btn");
      if (f) f.focus();
    });
  });
}

export const isDialogOpen = () => openCount > 0;

export function alertDlg(title, text) {
  return sheet({ title, text, actions: [{ label: "Entendi", value: true, kind: "primary" }] });
}

export async function confirmDlg(title, text, { ok = "Confirmar", danger = false } = {}) {
  const v = await sheet({
    title,
    text,
    actions: [
      { label: "Cancelar", value: false },
      { label: ok, value: true, kind: danger ? "danger" : "primary" },
    ],
  });
  return v === true;
}

/** Escolha entre opções: options = [{label, value, kind}] */
export function chooseDlg(title, text, options) {
  return sheet({ title, text, actions: [...options, { label: "Cancelar", value: null }] });
}

/**
 * Pede uma senha/código. validate(valor) → mensagem de erro ou "" (pode ser async).
 * Resolve com o valor digitado, ou null.
 */
export async function askSecret(title, text, { label = "Senha mestra", pin = false, ok = "Continuar", validate } = {}) {
  const field = passwordField({ label, pin, autocomplete: pin ? "off" : "current-password" });
  const err = h("p", { class: "form-erro", role: "alert" });
  let value = null;
  const res = await sheet({
    title,
    text,
    body: h("div", { class: "sheet-body" }, field.el, err),
    actions: [{ label: "Cancelar", value: null }, { label: ok, value: "ok", kind: "primary" }],
    onSubmit: async () => {
      const v = field.input.value;
      err.textContent = "";
      if (!v) { err.textContent = "Digite para continuar."; return false; }
      if (validate) {
        field.input.disabled = true;
        const m = await validate(v);
        field.input.disabled = false;
        if (m) { err.textContent = m; field.input.select(); field.input.focus(); return false; }
      }
      value = v;
      return true;
    },
  });
  field.input.value = "";
  return res ? value : null;
}

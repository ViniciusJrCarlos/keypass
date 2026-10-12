/* Primeiro uso: criar a senha mestra. */
import * as vault from "../vault.js";
import { strength, masterProblem } from "../auth.js";
import { h } from "../ui/dom.js";
import { icon } from "../ui/icons.js";
import { passwordField } from "../ui/password-field.js";

export function render({ app }) {
  const pw = passwordField({ label: "Crie sua senha mestra", placeholder: "Mínimo de 8 caracteres", autocomplete: "new-password" });
  const pw2 = passwordField({ label: "Repita a senha mestra", placeholder: "Digite de novo", autocomplete: "new-password" });
  const bar = h("span", { class: "meter-fill" });
  const meterTxt = h("span", { class: "meter-txt", text: " " });
  const meter = h("div", { class: "meter", "aria-live": "polite" }, h("span", { class: "meter-track" }, bar), meterTxt);
  const err = h("p", { class: "form-erro", role: "alert" });
  const btn = h("button", { type: "submit", class: "btn btn-primary btn-xl" }, icon("check"), "Criar meu cofre");

  pw.input.addEventListener("input", () => {
    const v = pw.input.value;
    const s = strength(v);
    meter.dataset.score = v ? String(s.score) : "";
    bar.style.setProperty("--pct", v ? `${(s.score + 1) * 20}%` : "0%");
    meterTxt.textContent = v ? `Força: ${s.label}` : " ";
  });

  const node = h(
    "form",
    {
      class: "auth",
      autocomplete: "off",
      onsubmit: async (e) => {
        e.preventDefault();
        err.textContent = "";
        const m = masterProblem(pw.input.value, pw2.input.value);
        if (m) { err.textContent = m; return; }
        btn.disabled = true;
        btn.lastChild.textContent = "Criando…";
        try {
          await vault.create(pw.input.value);
          pw.input.value = pw2.input.value = "";
          app.onUnlocked();
        } catch (ex) {
          console.error(ex);
          err.textContent = "Não foi possível criar o cofre neste navegador.";
          btn.disabled = false;
          btn.lastChild.textContent = "Criar meu cofre";
        }
      },
    },
    h("img", { src: "assets/img/logo.png", alt: "", class: "auth-logo", width: "120", height: "145" }),
    h("h1", { class: "auth-title", text: "Bem-vindo ao KeyPass" }),
    h("p", { class: "auth-sub", text: "Crie uma senha mestra. Ela abre o app e protege todas as suas senhas." }),
    pw.el,
    meter,
    pw2.el,
    err,
    btn,
    h("div", { class: "auth-tip" },
      icon("alert"),
      h("p", { text: "Anote a senha mestra em um lugar seguro. Se esquecer, não tem como recuperar — nem nós conseguimos." })),
    h("p", { class: "auth-foot" }, icon("shield"), "Seus dados ficam só neste aparelho.")
  );
  return { node, title: "Criar senha mestra", focus: () => pw.input.focus() };
}

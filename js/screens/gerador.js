/* Gerador de senhas (comprimento 4–32, letras/números/símbolos). */
import { generate, rate } from "../generator.js";
import { h } from "../ui/dom.js";
import { icon } from "../ui/icons.js";
import { copySecret } from "../ui/clipboard.js";
import { toast } from "../ui/toast.js";

const PREF = "keypass-gerador-v1";

function loadPrefs() {
  try {
    return { length: 16, letters: true, numbers: true, symbols: true, ...(JSON.parse(localStorage.getItem(PREF)) || {}) };
  } catch (_) {
    return { length: 16, letters: true, numbers: true, symbols: true };
  }
}

export function render({ app }) {
  const p = loadPrefs();
  const out = h("output", { class: "gen-out", "aria-live": "polite" });
  const rating = h("span", {});
  const ratingRow = h("p", { class: "gen-rate" }, icon("shield"), rating);
  const badge = h("span", { class: "badge" });
  const range = h("input", { type: "range", min: "4", max: "32", step: "1", value: String(p.length), class: "range", "aria-label": "Comprimento da senha" });

  const save = () => localStorage.setItem(PREF, JSON.stringify(p));
  const regen = () => {
    const pw = generate(p);
    out.textContent = pw;
    const r = rate(pw);
    rating.textContent = r.label;
    ratingRow.classList.toggle("weak", !r.ok);
  };
  const syncRange = () => {
    badge.textContent = String(p.length);
    range.style.setProperty("--pct", `${((p.length - 4) / 28) * 100}%`);
  };
  range.addEventListener("input", () => { p.length = Number(range.value); syncRange(); regen(); save(); });

  const toggle = (key, badgeTxt, title, sub) => {
    const input = h("input", { type: "checkbox", class: "switch-input", checked: p[key] });
    input.addEventListener("change", () => {
      if (!input.checked && ["letters", "numbers", "symbols"].filter((k) => p[k]).length === 1) {
        input.checked = true;
        toast("Deixe pelo menos uma opção ligada.");
        return;
      }
      p[key] = input.checked;
      save();
      regen();
    });
    return h("label", { class: "opt-row" },
      h("span", { class: "opt-badge", text: badgeTxt }),
      h("span", { class: "opt-txt" }, h("span", { class: "opt-title", text: title }), h("span", { class: "opt-sub", text: sub })),
      input,
      h("span", { class: "switch", "aria-hidden": "true" }));
  };

  syncRange();
  regen();

  const node = h(
    "section",
    { class: "screen gen" },
    h("div", { class: "card gen-card" },
      h("p", { class: "card-label" }, icon("lock"), "Senha gerada"),
      h("div", { class: "gen-row" }, out,
        h("button", { type: "button", class: "icon-btn soft big", "aria-label": "Gerar outra", title: "Gerar outra", onclick: regen }, icon("refresh"))),
      ratingRow),
    h("div", { class: "card" },
      h("div", { class: "card-head" }, h("span", { class: "card-label", text: "Comprimento da senha" }), badge),
      range,
      h("div", { class: "range-scale" }, h("span", { text: "4" }), h("span", { text: "32" }))),
    h("div", { class: "card" },
      h("p", { class: "card-label", text: "Opções de caracteres" }),
      toggle("letters", "Aa", "Letras (A-Z, a-z)", "Incluir letras maiúsculas e minúsculas"),
      toggle("numbers", "123", "Números (0-9)", "Incluir números"),
      toggle("symbols", "!@#", "Símbolos (!@#$%&*…)", "Incluir símbolos")),
    h("div", { class: "two-btns" },
      h("button", { type: "button", class: "btn btn-outline btn-lg", onclick: () => copySecret(out.textContent) }, icon("copy"), "Copiar"),
      h("button", { type: "button", class: "btn btn-primary btn-lg", onclick: () => { app.state.pendingPassword = out.textContent; app.go("novo"); } }, icon("check"), "Usar")),
    h("p", { class: "auth-foot" }, icon("shield"), "Suas senhas, seguras e simples.")
  );
  return { node, title: "Gerador", nav: "gerador", header: { sub: "Gerador de Senhas" } };
}

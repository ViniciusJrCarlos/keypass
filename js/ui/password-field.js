/* Campo de senha com botão de olho (mostra por alguns segundos e volta a esconder). */
import { h } from "./dom.js";
import { icon } from "./icons.js";

export function passwordField({ label, placeholder = "", id, pin = false, autocomplete = "off", value = "", revealMs = 8000 } = {}) {
  const fid = id || "f" + Math.random().toString(36).slice(2, 8);
  const input = h("input", {
    id: fid,
    type: "password",
    class: "input",
    placeholder,
    autocomplete,
    autocapitalize: "off",
    spellcheck: "false",
    inputmode: pin ? "numeric" : null,
    pattern: pin ? "[0-9]*" : null,
    maxlength: pin ? "8" : "500",
    value,
  });
  let t = null;
  const eye = h("button", { type: "button", class: "eye-btn", "aria-label": "Mostrar senha", title: "Mostrar senha" }, icon("eye"));
  const setShown = (shown) => {
    input.type = shown ? "text" : "password";
    eye.replaceChildren(icon(shown ? "eyeOff" : "eye"));
    eye.setAttribute("aria-label", shown ? "Esconder senha" : "Mostrar senha");
    clearTimeout(t);
    if (shown) t = setTimeout(() => setShown(false), revealMs);
  };
  eye.addEventListener("click", () => setShown(input.type === "password"));
  const el = h(
    "label",
    { class: "field", for: fid },
    label ? h("span", { class: "field-label", text: label }) : null,
    h("span", { class: "pw-wrap" }, input, eye)
  );
  return { el, input, hide: () => setShown(false) };
}

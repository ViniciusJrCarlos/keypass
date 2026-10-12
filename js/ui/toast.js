import { h, clear } from "./dom.js";

let timer = null;

/** Aviso curto no rodapé. action = { label, onClick } opcional. */
export function toast(msg, { action, ms = 2600 } = {}) {
  const box = document.getElementById("toast");
  clear(box);
  box.append(h("span", { text: msg }));
  if (action) {
    box.append(
      h("button", { type: "button", class: "toast-btn", onclick: () => { hide(); action.onClick(); } }, action.label)
    );
  }
  box.hidden = false;
  requestAnimationFrame(() => box.classList.add("show"));
  clearTimeout(timer);
  if (ms > 0) timer = setTimeout(hide, ms);
}

export function hide() {
  const box = document.getElementById("toast");
  box.classList.remove("show");
  setTimeout(() => { if (!box.classList.contains("show")) box.hidden = true; }, 250);
}

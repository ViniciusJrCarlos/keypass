/* Instalar app (PWA): prompt nativo no Android/PC, instruções no iPhone. */
import { h } from "./dom.js";
import { sheet } from "./dialog.js";
import { icon } from "./icons.js";

let deferred = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferred = e;
  document.dispatchEvent(new CustomEvent("kp-install-ready"));
});
window.addEventListener("appinstalled", () => { deferred = null; });

export function isInstalled() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export async function installApp() {
  if (isInstalled()) {
    return sheet({ title: "App já instalado", text: "Você já está usando o app instalado neste aparelho." });
  }
  if (deferred) {
    deferred.prompt();
    await deferred.userChoice.catch(() => null);
    deferred = null;
    return;
  }
  const step = (n, txt) => h("li", { class: "step" }, h("span", { class: "step-n", text: String(n) }), h("span", { text: txt }));
  const body = isIOS()
    ? h("ol", { class: "steps" },
        step(1, "Abra este site no Safari."),
        step(2, "Toque no botão Compartilhar (quadrado com seta)."),
        step(3, "Escolha “Adicionar à Tela de Início”."),
        step(4, "Toque em “Adicionar”."))
    : h("ol", { class: "steps" },
        step(1, "Abra este site no Chrome ou Edge."),
        step(2, "Toque no menu ⋮ (ou no ícone de instalar na barra de endereço)."),
        step(3, "Escolha “Instalar app” ou “Adicionar à tela inicial”."),
        step(4, "Confirme. Pronto: o KeyPass abre como app, mesmo sem internet."));
  return sheet({ title: "Instalar o app", icon: h("div", { class: "sheet-ic" }, icon("phone")), body });
}

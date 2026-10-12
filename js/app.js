/*
 * KeyPass — ponto de entrada.
 * Roteador por hash (#/inicio, #/senhas, #/cat/banco, #/item/:id, #/novo, #/editar/:id, #/gerador, #/perfil),
 * bloqueio automático, apagamento automático, service worker e montagem das telas.
 */
import * as vault from "./vault.js";
import { hasCrypto } from "./crypto.js";
import { getConfig, getTheme, setTheme, appName, shouldWipe, resetConfig } from "./settings.js";
import { h, clear } from "./ui/dom.js";
import { icon } from "./ui/icons.js";
import { toast } from "./ui/toast.js";
import { alertDlg } from "./ui/dialog.js";
import { clearClipboard } from "./ui/clipboard.js";
import * as setup from "./screens/setup.js";
import * as login from "./screens/login.js";
import * as home from "./screens/home.js";
import * as lista from "./screens/lista.js";
import * as detalhe from "./screens/detalhe.js";
import * as form from "./screens/form.js";
import * as gerador from "./screens/gerador.js";
import * as perfil from "./screens/perfil.js";

const ROUTES = {
  inicio: home,
  senhas: lista,
  cat: lista,
  item: detalhe,
  novo: form,
  editar: form,
  gerador,
  perfil,
};

const HIDDEN_LOCK_MS = 60 * 1000; // app em segundo plano por mais de 1 min → bloqueia

/** Estado compartilhado entre telas (só em memória). */
export const state = {
  pendingPassword: null, // senha vinda do gerador para o formulário
  notice: null, // aviso para mostrar na tela de entrada
  navCount: 0,
};

export function go(path, { replace = false } = {}) {
  const target = "#/" + path;
  if (replace) {
    history.replaceState(null, "", target);
    render();
  } else if (location.hash === target) {
    render();
  } else {
    location.hash = target;
  }
}

export function back(fallback = "inicio") {
  if (state.navCount > 0) history.back();
  else go(fallback, { replace: true });
}

function parse() {
  const parts = location.hash.replace(/^#\/?/, "").split("/");
  return { name: parts[0] || "inicio", arg: parts[1] ? decodeURIComponent(parts[1]) : "" };
}

/* ---------- Montagem ---------- */

const $view = () => document.getElementById("view");

function buildHeader(cfg) {
  const bar = document.getElementById("topbar");
  clear(bar);
  const hd = cfg.header || {};
  if (hd.back) {
    bar.append(
      h("button", { type: "button", class: "icon-btn", "aria-label": "Voltar", title: "Voltar", onclick: () => back(hd.back) }, icon("back")),
      h("h1", { class: "topbar-title", text: hd.title || "" }),
      h("span", { class: "icon-btn-space" })
    );
    return;
  }
  const discreet = getConfig().discreet;
  bar.append(
    h(
      "a",
      { class: "brand", href: "#/inicio", "aria-label": "Início" },
      discreet ? h("span", { class: "brand-ic" }, icon("note")) : h("img", { src: "assets/img/logo.png", alt: "", class: "brand-logo", width: "34", height: "41" }),
      h("span", { class: "brand-txt" }, h("span", { class: "brand-name", text: appName() }), hd.sub ? h("span", { class: "brand-sub", text: hd.sub }) : null)
    ),
    h("button", { type: "button", class: "icon-btn soft", "aria-label": "Bloquear agora", title: "Bloquear agora", onclick: () => lockNow("App bloqueado.") }, icon("lock"))
  );
}

function setNav(active) {
  document.querySelectorAll("#bottomnav a").forEach((a) => {
    const on = a.dataset.nav === active;
    a.classList.toggle("active", on);
    if (on) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}

function mount(cfg, locked) {
  document.body.classList.toggle("locked", !!locked);
  document.getElementById("fab").hidden = !cfg.fab;
  const view = $view();
  clear(view);
  if (!locked) buildHeader(cfg);
  setNav(cfg.nav || "");
  view.append(cfg.node);
  document.title = cfg.title ? `${cfg.title} · ${appName()}` : appName();
  window.scrollTo(0, 0);
  if (cfg.focus) cfg.focus();
}

let rendering = Promise.resolve();
export function render() {
  rendering = rendering.then(doRender).catch((e) => {
    console.error(e);
    toast("Algo deu errado. Tente de novo.");
  });
  return rendering;
}

async function doRender() {
  if (!vault.isUnlocked()) {
    const exists = await vault.exists();
    const scr = exists ? login : setup;
    mount(await scr.render({ app }), true);
    return;
  }
  const { name, arg } = parse();
  const scr = ROUTES[name] || home;
  mount(await scr.render({ app, name, arg }), false);
}

/* ---------- Bloqueio ---------- */

let lastActivity = Date.now();
let hiddenAt = 0;

export function lockNow(msg) {
  if (!vault.isUnlocked()) return;
  document.querySelectorAll(".sheet-wrap").forEach((el) => el.remove());
  vault.lock();
  state.pendingPassword = null;
  clearClipboard();
  if (msg) state.notice = msg;
  render();
}

function onUnlocked() {
  lastActivity = Date.now();
  const { name } = parse();
  if (!ROUTES[name]) go("inicio", { replace: true });
  else render();
}

function watchActivity() {
  const touch = () => { lastActivity = Date.now(); };
  ["pointerdown", "keydown", "touchstart", "wheel", "input"].forEach((ev) => window.addEventListener(ev, touch, { passive: true, capture: true }));
  setInterval(() => {
    if (!vault.isUnlocked()) return;
    const mins = Number(getConfig().lockMinutes) || 5;
    if (Date.now() - lastActivity > mins * 60000) lockNow("Bloqueado por inatividade.");
  }, 10000);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) hiddenAt = Date.now();
    else if (hiddenAt && Date.now() - hiddenAt > HIDDEN_LOCK_MS) lockNow("Bloqueado por segurança.");
  });
}

/* ---------- Service worker (aviso de nova versão) ---------- */

function registerSW() {
  if (!("serviceWorker" in navigator)) return;
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker
    .register("sw.js")
    .then((reg) => {
      const notify = (w) =>
        toast("Nova versão disponível.", { ms: 0, action: { label: "Atualizar", onClick: () => w.postMessage({ type: "SKIP_WAITING" }) } });
      if (reg.waiting && hadController) notify(reg.waiting);
      reg.addEventListener("updatefound", () => {
        const w = reg.installing;
        if (!w) return;
        w.addEventListener("statechange", () => {
          if (w.state === "installed" && navigator.serviceWorker.controller) notify(w);
        });
      });
      document.addEventListener("visibilitychange", () => { if (!document.hidden) reg.update().catch(() => {}); });
    })
    .catch(() => {});
  let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController || reloaded) return;
    reloaded = true;
    location.reload();
  });
}

/* ---------- Início ---------- */

export const app = { go, back, render, lockNow, onUnlocked, state };

async function boot() {
  setTheme(getTheme());
  document.getElementById("fab").addEventListener("click", () => {
    const { name, arg } = parse();
    go(name === "cat" && arg ? `novo/${arg}` : "novo");
  });
  window.addEventListener("hashchange", () => { state.navCount++; render(); });

  if (!hasCrypto() || !window.indexedDB) {
    clear($view()).append(
      h("div", { class: "center-card" },
        h("h1", { text: "Navegador sem suporte" }),
        h("p", { text: "O KeyPass precisa de um navegador atualizado (Chrome, Edge, Safari ou Firefox) e de conexão segura (https)." }))
    );
    document.body.classList.add("locked");
    return;
  }

  // Apagamento automático: conta dias SEM ABRIR o app (desbloquear), não dias sem internet.
  try {
    const meta = await vault.getMeta();
    if (shouldWipe(meta)) {
      const days = getConfig().wipeDays;
      await vault.wipe();
      resetConfig();
      state.notice = null;
      await render();
      await alertDlg("Dados apagados por segurança", `O app ficou mais de ${days} dias sem ser aberto e, como você configurou, os dados deste aparelho foram apagados. Se você tem um backup, crie uma nova senha mestra e importe o arquivo em Perfil.`);
    }
  } catch (e) {
    console.error(e);
  }

  watchActivity();
  registerSW();
  render();
}

boot();

/*
 * Construtor de elementos seguro: textos entram sempre por textContent.
 * Não existe opção de HTML aqui — ícones vêm de icons.js (SVG fixo).
 */
export function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "text") el.textContent = v;
    else if (k === "dataset") Object.assign(el.dataset, v);
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else if (k === "value") el.value = v;
    else if (k === "checked") el.checked = !!v;
    else if (v === true) el.setAttribute(k, "");
    else el.setAttribute(k, String(v));
  }
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

/** Escapa texto para contextos de HTML (útil se um dia for preciso montar string). */
export function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

export const $ = (sel, root = document) => root.querySelector(sel);

export function clear(el) {
  while (el.firstChild) el.firstChild.remove();
  return el;
}

/** Normaliza link: só http/https. Retorna "" se inválido. */
export function safeUrl(raw) {
  let s = String(raw || "").trim();
  if (!s) return "";
  if (!/^[a-z][a-z0-9+.-]*:/i.test(s)) s = "https://" + s;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : "";
  } catch (_) {
    return "";
  }
}

export function hostOf(raw) {
  const u = safeUrl(raw);
  if (!u) return "";
  return new URL(u).hostname.replace(/^www\./, "");
}

export function openSite(raw) {
  const u = safeUrl(raw);
  if (!u) return false;
  const w = window.open(u, "_blank", "noopener,noreferrer");
  if (w) w.opener = null;
  return true;
}

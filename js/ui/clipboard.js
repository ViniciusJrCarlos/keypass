/* Copiar com limpeza automática da área de transferência (melhor esforço). */
import { toast } from "./toast.js";

const CLEAR_MS = 30000;
let clearTimer = null;
let lastCopied = null;

async function writeText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.className = "sr-only";
  document.body.append(ta);
  ta.select();
  document.execCommand("copy");
  ta.remove();
}

export async function copySecret(text, what = "Senha") {
  try {
    await writeText(text);
  } catch (_) {
    toast("Não foi possível copiar neste navegador.");
    return false;
  }
  lastCopied = text;
  toast(`${what} copiada! Será apagada da memória em 30 s.`);
  clearTimeout(clearTimer);
  clearTimer = setTimeout(clearClipboard, CLEAR_MS);
  return true;
}

export async function copyText(text, msg = "Copiado!") {
  try {
    await writeText(text);
    toast(msg);
    return true;
  } catch (_) {
    toast("Não foi possível copiar neste navegador.");
    return false;
  }
}

/** Só limpa se a página estiver em foco (exigência dos navegadores). */
export async function clearClipboard() {
  clearTimeout(clearTimer);
  if (lastCopied == null) return;
  try {
    if (document.hasFocus() && navigator.clipboard) await navigator.clipboard.writeText("");
    lastCopied = null;
  } catch (_) {
    /* sem permissão: tenta de novo quando a janela voltar ao foco */
    window.addEventListener("focus", clearClipboard, { once: true });
  }
}

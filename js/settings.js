/* Preferências não sensíveis (ficam no localStorage deste aparelho). */
const KEY = "keypass-config-v1";
const THEME_KEY = "keypass-tema";

export const DEFAULTS = {
  wipeDays: 0, // 0 = desligado; 7, 15 ou 30
  lockMinutes: 5, // bloqueio por inatividade
  discreet: false, // modo discreto
  discreetName: "Notas",
};

export const THEMES = {
  claro: { label: "Verde clarinho", color: "#2F7D52" },
  contraste: { label: "Alto contraste", color: "#0B3D22" },
  escuro: { label: "Escuro", color: "#10241A" },
};

export function getConfig() {
  try {
    return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY)) || {}) };
  } catch (_) {
    return { ...DEFAULTS };
  }
}

export function setConfig(patch) {
  const cfg = { ...getConfig(), ...patch };
  localStorage.setItem(KEY, JSON.stringify(cfg));
  return cfg;
}

export function resetConfig() {
  localStorage.removeItem(KEY);
}

export function getTheme() {
  const t = localStorage.getItem(THEME_KEY);
  return THEMES[t] ? t : "claro";
}

export function setTheme(t) {
  if (!THEMES[t]) t = "claro";
  localStorage.setItem(THEME_KEY, t);
  document.documentElement.setAttribute("data-tema", t);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEMES[t].color);
}

export function appName() {
  const c = getConfig();
  return c.discreet ? c.discreetName || "Notas" : "KeyPass";
}

/** Dias desde o último desbloqueio (conta dias sem ABRIR o app, não dias sem internet). */
export function daysSince(ts) {
  if (!ts) return 0;
  return Math.floor((Date.now() - ts) / 86400000);
}

export function shouldWipe(meta) {
  const { wipeDays } = getConfig();
  if (!meta || !wipeDays) return false;
  return Date.now() - (meta.lastUnlock || meta.createdAt || Date.now()) > wipeDays * 86400000;
}

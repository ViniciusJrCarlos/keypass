/* Regras e força da senha mestra (inspirado no auth.js do anota-conta-preview). */
export const MASTER_MIN = 8;

/** Pontua de 0 a 4 e devolve um rótulo simples. */
export function strength(pw) {
  const s = String(pw || "");
  let score = 0;
  if (s.length >= MASTER_MIN) score++;
  if (s.length >= 12) score++;
  const kinds = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(s)).length;
  if (kinds >= 2) score++;
  if (kinds >= 3 && s.length >= 10) score++;
  if (/^(.)\1+$/.test(s) || /^(123456|password|senha|qwerty)/i.test(s)) score = Math.min(score, 1);
  if (s.length < MASTER_MIN) score = Math.min(score, 1);
  const labels = ["Muito fraca", "Fraca", "Razoável", "Boa", "Forte"];
  return { score, label: labels[score] };
}

export function masterProblem(pw, confirm) {
  if (String(pw || "").length < MASTER_MIN) return `Use pelo menos ${MASTER_MIN} caracteres.`;
  if (confirm !== undefined && pw !== confirm) return "As duas senhas não são iguais.";
  return "";
}

export function pinProblem(pin, confirm) {
  if (!/^\d{4,8}$/.test(String(pin || ""))) return "O código deve ter de 4 a 8 números.";
  if (confirm !== undefined && pin !== confirm) return "Os dois códigos não são iguais.";
  return "";
}

/* Gerador de senhas com crypto.getRandomValues (sem viés de módulo). */
export const SETS = {
  letters: "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
  numbers: "23456789",
  symbols: "!@#$%&*-_=+?",
};

function randInt(max) {
  const lim = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  let x;
  do {
    crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= lim);
  return x % max;
}

export function generate({ length = 16, letters = true, numbers = true, symbols = true } = {}) {
  const groups = [];
  if (letters) groups.push(SETS.letters);
  if (numbers) groups.push(SETS.numbers);
  if (symbols) groups.push(SETS.symbols);
  if (!groups.length) groups.push(SETS.letters);
  const len = Math.max(4, Math.min(64, length | 0));
  const all = groups.join("");
  // garante pelo menos um caractere de cada tipo escolhido
  const out = groups.map((g) => g[randInt(g.length)]);
  while (out.length < len) out.push(all[randInt(all.length)]);
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.join("");
}

/** Entropia aproximada em bits → rótulo amigável. */
export function rate(pw) {
  let pool = 0;
  if (/[A-Za-z]/.test(pw)) pool += 52;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^A-Za-z0-9]/.test(pw)) pool += 12;
  const bits = pw.length * Math.log2(pool || 1);
  if (bits >= 80) return { ok: true, label: "Senha forte e segura" };
  if (bits >= 55) return { ok: true, label: "Senha boa" };
  return { ok: false, label: "Senha fraca — aumente o tamanho" };
}

/*
 * Backup manual cifrado.
 * Arquivo JSON: { app, format, appVersion, exportedAt, kdf:{alg,iter,salt}, iv, ct }
 * O conteúdo (lista de acessos) é cifrado com AES-GCM usando uma chave
 * derivada (PBKDF2) da senha mestra no momento da exportação, com sal novo.
 */
import * as C from "./crypto.js";
import * as vault from "./vault.js";
import { APP_VERSION } from "./version.js";

export const FORMAT = 1;

export async function buildBackup(master) {
  if (!(await vault.verifyMaster(master))) return null;
  const kdf = C.newKdf();
  const key = await C.deriveFromKdf(master, kdf);
  const box = await C.encryptJSON(key, { entries: vault.entries() });
  return {
    app: "keypass",
    format: FORMAT,
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    kdf,
    iv: box.iv,
    ct: box.ct,
  };
}

export function download(obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const n = new Date();
  const d = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  a.href = url;
  a.download = `keypass-backup-${d}.json`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Lê e valida o arquivo (sem decifrar). */
export async function readFile(file) {
  const text = await file.text();
  let obj;
  try {
    obj = JSON.parse(text);
  } catch (_) {
    throw new Error("Arquivo inválido.");
  }
  if (!obj || obj.app !== "keypass" || !obj.kdf || !obj.iv || !obj.ct) throw new Error("Este arquivo não é um backup do KeyPass.");
  if (obj.format > FORMAT) throw new Error("Backup de uma versão mais nova do app. Atualize o KeyPass.");
  return obj;
}

/** Decifra com a senha usada na exportação. Retorna a lista ou null (senha errada). */
export async function decryptBackup(obj, password) {
  try {
    const key = await C.deriveFromKdf(password, obj.kdf);
    const content = await C.decryptJSON(key, { iv: obj.iv, ct: obj.ct });
    return Array.isArray(content.entries) ? content.entries : [];
  } catch (_) {
    return null;
  }
}

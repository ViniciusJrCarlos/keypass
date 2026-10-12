/*
 * Criptografia no próprio navegador (Web Crypto API).
 * - PBKDF2-SHA256 transforma a senha (ou o código) em chave AES de 256 bits.
 * - AES-GCM cifra os dados, com IV aleatório novo a cada gravação.
 */
const enc = new TextEncoder();
const dec = new TextDecoder();

export const KDF_ALG = "PBKDF2-SHA256";
export const KDF_ITER = 310000;

export function hasCrypto() {
  return !!(window.crypto && crypto.subtle && window.isSecureContext !== false);
}

export function randomBytes(n) {
  return crypto.getRandomValues(new Uint8Array(n));
}

export function b64(buf) {
  const b = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s);
}

export function unb64(s) {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}

/** Gera a chave AES-GCM a partir de um segredo digitado. */
export async function deriveKey(secret, salt, iter = KDF_ITER) {
  const base = await crypto.subtle.importKey("raw", enc.encode(String(secret)), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: iter },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/** Novo conjunto de parâmetros de derivação (sal aleatório). */
export function newKdf() {
  return { alg: KDF_ALG, iter: KDF_ITER, salt: b64(randomBytes(16)) };
}

export function deriveFromKdf(secret, kdf) {
  return deriveKey(secret, unb64(kdf.salt), kdf.iter);
}

export async function encryptBytes(key, bytes) {
  const iv = randomBytes(12);
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, bytes);
  return { iv: b64(iv), ct: b64(ct) };
}

/** Lança erro se a chave estiver errada ou o conteúdo tiver sido alterado. */
export async function decryptBytes(key, box) {
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(box.iv) }, key, unb64(box.ct));
  return new Uint8Array(pt);
}

export function encryptJSON(key, obj) {
  return encryptBytes(key, enc.encode(JSON.stringify(obj)));
}

export async function decryptJSON(key, box) {
  return JSON.parse(dec.decode(await decryptBytes(key, box)));
}

/** Chave do cofre em memória: não exportável. */
export function importDataKey(raw) {
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

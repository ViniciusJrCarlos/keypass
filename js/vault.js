/*
 * Cofre do KeyPass.
 *
 * Modelo de chaves:
 *  - Uma "chave do cofre" aleatória (256 bits) cifra todos os acessos com AES-GCM.
 *  - Essa chave é guardada "embrulhada" (cifrada) pela chave derivada da senha mestra.
 *  - Opcional: uma segunda cópia embrulhada pelo código secreto (PIN), com limite de tentativas.
 *  - Em memória só fica a chave do cofre (não exportável) enquanto o app está aberto.
 *  - A senha mestra e o PIN nunca são gravados.
 */
import * as db from "./db.js";
import * as C from "./crypto.js";

const META = "meta";
const VAULT = "vault";
export const PIN_MAX_TRIES = 5;

let dataKey = null;
let data = null; // { v: 1, entries: [] }
const listeners = new Set();

export const onChange = (fn) => listeners.add(fn);
const emit = () => listeners.forEach((fn) => fn());

export const isUnlocked = () => !!dataKey;
export const getMeta = () => db.get(META);

export async function exists() {
  return !!(await getMeta());
}

async function unwrap(secret, kdf, box) {
  const k = await C.deriveFromKdf(secret, kdf);
  return C.decryptBytes(k, box); // lança erro se o segredo estiver errado
}

async function wrap(secret, raw) {
  const kdf = C.newKdf();
  const k = await C.deriveFromKdf(secret, kdf);
  return { kdf, wrapped: await C.encryptBytes(k, raw) };
}

async function rawFromMaster(meta, master) {
  try {
    return await unwrap(master, meta.kdf, meta.wrapped);
  } catch (_) {
    return null;
  }
}

async function openWith(raw, meta) {
  const key = await C.importDataKey(raw);
  raw.fill(0);
  const box = await db.get(VAULT);
  const content = box ? await C.decryptJSON(key, box) : { v: 1, entries: [] };
  dataKey = key;
  data = { v: 1, entries: Array.isArray(content.entries) ? content.entries : [] };
  meta.lastUnlock = Date.now();
  await db.set(META, meta);
  emit();
}

export async function create(master) {
  const raw = C.randomBytes(32);
  const { kdf, wrapped } = await wrap(master, raw);
  const now = Date.now();
  const meta = { v: 1, kdf, wrapped, pin: null, createdAt: now, lastUnlock: now };
  dataKey = await C.importDataKey(raw);
  raw.fill(0);
  data = { v: 1, entries: [] };
  await db.set(META, meta);
  await save();
  emit();
}

export async function unlock(master) {
  const meta = await getMeta();
  if (!meta) return false;
  const raw = await rawFromMaster(meta, master);
  if (!raw) return false;
  if (meta.pin) meta.pin.tries = 0; // senha mestra certa zera as tentativas do PIN
  await openWith(raw, meta);
  return true;
}

/** Retorna { ok, left, reason } — reason: "nopin" | "wrong" | "blocked". */
export async function unlockWithPin(pin) {
  const meta = await getMeta();
  if (!meta || !meta.pin) return { ok: false, reason: "nopin", left: 0 };
  let raw = null;
  try {
    raw = await unwrap(pin, meta.pin.kdf, meta.pin.wrapped);
  } catch (_) {
    meta.pin.tries = (meta.pin.tries || 0) + 1;
    const left = PIN_MAX_TRIES - meta.pin.tries;
    if (left <= 0) meta.pin = null; // apaga a cópia do PIN: agora só com a senha mestra
    await db.set(META, meta);
    return { ok: false, reason: left <= 0 ? "blocked" : "wrong", left: Math.max(0, left) };
  }
  meta.pin.tries = 0;
  await openWith(raw, meta);
  return { ok: true, left: PIN_MAX_TRIES };
}

export async function hasPin() {
  const meta = await getMeta();
  return !!(meta && meta.pin);
}

export async function verifyMaster(master) {
  const meta = await getMeta();
  if (!meta) return false;
  const raw = await rawFromMaster(meta, master);
  if (!raw) return false;
  raw.fill(0);
  return true;
}

export async function setPin(master, pin) {
  const meta = await getMeta();
  const raw = await rawFromMaster(meta, master);
  if (!raw) return false;
  const w = await wrap(pin, raw);
  raw.fill(0);
  meta.pin = { ...w, tries: 0, createdAt: Date.now() };
  await db.set(META, meta);
  return true;
}

export async function removePin() {
  const meta = await getMeta();
  if (!meta) return;
  meta.pin = null;
  await db.set(META, meta);
}

export async function changeMaster(current, next) {
  const meta = await getMeta();
  const raw = await rawFromMaster(meta, current);
  if (!raw) return false;
  const w = await wrap(next, raw);
  raw.fill(0);
  meta.kdf = w.kdf;
  meta.wrapped = w.wrapped;
  await db.set(META, meta);
  return true;
}

export function lock() {
  dataKey = null;
  data = null;
  emit();
}

/** Apaga tudo deste aparelho (cofre, metadados). */
export async function wipe() {
  lock();
  await db.clear();
}

async function save() {
  if (!dataKey) throw new Error("bloqueado");
  await db.set(VAULT, await C.encryptJSON(dataKey, data));
}

/* ---------- Acessos ---------- */

function uid() {
  return C.b64(C.randomBytes(9)).replace(/[+/=]/g, "x");
}

function clean(e) {
  const s = (v) => String(v == null ? "" : v).trim();
  return {
    id: s(e.id) || uid(),
    name: s(e.name).slice(0, 120),
    url: s(e.url).slice(0, 500),
    user: s(e.user).slice(0, 200),
    password: String(e.password == null ? "" : e.password).slice(0, 500),
    category: s(e.category) || "outros",
    note: s(e.note).slice(0, 2000),
    createdAt: Number(e.createdAt) || Date.now(),
    updatedAt: Number(e.updatedAt) || Date.now(),
  };
}

export function entries() {
  if (!data) return [];
  return [...data.entries].sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }));
}

export function getEntry(id) {
  return data ? data.entries.find((e) => e.id === id) || null : null;
}

export async function saveEntry(entry) {
  const now = Date.now();
  const old = entry.id ? getEntry(entry.id) : null;
  const e = clean({ ...entry, createdAt: old ? old.createdAt : now, updatedAt: now });
  if (old) data.entries = data.entries.map((x) => (x.id === e.id ? e : x));
  else data.entries.push(e);
  await save();
  emit();
  return e;
}

export async function deleteEntry(id) {
  data.entries = data.entries.filter((e) => e.id !== id);
  await save();
  emit();
}

/** Importação: "replace" troca tudo; "merge" junta (mantém o mais recente quando o id repete). */
export async function importEntries(list, mode) {
  const incoming = (Array.isArray(list) ? list : []).map(clean);
  if (mode === "replace") {
    data.entries = incoming;
  } else {
    const map = new Map(data.entries.map((e) => [e.id, e]));
    for (const e of incoming) {
      const cur = map.get(e.id);
      if (!cur || e.updatedAt > cur.updatedAt) map.set(e.id, e);
    }
    data.entries = [...map.values()];
  }
  await save();
  emit();
  return incoming.length;
}

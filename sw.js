/*
 * Service worker do KeyPass: rede primeiro, cache como reserva (funciona offline).
 * A cada versão nova, mude CACHE (ex.: keypass-v0.1.1) para limpar o cache antigo.
 * Nunca guarda dados do usuário: só os arquivos do app.
 */
const CACHE = "keypass-v0.1.0";
const FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./favicon.ico",
  "./css/tokens.css",
  "./css/base.css",
  "./css/components.css",
  "./css/screens.css",
  "./js/boot.js",
  "./js/app.js",
  "./js/version.js",
  "./js/crypto.js",
  "./js/db.js",
  "./js/vault.js",
  "./js/auth.js",
  "./js/generator.js",
  "./js/backup.js",
  "./js/settings.js",
  "./js/categories.js",
  "./js/ui/dom.js",
  "./js/ui/icons.js",
  "./js/ui/toast.js",
  "./js/ui/dialog.js",
  "./js/ui/password-field.js",
  "./js/ui/clipboard.js",
  "./js/ui/install.js",
  "./js/screens/setup.js",
  "./js/screens/login.js",
  "./js/screens/home.js",
  "./js/screens/lista.js",
  "./js/screens/detalhe.js",
  "./js/screens/form.js",
  "./js/screens/gerador.js",
  "./js/screens/perfil.js",
  "./assets/img/logo.png",
  "./assets/img/planta.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
  // Primeira instalação assume na hora; atualizações esperam o usuário tocar em "Atualizar".
  if (!self.registration.active) self.skipWaiting();
});

self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("keypass-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Rede primeiro: com internet pega a versão nova e guarda; sem internet usa a guardada.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req, { cache: "no-store" })
      .then((resp) => {
        if (resp && resp.ok && resp.type === "basic") {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return resp;
      })
      .catch(() =>
        caches.match(req, { ignoreSearch: true }).then((hit) => hit || (req.mode === "navigate" ? caches.match("./index.html") : Response.error()))
      )
  );
});

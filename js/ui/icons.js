/* Ícones SVG estáticos (conteúdo fixo do app, nunca dados do usuário). */
const line = (d) =>
  `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

const LINE = {
  back: '<path d="M15 18l-6-6 6-6"/>',
  chevron: '<path d="M9 6l6 6-6 6"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.8 9.8 0 0 0 4.4-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>',
  wand: '<path d="M4 20L15 9"/><path d="M14 4v2M19 9h2M17.5 5.5l1.5-1.5M18 14v2M9 3v2"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v6h-6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 17h4v4h-4"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  mask: '<path d="M3 7c3-2 15-2 18 0 0 7-3 12-9 12S3 14 3 7z"/><path d="M8 11h2M14 11h2"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>',
  upload: '<path d="M12 21V9M7 14l5-5 5 5"/><path d="M5 3h14"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
  palette: '<circle cx="12" cy="12" r="10"/><circle cx="8" cy="10" r="1.2"/><circle cx="12" cy="7.5" r="1.2"/><circle cx="16" cy="10" r="1.2"/><path d="M12 22a2.5 2.5 0 0 1 0-5h2a3 3 0 0 0 3-3"/>',
  alert: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  note: '<path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h5"/>',
};

/* Ilustrações coloridas das categorias (inspiradas nos mockups). */
const CAT = {
  banco: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 24L32 10l24 14z" fill="#7A6A55"/><rect x="10" y="24" width="44" height="4" fill="#5E513F"/><g fill="#E9E1D2"><rect x="14" y="30" width="6" height="18"/><rect x="25" y="30" width="6" height="18"/><rect x="36" y="30" width="6" height="18"/></g><rect x="8" y="48" width="40" height="5" rx="1" fill="#5E513F"/><circle cx="46" cy="44" r="11" fill="#3E9A5A"/><text x="46" y="49" text-anchor="middle" font-size="14" font-weight="700" fill="#fff" font-family="sans-serif">$</text></svg>',
  email: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="8" y="18" width="48" height="34" rx="4" fill="#4A7FC1"/><rect x="16" y="10" width="32" height="30" rx="2" fill="#fff" stroke="#C9D8EC"/><text x="32" y="31" text-anchor="middle" font-size="16" font-weight="700" fill="#2F5E9E" font-family="sans-serif">@</text><path d="M8 22l24 18 24-18v30H8z" fill="#5B90D2"/><path d="M8 52l20-15M56 52L36 37" stroke="#3B6FB0" stroke-width="2"/></svg>',
  redes: '<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="#8F6FC4"><circle cx="18" cy="24" r="6"/><circle cx="46" cy="24" r="6"/><path d="M6 46a12 11 0 0 1 22-6v6zM58 46a12 11 0 0 0-22-6v6z"/></g><g fill="#7550B5"><circle cx="32" cy="20" r="8"/><path d="M16 50a16 15 0 0 1 32 0z"/></g></svg>',
  compras: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M6 12h8l6 28h30l6-20H17" fill="none" stroke="#8A5A3B" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 22h35l-5 15H22z" fill="#B07A52"/><path d="M36 33s-6-3.6-6-7.4a3.1 3.1 0 0 1 6-1 3.1 3.1 0 0 1 6 1C42 29.4 36 33 36 33z" fill="#fff"/><circle cx="24" cy="50" r="4" fill="#8A5A3B"/><circle cx="46" cy="50" r="4" fill="#8A5A3B"/></svg>',
  saude: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 56S6 41 6 23a13 13 0 0 1 26-4 13 13 0 0 1 26 4c0 18-26 33-26 33z" fill="#4FA35F"/><path d="M28 20h8v8h8v8h-8v8h-8v-8h-8v-8h8z" fill="#fff"/><path d="M44 50c2-9 9-13 16-13-1 8-7 14-16 13z" fill="#7BC46B"/></svg>',
  outros: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="26" width="44" height="28" rx="2" fill="#C89461"/><rect x="7" y="18" width="50" height="10" rx="2" fill="#D9A774"/><rect x="28" y="18" width="8" height="36" fill="#4E9A5B"/><path d="M32 18c-4-8-14-10-14-4s10 4 14 4zM32 18c4-8 14-10 14-4s-10 4-14 4z" fill="none" stroke="#3F8A4D" stroke-width="3"/></svg>',
};

export function icon(name, cls = "ic") {
  const span = document.createElement("span");
  span.className = cls;
  span.innerHTML = LINE[name] ? line(LINE[name]) : "";
  return span;
}

export function catIcon(name) {
  const span = document.createElement("span");
  span.className = "cat-ic";
  span.innerHTML = CAT[name] || CAT.outros;
  return span;
}

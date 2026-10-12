/* Categorias fixas do MVP (ids estáveis, rótulos em pt-BR). */
export const CATEGORIES = [
  { id: "banco", label: "Banco", plural: "Bancos", icon: "banco" },
  { id: "email", label: "Email", plural: "Emails", icon: "email" },
  { id: "redes", label: "Redes Sociais", plural: "Redes Sociais", icon: "redes" },
  { id: "compras", label: "Compras", plural: "Compras", icon: "compras" },
  { id: "saude", label: "Saúde", plural: "Saúde", icon: "saude" },
  { id: "outros", label: "Outros", plural: "Outros", icon: "outros" },
];

export function category(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

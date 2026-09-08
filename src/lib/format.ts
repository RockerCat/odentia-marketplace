const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

// COP has no meaningful sub-unit in everyday use, so amounts are stored and
// formatted as whole pesos (the "*Cents" field names are a historical
// leftover from when the store used USD).
export function formatPrice(amount: number) {
  return copFormatter.format(amount);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

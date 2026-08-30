export type ParsedProductLine = {
  name: string;
  price: number;
  stock: number | null;
};

// Matches either a thousands-grouped number (e.g. "1.905.754", "1.234,56")
// or a plain two-decimal price (e.g. "15.50", "8,90"). Deliberately requires
// a separator so it doesn't match bare SKU digits or percentages like "19%".
const MONEY_TOKEN = /\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{1,2})?|\d+[.,]\d{2}/g;

function normalizeNumber(raw: string): number {
  const cleaned = raw.trim();
  const lastSep = Math.max(cleaned.lastIndexOf(","), cleaned.lastIndexOf("."));

  if (lastSep === -1) return parseFloat(cleaned);

  const decimals = cleaned.slice(lastSep + 1);
  const looksLikeDecimal = decimals.length <= 2 && /^\d+$/.test(decimals);

  if (looksLikeDecimal) {
    const integerPart = cleaned.slice(0, lastSep).replace(/[.,]/g, "");
    return parseFloat(`${integerPart}.${decimals}`);
  }

  // No real decimal part: every separator found is a thousands separator.
  return parseFloat(cleaned.replace(/[.,]/g, ""));
}

function stripLeadingSku(text: string): string {
  // A leading token that mixes letters and digits (e.g. "V647619") is almost
  // always a product/SKU code, not part of the human-readable name.
  return text.replace(/^[A-Za-z]*\d[A-Za-z0-9-]*\s+/, "").trim();
}

function cleanName(text: string): string {
  return text
    .replace(/\t+/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/[-:|.\s]+$/, "")
    .trim();
}

/**
 * Best-effort heuristic: finds the right-most money-shaped number on each line
 * and treats the text before it as the product name. Meant to be reviewed and
 * corrected by a human afterwards — PDF layouts vary too much to parse
 * perfectly on the first try.
 */
export function parseProductLines(text: string): ParsedProductLine[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const results: ParsedProductLine[] = [];

  for (const line of lines) {
    if (line.length < 4 || line.length > 200) continue;

    const matches = [...line.matchAll(MONEY_TOKEN)];
    if (matches.length === 0) continue;

    const priceMatch = matches[matches.length - 1];
    const price = normalizeNumber(priceMatch[0]);
    if (!Number.isFinite(price) || price <= 0 || price > 100_000_000) continue;

    // Prefer the first tab-separated column when the line looks columnar
    // (common in exported price-list tables); otherwise fall back to
    // everything before the matched price.
    const firstColumn = line.split("\t")[0];
    const rawName =
      firstColumn && firstColumn.length >= 4 && (priceMatch.index ?? 0) >= firstColumn.length
        ? firstColumn
        : line.slice(0, priceMatch.index);

    const name = cleanName(stripLeadingSku(rawName));
    if (name.length < 3 || !/[a-zA-Zá-úÁ-Ú]{3,}/.test(name)) continue;

    results.push({ name, price, stock: null });
  }

  return results;
}

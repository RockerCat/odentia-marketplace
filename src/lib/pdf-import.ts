export type ParsedProductLine = {
  name: string;
  price: number;
  stock: number | null;
  suggestedCategoryId: string | null;
  options: string[];
};

export type CategoryLookup = { id: string; name: string };

// Matches either a thousands-grouped number (e.g. "1.905.754", "1.234,56")
// or a plain two-decimal price (e.g. "15.50", "8,90"). Deliberately requires
// a separator so it doesn't match bare SKU digits or percentages like "19%",
// and rejects a match immediately followed by a letter so quantities like
// "1,50gr" or "0,95gr" aren't mistaken for a price.
const MONEY_TOKEN = /(?:\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{1,2})?|\d+[.,]\d{2})(?![a-zA-Z])/g;

const CURRENCY_WORD = /\s*(COP|USD|EUR|MXN|ARS|CLP|PEN|US\$|\$)\s*$/i;

const LETTER_RUN = /[a-zA-Zá-úÁ-Ú]{3,}/;

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
    .replace(CURRENCY_WORD, "")
    .replace(/\t+/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/[-:|.\s]+$/, "")
    .trim();
}

// Order forms often mark selectable variants as checkbox blanks right in the
// product line, e.g. "Jiffy HiShine diamantada azul __Copa __Disco __Punta".
// Pulls those "__Token" markers out as options and returns the cleaned name.
function extractOptions(text: string): { name: string; options: string[] } {
  const options: string[] = [];

  const stripped = text.replace(/__(\S+)/g, (_match, token: string) => {
    const label = token.replace(/[,:;]+$/, "");
    if (label) options.push(label);
    return " ";
  });

  return { name: cleanName(stripped), options: [...new Set(options)] };
}

function isSubstantialName(text: string): boolean {
  return text.length >= 3 && LETTER_RUN.test(text);
}

// A line written ENTIRELY in uppercase, with real letters and no placeholder
// markers, reads as a candidate section header in these price lists (e.g.
// "ACABADO Y PULIDO", "CEMENTOS"). Whether it actually becomes the current
// category depends on matching a real category name — see matchCategory().
function looksLikeSectionHeader(line: string): boolean {
  return LETTER_RUN.test(line) && !/[a-zá-ú]/.test(line) && !line.includes("__");
}

// A line with no letters at all, or a candidate section header, breaks name
// continuity rather than being part of a product name.
function isHeaderOrJunk(line: string): boolean {
  return !LETTER_RUN.test(line) || looksLikeSectionHeader(line);
}

function normalizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((word) => word.replace(/s$/, "")); // crude singular/plural fold
}

/**
 * Matches a detected section name (e.g. "ACABADO Y PULIDO") against a list of
 * real categories (e.g. "Acabados y pulido"), tolerant of accents, case, and
 * singular/plural differences. Returns the matching category's id, or null.
 */
export function matchSectionToCategory(
  section: string,
  categories: CategoryLookup[]
): string | null {
  const sectionWords = normalizeWords(section).join(" ");
  if (!sectionWords) return null;

  const match = categories.find((cat) => normalizeWords(cat.name).join(" ") === sectionWords);
  return match?.id ?? null;
}

/**
 * Best-effort heuristic: finds the right-most money-shaped number on each line
 * and treats that line (or, if the line is price-only, the preceding lines of
 * plain text) as the product name. Meant to be reviewed and corrected by a
 * human afterwards — PDF layouts vary too much to parse perfectly.
 *
 * `categories` is used to guess a category per product from ALL-CAPS section
 * headers in the document. A header line that doesn't match any real category
 * (e.g. repeated page boilerplate like "ORDEN DE PEDIDO") is ignored rather
 * than clearing the current guess, since it's almost always template noise
 * rather than an actual new section.
 */
export function parseProductLines(
  text: string,
  categories: CategoryLookup[] = []
): ParsedProductLine[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const results: ParsedProductLine[] = [];
  let nameBuffer: string[] = [];
  let currentCategoryId: string | null = null;

  for (const line of lines) {
    if (line.length > 200) {
      nameBuffer = [];
      continue;
    }

    const matches = line.length >= 4 ? [...line.matchAll(MONEY_TOKEN)] : [];

    if (matches.length === 0) {
      if (looksLikeSectionHeader(line)) {
        currentCategoryId = matchSectionToCategory(line, categories) ?? currentCategoryId;
        nameBuffer = [];
      } else if (isHeaderOrJunk(line)) {
        nameBuffer = [];
      } else {
        nameBuffer = [...nameBuffer, line].slice(-3);
      }
      continue;
    }

    const priceMatch = matches[matches.length - 1];
    const price = normalizeNumber(priceMatch[0]);

    if (!Number.isFinite(price) || price <= 0 || price > 100_000_000) {
      nameBuffer = [];
      continue;
    }

    // Prefer the first tab-separated column when the line looks columnar
    // (common in exported price-list tables); otherwise fall back to
    // everything before the matched price.
    const firstColumn = line.split("\t")[0];
    const rawOwnName =
      firstColumn && firstColumn.length >= 4 && (priceMatch.index ?? 0) >= firstColumn.length
        ? firstColumn
        : line.slice(0, priceMatch.index);

    const ownName = cleanName(stripLeadingSku(rawOwnName));

    // If this line carries its own name, use it. Otherwise (a price sitting
    // alone on its own line) fall back to whatever plain-text lines came
    // right before it.
    const rawName = isSubstantialName(ownName) ? ownName : cleanName(nameBuffer.join(" "));
    nameBuffer = [];

    const { name, options } = extractOptions(rawName);
    if (!isSubstantialName(name)) continue;

    results.push({ name, price, stock: null, suggestedCategoryId: currentCategoryId, options });
  }

  return results;
}

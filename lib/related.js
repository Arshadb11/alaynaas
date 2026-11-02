/* Light internal-linking helpers: match by name first, then fall back to the rest. */
const text = (...a) => a.filter(Boolean).join(' ').toLowerCase();

export function productsForArticle(entry, products = [], n = 3) {
  const hay = text(entry.title_en, entry.excerpt_en, entry.content_en);
  const hit = products.filter((p) => p.name && hay.includes(String(p.name).toLowerCase()));
  const rest = products.filter((p) => !hit.includes(p) && p.image);
  return [...hit, ...rest].slice(0, n);
}

export function entriesForProduct(product, entries = [], n = 3) {
  const name = String(product?.name || '').toLowerCase();
  const hit = name ? entries.filter((e) => text(e.title_en, e.excerpt_en, e.content_en).includes(name)) : [];
  const rest = entries.filter((e) => !hit.includes(e));
  return [...hit, ...rest].slice(0, n);
}

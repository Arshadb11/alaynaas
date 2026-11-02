/**
 * Image alt text for products.
 * - If the admin typed a real alt text on the image (Products > Images), it is used as-is.
 * - Otherwise a descriptive alt is generated: name, fragrance family, brand and size.
 * `L` is either the app's L() picker function or a language code ('en' | 'ar').
 */
const norm = (s) => String(s || '').trim().toLowerCase().replace(/[\s_-]+/g, ' ');

function pick(L, o) {
  if (!o) return '';
  if (typeof L === 'function') return L(o) || '';
  return (L === 'ar' ? o.ar : o.en) || o.en || '';
}

function isCustomAlt(alt, p) {
  const a = String(alt || '').trim();
  if (!a || a.toLowerCase() === 'product image') return false;
  if (norm(a) === norm(p?.name) || norm(a) === norm(p?.name_ar)) return false;
  return /\s/.test(a); // filename-like values ("after-dark-alaynaas-perfume") have no spaces
}

export function productAlt(p, L = 'en', idx = 0, custom) {
  if (!p) return '';
  if (isCustomAlt(custom, p)) return String(custom).trim();
  const ar = (typeof L === 'function' ? L({ en: 'en', ar: 'ar' }) : L) === 'ar';
  const name = (ar && p.name_ar) || p.name || '';
  const fam = pick(L, p.fragrance_family);
  const size = p.size || '';
  let s = ar
    ? `${name}${fam ? ` - عطر ${fam}` : ''} من عطور عاليناء${size ? `، ${size}` : ''}`
    : `${name}${fam ? ` - ${fam} fragrance` : ''} by ALAYNAA'S Parfums${size ? `, ${size}` : ''}`;
  if (idx > 0) s += ar ? ` (صورة ${idx + 1})` : ` (view ${idx + 1})`;
  return s;
}

/** Alt texts aligned with galleryOf(p) (same de-duplication by URL). */
export function galleryAlts(p, L = 'en') {
  if (!p) return [];
  const urls = p.gallery?.length ? p.gallery : [p.image];
  const meta = Array.isArray(p.images) ? p.images : [];
  const seen = new Set();
  const out = [];
  urls.filter(Boolean).forEach((u) => {
    if (seen.has(u)) return;
    seen.add(u);
    const m = meta.find((i) => i && i.url === u);
    out.push(productAlt(p, L, out.length, m?.alt_text));
  });
  return out;
}

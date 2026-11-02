import { getProducts, getCategories, getJournal, getStorePages } from '@/lib/api';
import { SITE_URL, absUrl } from '@/lib/seo';

/* Always built from live backend data so new products, articles and pages appear without a redeploy. */
export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const [products, categories, journal, pages] = await Promise.all([
    getProducts(), getCategories(), getJournal(), getStorePages(),
  ]);
  /* Image sitemap: absolute, de-duplicated, capped (Google reads up to 1000 per URL) */
  const imgs = (...list) => {
    const out = [...new Set(list.flat().map((x) => absUrl(typeof x === 'string' ? x : x?.url)).filter(Boolean))].slice(0, 10);
    return out.length ? { images: out } : {};
  };
  const u = (path, extra = {}) => ({ url: `${SITE_URL}${path}`, ...extra });
  const now = new Date();

  const fixed = [
    u('/', { lastModified: now, changeFrequency: 'daily', priority: 1 }),
    u('/shop', { lastModified: now, changeFrequency: 'daily', priority: 0.9 }),
    u('/discover', { changeFrequency: 'monthly', priority: 0.7 }),
    u('/exclusive-creations', { changeFrequency: 'weekly', priority: 0.7 }),
    u('/story', { changeFrequency: 'monthly', priority: 0.6 }),
    u('/journal', { lastModified: now, changeFrequency: 'weekly', priority: 0.6 }),
    u('/corporate-orders', { changeFrequency: 'monthly', priority: 0.7 }),
    u('/contact', { changeFrequency: 'yearly', priority: 0.4 }),
  ];

  const cats = categories
    .filter((c) => c.slug && c.slug !== 'exclusive-creations')
    .map((c) => u(`/shop/${c.slug}`, { changeFrequency: 'weekly', priority: 0.8, ...imgs(c.image) }));

  const prods = products
    .filter((p) => p.slug)
    .map((p) => u(`/fragrance/${p.slug}`, { changeFrequency: 'weekly', priority: 0.9, ...imgs(p.image, p.gallery || []) }));

  const articles = journal
    .filter((j) => j.slug)
    .map((j) => u(`/journal/${j.slug}`, {
      lastModified: j.published_at ? new Date(j.published_at) : undefined,
      changeFrequency: 'monthly',
      priority: 0.5,
      ...imgs(j.cover_image),
    }));

  const info = pages
    .filter((p) => p.slug)
    .map((p) => u(`/policies/${p.slug}`, { changeFrequency: 'yearly', priority: 0.3 }));

  return [...fixed, ...cats, ...prods, ...articles, ...info].flatMap((e) => {
    const path = e.url.slice(SITE_URL.length) || '/';
    const ar = `${SITE_URL}/ar${path === '/' ? '' : path}`;
    const alternates = { languages: { en: e.url, ar } };
    return [{ ...e, alternates }, { ...e, url: ar, alternates }];
  });
}

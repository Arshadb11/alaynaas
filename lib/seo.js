import { headers } from 'next/headers';
import { getStoreSettings } from '@/lib/api';

/** Public origin of the storefront. Set NEXT_PUBLIC_SITE_URL in production. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/$/, '');

export async function getLang() {
  // Set by proxy.js from the URL: /ar/... is Arabic, everything else English.
  return (await headers()).get('x-lang') === 'ar' ? 'ar' : 'en';
}

const clip = (s, n) => {
  const t = String(s || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t;
};

/** Make any image path absolute so social crawlers can fetch it. */
export function absUrl(u) {
  if (!u) return undefined;
  if (/^https?:\/\//i.test(u)) return u;
  return `${SITE_URL}${u.startsWith('/') ? '' : '/'}${u}`;
}

/** Site-wide defaults, all editable in Admin > Storefront > Pages > SEO defaults. */
export async function siteSeo(lang) {
  const s = (await getStoreSettings()) || {};
  const ar = lang === 'ar';
  const name = s.store_name || 'ALAYNAAS';
  const tagline = s.store_tagline || 'For those who carry the crown';
  return {
    name,
    title: (ar && s.seo_site_title_ar) || s.seo_site_title || `${name} | ${tagline}`,
    description: clip((ar && s.seo_site_description_ar) || s.seo_site_description || `${name}: perfume, bakhoor, oud muattar and concentrated oils from the UAE.`, 300),
    keywords: s.seo_site_keywords || '',
    image: absUrl(s.seo_og_image) || absUrl('/images/story.jpg'),
    locale: ar ? 'ar_AE' : 'en_AE',
  };
}

/**
 * Build a complete Next.js metadata object (title, description, keywords,
 * canonical, Open Graph and Twitter) with site defaults as the fallback.
 */
export async function buildMeta({ title, description, keywords, image, path = '/', type = 'website', absoluteTitle = false } = {}) {
  const lang = await getLang();
  const site = await siteSeo(lang);
  const desc = clip(description, 300) || site.description;
  const kw = keywords || site.keywords || undefined;
  const img = absUrl(image) || site.image;
  const p = path === '/' ? '' : path;
  const enUrl = `${SITE_URL}${p || '/'}`;
  const arUrl = `${SITE_URL}/ar${p}`;
  const self = lang === 'ar' ? arUrl : enUrl;
  const fullTitle = title ? (absoluteTitle ? title : `${title} | ${site.name}`) : site.title;
  return {
    ...(title ? { title: absoluteTitle ? { absolute: title } : title } : {}),
    description: desc,
    keywords: kw,
    alternates: { canonical: self, languages: { en: enUrl, ar: arUrl, 'x-default': enUrl } },
    openGraph: {
      title: fullTitle,
      description: desc,
      url: self,
      siteName: site.name,
      locale: site.locale,
      alternateLocale: site.locale === 'ar_AE' ? ['en_AE'] : ['ar_AE'],
      type,
      ...(img ? { images: [{ url: img, alt: fullTitle }] } : {}),
    },
    twitter: {
      card: img ? 'summary_large_image' : 'summary',
      title: fullTitle,
      description: desc,
      ...(img ? { images: [{ url: img, alt: fullTitle }] } : {}),
    },
  };
}

/** Serialise JSON-LD safely for a <script type="application/ld+json"> tag. */
export const ldJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

/** schema.org BreadcrumbList from [[name, path], ...] */
export const breadcrumbLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${path}` })),
});

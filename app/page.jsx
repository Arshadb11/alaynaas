import { HomeView } from '@/components/StoreViews';
import { getProducts, getCategories, getFragranceFamilies, getFeaturedReviews } from '@/lib/api';
import { buildMeta, siteSeo, getLang, ldJson, absUrl, SITE_URL } from '@/lib/seo';
import { getStoreSettings } from '@/lib/api';

export async function generateMetadata() {
  return buildMeta({ path: '/' });
}

export default async function Home() {
  const [products, categories, families, reviews] = await Promise.all([getProducts(), getCategories(), getFragranceFamilies(), getFeaturedReviews()]);
  const showcaseProducts = products.filter((p) => p.category === 'eau-de-parfum' || p.category === 'perfumes');
  const [settings, lang] = await Promise.all([getStoreSettings(), getLang()]);
  const site = await siteSeo(lang);
  const sameAs = ['social_instagram', 'social_facebook', 'social_tiktok', 'social_youtube', 'social_x', 'social_snapchat']
    .map((k) => settings?.[k]).filter((v) => typeof v === 'string' && /^https?:\/\//.test(v));
  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: site.name,
      url: SITE_URL,
      logo: absUrl(settings?.frontend_logo || settings?.footer_logo) || undefined,
      description: site.description,
      email: settings?.support_email || undefined,
      telephone: settings?.support_phone || undefined,
      address: { '@type': 'PostalAddress', addressCountry: 'AE', addressLocality: settings?.store_address || undefined },
      ...(sameAs.length ? { sameAs } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: site.name,
      url: SITE_URL,
      potentialAction: { '@type': 'SearchAction', target: `${SITE_URL}/shop?q={search_term_string}`, 'query-input': 'required name=search_term_string' },
    },
  ];
  return (
    <>
      {ld.map((o, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(o) }} />)}
      <HomeView products={showcaseProducts.length > 0 ? showcaseProducts : products} allProducts={products} categories={categories} families={families} reviews={reviews} />
    </>
  );
}

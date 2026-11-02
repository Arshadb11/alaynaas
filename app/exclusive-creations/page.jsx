import { buildMeta, getLang, ldJson, breadcrumbLd, SITE_URL, absUrl } from '@/lib/seo';
import { notFound } from 'next/navigation';
import { NicheView } from '@/components/HouseViews';
import { getProducts, getCategories } from '@/lib/api';

const META = {
  en: {
    title: 'Exclusive · Limited Edition Perfumes',
    description: 'Rare ALAYNAAS perfumes, made in small limited editions in the UAE.',
    keywords: ['exclusive perfume UAE', 'limited edition perfume', 'luxury oud perfume', 'niche perfume Dubai', 'ALAYNAAS'],
    home: 'Home', bc: 'Exclusive',
  },
  ar: {
    title: 'حصري · عطور بإصدارات محدودة',
    description: 'عطور نادرة من ALAYNAAS، تُصنع بإصدارات محدودة صغيرة في الإمارات.',
    keywords: ['عطور حصرية الإمارات', 'عطر إصدار محدود', 'عطر عود فاخر', 'عطور نيش دبي', 'ALAYNAAS'],
    home: 'الرئيسية', bc: 'حصري',
  },
};

export async function generateMetadata() {
  const lang = await getLang();
  const m = META[lang === 'ar' ? 'ar' : 'en'];
  return buildMeta({
    title: m.title,
    description: m.description,
    keywords: m.keywords,
    path: '/exclusive-creations',
    image: '/images/exclusive/vault.jpg',
  });
}

export default async function Page() {
  const [categories, products, lang] = await Promise.all([getCategories(), getProducts(), getLang()]);
  const c = categories.find((x) => x.slug === 'exclusive-creations');
  if (!c) notFound();
  const m = META[lang === 'ar' ? 'ar' : 'en'];
  const prefix = lang === 'ar' ? '/ar' : '';
  const url = `${SITE_URL}${prefix}/exclusive-creations`;
  const list = products.filter((p) => p.category === c.slug);

  const graph = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: m.bc,
      description: m.description,
      url,
      inLanguage: lang === 'ar' ? 'ar' : 'en',
      image: absUrl('/images/exclusive/vault.jpg'),
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: list.length,
        itemListElement: list.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE_URL}${prefix}/fragrance/${p.slug}`,
          name: p.name,
        })),
      },
    },
    breadcrumbLd([[m.home, prefix || '/'], [m.bc, `${prefix}/exclusive-creations`]]),
  ];

  return (
    <>
      {graph.map((g, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(g) }} />)}
      <NicheView category={c} products={products} categories={categories} />
    </>
  );
}

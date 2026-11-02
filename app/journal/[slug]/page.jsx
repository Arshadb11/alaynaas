import { notFound } from 'next/navigation';
import { JournalArticle } from '@/components/JournalViews';
import { getJournal, getJournalEntry, getProducts } from '@/lib/api';
import { productsForArticle } from '@/lib/related';
import { buildMeta, getLang, ldJson, breadcrumbLd, absUrl, SITE_URL } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const e = await getJournalEntry(slug);
  if (!e) return { title: 'Journal' };
  const ar = (await getLang()) === 'ar';
  return buildMeta({
    title: (ar && e.title_ar) || e.title_en,
    description: (ar && e.excerpt_ar) || e.excerpt_en,
    image: e.cover_image,
    path: `/journal/${slug}`,
    type: 'article',
  });
}

export default async function Page({ params }) {
  const { slug } = await params;
  const [entry, all, catalog] = await Promise.all([getJournalEntry(slug), getJournal(), getProducts()]);
  if (!entry) notFound();
  const others = all.filter((x) => x.slug !== slug);
  const i = all.findIndex((x) => x.slug === slug);
  // The next three entries after this one, wrapping around
  const more = others.length ? [0, 1, 2].map((k) => all[(i + 1 + k) % all.length]).filter((x, k, a) => x.slug !== slug && a.findIndex((y) => y.slug === x.slug) === k) : [];
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: entry.title_en,
    description: entry.excerpt_en || undefined,
    image: absUrl(entry.cover_image) ? [absUrl(entry.cover_image)] : undefined,
    datePublished: entry.published_at,
    dateModified: entry.updated_at || entry.published_at,
    mainEntityOfPage: `${SITE_URL}/journal/${slug}`,
    author: { '@type': 'Organization', name: 'ALAYNAAS' },
    publisher: { '@type': 'Organization', name: 'ALAYNAAS' },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(ld) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(breadcrumbLd([['Home', '/'], ['Journal', '/journal'], [entry.title_en, `/journal/${slug}`]])) }} />
      <JournalArticle entry={entry} more={more} products={productsForArticle(entry, catalog)} />
    </>
  );
}

import { notFound } from 'next/navigation';
import { PolicyPage } from '@/components/PolicyPage';
import { getStorePage, getStorePages } from '@/lib/api';
import { policies } from '@/lib/data';
import { buildMeta, getLang } from '@/lib/seo';

/* If the backend is unreachable, fall back to the short built-in copy so the URL never breaks. */
function fallbackPage(slug) {
  const pol = policies[slug];
  if (!pol) return null;
  return {
    slug,
    title_en: pol.title.en,
    title_ar: pol.title.ar,
    content_en: pol.body.en.join('\n\n'),
    content_ar: pol.body.ar.join('\n\n'),
  };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = (await getStorePage(slug)) || fallbackPage(slug);
  if (!page) return { title: 'Page not found' };
  const ar = (await getLang()) === 'ar';
  return buildMeta({
    title: page.meta_title || (ar && page.title_ar ? page.title_ar : page.title_en),
    description: (ar && page.summary_ar) || page.summary_en || undefined,
    keywords: page.meta_keywords || undefined,
    path: `/policies/${slug}`,
  });
}

export default async function Page({ params }) {
  const { slug } = await params;
  const [page, pages] = await Promise.all([getStorePage(slug), getStorePages()]);
  const data = page || fallbackPage(slug);
  if (!data) notFound();
  return <PolicyPage page={data} pages={pages} />;
}

import { notFound, redirect } from 'next/navigation';
import { CategoryView } from '@/components/HouseViews';
import { getProducts, getCategories } from '@/lib/api';
import { buildMeta, getLang, ldJson, breadcrumbLd } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { category } = await params;
  const lang = await getLang();
  const c = (await getCategories()).find((x) => x.slug === category);
  if (!c) return buildMeta({ title: 'Fragrances', path: `/shop/${category}` });
  const ar = lang === 'ar';
  const strip = (s) => String(s || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  const desc = strip(ar ? (c.description_ar || c.description) : c.description) || (c.intro?.en || []).join(' ');
  return buildMeta({
    title: ar ? (c.name_ar || c.name?.ar || c.name?.en) : (c.name?.en || c.name),
    description: desc,
    image: c.image,
    path: `/shop/${category}`,
  });
}

export default async function Page({ params }) {
  const { category } = await params;
  if (category === 'exclusive-creations') redirect(`${(await getLang()) === 'ar' ? '/ar' : ''}/exclusive-creations`);
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const c = categories.find((x) => x.slug === category);
  if (!c) notFound();
  const name = c.name?.en || c.name;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(breadcrumbLd([['Home', '/'], ['Shop', '/shop'], [name, `/shop/${category}`]])) }}
      />
      <CategoryView category={c} products={products} categories={categories} />
    </>
  );
}

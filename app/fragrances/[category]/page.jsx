import { notFound, redirect } from 'next/navigation';
import { CategoryView } from '@/components/HouseViews';
import { getProducts, getCategories } from '@/lib/api';

export async function generateMetadata({ params }) {
  const { category } = await params;
  const c = (await getCategories()).find((x) => x.slug === category);
  return c ? { title: c.name.en, description: c.intro.en.join(' ') } : { title: 'Fragrances' };
}

export default async function Page({ params }) {
  const { category } = await params;
  if (category === 'exclusive-creations') redirect('/exclusive-creations');
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const c = categories.find((x) => x.slug === category);
  if (!c) notFound();
  return <CategoryView category={c} products={products} categories={categories} />;
}

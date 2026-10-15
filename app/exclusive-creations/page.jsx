import { notFound } from 'next/navigation';
import { NicheView } from '@/components/HouseViews';
import { getProducts, getCategories } from '@/lib/api';

export const metadata = { title: 'Exclusive Creations', description: 'Not everything needs to become part of the collection. Exclusive Creations is where those ideas live.' };

export default async function Page() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const c = categories.find((x) => x.slug === 'exclusive-creations');
  if (!c) notFound();
  return <NicheView category={c} products={products} categories={categories} />;
}

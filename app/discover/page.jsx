import { buildMeta } from '@/lib/seo';
import { DiscoverView } from '@/components/DiscoverView';
import { getProducts, getCategories, getFragranceFamilies } from '@/lib/api';

export async function generateMetadata() {
  return buildMeta({
    title: 'Find your fragrance',
    description: 'A few quick questions to match you with the right fragrance. Every choice shows how many fragrances it leaves you with.',
    path: '/discover',
  });
}

export default async function Page() {
  const [products, categories, families] = await Promise.all([getProducts(), getCategories(), getFragranceFamilies()]);
  return <DiscoverView products={products} categories={categories} families={families} />;
}
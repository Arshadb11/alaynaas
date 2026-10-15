import { FragrancesView } from '@/components/HouseViews';
import { getProducts, getCategories, getFragranceFamilies } from '@/lib/api';

export const metadata = { title: 'Fragrances', description: 'The many forms of fragrance: Eau de Parfum, Bakhoor, Oud Ma\u2019attar, Concentrated Perfume Oils and Niche Creations.' };

export default async function Page({ searchParams }) {
  // Header search sends ?q=… ; the homepage family panels send ?family=slug. Keep both short and plain-text.
  const { q, family } = await searchParams;
  const query = typeof q === 'string' ? q.trim().slice(0, 100) : '';
  const familySlug = typeof family === 'string' ? family.trim().slice(0, 60) : '';
  const [all, categories, families] = await Promise.all([getProducts(query ? { q: query } : undefined), getCategories(), getFragranceFamilies()]);
  const fam = familySlug ? families.find((f) => f.slug === familySlug) : null;
  const products = fam ? all.filter((p) => String(p.family_slugs || '').split(',').includes(fam.slug)) : all;
  return <FragrancesView products={products} categories={categories} query={query} family={fam} />;
}

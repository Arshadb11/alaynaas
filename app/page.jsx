import { HomeView } from '@/components/StoreViews';
import { getProducts, getCategories, getFragranceFamilies } from '@/lib/api';

export const metadata = {
  title: 'ALAYNAAS | For those who carry the crown',
  description: 'Perfume, bakhoor, oud ma’attar and concentrated oils from the UAE. Discover the Crown Collection: Formula 7, Ember Noir, After Dark and Lost Summer.',
};

export default async function Home() {
  const [products, categories, families] = await Promise.all([getProducts(), getCategories(), getFragranceFamilies()]);
  const showcaseProducts = products.filter((p) => p.category === 'eau-de-parfum' || p.category === 'perfumes');
  return <HomeView products={showcaseProducts.length > 0 ? showcaseProducts : products} allProducts={products} categories={categories} families={families} />;
}

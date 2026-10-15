import { Finder } from '@/components/HouseViews';
import { getProducts, getCategories } from '@/lib/api';

export const metadata = { title: 'Find your fragrance', description: 'Two questions. No wrong answers. Find the fragrance that feels like you.' };

export default async function Page() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return <Finder products={products}  standalone />;
}

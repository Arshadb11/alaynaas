import { FragranceView } from '@/components/StoreViews';
import { getProduct, getProducts } from '@/lib/api';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  const desc = p && (p.impression?.en || p.line?.en || '');
  return p ? { title: p.name, description: desc } : { title: 'Fragrance' };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const [product, all] = await Promise.all([getProduct(slug), getProducts()]);
  const pool = product ? all.filter((x) => x.category === product.category) : [];
  const next = product && pool.length > 1 ? pool[(pool.findIndex((x) => x.id === product.id) + 1) % pool.length] : null;
  return <FragranceView key={slug} product={product} products={all} next={next} />;
}

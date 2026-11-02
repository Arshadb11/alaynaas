import { ShopCatalogView } from '@/components/ShopCatalogView';
import { getProducts, getCategories, getFragranceFamilies } from '@/lib/api';
import { buildMeta, getLang } from '@/lib/seo';

export async function generateMetadata() {
  const lang = await getLang();
  const ar = lang === 'ar';
  return buildMeta({
    title: ar ? '\u0627\u0644\u0645\u062a\u062c\u0631' : 'Shop all fragrances',
    description: ar ? '\u062a\u0635\u0641\u0651\u062d \u0643\u0644 \u0639\u0637\u0648\u0631 \u0623\u0644\u064a\u0646\u0627\u0633 \u0648\u0635\u0641\u0651\u0647\u0627 \u062d\u0633\u0628 \u0627\u0644\u0639\u0627\u0626\u0644\u0629 \u0627\u0644\u0639\u0637\u0631\u064a\u0629 \u0648\u0627\u0644\u0646\u0648\u0639 \u0648\u0627\u0644\u062d\u062c\u0645.' : 'The full Alaynaas catalogue in one place. Filter by fragrance family, category, gender and size.',
    path: '/shop',
  });
}

export default async function Page({ searchParams }) {
  const sp = await searchParams;
  const q = typeof sp?.q === 'string' ? sp.q.trim().slice(0, 100) : '';
  const category = typeof sp?.category === 'string' ? sp.category.trim().slice(0, 60) : 'all';
  const family = typeof sp?.family === 'string' ? sp.family.trim().slice(0, 60) : 'all';

  const [allProducts, categories, families] = await Promise.all([
    getProducts(),
    getCategories(),
    getFragranceFamilies(),
  ]);

  return (
    <ShopCatalogView
      initialProducts={allProducts}
      categories={categories}
      families={families}
      initialCategory={category}
      initialFamily={family}
      initialQuery={q}
    />
  );
}

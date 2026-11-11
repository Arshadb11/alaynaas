import { notFound } from 'next/navigation';
import { AtelierResult } from '@/components/AtelierViews';
import { getAtelierCreation } from '@/lib/api';
import { buildMeta, getLang } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { code } = await params;
  const c = await getAtelierCreation(code);
  const ar = (await getLang()) === 'ar';
  if (!c) return { robots: { index: false } };
  const name = ar ? c.formula.name.ar : c.formula.name.en;
  const meta = await buildMeta({
    title: ar ? `${name}: طقس التاج` : `${name}: a Crown Ritual`,
    description: ar ? (c.story || c.formula.story).ar : (c.story || c.formula.story).en,
    path: `/atelier/${c.code}`,
  });
  // Personal results: shareable, but kept out of search engines
  return { ...meta, robots: { index: false, follow: true } };
}

export default async function Page({ params }) {
  const { code } = await params;
  const creation = await getAtelierCreation(code);
  if (!creation) notFound();
  return <AtelierResult creation={creation} />;
}

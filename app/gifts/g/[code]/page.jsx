import { notFound } from 'next/navigation';
import { GiftOpen } from '@/components/GiftsViews';
import { getGiftSend } from '@/lib/api';
import { buildMeta, getLang } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { code } = await params;
  const g = await getGiftSend(code);
  const ar = (await getLang()) === 'ar';
  if (!g) return { robots: { index: false } };
  const meta = await buildMeta({
    title: ar ? `${g.to_name}، لديك هدية من ${g.from_name}` : `${g.to_name}, ${g.from_name} sent you a gift`,
    description: ar ? 'افتح هديتك المختومة من عطور عاليناء.' : "Open your sealed gift from ALAYNAA'S Parfums.",
    path: `/gifts/g/${g.code}`,
  });
  // Personal links: shareable, never in search engines
  return { ...meta, robots: { index: false, follow: false } };
}

export default async function Page({ params }) {
  const { code } = await params;
  const gift = await getGiftSend(code);
  if (!gift) notFound();
  return <GiftOpen gift={gift} />;
}

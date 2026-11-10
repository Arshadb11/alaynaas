import { GiftMajlis } from '@/components/GiftsViews';
import { buildMeta, getLang } from '@/lib/seo';

export async function generateMetadata() {
  const ar = (await getLang()) === 'ar';
  return buildMeta({
    title: ar ? 'مجلس الهدايا: هديتك بانتظارك' : 'The Gift Majlis: A Gift Is Waiting for You',
    description: ar
      ? 'اختر طريقة من أربع واكشف هديتك المجانية من عطور عاليناء، أو أرسل هدية لمن تحب. توصيل مجاني داخل الإمارات.'
      : "Choose one of four quick ways to reveal a free gift from ALAYNAA'S Parfums, or send one to someone you love. Free delivery across the UAE.",
    path: '/gifts',
  });
}

export default function Page() { return <GiftMajlis />; }

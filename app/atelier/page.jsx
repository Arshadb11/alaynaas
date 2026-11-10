import { AtelierComposer } from '@/components/AtelierViews';
import { buildMeta, getLang } from '@/lib/seo';

export async function generateMetadata() {
  const ar = (await getLang()) === 'ar';
  return buildMeta({
    title: ar ? 'أتيليه التاج: ركّب عطرك الخاص' : 'The Crown Atelier: Compose Your Own Perfume',
    description: ar
      ? 'أجب عن أسئلة قليلة واحصل على تركيبة عطرية خاصة بك: نوتاتها ونسبها واسمها وزجاجة باسمك.'
      : 'Answer a few questions and receive a perfume formula composed only for you: its notes, proportions, name and a bottle with your name.',
    path: '/atelier',
  });
}

export default function Page() { return <AtelierComposer />; }

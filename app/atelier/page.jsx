import { AtelierComposer } from '@/components/AtelierViews';
import { buildMeta, getLang } from '@/lib/seo';

export async function generateMetadata() {
  const ar = (await getLang()) === 'ar';
  return buildMeta({
    title: ar ? 'أتيليه التاج: اكتشف طقس التاج الخاص بك' : 'The Crown Atelier: Discover Your Crown Ritual',
    description: ar
      ? 'أجب عن أسئلة قليلة واحصل على طقس تعطّر خاص بك: دهن وعطر وبخور من إبداعات عاليناء تناسبك، باسم خاص وباسمك عليه.'
      : "Answer a few questions and receive your own layering ritual: an oil, a perfume and bakhoor from ALAYNAA'S chosen for you, with a name of its own and yours on it.",
    path: '/atelier',
  });
}

export default function Page() { return <AtelierComposer />; }

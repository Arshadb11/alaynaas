import { JournalIndex } from '@/components/JournalViews';
import { getJournal } from '@/lib/api';
import { buildMeta, getLang } from '@/lib/seo';

export async function generateMetadata() {
  const ar = (await getLang()) === 'ar';
  return buildMeta({
    title: ar ? 'اليوميات' : 'The Journal',
    description: ar
      ? 'مقالات عن المواد والتجارب وقصص العطور خلف كل زجاجة من ألينّاس.'
      : 'Articles about materials, experiments and the stories behind every ALAYNAAS fragrance.',
    path: '/journal',
  });
}

export default async function Page() {
  return <JournalIndex entries={await getJournal()} />;
}

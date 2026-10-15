import { JournalEntryView } from '@/components/StoreViews';
import { journal } from '@/lib/data';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const e = journal.find((j) => j.slug === slug);
  return e ? { title: e.title, description: e.excerpt } : { title: 'Journal' };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const i = journal.findIndex((j) => j.slug === slug);
  return <JournalEntryView entry={journal[i] || null} next={i >= 0 ? journal[(i + 1) % journal.length] : null} />;
}

import { StoryView } from '@/components/StoreViews';
import { getCategories } from '@/lib/api';

export const metadata = { title: 'The story behind the crown', description: 'ALAYNAAS is not the story of a finished brand. It is the story of building one.' };

export default async function Page() {
  return <StoryView categories={await getCategories()} />;
}

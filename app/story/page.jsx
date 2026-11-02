import { buildMeta } from '@/lib/seo';
import { StoryView } from '@/components/StoreViews';
import { getCategories } from '@/lib/api';

export async function generateMetadata() {
  return buildMeta({
    title: 'The story behind the crown',
    description: "The crown isn't inherited. It's carried. The story behind ALAYNAAS: a UAE fragrance brand built around identity, ambition and character.",
    path: '/story',
    image: '/images/story.jpg',
  });
}

export default async function Page() {
  return <StoryView categories={await getCategories()} />;
}

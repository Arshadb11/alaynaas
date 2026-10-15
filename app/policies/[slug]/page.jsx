import { PolicyView } from '@/components/PageViews';

export default async function Page({ params }) {
  const { slug } = await params;
  return <PolicyView slug={slug} />;
}

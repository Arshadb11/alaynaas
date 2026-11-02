import { redirect } from 'next/navigation';
import { getLang } from '@/lib/seo';

export default async function Page() {
  redirect(`${(await getLang()) === 'ar' ? '/ar' : ''}/exclusive-creations`);
}

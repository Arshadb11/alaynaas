import Link from '@/components/Link';
import { getLang, buildMeta } from '@/lib/seo';

export async function generateMetadata() {
  const m = await buildMeta({ title: 'Page not found', path: '/' });
  return { ...m, alternates: undefined, robots: { index: false, follow: true } };
}

export default async function NotFound() {
  const ar = (await getLang()) === 'ar';
  const links = ar
    ? [['/shop', 'تسوّق العطور'], ['/discover', 'اكتشف عطرك'], ['/journal', 'اليوميات'], ['/contact', 'تواصل معنا']]
    : [['/shop', 'Shop the fragrances'], ['/discover', 'Find your fragrance'], ['/journal', 'The Journal'], ['/contact', 'Contact us']];
  return (
    <div className="nf">
      <p className="nf-code">404</p>
      <h1>{ar ? 'هذه الصفحة غير موجودة' : 'This page could not be found'}</h1>
      <p className="nf-text">{ar ? 'ربما تغيّر الرابط أو لم تعد الصفحة متاحة. هذه بعض الأماكن المفيدة للبدء منها.' : 'The link may have changed or the page is no longer available. Here are a few good places to start.'}</p>
      <div className="nf-links">
        {links.map(([h, l]) => <Link key={h} href={h} className="btn btn-line">{l}</Link>)}
      </div>
      <Link href="/" className="nf-home">{ar ? 'العودة إلى الرئيسية' : 'Back to the home page'}</Link>
    </div>
  );
}

import { CorporateView } from '@/components/CorporateView';
import { buildMeta, getLang, ldJson, breadcrumbLd, SITE_URL, absUrl } from '@/lib/seo';
import { getStoreSettings } from '@/lib/api';
import { CORP } from '@/lib/corporate';

export async function generateMetadata() {
  const lang = await getLang();
  const c = CORP[lang === 'ar' ? 'ar' : 'en'];
  return buildMeta({ title: c.metaTitle, description: c.metaDesc, keywords: c.keywords, image: '/images/travel-set.jpg', path: '/corporate-orders' });
}

export default async function Page() {
  const lang = await getLang();
  const c = CORP[lang === 'ar' ? 'ar' : 'en'];
  const s = (await getStoreSettings()) || {};
  const base = lang === 'ar' ? `${SITE_URL}/ar` : SITE_URL;
  const url = `${base}/corporate-orders`;
  const home = lang === 'ar' ? '/ar' : '/';

  const graph = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: c.svcName,
      serviceType: 'Corporate gifting',
      description: c.metaDesc,
      url,
      image: absUrl('/images/travel-set.jpg'),
      inLanguage: lang === 'ar' ? 'ar' : 'en',
      areaServed: { '@type': 'Country', name: 'United Arab Emirates' },
      provider: { '@type': 'Organization', name: "ALAYNAA'S Parfums", url: SITE_URL, ...(s.support_email ? { email: s.support_email } : {}), ...(s.support_phone ? { telephone: s.support_phone } : {}) },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: c.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    },
    breadcrumbLd([[c.bcHome, home], [c.bc, `${lang === 'ar' ? '/ar' : ''}/corporate-orders`]]),
  ];

  return (
    <>
      {graph.map((g, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(g) }} />)}
      <CorporateView />
    </>
  );
}

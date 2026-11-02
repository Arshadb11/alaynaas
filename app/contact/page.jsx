import { ContactView } from '@/components/ContactView';
import { buildMeta, getLang } from '@/lib/seo';
import { getStoreSettings } from '@/lib/api';

export async function generateMetadata() {
  const lang = await getLang();
  const s = (await getStoreSettings()) || {};
  const ar = lang === 'ar';
  const text = (ar && s.contact_text_ar) || s.contact_text_en || '';
  return buildMeta({
    title: (ar && s.contact_title_ar) || s.contact_title_en || (ar ? 'تواصل معنا' : 'Contact'),
    description: text || (ar ? 'تواصل مع عطور عاليناء.' : "Get in touch with ALAYNAA'S Parfums."),
    path: '/contact',
  });
}

export default function Page() { return <ContactView />; }

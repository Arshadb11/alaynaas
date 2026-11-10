import { QrGeneratorView } from '@/components/QrGeneratorView';
import { buildMeta, getLang } from '@/lib/seo';

export async function generateMetadata() {
  const ar = (await getLang()) === 'ar';
  const meta = await buildMeta({
    title: ar ? 'مولّد رمز QR' : 'QR Code Generator',
    description: ar ? 'أنشئ رمز QR ثابتاً صالحاً مدى الحياة للروابط والنصوص وواتساب والواي فاي.' : 'Create static QR codes that never expire, for links, text, WhatsApp, phone, email and Wi-Fi.',
    path: '/qr-generator',
  });
  // Private tool: keep it out of Google and other search engines (also not in sitemap.js)
  return { ...meta, robots: { index: false, follow: false, googleBot: { index: false, follow: false } } };
}

export default function Page() { return <QrGeneratorView />; }

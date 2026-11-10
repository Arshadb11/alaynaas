import { QrGeneratorView } from '@/components/QrGeneratorView';
import { buildMeta, getLang } from '@/lib/seo';

export async function generateMetadata() {
  const ar = (await getLang()) === 'ar';
  return buildMeta({
    title: ar ? 'مولّد رمز QR' : 'QR Code Generator',
    description: ar ? 'أنشئ رمز QR ثابتاً صالحاً مدى الحياة للروابط والنصوص وواتساب والواي فاي.' : 'Create static QR codes that never expire, for links, text, WhatsApp, phone, email and Wi-Fi.',
    path: '/qr-generator',
  });
}

export default function Page() { return <QrGeneratorView />; }

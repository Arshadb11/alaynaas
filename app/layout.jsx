import { Jost, El_Messiri } from 'next/font/google';
import Providers from '@/components/Providers';
import { Header, Footer, CartDrawer } from '@/components/Chrome';
import SmoothScroll from '@/components/SmoothScroll';
import Analytics from '@/components/Analytics';
import { getCategories, getProducts, getStoreSettings, getNavMenu, getStorePages } from '@/lib/api';
import { siteSeo, getLang, SITE_URL } from '@/lib/seo';
import './globals.css';

/* Typography matches ahmedalmaghribi.ma: Jost for display + UI, El Messiri for Arabic */
const display = Jost({ subsets: ['latin'], weight: ['200', '300', '400', '500'], style: ['normal'], variable: '--f-display' });
const ui = Jost({ subsets: ['latin'], weight: ['200', '300', '400', '500'], variable: '--f-ui' });
// Arabic face is only needed for /ar pages: do not preload it for English visitors
const arUi = El_Messiri({ subsets: ['arabic'], weight: ['400', '500', '600', '700'], variable: '--f-ar-ui', preload: false });

export const viewport = { themeColor: '#0b0a09' };

/** Only accept #RRGGBB so a bad setting can never inject arbitrary CSS. */
const safeColor = (c) => (typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c) ? c : null);

export async function generateMetadata() {
  const settings = await getStoreSettings();
  const favicon = settings?.favicon
    ? (settings.favicon.startsWith('http') || settings.favicon.startsWith('/') ? settings.favicon : `/${settings.favicon}`)
    : '/favicon.ico';
  const lang = await getLang();
  const site = await siteSeo(lang);

  return {
    metadataBase: new URL(SITE_URL),
    icons: { icon: favicon, shortcut: favicon, apple: favicon },
    title: { default: site.title, template: `%s | ${site.name}` },
    description: site.description,
    keywords: site.keywords || undefined,
    applicationName: site.name,
    verification: {
      ...(settings?.tracking_google_verification ? { google: settings.tracking_google_verification } : {}),
      ...(settings?.tracking_bing_verification ? { other: { 'msvalidate.01': settings.tracking_bing_verification } } : {}),
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
    openGraph: {
      title: site.title,
      description: site.description,
      siteName: site.name,
      locale: site.locale,
      type: 'website',
      ...(site.image ? { images: [{ url: site.image }] } : {}),
    },
    twitter: {
      card: site.image ? 'summary_large_image' : 'summary',
      title: site.title,
      description: site.description,
      ...(site.image ? { images: [site.image] } : {}),
    },
  };
}

export default async function RootLayout({ children }) {
  const lang = await getLang();
  const [cats, prods, storeSettings, navMenu, storePages] = await Promise.all([
    getCategories(),
    getProducts(),
    getStoreSettings(),
    getNavMenu(),
    getStorePages(),
  ]);

  const resolveImg = (img) => {
    if (!img) return '/images/formula-7.jpg';
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/')) return img;
    return `/${img}`;
  };

  const rooms = cats.map((c) => ({
    slug: c.slug,
    href: c.href || `/shop/${c.slug}`,
    tag: c.tag || { en: c.name, ar: c.name_ar || c.name },
    menu: c.menu || { en: c.name, ar: c.name_ar || c.name },
    image: resolveImg(c.image || c.icon_image),
    count: prods.filter((p) => p.category === c.slug).length,
  }));

  const brand = safeColor(storeSettings?.primary_brand_color);
  const mqItems = Array.isArray(storeSettings?.marquee_items) ? storeSettings.marquee_items : null;
  const mqOff = storeSettings?.marquee_enabled === false || (mqItems && mqItems.length > 0 && !mqItems.some((m) => m?.active !== false));

  return (
    <html
      lang={lang}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className={`${display.variable} ${ui.variable} ${arUi.variable} ${mqOff ? 'no-mq' : ''}`}
      style={brand ? { '--brand': brand } : undefined}
    >
      <body>
        <Providers initialLang={lang} settings={storeSettings}>
          <Analytics />
          <SmoothScroll />
          <Header rooms={rooms} navMenu={navMenu} />
          <main>{children}</main>
          <Footer rooms={rooms} pages={storePages} />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}

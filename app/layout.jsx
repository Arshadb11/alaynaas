import { cookies } from 'next/headers';
import { Playfair_Display, Inter, IBM_Plex_Sans_Arabic } from 'next/font/google';
import Providers from '@/components/Providers';
import { Header, Footer, CartDrawer } from '@/components/Chrome';
import SmoothScroll from '@/components/SmoothScroll';
import { getCategories, getProducts, getStoreSettings, getNavMenu } from '@/lib/api';
import './globals.css';

const display = Playfair_Display({ subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'], variable: '--f-display' });
const ui = Inter({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--f-ui' });
/* Three families only: Playfair Display (display), Inter (UI), IBM Plex Sans Arabic (Arabic, display and UI) */
const arUi = IBM_Plex_Sans_Arabic({ subsets: ['arabic'], weight: ['300', '400', '500'], variable: '--f-ar-ui' });

export const viewport = { themeColor: '#0b0a09' };

/** Only accept #RRGGBB so a bad setting can never inject arbitrary CSS. */
const safeColor = (c) => (typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c) ? c : null);

export async function generateMetadata() {
  const settings = await getStoreSettings();
  const favicon = settings?.favicon
    ? (settings.favicon.startsWith('http') || settings.favicon.startsWith('/') ? settings.favicon : `/${settings.favicon}`)
    : '/favicon.ico';
  const name = settings?.store_name || 'ALAYNAAS';
  const tagline = settings?.store_tagline || 'For those who carry the crown';

  return {
    icons: { icon: favicon, shortcut: favicon, apple: favicon },
    title: { default: `${name} | ${tagline}`, template: `%s | ${name}` },
    description: `${name}: perfume, bakhoor, oud ma’attar and concentrated oils from the UAE.`,
  };
}

export default async function RootLayout({ children }) {
  const lang = (await cookies()).get('lang')?.value === 'ar' ? 'ar' : 'en';
  const [cats, prods, storeSettings, navMenu] = await Promise.all([
    getCategories(),
    getProducts(),
    getStoreSettings(),
    getNavMenu(),
  ]);

  const resolveImg = (img) => {
    if (!img) return '/images/formula-7.jpg';
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/')) return img;
    return `/${img}`;
  };

  const rooms = cats.map((c) => ({
    slug: c.slug,
    href: c.href || `/fragrances/${c.slug}`,
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
          <SmoothScroll />
          <Header rooms={rooms} navMenu={navMenu} />
          <main>{children}</main>
          <Footer rooms={rooms} />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}

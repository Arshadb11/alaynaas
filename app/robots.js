import { SITE_URL } from '@/lib/seo';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Private, transactional or duplicate URLs
        disallow: ['/cart', '/checkout', '/account', '/api/', '/*?q=', '/niche-creations', '/ar/cart', '/ar/checkout', '/ar/account', '/ar/*?q='],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

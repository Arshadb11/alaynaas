# SEO launch checklist

## 1. Environment (host settings)
- [ ] `NEXT_PUBLIC_SITE_URL` = live domain, e.g. `https://www.alaynaas.com` (canonicals, hreflang, sitemap, share links)
- [ ] `NEXT_PUBLIC_API_URL` = live backend, e.g. `https://api.alaynaas.com/api/store`
- [ ] Rebuild after changing either (`npm run build`, then `npm start`): they are read at build time
- [ ] HTTPS on both domains; www / non-www redirects to one version

## 2. Database (run once on the live backend, from `server/`)
- [ ] `node scripts/add_contact.js`
- [ ] `node scripts/add_tracking.js`
- [ ] `node scripts/fill_product_descriptions.js` (placeholder copy, replace with real text)

## 3. Admin > Storefront
- [ ] **Contact**: real email, phone, WhatsApp, address, hours, map link, social links
- [ ] **Pages > SEO defaults**: site title/description (EN + AR), keywords, social sharing image (1200x630)
- [ ] **Pages > SEO defaults > Tracking**: GA4 *or* GTM ID, Meta Pixel ID, Search Console + Bing tokens
- [ ] Products: real descriptions, image alt text where you want custom wording, SEO title/description
- [ ] Journal: add Arabic text where wanted (otherwise the English text shows on /ar)

## 4. After the site is live
- [ ] Open https://DOMAIN/sitemap.xml and https://DOMAIN/robots.txt, check both load
- [ ] Search Console: add the property, verify (token above), submit `sitemap.xml`
- [ ] Bing Webmaster: import from Search Console
- [ ] Rich Results Test on one product URL (price, rating, shipping, returns)
- [ ] Share one product link in WhatsApp/Instagram: preview image and title appear
- [ ] Check an `/ar/...` page: Arabic, right-to-left, `hreflang` tags present
- [ ] GA4 Realtime / Meta Pixel Helper: page view, view_item, add_to_cart, purchase appear
- [ ] Lighthouse (mobile) on home, a product, shop: aim for 90+ on SEO and Best Practices

## 5. Ongoing
- Add a journal article every 2 to 3 weeks; mention fragrance names so they link to the products automatically
- Review approved customer reviews: they feed the star rating shown in Google
- If a product URL (slug) changes, add a redirect in `next.config.mjs` so old links keep working

import { FragranceView } from '@/components/StoreViews';
import { getProduct, getProducts, getProductReviews, getStoreSettings, getJournal } from '@/lib/api';
import { entriesForProduct } from '@/lib/related';
import { productQa } from '@/lib/productQa';
import { buildMeta, getLang, absUrl, ldJson, breadcrumbLd, SITE_URL } from '@/lib/seo';

const isGenericSeo = (d) => !d || (String(d).length < 70 && /by alaynaa'?s parfums\.?$/i.test(String(d).trim()));
const realSeoDesc = (seo) => (isGenericSeo(seo?.description) ? '' : seo.description);

/* Title, description, keywords and social card come from the product's SEO fields in the admin
   (Products > SEO). Arabic visitors get the Arabic name/description. */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return buildMeta({ title: 'Fragrance', path: `/fragrance/${slug}` });
  const ar = (await getLang()) === 'ar';
  const seo = p.seo || {};
  const family = p.fragrance_family ? (ar ? p.fragrance_family.ar : p.fragrance_family.en) : '';
  const title = ar && p.name_ar ? p.name_ar : (seo.title || p.name);
  const description =
    (ar && (p.short_description_ar || p.description_ar)) ||
    realSeoDesc(seo) ||
    p.short_description ||
    p.impression?.en ||
    '';
  const keywords = [seo.keywords, family, p.category_name, p.brand?.name].filter(Boolean).join(', ') || undefined;
  return buildMeta({
    title,
    description,
    keywords,
    image: p.image,
    path: `/fragrance/${slug}`,
    type: 'website',
  });
}

export default async function Page({ params }) {
  const { slug } = await params;
  const [product, all, reviews, journalAll] = await Promise.all([getProduct(slug), getProducts(), getProductReviews(slug), getJournal()]);
  const pool = product ? all.filter((x) => x.category === product.category) : [];
  const next = product && pool.length > 1 ? pool[(pool.findIndex((x) => x.id === product.id) + 1) % pool.length] : null;

  /* Structured data for Google: price, stock, delivery + return terms (from Admin > Settings),
     rating and written reviews (approved ones only), notes and fragrance family. */
  let jsonLd = null;
  let faqLd = null;
  if (product) {
    const ar = (await getLang()) === 'ar';
    const st = (await getStoreSettings()) || {};
    const base = product.seo?.schema && typeof product.seo.schema === 'object' ? product.seo.schema : {};
    const sum = reviews?.summary;
    const url = `${SITE_URL}${ar ? '/ar' : ''}/fragrance/${slug}`;
    const brandName = product.brand?.name || st.store_name || 'ALAYNAAS';
    const days = String(st.delivery_days || '2 - 5').match(/\d+/g) || ['2', '5'];
    const refund = Number(st.refund_days) || 7;
    const strip = (v) => String(v || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    const desc = strip((ar && (product.short_description_ar || product.description_ar)) || realSeoDesc(product.seo) || product.short_description || product.description) || undefined;

    const offerBase = {
      '@type': 'Offer',
      url,
      priceCurrency: product.currency?.code || 'AED',
      availability: product.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
      seller: { '@type': 'Organization', name: st.store_name || 'ALAYNAAS' },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'AE',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: refund,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: Number(st.shipping_fee) || 0, currency: 'AED' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'AE' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: Number(days[0]), maxValue: Number(days[1] || days[0]), unitCode: 'DAY' },
        },
      },
    };
    const variants = Array.isArray(product.variants) ? product.variants.filter((v) => v && v.price > 0) : [];
    const offers = variants.length > 1
      ? variants.map((v) => ({ ...offerBase, name: v.label || v.key, price: v.price }))
      : { ...offerBase, price: product.price };

    const notes = product.notes || {};
    const props = [
      ['Top notes', notes.top], ['Heart notes', notes.heart], ['Base notes', notes.base],
    ].filter(([, v]) => Array.isArray(v) && v.length).map(([name, v]) => ({ '@type': 'PropertyValue', name, value: v.join(', ') }));
    const fam = product.fragrance_family?.en;
    if (fam) props.push({ '@type': 'PropertyValue', name: 'Fragrance family', value: fam });

    const written = (reviews?.reviews || []).slice(0, 5).map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.name || 'Customer' },
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
      ...(r.title ? { name: r.title } : {}),
      ...(r.body ? { reviewBody: r.body } : {}),
      ...(r.created_at ? { datePublished: String(r.created_at).slice(0, 10) } : {}),
    }));

    jsonLd = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      ...base,
      '@id': `${url}#product`,
      name: (ar && product.name_ar) || product.name,
      url,
      inLanguage: ar ? 'ar' : 'en',
      image: [...new Set((product.gallery || []).map(absUrl).filter(Boolean))],
      description: desc,
      brand: { '@type': 'Brand', name: brandName },
      ...(product.sku ? { sku: product.sku } : {}),
      ...(product.size ? { size: product.size } : {}),
      ...(fam ? { category: fam } : {}),
      ...(props.length ? { additionalProperty: props } : {}),
      offers,
      ...(sum?.count > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: Number(sum.average).toFixed(1), reviewCount: sum.count, bestRating: 5, worstRating: 1 } } : {}),
      ...(written.length ? { review: written } : {}),
    };
    const qa = productQa(product, ar ? 'ar' : 'en');
    if (qa.length) faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: ar ? 'ar' : 'en', mainEntity: qa.map((x) => ({ '@type': 'Question', name: x.q.replace(/[\u2068\u2069]/g, ''), acceptedAnswer: { '@type': 'Answer', text: x.a.replace(/[\u2068\u2069]/g, '') } })) };
  }

  return (
    <>
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqLd) }} />}
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(jsonLd) }} />}
      {product && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldJson(breadcrumbLd([
            ['Home', '/'],
            ['Shop', '/shop'],
            ...(product.category && product.category_name ? [[product.category_name, `/shop/${product.category}`]] : []),
            [product.name, `/fragrance/${slug}`],
          ])) }}
        />
      )}
      <FragranceView key={slug} product={product} products={all} next={next} journal={product ? entriesForProduct(product, journalAll) : []} />
    </>
  );
}

import { journal as staticJ } from './data';
/**
 * ALAYNAAS STOREFRONT DATA LAYER
 * 
 * Securely connects to the Express Backend API (/api/store).
 * Fast Next.js Server-side fetching with ISR caching (revalidate: 60).
 * Graceful fallback to local mock data if the API is offline during development.
 */
import { products as mockProducts, categories as mockCategories } from './data';

const BASE = process.env.NEXT_PUBLIC_API_URL;
const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

async function http(path, options = {}) {
  try {
    const method = (options.method || 'GET').toUpperCase();
    const isMutation = method !== 'GET';

    const fetchOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    };

    if (isMutation) {
      fetchOptions.cache = 'no-store';
      delete fetchOptions.next;
    } else if (!fetchOptions.next) {
      fetchOptions.next = { revalidate: 60 }; // ISR: Cache for 60 seconds for lightning-fast TTFB and SEO
    }

    const res = await fetch(`${BASE}${path}`, fetchOptions);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const detailedMsg = errData.details && Array.isArray(errData.details)
        ? errData.details.map((d) => d.message).join(', ')
        : (errData.error || errData.message || `API request failed with status ${res.status}`);
      throw Object.assign(new Error(detailedMsg), { code: errData.code, status: res.status });
    }

    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (err) {
    console.warn(`[Storefront API] Error in ${options.method || 'GET'} ${path}:`, err.message);
    throw err;
  }
}

/**
 * Normalizes backend product shape to match the luxury storefront UI requirements
 */
export function normalizeProduct(apiProduct) {
  if (!apiProduct) return null;

  // If already normalized or local mock product
  if (apiProduct.world && apiProduct.line) return apiProduct;


  // Price is always the backend country price; variants (e.g. 10ml) come from the backend too.
  const price = typeof apiProduct.price === 'number'
    ? apiProduct.price
    : parseFloat(apiProduct.pricing?.price ?? apiProduct.price ?? 0) || 0;

  let variants = Array.isArray(apiProduct.variants) && apiProduct.variants.length > 0 ? apiProduct.variants : null;
  if (!variants) {
    const p10 = parseFloat(apiProduct.price_10ml ?? apiProduct.pricing?.price_10ml);
    const mainLabel = apiProduct.size_label || apiProduct.size || '100ml';
    variants = p10 > 0
      ? [
          { key: mainLabel, label: mainLabel, price },
          { key: '10ml', label: '10ml', price: p10 },
        ]
      : [{ key: mainLabel, label: mainLabel, price }];
  }

  const primaryImage = apiProduct.primary_image || (apiProduct.images && apiProduct.images[0]?.url) || '/images/formula-7.jpg';

  const pyr = apiProduct.notes_pyramid || null;
  const clean = (n) => String(n || '').replace(/Ahmed Al Maghribi\s*/gi, '').trim();
  const LV = ['top', 'heart', 'base', 'general'];
  // Rich note items (name, Arabic name, image) exactly as entered in the admin Fragrance Notes tab.
  const note_items = {};
  LV.forEach((k) => {
    note_items[k] = ((pyr && pyr[k]) || [])
      .map((n) => ({ name: clean(n.name), name_ar: n.name_ar ? String(n.name_ar).trim() : '', image: /^(https?:\/\/|\/)/i.test(n.image_url || '') ? n.image_url : '' }))
      .filter((n) => n.name);
  });
  const notesObj = pyr
    ? { top: [], heart: [], base: [], general: [] }
    : { ...(apiProduct.notes || { top: [], heart: [], base: [] }) };
  LV.forEach((k) => {
    notesObj[k] = pyr ? note_items[k].map((n) => n.name) : (notesObj[k] || []).map(clean).filter(Boolean);
  });
  const hasNotes = LV.some((k) => notesObj[k].length);

  const fams = Array.isArray(apiProduct.olfactory_families) ? apiProduct.olfactory_families.filter((f) => f && f.name) : [];
  const fragrance_family = fams.length
    ? {
        en: fams.map((f) => f.name).join(' · '),
        ar: fams.map((f) => f.name_ar || f.name).join(' · '),
      }
    : apiProduct.fragrance_family;

  return {
    ...apiProduct,
    fragrance_family,
    id: apiProduct.id,
    slug: apiProduct.slug,
    name: apiProduct.name,
    name_ar: apiProduct.name_ar,
    price,
    currency: apiProduct.currency || { code: 'AED', symbol: 'د.إ' },
    size: apiProduct.size_label || apiProduct.size || '50ml',
    category: apiProduct.category_slug || apiProduct.category?.slug || 'eau-de-parfum',
    collection: apiProduct.collection || 'signature',
    image: primaryImage,
    images: apiProduct.images || [{ url: primaryImage }],
    // Ordered list of uploaded image URLs (API already sorts: primary first, then admin-arranged order)
    gallery: Array.isArray(apiProduct.images) && apiProduct.images.length
      ? apiProduct.images.map((i) => i.url).filter(Boolean)
      : [primaryImage],
    no: String(apiProduct.id).padStart(2, '0'),
    // Luxury presentation tokens
    world: {
      bg: '#e9e4d3',
      fg: '#1b1a14',
      accent: '#7d7a3a',
    },
    line: {
      en: apiProduct.short_description || `${apiProduct.name} by Alaynaas Parfums`,
      ar: apiProduct.short_description_ar || apiProduct.name_ar || apiProduct.name,
    },
    impression: {
      en: apiProduct.short_description || apiProduct.name,
      ar: apiProduct.short_description_ar || apiProduct.name_ar,
    },
    story: {
      en: [apiProduct.short_description, ...paragraphs(apiProduct.description)].filter(Boolean),
      ar: [apiProduct.short_description_ar, ...paragraphs(apiProduct.description_ar)].filter(Boolean).length
        ? [apiProduct.short_description_ar, ...paragraphs(apiProduct.description_ar)].filter(Boolean)
        : undefined,
    },
    variants,
    notes: hasNotes ? notesObj : apiProduct.notes,
    note_items,
    video: specVideo(apiProduct),
    spectrum: apiProduct.spectrum || specSpectrum(apiProduct) || [
      [{ en: 'Fresh' }, { en: 'Warm' }, 45],
      [{ en: 'Bright' }, { en: 'Dark' }, 50],
      [{ en: 'Soft' }, { en: 'Bold' }, 65],
      [{ en: 'Airy' }, { en: 'Deep' }, 55],
    ],
    experience: apiProduct.experience || {
      opening: {
        en: notesObj.top?.length ? `${notesObj.top.join(', ')}. Vibrant, sparkling opening.` : (apiProduct.short_description || 'Bright and enticing arrival.'),
        ar: 'افتتاحية مشرقة ونابضة بالحياة.',
      },
      heart: {
        en: notesObj.heart?.length ? `${notesObj.heart.join(', ')}. Sophisticated and harmonious heart.` : 'Refined floral and spicy heart.',
        ar: 'قلب زهري راقٍ ومتناغم.',
      },
      drydown: {
        en: notesObj.base?.length ? `${notesObj.base.join(', ')}. Enduring sensual trail.` : 'Deep, warm, and enduring trail on the skin.',
        ar: 'قاعدة غنية وعميقة تدوم طويلاً.',
      },
    },
    wear: apiProduct.wear || specWear(apiProduct) || [
      { en: 'Evening & Signature Occasions', ar: 'المناسبات الخاصة والمساء' },
      { en: 'Special Gatherings', ar: 'اللقاءات الراقية' },
      { en: 'Year-Round Luxury', ar: 'فخامة تدوم طوال العام' },
    ],
    moods: ['arrival', 'signature'],
    in_stock: apiProduct.in_stock !== undefined ? apiProduct.in_stock : true,
    seo: apiProduct.seo || {
      title: `${apiProduct.name} | Alaynaas Luxury Perfumes`,
      description: apiProduct.short_description || '',
    },
  };
}

// Description HTML -> one string per paragraph (keeps the story's paragraph breaks on the page)
function paragraphs(html) {
  if (!html) return [];
  return String(html)
    .split(/<\/p>|<br\s*\/?>\s*<br\s*\/?>|\n\s*\n/i)
    .map((s) => s.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function readSpecs(p) {
  let s = p.specifications;
  if (typeof s === 'string') { try { s = JSON.parse(s); } catch { s = null; } }
  return s && typeof s === 'object' ? s : {};
}

function specSpectrum(p) {
  let c = readSpecs(p).character;
  if (typeof c === 'string') c = c.split(/[,;\s]+/).filter(Boolean);
  if (!Array.isArray(c) || c.length < 4) return null;
  const axes = [
    [{ en: 'Fresh', ar: 'منعش' }, { en: 'Warm', ar: 'دافئ' }],
    [{ en: 'Bright', ar: 'ساطع' }, { en: 'Dark', ar: 'داكن' }],
    [{ en: 'Soft', ar: 'ناعم' }, { en: 'Bold', ar: 'جريء' }],
    [{ en: 'Airy', ar: 'خفيف' }, { en: 'Deep', ar: 'عميق' }],
  ];
  return axes.map((a, i) => [a[0], a[1], Number(c[i]) || 50]);
}

function specWear(p) {
  let w = readSpecs(p).wear;
  if (typeof w === 'string') { try { const j = JSON.parse(w); if (Array.isArray(j)) w = j; } catch {} }
  if (typeof w === 'string') { const parts = w.split(/[;\n]+/).map((x) => x.trim()).filter(Boolean); w = parts.length === 1 && parts[0].includes(',') ? parts[0].split(',').map((x) => x.trim()).filter(Boolean) : parts; }
  if (!Array.isArray(w) || !w.length) return null;
  return w.map((x) => { const [en, ar] = String(x).split('|'); return { en: en.trim(), ar: (ar || en).trim() }; });
}

// Optional product film: spec keys video_url, video_poster, video_title, video_title_ar.
function specVideo(p) {
  const sp = readSpecs(p);
  const str = (v) => (typeof v === 'string' ? v.trim() : '');
  const url = str(sp.video_url);
  if (!/^(https?:\/\/|\/)/i.test(url)) return null;
  return { url, poster: str(sp.video_poster), title: { en: str(sp.video_title), ar: str(sp.video_title_ar) } };
}

/**
 * Get public store settings (logos, store details, shipping rules, tax)
 */
export async function getStoreSettings() {
  if (BASE) {
    try {
      return await http('/settings');
    } catch (err) {
      console.warn('[Storefront API] Falling back to default settings:', err.message);
    }
  }
  return {
    store_name: 'ALAYNAAS',
    store_tagline: 'For those who carry the crown',
    support_email: 'concierge@alaynaas.ae',
    support_phone: '+971 50 123 4567',
    whatsapp_number: '+971501234567',
    store_address: 'Al Wasl Road, Jumeirah 2, Dubai, United Arab Emirates',
    default_currency: 'AED',
    shipping_fee: 15,
    shipping_free_over: 200,
    delivery_days: '2 - 5',
    refund_days: 7,
    shipping_estimate_text: 'Delivered across the UAE in 2 - 5 working days, depending on location',
    tax_percentage: 5,
    tax_inclusive_pricing: true,
    frontend_logo: '/LOGO/Desktop.svg',
    frontend_logo_dark: '/LOGO/Desktop.svg',
    favicon: '/favicon.ico',
    maintenance_mode: false,
  };
}

/**
 * Get the header navigation tree managed in Admin → Catalog → Menu.
 * Returns [] on any problem so the header falls back to its built-in links.
 */
export async function getNavMenu() {
  if (BASE) {
    try {
      const data = await http('/menu');
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('[Storefront API] Menu unavailable, using default navigation:', err.message);
    }
  }
  return [];
}

/**
 * Get the active olfactory (fragrance) families managed in the admin, e.g. Floral, Woody.
 * Used by the homepage "Discover" panels. Returns [] on any problem.
 */
export async function getFragranceFamilies() {
  if (BASE) {
    try {
      const data = await http('/fragrance-metadata');
      return Array.isArray(data?.families) ? data.families : [];
    } catch (err) {
      console.warn('[Storefront API] Fragrance families unavailable:', err.message);
    }
  }
  return [];
}

/**
 * Get active GCC countries with currency symbols
 */
export async function getCountries() {
  if (BASE) {
    try {
      return await http('/countries');
    } catch {
      // Fallback
    }
  }
  return [
    { id: 1, name: 'United Arab Emirates', code: 'AE', currency_code: 'AED', currency_symbol: 'د.إ' },
    { id: 2, name: 'Saudi Arabia', code: 'SA', currency_code: 'SAR', currency_symbol: '⃁' },
    { id: 3, name: 'Kuwait', code: 'KW', currency_code: 'KWD', currency_symbol: 'د.ك' },
  ];
}

/**
 * Get categories tree
 */
export async function getCategories() {
  if (BASE) {
    try {
      const data = await http('/categories');
      if (Array.isArray(data) && data.length > 0) {
        return data.map((c) => {
          const mockMatch = mockCategories.find((mc) => mc.slug === c.slug) || {};
          const img = c.image || c.icon_image;
          const resolvedImg = img
            ? (img.startsWith('http') || img.startsWith('/') ? img : `/uploads/${img}`)
            : (mockMatch.image || '/images/formula-7.jpg');

          return {
            ...mockMatch,
            ...c,
            slug: c.slug,
            name: c.name,
            name_ar: c.name_ar,
            href: mockMatch.href || `/shop/${c.slug}`,
            image: resolvedImg,
            tag: mockMatch.tag || { en: c.name, ar: c.name_ar || c.name },
            menu: mockMatch.menu || { en: c.name, ar: c.name_ar || c.name },
            relation: mockMatch.relation || { en: 'Explore collection' },
            verb: mockMatch.verb || { en: 'Explore' },
            headline: mockMatch.headline || [c.name],
            intro: mockMatch.intro || [c.description || `Explore the ${c.name} collection from Alaynaas Parfums.`],
            cta: mockMatch.cta || `Explore ${c.name}`,
            world: mockMatch.world || { bg: '#15231b', fg: '#f6f2e9', accent: '#caa46a' },
          };
        });
      }
    } catch {
      // Fallback to mock categories
    }
  }
  return mockCategories;
}

/**
 * Get public products with filters & pagination
 */
export async function getProducts({ category, q, sort, featured, country = 'AE' } = {}) {
  if (BASE) {
    try {
      const queryParams = {
        category_slug: category,
        q,
        sort,
        is_featured: featured,
        country_code: country,
        limit: 50,
      };

      const qs = new URLSearchParams(
        Object.entries(queryParams).filter(([, v]) => v !== undefined && v !== null && v !== '')
      ).toString();

      const items = await http(`/products${qs ? `?${qs}` : ''}`);
      if (Array.isArray(items)) {
        return items.map(normalizeProduct);
      }
    } catch (err) {
      console.warn('[Storefront API] Falling back to mock products:', err.message);
    }
  }

  // Fallback to local mock data
  let list = [...mockProducts];
  if (category) list = list.filter((x) => x.category === category);
  if (featured) list = list.filter((x) => x.featured);
  if (q) {
    const s = q.toLowerCase();
    list = list.filter((x) => `${x.name} ${x.line?.en || ''}`.toLowerCase().includes(s));
  }
  if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
  return list;
}

/**
 * Get single product by slug
 */
export async function getProduct(slug, country = 'AE') {
  if (BASE && slug) {
    try {
      const data = await http(`/products/${slug}?country=${country}`);
      if (data) return normalizeProduct(data);
    } catch (err) {
      console.warn(`[Storefront API] Falling back to mock for product ${slug}:`, err.message);
    }
  }
  return mockProducts.find((x) => x.slug === slug) || null;
}

/**
 * Create order
 */
export async function createOrder(order) {
  if (BASE) {
    try {
      const created = await http('/orders', {
        method: 'POST',
        body: JSON.stringify(order),
      });

      if (typeof window !== 'undefined') {
        const all = JSON.parse(localStorage.getItem('aly_orders') || '[]');
        localStorage.setItem('aly_orders', JSON.stringify([created, ...all]));
      }
      return created;
    } catch (err) {
      console.error('[Storefront API] Failed to place order:', err.message);
      throw err;
    }
  }

  // Offline mock fallback
  await delay(500);
  const created = {
    ...order,
    id: `AM-AE-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-5)}`,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    const all = JSON.parse(localStorage.getItem('aly_orders') || '[]');
    localStorage.setItem('aly_orders', JSON.stringify([created, ...all]));
  }
  return created;
}

export async function getMyOrders() {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem('aly_orders') || '[]');
  }
  return [];
}

export async function login({ email, password }) {
  await delay(200);
  return { token: 'customer-token', user: { name: email.split('@')[0], email } };
}

export async function register({ name, email, password }) {
  await delay(200);
  return { token: 'customer-token', user: { name, email } };
}

/**
 * Footer newsletter sign-up (POST /newsletter). Throws on validation / rate-limit errors.
 */
export async function subscribeNewsletter(email, lang = 'en') {
  return http('/newsletter', { method: 'POST', body: JSON.stringify({ email, lang }) });
}

/**
 * Static pages managed in Admin > Storefront > Pages (shipping, refund, privacy, terms...).
 * getStorePage returns null when the page is missing/unpublished or the API is down.
 */
export async function getStorePages() {
  if (BASE) {
    try {
      const data = await http('/pages');
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('[Storefront API] Pages list unavailable:', err.message);
    }
  }
  return [];
}

export async function getStorePage(slug) {
  if (BASE) {
    try {
      return await http(`/pages/${encodeURIComponent(slug)}`);
    } catch (err) {
      console.warn(`[Storefront API] Page "${slug}" unavailable:`, err.message);
    }
  }
  return null;
}

/**
 * Product reviews. Only admin-approved reviews are returned; new submissions wait for moderation.
 */
export async function getProductReviews(slug) {
  const empty = { reviews: [], summary: { count: 0, average: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } } };
  if (!BASE) return empty;
  try {
    return await http(`/products/${encodeURIComponent(slug)}/reviews`, { cache: 'no-store' });
  } catch {
    return empty;
  }
}

export async function getFeaturedReviews(limit = 9) {
  const empty = { reviews: [], summary: { count: 0, average: 0 } };
  if (!BASE) return empty;
  try {
    return await http(`/reviews/featured?limit=${limit}`, { cache: 'no-store' });
  } catch {
    return empty;
  }
}

export async function submitContact(data) {
  return http('/contact', { method: 'POST', body: JSON.stringify(data) });
}

export async function submitProductReview(slug, review) {
  return http(`/products/${encodeURIComponent(slug)}/reviews`, { method: 'POST', body: JSON.stringify(review) });
}

/**
 * Journal articles (Admin > Storefront > Journal). Falls back to the built-in copy if the backend is unreachable.
 */
const staticJournal = () => staticJ.map((j, i) => ({
  slug: j.slug, title_en: j.title, excerpt_en: j.excerpt, content_en: j.body.join('\n\n'),
  category_en: 'The Journal', published_at: new Date(Date.now() - i * 864e5).toISOString(), is_featured: i === 0 ? 1 : 0,
  len: j.body.join(' ').length, cover_image: '/images/journal.jpg',
}));

export async function getJournal() {
  if (BASE) {
    try {
      const data = await http('/journal', { cache: 'no-store' });
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('[Storefront API] Journal unavailable:', err.message);
    }
  }
  return staticJournal();
}

export async function getJournalEntry(slug) {
  if (BASE) {
    try {
      return await http(`/journal/${encodeURIComponent(slug)}`, { cache: 'no-store' });
    } catch (err) {
      if (/404|not found/i.test(String(err.message))) return null;
      console.warn(`[Storefront API] Journal "${slug}" unavailable:`, err.message);
    }
  }
  return staticJournal().find((x) => x.slug === slug) || null;
}

/* ── Atelier: compose a personal perfume (rules engine on the API) ── */
export async function composeAtelier({ answers, label_name, lang }) {
  return http('/atelier', { method: 'POST', body: JSON.stringify({ answers, label_name, lang }) });
}

export async function getAtelierCreation(code) {
  if (!BASE || !/^AL-[A-Z0-9]{5}$/i.test(code || '')) return null;
  try {
    return await http(`/atelier/${encodeURIComponent(code.toUpperCase())}`, { next: { revalidate: 0 } });
  } catch {
    return null;
  }
}


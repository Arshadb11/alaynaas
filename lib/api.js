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
      throw new Error(detailedMsg);
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

  const price = typeof apiProduct.price === 'number'
    ? apiProduct.price
    : parseFloat(apiProduct.pricing?.price || apiProduct.price || 0);

  const primaryImage = apiProduct.primary_image || (apiProduct.images && apiProduct.images[0]?.url) || '/images/formula-7.jpg';

  const notesObj = apiProduct.notes_pyramid
    ? {
        top: apiProduct.notes_pyramid.top?.map((n) => n.name) || [],
        heart: apiProduct.notes_pyramid.heart?.map((n) => n.name) || [],
        base: apiProduct.notes_pyramid.base?.map((n) => n.name) || [],
      }
    : apiProduct.notes || { top: [], heart: [], base: [] };

  return {
    ...apiProduct,
    id: apiProduct.id,
    slug: apiProduct.slug,
    name: apiProduct.name,
    name_ar: apiProduct.name_ar,
    price,
    currency: apiProduct.currency || { code: 'AED', symbol: 'د.إ' },
    size: apiProduct.size_label || apiProduct.size || '50ml',
    category: apiProduct.category_slug || apiProduct.category?.slug || 'eau-de-parfum',
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
      en: apiProduct.short_description || 'Precious oriental craftsmanship.',
      ar: apiProduct.short_description_ar || 'حرفية شرقية فاخرة.',
    },
    mood: {
      en: apiProduct.specifications?.sillage ? `${apiProduct.specifications.sillage} · refined` : 'Luminous · expressive',
      ar: 'مشرق · معبّر',
    },
    impression: {
      en: apiProduct.short_description || apiProduct.name,
      ar: apiProduct.short_description_ar || apiProduct.name_ar,
    },
    story: {
      en: [
        apiProduct.short_description,
        apiProduct.description ? apiProduct.description.replace(/<[^>]*>/g, '') : '',
      ].filter(Boolean),
    },
    variants: [
      {
        key: apiProduct.size_label || '50ml',
        label: apiProduct.size_label || '50ml',
        price,
      },
    ],
    spectrum: apiProduct.spectrum || [
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
    wear: apiProduct.wear || [
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
    shipping_fee: 20,
    shipping_free_over: 300,
    shipping_estimate_text: 'Delivered across the UAE in 1–3 working days',
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
            ? (img.startsWith('http') || img.startsWith('/') ? img : `/${img}`)
            : (mockMatch.image || '/images/formula-7.jpg');

          return {
            ...mockMatch,
            ...c,
            slug: c.slug,
            name: c.name,
            name_ar: c.name_ar,
            href: mockMatch.href || `/fragrances/${c.slug}`,
            image: resolvedImg,
            tag: mockMatch.tag || { en: c.name, ar: c.name_ar || c.name },
            menu: mockMatch.menu || { en: c.name, ar: c.name_ar || c.name },
            relation: mockMatch.relation || { en: 'Explore collection' },
            verb: mockMatch.verb || { en: 'Explore' },
            headline: mockMatch.headline || [c.name],
            intro: mockMatch.intro || [c.description || 'Precious oriental fragrance collection.'],
            cta: mockMatch.cta || `Explore ${c.name}`,
            world: mockMatch.world || { bg: '#14100c', fg: '#eadfcf', accent: '#b9763a' },
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

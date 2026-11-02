'use client';
/**
 * Homepage sections in the minimal "editorial" style:
 *  - FamilyPanels : scroll-driven category panels (one panel slides over the next)
 *  - StorySplit   : image + story copy, two columns
 *  - Signature    : draggable carousel of tinted product cards
 * All data comes from the API (categories / products) so the admin panel drives it.
 */
import Link from '@/components/Link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useApp } from './Providers';
import { Reveal, Headline, Lines } from './Reveal';

const TXT = {
  en: {
    fKick: 'Discover',
    fH: 'The Alaynaas families',
    fSub: 'Every fragrance belongs to a family. Start with the one you already love, and find the bottle that wears it best.',
    scroll: 'Scroll to open the next family',
    now: 'Discover now',
    nowIn: 'Discover now —',
    more: 'Show more',
    sKick: 'The library',
    sH: 'Signature compositions',
    from: 'From',
    story: 'Our story',
    soon: 'New fragrances arriving soon',
  },
  ar: {
    fKick: 'اكتشف',
    fH: 'عائلات العطور',
    fSub: 'لكل عطر عائلة. ابدأ بالعائلة التي تحبها، واعثر على العطر الذي يليق بك.',
    scroll: 'مرر لفتح العائلة التالية',
    now: 'اكتشف الآن',
    nowIn: 'اكتشف الآن —',
    more: 'عرض المزيد',
    sKick: 'المكتبة',
    sH: 'تركيبات مميزة',
    from: 'من',
    story: 'قصتنا',
    soon: 'عطور جديدة قريباً',
  },
};

const fromPrice = (p) => (p.variants ? Math.min(...p.variants.map((v) => v.price)) : p.price);
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
/** Category descriptions come from a rich-text editor: reduce to a short plain-text blurb (no tags/entities). */
const plain = (html, max = 110) => {
  const s = String(html || '')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&lt;|&gt;/gi, ' ')
    .replace(/\s+/g, ' ').trim();
  return s.length > max ? `${s.slice(0, max).replace(/\s+\S*$/, '')}…` : s;
};
/** Soft pastel tint behind a product, derived from its accent colour. */
const tint = (p) => `color-mix(in srgb, ${p?.world?.accent || '#a8864f'} 16%, #ffffff)`;

/** Ingredient photography behind each family panel, chosen from the family slug (see /public/images/families). */
const FAMILY_BG = [
  [/floral|rose|jasmine|flower/, 'floral'],
  [/gourmand|vanilla|sweet|caramel|chocolate/, 'gourmand'],
  [/fresh|citrus|aquatic|marine|fruity|fougere|aromatic|green/, 'fresh'],
  [/wood|chypre|leather|birch|smok|musk/, 'woody'],
  [/orient|amber|oud|spic|incense|resin/, 'oriental'],
];
const ROTATE = ['oriental', 'woody', 'floral', 'fresh', 'gourmand'];
const familyBg = (slug = '', i = 0) => {
  const hit = FAMILY_BG.find(([re]) => re.test(String(slug).toLowerCase()));
  return `/images/families/${hit ? hit[1] : ROTATE[i % ROTATE.length]}.jpg`;
};

/** Main families first (Floral, Oriental, Woody, Fresh, Gourmand); the rest keep their admin order after them. */
const MAIN = ['floral', 'oriental-amber', 'woody', 'fresh-citrus', 'gourmand'];
const rank = (slug) => { const i = MAIN.indexOf(slug); return i === -1 ? 99 : i; };

/* ───────────── Fragrance Families Product Slider (Sales-friendly with Tabs) ───────────── */
const DEFAULT_FAMILIES = [
  { slug: 'all', name: 'All Fragrances', name_ar: 'جميع العطور', blurb: 'Explore the full Crown collection of concentrated Eaux de Parfum.', blurb_ar: 'استكشف مجموعة كراون الكاملة من العطور المركزة الفاخرة.' },
  { slug: 'woody', name: 'Woody', name_ar: 'عطور خشبية', blurb: 'Structured with cedar, deep oud, leather and dry vetiver.', blurb_ar: 'توليفات غنية بخشب الأرز والعود الفاخر والجلود والنجيل العطري.' },
  { slug: 'oriental-amber', name: 'Oriental & Amber', name_ar: 'شرقية وعنبرية', blurb: 'Warm resins, rare amber and lingering sensual depths.', blurb_ar: 'عنبر دافئ وراتنجات نادرة وأثر حسي فاخر يدوم طويلاً.' },
  { slug: 'floral', name: 'Floral', name_ar: 'عطور زهورية', blurb: 'Iris, night jasmine and airy petals crafted with modern elegance.', blurb_ar: 'السوسن والياسمين وبتلات رقيقة صيغت بأناقة معاصرة.' },
  { slug: 'fresh-citrus', name: 'Fresh & Citrus', name_ar: 'حمضية منعشة', blurb: 'Sparkling citrus, Italian bergamot and radiant botanicals.', blurb_ar: 'حمضيات نابضة، برغموت إيطالي، ونفحات نباتية مشرقة.' },
];

const isPerfume = (p) => {
  const cat = String(p.category || p.category_slug || '').toLowerCase();
  const type = String(p.type || '').toLowerCase();
  const name = String(p.name || '').toLowerCase();
  return (
    cat === 'eau-de-parfum' ||
    cat === 'perfumes' ||
    cat === 'fragrance' ||
    cat === 'fragrances' ||
    type.includes('parfum') ||
    type.includes('perfume') ||
    p.collection === 'crown' ||
    ['formula 7', 'ember noir', 'after dark', 'lost summer'].some((n) => name.includes(n))
  );
};

const CROWN_PERFUMES = [
  { id: 1, slug: 'formula-7', no: '01', name: 'Formula 7', image: '/images/formula-7.jpg', family_slugs: 'fresh-citrus,floral', fragrance_family: 'Fresh & Floral', price: 450, variants: [{ key: '100ml', label: '100ml', price: 450 }, { key: '10ml', label: '10ml', price: 95 }], line: { en: 'Vibrant freshness to lasting attraction.', ar: 'انتعاش نابض يتحول إلى جاذبية تبقى.' }, collection: 'crown', category: 'eau-de-parfum' },
  { id: 2, slug: 'ember-noir', no: '02', name: 'Ember Noir', image: '/images/ember-noir.jpg', family_slugs: 'woody,oriental-amber', fragrance_family: 'Woody & Oriental', price: 490, variants: [{ key: '100ml', label: '100ml', price: 490 }, { key: '10ml', label: '10ml', price: 105 }], line: { en: 'Not everyone leaves an impression. Ember Noir does.', ar: 'ليس كل أحد يترك أثراً. إمبر نوار يفعل.' }, collection: 'crown', category: 'eau-de-parfum' },
  { id: 3, slug: 'after-dark', no: '03', name: 'After Dark', image: '/images/after-dark.jpg', family_slugs: 'oriental-amber,woody', fragrance_family: 'Oriental & Woody', price: 470, variants: [{ key: '100ml', label: '100ml', price: 470 }, { key: '10ml', label: '10ml', price: 100 }], line: { en: 'Some moments are worth staying for.', ar: 'بعض اللحظات تستحق أن تبقى لأجلها.' }, collection: 'crown', category: 'eau-de-parfum' },
  { id: 4, slug: 'lost-summer', no: '04', name: 'Lost Summer', image: '/images/lost-summer.jpg', family_slugs: 'floral,fresh-citrus', fragrance_family: 'Floral & Airy', price: 460, variants: [{ key: '100ml', label: '100ml', price: 460 }, { key: '10ml', label: '10ml', price: 100 }], line: { en: 'Some summers end. Some stay on your skin.', ar: 'بعض الصيفيات تنتهي. وبعضها يبقى على بشرتك.' }, collection: 'crown', category: 'eau-de-parfum' },
];

const matchesFamily = (p, slug) => {
  if (!slug || slug === 'all') return true;
  const s = String(p.family_slugs || '').split(',').map((x) => x.trim().toLowerCase());
  if (s.includes(slug.toLowerCase())) return true;

  // Specific perfume mappings for Crown collection
  const normName = String(p.name || '').toLowerCase();
  if (normName.includes('ember noir')) return slug === 'woody' || slug === 'oriental-amber';
  if (normName.includes('after dark')) return slug === 'woody' || slug === 'oriental-amber';
  if (normName.includes('formula 7') || normName.includes('formula7')) return slug === 'fresh-citrus' || slug === 'floral';
  if (normName.includes('lost summer')) return slug === 'fresh-citrus' || slug === 'floral';

  const txt = `${p.name} ${p.category} ${p.fragrance_family || ''} ${p.mood?.en || ''} ${JSON.stringify(p.notes || '')}`.toLowerCase();
  if (slug === 'woody' && /wood|oud|cedar|vetiver|leather|musk/.test(txt)) return true;
  if (slug === 'oriental-amber' && /amber|oriental|resin|spice|oud|warm/.test(txt)) return true;
  if (slug === 'floral' && /floral|flower|rose|jasmine|iris|hyacinth/.test(txt)) return true;
  if (slug === 'fresh-citrus' && /fresh|citrus|bergamot|pineapple|pink pepper|airy/.test(txt)) return true;
  return false;
};

export function FamilyPanels({ categories = [], families = [], products = [] }) {
  const { lang, L, money, addItem } = useApp();
  const tx = TXT[lang] || TXT.en;
  const isAr = lang === 'ar';

  const trackRef = useRef(null);
  const dragRef = useRef({ down: false, x: 0, left: 0, moved: false });
  const [activeTab, setActiveTab] = useState('all');

  // Strictly perfume products only (clean slug deduplication so Formula 7, Ember Noir, After Dark, Lost Summer are unique)
  const cleanSlug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const perfumeProducts = (() => {
    const list = (products.length ? products : []).filter(isPerfume);
    const existingSlugs = new Set(list.map((p) => cleanSlug(p.slug || p.name)));
    const missing = CROWN_PERFUMES.filter((cp) => !existingSlugs.has(cleanSlug(cp.slug || cp.name)));
    return [...list, ...missing];
  })();

  // Tab list: combine dynamic API families and curated olfactory families.
  // Sales-friendly & clean: only show tabs that actually contain perfume products!
  const allCandidateTabs = (() => {
    const map = new Map();
    DEFAULT_FAMILIES.forEach((f) => map.set(f.slug, f));
    if (families && families.length > 0) {
      families.forEach((f) => {
        if (!map.has(f.slug)) {
          map.set(f.slug, {
            slug: f.slug,
            name: f.name,
            name_ar: f.name_ar || f.name,
            blurb: f.description || '',
            blurb_ar: f.description_ar || f.description || '',
          });
        }
      });
    }
    return Array.from(map.values());
  })();

  // Keep 'all' plus only families that match at least 1 perfume
  const tabs = allCandidateTabs.filter((tab) => {
    if (tab.slug === 'all') return true;
    return perfumeProducts.some((p) => matchesFamily(p, tab.slug));
  });

  const activeFamily = tabs.find((t) => t.slug === activeTab) || tabs[0];
  const activeBlurb = isAr ? (activeFamily?.blurb_ar || activeFamily?.blurb) : (activeFamily?.blurb || activeFamily?.blurb_ar);

  // Filtered perfumes for the selected tab
  const displayedPerfumes = perfumeProducts.filter((p) => matchesFamily(p, activeTab));

  const scrollByDir = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector('.fps-card');
    const step = (card?.offsetWidth || 340) + 24;
    const mult = (isAr ? -1 : 1) * dir;
    el.scrollBy({ left: mult * step, behavior: 'smooth' });
  };

  const handleTabSelect = (slug) => {
    setActiveTab(slug);
    if (trackRef.current) {
      trackRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  // Drag-to-scroll support for desktop mouse users
  const onPointerDown = (e) => {
    const el = trackRef.current;
    if (!el) return;
    dragRef.current = { down: true, x: e.clientX, left: el.scrollLeft, moved: false };
  };
  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d.down) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 5) d.moved = true;
    if (trackRef.current) {
      trackRef.current.scrollLeft = d.left - dx;
    }
  };
  const onPointerUp = () => {
    dragRef.current.down = false;
  };
  const onClickCapture = (e) => {
    if (dragRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current.moved = false;
    }
  };

  if (!perfumeProducts.length) return null;

  return (
    <section className="fps-section" aria-label={tx.fH}>
      <div className="wrap fps-head">
        <div className="fps-intro">
          <Reveal><p className="label fps-kicker">{tx.fKick}</p></Reveal>
          <Headline className="h-xl fps-title" lines={[tx.fH]} />
          <Reveal><p className="fps-sub">{tx.fSub}</p></Reveal>
        </div>

        {/* Navigation Arrows for the slider */}
        <div className="fps-nav">
          <button
            type="button"
            className="fps-nav-btn"
            onClick={() => scrollByDir(-1)}
            aria-label={isAr ? 'التالي' : 'Previous'}
          >
            <span aria-hidden="true">{isAr ? '→' : '←'}</span>
          </button>
          <button
            type="button"
            className="fps-nav-btn"
            onClick={() => scrollByDir(1)}
            aria-label={isAr ? 'السابق' : 'Next'}
          >
            <span aria-hidden="true">{isAr ? '←' : '→'}</span>
          </button>
        </div>
      </div>

      {/* Fragrance Family Filter Tabs */}
      <div className="wrap fps-tabs-wrap">
        <div className="fps-tabs" role="tablist" aria-label="Fragrance families">
          {tabs.map((tab) => {
            const count = tab.slug === 'all'
              ? perfumeProducts.length
              : perfumeProducts.filter((p) => matchesFamily(p, tab.slug)).length;
            const tabName = isAr ? (tab.name_ar || tab.name) : tab.name;
            const isActive = activeTab === tab.slug;
            return (
              <button
                key={tab.slug}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`fps-tab ${isActive ? 'active' : ''}`}
                onClick={() => handleTabSelect(tab.slug)}
              >
                <span>{tabName}</span>
                {count > 0 && <span className="fps-tab-count">{count}</span>}
              </button>
            );
          })}
        </div>

        {activeBlurb && (
          <p className="fps-blurb" key={activeTab}>
            {activeBlurb}
          </p>
        )}
      </div>

      {/* Products Carousel Slider */}
      <div className="fps-slider-shell">
        <div
          className="fps-track"
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onClickCapture={onClickCapture}
        >
          {displayedPerfumes.length === 0 ? (
            <div className="fps-empty">
              <p>{tx.soon}</p>
            </div>
          ) : (
            displayedPerfumes.map((p) => (
              <PerfumeSliderCard
                key={p.id}
                product={p}
                isAr={isAr}
                L={L}
                money={money}
                addItem={addItem}
                fromText={tx.from}
                addText={isAr ? 'أضف إلى السلة' : 'Add to Cart'}
                addedText={isAr ? 'تمت الإضافة ✓' : 'Added ✓'}
                exploreText={isAr ? 'تفاصيل العطر' : 'Explore Scent'}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

/* ───────────── Individual Perfume Card (Sales-Friendly with Size Toggles & Direct Buy) ───────────── */
function PerfumeSliderCard({ product, isAr, L, money, addItem, fromText, addText, addedText, exploreText }) {
  const variants = product.variants && product.variants.length > 0
    ? product.variants
    : [{ key: '100ml', label: '100ml', price: product.price }];

  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const [justAdded, setJustAdded] = useState(false);

  const price = selectedVariant ? selectedVariant.price : product.price;
  const name = isAr && product.name_ar ? product.name_ar : product.name;
  const line = L(product.line || '');
  const familyLabel = isAr && product.fragrance_family_ar
    ? product.fragrance_family_ar
    : (product.fragrance_family || (product.notes?.top ? product.notes.top.slice(0, 2).join(' · ') : 'Eau de Parfum'));

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1, selectedVariant);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <article className="fps-card">
      <div className="fps-card-inner">
        {/* Top Badging */}
        <div className="fps-badge-row">
          <span className="fps-badge">
            {product.collection === 'crown' ? (isAr ? 'مجموعة كراون' : 'Crown Collection') : 'Eau de Parfum'}
          </span>
          {variants.length > 1 && (
            <span className="fps-sizes-badge">
              {isAr ? '١٠٠ مل و ١٠ مل' : '100ml & 10ml'}
            </span>
          )}
        </div>

        {/* Product Image Stage */}
        <Link href={`/fragrance/${product.slug}`} className="fps-img-link" draggable={false}>
          <div className="fps-img-wrap">
            {product.image && (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 78vw, (max-width: 1024px) 42vw, 24vw"
                draggable={false}
                className="fps-bottle-img"
              />
            )}
          </div>
        </Link>

        {/* Content & Purchasing Details */}
        <div className="fps-info">
          <p className="fps-family-tag">{familyLabel}</p>

          <h3 className="fps-card-title">
            <Link href={`/fragrance/${product.slug}`}>{name}</Link>
          </h3>

          {line && <p className="fps-card-line">{line}</p>}

          {/* Size Variant Selector */}
          {variants.length > 1 && (
            <div className="fps-variants-row" role="group" aria-label="Select size variant">
              {variants.map((v) => {
                const isActive = selectedVariant?.key === v.key;
                return (
                  <button
                    key={v.key}
                    type="button"
                    className={`fps-var-pill ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedVariant(v)}
                  >
                    <span className="fps-var-label">{v.label}</span>
                    <span className="fps-var-sep">·</span>
                    <span className="fps-var-price">{money(v.price)}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Pricing & Direct Add to Cart CTA */}
          <div className="fps-action-row">
            <div className="fps-price-block">
              <span className="fps-price-val">{money(price)}</span>
              {variants.length > 1 && !selectedVariant && (
                <span className="fps-price-hint">{fromText}</span>
              )}
            </div>

            <button
              type="button"
              className={`fps-add-btn ${justAdded ? 'added' : ''}`}
              onClick={handleAddToCart}
              aria-label={`${addText} - ${name}`}
            >
              <span className="fps-add-icon">{justAdded ? '✓' : '+'}</span>
              <span>{justAdded ? addedText : addText}</span>
            </button>
          </div>

          {/* Discrete Explore Scent Link */}
          <div className="fps-foot-link">
            <Link href={`/fragrance/${product.slug}`} className="fps-detail-link">
              <span>{exploreText}</span>
              <span aria-hidden="true" className="fps-arrow">{isAr ? '←' : '→'}</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ───────────── Story split (image + copy) ───────────── */
export function StorySplit() {
  const { t, lang } = useApp();
  const tx = TXT[lang] || TXT.en;
  return (
    <section className="ss">
      <div className="ss-media">
        <Image src="/images/notebook.jpg" alt="" fill sizes="(max-width:900px) 100vw, 50vw" />
      </div>
      <div className="ss-copy">
        <Reveal><p className="label">{tx.story}</p></Reveal>
        <Headline className="h-xl" lines={t.why.h} />
        <Lines className="copy" lines={t.why.lines} />
        <Reveal><Link href="/story" className="label ss-link">{t.why.cta}</Link></Reveal>
      </div>
    </section>
  );
}

/* ───────────── Signature compositions (draggable carousel) ───────────── */
export function Signature({ products = [] }) {
  const { lang, L, money } = useApp();
  const tx = TXT[lang] || TXT.en;
  const track = useRef(null);
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });

  const list = products.slice(0, 14);
  if (!list.length) return null;

  const onDown = (e) => {
    const el = track.current;
    drag.current = { down: true, x: e.clientX, left: el.scrollLeft, moved: false };
  };
  const onMove = (e) => {
    const d = drag.current;
    if (!d.down) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 4) d.moved = true;
    track.current.scrollLeft = d.left - dx;
  };
  const onUp = () => { drag.current.down = false; };
  // Swallow the click that ends a drag so it doesn't navigate
  const onClickCapture = (e) => { if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); drag.current.moved = false; } };

  return (
    <section className="sg" id="shop">
      <div className="wrap">
        <Reveal><p className="label">{tx.sKick}</p></Reveal>
        <Headline className="h-xl" lines={[tx.sH]} />
      </div>
      <div
        className="sg-track"
        ref={track}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        onClickCapture={onClickCapture}
      >
        {list.map((p) => (
          <article className="sg-card" key={p.id}>
            <Link href={`/fragrance/${p.slug}`} draggable={false}>
              <span className="sg-img" style={{ background: tint(p) }}>
                {p.image && <Image src={p.image} alt={p.name} fill sizes="(max-width:900px) 46vw, 20vw" draggable={false} />}
              </span>
              {p.mood && <span className="label sg-mood" style={{ color: p.world?.accent }}>{L(p.mood)}</span>}
              <span className="sg-name">{lang === 'ar' && p.name_ar ? p.name_ar : p.name}</span>
              <span className="sg-line">{L(p.line || '')}</span>
              <span className="label sg-price">{p.variants ? `${tx.from} ` : ''}{money(fromPrice(p))}</span>
              <span className="label sg-go">{tx.now}</span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { productAlt } from '@/lib/alt';
import Link from '@/components/Link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from './Providers';
import { Icon } from './Chrome';

/* ─────────────────────────────────────────────────────────────
   Aroma / Olfactory Families Master List
   ───────────────────────────────────────────────────────────── */
const MASTER_AROMAS = [
  { slug: 'all', en: 'All', ar: 'الكل' },
  { slug: 'woody', en: 'Woody', ar: 'خشبي' },
  { slug: 'oriental-amber', en: 'Oriental & Amber', ar: 'شرقي وعنبري' },
  { slug: 'fresh', en: 'Fresh', ar: 'منعش' },
  { slug: 'floral', en: 'Floral', ar: 'زهري' },
  { slug: 'gourmand', en: 'Gourmand', ar: 'حلواني' },
  { slug: 'spicy', en: 'Spicy', ar: 'توابلي' },
];

/* ─────────────────────────────────────────────────────────────
   Categories / Mediums
   ───────────────────────────────────────────────────────────── */
const MASTER_CATEGORIES = [
  { slug: 'all', en: 'All', ar: 'الكل' },
  { slug: 'eau-de-parfum', en: 'Perfumes', ar: 'عطور' },
  { slug: 'concentrated-oils', en: 'Pure Oils', ar: 'زيوت مركزة' },
  { slug: 'bakhoor', en: 'Bakhoor', ar: 'بخور' },
  { slug: 'oud-maattar', en: 'Oud Ma’attar', ar: 'معطرات العود' },
  { slug: 'sets', en: 'Discovery & Travel', ar: 'مجموعات' },
  { slug: 'exclusive-creations', en: 'Exclusive Creations', ar: 'إبداعات حصرية' },
];

/* ─────────────────────────────────────────────────────────────
   Genders
   ───────────────────────────────────────────────────────────── */
const MASTER_GENDERS = [
  { slug: 'all', en: 'All', ar: 'الكل' },
  { slug: 'unisex', en: 'Unisex', ar: 'للجنسين' },
  { slug: 'men', en: 'For him', ar: 'رجالي' },
  { slug: 'women', en: 'For her', ar: 'نسائي' },
];

/* ─────────────────────────────────────────────────────────────
   Sizes
   ───────────────────────────────────────────────────────────── */
const MASTER_SIZES = [
  { slug: 'all', en: 'All', ar: 'الكل' },
  { slug: '100ml', en: '100ml', ar: '١٠٠ مل' },
  { slug: '50ml', en: '50ml', ar: '٥٠ مل' },
  { slug: '10ml', en: '10ml', ar: '١٠ مل' },
  { slug: '6ml', en: '6ml', ar: '٦ مل' },
  { slug: '12ml', en: '12ml', ar: '١٢ مل' },
];

const fromPrice = (p) => {
  if (Array.isArray(p.variants) && p.variants.length > 0) {
    const prices = p.variants.map((v) => Number(v.price)).filter((n) => !isNaN(n) && n > 0);
    if (prices.length > 0) return Math.min(...prices);
  }
  return Number(p.price) || 0;
};

/* ─────────────────────────────────────────────────────────────
   Individual Product Card (Dual-Image Hover Flip + Quick Variant)
   ───────────────────────────────────────────────────────────── */
export function ShopProductCard({ product }) {
  const { lang, money, addItem } = useApp();
  const isAr = lang === 'ar';

  const variants = Array.isArray(product.variants) && product.variants.length > 0 ? product.variants : null;
  const [selectedVariant, setSelectedVariant] = useState(variants ? variants[0] : null);

  // Dual Image URLs for interactive hover flip
  const primaryImg =
    product.primary_image ||
    (product.images && product.images[0]?.url) ||
    product.image ||
    '/images/story.jpg';

  const secondaryImg =
    product.secondary_image ||
    (product.images && product.images[1]?.url) ||
    (product.gallery && product.gallery[1]) ||
    null;

  const currentPrice = selectedVariant ? Number(selectedVariant.price) : Number(product.price || fromPrice(product));
  const hasVariants = variants && variants.length > 1;
  // Backend size (e.g. 100ml, 5x5ml Set, 10 Tabs) — shown as a single pill when no 10ml option exists
  const baseSize = product.size_label || product.size || '';

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1, selectedVariant || variants?.[0]);
  };

  const familyLabel = product.fragrance_family || (isAr ? product.name_ar : product.category_name) || '';

  return (
    <div className="sh-card group">
      <Link href={`/fragrance/${product.slug}`} className="sh-card-link" aria-label={product.name}>
        {/* Media Frame with Dual Image Flip */}
        <div className="sh-media">
          <Image
            src={primaryImg}
            alt={productAlt(product, lang) || 'Alaynaas Perfume'}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`sh-img-primary ${secondaryImg ? 'group-hover:opacity-0' : 'group-hover:scale-[1.05]'}`}
            loading="lazy"
          />
          {secondaryImg && (
            <Image
              src={secondaryImg}
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="sh-img-secondary"
              loading="lazy"
            />
          )}

          {/* Badges */}
          <div className="sh-badges">
            {Boolean(product.is_limited_edition) && (
              <span className="sh-badge-pill sh-badge-gold">
                {isAr ? 'إصدار محدود' : 'Limited Edition'}
              </span>
            )}
            {product.in_stock === false && (
              <span className="sh-badge-pill sh-badge-muted">
                {isAr ? 'نفد' : 'Sold Out'}
              </span>
            )}
          </div>
        </div>

        {/* Product Details Bar */}
        <div className="sh-details">
          <div className="sh-info">
            <h3 className="sh-name truncate">
              {isAr && product.name_ar ? product.name_ar : product.name}
            </h3>
            {familyLabel && <p className="sh-family">{familyLabel}</p>}
          </div>

          <div className="sh-price-wrap">
            <span className="sh-price">
              {money(currentPrice)}
            </span>
          </div>
        </div>
      </Link>

      {/* Quick Add Bar & Size Pills */}
      <div className="sh-actions">
        {hasVariants ? (
          <div className="sh-variant-pills" role="group" aria-label="Select size">
            {variants.map((v) => {
              const active = selectedVariant?.key === v.key;
              return (
                <button
                  key={v.key}
                  type="button"
                  className={`sh-v-btn ${active ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedVariant(v);
                  }}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        ) : (
          baseSize && (
            <div className="sh-variant-pills" role="group" aria-label="Size">
              <span className="sh-v-btn active">{baseSize}</span>
            </div>
          )
        )}

        <button
          type="button"
          className="sh-add-btn"
          onClick={handleQuickAdd}
          disabled={product.in_stock === false}
        >
          {product.in_stock === false
            ? isAr ? 'غير متوفر' : 'Out of stock'
            : isAr ? 'أضف للسلة' : 'Add to cart'}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Full Shop Catalog View (Refined UX: Slim Sticky Bar + Expandable Drawer)
   ───────────────────────────────────────────────────────────── */
export function ShopCatalogView({
  initialProducts = [],
  categories = [],
  families = [],
  initialCategory = 'all',
  initialFamily = 'all',
  initialQuery = '',
}) {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  // Dynamic filter state
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedAroma, setSelectedAroma] = useState(initialFamily);
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState('featured');

  // Expanded panel state
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Track window scroll to adapt sticky bar height
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 90);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync with initial props
  useEffect(() => {
    if (initialCategory && initialCategory !== 'all') setSelectedCategory(initialCategory);
    if (initialFamily && initialFamily !== 'all') setSelectedAroma(initialFamily);
    if (initialQuery) setSearchQuery(initialQuery);
  }, [initialCategory, initialFamily, initialQuery]);

  // Combine dynamic aromas from API with master list
  const availableAromas = useMemo(() => {
    if (!families || families.length === 0) return MASTER_AROMAS;
    const map = new Map();
    MASTER_AROMAS.forEach((a) => map.set(a.slug, a));
    families.forEach((f) => {
      if (!map.has(f.slug)) {
        map.set(f.slug, { slug: f.slug, en: f.name, ar: f.name_ar || f.name });
      }
    });
    return Array.from(map.values());
  }, [families]);

  // Combine dynamic categories with master list
  const availableCategories = useMemo(() => {
    if (!categories || categories.length === 0) return MASTER_CATEGORIES;
    const map = new Map();
    MASTER_CATEGORIES.forEach((c) => map.set(c.slug, c));
    categories.forEach((c) => {
      if (!map.has(c.slug)) {
        map.set(c.slug, { slug: c.slug, en: c.name, ar: c.name_ar || c.name });
      }
    });
    return Array.from(map.values());
  }, [categories]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let list = [...initialProducts];

    // 1. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        const name = (p.name || '').toLowerCase();
        const nameAr = (p.name_ar || '').toLowerCase();
        const desc = (p.short_description || p.description || '').toLowerCase();
        const family = (p.fragrance_family || p.family_slugs || '').toLowerCase();
        return name.includes(q) || nameAr.includes(q) || desc.includes(q) || family.includes(q);
      });
    }

    // 2. Category filter
    if (selectedCategory !== 'all') {
      list = list.filter((p) => {
        if (selectedCategory === 'exclusive-creations') {
          return p.category === 'exclusive-creations' || Boolean(p.is_limited_edition);
        }
        const pCat = p.category_slug || p.category;
        return pCat === selectedCategory;
      });
    }

    // 3. Aroma (Olfactory family) filter
    if (selectedAroma !== 'all') {
      list = list.filter((p) => {
        const slugs = String(p.family_slugs || '').toLowerCase();
        const fam = String(p.fragrance_family || '').toLowerCase();
        return slugs.includes(selectedAroma.toLowerCase()) || fam.includes(selectedAroma.toLowerCase());
      });
    }

    // 4. Gender filter
    if (selectedGender !== 'all') {
      list = list.filter((p) => {
        const g = String(p.gender || '').toLowerCase();
        if (selectedGender === 'men') return g.includes('men') && !g.includes('women');
        if (selectedGender === 'women') return g.includes('women');
        if (selectedGender === 'unisex') return g.includes('unisex') || !g;
        return true;
      });
    }

    // 5. Size filter
    if (selectedSize !== 'all') {
      list = list.filter((p) => {
        const s = String(p.size_label || p.size || '').toLowerCase();
        const matchSize = s.includes(selectedSize.toLowerCase());
        const matchVariants =
          Array.isArray(p.variants) &&
          p.variants.some((v) => String(v.key || v.label).toLowerCase().includes(selectedSize.toLowerCase()));
        return matchSize || matchVariants;
      });
    }

    // 6. Sorting
    if (sortBy === 'price-asc') {
      list.sort((a, b) => fromPrice(a) - fromPrice(b));
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => fromPrice(b) - fromPrice(a));
    } else if (sortBy === 'name-asc') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'featured') {
      list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }

    return list;
  }, [initialProducts, searchQuery, selectedCategory, selectedAroma, selectedGender, selectedSize, sortBy]);

  // Active secondary filters count (Aroma, Gender, Size)
  const secondaryFiltersCount =
    (selectedAroma !== 'all' ? 1 : 0) +
    (selectedGender !== 'all' ? 1 : 0) +
    (selectedSize !== 'all' ? 1 : 0) +
    (searchQuery.trim().length > 0 ? 1 : 0);

  const hasActiveFilters = selectedCategory !== 'all' || secondaryFiltersCount > 0;

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedAroma('all');
    setSelectedGender('all');
    setSelectedSize('all');
    setSearchQuery('');
  };

  return (
    <div className="sh-page">
      {/* ── 1. Page Header ── */}
      <section className="sh-head-sec">
        <div className="sh-container">
          <p className="label sh-kicker">{isAr ? 'الكتالوج الكامل' : 'The full catalogue'}</p>
          <div className="sh-title-row">
            <h1 className="sh-page-title">{isAr ? 'المتجر' : 'Shop'}</h1>
            <p className="label sh-count">
              {filteredProducts.length} {isAr ? 'قطعة' : filteredProducts.length === 1 ? 'piece' : 'pieces'}
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. Filter Bar (Direct Multi-Tier Rectangular Rows) ── */}
      <section className={`sh-filter-bar ${isScrolled ? 'is-scrolled' : ''}`}>
        <div className="sh-container sh-filter-inner">
          {/* Category Row */}
          <div className="sh-filter-row">
            <p className="sh-row-label">{isAr ? 'الفئة' : 'Category'}</p>
            <div className="sh-btn-group">
              {availableCategories.map((c) => {
                const active = selectedCategory === c.slug;
                return (
                  <button
                    key={c.slug}
                    type="button"
                    className={`sh-btn ${active ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(c.slug)}
                  >
                    {isAr ? c.ar : c.en}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aroma (Olfactory Family) Row */}
          <div className="sh-filter-row">
            <p className="sh-row-label">{isAr ? 'العائلة العطرية' : 'Aroma'}</p>
            <div className="sh-btn-group">
              {availableAromas.map((a) => {
                const active = selectedAroma === a.slug;
                return (
                  <button
                    key={a.slug}
                    type="button"
                    className={`sh-btn ${active ? 'active' : ''}`}
                    onClick={() => setSelectedAroma(a.slug)}
                  >
                    {isAr ? a.ar : a.en}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gender Row */}
          <div className="sh-filter-row">
            <p className="sh-row-label">{isAr ? 'الجنس' : 'Gender'}</p>
            <div className="sh-btn-group">
              {MASTER_GENDERS.map((g) => {
                const active = selectedGender === g.slug;
                return (
                  <button
                    key={g.slug}
                    type="button"
                    className={`sh-btn ${active ? 'active' : ''}`}
                    onClick={() => setSelectedGender(g.slug)}
                  >
                    {isAr ? g.ar : g.en}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Row + Sort & Reset Tools */}
          <div className="sh-filter-row sh-row-with-tools">
            <p className="sh-row-label">{isAr ? 'الحجم' : 'Size'}</p>
            <div className="sh-row-content">
              <div className="sh-btn-group">
                {MASTER_SIZES.map((s) => {
                  const active = selectedSize === s.slug;
                  return (
                    <button
                      key={s.slug}
                      type="button"
                      className={`sh-btn ${active ? 'active' : ''}`}
                      onClick={() => setSelectedSize(s.slug)}
                    >
                      {isAr ? s.ar : s.en}
                    </button>
                  );
                })}
              </div>

              {/* Sort & Reset Actions */}
              <div className="sh-filter-tools">
                {hasActiveFilters && (
                  <button type="button" onClick={resetFilters} className="sh-reset-link">
                    {isAr ? 'إعادة ضبط' : 'Reset'}
                  </button>
                )}
                <select
                  id="sh-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sh-sort-select"
                  aria-label="Sort products"
                >
                  <option value="featured">{isAr ? 'المميز' : 'Featured'}</option>
                  <option value="price-asc">{isAr ? 'السعر: من الأقل' : 'Price: Low'}</option>
                  <option value="price-desc">{isAr ? 'السعر: من الأعلى' : 'Price: High'}</option>
                  <option value="name-asc">{isAr ? 'أبجدياً' : 'Name A–Z'}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Products Grid Section ── */}
      <section className="sh-grid-sec">
        <div className="sh-container">
          {filteredProducts.length === 0 ? (
            <div className="sh-empty-state">
              <h2 className="sh-empty-title">
                {isAr ? 'لم نجد أي قطع مطابقة لاختياراتك' : 'No pieces match your selected filters'}
              </h2>
              <p className="sh-empty-desc">
                {isAr
                  ? 'جرب اختيار فلاتر أخرى أو إزالة بعض خيارات البحث للاطلاع على المجموعة الكاملة.'
                  : 'Try adjusting your aroma, gender or size selection to discover other creations.'}
              </p>
              <button type="button" onClick={resetFilters} className="btn btn-dark">
                {isAr ? 'عرض الكتالوج كاملاً' : 'View Full Catalogue'}
              </button>
            </div>
          ) : (
            <div className="sh-grid">
              {filteredProducts.map((prod) => (
                <ShopProductCard key={prod.id || prod.slug} product={prod} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

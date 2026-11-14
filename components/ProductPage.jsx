'use client';
import Link from '@/components/Link';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from './Providers';
import { useInView } from './Reveal';
import { Icon } from './Chrome';
import { galleryOf } from './Gallery';
import { galleryAlts } from '@/lib/alt';
import { ShopProductCard } from './ShopCatalogView';
import { getProductReviews } from '@/lib/api';
import { askHouse, productQa } from '@/lib/productQa';

/* ───────── Gallery: thumb rail + framed stage, crossfade, swipe, zoom lightbox ───────── */
export function PdGallery({ images, alt, alts }) {
  const { lang } = useApp();
  const isAr = lang === 'ar';
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const touch = useRef(null);
  const n = images.length;
  const go = useCallback((k) => setI(((k % n) + n) % n), [n]);
  const rtl = isAr ? -1 : 1;

  useEffect(() => {
    if (!zoom) return;
    const key = (e) => {
      if (e.key === 'Escape') setZoom(false);
      if (e.key === 'ArrowRight') go(i + rtl);
      if (e.key === 'ArrowLeft') go(i - rtl);
    };
    document.addEventListener('keydown', key);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = prev; };
  }, [zoom, i, go, rtl]);

  const onTouchStart = (e) => { touch.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touch.current == null || n < 2) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    touch.current = null;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1) * rtl);
  };
  const pad = (v) => String(v).padStart(2, '0');

  return (
    <div className="pg" aria-roledescription="carousel" aria-label={alt}>
      {n > 1 && (
        <div className="pg-rail" role="tablist" aria-label={isAr ? 'صور المنتج' : 'Product images'}>
          {images.map((src, k) => (
            <button key={src} type="button" role="tab" aria-selected={k === i} aria-label={`${isAr ? 'صورة' : 'Image'} ${k + 1}`} className={k === i ? 'on' : ''} onClick={() => go(k)}>
              <Image src={src} alt="" fill sizes="84px" />
            </button>
          ))}
        </div>
      )}
      <div className="pg-stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="pg-frame">
          {images.map((src, k) => (
            <div className={`pg-slide ${k === i ? 'on' : ''}`} key={src} aria-hidden={k !== i}>
              <Image src={src} alt={alts?.[k] || (k === 0 ? alt : '')} fill priority={k === 0} sizes="(max-width:1000px) 100vw, 46vw" />
            </div>
          ))}
          <button type="button" className="pg-zoom" onClick={() => setZoom(true)} aria-label={isAr ? 'تكبير الصورة' : 'Zoom image'}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M20 20l-4.8-4.8M10.5 8v5M8 10.5h5" /></svg>
          </button>
          {n > 1 && (
            <>
              <button type="button" className="pg-nav prev" onClick={() => go(i - 1)} aria-label="Previous image"><Icon n="chev" size={16} /></button>
              <button type="button" className="pg-nav next" onClick={() => go(i + 1)} aria-label="Next image"><Icon n="chev" size={16} /></button>
              <span className="pg-count" aria-live="polite"><b>{pad(i + 1)}</b> / {pad(n)}</span>
            </>
          )}
        </div>
        {n > 1 && (
          <div className="pg-dots" aria-hidden="true">
            {images.map((src, k) => <button key={src} type="button" tabIndex={-1} className={k === i ? 'on' : ''} onClick={() => go(k)} />)}
          </div>
        )}
      </div>
      {zoom && (
        <div className="pg-lb" role="dialog" aria-modal="true" aria-label={alt} onClick={() => setZoom(false)}>
          <button type="button" className="pg-lb-x" onClick={() => setZoom(false)} aria-label="Close">×</button>
          <div className="pg-lb-img" onClick={(e) => e.stopPropagation()}>
            <Image src={images[i]} alt={alts?.[i] || alt} fill sizes="100vw" />
          </div>
          {n > 1 && (
            <>
              <button type="button" className="pg-nav prev" onClick={(e) => { e.stopPropagation(); go(i - 1); }} aria-label="Previous image"><Icon n="chev" size={18} /></button>
              <button type="button" className="pg-nav next" onClick={(e) => { e.stopPropagation(); go(i + 1); }} aria-label="Next image"><Icon n="chev" size={18} /></button>
              <span className="pg-count lb">{pad(i + 1)} / {pad(n)}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* Average rating + count for the hero (approved reviews only) */
function usePdRating(slug) {
  const [r, setR] = useState({ average: 0, count: 0 });
  useEffect(() => {
    let alive = true;
    if (slug) getProductReviews(slug).then((d) => alive && setR({ average: d?.summary?.average || 0, count: d?.summary?.count || 0 }));
    return () => { alive = false; };
  }, [slug]);
  return r;
}
/* ───────── Hero: gallery left, buy column right ───────── */
export function PdHero({ product, kicker, vi, setVi, qty, setQty, price, variant, buyable = true, buyRef, heroRef }) {
  const { t, L, lang, money, addItem, settings } = useApp();
  const isAr = lang === 'ar';
  const rating = usePdRating(product.slug);
  const crumbCat = product.category_name || (product.category ? product.category.replace(/-/g, ' ') : '');
  const freeOver = Number(settings?.shipping_free_over) || 0;
  const feeAmt = Number(settings?.shipping_fee) || 0;
  const refundDays = settings?.refund_days ?? 7;
  const deliveryDays = settings?.delivery_days ?? '2 - 5';
  const baseSize = product.size_label || product.size || '';
  const intro = product.line ? L(product.line) : product.impression ? L(product.impression) : '';
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
  const sizeText = variant?.label || baseSize;
  const main = isAr && product.name_ar ? product.name_ar : product.name;
  const sub = !isAr && product.name_ar && /[\u0600-\u06FF]/.test(product.name_ar) ? product.name_ar : '';
  return (
    <section className="pd-hero" ref={heroRef}>
      <div className="pd-hero-gal"><PdGallery images={galleryOf(product)} alt={product.name} alts={galleryAlts(product, L)} /></div>
      <div className="pd-hero-info">
        <div className="pd-info-in">
          <div className="pd-top">
            <nav className="pd-crumb" aria-label="Breadcrumb">
              <Link href="/shop">{isAr ? 'المتجر' : 'Shop'}</Link>
              {crumbCat && product.category && <><span aria-hidden="true">/</span><Link href={`/shop/${product.category}`}>{crumbCat}</Link></>}
            </nav>
          </div>
          <p className="pd-kicker">{kicker && typeof kicker === 'object' ? L(kicker) : kicker}</p>
          <h1 className="pd-title">{main}</h1>
          {sub && <p className="pd-title-ar" lang="ar" dir="rtl">{sub}</p>}

          <a className="pd-rate" href="#reviews">
            {rating.count > 0 ? (
              <>
                <span className="pd-rate-stars" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((n) => <svg key={n} viewBox="0 0 24 24" width="14" height="14" className={n <= Math.round(rating.average) ? 'on' : ''}><path d="M12 2.5l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17.3 5.9 20.9l1.5-6.8L2.2 9.5l6.9-.7z" /></svg>)}
                </span>
                <span>{rating.average.toFixed(1)} · {rating.count} {isAr ? 'تقييم' : rating.count === 1 ? 'review' : 'reviews'}</span>
              </>
            ) : (
              <span>{isAr ? 'كن أول من يقيّم هذا العطر' : 'Be the first to review'}</span>
            )}
          </a>

          {intro && <p className="pd-intro">{intro}</p>}

          {price != null ? (
            <p className="pd-price">
              <strong>{money(price)}</strong>
              <span>{sizeText ? `${sizeText} · ` : ''}{t.product.vat}</span>
            </p>
          ) : (
            <p className="pd-price"><span>{t.rooms.priceSoon}</span></p>
          )}

          {buyable && (
            <div ref={buyRef} className="pd-buy">
              {(hasVariants || baseSize) && (
                <div className="pd-sizes">
                  <span className="pd-lbl">{isAr ? 'متوفر بحجم' : 'Available in'}</span>
                  <div role="group" aria-label={t.home.sizes}>
                    {hasVariants
                      ? product.variants.map((v, i) => (
                          <button key={v.key} type="button" className={i === vi ? 'on' : ''} onClick={() => setVi(i)}>
                            {v.label}<em>{money(v.price)}</em>
                          </button>
                        ))
                      : <span className="on">{baseSize}</span>}
                  </div>
                </div>
              )}
              <div className="pd-buy-row">
                <div className="pd-qty" aria-label={t.product.qty}>
                  <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="-"><Icon n="minus" size={14} /></button>
                  <span>{qty}</span>
                  <button type="button" onClick={() => setQty(qty + 1)} aria-label="+"><Icon n="plus" size={14} /></button>
                </div>
                <button type="button" className="pd-add" onClick={() => addItem(product, qty, variant)}>
                  {t.product.add} · {money(price * qty)}
                </button>
              </div>
              <p className="pd-secure"><Icon n="lock" size={13} /> {t.product.secure}</p>
              <PdPerfMini product={product} />
            </div>
          )}

          <ul className="pd-trust">
            <li><Icon n="truck" size={16} /> {isAr ? `توصيل مجاني فوق ${freeOver ? money(freeOver) : ''}` : `Free delivery over ${freeOver ? money(freeOver) : ''}`}</li>
            <li><Icon n="cash" size={16} /> {isAr ? 'الدفع عند الاستلام' : 'Cash on delivery'}</li>
            <li><Icon n="returns" size={16} /> {isAr ? `إرجاع خلال ${refundDays} أيام` : `${refundDays}-day returns`}</li>
          </ul>

          <div className="pd-acc">
            <details><summary>{t.product.delivery}<Icon n="chev" size={16} /></summary><p>{isAr ? `التوصيل خلال ${deliveryDays} أيام عمل بحسب موقعك. رسوم التوصيل ${money(feeAmt)}، ومجانًا للطلبات فوق ${money(freeOver)}.` : `Delivered in ${deliveryDays} working days depending on your location. Delivery is ${money(feeAmt)}, and free on orders over ${money(freeOver)}.`} <Link href="/policies/shipping">{isAr ? 'التفاصيل' : 'Details'}</Link></p></details>
            <details><summary>{t.product.returns}<Icon n="chev" size={16} /></summary><p>{isAr ? `يمكن إرجاع المنتجات غير المفتوحة خلال ${refundDays} أيام من التسليم.` : `Unopened items can be returned within ${refundDays} days of delivery.`} <Link href="/policies/returns">{isAr ? 'سياسة الاسترجاع' : 'Refund policy'}</Link></p></details>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Generic two-column text row ───────── */
export function PdRow({ label, children }) {
  return (
    <section className="pd-sec">
      <div className="pd-wrap pd-row">
        <p className="pd-kicker">{label}</p>
        <div className="pd-copy">{children}</div>
      </div>
    </section>
  );
}

/* ───────── Impression + story in one panel ───────── */
export function PdIntro({ impression, story }) {
  const { t, L } = useApp();
  const imp = impression ? L(impression) : '';
  const paras = story ? (L(story) || []).filter(Boolean).map((p) => String(p).replace(/([a-z0-9])\.([A-Z])/g, '$1. $2')) : [];
  if (!imp && !paras.length) return null;
  const body = paras.filter((p) => p !== imp);
  return (
    <section className="pd-sec pi">
      <div className="pd-wrap pi-grid">
        {imp && (
          <div className="pi-imp">
            <p className="pd-kicker">{t.product.impression}</p>
            <p className="pi-lead">{imp}</p>
          </div>
        )}
        {body.length > 0 && (
          <div className="pi-story">
            <p className="pd-kicker">{t.product.story}</p>
            {body.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        )}
      </div>
    </section>
  );
}

/* ───────── Composition: every note exactly as entered in the admin (name + image) ───────── */
// Colour + stock image used only when a note has no uploaded image (picked by keyword, never shown as a "family").
const NOTE_TONES = {
  citrus: '#f1d56b', green: '#a9c79a', spice: '#e3a07a', floral: '#efbdc6', wood: '#d6c7a2',
  amber: '#e6bd68', musk: '#e4dccd', fruit: '#ea9fab', sweet: '#dcc08f',
};
const FAMILY_RULES = [
  ['citrus', /grapefruit|lemon|orange|bergamot|mandarin|lime|citrus|yuzu|tangerine|pomelo|زبيب|ليمون|برتقال|برغموت/i],
  ['sweet', /vanilla|tonka|caramel|chocolate|honey|sugar|cocoa|coffee|almond|praline|sweet|gourmand|فانيلا|عسل|شوكولا/i],
  ['fruit', /pear|apple|peach|plum|berry|berries|raspberry|currant|cassis|fig|mango|pineapple|cherry|fruit|coconut|apricot|melon|lychee|grape|كمثرى|تفاح|خوخ/i],
  ['spice', /pepper|cardamom|cinnamon|saffron|clove|ginger|nutmeg|spice|cumin|anise|coriander|safran|فلفل|هيل|قرفة|زعفران|قرنفل|زنجبيل/i],
  ['green', /mint|basil|tea|grass|herb|lavender|sage|rosemary|thyme|petitgrain|green|leaf|نعناع|ريحان|لافندر/i],
  ['floral', /rose|jasmine|iris|orris|violet|lily|peony|floral|freesia|tuberose|blossom|orchid|heliotrope|neroli|ylang|mimosa|geranium|immortelle|magnolia|lotus|ورد|ياسمين|زهر|سوسن/i],
  ['amber', /amber|labdanum|incense|frankincense|myrrh|resin|benzoin|olibanum|opoponax|bakhoor|ambroxan|عنبر|لبان|بخور|مر/i],
  ['musk', /musk|ambrette|cashmeran|skin|powder|cotton|مسك/i],
  ['wood', /sandal|cedar|vetiver|patchouli|wood|oud|agar|iso e|guaiac|leather|tobacco|birch|oak|smoke|صندل|أرز|عود|جلد|باتشولي|خشب/i],
];
const LEVEL_DEFAULT = { top: 'citrus', heart: 'floral', base: 'wood', general: 'musk' };
function toneOf(name, level) {
  const hit = FAMILY_RULES.find(([, re]) => re.test(name));
  return hit ? hit[0] : LEVEL_DEFAULT[level] || 'musk';
}

function NoteImg({ src, fallback, alt }) {
  const [bad, setBad] = useState(false);
  const url = !src || bad ? fallback : src;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} loading="lazy" decoding="async" width="96" height="96" ref={(el) => { if (el && el.complete && el.naturalWidth === 0 && !bad) setBad(true); }} onError={() => !bad && setBad(true)} />;
}

export function PdNotes({ notes, items }) {
  const { lang } = useApp();
  const [ref, seen] = useInView();
  const isAr = lang === 'ar';
  const LV = ['top', 'heart', 'base', 'general'];
  const data = {};
  LV.forEach((k) => {
    const rich = items?.[k];
    data[k] = rich?.length ? rich : (notes?.[k] || []).map((name) => ({ name, name_ar: '', image: '' }));
  });
  // Pyramid levels first; "general" notes only get their own column when there is no pyramid.
  const pyramid = ['top', 'heart', 'base'].filter((k) => data[k].length);
  const keys = pyramid.length ? pyramid : data.general.length ? ['general'] : [];
  if (!keys.length) return null;
  const levels = { top: isAr ? 'أعلى' : 'Top', heart: isAr ? 'قلب' : 'Heart', base: isAr ? 'قاعدة' : 'Base', general: isAr ? 'رئيسية' : 'Key' };
  const subs = {
    top: isAr ? 'ما يلاحظه الناس عند وصولك' : 'what people notice as you arrive',
    heart: isAr ? 'ما يتحول إليه على بشرتك' : 'what it becomes on your skin',
    base: isAr ? 'الأثر الذي تتركه خلفك' : 'the trail you leave behind',
    general: isAr ? 'روح هذا العطر' : 'the spirit of this fragrance',
  };
  const heads = {
    top: isAr ? 'الدقائق الأولى' : 'First minutes',
    heart: isAr ? 'القلب' : 'The heart',
    base: isAr ? 'ما يبقى' : 'What stays',
    general: isAr ? 'النوتات' : 'The notes',
  };
  return (
    <section className="pd-sec pn-sec">
      <div className="pd-wrap">
        <p className="pd-kicker">{isAr ? 'التركيبة' : 'The composition'}</p>
        <h2 className="pd-h2">{isAr ? 'ستشم رائحة…' : 'You will smell like…'}</h2>
        <div className={`pn ${seen ? 'in' : ''}`} ref={ref} style={{ '--cols': keys.length }}>
          {keys.map((k, i) => (
            <div className="pn-col" key={k} style={{ '--cd': `${i * 110}ms` }}>
              <div className="pn-head">
                <span className="pn-badge">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{heads[k]} <em>({levels[k]})</em></h3>
                  <p>{subs[k]}</p>
                </div>
              </div>
              <div className={`pn-list ${k === 'general' ? 'pn-wide' : ''}`}>
                {data[k].map((n, j) => {
                  const tone = toneOf(n.name, k);
                  const label = isAr && n.name_ar ? n.name_ar : n.name;
                  return (
                    <div className="pn-item" key={n.name + j} style={{ '--nc': NOTE_TONES[tone] }} tabIndex={0}>
                      <span className="pn-bg" aria-hidden="true" />
                      <div className="pn-row">
                        <span className="pn-img">
                          <span className="pn-halo" aria-hidden="true" />
                          <NoteImg src={n.image} fallback={`/images/notes/${tone}.jpg`} alt={n.name} />
                        </span>
                        <h4>{label}</h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── The Character: refined spectrum bars ───────── */
/* ───────── Ask the house + Your questions: replaces the old character sliders ───────── */
export function PdAsk({ product }) {
  const { lang, money } = useApp();
  const ar = lang === 'ar';
  const name = ar ? `\u2068${product.name_ar || product.name}\u2069` : product.name;
  const text = askHouse(product, lang);
  const qa = productQa(product, lang, money);
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState('');
  useEffect(() => { setOpen(false); setShown(''); }, [lang, product.id]);
  useEffect(() => {
    if (!open || !text) return undefined;
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setShown(text); return undefined; }
    const words = text.split(' ');
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(words.slice(0, i).join(' '));
      if (i >= words.length) clearInterval(id);
    }, 55);
    return () => clearInterval(id);
  }, [open, text]);
  if (!text && !qa.length) return null;
  const done = shown.length >= text.length;
  return (
    <section className="pd-sec pd-ask">
      <div className="pd-wrap pd-ask-grid">
        {text && (
          <div className="pd-ask-box">
            <p className="pd-kicker">{ar ? 'اسأل الدار' : 'Ask the house'}</p>
            <h2 className="pd-h2">{ar ? `كيف ستكون رائحتي مع «${name}»؟` : `How will I smell wearing ${name}?`}</h2>
            <p className="pd-ask-intro">{ar ? 'بلمسة واحدة نصفه لك بكلمات بسيطة: اللحظة، لا قائمة المكونات.' : 'One tap, and we describe it in plain words: the moment, not the list of notes.'}</p>
            {!open ? (
              <button type="button" className="pd-ask-btn" onClick={() => setOpen(true)}>
                {ar ? 'أخبرني كيف ستكون رائحتي' : "Tell me how I'll smell"} <span aria-hidden="true">{ar ? '←' : '→'}</span>
              </button>
            ) : (
              <p className="pd-ask-out" aria-live="polite">{shown}{!done && <i className="pd-ask-caret" aria-hidden="true" />}</p>
            )}
          </div>
        )}
        {qa.length > 0 && (
          <div className="pd-ask-qa">
            <p className="pd-kicker">{ar ? 'أسئلتك' : 'Your questions'}</p>
            <h2 className="pd-h2">{ar ? `أسئلتك عن «${name}»` : `Your questions about ${name}`}</h2>
            <div className="pd-faq-list">
              {qa.map((f, i) => (
                <details key={i} className="pd-faq-item">
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function PdCharacter({ spectrum, wear }) {
  const { t, L } = useApp();
  const [ref, seen] = useInView();
  if (!spectrum?.length) return null;
  return (
    <section className="pd-sec pd-char-sec">
      <div className="pd-wrap pd-char">
        <div className="pd-char-head">
          <h2 className="pd-h2">{t.product.character}</h2>
          {wear?.length > 0 && (
            <div className="pd-wearp">
              <p className="pd-wearp-lbl">{t.product.wear}</p>
              <ul>{wear.map((x, i) => <li key={i}>{L(x)}</li>)}</ul>
            </div>
          )}
        </div>
        <div className={`pd-spectrum ${seen ? 'in' : ''}`} ref={ref}>
          {spectrum.map(([a, b, v], i) => (
            <div className="pd-spec" key={i} style={{ '--v': `${v}%`, '--d': `${i * 120}ms` }}>
              <div className="pd-spec-labels"><span>{L(a)}</span><span>{L(b)}</span></div>
              <div className="pd-spec-track"><i /><b /></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Product film: click-to-load, so no video bytes are fetched until the visitor presses play ───────── */
function embedOf(url) {
  let m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i);
  if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (m) return `https://player.vimeo.com/video/${m[1]}?autoplay=1&title=0&byline=0&portrait=0`;
  return '';
}
export function PdVideo({ video, product }) {
  const { lang, L } = useApp();
  const [on, setOn] = useState(false);
  if (!video?.url) return null;
  const isAr = lang === 'ar';
  const embed = embedOf(video.url);
  const gal = Array.isArray(product?.gallery) ? product.gallery : [];
  const poster = video.poster || gal[1] || gal[0] || product?.image || '';
  const title = (isAr ? video.title?.ar : video.title?.en) || video.title?.en || '';
  const name = isAr && product?.name_ar ? product.name_ar : product?.name || '';
  const label = isAr ? 'تشغيل الفيلم' : 'Play film';
  return (
    <section className="pd-dark pv-sec">
      <div className="pd-wrap">
        <p className="pd-kicker gold">{isAr ? 'الفيلم' : 'The film'}</p>
        <h2 className="pv-h2">{title || name}</h2>
        <div className={`pv-frame ${on ? 'on' : ''}`}>
          {on ? (
            embed ? (
              <iframe src={embed} title={title || name} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
            ) : (
              <video src={video.url} poster={poster || undefined} controls autoPlay playsInline preload="auto" />
            )
          ) : (
            <button type="button" className="pv-play" onClick={() => setOn(true)} aria-label={label}>
              {poster && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={poster} alt={name} loading="lazy" decoding="async" />
              )}
              <span className="pv-shade" aria-hidden="true" />
              <span className="pv-btn" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="26" height="26"><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg>
              </span>
              <span className="pv-cap">{label}</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export function PdWear({ wear }) {
  const { t, L } = useApp();
  if (!wear?.length) return null;
  return (
    <PdRow label={t.product.wear}>
      <ul className="pd-wear">{wear.map((x, i) => <li key={i}>{L(x)}</li>)}</ul>
    </PdRow>
  );
}

/* ───────── Related grid (shop cards) ───────── */
export function PdRelated({ product, products = [] }) {
  const { lang } = useApp();
  const same = products.filter((p) => p.id !== product.id && p.category === product.category);
  const rest = products.filter((p) => p.id !== product.id && p.category !== product.category);
  const list = [...same, ...rest].slice(0, 4);
  if (!list.length) return null;
  return (
    <section className="pd-sec pd-rel">
      <div className="pd-wrap">
        <p className="pd-kicker">{lang === 'ar' ? 'قد يعجبك أيضاً' : 'You may also like'}</p>
        <h2 className="pd-h2">{lang === 'ar' ? 'ارتدِه مع' : 'Wear it with'}</h2>
        <div className="sh-grid">{list.map((p) => <ShopProductCard key={p.id || p.slug} product={p} />)}</div>
      </div>
    </section>
  );
}

/* ───────── Performance: longevity + sillage meters (from product specifications) ───────── */
function longevityLevel(s) {
  const nums = (String(s).match(/\d+/g) || []).map(Number);
  if (nums.length) {
    const m = Math.max(...nums);
    return m < 3 ? 1 : m < 6 ? 2 : m < 8 ? 3 : m < 12 ? 4 : 5;
  }
  const w = String(s).toLowerCase();
  if (/eternal|all.?day/.test(w)) return 5;
  if (/long/.test(w)) return 4;
  if (/short|brief/.test(w)) return 2;
  return 3;
}
function sillageLevel(s) {
  const w = String(s).toLowerCase();
  if (/enormous|heavy|huge/.test(w)) return 5;
  if (/strong|bold/.test(w)) return 4;
  if (/soft|light|intimate|skin/.test(w)) return 2;
  return 3;
}
function perfRows(product, ar) {
  let spec = product?.specifications;
  if (typeof spec === 'string') { try { spec = JSON.parse(spec); } catch { spec = null; } }
  return [
    spec?.longevity && { k: 'l', label: ar ? 'الثبات' : 'Longevity', text: spec.longevity, lvl: longevityLevel(spec.longevity) },
    spec?.sillage && { k: 's', label: ar ? 'الفوحان' : 'Sillage', text: spec.sillage, lvl: sillageLevel(spec.sillage) },
  ].filter(Boolean);
}

/* Compact longevity / sillage meters shown top-right of the hero info column */
export function PdPerfMini({ product }) {
  const { lang } = useApp();
  const rows = perfRows(product, lang === 'ar');
  if (!rows.length) return null;
  return (
    <div className="pd-pm" aria-label={lang === 'ar' ? 'الأداء' : 'Performance'}>
      {rows.map((r) => (
        <div className="pd-pm-row" key={r.k} title={r.text}>
          <span className="pd-pm-label">{r.label}</span>
          <span className="pd-perf-meter" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((n) => <i key={n} className={n <= r.lvl ? 'on' : ''} />)}
          </span>
          <span className="pd-pm-text">{r.text}</span>
        </div>
      ))}
    </div>
  );
}

export function PdPerformance({ product }) {
  const { lang } = useApp();
  const ar = lang === 'ar';
  const rows = perfRows(product, ar);
  if (!rows.length) return null;
  return (
    <PdRow label={ar ? 'الأداء' : 'Performance'}>
      <div className="pd-perf">
        {rows.map((r) => (
          <div className="pd-perf-row" key={r.k}>
            <span className="pd-perf-label">{r.label}</span>
            <span className="pd-perf-meter" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((n) => <i key={n} className={n <= r.lvl ? 'on' : ''} />)}
            </span>
            <span className="pd-perf-text">{r.text}</span>
          </div>
        ))}
      </div>
    </PdRow>
  );
}

/* ───────── FAQ (Admin → Storefront → Product FAQ) ───────── */
export function PdFaq() {
  const { lang, settings, money } = useApp();
  const ar = lang === 'ar';
  let faq = settings?.product_faq;
  if (typeof faq === 'string') { try { faq = JSON.parse(faq); } catch { faq = []; } }
  if (!Array.isArray(faq) || !faq.length) return null;
  const fee = Number(settings?.shipping_fee ?? 0);
  const fill = (s) => String(s || '')
    .replace(/\{delivery_days\}/g, settings?.delivery_days || '2 - 5')
    .replace(/\{refund_days\}/g, settings?.refund_days || '7')
    .replace(/\{free_over\}/g, money(Number(settings?.shipping_free_over ?? 0)))
    .replace(/\{shipping_fee\}/g, fee ? money(fee) : (ar ? 'مجاني' : 'free'));
  const items = faq
    .map((f) => ({ q: fill(ar ? f.q_ar || f.q_en : f.q_en), a: fill(ar ? f.a_ar || f.a_en : f.a_en) }))
    .filter((f) => f.q && f.a);
  if (!items.length) return null;
  return (
    <section className="pd-sec pd-faq">
      <div className="pd-wrap">
        <p className="pd-kicker">{ar ? 'أسئلة شائعة' : 'Good to know'}</p>
        <h2 className="pd-h2">{ar ? 'الأسئلة الشائعة' : 'Frequently asked'}</h2>
        <div className="pd-faq-list">
          {items.map((f, i) => (
            <details key={i} className="pd-faq-item">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Complete the ritual: up to 3 pieces from other categories ───────── */
export function PdComplete({ product, products = [] }) {
  const { lang, money, addItem } = useApp();
  const ar = lang === 'ar';
  const others = products.filter((p) => p.id !== product.id && p.price > 0);
  const diff = others.filter((p) => p.category !== product.category);
  const list = (diff.length >= 2 ? diff : others).slice(0, 3);
  if (!list.length) return null;
  return (
    <section className="pd-sec pd-comp">
      <div className="pd-wrap">
        <p className="pd-kicker">{ar ? 'أكمل الطقس' : 'Complete the ritual'}</p>
        <h2 className="pd-h2">{ar ? 'يكتمل بـ' : 'Pairs well with'}</h2>
        <div className="pd-comp-grid">
          {list.map((p) => {
            const name = ar && p.name_ar ? p.name_ar : p.name;
            return (
              <div className="pd-comp-card" key={p.id || p.slug}>
                <Link href={`/fragrance/${p.slug}`} className="pd-comp-img">
                  {p.image && <Image src={p.image} alt={name} fill sizes="120px" />}
                </Link>
                <div className="pd-comp-info">
                  <Link href={`/fragrance/${p.slug}`} className="pd-comp-name">{name}</Link>
                  <span className="pd-comp-price">{money(p.variants?.[0]?.price ?? p.price)}</span>
                </div>
                <button type="button" className="pd-comp-add" onClick={() => addItem(p, 1, p.variants?.[0])}>
                  {ar ? 'أضف' : 'Add'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function PdNext({ next }) {
  const { t } = useApp();
  if (!next) return null;
  return (
    <Link href={`/fragrance/${next.slug}`} className="pd-next">
      <span className="pd-kicker">{t.product.next}</span>
      <strong>{next.name}</strong>
      <Icon n="arrow" size={20} />
    </Link>
  );
}

export function PdStickyBar({ show, product, price, qty, variant }) {
  const { t, money, addItem } = useApp();
  return (
    <div className={`pd-bar ${show ? 'show' : ''}`} aria-hidden={!show}>
      <span><strong>{product.name}</strong><em>{money(price)}</em></span>
      <button type="button" className="pd-add" tabIndex={show ? 0 : -1} onClick={() => addItem(product, qty, variant)}>{t.product.add}</button>
    </div>
  );
}

/* hero ↔ sticky bar visibility */
export function useStickyBar(product) {
  const [showBar, setShowBar] = useState(false);
  const heroRef = useRef(null);
  const ctaRef = useRef(null);
  useEffect(() => {
    if (!heroRef.current || !ctaRef.current) return;
    let heroOut = false, ctaIn = false;
    const upd = () => setShowBar(heroOut && !ctaIn);
    const a = new IntersectionObserver(([e]) => { heroOut = !e.isIntersecting; upd(); });
    const b = new IntersectionObserver(([e]) => { ctaIn = e.isIntersecting; upd(); });
    a.observe(heroRef.current); b.observe(ctaRef.current);
    return () => { a.disconnect(); b.disconnect(); };
  }, [product]);
  return { showBar, heroRef, ctaRef };
}

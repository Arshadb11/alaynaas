'use client';
/**
 * Homepage sections in the minimal "editorial" style:
 *  - FamilyPanels : scroll-driven category panels (one panel slides over the next)
 *  - StorySplit   : image + story copy, two columns
 *  - Signature    : draggable carousel of tinted product cards
 * All data comes from the API (categories / products) so the admin panel drives it.
 */
import Link from 'next/link';
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

/* ───────────── Family panels (sticky, scroll-driven) ───────────── */
export function FamilyPanels({ categories = [], families = [], products = [] }) {
  const { lang, L, money } = useApp();
  const tx = TXT[lang] || TXT.en;
  const wrap = useRef(null);
  const panels = useRef([]);
  const [active, setActive] = useState(0);

  // Preferred: admin-managed olfactory families (Floral, Woody...) with the products tagged to them.
  // Families without products still get a panel ("coming soon") so the scroll slider always works,
  // exactly like the reference; families that have products come first.
  // Fallback (no families configured): product categories.
  const slugsOf = (p) => String(p.family_slugs || '').split(',').filter(Boolean);
  const byFamily = families
    .map((f) => ({
      c: { ...f, href: `/fragrances?family=${encodeURIComponent(f.slug)}` },
      list: products.filter((p) => slugsOf(p).includes(f.slug)),
    }))
    .sort((a, b) => ((b.list.length > 0) - (a.list.length > 0)) || (rank(a.c.slug) - rank(b.c.slug)));
  const groups = (byFamily.length ? byFamily : categories.map((c) => ({ c, list: products.filter((p) => p.category === c.slug) })).filter((g) => g.list.length > 0))
    .slice(0, 5);
  const n = groups.length;

  useEffect(() => {
    const el = wrap.current;
    if (!el || n < 2) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = span > 0 ? clamp(-r.top / span, 0, 1) * (n - 1) : 0;
      panels.current.forEach((node, i) => {
        if (!node) return;
        const k = i === 0 ? 1 : clamp(p - (i - 1), 0, 1); // 0 = off-screen, 1 = in place
        const x = reduce ? (k >= 1 ? 0 : 100) : (1 - k) * 100;
        node.style.transform = `translate3d(calc(${x}% * var(--dir, 1)), 0, 0)`;
      });
      setActive((a) => { const next = Math.round(p); return a === next ? a : next; });
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, [n]);

  if (n === 0) return null;

  const scrollRow = (i, dir) => {
    const row = panels.current[i]?.querySelector('.fx-row');
    if (row) row.scrollBy({ left: dir * row.clientWidth * 0.7, behavior: 'smooth' });
  };

  return (
    <section className="fx" aria-label={tx.fH}>
      <div className="wrap fx-intro">
        <Reveal><p className="label">{tx.fKick}</p></Reveal>
        <Headline className="h-xl" lines={[tx.fH]} />
        <Reveal><p className="fx-sub">{tx.fSub}</p></Reveal>
      </div>

      <div className="fx-scroll" ref={wrap} style={{ height: `${n * 100 + 10}svh` }}>
        <div className="fx-stick">
          <div className="fx-frame">
            {groups.map(({ c, list }, i) => {
              const name = lang === 'ar' && c.name_ar ? c.name_ar : L(c.name);
              const raw = lang === 'ar' && c.description_ar ? c.description_ar : c.description;
              const blurb = plain(raw || (Array.isArray(L(c.intro)) ? L(c.intro)[0] : L(c.intro)) || '');
              return (
                <div
                  key={c.slug}
                  className="fx-panel"
                  ref={(node) => { panels.current[i] = node; }}
                  style={{ zIndex: i + 1, '--fx-bg': `url(${familyBg(c.slug, i)})`, transform: i === 0 ? 'none' : 'translate3d(calc(100% * var(--dir, 1)), 0, 0)' }}
                  aria-current={i === active}
                >
                  <div className="fx-top">
                    <span className="label">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="fx-name">{name}</h3>
                    {blurb && <p className="fx-blurb">{blurb}</p>}
                    {i < n - 1 && <p className="fx-hint">{tx.scroll} <span aria-hidden="true">{lang === 'ar' ? '←' : '→'}</span></p>}
                  </div>

                  <div className="fx-mid">
                    {list.length === 0 && <p className="fx-soon">{tx.soon}</p>}
                    <div className="fx-row">
                      {list.slice(0, 12).map((p) => (
                        <Link key={p.id} href={`/fragrance/${p.slug}`} className="fx-item" tabIndex={i === active ? 0 : -1}>
                          <span className="fx-img">
                            {p.image && <Image src={p.image} alt={p.name} fill sizes="(max-width:900px) 60vw, 18vw" />}
                          </span>
                          <span className="fx-pn">{lang === 'ar' && p.name_ar ? p.name_ar : p.name}</span>
                          <span className="label fx-pp">{p.variants ? `${tx.from} ` : ''}{money(fromPrice(p))}</span>
                        </Link>
                      ))}
                    </div>
                    {list.length > 3 && (
                      <button type="button" className="fx-next" aria-label={tx.more} onClick={() => scrollRow(i, lang === 'ar' ? -1 : 1)}>
                        <span aria-hidden="true">{lang === 'ar' ? '←' : '→'}</span>
                      </button>
                    )}
                  </div>

                  <Link href={c.href || `/fragrances/${c.slug}`} className="fx-cta" tabIndex={i === active ? 0 : -1}>
                    {tx.nowIn} {name}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
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

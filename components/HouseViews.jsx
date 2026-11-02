'use client';
import Link from '@/components/Link';
import { productAlt } from '@/lib/alt';
import Gallery, { galleryOf } from './Gallery';
import { PdHero, PdRow, PdNotes, PdWear, PdRelated, PdStickyBar, useStickyBar } from './ProductPage';
import { PdReviews } from './ProductReviews';
import { ShopProductCard } from './ShopCatalogView';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useApp, useTone } from './Providers';
import { Reveal, Headline, Lines, Parallax } from './Reveal';
import { Icon } from './Chrome';
import { catBySlug, intensityOf, characterOf, journal } from '@/lib/data';

const Arrow = () => <span className="arr"><Icon n="arrow" size={18} /></span>;
const wstyle = (c) => {
  const w = c?.world || { bg: '#14100c', fg: '#eadfcf', accent: '#b9763a' };
  return { '--bg': w.bg, '--fg': w.fg, '--ac': w.accent };
};
const isDark = (hex) => {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return true;
  const n = parseInt(hex.slice(1), 16);
  return (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255 < 0.45;
};
export const roomCount = (t, n) => (n === 0 ? t.rooms.soonShort : n === 1 ? t.rooms.one : t.rooms.many.replace('{n}', n));
const NICHE = 'exclusive-creations';

/* ───────── Browse by relationship with fragrance (not a filter panel) ───────── */
export function Relations({ categories, exclude, standalone = false }) {
  const { t, L } = useApp();
  const list = categories.filter((c) => c.slug !== exclude);
  return (
    <section className={`rel ${standalone ? 'standalone' : ''}`}>
      <div className="wrap">
        <p className="label">{t.rooms.exploreBy}</p>
        <Headline className="h-xl" lines={[t.rooms.relationH]} />
        <ul className="rel-list">
          {list.map((c, i) => (
            <Reveal as="li" key={c.slug} delay={i * 60}>
              <Link href={c.href} className={`rel-row ${c.slug === NICHE ? 'rare' : ''}`}>
                <span className="n">0{i + 1}</span>
                <span className="tx">{L(c.relation)}</span>
                <span className="to label">{L(c.tag)}</span>
                <Arrow />
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ───────── Homepage: shop by expression, collection showcase, rooms ───────── */
const fromPrice = (p) => (p.variants ? Math.min(...p.variants.map((v) => v.price)) : p.price);

export function ProductCard({ p, i = 0 }) {
  const { t, L, money, addItem } = useApp();
  return (
    <div className="pc" style={wstyle(p)}>
      <Reveal delay={i * 90}>
        <Link href={`/fragrance/${p.slug}`} className="pc-img" aria-label={p.name}>
          {p.image && <Image src={p.image} alt={productAlt(p, L)} fill sizes="(max-width:900px) 80vw, 24vw" />}
        </Link>
        <div className="pc-info">
          <p className="label">{L(p.mood || '')}</p>
          <Link href={`/fragrance/${p.slug}`} className="pc-name">{p.name}</Link>
          <p className="pc-line">{L(p.line || '')}</p>
          <div className="pc-buy">
            <span>{p.variants ? `${t.home.from} ` : ''}{money(fromPrice(p))}</span>
            <button className="pc-add" onClick={() => addItem(p, 1, p.variants?.[0])}>{t.home.add}</button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

export function Showcase({ products }) {
  const { t, L, money, addItem } = useApp();
  const track = useRef(null);
  const [prog, setProg] = useState(0);
  const [edge, setEdge] = useState({ start: true, end: false });
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const on = () => {
      const max = el.scrollWidth - el.clientWidth;
      const x = Math.abs(el.scrollLeft);
      setProg(max > 0 ? x / max : 1);
      setEdge({ start: x < 4, end: x >= max - 4 });
    };
    on();
    el.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { el.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
  }, [products.length]);
  const step = (d) => {
    const el = track.current;
    if (!el) return;
    const w = (el.querySelector('.cs')?.offsetWidth || 320) + 24;
    el.scrollBy({ left: d * w * (document.documentElement.dir === 'rtl' ? -1 : 1), behavior: 'smooth' });
  };
  return (
    <section className="sh" id="shop">
      <div className="wrap sh-head">
        <div>
          <Reveal><p className="label">{t.home.showKicker}</p></Reveal>
          <Headline className="h-xl" lines={t.home.showH} />
        </div>
        <div className="sh-meta">
          <p className="label">{t.home.showSub}</p>
          <div className="cs-ctl">
            <Link href="/shop/eau-de-parfum" className="tlink">{t.home.shopAll}<Arrow /></Link>
            <div className="cs-arrows">
              <button className="cs-arrow prev" onClick={() => step(-1)} disabled={edge.start} aria-label="Previous"><span /></button>
              <button className="cs-arrow next" onClick={() => step(1)} disabled={edge.end} aria-label="Next"><span /></button>
            </div>
          </div>
        </div>
      </div>
      <div className="cs-track" ref={track}>
        {products.map((p, i) => (
          <article className="cs" key={p.id} style={wstyle(p)}>
            <Link href={`/fragrance/${p.slug}`} className="cs-img" aria-label={p.name}>
              {p.image && <Image src={p.image} alt={productAlt(p, L)} fill sizes="(max-width:900px) 78vw, 30vw" />}
              <span className="cs-no">{p.no || String(i + 1).padStart(2, '0')}</span>
              <span className="cs-mood">{L(p.mood || '')}</span>
            </Link>
            <div className="cs-info">
              <div>
                <Link href={`/fragrance/${p.slug}`} className="cs-name">{p.name}</Link>
                <p className="cs-line">{L(p.line || '')}</p>
              </div>
              <div className="cs-buy">
                <span>{p.variants ? `${t.home.from} ` : ''}{money(fromPrice(p))}</span>
                <button className="pc-add" onClick={() => addItem(p, 1, p.variants?.[0])}>{t.home.add}</button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="wrap"><div className="cs-prog" aria-hidden="true"><i style={{ transform: `scaleX(${Math.max(0.12, prog)})` }} /></div></div>
    </section>
  );
}

export function RoomStrip({ categories, products }) {
  const { t, L } = useApp();
  return (
    <section className="rs">
      <div className="wrap">
        <Reveal><p className="label">{t.home.shopRooms}</p></Reveal>
        <ul className="rs-list">
          {categories.map((c, i) => (
            <Reveal as="li" key={c.slug} delay={i * 50}>
              <Link href={c.href} className="rs-tile" style={wstyle(c)}>
                <span className="rs-img">{c.image && <Image src={c.image} alt="" fill sizes="(max-width:900px) 45vw, 16vw" />}</span>
                <span className="rs-t"><strong>{L(c.tag)}</strong><em>{roomCount(t, products.filter((p) => p.category === c.slug).length)}</em></span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Teaser({ c, products }) {
  const { t, L, money, addItem } = useApp();
  const list = products.filter((p) => p.category === c.slug);
  const door = c.slug === NICHE;
  return (
    <section className={`tz tz-${c.slug}`} style={wstyle(c)}>
      {c.image && <div className="tz-img"><Parallax speed={0.07}><Image src={c.image} alt="" fill sizes="100vw" /></Parallax></div>}
      <div className="tz-shade" />
      <div className="wrap tz-in">
        <div className="tz-copy">
          <Reveal><p className="label">{L(c.teaser.label)}</p></Reveal>
          <Headline className="mega-sm" lines={L(c.teaser.h)} />
          {c.teaser.sub && <Lines className="copy" lines={L(c.teaser.sub)} />}
          <Reveal><Link href={c.href} className="tlink">{L(c.teaser.cta)}<Arrow /></Link></Reveal>
        </div>
        {list.length > 0 && (
          <ul className="tz-prods">
            {list.map((p) => (
              <li key={p.id}>
                <Link href={`/fragrance/${p.slug}`} className="tz-pn">{p.name}{p.size ? <em>{p.size}</em> : null}</Link>
                {!door && <span className="tz-pp">{money(fromPrice(p))}</span>}
                {!door && <button className="pc-add" onClick={() => addItem(p, 1, p.variants?.[0])}>{t.home.add}</button>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export function MoreRooms({ categories, products = [] }) {
  const { t, L, money } = useApp();
  const rooms = categories.filter((c) => c.teaser);
  const lines = t.rooms.moreLines;
  return (
    <section className="sec bone bt">
      <div className="wrap">
        <div className="bt-head">
          <div>
            <Reveal><p className="label">{t.rooms.moreKicker}</p></Reveal>
            <Headline className="h-xl" lines={t.rooms.moreH} />
          </div>
          <Reveal><p className="bt-lead">{lines[1]} {lines[2]}</p></Reveal>
        </div>
        <div className="bt-grid">
          {rooms.map((c, i) => {
            const list = products.filter((p) => p.category === c.slug);
            const from = list.length ? Math.min(...list.map(fromPrice)) : null;
            return (
              <Reveal key={c.slug} delay={(i % 3) * 80} className={`bt-card bt-${c.slug}`}>
                <Link href={c.href} className="bt-link" style={wstyle(c)}>
                  {c.image && <Image src={c.image} alt="" fill sizes="(max-width:900px) 100vw, 50vw" className="bt-img" />}
                  <span className="bt-shade" />
                  <span className="bt-body">
                    <span className="label">{roomCount(t, list.length)}</span>
                    <strong>{L(c.name)}</strong>
                    <em>{(L(c.teaser.sub || c.intro) || [])[0] || ''}</em>
                    <span className="bt-foot">
                      <span>{from != null ? `${t.home.from} ${money(from)}` : t.rooms.niche.label}</span>
                      <span className="bt-go">{L(c.teaser.cta)}<Arrow /></span>
                    </span>
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────── Find your fragrance ───────── */
export function Finder({ products, standalone = false }) {
  const { t, L, money, addItem } = useApp();
  const [feel, setFeel] = useState(null);
  const [inten, setInten] = useState(null);
  const step = !feel ? 1 : !inten ? 2 : 3;
  const feels = ['fresh', 'warm', 'dark', 'soft'];
  const levels = ['soft', 'present', 'bold'];
  const perfumes = products.filter((p) => p.category === 'eau-de-parfum');
  let results = [];
  let layers = [];
  if (step === 3) {
    results = perfumes
      .map((p) => ({ p, s: (feel === 'any' ? 0 : characterOf(p).includes(feel) ? 2 : 0) + (inten === 'any' ? 0 : intensityOf(p) === inten ? 1 : 0) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 3)
      .map((x) => x.p);
    const off = Math.max(0, feels.indexOf(feel));
    layers = ['bakhoor', 'oud-maattar', 'concentrated-oils']
      .map((slug) => { const l = products.filter((p) => p.category === slug); return l.length ? { p: l[off % l.length], slug } : null; })
      .filter(Boolean);
  }
  const reset = () => { setFeel(null); setInten(null); };
  return (
    <section className={`fq ${standalone ? 'standalone' : ''}`} id="find">
      <div className="wrap fq-grid">
        <div className="fq-img"><Parallax speed={0.05}><Image src="/images/finder.jpg" alt="" fill sizes="(max-width:900px) 100vw, 38vw" /></Parallax></div>
        <div className="fq-panel">
          <Reveal><p className="label">{t.finder.kicker} · {t.finder.perfumesOnly}{step < 3 ? ` · ${t.finder.step} ${step}/2` : ''}</p></Reveal>
          <Headline className="h-xl" lines={t.finder.h} />
          {step === 1 && (
            <div key="s1" className="fq-step">
              <p className="fq-q">{t.finder.q1}</p>
              <ul className="fq-list">
                {feels.map((k, n) => <li key={k}><button onClick={() => setFeel(k)}><span className="n">0{n + 1}</span><span className="tx">{t.finder.feels[k]}</span><Arrow /></button></li>)}
                <li><button onClick={() => setFeel('any')}><span className="n">05</span><span className="tx">{t.finder.feels.any}</span><Arrow /></button></li>
              </ul>
            </div>
          )}
          {step === 2 && (
            <div key="s2" className="fq-step">
              <p className="fq-q">{t.finder.q2}</p>
              <ul className="fq-list">
                {levels.map((k, n) => <li key={k}><button onClick={() => setInten(k)}><span className="n">0{n + 1}</span><span className="tx">{t.finder.levels[k]}</span><Arrow /></button></li>)}
                <li><button onClick={() => setInten('any')}><span className="n">04</span><span className="tx">{t.finder.levels.any}</span><Arrow /></button></li>
              </ul>
              <button className="link" onClick={reset}>{t.finder.again}</button>
            </div>
          )}
          {step === 3 && (
            <div key="s3" className="fq-step">
              <p className="fq-q">{t.finder.results}</p>
              {results.length === 0 ? <p className="soon">{t.finder.none}</p> : (
                <ul className="fq-res">
                  {results.map((p) => (
                    <li key={p.id} style={wstyle(p)}>
                      <Link href={`/fragrance/${p.slug}`} className="fq-thumb">{p.image && <Image src={p.image} alt="" fill sizes="96px" />}</Link>
                      <span className="fq-info"><strong>{p.name}</strong><em>{L(p.line || '')}</em><span className="label">{p.variants ? `${t.home.from} ` : ''}{money(fromPrice(p))}</span></span>
                      <span className="fq-act"><Link href={`/fragrance/${p.slug}`} className="tlink">{t.finder.view}</Link><button className="pc-add" onClick={() => addItem(p, 1, p.variants?.[0])}>{t.home.add}</button></span>
                    </li>
                  ))}
                </ul>
              )}
              {layers.length > 0 && (
                <div className="fq-layer">
                  <p className="label">{t.finder.layerKicker}</p>
                  <h3 className="fq-layer-h">{t.finder.layerH}</h3>
                  <p className="fq-layer-sub">{t.finder.layerSub}</p>
                  <ul className="fq-res fq-res-sm">
                    {layers.map(({ p, slug }) => (
                      <li key={p.id} style={wstyle(p)}>
                        <Link href={`/fragrance/${p.slug}`} className="fq-thumb">{p.image && <Image src={p.image} alt="" fill sizes="72px" />}</Link>
                        <span className="fq-info"><span className="label">{L(catBySlug(slug).tag)}</span><strong>{p.name}</strong><span className="label">{p.variants ? `${t.home.from} ` : ''}{money(fromPrice(p))}</span></span>
                        <span className="fq-act"><button className="pc-add" onClick={() => addItem(p, 1, p.variants?.[0])}>{t.finder.layerAdd}</button></span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button className="link" onClick={reset}>{t.finder.again}</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* Fragrances index: products first, finder after */
function ProductRows({ list }) {
  const { L, money, t } = useApp();
  return (
    <ul className="index in-band">
      {list.map((p, i) => (
        <Reveal as="li" key={p.id}>
          <Link href={`/fragrance/${p.slug}`} className="index-row" style={{ '--ac': p.world?.accent }}>
            <span className="n">{p.no || String(i + 1).padStart(2, '0')}</span>
            <span className="nm"><strong>{p.name}</strong><em>{L(p.line || '')}</em></span>
            <span className="meta label">{L(p.mood || '')}<br />{p.price != null ? `${p.variants ? `${t.home.from} ` : ''}${money(fromPrice(p))}${!p.variants && p.size ? ` · ${p.size}` : ''}` : ''}</span>
            <span className="thumb">{p.image && <Image src={p.image} alt={productAlt(p, L)} fill sizes="(max-width:900px) 40vw, 22vw" />}</span>
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}

function RoomBand({ c, products, i }) {
  const { t, L } = useApp();
  const list = products.filter((p) => p.category === c.slug);
  return (
    <section className={`band band-${c.slug}`} style={wstyle(c)}>
      <div className="wrap band-in">
        <div className="band-head">
          <Reveal><p className="label">{String(i + 1).padStart(2, '0')} — {L(c.tag)} · {roomCount(t, list.length)}</p></Reveal>
          <Headline className="mega-sm" lines={[L(c.name)]} />
          <Lines className="copy" lines={L(c.intro).slice(0, c.slug === NICHE ? 1 : 3)} />
        </div>
        {list.length > 0 ? <ProductRows list={list} /> : <Reveal><p className="soon">{t.rooms.soon}</p></Reveal>}
        <Reveal><Link href={c.href} className="tlink">{L(c.cta)}<Arrow /></Link></Reveal>
      </div>
    </section>
  );
}

export function FragrancesView({ products, categories, query = '', family = null }) {
  useTone('dark');
  const { t, lang } = useApp();

  // Header search: show matching products instead of the editorial index
  if (query || family) {
    const ar = lang === 'ar';
    const famName = family ? (ar && family.name_ar ? family.name_ar : family.name) : '';
    return (
      <div className="page idx">
        <div className="wrap page-head sr-head">
          <p className="label">{family ? (ar ? '\u0639\u0627\u0626\u0644\u0629 \u0627\u0644\u0639\u0637\u0648\u0631' : 'Fragrance family') : (ar ? '\u0646\u062a\u0627\u0626\u062c \u0627\u0644\u0628\u062d\u062b' : 'Search results')}</p>
          <h1 className="h-xl">{family ? famName : <>{ar ? '\u00ab' : '\u201c'}{query}{ar ? '\u00bb' : '\u201d'}</>}</h1>
          <p className="copy">
            {products.length
              ? (ar ? `${products.length} \u0645\u0646\u062a\u062c` : `${products.length} product${products.length === 1 ? '' : 's'} found`)
              : (ar ? '\u0644\u0645 \u0646\u062c\u062f \u0623\u064a \u0645\u0646\u062a\u062c\u0627\u062a \u0645\u0637\u0627\u0628\u0642\u0629.' : 'Nothing matched your search. Try another word, or browse the collection.')}
          </p>
          {!products.length && <Link href="/shop" className="btn">{ar ? '\u062a\u0635\u0641\u062d \u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0629' : 'Browse all'}</Link>}
        </div>
        {products.length > 0 && (
          <div className="wrap sr-grid">
            {products.map((p, i) => <ProductCard key={p.id || p.slug} p={p} i={i % 4} />)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page idx">
      <div className="wrap page-head">
        <p className="label">{t.rooms.indexKicker}</p>
        <Headline as="h1" className="h-xl" lines={t.rooms.indexH} />
        <Lines className="copy" lines={t.rooms.indexLines} />
      </div>
      <RoomStrip categories={categories} products={products} />
      {categories.map((c, i) => <RoomBand key={c.slug} c={c} products={products} i={i} />)}
      <Finder products={products} categories={categories} />
    </div>
  );
}

/* ───────── A room (category page) ───────── */
const HERO = { 'eau-de-parfum': 'split', bakhoor: 'full', 'oud-maattar': 'split flip', 'concentrated-oils': 'center', sets: 'split flip', 'exclusive-creations': 'full' };

export function CategoryView({ category: c, products, categories = [] }) {
  useTone('dark');
  const { t, L, lang } = useApp();
  const [inten, setInten] = useState('all');
  const [avail, setAvail] = useState(false);
  const all = products.filter((p) => p.category === c.slug);
  const list = all.filter((p) => (inten === 'all' || intensityOf(p) === inten) && (!avail || p.availability !== 'soon'));
  const strip = (s) => String(s || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  const lines = [].concat((c.intro && L(c.intro)) || []).map(strip).filter(Boolean);
  const fullText = lines.join(' ');
  const long = fullText.length > 260;
  const leadText = long ? (fullText.slice(0, 240).replace(/\s+\S*$/, '') + '…') : fullText;
  const headline = strip([].concat((c.headline && L(c.headline)) || L(c.name) || []).join(' '));
  const entry = journal.find((j) => j.slug === c.journal);
  const others = categories.filter((x) => x.slug !== c.slug);
  return (
    <div className="cat">
      <section className="cat-head">
        <div className="cat-wrap">
          <p className="cat-kicker">{L(c.tag)} · {roomCount(t, all.length)}</p>
          <h1 className="cat-title">{headline}</h1>
          {leadText && <p className="cat-lead">{leadText}</p>}
          {long && (
            <details className="cat-read">
              <summary>{lang === 'ar' ? 'اقرأ المزيد' : 'Read more'}</summary>
              <p>{fullText}</p>
            </details>
          )}
        </div>
      </section>

      <section className="cat-bar">
        <div className="cat-wrap cat-bar-in">
          <span className="cat-count">{roomCount(t, list.length)}</span>
          {all.length > 2 && (
            <div className="cat-chips" role="group" aria-label={t.rooms.intensity}>
              {['all', 'soft', 'present', 'bold'].map((k) => <button key={k} type="button" className={inten === k ? 'on' : ''} onClick={() => setInten(k)}>{k === 'all' ? t.rooms.all : t.rooms[k]}</button>)}
              <button type="button" className={avail ? 'on' : ''} onClick={() => setAvail(!avail)}>{t.rooms.availableOnly}</button>
            </div>
          )}
        </div>
      </section>

      <section className="cat-grid-sec">
        <div className="cat-wrap">
          {all.length === 0 ? <p className="cat-empty">{t.rooms.soon}</p>
            : list.length === 0 ? <p className="cat-empty">{t.rooms.none}</p>
            : <div className="sh-grid">{list.map((p) => <ShopProductCard key={p.id || p.slug} product={p} />)}</div>}
        </div>
      </section>

      {(entry || others.length > 0) && (
        <section className="cat-more">
          <div className="cat-wrap">
            {entry && (
              <Link href={`/journal/${entry.slug}`} className="cat-journal">
                <span className="cat-kicker">{t.rooms.related}</span>
                <strong>{entry.title}</strong>
                <Icon n="arrow" size={18} />
              </Link>
            )}
            {others.length > 0 && (
              <div className="cat-others">
                {others.map((x) => <Link key={x.slug} href={x.href}>{L(x.menu || x.name)}</Link>)}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

/* ───────── Exclusive landing: quiet, minimal ───────── */
const XV = {
  en: {
    kicker: 'Limited editions',
    title: 'Exclusive',
    lead: 'Rare compositions, made in small numbers.',
    discover: 'Discover',
    introA: 'Not everything belongs to the collection.',
    introB: 'Some fragrances are made in small numbers, for the few who find them.',
    limited: 'Limited edition', pieces: (n) => `Edition of ${n}`,
    vat: 'Incl. VAT', reserve: 'Reserve', soldOut: 'Sold out',
    atelierKicker: 'The atelier', atelierH: 'Made slowly.',
    atelierP: 'Composed patiently, matured in small batches and released only when it is ready.',
    conKicker: 'By appointment', conH: 'Private appointments',
    conP: 'For personal advice, or to hear first of the next edition, speak with us.',
    wa: 'WhatsApp', contact: 'Contact',
    empty: 'The first pieces are still being finished. They will be shown here first.',
  },
  ar: {
    kicker: 'إصدارات محدودة',
    title: 'حصري',
    lead: 'تركيبات نادرة تُصنع بأعداد قليلة.',
    discover: 'اكتشف',
    introA: 'ليس كل شيء ينتمي إلى المجموعة.',
    introB: 'بعض العطور تُصنع بأعداد قليلة، لقلّة يعثرون عليها.',
    limited: 'إصدار محدود', pieces: (n) => `إصدار من ${n} قطعة`,
    vat: 'شامل الضريبة', reserve: 'احجز', soldOut: 'نفدت الكمية',
    atelierKicker: 'المشغل', atelierH: 'يُصنع بتأنٍّ.',
    atelierP: 'يُركَّب بصبر، ويُعتَّق على دفعات صغيرة، ولا يُطرح إلا حين يكتمل.',
    conKicker: 'بموعد مسبق', conH: 'مواعيد خاصة',
    conP: 'للاستشارة الشخصية، أو لتكون أول من يعلم بالإصدار القادم، تواصل معنا.',
    wa: 'واتساب', contact: 'تواصل معنا',
    empty: 'لا تزال القطع الأولى قيد الإنجاز، وستُعرض هنا أولاً.',
  },
};

function XvPiece({ p, i, x, isAr }) {
  const { L, money, addItem } = useApp();
  const img = p.image || p.primary_image;
  const alt2 = p.secondary_image || (Array.isArray(p.gallery) ? p.gallery[1] : null);
  const price = p.variants?.length ? Math.min(...p.variants.map((v) => Number(v.price))) : p.price;
  const edition = Number(p.edition_size) || 0;
  const stock = p.stock_quantity == null ? null : Number(p.stock_quantity);
  const limited = Number(p.is_limited_edition) === 1 || edition > 0;
  const soldOut = p.in_stock === false || stock === 0;
  const label = edition > 0 ? x.pieces(edition) : limited ? x.limited : null;
  const size = p.size_label || p.size;
  const name = isAr && p.name_ar ? p.name_ar : p.name;
  const href = `/fragrance/${p.slug}`;
  return (
    <Reveal as="article" className={`xv-piece ${i % 2 ? 'flip' : ''}`}>
      <Link href={href} className="xv-stage" aria-label={name}>
        {img && <Image src={img} alt={productAlt(p, L)} fill sizes="(max-width:1000px) 100vw, 50vw" className="xv-img a" />}
        {alt2 && <Image src={alt2} alt="" fill sizes="(max-width:1000px) 100vw, 50vw" className="xv-img b" />}
      </Link>
      <div className="xv-info">
        {label && <p className="xv-kicker">{label}</p>}
        <h2 className="xv-name"><Link href={href}>{name}</Link></h2>
        {p.line && <p className="xv-line">{L(p.line)}</p>}
        <p className="xv-meta">
          {size && <span>{size}</span>}
          {price != null && <span><strong>{money(price)}</strong> <small>{x.vat}</small></span>}
        </p>
        <div className="xv-actions">
          <button type="button" className="xv-btn" disabled={soldOut} onClick={() => addItem(p, 1, p.variants?.[0])}>{soldOut ? x.soldOut : x.reserve}</button>
          <Link href={href} className="xv-link">{x.discover}</Link>
        </div>
      </div>
    </Reveal>
  );
}

export function NicheView({ category: c, products, categories }) {
  useTone('dark');
  const { L, lang, settings } = useApp();
  const isAr = lang === 'ar';
  const x = XV[isAr ? 'ar' : 'en'];
  const list = products.filter((p) => p.category === c.slug);
  const others = (categories || []).filter((o) => o.slug !== c.slug);
  const wa = String(settings?.whatsapp_number || '').replace(/\D/g, '');
  const waHref = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(isAr ? 'مرحباً، أودّ ترتيب موعد خاص.' : 'Hello, I would like to arrange a private appointment.')}` : null;
  return (
    <div className="xv">
      <section className="xv-hero">
        <Image src="/images/exclusive/vault.jpg" alt="" fill priority sizes="100vw" className="xv-hero-img" />
        <span className="xv-hero-shade" aria-hidden="true" />
        <div className="xv-wrap xv-hero-in">
          <p className="xv-kicker">{x.kicker}</p>
          <h1 className="xv-title">{x.title}</h1>
          <p className="xv-hero-lead">{x.lead}</p>
          <a href="#xv-pieces" className="xv-link">{x.discover}</a>
        </div>
      </section>

      <section className="xv-intro">
        <Reveal className="xv-wrap xv-intro-in">
          <p>{x.introA}</p>
          <p className="soft">{x.introB}</p>
        </Reveal>
      </section>

      <section className="xv-pieces" id="xv-pieces">
        <div className="xv-wrap">
          {list.length === 0
            ? <p className="xv-empty">{x.empty}</p>
            : list.map((p, i) => <XvPiece key={p.id || p.slug} p={p} i={i} x={x} isAr={isAr} />)}
        </div>
      </section>

      <section className="xv-atelier">
        <figure className="xv-atelier-fig">
          <Image src="/images/exclusive/atelier.jpg" alt={isAr ? 'يدان تُنهيان زجاجة عطر في المشغل' : 'Hands finishing a perfume bottle in the atelier'} fill sizes="(max-width:1000px) 100vw, 50vw" />
        </figure>
        <Reveal className="xv-atelier-copy">
          <p className="xv-kicker">{x.atelierKicker}</p>
          <h2 className="xv-h2">{x.atelierH}</h2>
          <p className="xv-p">{x.atelierP}</p>
        </Reveal>
      </section>

      <section className="xv-concierge">
        <Reveal className="xv-wrap xv-concierge-in">
          <p className="xv-kicker">{x.conKicker}</p>
          <h2 className="xv-h2">{x.conH}</h2>
          <p className="xv-p">{x.conP}</p>
          <div className="xv-links">
            {waHref && <a href={waHref} className="xv-link" target="_blank" rel="noopener noreferrer">{x.wa}</a>}
            <Link href="/contact" className="xv-link">{x.contact}</Link>
          </div>
        </Reveal>
      </section>

      {others.length > 0 && (
        <section className="cat-more xv-others">
          <div className="cat-wrap">
            <div className="cat-others">
              {others.map((o) => <Link key={o.slug} href={o.href}>{L(o.menu || o.name)}</Link>)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

/* ───────── Cross-sell by relationship ───────── */
export function Continue({ product, products }) {
  const { L } = useApp();
  const c = catBySlug(product.category);
  if (!c) return null;
  const target = catBySlug(c.next) || c;
  const pick = products.find((p) => p.category === target.slug && p.id !== product.id);
  return (
    <section className="cont" style={wstyle(target)}>
      <div className="wrap">
        <p className="label">{L(c.nextLabel)}</p>
        <Link href={pick ? `/fragrance/${pick.slug}` : target.href} className="cont-link"><strong>{pick ? pick.name : L(target.name)}</strong><Arrow /></Link>
        {pick && <Link href={target.href} className="tlink">{L(target.cta)}<Arrow /></Link>}
      </div>
    </section>
  );
}

/* ───────── Product page for Bakhoor / Oud Ma'attar / Oils / Niche (adapts to the type) ───────── */
export function RoomProductView({ product, products }) {
  const { t, L } = useApp();
  const c = catBySlug(product.category) || {
    slug: product.category || 'perfumes',
    tag: { en: product.category || 'Fragrance', ar: product.category || 'عطر' },
    menu: { en: product.category || 'Fragrance', ar: product.category || 'عطر' },
    detailKeys: ['burn', 'atmosphere', 'character', 'usage'],
  };
  const niche = c?.slug === NICHE;
  useTone('dark');
  const [qty, setQty] = useState(1);
  const [vi, setVi] = useState(0);
  const variant = product.variants?.[vi];
  const price = variant ? variant.price : product.price;
  const buyable = price != null && product.availability !== 'soon';
  const { showBar, heroRef, ctaRef } = useStickyBar(product);
  const kicker = product.fragrance_family || `${niche ? t.rooms.niche.creationNo : L(c.tag)}${product.mood ? ` — ${L(product.mood)}` : ''}`;
  return (
    <div className="pd">
      <PdHero product={product} kicker={kicker} vi={vi} setVi={setVi} qty={qty} setQty={setQty} price={price} variant={variant} buyable={buyable} buyRef={ctaRef} heroRef={heroRef} />

      {niche && (
        <section className="pd-sec pd-impr">
          <div className="pd-wrap">
            <p className="pd-lead">{t.rooms.niche.pairA}</p>
            <p className="pd-lead strong">{t.rooms.niche.pairB}</p>
          </div>
        </section>
      )}
      {product.impression && (
        <section className="pd-sec pd-impr">
          <div className="pd-wrap">
            <p className="pd-kicker">{t.product.impression}</p>
            <p className="pd-lead">{L(product.impression)}</p>
          </div>
        </section>
      )}
      {product.story && <PdRow label={t.product.story}>{L(product.story).map((p, i) => <p key={i}>{p}</p>)}</PdRow>}
      {c.detailKeys.filter((k) => product.details?.[k]).map((k) => {
        const v = L(product.details[k]);
        return <PdRow key={k} label={t.rooms.detail[k]}>{(Array.isArray(v) ? v : [v]).map((p, i) => <p key={i}>{p}</p>)}</PdRow>;
      })}
      {product.notes && <PdNotes notes={product.notes} items={product.note_items} />}
      <PdWear wear={product.wear} />
      {(niche || product.availability === 'limited') && (
        <PdRow label={t.rooms.detail.availability}>
          <p>{product.availability === 'limited' ? t.rooms.availability.limited : t.rooms.availability[product.availability || 'available']}</p>
        </PdRow>
      )}
      <PdReviews product={product} />
      <PdRelated product={product} products={products} />
      {buyable && <PdStickyBar show={showBar} product={product} price={price} qty={qty} variant={variant} />}
    </div>
  );
}

/* ───────── Story page: one brand, many expressions ───────── */
export function StoryRooms({ categories }) {
  const { t, L } = useApp();
  return (
    <section className="sec ink story-rooms">
      <div className="wrap">
        <Headline className="mega up" lines={t.rooms.storyH} />
        <Lines className="copy big" lines={t.rooms.storyLines} />
        <ul className="sr-list">
          {categories.map((c, i) => (
            <Reveal as="li" key={c.slug} delay={(i % 3) * 60}>
              <Link href={c.href} className="sr-row" style={wstyle(c)}>
                <span className="n">0{i + 1}</span>
                <span className="sr-t"><strong>{L(c.tag)}</strong><em>{t.rooms.short[c.slug]}</em></span>
                <Arrow />
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

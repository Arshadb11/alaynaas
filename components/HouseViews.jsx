'use client';
import Link from 'next/link';
import Gallery, { galleryOf } from './Gallery';
import BuyPanel from './BuyPanel';
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
          {p.image && <Image src={p.image} alt="" fill sizes="(max-width:900px) 80vw, 24vw" />}
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
            <Link href="/fragrances/eau-de-parfum" className="tlink">{t.home.shopAll}<Arrow /></Link>
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
              {p.image && <Image src={p.image} alt="" fill sizes="(max-width:900px) 78vw, 30vw" />}
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
            <span className="thumb">{p.image && <Image src={p.image} alt="" fill sizes="(max-width:900px) 40vw, 22vw" />}</span>
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
          {!products.length && <Link href="/fragrances" className="btn">{ar ? '\u062a\u0635\u0641\u062d \u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0629' : 'Browse all'}</Link>}
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

export function CategoryView({ category: c, products, categories }) {
  const dark = isDark(c.world.bg);
  useTone(dark ? 'light' : 'dark');
  const { t, L, money } = useApp();
  const [inten, setInten] = useState('all');
  const [avail, setAvail] = useState(false);
  const all = products.filter((p) => p.category === c.slug);
  const list = all.filter((p) => (inten === 'all' || intensityOf(p) === inten) && (!avail || p.availability !== 'soon'));
  const lines = L(c.intro);
  const layout = HERO[c.slug] || 'split';
  const feat = all[0];
  const entry = journal.find((j) => j.slug === c.journal);
  const head = (
    <>
      <Reveal><p className="label">{L(c.tag)} · {roomCount(t, all.length)}</p></Reveal>
      <Headline as="h1" className="mega" lines={L(c.headline)} delay={150} />
      <Reveal delay={500}><p className="serif-i">{lines[0]}</p></Reveal>
    </>
  );
  return (
    <div className={`room room-${c.slug}`} style={wstyle(c)}>
      <section className={`rh rh-${layout}`}>
        {c.image && <div className="rh-img"><Image src={c.image} alt="" fill priority sizes={layout === 'full' ? '100vw' : '(max-width:900px) 100vw, 50vw'} /></div>}
        {layout === 'full' && <div className="rh-shade" />}
        <div className="rh-copy">{head}</div>
      </section>

      <section className="rp">
        <div className="wrap"><Lines className="copy big" lines={lines.slice(1)} /></div>
      </section>

      {feat && (
        <section className="rf">
          <div className="wrap rf-grid">
            <Link href={`/fragrance/${feat.slug}`} className="rf-img">{feat.image && <Image src={feat.image} alt="" fill sizes="(max-width:900px) 100vw, 50vw" />}</Link>
            <div className="rf-copy">
              <Reveal><p className="label">{t.rooms.featured}</p></Reveal>
              <Headline className="mega-sm" lines={[feat.name]} />
              <Reveal><p className="serif-i">{L(feat.line || '')}</p></Reveal>
              <Reveal><Link href={`/fragrance/${feat.slug}`} className="tlink">{t.discover.meet}<Arrow /></Link></Reveal>
            </div>
          </div>
        </section>
      )}

      <section className="rc">
        <div className="wrap">
          <Reveal><p className="label">{t.rooms.collection}</p></Reveal>
          {all.length > 2 && (
            <div className="chips" role="group" aria-label={t.rooms.intensity}>
              {['all', 'soft', 'present', 'bold'].map((k) => <button key={k} className={inten === k ? 'on' : ''} onClick={() => setInten(k)}>{k === 'all' ? t.rooms.all : t.rooms[k]}</button>)}
              <button className={avail ? 'on' : ''} onClick={() => setAvail(!avail)}>{t.rooms.availableOnly}</button>
            </div>
          )}
          {all.length === 0 ? <Reveal><p className="soon">{t.rooms.soon}</p></Reveal>
            : list.length === 0 ? <p className="soon">{t.rooms.none}</p>
            : <ProductRows list={list} />}
        </div>
      </section>

      {entry && (
        <section className="rj">
          <div className="wrap">
            <Reveal><p className="label">{t.rooms.related}</p></Reveal>
            <Reveal><Link href={`/journal/${entry.slug}`} className="rj-link"><strong>{entry.title}</strong><Arrow /></Link></Reveal>
          </div>
        </section>
      )}

      <Relations categories={categories} exclude={c.slug} />
    </div>
  );
}

/* ───────── Exclusive Creations landing ───────── */
export function NicheView({ category: c, products, categories }) {
  useTone('light');
  const { t, L } = useApp();
  const list = products.filter((p) => p.category === c.slug);
  const lines = L(c.intro);
  return (
    <div className="niche" style={wstyle(c)}>
      <section className="nz-open">
        <div className="wrap">
          <Reveal><p className="label">ALAYNAAS</p></Reveal>
          <Headline as="h1" className="mega" lines={L(c.headline)} delay={300} />
        </div>
        <span className="nz-scroll label">{t.rooms.niche.scroll}</span>
      </section>

      <section className="nz-text">
        <div className="wrap">
          <Lines className="copy big" lines={[lines[0], '', ...lines[1].split('. ').map((s, i, a) => (i < a.length - 1 ? `${s}.` : s)), '']} />
          <Reveal><p className="nz-line">{lines[2]}</p></Reveal>
          <Reveal><p className="label nz-tags">{t.rooms.niche.label}</p></Reveal>
        </div>
      </section>

      <section className="nz-list">
        <div className="wrap">
          {list.length === 0 ? (
            <Reveal><p className="serif-i nz-empty">{t.rooms.niche.empty}</p></Reveal>
          ) : list.map((p, i) => (
            <Reveal key={p.id} className={`nc ${i % 2 ? 'flip' : ''}`}>
              <Link href={`/fragrance/${p.slug}`} className="nc-link">
                {p.image && <span className="nc-img"><Image src={p.image} alt="" fill sizes="(max-width:900px) 100vw, 50vw" /></span>}
                <span className="nc-copy">
                  <span className="label">{t.rooms.niche.creationNo} {String(i + 1).padStart(2, '0')}</span>
                  <strong className="nc-name">{p.name}</strong>
                  <em>{L(p.line || '')}</em>
                  {p.availability === 'limited' && <span className="label">{t.rooms.niche.limited}</span>}
                  <span className="tlink">{t.rooms.niche.discover}<Arrow /></span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <Relations categories={categories} exclude={c.slug} />
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
  const { t, L, money, addItem } = useApp();
  const c = catBySlug(product.category) || {
    slug: product.category || 'perfumes',
    world: product.world || { bg: '#14100c', fg: '#eadfcf', accent: '#b9763a' },
    tag: { en: product.category || 'Fragrance', ar: product.category || 'عطر' },
    menu: { en: product.category || 'Fragrance', ar: product.category || 'عطر' },
    detailKeys: ['burn', 'atmosphere', 'character', 'usage'],
  };
  const w = product.world || c.world || { bg: '#14100c', fg: '#eadfcf', accent: '#b9763a' };
  const niche = c?.slug === NICHE;
  useTone(isDark(w.bg) ? 'light' : 'dark');
  const [qty, setQty] = useState(1);
  const [vi, setVi] = useState(0);
  const variant = product.variants?.[vi];
  const price = variant ? variant.price : product.price;
  const buyable = price != null && product.availability !== 'soon';
  return (
    <div className="fpage" style={{ '--bg': w.bg, '--fg': w.fg, '--ac': w.accent }}>
      <section className="fhero">
        <div className="fhero-gal"><Gallery images={galleryOf(product)} alt={product.name} /></div>
        <BuyPanel product={product} label={`${niche ? t.rooms.niche.creationNo : L(c.tag)}${product.mood ? ` — ${L(product.mood)}` : ''}`} vi={vi} setVi={setVi} qty={qty} setQty={setQty} price={price} variant={variant} buyable={buyable} />
      </section>

      {niche && (
        <section className="fsec center-text">
          <Reveal><p className="impression">{t.rooms.niche.pairA}</p></Reveal>
          <Reveal delay={200}><p className="impression strong">{t.rooms.niche.pairB}</p></Reveal>
        </section>
      )}
      {product.impression && (
        <section className="fsec center-text">
          <Reveal><p className="label">{t.product.impression}</p></Reveal>
          <Reveal delay={100}><p className="impression">{L(product.impression)}</p></Reveal>
        </section>
      )}
      {product.story && (
        <section className="fsec"><div className="wrap split-2">
          <Reveal><p className="label">{t.product.story}</p></Reveal>
          <div className="copy">{L(product.story).map((p, i) => <Reveal key={i} delay={i * 100}><p>{p}</p></Reveal>)}</div>
        </div></section>
      )}
      {c.detailKeys.filter((k) => product.details?.[k]).map((k) => {
        const v = L(product.details[k]);
        return (
          <section className="fsec" key={k}><div className="wrap split-2">
            <Reveal><p className="label">{t.rooms.detail[k]}</p></Reveal>
            <div className="copy">{(Array.isArray(v) ? v : [v]).map((p, i) => <Reveal key={i} delay={i * 100}><p>{p}</p></Reveal>)}</div>
          </div></section>
        );
      })}
      {product.notes && (
        <section className="fsec"><div className="wrap split-2">
          <Reveal><p className="label">{t.product.notes}</p></Reveal>
          <div className="notes3">
            {['top', 'heart', 'base'].filter((k) => product.notes[k]).map((k, i) => (
              <Reveal key={k} delay={i * 100}><span className="label">{t.product[k]}</span><ul>{product.notes[k].map((n) => <li key={n}>{n}</li>)}</ul></Reveal>
            ))}
          </div>
        </div></section>
      )}
      {product.wear?.length > 0 && (
        <section className="fsec"><div className="wrap split-2">
          <Reveal><p className="label">{t.product.wear}</p></Reveal>
          <ul className="wear">{product.wear.map((x, i) => <Reveal as="li" key={i} delay={i * 80}>{L(x)}</Reveal>)}</ul>
        </div></section>
      )}
      {(niche || product.availability === 'limited') && (
        <section className="fsec"><div className="wrap split-2">
          <Reveal><p className="label">{t.rooms.detail.availability}</p></Reveal>
          <div className="copy"><Reveal><p>{product.availability === 'limited' ? t.rooms.availability.limited : t.rooms.availability[product.availability || 'available']}</p></Reveal></div>
        </div></section>
      )}

      <Continue product={product} products={products} />
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

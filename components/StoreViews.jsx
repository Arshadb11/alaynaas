'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useApp, useTone } from './Providers';
import { Reveal, Headline, Lines, Parallax, useInView } from './Reveal';
import { Icon } from './Chrome';
import Gallery, { galleryOf } from './Gallery';
import BuyPanel from './BuyPanel';
import HeroSlider from './HeroSlider';
import { buildHeroSlides } from '@/lib/hero';
import { stages, materials, journal, discoverPrompts } from '@/lib/data';
import { Continue, RoomProductView, StoryRooms, Finder } from './HouseViews';
import { FamilyPanels, StorySplit, Signature } from './HomeSections';
import { DiscoverySets, Dakhoon, ConcentratedOils, ExclusiveCreations, FindCta, QuoteBand } from './ProductSections';

const Arrow = () => <span className="arr"><Icon n="arrow" size={18} /></span>;

/* ───────────── Discover (used on home and /discover) ───────────── */
export function Discover({ products, standalone = false }) {
  const { t, L, money } = useApp();
  const [pick, setPick] = useState(null);
  const result = pick ? products.find((p) => p.slug === discoverPrompts.find((d) => d.key === pick).result) : null;
  return (
    <section className={`discover ${standalone ? 'standalone' : ''}`} id="discover">
      <div className="wrap">
        <p className="label">{t.discover.kicker}</p>
        <Headline className="h-xl" lines={[t.discover.h]} />
        {!result ? (
          <>
            <p className="muted sub">{t.discover.sub}</p>
            <ul className="prompts">
              {discoverPrompts.map((d, i) => (
                <li key={d.key}>
                  <button onClick={() => setPick(d.key)}>
                    <span className="n">0{i + 1}</span><span className="tx">{L(d.text)}</span><Arrow />
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="result" key={result.slug} style={{ '--ac': result.world.accent }}>
            <div className="result-img"><Image src={result.image} alt="" fill sizes="(max-width:900px) 100vw, 40vw" /></div>
            <div className="result-copy">
              <p className="label">{t.discover.perhaps}</p>
              <h3 className="h-xl">{result.name}</h3>
              <p className="lead">{L(result.impression)}</p>
              <p className="label">{L(result.mood)} · {money(result.price)}</p>
              <div className="row-actions">
                <Link href={`/fragrance/${result.slug}`} className="btn">{t.discover.meet}<Arrow /></Link>
                <button className="link" onClick={() => setPick(null)}>{t.discover.again}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ───────────── Home ───────────── */
function Materials() {
  const { t } = useApp();
  const [m, setM] = useState(0);
  return (
    <section className="sec bone mt">
      <div className="wrap mt-grid">
        <div className="mt-view">
          <Image src="/images/materials.jpg" alt="" fill sizes="(max-width:900px) 100vw, 40vw" />
          <span className="mt-cap">{t.materials.cap}</span>
        </div>
        <div className="mt-copy">
          <Reveal><p className="label">{t.materials.kicker}</p></Reveal>
          <Headline className="h-xl" lines={[t.materials.h]} />
          <Reveal><p className="mt-sub">{t.materials.sub}</p></Reveal>
          <ul className="mt-acc">
            {materials.map(([n, d], i) => (
              <li key={n} className={i === m ? 'on' : ''}>
                <button onClick={() => setM(i === m ? -1 : i)} aria-expanded={i === m}>
                  <span className="n">{String(i + 1).padStart(2, '0')}</span><span className="k">{n}</span><Icon n={i === m ? 'minus' : 'plus'} size={16} />
                </button>
                <div className="mt-note"><div><span className="label">{t.materials.pick}</span><p>{d}</p></div></div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function HomeView({ products, allProducts = [], categories = [], families = [] }) {
  useTone('light');
  const { t, L, lang, settings } = useApp();
  const [stage, setStage] = useState(0);
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (touched || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setStage((s) => (s + 1) % stages.length), 4200);
    return () => clearInterval(id);
  }, [touched]);
  const ql = t.question.lines;

  return (
    <>
      {/* OPENING: a slider of the house's worlds */}
      <HeroSlider
        label={settings?.store_name || 'ALAYNAAS'}
        interval={Number(settings?.hero_interval) || 7}
        slides={
          buildHeroSlides(settings?.hero_slides, lang) ||
          [{ img: '/images/opening.jpg', kick: t.open.kicker, l1: t.open.l1, l2: t.open.l2, cta: t.open.shop, href: '#shop' }, ...(t.open.more || [])]
        }
      />

      {/* FAMILIES: scroll-driven category panels, driven by the catalog */}
      <FamilyPanels categories={categories} families={families} products={allProducts} />
      {/* PRODUCT TYPES: each driven by category slugs / the limited-edition flag */}
      <DiscoverySets products={allProducts} categories={categories} />
      {/* SIGNATURE COMPOSITIONS: draggable carousel */}
      <Signature products={allProducts.length ? allProducts : products} />
      <Dakhoon products={allProducts} categories={categories} />
      <ConcentratedOils products={allProducts} />
      <ExclusiveCreations products={allProducts} />

      {/* THE CRAFT */}
      <section className="sec bone craft">
        <div className="wrap">
          <Reveal><p className="label">{t.craft.kicker}</p></Reveal>
          <Headline className="h-xl" lines={t.craft.h} />
          <div className="craft-grid">
            <Reveal className="craft-media"><Parallax speed={0.08}><Image src="/images/craft.jpg" alt="" fill sizes="(max-width:900px) 100vw, 50vw" /></Parallax></Reveal>
            <div>
              <Lines className="copy" lines={t.craft.lines} />
              <ol className="stages" onMouseLeave={() => {}}>
                {stages.map((s, i) => (
                  <li key={i} className={i === stage ? 'on' : i < stage ? 'done' : ''}>
                    <button onClick={() => { setTouched(true); setStage(i); }} onMouseEnter={() => { setTouched(true); setStage(i); }} aria-expanded={i === stage}>
                      <span className="n">0{i + 1}</span><span className="k">{L(s.k)}</span>
                    </button>
                    <p>{L(s.t)}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* STORY, short quote, then the guide CTA */}
      <StorySplit />
      <QuoteBand />
      <FindCta />

      {/* JOURNAL */}
      <section className="sec bone">
        <div className="wrap">
          <div className="jrn-head"><div><Reveal><p className="label">{t.jrn.kicker}</p></Reveal><Headline className="h-xl" lines={[t.jrn.h]} /></div><Link href="/journal" className="tlink">{t.jrn.all}<Arrow /></Link></div>
          <div className="jrn-grid">
            <Reveal className="jrn-img"><Parallax speed={0.05}><Image src="/images/journal.jpg" alt="" fill sizes="(max-width:900px) 100vw, 40vw" /></Parallax></Reveal>
            <ul className="jrn-list">
              {journal.slice(0, 4).map((j, i) => (
                <Reveal as="li" key={j.slug} delay={i * 80}>
                  <Link href={`/journal/${j.slug}`}><span className="n">0{i + 1}</span><span className="tt">{j.title}</span><span className="ex">{j.excerpt}</span><Arrow /></Link>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FINAL */}
      <section className="fl">
        <div className="wrap fl-grid">
          <div className="fl-copy">
            <Headline as="h2" className="fl-h" lines={[t.final.h]} />
            <Lines className="copy" lines={t.final.lines} />
            <Reveal className="fl-actions"><Link href="/fragrances" className="btn">{t.home.shopAll}</Link><Link href="/discover" className="tlink">{t.finder.kicker}<Arrow /></Link></Reveal>
            <Reveal className="fl-sign"><span className="wm">{t.brand}</span><span className="label">{t.tagline}</span></Reveal>
          </div>
          <Reveal className="fl-img"><Parallax speed={0.05}><Image src="/images/perfume.jpg" alt="" fill sizes="(max-width:900px) 100vw, 40vw" /></Parallax></Reveal>
        </div>
      </section>
    </>
  );
}

/* ───────────── Single fragrance ───────────── */
export function FragranceView(props) {
  const p = props.product;
  const isEdp = !p?.category || ['eau-de-parfum', 'perfumes', 'concentrated-parfum'].includes(p.category);
  if (p && !isEdp) return <RoomProductView product={p} products={props.products || []} />;
  return <EdpView {...props} />;
}

function EdpView({ product, next, products = [] }) {
  const { t, L, money, addItem } = useApp();
  const dark = ['ember-noir', 'after-dark'].includes(product?.slug);
  useTone(dark ? 'light' : 'dark');
  const [qty, setQty] = useState(1);
  const [vi, setVi] = useState(0);
  const variant = product?.variants?.[vi];
  const price = variant ? variant.price : product?.price;
  const [showBar, setShowBar] = useState(false);
  const heroRef = useRef(null);
  const ctaRef = useRef(null);
  const [specRef, specSeen] = useInView();
  useEffect(() => {
    if (!heroRef.current || !ctaRef.current) return;
    let heroOut = false, ctaIn = false;
    const upd = () => setShowBar(heroOut && !ctaIn);
    const a = new IntersectionObserver(([e]) => { heroOut = !e.isIntersecting; upd(); });
    const b = new IntersectionObserver(([e]) => { ctaIn = e.isIntersecting; upd(); });
    a.observe(heroRef.current); b.observe(ctaRef.current);
    return () => { a.disconnect(); b.disconnect(); };
  }, [product]);

  if (!product) return <div className="page wrap empty-state big"><h1 className="h-xl">{t.product.notFound}</h1><Link className="btn" href="/fragrances">{t.cart.continue}</Link></div>;
  const w = product.world;
  return (
    <div className="fpage" style={{ '--bg': w.bg, '--fg': w.fg, '--ac': w.accent }}>
      <section className="fhero" ref={heroRef}>
        <div className="fhero-gal"><Gallery images={galleryOf(product)} alt={product.name} /></div>
        <BuyPanel product={product} label={`${product.no} — ${L(product.mood)}`} vi={vi} setVi={setVi} qty={qty} setQty={setQty} price={price} variant={variant} buyRef={ctaRef} />
      </section>

      <section className="fsec center-text">
        <Reveal><p className="label">{t.product.impression}</p></Reveal>
        <Reveal delay={100}><p className="impression">{L(product.impression)}</p></Reveal>
      </section>

      <section className="fsec">
        <div className="wrap split-2">
          <Reveal><p className="label">{t.product.story}</p></Reveal>
          <div className="copy">{L(product.story).map((p, i) => <Reveal key={i} delay={i * 100}><p>{p}</p></Reveal>)}</div>
        </div>
      </section>

      <section className="fsec">
        <div className="wrap split-2">
          <Reveal><p className="label">{t.product.character}</p></Reveal>
          <div className={`spectrum ${specSeen ? 'in' : ''}`} ref={specRef}>
            {product.spectrum.map(([a, b, v], i) => (
              <div className="spec" key={i} style={{ '--v': `${v}%`, '--d': `${i * 120}ms` }}>
                <span>{L(a)}</span><div className="track"><i /></div><span>{L(b)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="fsec">
        <div className="wrap split-2">
          <Reveal><p className="label">{t.product.notes}</p></Reveal>
          {product.notes ? (
            <div className="notes3">
              {['top', 'heart', 'base'].map((k, i) => (
                <Reveal key={k} delay={i * 100}><span className="label">{t.product[k]}</span><ul>{product.notes[k].map((n) => <li key={n}>{n}</li>)}</ul></Reveal>
              ))}
            </div>
          ) : <Reveal><p className="serif-i">{t.product.notesPending}</p></Reveal>}
        </div>
      </section>

      <section className="fsec">
        <div className="wrap">
          <Reveal><p className="label">{t.product.experience}</p></Reveal>
          <div className="exp">
            {['opening', 'heart', 'drydown'].map((k, i) => (
              <Reveal key={k} delay={i * 120} className="exp-step"><span className="n">0{i + 1}</span><h3>{t.product[k === 'heart' ? 'heartL' : k]}</h3><p>{L(product.experience[k])}</p></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="fsec">
        <div className="wrap split-2">
          <Reveal><p className="label">{t.product.wear}</p></Reveal>
          <ul className="wear">{product.wear.map((x, i) => <Reveal as="li" key={i} delay={i * 80}>{L(x)}</Reveal>)}</ul>
        </div>
      </section>

      <Continue product={product} products={products} />

      {next && (
        <Link href={`/fragrance/${next.slug}`} className="next-world" style={{ '--nbg': next.world.bg, '--nfg': next.world.fg }}>
          <span className="label">{t.product.next}</span><strong>{next.name}</strong><Arrow />
        </Link>
      )}

      <div className={`sticky-buy ${showBar ? 'show' : ''}`} aria-hidden={!showBar}>
        <span><strong>{product.name}</strong><span className="label">{money(price)}</span></span>
        <button className="btn btn-fill" tabIndex={showBar ? 0 : -1} onClick={() => addItem(product, qty, variant)}>{t.product.add}</button>
      </div>
    </div>
  );
}

/* ───────────── Story ───────────── */
const STORY_IMG = ['/images/question.jpg', '/images/notebook.jpg', '/images/workbench.jpg', '/images/materials.jpg', '/images/uae.jpg'];
export function StoryView({ categories = [] }) {
  useTone('light');
  const { t } = useApp();
  return (
    <div>
      <section className="sec ink story-open">
        <div className="wrap">
          <Reveal><p className="label light">{t.story.kicker}</p></Reveal>
          <Headline as="h1" className="mega up" lines={t.story.h} />
          <Lines className="copy big" lines={t.story.open} />
        </div>
      </section>
      <section className="sec bone story-body" id="inside">
        <div className="wrap">
          {t.story.sections.map(([h, p], i) => (
            <div className="story-row" key={h}>
              <Reveal><p className="label">0{i + 1}</p><h2 className="h-md">{h}</h2></Reveal>
              <Reveal delay={100}><p className="story-p">{p}</p>{STORY_IMG[i] && <div className="story-fig"><Image src={STORY_IMG[i]} alt="" fill sizes="(max-width:900px) 100vw, 50vw" /></div>}</Reveal>
            </div>
          ))}
          <Reveal className="story-close"><p className="serif-i">{t.story.close}</p><Link href="/fragrances" className="tlink">{t.nav.fragrances}<Arrow /></Link></Reveal>
        </div>
      </section>
      <StoryRooms categories={categories} />
    </div>
  );
}

/* ───────────── Journal ───────────── */
export function JournalView() {
  const { t } = useApp();
  return (
    <div className="page">
      <div className="wrap page-head">
        <p className="label">{t.jrn.kicker}</p>
        <Headline as="h1" className="mega" lines={[t.jrn.back]} />
        <p className="serif-i">{t.jrn.sub}</p>
      </div>
      <div className="wrap">
        <ul className="jrn-list big">
          {journal.map((j, i) => (
            <Reveal as="li" key={j.slug}>
              <Link href={`/journal/${j.slug}`}><span className="n">{String(i + 1).padStart(2, '0')}</span><span className="tt">{j.title}</span><span className="ex">{j.excerpt}</span><Arrow /></Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </div>
  );
}

const JOURNAL_IMG = ['/images/journal.jpg', '/images/notebook.jpg', '/images/workbench.jpg', '/images/materials.jpg', '/images/craft.jpg', '/images/story.jpg'];
export function JournalEntryView({ entry, next }) {
  const { t } = useApp();
  if (!entry) return <div className="page wrap empty-state big"><h1 className="h-xl">404</h1></div>;
  return (
    <article className="page">
      <div className="wrap entry">
        <Link href="/journal" className="label back">← {t.jrn.back}</Link>
        <Headline as="h1" className="h-xl" lines={[entry.title]} />
        <p className="serif-i">{entry.excerpt}</p>
        <div className="entry-fig"><Image src={JOURNAL_IMG[Math.max(0, journal.findIndex((j) => j.slug === entry.slug)) % JOURNAL_IMG.length]} alt="" fill priority sizes="(max-width:900px) 100vw, 900px" /></div>
        <div className="copy">{entry.body.map((p, i) => <Reveal key={i}><p>{p}</p></Reveal>)}</div>
        {next && <Link href={`/journal/${next.slug}`} className="tlink">{next.title}<Arrow /></Link>}
      </div>
    </article>
  );
}


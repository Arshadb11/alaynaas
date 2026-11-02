'use client';
import Link from '@/components/Link';
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
import { PdHero, PdRow, PdIntro, PdNotes, PdCharacter, PdVideo, PdFaq, PdComplete, PdRelated, PdNext, PdStickyBar, useStickyBar } from './ProductPage';
import { PdReviews } from './ProductReviews';
import { ProductJournal } from './JournalViews';
import { track } from '@/lib/track';
import { Continue, RoomProductView, StoryRooms, Finder } from './HouseViews';
import { FamilyPanels, StorySplit } from './HomeSections';
import { QuoteBand } from './ProductSections';
import { HomeReviews, DiscoverCta } from './HomeReviews';
import HomePromise from './HomePromise';
import {
  HouseMediums,
  ExclusiveCreationsFeatured,
  TheExplorations,
  CraftSection,
  FinalManifesto,
} from './HouseCuration';

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

export function HomeView({ products, allProducts = [], categories = [], families = [], reviews = null }) {
  useTone('light');
  const { lang, settings } = useApp();

  return (
    <>
      {/* OPENING: Hero slider */}
      <HeroSlider
        label={settings?.store_name || 'ALAYNAAS'}
        interval={Number(settings?.hero_interval) || 7}
        slides={
          buildHeroSlides(settings?.hero_slides, lang) ||
          [{ img: '/images/opening.jpg', kick: 'ALAYNAAS', l1: 'For those who carry', l2: 'the crown.', cta: 'Shop the collection', href: '#shop' }]
        }
      />

      {/* FAMILIES: scroll-driven olfactory family panels */}
      <FamilyPanels categories={categories} families={families} products={allProducts} />

      {/* 1. THE HOUSE MEDIUMS (Perfumes, Pure Oils, Bakhoor, Oud Ma'attar) */}
      <HouseMediums categories={categories} products={allProducts} />

      {/* DISCOVER YOUR SCENT: CTA to the quiet diagnostic */}
      <DiscoverCta />

      {/* 2. EXCLUSIVE CREATIONS (Private Reserve / Numbered Limited Editions) */}
      <ExclusiveCreationsFeatured products={allProducts} />

      {/* OUR PROMISE (editable in admin) */}
      <HomePromise />

      {/* CUSTOMER REVIEWS (approved in admin) */}
      <HomeReviews data={reviews} />

      {/* 3. THE EXPLORATIONS (Discovery Sets & Travel Sets) */}
      <TheExplorations />
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

function EdpView({ product, next, products = [], journal = [] }) {
  const { t, L, lang } = useApp();
  useTone('dark');
  const [qty, setQty] = useState(1);
  const [vi, setVi] = useState(0);
  const variant = product?.variants?.[vi];
  const price = variant ? variant.price : product?.price;
  const { showBar, heroRef, ctaRef } = useStickyBar(product);
  useEffect(() => { if (product) track('view_item', { value: product.price, items: [{ id: product.id, name: product.name, price: product.price }] }); }, [product?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!product) return <div className="page wrap empty-state big"><h1 className="h-xl">{t.product.notFound}</h1><Link className="btn" href="/shop">{t.cart.continue}</Link></div>;
  const kicker = product.fragrance_family || [product.category_name, product.mood ? L(product.mood) : ''].filter(Boolean).join(' · ');
  return (
    <div className="pd">
      <PdHero product={product} kicker={kicker} vi={vi} setVi={setVi} qty={qty} setQty={setQty} price={price} variant={variant} buyRef={ctaRef} heroRef={heroRef} />

      <PdIntro impression={product.impression} story={product.story} />

      <PdNotes notes={product.notes} items={product.note_items} />
      {!product.notes && <PdRow label={t.product.notes}><p>{t.product.notesPending}</p></PdRow>}

      <PdCharacter spectrum={product.spectrum} wear={product.wear} />
      <PdVideo video={product.video} product={product} />
      <PdReviews product={product} />
      <PdFaq />
      <PdComplete product={product} products={products} />
      <PdRelated product={product} products={products} />
      <ProductJournal entries={journal} />
      <PdNext next={next} />
      <PdStickyBar show={showBar} product={product} price={price} qty={qty} variant={variant} />
    </div>
  );
}

/* ───────────── Story ───────────── */
const STORY_IMG = [
  { src: '/images/story/01-fascination.jpg', alt: 'A hand holding a scent strip up to window light' },
  { src: '/images/story/04-materials.jpg', alt: 'Oud wood, frankincense, rose buds and saffron on linen' },
  { src: '/images/story/02-decision.jpg', alt: 'A hand pressing a wax seal on an envelope at a workbench' },
  { src: '/images/story/05-here.jpg', alt: 'Incense smoke rising from a burner on a desert dune at sunset' },
];

/* One chapter of the story: photograph + words, alternating sides */
function StoryChapter({ i, total, title, text, img }) {
  const [ref, seen] = useInView();
  return (
    <section className={`st-ch ${i % 2 ? 'rev' : ''} ${seen ? 'in' : ''}`} ref={ref}>
      <figure className="st-fig">
        {img && <Image src={img.src} alt={img.alt} fill sizes="(max-width:1000px) 100vw, 50vw" priority={i === 0} />}
      </figure>
      <div className="st-copy">
        <p className="st-eyebrow">{String(i + 1).padStart(2, '0')} <span>/ {String(total).padStart(2, '0')}</span></p>
        <h2 className="st-h2">{title}</h2>
        <p className="st-p">{text}</p>
      </div>
    </section>
  );
}

export function StoryView({ categories = [] }) {
  useTone('dark');
  const { t } = useApp();
  const sections = t.story.sections;
  return (
    <div className="st">
      {/* Opening */}
      <section className="st-hero">
        <div className="st-wrap">
          <p className="st-eyebrow">{t.story.kicker}</p>
          <h1 className="st-title">{[].concat(t.story.h).map((l) => <span key={l} className="st-tl">{l}</span>)}</h1>
          <div className="st-open">
            {t.story.open.map((line, i) => <p key={i}>{line}</p>)}
          </div>
        </div>
      </section>

      {/* Chapters, each with its own photograph */}
      {sections.map(([h, p], i) => (
        <StoryChapter key={h} i={i} total={sections.length} title={h} text={p} img={STORY_IMG[i]} />
      ))}

      <section className="st-close">
        <div className="st-wrap">
          {[].concat(t.story.close).map((line, i, a) => (
            <p key={i} className={`st-close-p ${i === 1 ? 'em' : ''} ${i === a.length - 2 ? 'brand' : ''} ${i === a.length - 1 ? 'tag' : ''}`}>{line}</p>
          ))}
          <Link href="/shop" className="st-link">{t.nav.fragrances}<Arrow /></Link>
        </div>
      </section>

      {/* The Craft: 5 Formulation & Maceration Stages */}
      <CraftSection />

      {/* Olfactory Quote */}
      <QuoteBand />

      {/* The Rooms */}
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


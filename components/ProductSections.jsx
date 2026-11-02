'use client';
/**
 * Product-type sections for the homepage. Each one is driven by a category slug
 * (editable in the admin panel) and falls back to a "coming soon" state with a CTA.
 *  - DiscoverySets      : category `discovery-sets`
 *  - Dakhoon            : categories `bakhoor` + `oud-maattar`
 *  - ConcentratedOils   : category `concentrated-oils`
 *  - ExclusiveCreations : products flagged Limited Edition (or category `exclusive-creations`)
 *  - FindCta / QuoteBand: short bands that link onward
 */
import Link from '@/components/Link';
import Image from 'next/image';
import { useApp } from './Providers';
import { Reveal, Headline } from './Reveal';

const TXT = {
  en: {
    dsK: 'Try before you commit', dsH: 'Discovery sets', dsSub: 'Small vials of our finest, gathered in one box. The easiest way to find your signature.',
    dkK: 'The Dakhoon', dkH: 'Bakhoor & Oud Ma\u2019attar', dkSub: 'Smoke, resin and oil for the home and the body.',
    bk: 'Bakhoors', om: 'Oud Ma\u2019attars',
    coK: 'Pure & lasting', coH: 'Concentrated oils', coSub: 'Alcohol-free attars that stay close to the skin for hours.',
    exK: 'Limited edition', exH: 'Exclusive creations', exSub: 'Small batches, numbered and never repeated.',
    edition: 'Edition of', from: 'From', view: 'View', all: 'View all', soon: 'Arriving soon',
    soonSub: 'This collection is being prepared. Leave us your email in the footer to hear first.',
    fcK: 'Not sure where to start?', fcH: 'Find your fragrance', fcSub: 'Answer a few questions and we will point you to the bottle that fits.', fcBtn: 'Start the guide',
    quote: '\u201CPerfume is the one thing you wear that others remember.\u201D',
  },
  ar: {
    dsK: 'جرّب قبل أن تقرر', dsH: 'مجموعات الاكتشاف', dsSub: 'عبوات صغيرة من أجمل عطورنا في علبة واحدة. أسهل طريق لإيجاد عطرك المميز.',
    dkK: 'الدخون', dkH: 'البخور ومعطرات العود', dkSub: 'دخان وراتنج وزيوت للبيت والجسد.',
    bk: 'البخور', om: 'معطرات العود',
    coK: 'نقية وتدوم', coH: 'الزيوت المركزة', coSub: 'عطور زيتية بلا كحول تبقى على البشرة لساعات.',
    exK: 'إصدار محدود', exH: 'إبداعات حصرية', exSub: 'دفعات صغيرة مرقّمة ولا تتكرر.',
    edition: 'إصدار من', from: 'من', view: 'عرض', all: 'عرض الكل', soon: 'قريباً',
    soonSub: 'نجهّز هذه المجموعة الآن. اترك بريدك في أسفل الصفحة لتكون أول من يعلم.',
    fcK: 'لست متأكداً من أين تبدأ؟', fcH: 'اعثر على عطرك', fcSub: 'أجب عن بضعة أسئلة وسنرشدك إلى العطر المناسب.', fcBtn: 'ابدأ الدليل',
    quote: '\u201Cالعطر هو الشيء الوحيد الذي ترتديه ويتذكره الآخرون.\u201D',
  },
};

const fromPrice = (p) => (p.variants ? Math.min(...p.variants.map((v) => v.price)) : p.price);
const byCat = (products, slug) => products.filter((p) => p.category === slug);
const catOf = (categories, slug) => categories.find((c) => c.slug === slug);

/** Shared hooks: language-aware name + translated bundle. */
function useBits() {
  const { lang, L, money } = useApp();
  const tx = TXT[lang] || TXT.en;
  const name = (p) => (lang === 'ar' && p.name_ar ? p.name_ar : p.name);
  return { lang, L, money, tx, name };
}

/** Tiny product card used by the row layouts. */
function Card({ p, b, dark }) {
  return (
    <Link href={`/fragrance/${p.slug}`} className={`pc ${dark ? 'pc-dark' : ''}`}>
      <span className="pc-img">{p.image && <Image src={p.image} alt={b.name(p)} fill sizes="(max-width:900px) 46vw, 22vw" />}</span>
      <span className="pc-name">{b.name(p)}</span>
      <span className="label pc-price">{p.variants ? `${b.tx.from} ` : ''}{b.money(fromPrice(p))}</span>
    </Link>
  );
}

/** Empty state shared by all sections. */
function Soon({ b, href, dark }) {
  return (
    <div className={`ps-soon ${dark ? 'ps-soon-dark' : ''}`}>
      <p className="ps-soon-t">{b.tx.soon}</p>
      <p className="ps-soon-s">{b.tx.soonSub}</p>
      <Link href={href} className="tlink">{b.tx.all}</Link>
    </div>
  );
}

/** Section header: kicker, headline, sub copy and a "view all" link. */
function Head({ k, h, sub, href, b, dark }) {
  return (
    <div className={`ps-head ${dark ? 'ps-head-dark' : ''}`}>
      <div>
        <Reveal><p className="label">{k}</p></Reveal>
        <Headline className="h-xl" lines={[h]} />
        <Reveal><p className="ps-sub">{sub}</p></Reveal>
      </div>
      <Link href={href} className="tlink">{b.tx.all}</Link>
    </div>
  );
}

/* Discovery sets: split layout (photo | bone panel), set list under the copy */
export function DiscoverySets({ products = [], categories = [] }) {
  const b = useBits();
  const slug = 'discovery-sets';
  const list = byCat(products, slug).slice(0, 4);
  const href = `/shop/${slug}`;
  const cat = catOf(categories, slug);
  return (
    <section className="ds" id="discovery-sets">
      <div className="ds-img">
        <Image src={cat?.image || '/images/discovery-set.jpg'} alt="" fill sizes="(max-width:900px) 100vw, 50vw" />
      </div>
      <div className="ds-panel">
        <Reveal><p className="label ds-k">{b.tx.dsK}</p></Reveal>
        <Headline className="ds-h" lines={[b.tx.dsH]} />
        <Reveal><p className="ds-p">{b.tx.dsSub}</p></Reveal>
        {list.length > 0 && (
          <ul className="ds-list">
            {list.map((p) => (
              <li key={p.id}>
                <Link href={`/fragrance/${p.slug}`}>
                  <span className="ds-n">{b.name(p)}</span>
                  <span className="label ds-pr">{b.tx.from} {b.money(fromPrice(p))}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link href={href} className="label ds-cta">{list.length ? b.tx.all : b.tx.soon}</Link>
      </div>
    </section>
  );
}

/* Dakhoon: two large tiles (Bakhoor, Oud Ma'attar) each with a few products */
export function Dakhoon({ products = [], categories = [] }) {
  const b = useBits();
  const tiles = [['bakhoor', b.tx.bk], ['oud-maattar', b.tx.om]];
  return (
    <section className="ps ps-dk" id="dakhoon">
      <div className="wrap">
        <Head k={b.tx.dkK} h={b.tx.dkH} sub={b.tx.dkSub} href="/shop/bakhoor" b={b} />
        <div className="ps-dk-grid">
          {tiles.map(([slug, title]) => {
            const list = byCat(products, slug).slice(0, 3);
            const cat = catOf(categories, slug);
            const label = cat ? (b.lang === 'ar' && cat.name_ar ? cat.name_ar : cat.name) : title;
            return (
              <div className="ps-dk-tile" key={slug}>
                <Link href={`/shop/${slug}`} className="ps-dk-top">
                  {cat?.image && <Image src={cat.image} alt="" fill sizes="(max-width:900px) 100vw, 50vw" />}
                  <span className="ps-dk-name">{label}</span>
                </Link>
                {list.length ? (
                  <div className="ps-dk-row">{list.map((p) => <Card key={p.id} p={p} b={b} />)}</div>
                ) : <Soon b={b} href={`/shop/${slug}`} />}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* Concentrated oils: dark band with a horizontal product row */
export function ConcentratedOils({ products = [] }) {
  const b = useBits();
  const slug = 'concentrated-oils';
  const list = byCat(products, slug).slice(0, 6);
  const href = `/shop/${slug}`;
  return (
    <section className="ps ps-co" id="concentrated-oils">
      <div className="wrap">
        <Head k={b.tx.coK} h={b.tx.coH} sub={b.tx.coSub} href={href} b={b} dark />
        {list.length ? (
          <div className="ps-co-row">{list.map((p) => <Card key={p.id} p={p} b={b} dark />)}</div>
        ) : <Soon b={b} href={href} dark />}
      </div>
    </section>
  );
}

/* Exclusive creations: full-bleed, limited edition products with edition numbers */
export function ExclusiveCreations({ products = [] }) {
  const b = useBits();
  const slug = 'exclusive-creations';
  const list = products.filter((p) => p.is_limited_edition || p.category === slug).slice(0, 3);
  const href = `/shop/${slug}`;
  return (
    <section className="ps ps-ex" id="exclusive-creations">
      <div className="wrap">
        <Head k={b.tx.exK} h={b.tx.exH} sub={b.tx.exSub} href={href} b={b} dark />
        {list.length ? (
          <div className="ps-ex-row">
            {list.map((p) => (
              <Link key={p.id} href={`/fragrance/${p.slug}`} className="ps-ex-card">
                <span className="ps-ex-img">{p.image && <Image src={p.image} alt={b.name(p)} fill sizes="(max-width:900px) 100vw, 33vw" />}</span>
                <span className="label ps-ex-ed">{p.edition_size ? `${b.tx.edition} ${p.edition_size}` : b.tx.exK}</span>
                <span className="ps-ex-name">{b.name(p)}</span>
                <span className="label pc-price">{p.variants ? `${b.tx.from} ` : ''}{b.money(fromPrice(p))}</span>
              </Link>
            ))}
          </div>
        ) : <Soon b={b} href={href} dark />}
      </div>
    </section>
  );
}

/* "Find your fragrance": just a call to action, the guide lives on /discover */
export function FindCta() {
  const b = useBits();
  return (
    <section className="ps ps-fc">
      <div className="wrap">
        <Reveal><p className="label">{b.tx.fcK}</p></Reveal>
        <Headline className="h-xl" lines={[b.tx.fcH]} />
        <Reveal><p className="ps-sub">{b.tx.fcSub}</p></Reveal>
        <Link href="/discover" className="btn">{b.tx.fcBtn}</Link>
      </div>
    </section>
  );
}

/* Short pull-quote that replaces the long "question" block on the homepage */
export function QuoteBand() {
  const b = useBits();
  return (
    <section className="ps ps-qb">
      <div className="wrap"><Reveal as="blockquote">{b.tx.quote}</Reveal></div>
    </section>
  );
}

/* ───────────── Collections: one minimal row of category tiles (used while the catalogue is small) ───────────── */
const COLLECTIONS = [
  { slug: 'discovery-sets', img: '/images/discovery-set.jpg', en: 'Discovery sets', ar: 'مجموعات الاكتشاف', ben: 'Small vials, one box', bar: 'عبوات صغيرة في علبة واحدة' },
  { slug: 'bakhoor', img: '/images/cat-bakhoor.jpg', en: 'Bakhoor', ar: 'البخور', ben: 'Smoke and resin for the home', bar: 'دخان وراتنج للبيت' },
  { slug: 'oud-maattar', img: '/images/cat-oud-maattar.jpg', en: 'Oud Ma\u2019attar', ar: 'معطرات العود', ben: 'Oud and oil for the body', bar: 'عود وزيوت للجسد' },
  { slug: 'concentrated-oils', img: '/images/cat-oils.jpg', en: 'Concentrated oils', ar: 'الزيوت المركزة', ben: 'Pure, alcohol-free, lasting', bar: 'نقية وبلا كحول وتدوم' },
  { slug: 'exclusive-creations', img: '/images/cat-exclusive.jpg', en: 'Exclusive creations', ar: 'إبداعات حصرية', ben: 'Limited editions, numbered', bar: 'إصدارات محدودة مرقّمة', limited: true },
];
const COL_TXT = {
  en: { k: 'The collections', h: 'Beyond the perfume', soon: 'Coming soon', discover: 'Discover', n: (c) => `${c} ${c === 1 ? 'fragrance' : 'fragrances'}` },
  ar: { k: 'المجموعات', h: 'أبعد من العطر', soon: 'قريباً', discover: 'اكتشف', n: (c) => `${c} عطر` },
};

export function Collections({ products = [], categories = [] }) {
  const { lang } = useApp();
  const x = COL_TXT[lang] || COL_TXT.en;
  return (
    <section className="cl" id="collections">
      <div className="wrap">
        <Reveal><p className="label">{x.k}</p></Reveal>
        <Headline className="h-xl" lines={[x.h]} />
        <div className="cl-grid">
          {COLLECTIONS.map((c) => {
            const count = products.filter((p) => p.category === c.slug || (c.limited && p.is_limited_edition)).length;
            const cat = catOf(categories, c.slug);
            const name = lang === 'ar' ? (cat?.name_ar || c.ar) : (cat?.name || c.en);
            return (
              <Link key={c.slug} href={`/shop/${c.slug}`} className="cl-tile">
                <span className="cl-img"><Image src={cat?.image || c.img} alt="" fill sizes="(max-width:900px) 50vw, 20vw" /></span>
                <span className="cl-name">{name}</span>
                <span className="cl-ben">{lang === 'ar' ? c.bar : c.ben}</span>
                <span className="label cl-tag">{count ? x.n(count) : x.soon}</span>
                <span className="label cl-go">{x.discover}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
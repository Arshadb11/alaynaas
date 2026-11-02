'use client';
import Link from '@/components/Link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useApp } from './Providers';
import { Reveal, Headline, Lines, Parallax } from './Reveal';
import { Icon } from './Chrome';
import { stages } from '@/lib/data';

const Arrow = () => (
  <span className="arr" aria-hidden="true">
    <Icon n="arrow" size={16} />
  </span>
);

/* ─────────────────────────────────────────────────────────────
   1. THE HOUSE MEDIUMS (4 Disciplines: Perfumes, Oils, Bakhoor, Oud)
   ───────────────────────────────────────────────────────────── */
const MEDIUMS = [
  {
    slug: 'eau-de-parfum',
    href: '/shop/eau-de-parfum',
    no: '01',
    img: '/images/story.jpg',
    en: {
      title: 'Eaux de Parfum',
      tagline: 'Signature Scent · 100ml & 10ml',
      desc: 'Composed for presence and enduring memory. Four distinctive worlds worn directly on skin and silk.',
      cta: 'Explore Perfumes',
    },
    ar: {
      title: 'العطور الفاخرة',
      tagline: 'العطور الأيقونية · 100 مل و10 مل',
      desc: 'تراكيب صُممت لتدوم وتترك أثراً لا يُنسى. أربعة عوالم عطرية تلامس البشرة والحرير.',
      cta: 'استكشف العطور',
    },
  },
  {
    slug: 'concentrated-oils',
    href: '/shop/concentrated-oils',
    no: '02',
    img: '/images/materials.jpg',
    en: {
      title: 'Pure Concentrated Oils',
      tagline: 'Alcohol-Free · Direct on Skin',
      desc: 'Intimate, concentrated attars that stay close to the pulse points, unfolding slowly over hours.',
      cta: 'Explore Pure Oils',
    },
    ar: {
      title: 'الزيوت العطرية المركزة',
      tagline: 'دهن نقي خالي من الكحول',
      desc: 'زيوت عطرية حميمية مركزة تدوم طويلاً على أماكن النبض وتفوح بهدوء على مدار اليوم.',
      cta: 'استكشف الزيوت',
    },
  },
  {
    slug: 'bakhoor',
    href: '/shop/bakhoor',
    no: '03',
    img: '/images/cat-bakhoor.jpg',
    en: {
      title: 'Handcrafted Bakhoor',
      tagline: 'Atmospheric Ritual · Scented Wood',
      desc: 'Artisanal incense formulated to transform a space. Smoke, warming woods, and resinous comfort.',
      cta: 'Explore Bakhoor',
    },
    ar: {
      title: 'البخور الحرفي',
      tagline: 'طقس عطري للمكان · أخشاب معطرة',
      desc: 'بخور حرفي فاخر صُمم ليملأ المكان بالسكينة والدفء بنفحات الراتنجات والأخشاب الثمينة.',
      cta: 'استكشف البخور',
    },
  },
  {
    slug: 'oud-maattar',
    href: '/shop/oud-maattar',
    no: '04',
    img: '/images/oud-maattar.jpg',
    en: {
      title: 'Oud Ma’attar',
      tagline: 'Aged Agarwood · Precious Essences',
      desc: 'Hand-selected agarwood chips steeped in rare oils. An ancient heritage seen with contemporary restraint.',
      cta: 'Explore Oud Ma’attar',
    },
    ar: {
      title: 'معطرات العود',
      tagline: 'رقائق عود معتقة · زيوت نادرة',
      desc: 'رقائق عود طبيعية مغمورة في أندر الزيوت العطرية، لطقوس الضيافة والتطيب الرفيع.',
      cta: 'استكشف معطرات العود',
    },
  },
];

export function HouseMediums({ categories = [] }) {
  const { lang, settings } = useApp();
  const isAr = lang === 'ar';
  const cfg = settings?.house_disciplines && typeof settings.house_disciplines === 'object' ? settings.house_disciplines : null;
  const pick = (o, field) => (o?.[`${field}_${lang}`] || o?.[`${field}_en`] || '').trim();

  // Admin-managed cards (Storefront > House Disciplines). Falls back to the built-in set until configured.
  const cards = cfg
    ? (cfg.items || [])
        .filter((it) => it && it.active !== false)
        .map((it) => {
          const cat = categories.find((c) => c.slug === it.category_slug);
          if (!cat) return null;
          const name = isAr ? (cat.name_ar || cat.name) : cat.name;
          const title = pick(it, 'title') || name;
          return {
            key: it.category_slug,
            href: it.href || `/shop/${cat.slug}`,
            img: it.img || cat.image || '/images/story.jpg',
            tagline: pick(it, 'tagline'),
            title,
            desc: pick(it, 'desc') || (typeof cat.description === 'string' ? cat.description : ''),
            cta: pick(it, 'cta') || (isAr ? 'استكشف' : 'Explore'),
          };
        })
        .filter(Boolean)
    : MEDIUMS.map((m) => {
        const copy = isAr ? m.ar : m.en;
        const cat = categories.find((c) => c.slug === m.slug);
        return { key: m.slug, href: m.href, img: cat?.image || m.img, ...copy };
      });

  if (cfg && cards.length === 0) return null;

  const kicker = (cfg && pick(cfg, 'kicker')) || (isAr ? 'أشكال العطر وفنونه' : 'Disciplines of Scent');
  const heading = (cfg && pick(cfg, 'heading')) || (isAr ? 'تعبيرات الدار العطرية' : 'The House Disciplines');
  const sub = (cfg && pick(cfg, 'sub')) || (isAr
    ? 'العطر لا ينحصر في زجاجة واحدة. من ملامسة الجسد إلى إشعال المكان، كل وسيط يحمل طقسه وحضوره الخاص.'
    : 'Fragrance exists across different mediums. From intimate skin contact to atmospheric spaces, each carries its own ritual.');

  return (
    <section className="hm-sec" aria-labelledby="house-mediums-title">
      <div className="wrap">
        <header className="hm-header">
          <Reveal>
            <p className="label">{kicker}</p>
          </Reveal>
          <Headline as="h2" id="house-mediums-title" className="h-xl" lines={[heading]} />
          <Reveal delay={100}>
            <p className="hm-sub muted">{sub}</p>
          </Reveal>
        </header>

        <div className="hm-grid">
          {cards.map((m, i) => (
            <Reveal key={m.key} delay={i * 80} className="hm-card-wrap">
              <Link href={m.href} className="hm-card">
                <div className="hm-media">
                  <Image
                    src={m.img}
                    alt={m.title}
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="hm-img"
                  />
                  <span className="hm-num label">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div className="hm-body">
                  {m.tagline && <p className="hm-tagline label">{m.tagline}</p>}
                  <h3 className="hm-title">{m.title}</h3>
                  {m.desc && <p className="hm-desc">{m.desc}</p>}
                  <span className="hm-cta label">
                    {m.cta} <Arrow />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   2. EXCLUSIVE CREATIONS (Private Reserve / Numbered Limited Editions)
   ───────────────────────────────────────────────────────────── */
export function ExclusiveCreationsFeatured({ products = [] }) {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  const exclusiveCount = products.filter(
    (p) => p.category === 'exclusive-creations' || p.is_limited_edition
  ).length;

  return (
    <section className="xc-sec" aria-label="Exclusive Creations Spotlight">
      <div className="wrap">
        <div className="xc-card">
          <div className="xc-copy">
            <Reveal>
              <p className="label xc-kicker">
                {isAr ? 'الإصدار الخاص · نادر بالتصميم' : 'Private Reserve · Rare by Design'}
              </p>
            </Reveal>
            <Headline
              as="h2"
              className="mega-sm xc-headline"
              lines={isAr ? ['إبداعات حصرية', 'خارج المجموعة.'] : ['Exclusive Creations', 'Beyond the Collection.']}
            />
            <Reveal delay={80}>
              <p className="xc-desc">
                {isAr
                  ? 'تركيبات حصرية لم تُصمم لتكون جزءاً من الإنتاج الدائم. تجارب جريئة تُسكب بأعداد محدودة جداً وتُرقّم كل زجاجة يدوياً لمن يبحثون عن الفرادة المطلقة.'
                  : 'Formulas conceived outside the permanent collection. Produced in strictly finite batches, poured into heavy obsidian flacons, and hand-numbered for those who seek the uncommon.'}
              </p>
            </Reveal>

            <Reveal delay={140}>
              <div className="xc-meta-row">
                <span className="label xc-badge">
                  {isAr ? 'إصدار محدود · ١٥٠ زجاجة' : 'Edition Limitée · 150 Flacons'}
                </span>
                <span className="label xc-badge-sub">
                  {isAr ? 'زجاجات مرقمة يدوياً' : 'Hand-numbered bottles'}
                </span>
              </div>
            </Reveal>

            <Reveal delay={180}>
              <div className="xc-actions">
                <Link href="/exclusive-creations" className="btn btn-gold">
                  {isAr ? 'ادخل إلى المجموعة الحصرية' : 'Enter Exclusive Creations'}
                </Link>
                <Link href="/exclusive-creations" className="tlink xc-tlink">
                  {isAr ? 'اكتشف الفلسفة' : 'View the Private Reserve'} <Arrow />
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="xc-media">
            <Parallax speed={0.04}>
              <Image
                src="/images/exclusive.jpg"
                alt="Exclusive Creations Alaynaas Flacon"
                fill
                sizes="(max-width: 900px) 100vw, 50vw"
                className="xc-img"
              />
            </Parallax>
            <div className="xc-overlay" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   3. THE EXPLORATIONS (Discovery Sets & Travel Sets)
   ───────────────────────────────────────────────────────────── */
export function TheExplorations() {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  return (
    <section className="exp-sec" aria-labelledby="explorations-title">
      <div className="wrap">
        <header className="exp-header">
          <Reveal>
            <p className="label">{isAr ? 'صيغ الاستكشاف والتنقل' : 'Exploration & Movement'}</p>
          </Reveal>
          <Headline
            as="h2"
            id="explorations-title"
            className="h-xl"
            lines={isAr ? ['عش مع العطر أولاً.'] : ['Live with a scent before you choose it.']}
          />
        </header>

        <div className="exp-grid">
          {/* Panel A: Discovery Sets */}
          <Reveal delay={0} className="exp-col">
            <Link href="/shop/sets" className="exp-tile">
              <div className="exp-media">
                <Image
                  src="/images/discovery-set.jpg"
                  alt="Alaynaas Discovery Set"
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  className="exp-img"
                />
                <span className="exp-tag label">
                  {isAr ? '٥ عطور × ٥ مل' : '5 Flacons × 5ml'}
                </span>
              </div>
              <div className="exp-content">
                <p className="label exp-kicker">
                  {isAr ? 'خزانة الاكتشاف العطري' : 'The Olfactory Wardrobe'}
                </p>
                <h3 className="exp-h">
                  {isAr ? 'مجموعات الاكتشاف' : 'The Discovery Set'}
                </h3>
                <p className="exp-p">
                  {isAr
                    ? 'صندوق كتاني فاخر يضم خمس عبوات مصغرة. تجربة كاملة تتيح لك معايشة التطور العطري على بشرتك لأيام قبل اقتناء الزجاجة الكاملة.'
                    : 'A curated coffret of five miniature vials nestled in an embossed linen box. Experience the full evolution on skin before committing to a full bottle.'}
                </p>
                <span className="exp-link label">
                  {isAr ? 'استكشف مجموعات الاكتشاف' : 'Explore Discovery Sets'} <Arrow />
                </span>
              </div>
            </Link>
          </Reveal>

          {/* Panel B: Travel Sets */}
          <Reveal delay={120} className="exp-col">
            <Link href="/shop/sets" className="exp-tile">
              <div className="exp-media">
                <Image
                  src="/images/travel-set.jpg"
                  alt="Alaynaas Travel Set"
                  fill
                  sizes="(max-width: 900px) 100vw, 50vw"
                  className="exp-img"
                />
                <span className="exp-tag label">
                  {isAr ? '٣ عبوات × ١٠ مل' : '3 Flacons × 10ml'}
                </span>
              </div>
              <div className="exp-content">
                <p className="label exp-kicker">
                  {isAr ? 'المرسم العطري المحمول' : 'The Portable Atelier'}
                </p>
                <h3 className="exp-h">
                  {isAr ? 'مجموعات السفر' : 'The Travel Coffrets'}
                </h3>
                <p className="exp-p">
                  {isAr
                    ? 'ثلاث عبوات سعة ١٠ مل مصحوبة بعبوة معدنية مدمجة وغطاء جلدي إيطالي أنيق، صُممت لترافقك في حلك وترحالك بأناقة وسهولة.'
                    : 'Three 10ml flacons housed in a fluted pocket atomizer and stitched leather case. Thoughtfully proportioned for carry-on luggage and daily movement.'}
                </p>
                <span className="exp-link label">
                  {isAr ? 'استكشف مجموعات السفر' : 'Explore Travel Sets'} <Arrow />
                </span>
              </div>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   4. CRAFT SECTION (For /story page)
   ───────────────────────────────────────────────────────────── */
export function CraftSection() {
  const { t, L } = useApp();
  const [stage, setStage] = useState(0);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (touched || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setStage((s) => (s + 1) % stages.length), 4200);
    return () => clearInterval(id);
  }, [touched]);

  return (
    <section className="sec bone craft" id="craft">
      <div className="wrap">
        <Reveal><p className="label">{t.craft.kicker}</p></Reveal>
        <Headline className="h-xl" lines={t.craft.h} />
        <div className="craft-grid">
          <Reveal className="craft-media">
            <Parallax speed={0.08}>
              <Image src="/images/craft.jpg" alt="Artisanal craftsmanship" fill sizes="(max-width:900px) 100vw, 50vw" />
            </Parallax>
          </Reveal>
          <div>
            <Lines className="copy" lines={t.craft.lines} />
            <ol className="stages" onMouseLeave={() => {}}>
              {stages.map((s, i) => (
                <li key={i} className={i === stage ? 'on' : i < stage ? 'done' : ''}>
                  <button
                    onClick={() => { setTouched(true); setStage(i); }}
                    onMouseEnter={() => { setTouched(true); setStage(i); }}
                    aria-expanded={i === stage}
                  >
                    <span className="n">0{i + 1}</span>
                    <span className="k">{L(s.k)}</span>
                  </button>
                  <p>{L(s.t)}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   5. FINAL MANIFESTO (For /story page)
   ───────────────────────────────────────────────────────────── */
export function FinalManifesto() {
  const { t } = useApp();

  return (
    <section className="fl" aria-label="Brand Manifesto">
      <div className="wrap fl-grid">
        <div className="fl-copy">
          <Headline as="h2" className="fl-h" lines={[t.final.h]} />
          <Lines className="copy" lines={t.final.lines} />
          <Reveal className="fl-actions">
            <Link href="/shop" className="btn">{t.home.shopAll}</Link>
            <Link href="/discover" className="tlink">{t.finder.kicker}<Arrow /></Link>
          </Reveal>
          <Reveal className="fl-sign">
            <span className="wm">{t.brand}</span>
            <span className="label">{t.tagline}</span>
          </Reveal>
        </div>
        <Reveal className="fl-img">
          <Parallax speed={0.05}>
            <Image src="/images/story.jpg" alt="Alaynaas Flacon" fill sizes="(max-width:900px) 100vw, 40vw" />
          </Parallax>
        </Reveal>
      </div>
    </section>
  );
}

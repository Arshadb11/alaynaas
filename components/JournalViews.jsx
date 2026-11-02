'use client';
import Link from '@/components/Link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useApp } from './Providers';
import { Icon } from './Chrome';
import { parseBlocks, inline } from './PolicyPage';
import { productAlt } from '@/lib/alt';

const readMins = (len) => Math.max(1, Math.round((Number(len) || 0) / 900));

function useJ() {
  const { lang } = useApp();
  const ar = lang === 'ar';
  const pick = (o, k) => (ar && o[`${k}_ar`]) || o[`${k}_en`] || '';
  const date = (d) => {
    try { return new Date(d).toLocaleDateString(ar ? 'ar-AE' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return ''; }
  };
  const mins = (n) => (ar ? `${n} د قراءة` : `${n} min read`);
  return { ar, pick, date, mins };
}

function Cover({ src, alt = '', sizes, priority }) {
  return <Image src={src || '/images/journal.jpg'} alt={alt} fill sizes={sizes} priority={priority} />;
}

function Card({ e, j }) {
  return (
    <Link href={`/journal/${e.slug}`} className="jn-card">
      <span className="jn-card-img"><Cover src={e.cover_image} sizes="(max-width:700px) 100vw, (max-width:1100px) 50vw, 400px" /></span>
      <span className="jn-meta">
        {j.pick(e, 'category') && <b>{j.pick(e, 'category')}</b>}
        <i>{j.date(e.published_at)}</i>
      </span>
      <h3>{j.pick(e, 'title')}</h3>
      <p>{j.pick(e, 'excerpt')}</p>
      <span className="jn-more">{j.ar ? 'اقرأ المقال' : 'Read the article'} <Icon n="arrow" size={14} /></span>
    </Link>
  );
}

function ShopStory({ products }) {
  const { money, L, lang } = useApp();
  const ar = lang === 'ar';
  if (!products.length) return null;
  return (
    <section className="jn-shop-sec">
      <div className="jn-wrap">
        <p className="jn-kicker">{ar ? 'تسوّق القصة' : 'Shop the story'}</p>
        <div className="jn-shop">
          {products.map((p) => (
            <Link key={p.slug} href={`/fragrance/${p.slug}`} className="jn-shop-card">
              <span className="jn-shop-img">{p.image && <Image src={p.image} alt={productAlt(p, L)} fill sizes="(max-width:700px) 50vw, 260px" />}</span>
              <strong>{(ar && p.name_ar) || p.name}</strong>
              <span>{money(p.price)}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/** "From the Journal" strip used on product pages (internal links to articles). */
export function ProductJournal({ entries = [] }) {
  const j = useJ();
  if (!entries.length) return null;
  return (
    <section className="jn-more-sec pd-journal">
      <div className="jn-wrap">
        <p className="jn-kicker">{j.ar ? 'من اليوميات' : 'From the Journal'}</p>
        <div className="jn-grid three">{entries.map((e) => <Card key={e.slug} e={e} j={j} />)}</div>
      </div>
    </section>
  );
}

/* ───────── /journal ───────── */
export function JournalIndex({ entries = [] }) {
  const j = useJ();
  const [cat, setCat] = useState('all');
  const cats = useMemo(() => {
    const seen = new Map();
    entries.forEach((e) => { const c = j.pick(e, 'category'); if (c) seen.set(e.category_en || c, c); });
    return [...seen.entries()];
  }, [entries, j.ar]); // eslint-disable-line react-hooks/exhaustive-deps

  const featured = entries.find((e) => e.is_featured) || null;
  const rest = entries.filter((e) => e !== featured && (cat === 'all' || (e.category_en || j.pick(e, 'category')) === cat));

  return (
    <div className="jn">
      <header className="jn-head">
        <div className="jn-wrap">
          <p className="jn-kicker">{j.ar ? 'اليوميات' : 'The Journal'}</p>
          <h1>{j.ar ? 'ملاحظات من خلف الكواليس' : 'Notes from the making'}</h1>
          <p className="jn-lead">{j.ar
            ? 'مقالات قصيرة عن المواد والتجارب وقصص العطور، نكتبها لنشارككم كيف يُصنع عطر ألينّاس.'
            : 'Short, honest articles about materials, experiments and the stories behind each fragrance: how an ALAYNAAS perfume is really made.'}</p>
        </div>
      </header>

      <div className="jn-wrap">
        {featured && (
          <Link href={`/journal/${featured.slug}`} className="jn-feat">
            <span className="jn-feat-img"><Cover src={featured.cover_image} sizes="(max-width:900px) 100vw, 55vw" priority /></span>
            <span className="jn-feat-txt">
              <span className="jn-meta"><b>{j.ar ? 'مقال مميّز' : 'Featured'}</b><i>{j.date(featured.published_at)} · {j.mins(readMins(featured.len))}</i></span>
              <h2>{j.pick(featured, 'title')}</h2>
              <p>{j.pick(featured, 'excerpt')}</p>
              <span className="jn-more">{j.ar ? 'اقرأ المقال' : 'Read the article'} <Icon n="arrow" size={14} /></span>
            </span>
          </Link>
        )}

        {cats.length > 1 && (
          <div className="jn-chips" role="tablist" aria-label={j.ar ? 'التصنيفات' : 'Topics'}>
            <button type="button" className={cat === 'all' ? 'on' : ''} onClick={() => setCat('all')}>{j.ar ? 'الكل' : 'All'}</button>
            {cats.map(([k, label]) => <button type="button" key={k} className={cat === k ? 'on' : ''} onClick={() => setCat(k)}>{label}</button>)}
          </div>
        )}

        {rest.length > 0 ? (
          <div className="jn-grid">{rest.map((e) => <Card key={e.slug} e={e} j={j} />)}</div>
        ) : !featured && (
          <p className="jn-empty">{j.ar ? 'لا توجد مقالات بعد.' : 'New articles are on the way.'}</p>
        )}
      </div>
    </div>
  );
}

/* ───────── /journal/[slug] ───────── */
export function JournalArticle({ entry, more = [], products = [] }) {
  const j = useJ();
  if (!entry) return <div className="jn"><div className="jn-wrap"><p className="jn-empty">404</p></div></div>;
  const body = j.pick(entry, 'content');
  const blocks = parseBlocks(body);
  const mins = readMins(body.length);
  let firstP = true;
  return (
    <article className="jn jn-art">
      <header className="jn-art-head">
        <div className="jn-narrow">
          <Link href="/journal" className="jn-back">{j.ar ? 'اليوميات' : 'The Journal'}</Link>
          <p className="jn-meta">
            {j.pick(entry, 'category') && <b>{j.pick(entry, 'category')}</b>}
            <i>{j.date(entry.published_at)} · {j.mins(mins)}</i>
          </p>
          <h1>{j.pick(entry, 'title')}</h1>
          {j.pick(entry, 'excerpt') && <p className="jn-lead">{j.pick(entry, 'excerpt')}</p>}
        </div>
      </header>

      <figure className="jn-art-cover"><Cover src={entry.cover_image} priority sizes="(max-width:1200px) 100vw, 1200px" /></figure>

      <div className="jn-narrow jn-body">
        {blocks.map((b, i) => {
          if (b.type === 'h') return <h2 key={i}>{b.text}</h2>;
          if (b.type === 'p') {
            const cls = firstP ? 'first' : undefined;
            firstP = false;
            return <p key={i} className={cls}>{inline(b.text, `p${i}`)}</p>;
          }
          const Tag = b.type;
          return <Tag key={i}>{b.items.map((it, k) => <li key={k}>{inline(it, `l${i}-${k}`)}</li>)}</Tag>;
        })}
        <div className="jn-sign">
          <span>{j.ar ? 'ألينّاس' : 'ALAYNAAS'}</span>
          <Link href="/shop">{j.ar ? 'تسوّق العطور' : 'Shop the fragrances'} <Icon n="arrow" size={14} /></Link>
        </div>
      </div>

      <ShopStory products={products} />

      {more.length > 0 && (
        <section className="jn-more-sec">
          <div className="jn-wrap">
            <p className="jn-kicker">{j.ar ? 'تابع القراءة' : 'Keep reading'}</p>
            <div className="jn-grid three">{more.map((e) => <Card key={e.slug} e={e} j={j} />)}</div>
          </div>
        </section>
      )}
    </article>
  );
}

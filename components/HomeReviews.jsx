'use client';
import Link from '@/components/Link';
import { useRef } from 'react';
import { useApp } from './Providers';
import { Reveal } from './Reveal';
import { Icon } from './Chrome';

const STAR = 'M12 2.5l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17.3 5.9 20.9l1.5-6.8L2.2 9.5l6.9-.7z';

function Stars({ value, size = 15 }) {
  return (
    <span className="hr-stars" role="img" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} viewBox="0 0 24 24" width={size} height={size} className={n <= Math.round(value) ? 'on' : ''} aria-hidden="true"><path d={STAR} /></svg>
      ))}
    </span>
  );
}

/* ───────── Customer reviews (approved in Admin > Reviews) ───────── */
export function HomeReviews({ data }) {
  const { lang } = useApp();
  const isAr = lang === 'ar';
  const track = useRef(null);
  const list = data?.reviews || [];
  const sum = data?.summary || { count: 0, average: 0 };
  const scroll = (d) => {
    const el = track.current;
    if (el) el.scrollBy({ left: d * (el.clientWidth * 0.8) * (isAr ? -1 : 1), behavior: 'smooth' });
  };
  const fmt = (d) => { try { return new Date(d).toLocaleDateString(isAr ? 'ar-AE' : 'en-GB', { month: 'long', year: 'numeric' }); } catch { return ''; } };

  return (
    <section className="hr" id="reviews" aria-labelledby="hr-title">
      <div className="hr-wrap">
        <Reveal>
          <div className="hr-head">
            <div>
              <p className="hr-kicker">{isAr ? 'آراء عملائنا' : 'Customer reviews'}</p>
              <h2 className="hr-title" id="hr-title">{isAr ? 'ما يقوله من ارتدوه' : 'In their own words'}</h2>
            </div>
            {sum.count > 0 && (
              <div className="hr-score">
                <strong>{Number(sum.average).toFixed(1)}</strong>
                <div>
                  <Stars value={sum.average} size={16} />
                  <span>{isAr ? `${sum.count} تقييم موثّق` : `${sum.count} verified review${sum.count === 1 ? '' : 's'}`}</span>
                </div>
              </div>
            )}
          </div>
        </Reveal>

        {list.length > 0 ? (
          <>
            <div className="hr-track" ref={track}>
              {list.map((r) => (
                <figure className="hr-card" key={r.id}>
                  <Stars value={r.rating} />
                  {r.title && <h3>{r.title}</h3>}
                  <blockquote>{r.body}</blockquote>
                  <figcaption>
                    <b>{r.name}</b>
                    <span>{fmt(r.created_at)}</span>
                    <Link href={`/fragrance/${r.product_slug}`}>{r.product_name}</Link>
                  </figcaption>
                </figure>
              ))}
            </div>
            {list.length > 2 && (
              <div className="hr-ctl">
                <button type="button" className="prev" onClick={() => scroll(-1)} aria-label={isAr ? 'السابق' : 'Previous'}><Icon n="chev" size={16} /></button>
                <button type="button" className="next" onClick={() => scroll(1)} aria-label={isAr ? 'التالي' : 'Next'}><Icon n="chev" size={16} /></button>
              </div>
            )}
          </>
        ) : (
          <div className="hr-empty">
            <p>{isAr ? 'كن أول من يشاركنا تجربته مع عطر من عطورنا.' : 'Be the first to share how a fragrance wore on you.'}</p>
            <Link href="/shop" className="hr-btn">{isAr ? 'تسوّق العطور' : 'Shop the collection'}</Link>
          </div>
        )}
      </div>
    </section>
  );
}

/* ───────── Discover your scent CTA ───────── */
export function DiscoverCta() {
  const { lang } = useApp();
  const isAr = lang === 'ar';
  const steps = isAr
    ? [['١', 'أجب عن ٣ أسئلة بسيطة'], ['٢', 'نرشّح لك العطور الأقرب إليك'], ['٣', 'اطلب عطرك بثقة']]
    : [['1', 'Answer 3 quick questions'], ['2', 'See the fragrances that fit you'], ['3', 'Order with confidence']];
  return (
    <section className="dc" aria-labelledby="dc-title">
      <div className="dc-card">
        <p className="dc-kicker">{isAr ? 'اكتشف عطرك' : 'Discover your scent'}</p>
        <h2 className="dc-title" id="dc-title">{isAr ? 'لا تعرف أي عطر يناسبك؟' : 'Not sure which fragrance is yours?'}</h2>
        <p className="dc-sub">{isAr ? 'أجب عن بضعة أسئلة سريعة، وسنرشّح لك العطور الأنسب لذوقك في أقل من دقيقة.' : 'Answer a few quick questions and we will suggest the fragrances that suit your taste, in under a minute.'}</p>
        <ol className="dc-steps">
          {steps.map(([n, s]) => <li key={n}><b>{n}</b><span>{s}</span></li>)}
        </ol>
        <Link href="/discover" className="dc-btn">{isAr ? 'ابدأ الآن' : 'Find my fragrance'} <Icon n="arrow" size={16} /></Link>
      </div>
    </section>
  );
}

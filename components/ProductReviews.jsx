'use client';
import { useEffect, useState } from 'react';
import { useApp } from './Providers';
import { getProductReviews, submitProductReview } from '@/lib/api';

/**
 * Product reviews: approved reviews + summary, and a form. New reviews are held for admin approval.
 */

const TXT = {
  en: {
    kicker: 'Reviews', title: 'What customers say',
    none: 'No reviews yet. Be the first to share your experience.',
    based: (n) => `Based on ${n} review${n === 1 ? '' : 's'}`,
    write: 'Write a review', close: 'Close',
    rating: 'Your rating', name: 'Name', email: 'Email (never shown)', headline: 'Title (optional)', body: 'Your review',
    send: 'Submit review', sending: 'Sending…',
    thanks: 'Thank you. Your review has been received and will appear once approved.',
    errRating: 'Please choose a rating.', errName: 'Please enter your name.', errEmail: 'Please enter a valid email.',
    errBody: 'Please write at least 10 characters.', errGeneric: 'Could not submit your review. Please try again.',
    stars: (n) => `${n} out of 5`,
  },
  ar: {
    kicker: 'التقييمات', title: 'آراء العملاء',
    none: 'لا توجد تقييمات بعد. كن أول من يشارك تجربته.',
    based: (n) => `بناءً على ${n} تقييم`,
    write: 'اكتب تقييمًا', close: 'إغلاق',
    rating: 'تقييمك', name: 'الاسم', email: 'البريد الإلكتروني (لن يظهر)', headline: 'العنوان (اختياري)', body: 'تقييمك',
    send: 'إرسال التقييم', sending: 'جارٍ الإرسال…',
    thanks: 'شكرًا لك. تم استلام تقييمك وسيظهر بعد الموافقة عليه.',
    errRating: 'يُرجى اختيار التقييم.', errName: 'يُرجى إدخال اسمك.', errEmail: 'يُرجى إدخال بريد إلكتروني صحيح.',
    errBody: 'يُرجى كتابة 10 أحرف على الأقل.', errGeneric: 'تعذّر إرسال التقييم. حاول مرة أخرى.',
    stars: (n) => `${n} من 5`,
  },
};

function Stars({ value, label }) {
  return (
    <span className="rv-stars" role="img" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} viewBox="0 0 24 24" width="15" height="15" className={n <= Math.round(value) ? 'on' : ''} aria-hidden="true">
          <path d="M12 2.5l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17.3 5.9 20.9l1.5-6.8L2.2 9.5l6.9-.7z" />
        </svg>
      ))}
    </span>
  );
}

export function PdReviews({ product }) {
  const { lang } = useApp();
  const x = TXT[lang === 'ar' ? 'ar' : 'en'];
  const slug = product?.slug;
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ rating: 0, name: '', email: '', title: '', body: '', website: '' });
  const [state, setState] = useState({ busy: false, error: '', done: false });

  useEffect(() => {
    let alive = true;
    if (slug) getProductReviews(slug).then((d) => alive && setData(d));
    return () => { alive = false; };
  }, [slug]);

  if (!slug) return null;
  const summary = data?.summary || { count: 0, average: 0, distribution: {} };
  const reviews = data?.reviews || [];
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const err =
      !form.rating ? x.errRating
        : form.name.trim().length < 2 ? x.errName
          : !/^\S+@\S+\.\S+$/.test(form.email.trim()) ? x.errEmail
            : form.body.trim().length < 10 ? x.errBody : '';
    if (err) return setState({ busy: false, error: err, done: false });
    setState({ busy: true, error: '', done: false });
    try {
      await submitProductReview(slug, { ...form, rating: Number(form.rating) });
      setState({ busy: false, error: '', done: true });
      setForm({ rating: 0, name: '', email: '', title: '', body: '', website: '' });
      setOpen(false);
    } catch (ex) {
      setState({ busy: false, error: ex?.message && !/status \d+/.test(ex.message) ? ex.message : x.errGeneric, done: false });
    }
  };

  const fmt = (d) => {
    const dt = new Date(d);
    return Number.isNaN(dt.getTime()) ? '' : dt.toLocaleDateString(lang === 'ar' ? 'ar-AE' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <section className="pd-sec pd-reviews" id="reviews" aria-labelledby="rv-title">
      <div className="pd-wrap">
        <p className="pd-kicker">{x.kicker}</p>
        <div className="rv-top">
          <h2 className="pd-h2" id="rv-title">{x.title}</h2>
          {summary.count > 0 && (
            <div className="rv-sum">
              <strong>{summary.average.toFixed(1)}</strong>
              <div className="rv-sum-mid">
                <Stars value={summary.average} label={x.stars(summary.average)} />
                <span>{x.based(summary.count)}</span>
              </div>
              <ul className="rv-dist" aria-hidden="true">
                {[5, 4, 3, 2, 1].map((n) => (
                  <li key={n}><b>{n}</b><i><u style={{ width: `${Math.round(((summary.distribution?.[n] || 0) / summary.count) * 100)}%` }} /></i></li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="rv-grid">
          <div className="rv-list">
            {data && reviews.length === 0 && <p className="rv-none">{x.none}</p>}
            {reviews.map((r) => (
              <article className="rv-item" key={r.id}>
                <div className="rv-item-head">
                  <Stars value={r.rating} label={x.stars(r.rating)} />
                  <span className="rv-date">{fmt(r.created_at)}</span>
                </div>
                {r.title && <h3>{r.title}</h3>}
                <p>{r.body}</p>
                <span className="rv-by">{r.name}</span>
              </article>
            ))}
          </div>

          <div className="rv-side">
            {state.done && <p className="rv-ok" role="status">{x.thanks}</p>}
            {!open ? (
              <button type="button" className="rv-btn" onClick={() => { setOpen(true); setState((s) => ({ ...s, done: false })); }}>{x.write}</button>
            ) : (
              <form className="rv-form" onSubmit={submit} noValidate>
                <fieldset className="rv-rate">
                  <legend>{x.rating}</legend>
                  <div>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button type="button" key={n} aria-label={x.stars(n)} aria-pressed={form.rating === n}
                        className={n <= form.rating ? 'on' : ''} onClick={() => setForm((f) => ({ ...f, rating: n }))}>
                        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M12 2.5l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17.3 5.9 20.9l1.5-6.8L2.2 9.5l6.9-.7z" /></svg>
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label><span>{x.name}</span><input value={form.name} onChange={set('name')} maxLength={100} autoComplete="name" /></label>
                <label><span>{x.email}</span><input type="email" value={form.email} onChange={set('email')} maxLength={150} autoComplete="email" /></label>
                <label><span>{x.headline}</span><input value={form.title} onChange={set('title')} maxLength={150} /></label>
                <label><span>{x.body}</span><textarea rows={5} value={form.body} onChange={set('body')} maxLength={3000} /></label>
                {/* honeypot: hidden from people, bots fill it */}
                <input className="rv-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={set('website')} name="website" />
                {state.error && <p className="rv-err" role="alert">{state.error}</p>}
                <div className="rv-actions">
                  <button type="submit" className="rv-btn" disabled={state.busy}>{state.busy ? x.sending : x.send}</button>
                  <button type="button" className="rv-link" onClick={() => setOpen(false)}>{x.close}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';
import Image from 'next/image';
import Link from '@/components/Link';
import { useState } from 'react';
import { useApp } from './Providers';
import { Icon } from './Chrome';
import { submitContact } from '@/lib/api';
import { CORP } from '@/lib/corporate';

const EMPTY = { company: '', name: '', email: '', phone: '', qty: '', occasion: '', date: '', message: '', website: '' };
const FOR_IMG = ['/images/exclusive.jpg', '/images/bakhoor.jpg', '/images/discovery-set.jpg', '/images/uae.jpg'];
const OFF_IC = ['check', 'check', 'check', 'check'];

export function CorporateView() {
  const { lang, settings = {} } = useApp();
  const c = CORP[lang === 'ar' ? 'ar' : 'en'];
  const wa = String(settings.whatsapp_number || '').replace(/[^0-9]/g, '');
  const email = settings.support_email || '';
  const phone = settings.support_phone || '';

  const [f, setF] = useState(EMPTY);
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setState('sending'); setError('');
    const message = [
      `[Corporate order enquiry]`,
      `Company: ${f.company}`,
      `Quantity: ${f.qty || '-'}`,
      `Occasion: ${f.occasion || '-'}`,
      `Needed by: ${f.date || '-'}`,
      '',
      f.message,
    ].join('\n');
    try {
      await submitContact({ name: f.name, email: f.email, phone: f.phone, subject: `Corporate order: ${f.company}`, message, website: f.website });
      setState('sent'); setF(EMPTY);
    } catch (err) {
      setError(err?.message || c.f.err); setState('error');
    }
  }

  const toForm = (e) => { e.preventDefault(); document.getElementById('co-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  return (
    <div className="co">
      {/* HERO */}
      <header className="co-hero">
        <Image src="/images/travel-set.jpg" alt="" fill priority sizes="100vw" className="co-hero-img" />
        <div className="co-hero-veil" />
        <div className="co-wrap co-hero-in">
          <nav className="co-bc" aria-label="Breadcrumb">
            <Link href="/">{c.bcHome}</Link><span aria-hidden="true">/</span><span>{c.bc}</span>
          </nav>
          <p className="co-kicker">{c.kicker}</p>
          <h1>{c.h1a}<br /><em>{c.h1b}</em></h1>
          <p className="co-lead">{c.lead}</p>
          <div className="co-cta">
            <a href="#co-form" className="co-btn co-btn-gold" onClick={toForm}>{c.cta}</a>
            <Link href="/shop" className="co-btn co-btn-ghost">{c.cta2}</Link>
          </div>
        </div>
      </header>

      {/* STATS */}
      <section className="co-stats" aria-label="Highlights">
        <div className="co-wrap co-stats-grid">
          {c.stats.map(([n, l]) => (
            <div key={l}><strong dir="ltr">{n}</strong><span>{l}</span></div>
          ))}
        </div>
      </section>

      {/* WHO */}
      <section className="co-sec">
        <div className="co-wrap">
          <div className="co-head"><p className="co-kicker dk">{c.forKicker}</p><h2>{c.forH}</h2></div>
          <div className="co-for">
            {c.forItems.map(([t, d], i) => (
              <article className="co-for-card" key={t}>
                <div className="co-for-img"><Image src={FOR_IMG[i]} alt={`${t} - ${c.svcName}`} fill sizes="(max-width:680px) 100vw, (max-width:1000px) 50vw, 25vw" /></div>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* OFFER */}
      <section className="co-sec co-sec-alt">
        <div className="co-wrap co-split">
          <div className="co-split-img">
            <Image src="/images/craft.jpg" alt={c.svcName} fill sizes="(max-width:1000px) 100vw, 50vw" />
          </div>
          <div>
            <div className="co-head left"><p className="co-kicker dk">{c.offKicker}</p><h2>{c.offH}</h2></div>
            <ul className="co-off">
              {c.offItems.map(([t, d], i) => (
                <li key={t}>
                  <span className="co-ic"><Icon n={OFF_IC[i]} size={16} /></span>
                  <div><h3>{t}</h3><p>{d}</p></div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* HOW */}
      <section className="co-sec co-dark">
        <div className="co-wrap">
          <div className="co-head"><p className="co-kicker">{c.howKicker}</p><h2>{c.howH}</h2></div>
          <ol className="co-steps">
            {c.steps.map(([t, d], i) => (
              <li key={t}><span dir="ltr">{String(i + 1).padStart(2, '0')}</span><h3>{t}</h3><p>{d}</p></li>
            ))}
          </ol>
        </div>
      </section>

      {/* WHY */}
      <section className="co-sec">
        <div className="co-wrap co-split rev">
          <div>
            <div className="co-head left"><p className="co-kicker dk">{c.whyKicker}</p><h2>{c.whyH}</h2></div>
            <ul className="co-why">
              {c.why.map((w) => <li key={w}><span className="co-tick"><Icon n="check" size={14} /></span>{w}</li>)}
            </ul>
          </div>
          <div className="co-split-img">
            <Image src="/images/materials.jpg" alt={`${c.whyH} - ${c.svcName}`} fill sizes="(max-width:1000px) 100vw, 50vw" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="co-sec co-sec-alt">
        <div className="co-wrap co-narrow">
          <div className="co-head"><p className="co-kicker dk">{c.faqKicker}</p><h2>{c.faqH}</h2></div>
          <div className="co-faq">
            {c.faq.map(([q, a]) => (
              <details key={q}><summary>{q}</summary><p>{a}</p></details>
            ))}
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="co-sec co-form-sec" id="co-form">
        <div className="co-wrap co-form-grid">
          <div className="co-form-copy">
            <p className="co-kicker dk">{c.formKicker}</p>
            <h2>{c.formH}</h2>
            <p>{c.formText}</p>
            <div className="co-direct">
              <small>{c.direct}</small>
              {email && <a href={`mailto:${email}`}><Icon n="mail" size={16} />{email}</a>}
              {phone && <a href={`tel:${phone.replace(/\s/g, '')}`} dir="ltr"><Icon n="phone" size={16} />{phone}</a>}
              {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" dir="ltr"><Icon n="chat" size={16} />WhatsApp</a>}
            </div>
          </div>
          <div className="co-form">
            {state === 'sent' ? (
              <div className="ct-done">
                <span className="ct-tick"><Icon n="check" size={26} /></span>
                <p>{c.f.done}</p>
                <button type="button" className="btn" onClick={() => setState('idle')}>{c.f.again}</button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <div className="ct-row">
                  <label>{c.f.company}<input className="inp" required value={f.company} onChange={set('company')} maxLength={120} /></label>
                  <label>{c.f.name}<input className="inp" required value={f.name} onChange={set('name')} maxLength={120} /></label>
                </div>
                <div className="ct-row">
                  <label>{c.f.email}<input type="email" className="inp" required value={f.email} onChange={set('email')} maxLength={160} dir="ltr" /></label>
                  <label>{c.f.phone}<input className="inp" required value={f.phone} onChange={set('phone')} maxLength={40} dir="ltr" /></label>
                </div>
                <div className="ct-row">
                  <label>{c.f.qty}
                    <span className="ck-select"><select className="inp" required value={f.qty} onChange={set('qty')}>
                      <option value="">{c.f.pick}</option>{c.qtyOpts.map((o) => <option key={o}>{o}</option>)}
                    </select></span>
                  </label>
                  <label>{c.f.occasion}
                    <span className="ck-select"><select className="inp" required value={f.occasion} onChange={set('occasion')}>
                      <option value="">{c.f.pick}</option>{c.occOpts.map((o) => <option key={o}>{o}</option>)}
                    </select></span>
                  </label>
                </div>
                <label>{c.f.date}<input type="date" className="inp" value={f.date} onChange={set('date')} /></label>
                <label>{c.f.msg}<textarea className="inp" rows={5} required minLength={10} value={f.message} onChange={set('message')} maxLength={4000} /></label>
                <input className="ct-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={set('website')} name="website" />
                {state === 'error' && <p className="ct-err">{error || c.f.err}</p>}
                <button className="btn btn-block" disabled={state === 'sending'}>{state === 'sending' ? c.f.sending : c.f.send}</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

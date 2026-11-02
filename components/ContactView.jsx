'use client';
import Link from '@/components/Link';
import { useState } from 'react';
import { useApp } from './Providers';
import { Icon } from './Chrome';
import { submitContact } from '@/lib/api';

const SOCIALS = [
  ['instagram', 'Instagram'], ['facebook', 'Facebook'], ['tiktok', 'TikTok'],
  ['youtube', 'YouTube'], ['x', 'X'], ['snapchat', 'Snapchat'],
];

export function ContactView() {
  const { t, lang, settings = {} } = useApp();
  const isAr = lang === 'ar';
  const pick = (en, ar) => ((isAr && settings[ar]) || settings[en] || '');

  const title = pick('contact_title_en', 'contact_title_ar') || t.contact.title;
  const text = pick('contact_text_en', 'contact_text_ar') || t.contact.text;
  const hours = pick('contact_hours_en', 'contact_hours_ar');
  const address = pick('store_address', 'store_address_ar');
  const email = settings.support_email || '';
  const phone = settings.support_phone || '';
  const wa = String(settings.whatsapp_number || '').replace(/[^0-9]/g, '');
  const map = settings.contact_map_url || '';
  const socials = SOCIALS.filter(([k]) => settings[`social_${k}`]);

  const L = isAr
    ? { email: 'البريد الإلكتروني', phone: 'الهاتف', wa: 'واتساب', visit: 'زيارتنا', hours: 'ساعات العمل', map: 'عرض على الخريطة', follow: 'تابعنا', phoneF: 'الهاتف (اختياري)', subject: 'الموضوع (اختياري)', sending: 'جارٍ الإرسال…', err: 'تعذر الإرسال، حاول مرة أخرى.', again: 'إرسال رسالة أخرى', help: 'روابط مفيدة', ship: 'الشحن والتوصيل', ret: 'الإرجاع والاستبدال' }
    : { email: 'Email', phone: 'Phone', wa: 'WhatsApp', visit: 'Visit', hours: 'Hours', map: 'View on map', follow: 'Follow', phoneF: 'Phone (optional)', subject: 'Subject (optional)', sending: 'Sending…', err: 'Could not send. Please try again.', again: 'Send another message', help: 'Helpful links', ship: 'Shipping & delivery', ret: 'Returns & exchanges' };

  const [f, setF] = useState({ name: '', email: '', phone: '', subject: '', message: '', website: '' });
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setState('sending'); setError('');
    try {
      await submitContact(f);
      setState('sent');
      setF({ name: '', email: '', phone: '', subject: '', message: '', website: '' });
    } catch (err) {
      setError(err?.message || L.err);
      setState('error');
    }
  }

  const cards = [
    email && { k: 'mail', label: L.email, node: <a href={`mailto:${email}`}>{email}</a> },
    phone && { k: 'phone', label: L.phone, node: <a href={`tel:${phone.replace(/\s/g, '')}`} dir="ltr">{phone}</a> },
    wa && { k: 'chat', label: L.wa, node: <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" dir="ltr">+{wa}</a> },
    address && { k: 'pin', label: L.visit, node: <><span>{address}</span>{map && <a className="ct-sub" href={map} target="_blank" rel="noreferrer">{L.map}</a>}</> },
    hours && { k: 'clock', label: L.hours, node: <span style={{ whiteSpace: 'pre-line' }}>{hours}</span> },
  ].filter(Boolean);

  return (
    <div className="ct">
      <section className="ct-hero">
        <p className="ct-kicker">{t.contact.kicker}</p>
        <h1>{title}</h1>
        <p className="ct-lead">{text}</p>
      </section>

      <div className="ct-grid">
        <aside className="ct-info">
          {cards.map((c) => (
            <div className="ct-card" key={c.k}>
              <span className="ct-ic"><Icon n={c.k} size={18} /></span>
              <div><small>{c.label}</small>{c.node}</div>
            </div>
          ))}
          {socials.length > 0 && (
            <div className="ct-social">
              <small>{L.follow}</small>
              <div>{socials.map(([k, n]) => <a key={k} href={settings[`social_${k}`]} target="_blank" rel="noreferrer">{n}</a>)}</div>
            </div>
          )}
          <div className="ct-social">
            <small>{L.help}</small>
            <div><Link href="/policies/shipping">{L.ship}</Link><Link href="/policies/returns">{L.ret}</Link></div>
          </div>
        </aside>

        <div className="ct-form">
          {state === 'sent' ? (
            <div className="ct-done">
              <span className="ct-tick"><Icon n="check" size={26} /></span>
              <p>{t.contact.sent}</p>
              <button type="button" className="btn" onClick={() => setState('idle')}>{L.again}</button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="ct-row">
                <label>{t.contact.name}<input className="inp" required value={f.name} onChange={set('name')} maxLength={120} /></label>
                <label>{t.contact.email}<input type="email" className="inp" required value={f.email} onChange={set('email')} maxLength={160} dir="ltr" /></label>
              </div>
              <div className="ct-row">
                <label>{L.phoneF}<input className="inp" value={f.phone} onChange={set('phone')} maxLength={40} dir="ltr" /></label>
                <label>{L.subject}<input className="inp" value={f.subject} onChange={set('subject')} maxLength={160} /></label>
              </div>
              <label>{t.contact.message}<textarea className="inp" rows={6} required minLength={10} value={f.message} onChange={set('message')} maxLength={4000} /></label>
              <input className="ct-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={set('website')} name="website" />
              {state === 'error' && <p className="ct-err">{error || L.err}</p>}
              <button className="btn btn-block" disabled={state === 'sending'}>{state === 'sending' ? L.sending : t.contact.send}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

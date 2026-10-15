'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useApp } from './Providers';
import { Headline } from './Reveal';
import { Icon } from './Chrome';
import { createOrder, getMyOrders, login, register } from '@/lib/api';
import { policies } from '@/lib/data';

const EMIRATES_EN = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'];

function Totals({ children }) {
  const { t, money, totals } = useApp();
  const msg = totals.freeLeft > 0 ? t.cart.freeLeft.replace('{amt}', money(totals.freeLeft)) : t.cart.freeDone;
  return (
    <>
      <div className="ship-bar flat"><p>{msg}</p><div className="bar"><i style={{ transform: `scaleX(${totals.freeProgress})` }} /></div></div>
      <div className="row-between"><span>{t.cart.subtotal}</span><span>{money(totals.subtotal)}</span></div>
      <div className="row-between"><span>{t.cart.shipping}</span><span>{totals.shipping ? money(totals.shipping) : t.cart.free}</span></div>
      <div className="row-between total"><span>{t.cart.total}</span><strong>{money(totals.total)}</strong></div>
      <p className="label">{t.cart.vat}</p>
      {children}
    </>
  );
}

function Field({ label, error, children }) {
  return <label className={`fld ${error ? 'err' : ''}`}><span>{label}</span>{children}{error && <em>{error}</em>}</label>;
}

export function CartView() {
  const { t, L, money, items, setQty, removeItem } = useApp();
  if (!items.length)
    return (
      <div className="page wrap empty-state big">
        <Headline as="h1" className="h-xl" lines={[t.cart.empty]} />
        <p className="muted">{t.cart.emptySub}</p>
        <Link href="/fragrances" className="btn">{t.cart.continue}</Link>
      </div>
    );
  return (
    <div className="page wrap">
      <div className="page-head"><Headline as="h1" className="mega" lines={[t.cart.title]} /></div>
      <div className="split-layout">
        <div>
          {items.map((i) => (
            <div className="cline" key={i.id}>
              <Link href={`/fragrance/${i.slug}`} className="cline-img"><Image src={i.image} alt={L(i.name)} fill sizes="120px" /></Link>
              <div className="cline-info">
                <Link href={`/fragrance/${i.slug}`} className="mini-name">{L(i.name)}</Link>
                <span className="label">{i.size} · {money(i.price)}</span>
                <div className="qty sm">
                  <button onClick={() => setQty(i.id, i.qty - 1)} aria-label="-"><Icon n="minus" size={14} /></button><span>{i.qty}</span>
                  <button onClick={() => setQty(i.id, i.qty + 1)} aria-label="+"><Icon n="plus" size={14} /></button>
                </div>
              </div>
              <div className="mini-end"><strong>{money(i.price * i.qty)}</strong><button className="link" onClick={() => removeItem(i.id)}>{t.cart.remove}</button></div>
            </div>
          ))}
        </div>
        <aside className="panel sticky"><Totals><Link href="/checkout" className="btn btn-block">{t.cart.checkout}</Link></Totals></aside>
      </div>
    </div>
  );
}

export function CheckoutView() {
  const { t, L, items, totals, clearCart, money } = useApp();
  const [f, setF] = useState({ name: '', email: '', phone: '', emirate: 1, address: '', notes: '', payment: 'cod' });
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const [apiErr, setApiErr] = useState('');
  const [done, setDone] = useState(null);
  const [open, setOpen] = useState(false);
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); if (errs[k]) setErrs({ ...errs, [k]: '' }); };

  if (done)
    return (
      <div className="page wrap success">
        <span className="tick"><Icon n="check" size={30} /></span>
        <h1 className="h-xl">{t.checkout.thanks}</h1>
        <p className="serif-i">{t.checkout.thanksSub}</p>
        <div className="order-id"><span className="label">{t.checkout.orderNo}</span><strong>{done.order_number || done.id}</strong></div>
        <p className="muted">{t.checkout.thanksText}</p>
        <Link href="/fragrances" className="btn">{t.cart.continue}</Link>
      </div>
    );
  if (!items.length)
    return <div className="page wrap empty-state big"><h1 className="h-xl">{t.checkout.empty}</h1><Link href="/fragrances" className="btn">{t.cart.continue}</Link></div>;

  const validate = () => {
    const e = {};
    if (!f.name.trim()) e.name = t.checkout.required;
    if (!f.email.trim()) e.email = t.checkout.required;
    else if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = t.checkout.badEmail;
    const digits = f.phone.replace(/\D/g, '');
    if (!digits) e.phone = t.checkout.required;
    else if (!/^(971)?0?5\d{8}$/.test(digits)) e.phone = t.checkout.badPhone;
    if (!f.address.trim()) e.address = t.checkout.required;
    return e;
  };
  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrs(e);
    if (Object.keys(e).length) { document.querySelector('.fld.err')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    setBusy(true); setApiErr('');
    try {
      const order = await createOrder({
        customer: { name: f.name, email: f.email, phone: `+971${f.phone.replace(/\D/g, '').slice(-9)}` },
        address: { emirate: EMIRATES_EN[f.emirate], line: f.address },
        notes: f.notes, payment: f.payment, currency: 'AED',
        items: items.map((i) => ({
          id: Number(i.productId || parseInt(i.id, 10)),
          qty: i.qty,
          price: i.price,
          name: i.name,
        })),
        totals,
      });
      clearCart(); setDone(order); window.scrollTo({ top: 0 });
    } catch (err) { setApiErr(err.message); }
    setBusy(false);
  };

  const summary = (
    <Totals>
      <div className="mini-list">
        {items.map((i) => (
          <div className="ms" key={i.id}>
            <span className="ms-img"><Image src={i.image} alt="" fill sizes="56px" /><b>{i.qty}</b></span>
            <span>{L(i.name)}</span><span>{money(i.price * i.qty)}</span>
          </div>
        ))}
      </div>
    </Totals>
  );

  return (
    <div className="page wrap">
      <div className="page-head"><Headline as="h1" className="mega" lines={[t.checkout.title]} /></div>
      <button type="button" className="sum-toggle" onClick={() => setOpen(!open)}><span>{t.checkout.show}</span><strong>{money(totals.total)}</strong></button>
      {open && <div className="panel sum-mobile">{summary}</div>}
      <form className="split-layout" onSubmit={submit} noValidate>
        <div className="co-form">
          <fieldset><legend><i>1</i>{t.checkout.contact}</legend>
            <Field label={t.checkout.name} error={errs.name}><input className="inp" autoComplete="name" value={f.name} onChange={set('name')} /></Field>
            <div className="row2">
              <Field label={t.checkout.email} error={errs.email}><input className="inp" type="email" autoComplete="email" value={f.email} onChange={set('email')} /></Field>
              <Field label={t.checkout.phone} error={errs.phone}>
                <span className="phone-grp"><b dir="ltr">+971</b><input className="inp" dir="ltr" inputMode="tel" autoComplete="tel-national" placeholder="5X XXX XXXX" value={f.phone} onChange={set('phone')} /></span>
              </Field>
            </div>
          </fieldset>
          <fieldset><legend><i>2</i>{t.checkout.delivery}</legend>
            <div className="emirates">{t.emirates.map((em, i) => <button type="button" key={i} className={`chip ${+f.emirate === i ? 'on' : ''}`} onClick={() => setF({ ...f, emirate: i })}>{em}</button>)}</div>
            <Field label={t.checkout.address} error={errs.address}><textarea className="inp" rows={3} autoComplete="street-address" value={f.address} onChange={set('address')} /></Field>
            <Field label={t.checkout.notes}><textarea className="inp" rows={2} value={f.notes} onChange={set('notes')} /></Field>
          </fieldset>
          <fieldset><legend><i>3</i>{t.checkout.payment}</legend>
            {['cod', 'card'].map((m) => (
              <label key={m} className={`opt ${f.payment === m ? 'on' : ''}`}>
                <input type="radio" name="pay" checked={f.payment === m} onChange={() => setF({ ...f, payment: m })} />
                <span><strong>{t.checkout[m]}</strong><span className="label">{t.checkout[`${m}Sub`]}</span></span>
              </label>
            ))}
          </fieldset>
        </div>
        <aside className="panel sticky desk-only">
          <h2 className="h-md">{t.checkout.summary}</h2>
          {summary}
          {(apiErr || Object.keys(errs).some((k) => errs[k])) && <p className="form-err">{apiErr || t.checkout.fix}</p>}
          <button className="btn btn-block" disabled={busy}>{busy ? t.checkout.placing : `${t.checkout.place} · ${money(totals.total)}`}</button>
        </aside>
        <div className="pay-bar"><button className="btn btn-block" disabled={busy}>{busy ? t.checkout.placing : `${t.checkout.place} · ${money(totals.total)}`}</button></div>
      </form>
    </div>
  );
}

export function AccountView() {
  const { t, money } = useApp();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  useEffect(() => { const u = localStorage.getItem('aly_user'); if (u) setUser(JSON.parse(u)); }, []);
  useEffect(() => { if (user) getMyOrders().then(setOrders).catch(() => {}); }, [user]);
  const submit = async (e) => {
    e.preventDefault(); setError('');
    try {
      const res = await (mode === 'login' ? login(f) : register(f));
      localStorage.setItem('aly_token', res.token);
      localStorage.setItem('aly_user', JSON.stringify(res.user));
      setUser(res.user);
    } catch (err) { setError(err.message || t.account.error); }
  };
  const logout = () => { localStorage.removeItem('aly_token'); localStorage.removeItem('aly_user'); setUser(null); };

  if (user)
    return (
      <div className="page wrap narrow-wide">
        <p className="label">{t.account.welcome}</p>
        <h1 className="mega-sm">{user.name}</h1>
        <h2 className="h-md" style={{ marginTop: '3rem' }}>{t.account.orders}</h2>
        <div className="orders">
          {orders.length === 0 && <p className="muted">{t.account.noOrders}</p>}
          {orders.map((o) => (
            <div className="order" key={o.id}><strong>{o.id}</strong><span className="label">{t.account.status}: {t.account.processing}</span><span>{money(o.totals?.total || 0)}</span></div>
          ))}
        </div>
        <br /><button className="btn btn-line" onClick={logout}>{t.account.logout}</button>
      </div>
    );
  return (
    <div className="page wrap narrow">
      <h1 className="mega-sm">{t.account.title}</h1>
      <p className="muted">{t.account.loginSub}</p>
      <div className="seg">
        <button className={mode === 'login' ? 'on' : ''} onClick={() => setMode('login')}>{t.account.login}</button>
        <button className={mode === 'register' ? 'on' : ''} onClick={() => setMode('register')}>{t.account.register}</button>
      </div>
      <form className="stack" onSubmit={submit}>
        {mode === 'register' && <Field label={t.account.name}><input className="inp" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>}
        <Field label={t.account.email}><input type="email" className="inp" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label={t.account.password}><input type="password" className="inp" required minLength={6} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
        {error && <p className="form-err">{error}</p>}
        <button className="btn btn-block">{mode === 'login' ? t.account.login : t.account.register}</button>
      </form>
    </div>
  );
}

export function ContactView() {
  const { t, settings } = useApp();
  const [sent, setSent] = useState(false);
  const email = settings?.support_email || 'concierge@alaynaas.ae';
  const phone = settings?.support_phone || '+971 50 123 4567';
  const address = settings?.store_address || t.contact.location;
  const rawWa = settings?.whatsapp_number || '+971501234567';
  const waClean = rawWa.replace(/[^0-9]/g, '');
  const waUrl = waClean ? `https://wa.me/${waClean}` : 'https://wa.me/971501234567';

  return (
    <div className="page wrap contact">
      <div>
        <p className="label">{t.contact.kicker}</p>
        <Headline as="h1" className="mega" lines={[t.contact.title]} />
        <p className="serif-i">{t.contact.text}</p>
        <div className="c-info">
          <p><a href={`mailto:${email}`} className="tlink">{email}</a></p>
          <p><a href={`tel:${phone}`} className="tlink">{phone}</a></p>
          <p className="muted">{address}</p>
          <a className="tlink" href={waUrl} target="_blank" rel="noreferrer">{t.contact.whatsapp} ({rawWa})</a>
        </div>
      </div>
      {sent ? <div className="panel"><span className="tick"><Icon n="check" size={26} /></span><p className="serif-i">{t.contact.sent}</p></div> : (
        <form className="stack" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <Field label={t.contact.name}><input className="inp" required /></Field>
          <Field label={t.contact.email}><input type="email" className="inp" required /></Field>
          <Field label={t.contact.message}><textarea className="inp" rows={5} required /></Field>
          <button className="btn btn-block">{t.contact.send}</button>
        </form>
      )}
    </div>
  );
}

export function PolicyView({ slug }) {
  const { L, lang } = useApp();
  const pol = policies[slug];
  if (!pol) return <div className="page wrap empty-state big"><h1 className="h-xl">404</h1></div>;
  return (
    <div className="page wrap narrow-wide">
      <h1 className="mega-sm">{L(pol.title)}</h1>
      <div className="copy">{pol.body[lang].map((x, i) => <p key={i}>{x}</p>)}</div>
    </div>
  );
}

'use client';
import Link from '@/components/Link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useApp } from './Providers';
import { Icon } from './Chrome';
import { createOrder, getMyOrders, login, register } from '@/lib/api';
import { track } from '@/lib/track';
import { policies } from '@/lib/data';

const EMIRATES_EN = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'];

function Totals({ children, compact }) {
  const { t, money, totals } = useApp();
  const msg = totals.freeLeft > 0 ? t.cart.freeLeft.replace('{amt}', money(totals.freeLeft)) : t.cart.freeDone;
  return (
    <>
      <div className="ck-ship"><p>{msg}</p><div className="ck-bar"><i style={{ transform: `scaleX(${totals.freeProgress})` }} /></div></div>
      <div className="ck-rows">
        <div><span>{t.cart.subtotal}</span><span>{money(totals.subtotal)}</span></div>
        {totals.discount > 0 && <div className="ck-disc"><span>{t.cart.ritual}</span><span>−{money(totals.discount)}</span></div>}
        <div><span>{t.cart.shipping}</span><span>{totals.shipping ? money(totals.shipping) : t.cart.free}</span></div>
        <div className="ck-total"><span>{t.cart.total}</span><strong>{money(totals.total)}</strong></div>
      </div>
      <p className="ck-vat">{t.cart.vat}</p>
      {children}
      {!compact && <TrustList />}
    </>
  );
}

function TrustList() {
  const { lang } = useApp();
  const ar = lang === 'ar';
  const items = ar
    ? [['lock', 'دفع آمن ومشفّر'], ['cash', 'الدفع عند الاستلام متاح'], ['returns', 'إرجاع خلال 7 أيام']]
    : [['lock', 'Secure, encrypted checkout'], ['cash', 'Cash on delivery available'], ['returns', '7-day easy returns']];
  return (
    <ul className="ck-trust">
      {items.map(([n, s]) => <li key={n}><Icon n={n} size={18} />{s}</li>)}
    </ul>
  );
}

function Field({ label, error, children }) {
  return <label className={`fld ${error ? 'err' : ''}`}><span>{label}</span>{children}{error && <em>{error}</em>}</label>;
}

function Steps({ n }) {
  const { lang } = useApp();
  const ar = lang === 'ar';
  const s = ar ? ['السلة', 'إتمام الطلب', 'التأكيد'] : ['Cart', 'Checkout', 'Confirmation'];
  return (
    <ol className="ck-steps">
      {s.map((x, i) => <li key={x} className={i + 1 === n ? 'on' : i + 1 < n ? 'done' : ''}><b>{i + 1 < n ? <Icon n="check" size={12} /> : i + 1}</b><span>{x}</span></li>)}
    </ol>
  );
}

export function CartView() {
  const { t, L, lang, money, items, setQty, removeItem } = useApp();
  const ar = lang === 'ar';
  if (!items.length)
    return (
      <div className="ck ck-empty">
        <span className="ck-emptyic"><Icon n="bag" size={34} /></span>
        <h1>{t.cart.empty}</h1>
        <p>{t.cart.emptySub}</p>
        <div className="ck-actions">
          <Link href="/shop" className="btn">{t.cart.continue}</Link>
          <Link href="/discover" className="btn btn-line">{ar ? 'اكتشف عطرك' : 'Discover your scent'}</Link>
        </div>
      </div>
    );
  return (
    <div className="ck">
      <div className="ck-head">
        <Steps n={1} />
        <h1>{t.cart.title}<small>{items.reduce((a, i) => a + i.qty, 0)} {ar ? 'منتج' : (items.reduce((a, i) => a + i.qty, 0) === 1 ? 'item' : 'items')}</small></h1>
      </div>
      <div className="ck-layout">
        <div className="ck-lines">
          {items.map((i) => (
            <div className="ck-line" key={i.id}>
              <Link href={`/fragrance/${i.slug}`} className="ck-img"><Image src={i.image} alt={L(i.name)} fill sizes="120px" /></Link>
              <div className="ck-info">
                <Link href={`/fragrance/${i.slug}`} className="ck-name">{L(i.name)}</Link>
                <span className="ck-meta">{i.size} · {money(i.price)}</span>
                <div className="ck-qty">
                  <button type="button" onClick={() => setQty(i.id, i.qty - 1)} aria-label="-"><Icon n="minus" size={14} /></button>
                  <span>{i.qty}</span>
                  <button type="button" onClick={() => setQty(i.id, i.qty + 1)} aria-label="+"><Icon n="plus" size={14} /></button>
                </div>
              </div>
              <div className="ck-end">
                <strong>{money(i.price * i.qty)}</strong>
                <button type="button" className="ck-rm" onClick={() => removeItem(i.id)}>{t.cart.remove}</button>
              </div>
            </div>
          ))}
          <Link href="/shop" className="ck-back">{ar ? '→' : '←'} {t.cart.continue}</Link>
        </div>
        <aside className="ck-sum">
          <h2>{t.checkout.summary}</h2>
          <Totals><Link href="/checkout" className="btn btn-block">{t.cart.checkout}</Link></Totals>
        </aside>
      </div>
    </div>
  );
}

export function CheckoutView() {
  const { t, L, lang, items, totals, clearCart, money } = useApp();
  const ar = lang === 'ar';
  const [f, setF] = useState({ name: '', email: '', phone: '', emirate: 1, address: '', notes: '', payment: 'cod' });
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const [apiErr, setApiErr] = useState('');
  const [done, setDone] = useState(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('aly_user') || 'null');
      const a = (JSON.parse(localStorage.getItem('aly_addresses') || '[]').find((x) => x.isDefault)) || null;
      setF((p) => ({
        ...p,
        name: p.name || a?.name || u?.name || '',
        email: p.email || u?.email || '',
        phone: p.phone || a?.phone || (u?.phone || '').replace(/\D/g, '').slice(-9),
        emirate: a ? a.emirate : p.emirate,
        address: p.address || a?.line || '',
      }));
    } catch { /* no saved details */ }
  }, []);
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); if (errs[k]) setErrs({ ...errs, [k]: '' }); };

  if (done)
    return (
      <div className="ck ck-done">
        <Steps n={3} />
        <span className="ck-tick"><Icon n="check" size={30} /></span>
        <h1>{t.checkout.thanks}</h1>
        <p className="ck-lead">{t.checkout.thanksSub}</p>
        <div className="ck-orderid"><span>{t.checkout.orderNo}</span><strong>{done.order_number || done.id}</strong></div>
        <p className="ck-note">{t.checkout.thanksText}</p>
        <ul className="ck-next">
          {(ar
            ? [['mail', 'سنراجع طلبك ونؤكده معك.'], ['truck', 'يصلك الطلب خلال 2–5 أيام عمل.'], ['cash', 'ادفع عند الاستلام إن اخترت ذلك.']]
            : [['mail', 'We review and confirm your order with you.'], ['truck', 'Delivered within 2–5 working days.'], ['cash', 'Pay on delivery if you chose cash.']]
          ).map(([n, s]) => <li key={n}><Icon n={n} size={18} />{s}</li>)}
        </ul>
        <div className="ck-actions">
          <Link href="/shop" className="btn">{t.cart.continue}</Link>
          <Link href="/account" className="btn btn-line">{ar ? 'تتبّع طلبي' : 'Track my order'}</Link>
        </div>
      </div>
    );
  if (!items.length)
    return (
      <div className="ck ck-empty">
        <span className="ck-emptyic"><Icon n="bag" size={34} /></span>
        <h1>{t.checkout.empty}</h1>
        <div className="ck-actions"><Link href="/shop" className="btn">{t.cart.continue}</Link></div>
      </div>
    );

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
          variant: i.variant || null,
          name: i.name,
        })),
        totals,
        atelier_code: totals.ritualCode || undefined,
      });
      track('purchase', { transaction_id: order.order_number || order.id, value: totals.total, items });
      try {
        const all = JSON.parse(localStorage.getItem('aly_orders') || '[]');
        if (all[0]) { all[0] = { ...all[0], cart: items, meta: { name: f.name, phone: `+971 ${f.phone.replace(/\D/g, '').slice(-9)}`, emirate: EMIRATES_EN[f.emirate], line: f.address, payment: f.payment } }; localStorage.setItem('aly_orders', JSON.stringify(all)); }
      } catch { /* history is best-effort */ }
      clearCart(); setDone(order); window.scrollTo({ top: 0 });
    } catch (err) { setApiErr(err.message); }
    setBusy(false);
  };

  const summary = (
    <Totals>
      <div className="ck-mini">
        {items.map((i) => (
          <div className="ck-ms" key={i.id}>
            <span className="ck-msimg"><Image src={i.image} alt="" fill sizes="56px" /><b>{i.qty}</b></span>
            <span>{L(i.name)}</span><span>{money(i.price * i.qty)}</span>
          </div>
        ))}
      </div>
    </Totals>
  );
  const placeLabel = busy ? t.checkout.placing : `${t.checkout.place} · ${money(totals.total)}`;

  return (
    <div className="ck">
      <div className="ck-head">
        <Steps n={2} />
        <h1>{t.checkout.title}</h1>
      </div>
      <button type="button" className="ck-toggle" onClick={() => setOpen(!open)}><span>{t.checkout.show}</span><strong>{money(totals.total)}</strong></button>
      {open && <div className="ck-sum ck-sum-m">{summary}</div>}
      <form className="ck-layout" onSubmit={submit} noValidate>
        <div className="ck-form">
          <fieldset><legend><i>1</i>{t.checkout.contact}</legend>
            <Field label={t.checkout.name} error={errs.name}><input className="inp" autoComplete="name" value={f.name} onChange={set('name')} /></Field>
            <div className="ck-row2">
              <Field label={t.checkout.email} error={errs.email}><input className="inp" type="email" autoComplete="email" value={f.email} onChange={set('email')} /></Field>
              <Field label={t.checkout.phone} error={errs.phone}>
                <span className="phone-grp"><b dir="ltr">+971</b><input className="inp" dir="ltr" inputMode="tel" autoComplete="tel-national" placeholder="5X XXX XXXX" value={f.phone} onChange={set('phone')} /></span>
                <small className="ck-hint">{ar ? 'رقم جوال إماراتي، مثال: 50 123 4567' : 'UAE mobile number, e.g. 50 123 4567'}</small>
              </Field>
            </div>
          </fieldset>
          <fieldset><legend><i>2</i>{t.checkout.delivery}</legend>
            <Field label={ar ? 'الإمارة' : 'Emirate'}>
              <span className="ck-select"><select className="inp" autoComplete="address-level1" value={f.emirate} onChange={(e) => setF({ ...f, emirate: +e.target.value })}>{t.emirates.map((em, i) => <option key={i} value={i}>{em}</option>)}</select></span>
            </Field>
            <Field label={t.checkout.address} error={errs.address}><textarea className="inp" rows={3} autoComplete="street-address" value={f.address} onChange={set('address')} /></Field>
            <Field label={t.checkout.notes}><textarea className="inp" rows={2} value={f.notes} onChange={set('notes')} /></Field>
          </fieldset>
          <fieldset><legend><i>3</i>{t.checkout.payment}</legend>
            <div className="ck-pay">
              {['cod', 'card'].map((m) => (
                <label key={m} className={`ck-opt ${f.payment === m ? 'on' : ''}`}>
                  <input type="radio" name="pay" checked={f.payment === m} onChange={() => setF({ ...f, payment: m })} />
                  <Icon n={m === 'cod' ? 'cash' : 'lock'} size={22} />
                  <span><strong>{t.checkout[m]}</strong><small>{t.checkout[`${m}Sub`]}</small></span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <aside className="ck-sum ck-sticky">
          <h2>{t.checkout.summary}</h2>
          {summary}
          {(apiErr || Object.keys(errs).some((k) => errs[k])) && <p className="ck-err">{apiErr || t.checkout.fix}</p>}
          <button className="btn btn-block" disabled={busy}>{placeLabel}</button>
        </aside>
        <div className="ck-paybar"><button className="btn btn-block" disabled={busy}>{placeLabel}</button></div>
      </form>
    </div>
  );
}

const STATUS_AR = { pending: 'قيد المراجعة', processing: 'قيد التجهيز', shipped: 'تم الشحن', delivered: 'تم التسليم', cancelled: 'ملغى' };

const readJson = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || ''); } catch { return d; } };
const EMPTY_ADDR = { id: '', label: '', name: '', phone: '', emirate: 1, line: '', isDefault: false };

/* ───────── Logged-in dashboard: overview, orders, addresses, profile, help ───────── */
function AccountDash({ user, setUser, logout }) {
  const { t, L, lang, money, addItem, settings, notify } = useApp();
  const ar = lang === 'ar';
  const x = (en, a2) => (ar ? a2 : en);
  const [tab, setTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [addrs, setAddrs] = useState([]);
  const [edit, setEdit] = useState(null);
  const [prof, setProf] = useState({ name: user.name || '', email: user.email || '', phone: user.phone || '' });

  useEffect(() => { getMyOrders().then(setOrders).catch(() => {}); setAddrs(readJson('aly_addresses', [])); }, []);

  const reorder = (o) => (o.cart || []).forEach((i) => addItem(
    { id: i.productId, slug: i.slug, name: i.name, price: i.price, image: i.image, size: i.size },
    i.qty,
    i.variant ? { key: i.variant, label: i.size, price: i.price } : undefined
  ));
  const totalOf = (o) => Number(o.totals?.total || o.total || 0);
  const stOf = (o) => String(o.status || 'processing').toLowerCase();
  const stLabel = (st) => (ar ? (STATUS_AR[st] || st) : st);
  const dateOf = (o) => {
    const d = new Date(o.created_at || o.createdAt || o.date || '');
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(ar ? 'ar-AE' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const spent = orders.filter((o) => stOf(o) !== 'cancelled').reduce((n, o) => n + totalOf(o), 0);
  const last = orders[0];

  const saveAddrs = (list) => { setAddrs(list); localStorage.setItem('aly_addresses', JSON.stringify(list)); };
  const submitAddr = (e) => {
    e.preventDefault();
    if (!edit.line.trim() || !edit.name.trim()) return;
    let list = edit.id ? addrs.map((a2) => (a2.id === edit.id ? edit : a2)) : [...addrs, { ...edit, id: String(Date.now()) }];
    if (edit.isDefault || list.length === 1) {
      const keep = edit.id || list[list.length - 1].id;
      list = list.map((a2) => ({ ...a2, isDefault: a2.id === keep }));
    }
    saveAddrs(list); setEdit(null); notify(x('Address saved', 'تم حفظ العنوان'));
  };
  const delAddr = (id) => saveAddrs(addrs.filter((a2) => a2.id !== id).map((a2, i, arr) => ({ ...a2, isDefault: a2.isDefault || (arr.length === 1 && i === 0) })));
  const makeDefault = (id) => saveAddrs(addrs.map((a2) => ({ ...a2, isDefault: a2.id === id })));
  const saveProfile = (e) => {
    e.preventDefault();
    const u = { ...user, name: prof.name.trim() || user.name, email: prof.email.trim() || user.email, phone: prof.phone.trim() };
    localStorage.setItem('aly_user', JSON.stringify(u)); setUser(u); notify(x('Profile updated', 'تم تحديث الملف الشخصي'));
  };

  const tabs = [
    ['overview', x('Overview', 'نظرة عامة')],
    ['orders', t.account.orders],
    ['addresses', x('Addresses', 'العناوين')],
    ['profile', x('Profile', 'الملف الشخصي')],
    ['help', x('Help', 'المساعدة')],
  ];
  const wa = String(settings?.whatsapp_number || '').replace(/\D/g, '');

  const OrderCard = ({ o, full }) => {
    const st = stOf(o);
    const open = openId === (o.id || o.order_number);
    return (
      <div className="ac-order">
        <div><small>{t.checkout.orderNo}</small><strong>{o.order_number || o.id}</strong>{dateOf(o) && <em className="ac-date">{dateOf(o)}</em>}</div>
        <span className={`ac-badge s-${st}`}>{stLabel(st)}</span>
        <strong className="ac-amt">{money(totalOf(o))}</strong>
        {o.cart?.length > 0 && (
          <div className="ac-lines">
            <span>{o.cart.map((i) => `${i.qty}× ${L(i.name)}`).join(' · ')}</span>
            <span className="ac-acts">
              {full && <button type="button" className="ac-link" onClick={() => setOpenId(open ? null : (o.id || o.order_number))}>{open ? x('Hide details', 'إخفاء التفاصيل') : x('Details', 'التفاصيل')}</button>}
              <button type="button" className="btn btn-line ac-reorder" onClick={() => reorder(o)}>{x('Reorder', 'اطلب مجدداً')}</button>
            </span>
          </div>
        )}
        {full && open && (
          <div className="ac-detail">
            {(o.cart || []).map((i) => (
              <div className="ac-di" key={i.id}>
                <span className="ac-diimg">{i.image && <Image src={i.image} alt="" fill sizes="56px" />}</span>
                <span className="ac-dit"><strong>{L(i.name)}</strong>{i.size && <small>{i.size}</small>}</span>
                <span>{i.qty} × {money(i.price)}</span>
              </div>
            ))}
            {o.meta && (
              <div className="ac-meta">
                <div><small>{x('Delivery to', 'التوصيل إلى')}</small><p>{o.meta.name}<br />{o.meta.line}{o.meta.emirate ? `, ${o.meta.emirate}` : ''}<br /><bdi dir="ltr">{o.meta.phone}</bdi></p></div>
                <div><small>{x('Payment', 'الدفع')}</small><p>{o.meta.payment === 'card' ? x('Credit / debit card', 'بطاقة ائتمان / خصم') : x('Cash on delivery', 'الدفع عند الاستلام')}</p></div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="ck ac">
      <div className="ac-hero">
        <div><p className="ck-kicker">{t.account.welcome}</p><h1>{user.name}</h1><p className="ac-mail">{user.email}</p></div>
        <button type="button" className="btn btn-line" onClick={logout}>{t.account.logout}</button>
      </div>
      <nav className="ac-nav" aria-label={x('Account sections', 'أقسام الحساب')}>
        {tabs.map(([k, label]) => <button type="button" key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}</button>)}
      </nav>

      {tab === 'overview' && (
        <section className="ac-sec">
          <div className="ac-stats">
            <div><small>{x('Orders', 'الطلبات')}</small><strong>{orders.length}</strong></div>
            <div><small>{x('Total spent', 'إجمالي المشتريات')}</small><strong>{money(spent)}</strong></div>
            <div><small>{x('Latest order', 'آخر طلب')}</small><strong>{last ? stLabel(stOf(last)) : '—'}</strong></div>
            <div><small>{x('Saved addresses', 'العناوين المحفوظة')}</small><strong>{addrs.length}</strong></div>
          </div>
          <h2>{x('Latest order', 'آخر طلب')}</h2>
          {last ? <OrderCard o={last} /> : (
            <div className="ac-none"><p>{t.account.noOrders}</p><Link href="/shop" className="btn">{t.cart.continue}</Link></div>
          )}
          <div className="ac-quick">
            <Link href="/shop">{x('Continue shopping', 'متابعة التسوق')}</Link>
            <Link href="/discover">{x('Find your scent', 'اكتشف عطرك')}</Link>
            <Link href="/contact">{x('Contact us', 'تواصل معنا')}</Link>
          </div>
        </section>
      )}

      {tab === 'orders' && (
        <section className="ac-sec">
          <h2>{t.account.orders}</h2>
          {orders.length === 0 ? (
            <div className="ac-none"><p>{t.account.noOrders}</p><Link href="/shop" className="btn">{t.cart.continue}</Link></div>
          ) : orders.map((o) => <OrderCard o={o} full key={o.id || o.order_number} />)}
          <p className="ac-foot">{x('Orders placed on this device appear here.', 'تظهر هنا الطلبات التي تمت من هذا الجهاز.')}</p>
        </section>
      )}

      {tab === 'addresses' && (
        <section className="ac-sec">
          <h2>{x('Delivery addresses', 'عناوين التوصيل')}</h2>
          {!edit && (
            <>
              <div className="ac-addrs">
                {addrs.map((a2) => (
                  <div className={`ac-addr ${a2.isDefault ? 'def' : ''}`} key={a2.id}>
                    {a2.isDefault && <span className="ac-tag">{x('Default', 'الافتراضي')}</span>}
                    <strong>{a2.label || a2.name}</strong>
                    <p>{a2.name}<br />{a2.line}, {t.emirates[a2.emirate]}<br /><bdi dir="ltr">+971 {a2.phone}</bdi></p>
                    <div className="ac-acts">
                      <button type="button" className="ac-link" onClick={() => setEdit(a2)}>{x('Edit', 'تعديل')}</button>
                      {!a2.isDefault && <button type="button" className="ac-link" onClick={() => makeDefault(a2.id)}>{x('Make default', 'اجعله افتراضياً')}</button>}
                      <button type="button" className="ac-link" onClick={() => delAddr(a2.id)}>{x('Remove', 'حذف')}</button>
                    </div>
                  </div>
                ))}
              </div>
              {!addrs.length && <div className="ac-none"><p>{x('No saved addresses yet.', 'لا توجد عناوين محفوظة بعد.')}</p></div>}
              <button type="button" className="btn btn-line ac-add" onClick={() => setEdit({ ...EMPTY_ADDR, name: user.name || '', phone: (user.phone || '').replace(/\D/g, '').slice(-9) })}>{x('Add an address', 'إضافة عنوان')}</button>
            </>
          )}
          {edit && (
            <form className="ac-form ac-aform" onSubmit={submitAddr}>
              <Field label={x('Label (e.g. Home, Office)', 'التسمية (مثل: المنزل، العمل)')}><input className="inp" value={edit.label} onChange={(e) => setEdit({ ...edit, label: e.target.value })} /></Field>
              <div className="ck-row2">
                <Field label={t.checkout.name}><input className="inp" required value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
                <Field label={t.checkout.phone}><span className="phone-grp"><b dir="ltr">+971</b><input className="inp" dir="ltr" inputMode="tel" placeholder="5X XXX XXXX" value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></span></Field>
              </div>
              <Field label={x('Emirate', 'الإمارة')}><span className="ck-select"><select className="inp" value={edit.emirate} onChange={(e) => setEdit({ ...edit, emirate: +e.target.value })}>{t.emirates.map((em, i) => <option key={i} value={i}>{em}</option>)}</select></span></Field>
              <Field label={t.checkout.address}><textarea className="inp" rows={3} required value={edit.line} onChange={(e) => setEdit({ ...edit, line: e.target.value })} /></Field>
              <label className="ac-check"><input type="checkbox" checked={!!edit.isDefault} onChange={(e) => setEdit({ ...edit, isDefault: e.target.checked })} />{x('Use as my default address', 'استخدمه كعنوان افتراضي')}</label>
              <div className="ac-acts">
                <button className="btn">{x('Save address', 'حفظ العنوان')}</button>
                <button type="button" className="btn btn-line" onClick={() => setEdit(null)}>{x('Cancel', 'إلغاء')}</button>
              </div>
            </form>
          )}
          <p className="ac-foot">{x('Your default address is filled in for you at checkout.', 'يتم تعبئة عنوانك الافتراضي تلقائياً عند إتمام الطلب.')}</p>
        </section>
      )}

      {tab === 'profile' && (
        <section className="ac-sec">
          <h2>{x('Your details', 'بياناتك')}</h2>
          <form className="ac-form ac-pform" onSubmit={saveProfile}>
            <Field label={t.account.name}><input className="inp" required value={prof.name} onChange={(e) => setProf({ ...prof, name: e.target.value })} /></Field>
            <Field label={t.account.email}><input className="inp" type="email" required value={prof.email} onChange={(e) => setProf({ ...prof, email: e.target.value })} /></Field>
            <Field label={t.checkout.phone}><span className="phone-grp"><b dir="ltr">+971</b><input className="inp" dir="ltr" inputMode="tel" placeholder="5X XXX XXXX" value={prof.phone} onChange={(e) => setProf({ ...prof, phone: e.target.value })} /></span></Field>
            <div className="ac-acts"><button className="btn">{x('Save changes', 'حفظ التغييرات')}</button></div>
          </form>
        </section>
      )}

      {tab === 'help' && (
        <section className="ac-sec">
          <h2>{x('Need a hand?', 'تحتاج مساعدة؟')}</h2>
          <div className="ac-help">
            <Link href="/contact"><strong>{x('Contact us', 'تواصل معنا')}</strong><span>{x('Questions about an order or a fragrance.', 'أسئلة حول طلب أو عطر.')}</span></Link>
            {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"><strong>WhatsApp</strong><span>{x('Message us directly.', 'راسلنا مباشرة.')}</span></a>}
            <Link href="/policies/shipping"><strong>{x('Shipping & delivery', 'الشحن والتوصيل')}</strong><span>{x('Times, fees and coverage.', 'المدة والرسوم والتغطية.')}</span></Link>
            <Link href="/policies/refund"><strong>{x('Returns & refunds', 'الإرجاع والاسترداد')}</strong><span>{x('How a return or an exchange works.', 'كيف يتم الإرجاع أو الاستبدال.')}</span></Link>
          </div>
        </section>
      )}
    </div>
  );
}

export function AccountView() {
  const { t } = useApp();
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  useEffect(() => { const u = localStorage.getItem('aly_user'); if (u) setUser(JSON.parse(u)); }, []);
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

  if (user) return <AccountDash user={user} setUser={setUser} logout={logout} />;
  return (
    <div className="ck ac-auth">
      <div className="ac-card">
        <h1>{t.account.title}</h1>
        <p className="ck-lead">{t.account.loginSub}</p>
        <div className="ac-tabs">
          <button type="button" className={mode === 'login' ? 'on' : ''} onClick={() => setMode('login')}>{t.account.login}</button>
          <button type="button" className={mode === 'register' ? 'on' : ''} onClick={() => setMode('register')}>{t.account.register}</button>
        </div>
        <form className="ac-form" onSubmit={submit}>
          {mode === 'register' && <Field label={t.account.name}><input className="inp" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>}
          <Field label={t.account.email}><input type="email" className="inp" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
          <Field label={t.account.password}><input type="password" className="inp" required minLength={6} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
          {error && <p className="ck-err">{error}</p>}
          <button className="btn btn-block">{mode === 'login' ? t.account.login : t.account.register}</button>
        </form>
        <TrustList />
      </div>
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

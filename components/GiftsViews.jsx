'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from '@/components/Link';
import { useApp } from './Providers';
import { getGiftStatus, playGift, sendGift, openGiftSend, claimGift } from '@/lib/api';

/*
 * THE GIFT MAJLIS: free gifts (FOC) for marketing.
 * Four quick ways to a gift; every one ends in the same short claim form.
 * The prize is decided by the API (Admin > Storefront > Gifts), the page only stages the reveal.
 */

const T = (en, ar) => ({ en, ar });

const EMIRATES = [
  ['abu_dhabi', T('Abu Dhabi', 'أبوظبي'), T('Where the Union began', 'حيث بدأ الاتحاد'), ['#7a5b2e', '#d4b06a']],
  ['dubai', T('Dubai', 'دبي'), T('City of gold', 'مدينة الذهب'), ['#1f3b4d', '#6f9bb3']],
  ['sharjah', T('Sharjah', 'الشارقة'), T('Heart of culture', 'عاصمة الثقافة'), ['#5b2a3a', '#b5677e']],
  ['ajman', T('Ajman', 'عجمان'), T('Pearl of the coast', 'لؤلؤة الساحل'), ['#2f5a5a', '#8fc1bb']],
  ['umm_al_quwain', T('Umm Al Quwain', 'أم القيوين'), T('Calm of the lagoons', 'هدوء الخيران'), ['#3c4f2a', '#9bb27a']],
  ['ras_al_khaimah', T('Ras Al Khaimah', 'رأس الخيمة'), T('Mountains and legends', 'جبال وأساطير'), ['#6b3a1f', '#d08a55']],
  ['fujairah', T('Fujairah', 'الفجيرة'), T('Where the sun rises first', 'حيث تشرق الشمس أولًا'), ['#23344f', '#e0a96d']],
];

const WHO = [
  ['mother', T('My mother', 'أمي'), T('To the one whose scent is home. Thank you for everything.', 'إلى من رائحتها وطن. شكرًا على كل شيء.')],
  ['father', T('My father', 'أبي'), T('To my crown, with all my love and respect.', 'إلى تاج رأسي، مع كل الحب والتقدير.')],
  ['wife', T('My wife', 'زوجتي'), T('For the one who makes every day more beautiful.', 'لمن تجعل كل أيامي أجمل.')],
  ['husband', T('My husband', 'زوجي'), T('For the one I am proud of, always.', 'لمن أفخر به دائمًا.')],
  ['friend', T('A friend', 'صديق'), T('A small gift for a friend who means a lot.', 'هدية صغيرة لصديق غالٍ.')],
  ['someone', T('Someone dear', 'شخص عزيز'), T('Something special, just for you.', 'شيء مميز، لك وحدك.')],
];

const ERR = {
  sold_out: T("Today's gifts have all been claimed. Please come back tomorrow.", 'نفدت هدايا اليوم. عد إلينا غدًا.'),
  paused: T('Gifts are paused right now. Please check back soon.', 'الهدايا متوقفة مؤقتًا. عد إلينا قريبًا.'),
  duplicate: T('This number has already received a gift. One gift per person.', 'هذا الرقم حصل على هدية من قبل. هدية واحدة لكل شخص.'),
  phone: T('Please enter a UAE mobile number, e.g. 050 123 4567', 'أدخل رقم جوال إماراتي، مثل 050 123 4567'),
  emirate: T('Please choose your emirate', 'اختر إمارتك'),
  claimed: T('This gift has already been opened and claimed.', 'تم فتح هذه الهدية واستلامها من قبل.'),
  self: T('A gift cannot be claimed by the person who sent it.', 'لا يمكن لمرسل الهدية أن يستلمها بنفسه.'),
  busy: T('Too many tries. Please come back a little later.', 'محاولات كثيرة. عد إلينا بعد قليل.'),
  generic: T('Something went wrong. Please try again.', 'حدث خطأ، حاول مرة أخرى.'),
};

function useLang() {
  const { lang, settings = {} } = useApp();
  const isAr = lang === 'ar';
  return { isAr, lang, settings, t: (o) => (o ? (isAr ? o.ar : o.en) : '') };
}
const errText = (e, t) => t(ERR[e?.code] || (e?.status === 429 ? ERR.busy : ERR.generic));
const markClaimed = (prize) => { try { localStorage.setItem('gifts:claimed', JSON.stringify({ prize, at: Date.now() })); } catch { /* ignore */ } };

/* ── Small drawings ── */
const Icon = {
  gift: (
    <svg viewBox="0 0 48 48" aria-hidden="true"><rect x="6" y="14" width="36" height="26" rx="2" /><path d="M6 14l18 14 18-14" /><circle cx="24" cy="27" r="4.5" className="f" /></svg>
  ),
  dune: (
    <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M3 34c7-7 13-9 21-5s12 3 21-4" /><path d="M3 41c8-4 15-5 22-2s12 2 20-2" /><circle cx="35" cy="13" r="5" className="f" /></svg>
  ),
  emirates: (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d={Array.from({ length: 14 }, (_, i) => { const a = (Math.PI / 7) * i - Math.PI / 2; const r = i % 2 ? 9 : 19; return `${i ? 'L' : 'M'}${(24 + r * Math.cos(a)).toFixed(1)} ${(24 + r * Math.sin(a)).toFixed(1)}`; }).join(' ') + 'Z'} />
    </svg>
  ),
  key: (
    <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="15" cy="24" r="8" /><circle cx="15" cy="24" r="3" className="f" /><path d="M23 24h21M37 24v7M42 24v5" /></svg>
  ),
};

function Crown() {
  return <svg viewBox="0 0 40 28" aria-hidden="true"><path d="M3 24 L6 7 L14 15 L20 3 L26 15 L34 7 L37 24 Z" /></svg>;
}

/* ── The claim form: the same for every way ── */
function ClaimForm({ reveal, onDone, title }) {
  const { isAr, settings, t } = useLang();
  const [f, setF] = useState({ name: '', phone: '', emirate: '', address: '', website: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const note = isAr ? settings.gifts_delivery_ar : settings.gifts_delivery_en;

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const r = await claimGift({ token: reveal.token, ...f });
      markClaimed(r.prize);
      onDone(r);
    } catch (err) {
      setError(errText(err, t));
      setBusy(false);
    }
  }

  return (
    <form className="gm-claim" onSubmit={submit}>
      <h2>{title || t(T('Where shall we send it?', 'إلى أين نرسلها؟'))}</h2>
      <label>{t(T('Your name', 'اسمك'))}<input className="inp" required minLength={2} maxLength={100} value={f.name} onChange={set('name')} autoComplete="name" /></label>
      <label>{t(T('WhatsApp number', 'رقم واتساب'))}<input className="inp" required dir="ltr" inputMode="tel" placeholder="050 123 4567" minLength={7} maxLength={20} value={f.phone} onChange={set('phone')} autoComplete="tel" /></label>
      <label>{t(T('Emirate', 'الإمارة'))}
        <select className="inp" required value={f.emirate} onChange={set('emirate')}>
          <option value="" disabled>{t(T('Choose…', 'اختر…'))}</option>
          {EMIRATES.map(([k, name]) => <option key={k} value={k}>{t(name)}</option>)}
        </select>
      </label>
      <label>{t(T('Area and building', 'المنطقة والمبنى'))}<input className="inp" required minLength={5} maxLength={400} placeholder={t(T('e.g. Al Barsha 1, Villa 12', 'مثال: البرشاء 1، فيلا 12'))} value={f.address} onChange={set('address')} autoComplete="street-address" /></label>
      <input className="ct-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={set('website')} name="website" />
      {error && <p className="ct-err" role="alert">{error}</p>}
      <button className="btn btn-fill btn-block" disabled={busy}>{busy ? t(T('Sending…', 'جارٍ الإرسال…')) : t(T('Send me my gift', 'أرسلوا لي هديتي'))}</button>
      {note && <p className="gm-note">{note}</p>}
    </form>
  );
}

function PrizeCard({ prize, kicker }) {
  const { t } = useLang();
  return (
    <div className="gm-prize" role="status">
      <span className="gm-prize-k">{kicker || t(T('Your gift', 'هديتك'))}</span>
      <strong>{t(prize)}</strong>
    </div>
  );
}

function Done({ result, onSend }) {
  const { t } = useLang();
  return (
    <div className="gm-done">
      <span className="gm-done-mark" aria-hidden="true"><Crown /></span>
      <h2>{t(T('Your gift is on its way', 'هديتك في الطريق إليك'))}</h2>
      {result?.prize && <p className="gm-done-prize">{t(result.prize)}</p>}
      <p>{t(T('We will message you on WhatsApp to confirm the delivery.', 'سنتواصل معك عبر واتساب لتأكيد التوصيل.'))}</p>
      <div className="gm-done-next">
        <p>{t(T('Make someone happy too: send a gift to someone you love.', 'أسعد شخصًا تحبه: أرسل له هدية.'))}</p>
        {onSend ? <button type="button" className="btn btn-fill" onClick={onSend}>{t(T('Send a gift', 'أرسل هدية'))}</button>
          : <Link href="/gifts" className="btn btn-fill">{t(T('Send a gift', 'أرسل هدية'))}</Link>}
      </div>
    </div>
  );
}

/* ── 1. Send a gift ── */
function SendStage() {
  const { isAr, lang, t } = useLang();
  const [who, setWho] = useState('');
  const [f, setF] = useState({ to_name: '', from_name: '', message: '', sender_phone: '', website: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const chooseWho = (k, msg) => {
    setWho(k);
    setF((p) => ({ ...p, message: t(msg) }));
  };

  async function seal(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const r = await sendGift({ who, ...f, lang });
      setCode(r.code);
    } catch (err) {
      setError(errText(err, t));
    } finally {
      setBusy(false);
    }
  }

  if (code) {
    const url = `${window.location.origin}${isAr ? '/ar' : ''}/gifts/g/${code}`;
    const text = isAr
      ? `${f.to_name}، أرسل لك ${f.from_name} هدية من عطور عاليناء 🎁\nافتحها من هنا: ${url}`
      : `${f.to_name}, ${f.from_name} has sent you a gift from ALAYNAA'S Parfums 🎁\nOpen it here: ${url}`;
    const copy = async () => { try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ } };
    return (
      <div className="gm-sealed">
        <Envelope to={f.to_name} from={f.from_name} />
        <h2>{t(T('Your gift is sealed', 'تم ختم هديتك'))}</h2>
        <p>{isAr ? `أرسله الآن إلى ${f.to_name} عبر واتساب. عندما يستلم هديته، نرسل لك هدية أيضًا شكرًا لك.` : `Now send it to ${f.to_name} on WhatsApp. When they claim it, we'll send you a gift too, as a thank-you.`}</p>
        <a className="btn btn-fill btn-block gm-wa" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer">{t(T('Send on WhatsApp', 'أرسلها عبر واتساب'))}</a>
        <button type="button" className="tlink" onClick={copy}>{copied ? t(T('Link copied', 'تم نسخ الرابط')) : t(T('Or copy the link', 'أو انسخ الرابط'))}</button>
      </div>
    );
  }

  return (
    <div className="gm-send">
      <h2>{t(T('Who is the gift for?', 'لمن الهدية؟'))}</h2>
      <div className="gm-who" role="radiogroup">
        {WHO.map(([k, label, msg]) => (
          <button key={k} type="button" role="radio" aria-checked={who === k} className={who === k ? 'on' : ''} onClick={() => chooseWho(k, msg)}>{t(label)}</button>
        ))}
      </div>
      {who && (
        <form className="gm-claim" onSubmit={seal}>
          <label>{t(T('Their name', 'اسمه / اسمها'))}<input className="inp" required minLength={2} maxLength={60} value={f.to_name} onChange={set('to_name')} autoFocus /></label>
          <label>{t(T('Your message', 'رسالتك'))}<textarea className="inp" rows={2} maxLength={400} value={f.message} onChange={set('message')} /></label>
          <label>{t(T('Your name', 'اسمك'))}<input className="inp" required minLength={2} maxLength={60} value={f.from_name} onChange={set('from_name')} autoComplete="name" /></label>
          <label>{t(T('Your WhatsApp number', 'رقم واتساب الخاص بك'))}<input className="inp" required dir="ltr" inputMode="tel" placeholder="050 123 4567" minLength={7} maxLength={20} value={f.sender_phone} onChange={set('sender_phone')} autoComplete="tel" /></label>
          <p className="gm-note">{t(T('We use your number only to send you your thank-you gift.', 'نستخدم رقمك فقط لإرسال هدية الشكر لك.'))}</p>
          <input className="ct-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={set('website')} name="website" />
          {error && <p className="ct-err" role="alert">{error}</p>}
          <button className="btn btn-fill btn-block" disabled={busy}>{busy ? t(T('Sealing…', 'جارٍ الختم…')) : t(T('Seal the gift', 'اختم الهدية'))}</button>
        </form>
      )}
    </div>
  );
}

function Envelope({ to, from, open = false }) {
  const { t } = useLang();
  return (
    <div className={`gm-env${open ? ' open' : ''}`}>
      <div className="gm-env-card">
        <span>{t(T('For', 'إلى'))}</span>
        <strong>{to}</strong>
        {from && <em>{t(T('from', 'من'))} {from}</em>}
      </div>
      <div className="gm-env-body" />
      <div className="gm-env-flap" />
      <div className="gm-env-seal"><Crown /></div>
    </div>
  );
}

/* ── 2. Dig the Dune ── */
function DuneStage({ onReveal }) {
  const { lang, isAr, t } = useLang();
  const wrap = useRef(null);
  const canvas = useRef(null);
  const started = useRef(false);
  const moves = useRef(0);
  const [reveal, setReveal] = useState(null);
  const [cleared, setCleared] = useState(false);
  const [error, setError] = useState('');

  const paint = useCallback(() => {
    const c = canvas.current; const w = wrap.current;
    if (!c || !w) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const { width, height } = w.getBoundingClientRect();
    c.width = width * dpr; c.height = height * dpr;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    const g = x.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, '#ecd3a0'); g.addColorStop(0.55, '#d9b073'); g.addColorStop(1, '#bf8f52');
    x.fillStyle = g; x.fillRect(0, 0, width, height);
    x.strokeStyle = 'rgba(255,255,255,.28)'; x.lineWidth = 2;
    for (let i = 1; i < 6; i++) {
      const y = (height / 6) * i;
      x.beginPath(); x.moveTo(0, y);
      x.bezierCurveTo(width * 0.3, y - 26, width * 0.6, y + 22, width, y - 10);
      x.stroke();
    }
    for (let i = 0; i < (width * height) / 60; i++) {
      x.fillStyle = Math.random() > 0.5 ? 'rgba(120,80,30,.18)' : 'rgba(255,245,220,.25)';
      x.fillRect(Math.random() * width, Math.random() * height, 1.4, 1.4);
    }
    x.fillStyle = 'rgba(70,45,15,.75)';
    x.font = '500 13px system-ui, sans-serif';
    x.textAlign = 'center';
    x.fillText(isAr ? 'امسح الرمل بإصبعك' : 'WIPE THE SAND WITH YOUR FINGER', width / 2, height / 2 + 4);
  }, [isAr]);

  useEffect(() => { paint(); }, [paint]);

  const start = async () => {
    if (started.current) return;
    started.current = true;
    try { setReveal(await playGift({ mode: 'dune', lang })); } catch (e) { setError(errText(e, t)); }
  };

  const check = () => {
    const c = canvas.current; const x = c.getContext('2d', { willReadFrequently: true });
    const { data } = x.getImageData(0, 0, c.width, c.height);
    let clear = 0; let n = 0;
    for (let i = 3; i < data.length; i += 4 * 24) { n++; if (data[i] === 0) clear++; }
    if (clear / n > 0.4) setCleared(true);
  };

  const dig = (e) => {
    if (cleared || error) return;
    if (e.type === 'pointerdown') start();
    if (e.buttons === 0 && e.pointerType === 'mouse') return;
    const c = canvas.current; const r = c.getBoundingClientRect();
    const x = c.getContext('2d', { willReadFrequently: true });
    x.globalCompositeOperation = 'destination-out';
    x.fillStyle = '#000'; // fully opaque brush, so the sand is removed completely
    x.beginPath(); x.arc(e.clientX - r.left, e.clientY - r.top, 34, 0, Math.PI * 2); x.fill();
    x.globalCompositeOperation = 'source-over';
    if (++moves.current % 12 === 0) check();
  };

  const digAll = () => { start(); setCleared(true); };
  const shown = cleared && reveal;
  useEffect(() => { if (shown) onReveal(reveal); }, [shown]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="gm-stage">
      <div ref={wrap} className={`gm-dune${cleared ? ' cleared' : ''}`}>
        <div className={`gm-chest${shown ? ' open' : ''}`}>
          <svg viewBox="0 0 120 90" aria-hidden="true">
            <rect x="14" y="40" width="92" height="44" rx="4" className="gm-chest-b" />
            <path d="M14 40 Q60 8 106 40 Z" className="gm-chest-lid" />
            <rect x="54" y="44" width="12" height="14" rx="2" className="gm-chest-lock" />
          </svg>
          {shown && <PrizeCard prize={reveal.prize} />}
          {cleared && !reveal && !error && <p className="gm-wait">…</p>}
        </div>
        <canvas ref={canvas} onPointerDown={dig} onPointerMove={dig} aria-label={t(T('Sand covering your gift', 'رمل يغطي هديتك'))} />
      </div>
      {error ? <p className="ct-err" role="alert">{error}</p> : !cleared && (
        <button type="button" className="tlink gm-skip" onClick={digAll}>{t(T('Or tap here to dig for me', 'أو اضغط هنا ليُحفر لك'))}</button>
      )}
    </div>
  );
}

/* ── 3. The Seven Emirates ── */
function EmiratesStage({ onReveal }) {
  const { lang, t } = useLang();
  const [picked, setPicked] = useState('');
  const [reveal, setReveal] = useState(null);
  const [error, setError] = useState('');

  const pick = async (k) => {
    if (picked) return;
    setPicked(k);
    try { const r = await playGift({ mode: 'emirates', choice: k, lang }); setTimeout(() => { setReveal(r); onReveal(r); }, 650); } catch (e) { setError(errText(e, t)); setPicked(''); }
  };

  return (
    <div className="gm-stage">
      <p className="gm-stage-q">{t(T('Choose your emirate. Its card hides your gift.', 'اختر إمارتك. بطاقتها تخفي هديتك.'))}</p>
      <div className={`gm-em${picked ? ' picked' : ''}`}>
        {EMIRATES.map(([k, name, line, [c1, c2]]) => (
          <button key={k} type="button" disabled={Boolean(picked) && picked !== k}
            className={`gm-em-card${picked === k ? ' on' : ''}${picked === k && reveal ? ' flip' : ''}`}
            style={{ '--c1': c1, '--c2': c2 }} onClick={() => pick(k)}>
            <span className="gm-em-front">
              <b dir="rtl">{name.ar}</b>
              <i>{name.en}</i>
              <small>{t(line)}</small>
            </span>
            <span className="gm-em-back">
              <small>{t(name)}</small>
              {reveal && <strong>{t(reveal.prize)}</strong>}
            </span>
          </button>
        ))}
      </div>
      {error && <p className="ct-err" role="alert">{error}</p>}
    </div>
  );
}

/* ── 4. The Golden Key ── */
function KeyStage({ status, onReveal }) {
  const { lang, isAr, t } = useLang();
  const [turning, setTurning] = useState(false);
  const [reveal, setReveal] = useState(null);
  const [error, setError] = useState('');

  const take = async () => {
    setTurning(true); setError('');
    try {
      const r = await playGift({ mode: 'key', lang });
      setTimeout(() => { setReveal(r); onReveal(r); }, 1300);
    } catch (e) { setError(errText(e, t)); setTurning(false); }
  };

  return (
    <div className="gm-stage gm-keystage">
      <div className={`gm-box${turning ? ' turn' : ''}${reveal ? ' open' : ''}`} aria-hidden="true">
        <svg viewBox="0 0 160 120">
          <rect x="22" y="52" width="116" height="60" rx="4" className="gm-box-b" />
          <rect x="18" y="38" width="124" height="18" rx="3" className="gm-box-lid" />
          <rect x="74" y="38" width="12" height="74" className="gm-box-rib" />
          <circle cx="80" cy="78" r="9" className="gm-box-lock" />
        </svg>
        <span className="gm-key">{Icon.key}</span>
      </div>
      {reveal ? (
        <PrizeCard prize={reveal.prize} kicker={isAr ? `المفتاح رقم ${reveal.key_no}` : `Key N° ${reveal.key_no}`} />
      ) : (
        <>
          {status && status.limit > 0 && (
            <p className="gm-keys-left"><b dir="ltr">{status.left}</b> {t(T(`of ${status.limit} keys left today`, `من ${status.limit} مفتاحًا متبقية اليوم`))}</p>
          )}
          <button type="button" className="btn btn-fill" disabled={turning} onClick={take}>{turning ? t(T('Turning the key…', 'يدور المفتاح…')) : t(T('Take a key', 'خذ مفتاحًا'))}</button>
        </>
      )}
      {error && <p className="ct-err" role="alert">{error}</p>}
    </div>
  );
}

const WAYS = [
  ['gift', T('Send a gift', 'أرسل هدية'), T('Send a sealed gift to someone you love. When they open it, you get one too.', 'أرسل هدية مختومة لمن تحب. وعندما يفتحها، تصلك هدية أنت أيضًا.'), T('1 minute', 'دقيقة')],
  ['dune', T('Dig the Dune', 'احفر الكثيب'), T('Wipe the sand with your finger and uncover the chest hiding your gift.', 'امسح الرمل بإصبعك واكتشف الصندوق الذي يخفي هديتك.'), T('20 seconds', '٢٠ ثانية')],
  ['emirates', T('The Seven Emirates', 'الإمارات السبع'), T('Choose your emirate. Its card turns over to show your gift.', 'اختر إمارتك، وتنقلب بطاقتها لتكشف هديتك.'), T('10 seconds', '١٠ ثوانٍ')],
  ['key', T('The Golden Key', 'المفتاح الذهبي'), T("Take one of today's limited golden keys and open your box.", 'خذ أحد مفاتيح اليوم الذهبية المحدودة وافتح صندوقك.'), T('10 seconds', '١٠ ثوانٍ')],
];

export function GiftMajlis() {
  const { isAr, settings, t } = useLang();
  const [mode, setMode] = useState(null);
  const [reveal, setReveal] = useState(null);
  const [done, setDone] = useState(null);
  const [status, setStatus] = useState(null);
  const [already, setAlready] = useState(false);
  const top = useRef(null);

  useEffect(() => {
    getGiftStatus().then(setStatus).catch(() => {});
    try { if (localStorage.getItem('gifts:claimed')) setAlready(true); } catch { /* ignore */ }
  }, []);

  const go = (m) => {
    setMode(m); setReveal(null); setDone(null);
    requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  const finish = (r) => { setDone(r); setAlready(true); };

  const enabled = settings.gifts_enabled !== false && status?.enabled !== false;
  const soldOut = Boolean(status && status.left <= 0);

  if (!enabled) {
    return (
      <div className="gm gm-off">
        <p className="gm-kicker">{t(T('The Gift Majlis', 'مجلس الهدايا'))}</p>
        <h1>{t(T('Our gifts are resting for now', 'الهدايا متوقفة مؤقتًا'))}</h1>
        <p className="gm-lead">{t(T('Please come back soon. In the meantime, discover our perfumes.', 'عد إلينا قريبًا، وإلى ذلك الحين اكتشف عطورنا.'))}</p>
        <Link href="/shop" className="btn btn-fill">{t(T('Discover the perfumes', 'اكتشف العطور'))}</Link>
      </div>
    );
  }

  const way = WAYS.find((w) => w[0] === mode);

  return (
    <div className="gm" ref={top}>
      {!mode ? (
        <>
          <header className="gm-head">
            <p className="gm-kicker">{t(T('The Gift Majlis', 'مجلس الهدايا'))}</p>
            <h1>{t(T('A gift is waiting for you', 'هديتك بانتظارك'))}</h1>
            <p className="gm-lead">{t(T('Choose one way below. It takes a few seconds, and we deliver your gift free across the UAE.', 'اختر طريقة واحدة من الأسفل. تستغرق ثوانيَ معدودة، ونوصل هديتك مجانًا داخل الإمارات.'))}</p>
          </header>
          {already && <p className="gm-banner">{t(T('You have claimed your gift. You can still send one to someone you love.', 'لقد استلمت هديتك. وما زال بإمكانك إرسال هدية لمن تحب.'))}</p>}
          {soldOut && !already && <p className="gm-banner">{t(ERR.sold_out)}</p>}
          <div className="gm-ways">
            {WAYS.map(([k, title, desc, time], i) => {
              const locked = k !== 'gift' && (already || soldOut);
              return (
                <button key={k} type="button" className={`gm-way gm-way-${k}`} disabled={locked || (k === 'gift' && soldOut)} onClick={() => go(k)}>
                  <span className="gm-way-n" dir="ltr">0{i + 1}</span>
                  <span className="gm-way-i">{Icon[k]}</span>
                  <strong>{t(title)}</strong>
                  <span className="gm-way-d">{t(desc)}</span>
                  <span className="gm-way-t">
                    {k === 'key' && status?.limit > 0 && !locked ? (isAr ? `${status.left} مفتاحًا متبقية اليوم` : `${status.left} keys left today`) : t(time)}
                  </span>
                </button>
              );
            })}
          </div>
          <ol className="gm-how">
            <li><b>1</b>{t(T('Choose a way', 'اختر طريقة'))}</li>
            <li><b>2</b>{t(T('Reveal your gift', 'اكشف هديتك'))}</li>
            <li><b>3</b>{t(T('We deliver it free', 'نوصلها لك مجانًا'))}</li>
          </ol>
          <p className="gm-fine">{t(T('One gift per person (per UAE mobile number), while daily gifts last.', 'هدية واحدة لكل شخص (لكل رقم جوال إماراتي)، حتى نفاد هدايا اليوم.'))}</p>
        </>
      ) : (
        <>
          <button type="button" className="gm-back" onClick={() => go(null)}>{isAr ? '→' : '←'} {t(T('All the ways', 'كل الطرق'))}</button>
          <header className="gm-head gm-head-sm">
            <p className="gm-kicker">{t(T('The Gift Majlis', 'مجلس الهدايا'))}</p>
            <h1>{t(way[1])}</h1>
          </header>
          {done ? <Done result={done} onSend={() => go('gift')} /> : (
            <div className={`gm-play${reveal ? ' has-prize' : ''}`}>
              {mode === 'gift' && <SendStage />}
              {mode === 'dune' && <DuneStage onReveal={setReveal} />}
              {mode === 'emirates' && <EmiratesStage onReveal={setReveal} />}
              {mode === 'key' && <KeyStage status={status} onReveal={setReveal} />}
              {reveal && <ClaimForm reveal={reveal} onDone={finish} />}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── The page the gift link opens (/gifts/g/GF-XXXXX) ── */
export function GiftOpen({ gift }) {
  const { lang, isAr, t } = useLang();
  const [state, setState] = useState(gift.claimed ? 'claimed' : 'sealed'); // sealed → opening → open → done
  const [reveal, setReveal] = useState(null);
  const [done, setDone] = useState(null);
  const [error, setError] = useState('');

  const open = async () => {
    setState('opening'); setError('');
    try {
      const r = await openGiftSend(gift.code, lang);
      setTimeout(() => { setReveal(r); setState('open'); }, 1100);
    } catch (e) {
      if (e?.code === 'claimed') { setState('claimed'); return; }
      setError(errText(e, t)); setState('sealed');
    }
  };

  if (done) return <div className="gm"><Done result={done} /></div>;

  return (
    <div className="gm gm-open">
      <header className="gm-head gm-head-sm">
        <p className="gm-kicker">{t(T('A gift for you', 'هدية لك'))}</p>
        <h1>{isAr ? `${gift.to_name}، أرسل لك ${gift.from_name} هدية` : `${gift.to_name}, ${gift.from_name} sent you a gift`}</h1>
      </header>
      {state === 'claimed' ? (
        <div className="gm-done">
          <p>{t(ERR.claimed)}</p>
          <Link href="/gifts" className="btn btn-fill">{t(T('Find a gift of your own', 'احصل على هديتك الخاصة'))}</Link>
        </div>
      ) : (
        <div className={`gm-play${reveal ? ' has-prize' : ''}`}>
          <div className="gm-stage">
            <Envelope to={gift.to_name} from={gift.from_name} open={state !== 'sealed'} />
            {state === 'open' && reveal ? (
              <>
                {gift.message && <blockquote className="gm-msg">“{gift.message}”<cite>{gift.from_name}</cite></blockquote>}
                <PrizeCard prize={reveal.prize} />
              </>
            ) : (
              <button type="button" className="btn btn-fill" disabled={state === 'opening'} onClick={open}>{state === 'opening' ? t(T('Breaking the seal…', 'يُكسر الختم…')) : t(T('Open your gift', 'افتح هديتك'))}</button>
            )}
            {error && <p className="ct-err" role="alert">{error}</p>}
          </div>
          {reveal && <ClaimForm reveal={reveal} onDone={(r) => setDone(r)} title={t(T('Where shall we deliver your gift?', 'إلى أين نوصل هديتك؟'))} />}
        </div>
      )}
    </div>
  );
}

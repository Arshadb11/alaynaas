'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from '@/components/Link';
import { useApp } from './Providers';
import { composeAtelier, reserveAtelier } from '@/lib/api';

/*
 * THE CROWN ATELIER: compose a personal perfume.
 * The questionnaire keys must match the API engine (server/src/services/atelier.engine.js).
 */

const T = (en, ar) => ({ en, ar });
const STEPS = [
  {
    key: 'who', type: 'one', q: T('Who is this perfume for?', 'لمن هذا العطر؟'),
    options: [
      ['self', T('For me', 'لي'), T('A signature of my own', 'بصمة خاصة بي')],
      ['him', T('For him', 'له'), T('Composed for a man', 'مركّب لرجل')],
      ['her', T('For her', 'لها'), T('Composed for a woman', 'مركّب لامرأة')],
      ['gift', T('A gift', 'هدية'), T('For someone special', 'لشخص مميز')],
    ],
  },
  {
    key: 'mood', type: 'many', max: 2, q: T('How should it make you feel?', 'بماذا تريد أن يشعرك؟'), hint: T('Choose up to two', 'اختر حتى خيارين'),
    options: [
      ['majestic', T('Majestic', 'ملكي'), T('Regal, confident, unforgettable', 'واثق ولا يُنسى'), ['#2a1f12', '#b08d57']],
      ['mysterious', T('Mysterious', 'غامض'), T('Deep, smoky, intriguing', 'عميق ومدخّن ومثير'), ['#14171a', '#4b4f58']],
      ['radiant', T('Radiant', 'مشرق'), T('Bright, joyful, luminous', 'مبهج ومضيء'), ['#f2c14e', '#f7e7b4']],
      ['serene', T('Serene', 'هادئ'), T('Soft, calm, clean', 'ناعم وهادئ ونقي'), ['#c9d3cf', '#eef1ee']],
      ['seductive', T('Seductive', 'جذّاب'), T('Warm, magnetic, close', 'دافئ وآسر'), ['#5b1a24', '#b4545f']],
      ['free', T('Free', 'حر'), T('Airy, fresh, open', 'منعش ومنطلق'), ['#7fb3c8', '#dcecf1']],
    ],
  },
  {
    key: 'place', type: 'one', q: T('Where does your scent take you?', 'إلى أين يأخذك عطرك؟'),
    options: [
      ['desert', T('Desert at dusk', 'الصحراء عند الغروب'), T('Warm sand, cool wind', 'رمال دافئة ونسيم بارد'), ['#8a4b25', '#e2a65d']],
      ['taif', T('Taif rose garden', 'بستان ورد الطائف'), T('Petals at first light', 'بتلات مع أول ضوء'), ['#9b3b55', '#efb7c2']],
      ['sea', T('The open sea', 'البحر المفتوح'), T('Salt air, white shore', 'هواء مالح وشاطئ أبيض'), ['#1f5a7a', '#a7d3e3']],
      ['souk', T('The old souk', 'السوق القديم'), T('Saffron, spice, incense', 'زعفران وبهارات وبخور'), ['#7a2e14', '#d98b3a']],
      ['lounge', T('A velvet night', 'ليلة مخملية'), T('Leather, embers, late hours', 'جلد وجمر وسهر'), ['#1d1416', '#6b3a3f']],
      ['orchard', T('A blooming orchard', 'بستان مزهر'), T('Citrus and white flowers', 'حمضيات وزهور بيضاء'), ['#d9a21b', '#f6eab0']],
      ['forest', T('Forest after rain', 'غابة بعد المطر'), T('Cedar, moss, green leaves', 'أرز وطحلب وأوراق'), ['#23402f', '#8db08e']],
    ],
  },
  {
    key: 'occasion', type: 'one', q: T('When will you wear it most?', 'متى سترتديه غالبًا؟'),
    options: [
      ['daily', T('Every day', 'كل يوم'), T('Work, errands, everywhere', 'العمل وكل مكان')],
      ['evening', T('Evenings', 'الأمسيات'), T('Dinners and nights out', 'العشاء والسهرات')],
      ['special', T('Special occasions', 'المناسبات الخاصة'), T('Weddings, celebrations', 'الأعراس والاحتفالات')],
      ['majlis', T('Majlis & gatherings', 'المجالس'), T('To be noticed', 'ليلفت الأنظار')],
      ['summer', T('Hot summer days', 'أيام الصيف الحارة'), T('Light and fresh', 'خفيف ومنعش')],
    ],
  },
  {
    key: 'loves', type: 'many', max: 3, chips: true, q: T('Which scents do you already love?', 'ما الروائح التي تحبها؟'), hint: T('Choose up to three', 'اختر حتى ثلاثة'),
    options: [
      ['oud', T('Oud', 'العود')], ['rose', T('Rose', 'الورد')], ['amber', T('Amber', 'العنبر')], ['musk', T('Musk', 'المسك')],
      ['citrus', T('Citrus', 'الحمضيات')], ['spices', T('Spices', 'البهارات')], ['woods', T('Woods', 'الأخشاب')],
      ['white', T('White flowers', 'الزهور البيضاء')], ['incense', T('Incense & bakhoor', 'البخور')], ['fruity', T('Fruits', 'الفواكه')],
      ['fresh', T('Fresh & marine', 'المنعش والبحري')], ['leather', T('Leather', 'الجلد')], ['sweet', T('Vanilla & sweet', 'الفانيليا والحلو')],
    ],
  },
  {
    key: 'avoid', type: 'many', max: 3, chips: true, optional: true, q: T('Anything you would rather avoid?', 'هل هناك ما تفضّل تجنّبه؟'), hint: T('Optional: skip if nothing', 'اختياري: تخطَّ إن لم يوجد'),
    options: [
      ['sweet', T('Too sweet', 'الحلو جدًا')], ['smoky', T('Smoky', 'المدخّن')], ['floral', T('Too floral', 'الزهري جدًا')],
      ['strong', T('Too strong', 'القوي جدًا')], ['powdery', T('Powdery', 'البودري')], ['fruity', T('Fruity', 'الفاكهي')],
    ],
  },
  { key: 'intensity', type: 'scale', q: T('How strongly should it be felt?', 'ما مدى قوة حضوره؟') },
  { key: 'label', type: 'label', q: T('Whose name goes on the bottle?', 'أي اسم يُكتب على الزجاجة؟'), hint: T('Optional: printed on your label', 'اختياري: يُطبع على الملصق') },
];
const INTENSITY = [
  null, T('Whisper', 'همسة'), T('Soft', 'ناعم'), T('Present', 'حاضر'), T('Bold', 'جريء'), T('Commanding', 'طاغٍ'),
];
const TONES = {
  woody: ['#4a2f1b', '#9a6a3c'], floral: ['#8f3f55', '#e3a0b1'], amber: ['#7a3f10', '#e0a04a'], fresh: ['#3f7b78', '#bfe0d9'],
  spicy: ['#6e2a12', '#c9733a'], musky: ['#8c7e70', '#e6dccf'], smoky: ['#2b2624', '#7b6f66'], sweet: ['#8a3f2a', '#e7a37a'],
};

/* ───────────── The bottle (SVG, tinted by the formula) ───────────── */
export function AtelierBottle({ name, code, label, tone = 'amber', isAr }) {
  const [deep, light] = TONES[tone] || TONES.amber;
  const id = `b${code || 'x'}`.replace(/[^a-z0-9]/gi, '');
  const shortName = String(name || '').length > 22 ? `${String(name).slice(0, 21)}…` : name;
  return (
    <svg className="atl-bottle" viewBox="0 0 300 420" role="img" aria-label={name}>
      <defs>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={light} /><stop offset="1" stopColor={deep} /></linearGradient>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8a6a32" /><stop offset=".45" stopColor="#f3dc9c" /><stop offset=".55" stopColor="#d8b56a" /><stop offset="1" stopColor="#7a5a26" /></linearGradient>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset=".25" stopColor="#fff" stopOpacity="0" /><stop offset=".8" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#fff" stopOpacity=".25" /></linearGradient>
        <radialGradient id={`${id}h`} cx=".5" cy="1" r=".6"><stop offset="0" stopColor="#000" stopOpacity=".18" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx="150" cy="404" rx="118" ry="12" fill={`url(#${id}h)`} />
      {/* cap */}
      <rect x="104" y="18" width="92" height="74" rx="6" fill={`url(#${id}g)`} />
      {Array.from({ length: 11 }).map((_, i) => <rect key={i} x={110 + i * 8} y="24" width="2" height="62" fill="#000" opacity=".12" />)}
      <rect x="122" y="92" width="56" height="16" fill={`url(#${id}g)`} />
      {/* glass + juice */}
      <rect x="40" y="104" width="220" height="296" rx="34" fill="#fff" opacity=".35" stroke="#000" strokeOpacity=".08" />
      <rect x="50" y="128" width="200" height="262" rx="26" fill={`url(#${id}l)`} opacity=".92" />
      <rect x="40" y="104" width="220" height="296" rx="34" fill={`url(#${id}s)`} />
      {/* label */}
      <rect x="78" y="196" width="144" height="128" rx="3" fill="#faf8f3" stroke="#c9a96a" strokeWidth="1.2" />
      <rect x="84" y="202" width="132" height="116" rx="2" fill="none" stroke="#c9a96a" strokeOpacity=".6" strokeWidth=".6" />
      <text x="150" y="226" textAnchor="middle" className="atl-b-house">ALAYNAA&apos;S</text>
      <path d="M140 234 l4 -6 l6 5 l6 -5 l4 6 z" fill="#c9a96a" />
      <text x="150" y="262" textAnchor="middle" className="atl-b-name" direction={isAr ? 'rtl' : 'ltr'}>{shortName}</text>
      {label && <text x="150" y="284" textAnchor="middle" className="atl-b-for" direction={isAr ? 'rtl' : 'ltr'}>{isAr ? `صُنع لـ ${label}` : `Made for ${label}`}</text>}
      <text x="150" y="308" textAnchor="middle" className="atl-b-code">N° {code}</text>
    </svg>
  );
}

/* ───────────── Questionnaire ───────────── */
export function AtelierComposer() {
  const { lang, settings = {} } = useApp();
  const isAr = lang === 'ar';
  const pick = (t) => (t ? (isAr ? t.ar : t.en) : '');
  const router = useRouter();

  const [step, setStep] = useState(-1); // -1 = intro
  const [a, setA] = useState({ who: '', mood: [], place: '', occasion: '', loves: [], avoid: [], intensity: 3, label: '' });
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState(0);
  const [error, setError] = useState('');

  const s = STEPS[step];
  const L = isAr
    ? { kicker: 'أتيليه التاج', title: 'ركّب عطرًا لا يملكه أحد سواك', lead: 'أجب عن أسئلة قليلة، وسيُركّب الأتيليه تركيبة عطرية خاصة بك: نوتاتها، ونسبها، واسمها، وزجاجتها باسمك.', start: 'ابدأ التركيب', meta: ['دقيقتان', '٨ أسئلة', 'تركيبة فريدة'], back: 'رجوع', next: 'التالي', compose: 'ركّب عطري', skip: 'تخطَّ', of: 'من', phases: ['نختار نوتات الافتتاح…', 'نوازن قلب العطر…', 'نعتّق القاعدة…', 'نكتب اسمك على الزجاجة…'], err: 'تعذّر التركيب، حاول مرة أخرى.', placeholder: 'مثال: سارة' }
    : { kicker: 'The Crown Atelier', title: 'Compose a perfume no one else owns', lead: 'Answer a few questions and the Atelier composes a formula that is yours alone: its notes, their proportions, its name, and a bottle with your name on it.', start: 'Begin composing', meta: ['2 minutes', '8 questions', 'One-of-a-kind formula'], back: 'Back', next: 'Next', compose: 'Compose my perfume', skip: 'Skip', of: 'of', phases: ['Selecting the opening notes…', 'Balancing the heart…', 'Ageing the base…', 'Writing your name on the bottle…'], err: 'Could not compose. Please try again.', placeholder: 'e.g. Sara' };

  const enabled = settings.atelier_enabled !== false;
  const gift = isAr ? settings.atelier_gift_ar : settings.atelier_gift_en;

  const valid = useMemo(() => {
    if (!s) return true;
    if (s.type === 'one') return Boolean(a[s.key]);
    if (s.type === 'many') return s.optional || a[s.key].length > 0;
    return true;
  }, [s, a]);

  const choose = (key, val, type, max) => {
    setA((p) => {
      if (type === 'one') return { ...p, [key]: val };
      const cur = p[key];
      if (cur.includes(val)) return { ...p, [key]: cur.filter((x) => x !== val) };
      if (cur.length >= max) return { ...p, [key]: [...cur.slice(1), val] };
      return { ...p, [key]: [...cur, val] };
    });
    if (type === 'one') setTimeout(() => setStep((x) => Math.min(x + 1, STEPS.length - 1)), 260);
  };

  async function compose() {
    setBusy(true); setError(''); setPhase(0);
    const tick = setInterval(() => setPhase((p) => Math.min(p + 1, 3)), 900);
    try {
      const { label, ...answers } = a;
      const [res] = await Promise.all([
        composeAtelier({ answers, label_name: label, lang }),
        new Promise((r) => setTimeout(r, 3400)), // let the moment breathe
      ]);
      try { sessionStorage.setItem(`atelier:${res.code}`, '1'); } catch { /* ignore */ }
      router.push(`${isAr ? '/ar' : ''}/atelier/${res.code}`);
    } catch (e) {
      setError(e?.message || L.err);
      setBusy(false);
    } finally {
      clearInterval(tick);
    }
  }

  if (!enabled) {
    return <div className="atl atl-off"><p>{isAr ? 'الأتيليه غير متاح حاليًا.' : 'The Atelier is closed for now.'}</p><Link href="/shop" className="btn">{isAr ? 'تسوّق المجموعة' : 'Shop the collection'}</Link></div>;
  }

  if (busy) {
    return (
      <div className="atl atl-busy" aria-live="polite">
        <div className="atl-drop" aria-hidden="true"><span /><span /><span /></div>
        <p className="atl-kicker">{L.kicker}</p>
        <p className="atl-phase">{L.phases[phase]}</p>
      </div>
    );
  }

  if (step < 0) {
    return (
      <div className="atl atl-intro">
        <div className="atl-intro-copy">
          <p className="atl-kicker">{L.kicker}</p>
          <h1>{L.title}</h1>
          <p className="atl-lead">{L.lead}</p>
          <ul className="atl-meta">{L.meta.map((m) => <li key={m}>{m}</li>)}</ul>
          <button type="button" className="btn btn-fill atl-start" onClick={() => setStep(0)}>{L.start}</button>
          {gift && <p className="atl-gift-note">{gift}</p>}
        </div>
        <div className="atl-intro-art" aria-hidden="true">
          <AtelierBottle name={isAr ? 'عطرك' : 'Your perfume'} code="AL-?????" label={isAr ? 'أنت' : 'You'} tone="amber" isAr={isAr} />
        </div>
      </div>
    );
  }

  const last = step === STEPS.length - 1;
  return (
    <div className="atl atl-q">
      <div className="atl-progress" aria-hidden="true"><i style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
      <p className="atl-count">{step + 1} {L.of} {STEPS.length}</p>
      <h2 className="atl-question">{pick(s.q)}</h2>
      {s.hint && <p className="atl-hint">{pick(s.hint)}</p>}

      {(s.type === 'one' || s.type === 'many') && !s.chips && (
        <div className={`atl-cards ${s.options[0][3] ? 'atl-cards-tone' : ''}`}>
          {s.options.map(([val, label, sub, tone]) => {
            const on = s.type === 'one' ? a[s.key] === val : a[s.key].includes(val);
            return (
              <button key={val} type="button" className={`atl-card ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => choose(s.key, val, s.type, s.max)}
                style={tone ? { '--c1': tone[0], '--c2': tone[1] } : undefined}>
                {tone && <span className="atl-swatch" aria-hidden="true" />}
                <strong>{pick(label)}</strong>
                {sub && <span>{pick(sub)}</span>}
              </button>
            );
          })}
        </div>
      )}

      {s.chips && (
        <div className="atl-chips">
          {s.options.map(([val, label]) => {
            const on = a[s.key].includes(val);
            return <button key={val} type="button" className={`atl-chip ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => choose(s.key, val, 'many', s.max)}>{pick(label)}</button>;
          })}
        </div>
      )}

      {s.type === 'scale' && (
        <div className="atl-scale">
          <input type="range" min="1" max="5" step="1" value={a.intensity} onChange={(e) => setA((p) => ({ ...p, intensity: Number(e.target.value) }))} aria-valuetext={pick(INTENSITY[a.intensity])} />
          <div className="atl-scale-labels">{[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} className={a.intensity === n ? 'on' : ''} onClick={() => setA((p) => ({ ...p, intensity: n }))}>{pick(INTENSITY[n])}</button>)}</div>
        </div>
      )}

      {s.type === 'label' && (
        <div className="atl-label-step">
          <input className="inp" maxLength={24} value={a.label} placeholder={L.placeholder} onChange={(e) => setA((p) => ({ ...p, label: e.target.value }))} />
          <AtelierBottle name={isAr ? 'عطرك' : 'Your perfume'} code="AL-?????" label={a.label.trim() || (isAr ? '…' : '…')} tone="amber" isAr={isAr} />
        </div>
      )}

      {error && <p className="ct-err">{error}</p>}
      <div className="atl-nav">
        <button type="button" className="atl-back" onClick={() => setStep((x) => x - 1)}>{L.back}</button>
        {last
          ? <button type="button" className="btn btn-fill" onClick={compose}>{L.compose}</button>
          : (s.type !== 'one') && <button type="button" className="btn btn-fill" disabled={!valid} onClick={() => setStep((x) => x + 1)}>{s.optional && !a[s.key].length ? L.skip : L.next}</button>}
      </div>
    </div>
  );
}

/* ───────────── Result ───────────── */
export function AtelierResult({ creation }) {
  const { lang, settings = {}, money } = useApp();
  const isAr = lang === 'ar';
  const f = creation.formula;
  const pk = (o) => (o ? (isAr ? o.ar : o.en) : '');
  const sizes = ['30', '50', '100'].map((sz) => [sz, Number(settings[`atelier_price_${sz}`]) || 0]).filter(([, p]) => p > 0);
  const gift = isAr ? settings.atelier_gift_ar : settings.atelier_gift_en;
  const wa = String(settings.whatsapp_number || '').replace(/\D/g, '');

  const [mine, setMine] = useState(false);
  const [size, setSize] = useState(sizes[1]?.[0] || sizes[0]?.[0] || '');
  const [form, setForm] = useState({ name: '', phone: '', email: '', website: '' });
  const [state, setState] = useState(creation.reserved ? 'taken' : 'idle');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(`atelier:${creation.code}`)) setMine(true);
      if (localStorage.getItem(`atelier:reserved:${creation.code}`)) setState('done');
    } catch { /* ignore */ }
  }, [creation.code]);

  const L = isAr
    ? { kicker: 'تركيبتك', top: 'الافتتاح', heart: 'القلب', base: 'القاعدة', accords: 'الطابع العطري', conc: 'التركيز', lon: 'الثبات', sil: 'الفوحان', reserve: 'احجز تركيبتك', reserveSub: 'سيتواصل معك عطّارنا عبر واتساب لتأكيد طلبك وتجهيزه يدويًا.', name: 'الاسم', phone: 'رقم واتساب', email: 'البريد الإلكتروني (اختياري)', size: 'الحجم', send: 'احجز الآن', sending: 'جارٍ الحجز…', done: 'تم حجز تركيبتك', doneSub: 'سيتواصل معك فريقنا قريبًا عبر واتساب. احتفظ برمز تركيبتك:', chat: 'راسلنا الآن على واتساب', share: 'شارك عطرك', copied: 'تم نسخ الرابط', again: 'ركّب عطرًا آخر', taken: 'هذه التركيبة محجوزة لصاحبها.', own: 'ركّب عطرك الخاص', gift: 'هديتك', price: 'السعر عند الطلب' }
    : { kicker: 'Your formula', top: 'Top', heart: 'Heart', base: 'Base', accords: 'Character', conc: 'Concentration', lon: 'Longevity', sil: 'Sillage', reserve: 'Reserve your formula', reserveSub: 'Our perfumer will contact you on WhatsApp to confirm and prepare it by hand.', name: 'Name', phone: 'WhatsApp number', email: 'Email (optional)', size: 'Size', send: 'Reserve now', sending: 'Reserving…', done: 'Your formula is reserved', doneSub: 'Our team will contact you on WhatsApp shortly. Keep your formula code:', chat: 'Message us on WhatsApp now', share: 'Share your perfume', copied: 'Link copied', again: 'Compose another', taken: 'This formula is reserved by its owner.', own: 'Compose your own', gift: 'Your gift', price: 'Price on request' };

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  async function reserve(e) {
    e.preventDefault();
    setState('sending'); setError('');
    try {
      await reserveAtelier(creation.code, { ...form, size });
      try { localStorage.setItem(`atelier:reserved:${creation.code}`, '1'); } catch { /* ignore */ }
      setState('done');
    } catch (err) {
      setError(err?.message || (isAr ? 'تعذّر الحجز، حاول مرة أخرى.' : 'Could not reserve. Please try again.'));
      setState('idle');
    }
  }

  async function share() {
    const url = window.location.href;
    const title = pk(f.name);
    try {
      if (navigator.share) { await navigator.share({ title, text: isAr ? `ركّبت عطري الخاص «${title}» في أتيليه عاليناء` : `I composed my own perfume, "${title}", at the ALAYNAA'S Atelier`, url }); return; }
      await navigator.clipboard.writeText(url);
      setCopied(true); setTimeout(() => setCopied(false), 1800);
    } catch { /* cancelled */ }
  }

  const chatText = encodeURIComponent(isAr
    ? `مرحبًا، حجزت تركيبتي «${f.name.ar}» (${creation.code})${size ? ` بحجم ${size} مل` : ''}.`
    : `Hello, I reserved my formula "${f.name.en}" (${creation.code})${size ? `, ${size}ml` : ''}.`);
  const otherName = isAr ? f.name.en : f.name.ar;

  return (
    <div className="atl atl-res">
      <section className="atl-hero">
        <div className="atl-hero-art"><AtelierBottle name={pk(f.name)} code={creation.code} label={creation.label_name} tone={f.tone} isAr={isAr} /></div>
        <div className="atl-hero-copy">
          <p className="atl-kicker">{L.kicker} · <span dir="ltr">{creation.code}</span></p>
          <h1>{pk(f.name)}</h1>
          <p className="atl-alt" dir={isAr ? 'ltr' : 'rtl'}>{otherName}</p>
          <p className="atl-story">{pk(f.story)}</p>
          <dl className="atl-specs">
            <div><dt>{L.conc}</dt><dd>{pk(f.concentration)} · {f.concentration.pct}%</dd></div>
            <div><dt>{L.lon}</dt><dd>{pk(f.longevity)}</dd></div>
            <div><dt>{L.sil}</dt><dd>{pk(f.sillage)}</dd></div>
          </dl>
          <div className="atl-actions">
            <button type="button" className="tlink" onClick={share}>{copied ? L.copied : L.share}</button>
            <Link href="/atelier" className="tlink">{mine ? L.again : L.own}</Link>
          </div>
        </div>
      </section>

      <section className="atl-formula">
        <div className="atl-pyr">
          {['top', 'heart', 'base'].map((tier) => (
            <div key={tier} className="atl-tier">
              <h3>{L[tier]}</h3>
              <ul>
                {f.pyramid[tier].map((n) => (
                  <li key={n.key}><span>{pk(n)}</span><b dir="ltr">{n.pct}%</b><i style={{ width: `${Math.min(100, n.pct * 4)}%` }} aria-hidden="true" /></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="atl-acc">
          <h3>{L.accords}</h3>
          {f.accords.map((x) => (
            <div key={x.key} className="atl-acc-row"><span>{pk(x)}</span><i aria-hidden="true"><em style={{ width: `${x.value}%` }} /></i></div>
          ))}
        </div>
      </section>

      <section className="atl-reserve" id="reserve">
        {state === 'done' ? (
          <div className="atl-done">
            <h2>{L.done}</h2>
            <p>{L.doneSub} <strong dir="ltr">{creation.code}</strong></p>
            {gift && <p className="atl-gift"><span>{L.gift}</span>{gift}</p>}
            {wa && <a className="btn btn-fill" href={`https://wa.me/${wa}?text=${chatText}`} target="_blank" rel="noreferrer">{L.chat}</a>}
          </div>
        ) : state === 'taken' && !mine ? (
          <div className="atl-done">
            <p>{L.taken}</p>
            <Link href="/atelier" className="btn btn-fill">{L.own}</Link>
          </div>
        ) : (
          <div className="atl-reserve-grid">
            <div>
              <h2>{L.reserve}</h2>
              <p className="atl-reserve-sub">{L.reserveSub}</p>
              {gift && <p className="atl-gift"><span>{L.gift}</span>{gift}</p>}
            </div>
            <form onSubmit={reserve} className="atl-form">
              {sizes.length > 0 ? (
                <div className="atl-sizes" role="radiogroup" aria-label={L.size}>
                  {sizes.map(([sz, price]) => (
                    <button type="button" role="radio" aria-checked={size === sz} key={sz} className={size === sz ? 'on' : ''} onClick={() => setSize(sz)}>
                      <strong dir="ltr">{sz}ml</strong><span>{money(price)}</span>
                    </button>
                  ))}
                </div>
              ) : <p className="atl-price-note">{L.price}</p>}
              <label>{L.name}<input className="inp" required minLength={2} maxLength={100} value={form.name} onChange={set('name')} autoComplete="name" /></label>
              <label>{L.phone}<input className="inp" required dir="ltr" inputMode="tel" placeholder="+971 50 000 0000" minLength={7} maxLength={20} value={form.phone} onChange={set('phone')} autoComplete="tel" /></label>
              <label>{L.email}<input className="inp" type="email" dir="ltr" maxLength={150} value={form.email} onChange={set('email')} autoComplete="email" /></label>
              <input className="ct-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={set('website')} name="website" />
              {error && <p className="ct-err">{error}</p>}
              <button className="btn btn-fill btn-block" disabled={state === 'sending'}>{state === 'sending' ? L.sending : L.send}</button>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}

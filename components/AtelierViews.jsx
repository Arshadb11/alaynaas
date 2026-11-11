'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from '@/components/Link';
import { useApp } from './Providers';
import { composeAtelier } from '@/lib/api';

/*
 * THE CROWN ATELIER: answer a few questions, receive your Crown Ritual
 * (a layering of an oil, a perfume and bakhoor from the shop, chosen by the API from their notes).
 * The questionnaire keys must match the API engine (server/src/services/atelier.engine.js).
 */

const T = (en, ar) => ({ en, ar });
const STEPS = [
  {
    key: 'who', type: 'one', q: T('Who is this ritual for?', 'لمن هذا الطقس؟'),
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
  { key: 'label', type: 'label', q: T('Whose name goes on the ritual card?', 'أي اسم يُكتب على بطاقة الطقس؟'), hint: T('Optional', 'اختياري') },
];
const INTENSITY = [
  null, T('Whisper', 'همسة'), T('Soft', 'ناعم'), T('Present', 'حاضر'), T('Bold', 'جريء'), T('Commanding', 'طاغٍ'),
];
const TONES = {
  woody: ['#4a2f1b', '#9a6a3c'], floral: ['#8f3f55', '#e3a0b1'], amber: ['#7a3f10', '#e0a04a'], fresh: ['#3f7b78', '#bfe0d9'],
  spicy: ['#6e2a12', '#c9733a'], musky: ['#8c7e70', '#e6dccf'], smoky: ['#2b2624', '#7b6f66'], sweet: ['#8a3f2a', '#e7a37a'],
};

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
    ? { kicker: 'أتيليه التاج', title: 'اكتشف طقس التاج الخاص بك', lead: 'في الخليج يُنسج العطر طبقات: دهن على البشرة، وعطر فوقه، وبخور للثياب والمجلس. أجب عن أسئلة قليلة، وسيبني الأتيليه طقسك من إبداعاتنا، باسم خاص به واسمك عليه.', start: 'ابدأ', meta: ['دقيقتان', '٨ أسئلة', 'طقس خاص بك'], back: 'رجوع', next: 'التالي', compose: 'اكشف طقسي', skip: 'تخطَّ', of: 'من', phases: ['نقرأ إجاباتك…', 'نختار دهن القاعدة…', 'نطابق عطر توقيعك…', 'نكتب اسمك على البطاقة…'], err: 'تعذّر إنشاء طقسك، حاول مرة أخرى.', placeholder: 'مثال: سارة', sample: [['القاعدة', 'دهن عطري'], ['التوقيع', 'عطرك'], ['اللمسة الأخيرة', 'بخور']] }
    : { kicker: 'The Crown Atelier', title: 'Discover your Crown Ritual', lead: 'In the Gulf, a scent is worn in layers: an oil on the skin, a perfume over it, and bakhoor for the clothes and the majlis. Answer a few questions and the Atelier builds yours from our creations, with a name of its own and yours on it.', start: 'Begin', meta: ['2 minutes', '8 questions', 'A ritual of your own'], back: 'Back', next: 'Next', compose: 'Reveal my ritual', skip: 'Skip', of: 'of', phases: ['Reading your answers…', 'Choosing your base oil…', 'Matching your signature perfume…', 'Writing your name on the card…'], err: 'Could not create your ritual. Please try again.', placeholder: 'e.g. Sara', sample: [['The base', 'A perfume oil'], ['The signature', 'Your perfume'], ['The finish', 'Bakhoor']] };
  const sampleSteps = L.sample.map(([title, name]) => ({ title, name }));

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
          <RitualCard name={isAr ? 'طقسك' : 'Your ritual'} code="AL-?????" label={isAr ? 'أنت' : 'You'} steps={sampleSteps} isAr={isAr} preview />
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
          <RitualCard name={isAr ? 'طقسك' : 'Your ritual'} code="AL-?????" label={a.label.trim() || '…'} steps={sampleSteps} isAr={isAr} preview />
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

/* ───────────── The ritual card (hero of the result, also a preview while answering) ───────────── */
export function RitualCard({ name, code, label, steps = [], tone = 'amber', isAr, preview }) {
  const [deep, light] = TONES[tone] || TONES.amber;
  return (
    <div className={`atl-card-r${preview ? ' is-preview' : ''}`} style={{ '--t1': deep, '--t2': light }} dir={isAr ? 'rtl' : 'ltr'}>
      <span className="atl-card-r-house">ALAYNAA&apos;S</span>
      <svg className="atl-card-r-crown" viewBox="0 0 40 24" aria-hidden="true"><path d="M3 21 L6 6 L14 13 L20 2 L26 13 L34 6 L37 21 Z" /></svg>
      <span className="atl-card-r-kick">{isAr ? 'طقس التاج' : 'The Crown Ritual'}</span>
      <strong className="atl-card-r-name">{name}</strong>
      {label && <em className="atl-card-r-for">{isAr ? `صُنع لـ ${label}` : `Made for ${label}`}</em>}
      <ol className="atl-card-r-steps">
        {steps.map((s, i) => (
          <li key={i}><span>{String(i + 1).padStart(2, '0')} · {s.title}</span><b>{s.name}</b></li>
        ))}
      </ol>
      <span className="atl-card-r-code" dir="ltr">N° {code}</span>
    </div>
  );
}

/* A 1080×1920 image of the card for Instagram / Snapchat stories (drawn in the browser, nothing uploaded) */
async function storyImage({ name, label, code, steps, isAr }) {
  const W = 1080; const H = 1920;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  const font = getComputedStyle(document.body).fontFamily;
  try { await document.fonts?.ready; } catch { /* ignore */ }
  const g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#1d3025'); g.addColorStop(1, '#0d1611');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.strokeStyle = '#b8935a'; x.lineWidth = 3; x.strokeRect(70, 70, W - 140, H - 140);
  x.lineWidth = 1; x.strokeRect(92, 92, W - 184, H - 184);
  x.textAlign = 'center'; x.direction = isAr ? 'rtl' : 'ltr';
  const text = (t, y, size, color, weight = 400, spacing = 0) => {
    x.font = `${weight} ${size}px ${font}`; x.fillStyle = color;
    if ('letterSpacing' in x) x.letterSpacing = `${spacing}px`;
    x.fillText(t, W / 2, y);
  };
  const wrap = (t, size, weight, max) => {
    x.font = `${weight} ${size}px ${font}`;
    const words = String(t).split(' '); const lines = []; let line = '';
    words.forEach((w) => { const test = line ? `${line} ${w}` : w; if (x.measureText(test).width > max && line) { lines.push(line); line = w; } else line = test; });
    if (line) lines.push(line);
    return lines;
  };
  text("ALAYNAA'S", 250, 34, '#b8935a', 500, 12);
  x.save(); x.translate(W / 2 - 40, 285); x.scale(2, 2); x.fillStyle = '#b8935a';
  x.fill(new Path2D('M3 21 L6 6 L14 13 L20 2 L26 13 L34 6 L37 21 Z')); x.restore();
  text(isAr ? 'طقس التاج' : 'THE CROWN RITUAL', 420, 34, '#b8935a', 400, isAr ? 0 : 8);
  let y = 590;
  wrap(name, 100, 300, 840).forEach((l) => { text(l, y, 100, '#f4efe5', 300); y += 118; });
  if (label) { text(isAr ? `صُنع لـ ${label}` : `Made for ${label}`, y + 10, 42, '#cfc6b4', 400); y += 70; }
  y = Math.max(y + 110, 1000);
  steps.forEach((s, i) => {
    x.strokeStyle = 'rgba(184,147,90,.45)'; x.lineWidth = 1;
    x.beginPath(); x.moveTo(220, y - 70); x.lineTo(W - 220, y - 70); x.stroke();
    text(`${String(i + 1).padStart(2, '0')} · ${s.title}`, y, 30, '#b8935a', 500, isAr ? 0 : 6);
    text(s.name, y + 72, 58, '#f4efe5', 400);
    y += 210;
  });
  text(`N° ${code}`, 1650, 32, '#b8935a', 500, 6);
  text('alaynaas.com/atelier', 1720, 34, '#cfc6b4', 400, 2);
  return new Promise((r) => c.toBlob(r, 'image/png'));
}

/* ───────────── Result: the Crown Ritual ───────────── */
export function AtelierResult({ creation }) {
  const { lang, settings = {}, money, addRitual, addItem, items } = useApp();
  const isAr = lang === 'ar';
  const f = creation.formula;
  const pk = (o) => (o ? (isAr ? o.ar : o.en) : '');
  const pname = (p) => (isAr ? p.name_ar || p.name : p.name);
  const unit = (p) => p.variants?.[0]?.price ?? p.price;
  const gift = isAr ? settings.atelier_gift_ar : settings.atelier_gift_en;
  const steps = creation.ritual || [];
  const pct = Number(creation.discount) || 0;

  const [mine, setMine] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    try { if (sessionStorage.getItem(`atelier:${creation.code}`)) setMine(true); } catch { /* ignore */ }
  }, [creation.code]);

  const L = isAr
    ? { kicker: 'طقس التاج الخاص بك', steps: steps.length === 3 ? 'طقسك في ثلاث خطوات' : 'طقسك في خطوتين', step: 'الخطوة', match: 'تطابق', view: 'عرض التفاصيل', addAll: 'أضف طقسي إلى السلة', inBag: 'طقسك في السلة', total: 'إجمالي الطقس', save: `وفّر ${pct}% عند طلبها معًا`, gift: 'هديتك', share: 'شارك الرابط', story: 'احفظ صورة للقصص', saving: 'جارٍ التحضير…', copied: 'تم نسخ الرابط', again: 'اكتشف طقسًا آخر', own: 'اكتشف طقسك الخاص', more: 'إبداعات أخرى ستحبها', addOne: 'أضف إلى السلة', discT: 'لم تقرر بعد؟', discP: 'جرّب مجموعة الاستكشاف أولًا واكتشف المفضل لديك في بيتك.', character: 'الطابع', empty: 'نجهّز طقسك قريبًا. اكتشف مجموعتنا في الأثناء.', shop: 'تسوّق المجموعة' }
    : { kicker: 'Your Crown Ritual', steps: steps.length === 3 ? 'Your ritual, in three steps' : 'Your ritual, in two steps', step: 'Step', match: 'match', view: 'View details', addAll: 'Add my ritual to bag', inBag: 'Your ritual is in your bag', total: 'Ritual total', save: `Save ${pct}% when ordered together`, gift: 'Your gift', share: 'Share link', story: 'Save image for Stories', saving: 'Preparing…', copied: 'Link copied', again: 'Discover another ritual', own: 'Discover your own ritual', more: 'More creations you would love', addOne: 'Add to bag', discT: 'Not sure yet?', discP: 'Try our Discovery Set first and find your favourite at home.', character: 'Character', empty: 'Your ritual is being prepared. Meanwhile, discover the collection.', shop: 'Shop the collection' };

  const full = steps.reduce((s, st) => s + unit(st.product), 0);
  const off = Math.round(full * pct) / 100;
  const inBag = steps.length > 0 && steps.every((st) => items.some((i) => Number(i.productId ?? parseInt(i.id, 10)) === st.product.id));
  const cardSteps = steps.map((st) => ({ title: pk(st.title), name: pname(st.product) }));

  const addAll = () => addRitual(steps.map((st) => ({ ...st.product, name: pname(st.product) })), { code: creation.code, ids: steps.map((st) => st.product.id), pct });

  async function share() {
    const url = window.location.href;
    const title = pk(f.name);
    try {
      if (navigator.share) { await navigator.share({ title, text: isAr ? `اكتشفت طقس التاج الخاص بي «${title}» في أتيليه عاليناء` : `I discovered my Crown Ritual, "${title}", at the ALAYNAA'S Atelier`, url }); return; }
      await navigator.clipboard.writeText(url);
      setCopied(true); setTimeout(() => setCopied(false), 1800);
    } catch { /* cancelled */ }
  }

  async function saveStory() {
    setSaving(true);
    try {
      const blob = await storyImage({ name: pk(f.name), label: creation.label_name, code: creation.code, steps: cardSteps, isAr });
      const file = new File([blob], `crown-ritual-${creation.code}.png`, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: pk(f.name) }); return; }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } catch { /* cancelled */ } finally { setSaving(false); }
  }

  const otherName = isAr ? f.name.en : f.name.ar;

  return (
    <div className="atl atl-res">
      <section className="atl-hero">
        <div className="atl-hero-art">
          <RitualCard name={pk(f.name)} code={creation.code} label={creation.label_name} steps={cardSteps} tone={f.tone} isAr={isAr} />
        </div>
        <div className="atl-hero-copy">
          <p className="atl-kicker">{L.kicker} · <span dir="ltr">{creation.code}</span></p>
          <h1>{pk(f.name)}</h1>
          <p className="atl-alt" dir={isAr ? 'ltr' : 'rtl'}>{otherName}</p>
          <p className="atl-story">{pk(creation.story)}</p>
          {f.accords?.length > 0 && (
            <p className="atl-char"><span>{L.character}</span>{f.accords.slice(0, 3).map((x) => pk(x)).join(' · ')}</p>
          )}
          <div className="atl-actions">
            <button type="button" className="tlink" onClick={saveStory} disabled={saving}>{saving ? L.saving : L.story}</button>
            <button type="button" className="tlink" onClick={share}>{copied ? L.copied : L.share}</button>
            <Link href="/atelier" className="tlink">{mine ? L.again : L.own}</Link>
          </div>
        </div>
      </section>

      {steps.length === 0 ? (
        <section className="atl-done"><p>{L.empty}</p><Link href="/shop" className="btn btn-fill">{L.shop}</Link></section>
      ) : (
        <section className="atl-ritual" id="ritual">
          <h2>{L.steps}</h2>
          <ol className="atl-steps">
            {steps.map((st, i) => (
              <li key={st.product.id} className="atl-step">
                <Link href={`/fragrance/${st.product.slug}`} className="atl-step-img">
                  {st.product.image && <img src={st.product.image} alt={pname(st.product)} loading="lazy" />}
                </Link>
                <div className="atl-step-body">
                  <p className="atl-step-k">{L.step} {i + 1} · {pk(st.title)}</p>
                  <h3><Link href={`/fragrance/${st.product.slug}`}>{pname(st.product)}</Link></h3>
                  <p className="atl-step-meta">{pk(st.product.category)} · <span dir="ltr">{st.product.variants?.[0]?.label || st.product.size || ''}</span> · {money(unit(st.product))}</p>
                  <p className="atl-step-why"><b dir="ltr">{st.match}%</b> {L.match} · {pk(st.why)}</p>
                  <p className="atl-step-how">{pk(st.how)}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="atl-buy">
            <div className="atl-buy-sum">
              <span>{L.total}</span>
              <p>
                {off > 0 && <s>{money(full)}</s>}
                <strong>{money(full - off)}</strong>
              </p>
              {off > 0 && <em>{L.save}</em>}
            </div>
            {gift && <p className="atl-gift"><span>{L.gift}</span>{gift}</p>}
            <button type="button" className="btn btn-fill btn-block" onClick={addAll}>{inBag ? L.inBag : L.addAll}</button>
          </div>
        </section>
      )}

      {creation.matches?.length > 0 && (
        <section className="atl-more">
          <h2>{L.more}</h2>
          <div className="atl-more-grid">
            {creation.matches.map((m) => (
              <article key={m.product.id} className="atl-more-card">
                <Link href={`/fragrance/${m.product.slug}`} className="atl-more-img">
                  {m.product.image && <img src={m.product.image} alt={pname(m.product)} loading="lazy" />}
                  <span className="atl-more-pct" dir="ltr">{m.match}%</span>
                </Link>
                <h3><Link href={`/fragrance/${m.product.slug}`}>{pname(m.product)}</Link></h3>
                <p className="atl-more-why">{pk(m.why)}</p>
                <div className="atl-more-foot">
                  <span>{money(unit(m.product))}</span>
                  <button type="button" className="pc-add" onClick={() => addItem({ ...m.product, name: pname(m.product) }, 1, m.product.variants?.[0])}>{L.addOne}</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {creation.discovery && (
        <section className="atl-disc">
          <div>
            <h2>{L.discT}</h2>
            <p>{L.discP}</p>
          </div>
          <div className="atl-disc-act">
            <span>{pname(creation.discovery)} · {money(unit(creation.discovery))}</span>
            <button type="button" className="btn" onClick={() => addItem({ ...creation.discovery, name: pname(creation.discovery) }, 1, creation.discovery.variants?.[0])}>{L.addOne}</button>
          </div>
        </section>
      )}
    </div>
  );
}

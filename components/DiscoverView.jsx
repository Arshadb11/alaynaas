'use client';
import { useMemo, useState } from 'react';
import Link from '@/components/Link';
import { useApp, useTone } from './Providers';
import { Icon } from './Chrome';
import { ShopProductCard } from './ShopCatalogView';

/* A quiet diagnostic: the hour, the mood, the notes that feel closest.
   Nothing is explained, the customer simply chooses by instinct.
   Matching reads the real catalogue (olfactory families + product type), and a note
   group is only offered when at least one product actually belongs to it. */

const STEPS = ['hour', 'mood', 'notes'];

const HOURS = [
  { k: 'dawn', tokens: ['citrus', 'fresh', 'green', 'aquatic', 'floral', 'fruity', 'powdery'] },
  { k: 'midday', tokens: ['citrus', 'fresh', 'fruity', 'floral', 'aquatic', 'green'] },
  { k: 'dusk', tokens: ['amber', 'oriental', 'spicy', 'woody', 'wood', 'floral', 'incense'] },
  { k: 'night', tokens: ['oud', 'vanilla', 'amber', 'oriental', 'leather', 'musk', 'incense', 'gourmand', 'wood'] },
];
const MOODS = [
  { k: 'calm', tokens: ['musk', 'floral', 'powdery', 'vanilla', 'wood', 'woody', 'green'] },
  { k: 'radiant', tokens: ['citrus', 'fresh', 'fruity', 'floral', 'aquatic'] },
  { k: 'intimate', tokens: ['musk', 'vanilla', 'amber', 'floral', 'gourmand', 'sweet', 'oriental'] },
  { k: 'commanding', tokens: ['oud', 'leather', 'oriental', 'spicy', 'amber', 'incense', 'wood', 'woody'] },
];
const NOTES = [
  { k: 'citrus', tokens: ['citrus', 'fresh', 'aquatic', 'green', 'fruity'] },
  { k: 'floral', tokens: ['floral', 'rose', 'jasmine', 'powdery'] },
  { k: 'wood', tokens: ['wood', 'woody', 'oud', 'leather', 'incense', 'santal', 'sandal'] },
  { k: 'amber', tokens: ['amber', 'oriental', 'spicy', 'spice'] },
  { k: 'vanilla', tokens: ['vanilla', 'gourmand', 'sweet', 'musk'] },
];
// Products without olfactory families still have a character through what they are
const CATEGORY_TOKENS = {
  bakhoor: ['incense', 'oud', 'amber', 'wood'],
  'oud-maattar': ['oud', 'wood', 'amber', 'incense'],
  'concentrated-oils': ['musk', 'oud', 'amber'],
};

const T = {
  en: {
    kicker: 'Discover',
    title: 'A quiet diagnostic',
    lead: 'Choose instinctively.',
    sub: 'Fragrance is often understood by skin before it is explained by language. Three quiet questions: the hour, the mood, the notes that feel closest to you.',
    roman: { hour: 'I', mood: 'II', notes: 'III' },
    q: { hour: 'The hour', mood: 'The mood', notes: 'The notes' },
    ask: {
      hour: 'Which hour feels most like you?',
      mood: 'How do you want to be felt?',
      notes: 'Which notes feel closest to your skin?',
    },
    hours: {
      dawn: ['Dawn', 'first light, skin still warm'],
      midday: ['Midday', 'open air, nothing to hide'],
      dusk: ['Dusk', 'last light, the room softens'],
      night: ['Midnight', 'after dark, close and slow'],
    },
    moods: {
      calm: ['Calm', 'quiet and settled'],
      radiant: ['Radiant', 'bright, easy, awake'],
      intimate: ['Intimate', 'close enough to be remembered'],
      commanding: ['Commanding', 'present before you speak'],
    },
    notes: {
      citrus: ['Citrus and air', 'bright, clean, green'],
      floral: ['Flowers', 'petal, powder, soft'],
      wood: ['Wood and oud', 'dry, resinous, deep'],
      amber: ['Amber and spice', 'warm, glowing, rich'],
      vanilla: ['Vanilla and musk', 'skin-like, sweet, close'],
    },
    skip: 'I cannot say',
    back: 'Back',
    restart: 'Begin again',
    reading: 'Your reading',
    readingFor: (h, m, n) => [h && `at ${h.toLowerCase()}`, m && m.toLowerCase(), n && `drawn to ${n.toLowerCase()}`].filter(Boolean).join(', '),
    closest: 'Closest to you',
    closestSub: 'Ordered by how near each one sits to what you chose. Try it on skin, let it settle, and let it decide.',
    why: 'Matched on',
    browse: 'Browse the full shop',
    none: 'Nothing is available right now.',
  },
  ar: {
    kicker: 'اكتشف',
    title: 'تشخيص هادئ',
    lead: 'اختر بالفطرة.',
    sub: 'غالباً ما تفهم البشرة العطر قبل أن تشرحه اللغة. ثلاثة أسئلة هادئة: الساعة، والمزاج، والنفحات الأقرب إليك.',
    roman: { hour: 'I', mood: 'II', notes: 'III' },
    q: { hour: 'الساعة', mood: 'المزاج', notes: 'النفحات' },
    ask: {
      hour: 'أي ساعة تشبهك أكثر؟',
      mood: 'كيف تريد أن يُشعَر بك؟',
      notes: 'أي النفحات أقرب إلى بشرتك؟',
    },
    hours: {
      dawn: ['الفجر', 'أول الضوء والبشرة ما زالت دافئة'],
      midday: ['الظهيرة', 'هواء مفتوح لا شيء يُخفى'],
      dusk: ['الغروب', 'آخر الضوء وتلين الغرفة'],
      night: ['منتصف الليل', 'بعد العتمة، قريب وبطيء'],
    },
    moods: {
      calm: ['هادئ', 'ساكن ومطمئن'],
      radiant: ['مشرق', 'خفيف ومتيقظ'],
      intimate: ['حميم', 'قريب بما يكفي ليُتذكَّر'],
      commanding: ['حاضر بقوة', 'حضورك قبل كلامك'],
    },
    notes: {
      citrus: ['الحمضيات والهواء', 'منعش ونظيف وأخضر'],
      floral: ['الأزهار', 'بتلات وبودرة ونعومة'],
      wood: ['الخشب والعود', 'جاف وراتنجي وعميق'],
      amber: ['العنبر والتوابل', 'دافئ ومتوهج وغني'],
      vanilla: ['الفانيلا والمسك', 'كالبشرة، حلو وقريب'],
    },
    skip: 'لا أستطيع القول',
    back: 'رجوع',
    restart: 'ابدأ من جديد',
    reading: 'قراءتك',
    readingFor: (h, m, n) => [h && `عند ${h}`, m, n && `تميل إلى ${n}`].filter(Boolean).join('، '),
    closest: 'الأقرب إليك',
    closestSub: 'مرتبة بحسب قربها مما اخترته. جرّبه على بشرتك، ودعه يستقر، ودعه يقرر.',
    why: 'تطابق في',
    browse: 'تصفح المتجر بالكامل',
    none: 'لا توجد عطور متاحة حالياً.',
  },
};

const familiesOf = (p) => String(p.family_slugs || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
const tokensOf = (p) => {
  const fam = familiesOf(p).flatMap((s) => s.split(/[-_]/));
  const cat = CATEGORY_TOKENS[p.category] || [];
  return [...new Set([...fam, ...cat])];
};
const hits = (tokens, group) => group.tokens.filter((x) => tokens.includes(x)).length > 0;

export function DiscoverView({ products = [] }) {
  useTone('dark');
  const { lang } = useApp();
  const t = T[lang === 'ar' ? 'ar' : 'en'];
  const [ans, setAns] = useState({});

  const pool = useMemo(
    () => products.filter((p) => p.in_stock !== false).map((p) => ({ p, tokens: tokensOf(p) })),
    [products]
  );

  // Offer a note group only if the catalogue really has something in it
  const noteOptions = useMemo(() => NOTES.filter((g) => pool.some((x) => hits(x.tokens, g))), [pool]);

  const optionsFor = (s) => (s === 'hour' ? HOURS : s === 'mood' ? MOODS : noteOptions);
  const labelsFor = (s) => (s === 'hour' ? t.hours : s === 'mood' ? t.moods : t.notes);
  const current = STEPS.find((s) => ans[s] === undefined && (s !== 'notes' || noteOptions.length > 0));
  const done = !current;
  const index = STEPS.indexOf(current);

  const pick = (s, v) => { setAns((a) => ({ ...a, [s]: v })); toTop(); };
  const toTop = () => setTimeout(() => document.querySelector('.dq-stage')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
  const back = () => {
    const last = [...STEPS].reverse().find((s) => ans[s] !== undefined);
    if (last) setAns((a) => { const n = { ...a }; delete n[last]; return n; });
    toTop();
  };
  const reset = () => { setAns({}); toTop(); };

  // Rank by how near each product sits to the three choices. Choosing "I cannot say" skips that question.
  const results = useMemo(() => {
    if (!done) return [];
    const hour = HOURS.find((x) => x.k === ans.hour);
    const mood = MOODS.find((x) => x.k === ans.mood);
    const note = NOTES.find((x) => x.k === ans.notes);
    const ranked = pool
      .map(({ p, tokens }) => {
        const m = { hour: !!hour && hits(tokens, hour), mood: !!mood && hits(tokens, mood), notes: !!note && hits(tokens, note) };
        const score = (m.notes ? 4 : 0) + (m.hour ? 2 : 0) + (m.mood ? 2 : 0);
        return { p, m, score };
      })
      .sort((a, b) => b.score - a.score || (b.p.is_featured ? 1 : 0) - (a.p.is_featured ? 1 : 0));
    const best = ranked.filter((r) => r.score > 0);
    return (best.length ? best : ranked).slice(0, 4);
  }, [done, ans, pool]);

  const word = (s, k) => (k && k !== 'any' ? labelsFor(s)[k]?.[0] : '');
  const reading = t.readingFor(word('hour', ans.hour), word('mood', ans.mood), word('notes', ans.notes));

  return (
    <div className="dq">
      <section className="dq-head">
        <div className="pd-wrap">
          <p className="pd-kicker">{t.kicker}</p>
          <h1 className="dq-title">{t.title}</h1>
          <p className="dq-lead">{t.lead}</p>
          <p className="dq-sub">{t.sub}</p>
        </div>
      </section>

      <section className="dq-stage">
        <div className="pd-wrap">
          {pool.length === 0 ? (
            <p className="cat-empty">{t.none}</p>
          ) : (
            <>
              <ol className="dq-trail" aria-label="Progress">
                {STEPS.filter((s) => s !== 'notes' || noteOptions.length > 0).map((s, i) => {
                  const state = ans[s] !== undefined ? 'done' : s === current ? 'now' : '';
                  return (
                    <li key={s} className={state}>
                      <span className="dq-trail-n">{t.roman[s]}</span>
                      <span className="dq-trail-l">{t.q[s]}</span>
                      {ans[s] !== undefined && ans[s] !== 'any' && <em>{word(s, ans[s])}</em>}
                    </li>
                  );
                })}
              </ol>

              {current ? (
                <div className="dq-q" key={current}>
                  <p className="pd-kicker">{t.roman[current]} · {t.q[current]}</p>
                  <h2 className="dq-ask">{t.ask[current]}</h2>
                  <ul className="dq-opts" style={{ '--n': optionsFor(current).length }}>
                    {optionsFor(current).map((o) => (
                      <li key={o.k}>
                        <button type="button" onClick={() => pick(current, o.k)}>
                          <span className="dq-w">{labelsFor(current)[o.k][0]}</span>
                          <span className="dq-d">{labelsFor(current)[o.k][1]}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="dq-nav">
                    {index > 0 && <button type="button" className="dc-link" onClick={back}>← {t.back}</button>}
                    <button type="button" className="dc-link" onClick={() => pick(current, 'any')}>{t.skip}</button>
                  </div>
                </div>
              ) : (
                <div className="dq-res" key="res">
                  <p className="pd-kicker">{t.reading}</p>
                  {reading && <h2 className="dq-ask">{reading}.</h2>}
                  <p className="dq-sub">{t.closestSub}</p>
                  <div className="sh-grid dq-grid">
                    {results.map(({ p, m }) => (
                      <div key={p.id || p.slug} className="dq-card">
                        <ShopProductCard product={p} />
                        {(m.hour || m.mood || m.notes) && (
                          <p className="dq-why">
                            <span>{t.why}</span>
                            {m.notes && <b>{word('notes', ans.notes)}</b>}
                            {m.hour && <b>{word('hour', ans.hour)}</b>}
                            {m.mood && <b>{word('mood', ans.mood)}</b>}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="dc-nav">
                    <button type="button" className="dc-btn" onClick={reset}>{t.restart}</button>
                    <button type="button" className="dc-link" onClick={back}>← {t.back}</button>
                    <Link href="/shop" className="dc-link">{t.browse}</Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

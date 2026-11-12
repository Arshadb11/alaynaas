/* "Ask the house" + "Your questions about X": built from each product's own admin data
   (notes, families, gender, sizes, specifications), so every perfume gets its own answers.
   Used by the product page and by the FAQ structured data for Google. */

function specs(p) {
  let s = p?.specifications;
  if (typeof s === 'string') { try { s = JSON.parse(s); } catch { s = null; } }
  return s && typeof s === 'object' ? s : {};
}
const str = (v) => (typeof v === 'string' ? v.trim() : '');

function list(items, ar) {
  const xs = items.filter(Boolean);
  if (xs.length <= 1) return xs[0] || '';
  const last = xs[xs.length - 1];
  return ar ? `${xs.slice(0, -1).join('، ')} و${last}` : `${xs.slice(0, -1).join(', ')}${xs.length > 2 ? ',' : ''} and ${last}`;
}

// English note names read mid-sentence: lower case, except place names (Italian bergamot, Haitian vetiver)
const PLACE = /^(Italian|Calabrian|Sicilian|Haitian|African|Bulgarian|Turkish|Indian|Cambodian|Hindi|Taif|Madagascan|Bourbon|Mysore|Egyptian|Moroccan|Omani|Somali|Damask|Tahitian)$/;
const lowerNote = (n) => String(n).split(' ').map((w) => (PLACE.test(w) ? w : w.toLowerCase())).join(' ');

function noteNames(p, level, ar, max) {
  const items = (p.note_items?.[level] || []).map((n) => (ar ? n.name_ar || n.name : lowerNote(n.name)));
  return max ? items.slice(0, max) : items;
}

const SILLAGE_AR = { soft: 'خفيف', light: 'خفيف', intimate: 'قريب من البشرة', moderate: 'معتدل', strong: 'قوي', heavy: 'قوي جدًا', enormous: 'قوي جدًا' };
const OCC_AR = { evening: 'المساء', everyday: 'كل يوم', daytime: 'النهار', day: 'النهار', night: 'الليل', office: 'العمل', 'special occasions': 'المناسبات الخاصة' };
const arOf = (map, v) => map[String(v || '').toLowerCase().trim()] || v;

/* Ask the house: the admin's own text (spec ask_house / ask_house_ar), or a description from the notes. */
export function askHouse(p, lang) {
  const ar = lang === 'ar';
  const sp = specs(p);
  const own = str(ar ? sp.ask_house_ar : sp.ask_house);
  if (own) return own;
  const top = noteNames(p, 'top', ar, 2), heart = noteNames(p, 'heart', ar, 2), base = noteNames(p, 'base', ar, 3);
  if (!top.length && !heart.length && !base.length) return '';
  if (ar) {
    return [
      top.length ? `في الدقائق الأولى ستفوح منك رائحة ${list(top, true)}.` : '',
      heart.length ? `ثم يظهر ${list(heart, true)} قريبًا من بشرتك.` : '',
      base.length ? `وما يبقى معك لساعات هو ${list(base, true)}.` : '',
    ].filter(Boolean).join(' ');
  }
  return [
    top.length ? `In the first minutes you will smell of ${list(top)}.` : '',
    heart.length ? `Then ${list(heart)} come through, close to your skin.` : '',
    base.length ? `What stays with you for hours is ${list(base)}.` : '',
  ].filter(Boolean).join(' ');
}

/* The questions. Each answer only appears when the product has the data for it. */
export function productQa(p, lang, money) {
  if (!p) return [];
  const ar = lang === 'ar';
  const sp = specs(p);
  // Latin names inside Arabic sentences are isolated so the «» and ؟ stay in place
  const name = ar ? `\u2068${p.name_ar || p.name}\u2069` : p.name;
  const fmt = money || ((n) => (ar ? `${n} د.إ` : `AED ${n}`));
  const out = [];
  const add = (q, a) => { if (q && a) out.push({ q, a }); };

  // 1. What does it smell like?
  const top = noteNames(p, 'top', ar), heart = noteNames(p, 'heart', ar), base = noteNames(p, 'base', ar), gen = noteNames(p, 'general', ar);
  const fam = p.fragrance_family ? (ar ? p.fragrance_family.ar : p.fragrance_family.en) : '';
  const famList = fam ? fam.split(' · ').filter(Boolean) : [];
  const famTxt = famList.length ? list(ar ? famList : famList.map((x) => x.toLowerCase()), ar) : '';
  if (top.length || heart.length || base.length || gen.length) {
    const a = ar
      ? [
          top.length ? `يفتتح «${name}» بنفحات من ${list(top, true)}.` : '',
          heart.length ? `في القلب ${list(heart, true)}.` : '',
          base.length ? `ثم يستقر على ${list(base, true)}.` : '',
          gen.length && !top.length ? `من مكوناته ${list(gen, true)}.` : '',
          famTxt ? `ينتمي إلى ${famList.length > 1 ? 'عائلات' : 'عائلة'} ${famTxt}.` : '',
        ]
      : [
          top.length ? `${name} opens with ${list(top)}.` : '',
          heart.length ? `The heart is ${list(heart)}.` : '',
          base.length ? `It settles on ${list(base)}.` : '',
          gen.length && !top.length ? `Its notes include ${list(gen)}.` : '',
          famTxt ? `It belongs to the ${famTxt} ${famList.length > 1 ? 'families' : 'family'}.` : '',
        ];
    add(ar ? `ما هي رائحة «${name}»؟` : `What does ${name} smell like?`, a.filter(Boolean).join(' '));
  }

  // 2. Men or women?
  const g = String(p.gender || '').toLowerCase();
  if (g) {
    const a = /uni/.test(g)
      ? (ar ? `«${name}» عطر للجنسين، يرتديه الرجال والنساء. اختره لأنك تحب مكوناته، لا لأنه مصنّف لأحد.` : `${name} is unisex: men and women both wear it. Choose it because you love the notes, not because of a label.`)
      : /wom|fem|her/.test(g)
        ? (ar ? `صُمّم «${name}» بطابع أنثوي، ومع ذلك يرتديه كثير من الرجال.` : `${name} leans feminine, though plenty of men wear it too.`)
        : /men|masc|him|male/.test(g)
          ? (ar ? `صُمّم «${name}» بطابع رجالي، ومع ذلك ترتديه كثير من النساء.` : `${name} leans masculine, though plenty of women wear it too.`)
          : '';
    add(ar ? `هل «${name}» للرجال أم للنساء؟` : `Is ${name} for men or women?`, a);
  }

  // 3. How long does it last?
  const lon = str(sp.longevity), sil = str(sp.sillage);
  if (lon || sil) {
    const a = ar
      ? [
          lon ? `يدوم على معظم البشرات نحو ${lon.replace(/hours?/i, 'ساعات').replace(/\+/, '+ ')}` : '',
          sil ? `${lon ? '، بفوحان' : 'فوحانه'} ${arOf(SILLAGE_AR, sil)}.` : (lon ? '.' : ''),
          ' تختلف المدة حسب البشرة والطقس وعدد الرشات، ورشّه على الملابس يطيل بقاءه.',
        ]
      : [
          lon ? `On most skin it lasts around ${lon}` : '',
          sil ? `${lon ? ', with' : 'It has'} ${sil.toLowerCase()} projection.` : (lon ? '.' : ''),
          ' Skin, weather and the number of sprays all change this, and a spray on clothing helps it last longer.',
        ];
    add(ar ? `كم يدوم «${name}»؟` : `How long does ${name} last?`, a.join('').replace(/\s+/g, ' ').trim());
  }

  // 4. When to wear it
  let wear = sp.wear;
  if (typeof wear === 'string') wear = wear.split(/[;\n]+/);
  const wearList = Array.isArray(wear) ? wear.map((w) => String(w).split('|')).map(([en, a]) => str(ar ? a || en : en)).filter(Boolean) : [];
  const occ = str(sp.occasion);
  if (occ || wearList.length) {
    const a = ar
      ? `${occ ? `أجمل ما يكون في ${arOf(OCC_AR, occ)}` : 'يناسب'}${wearList.length ? `${occ ? '، ويناسب ' : ' '}${list(wearList, true)}` : ''}.`
      : `${occ ? `It is at its best for ${occ.toLowerCase()} wear` : 'It suits'}${wearList.length ? `${occ ? ', and suits ' : ' '}${list(wearList.map((w) => w.toLowerCase()))}` : ''}.`;
    add(ar ? `متى أرتدي «${name}»؟` : `When should I wear ${name}?`, a);
  }

  // 5. Sizes
  const variants = (Array.isArray(p.variants) ? p.variants : []).filter((v) => v && v.price > 0);
  if (variants.length) {
    const sizes = list(variants.map((v) => `${ar ? String(v.label || v.key).replace(/\s*ml\b/i, ' مل') : v.label || v.key} (${fmt(v.price)})`), ar);
    const small = variants.some((v) => /^(5|8|10|15)\s*ml/i.test(String(v.label || v.key)));
    add(
      ar ? `ما الأحجام المتوفرة من «${name}»؟` : `What sizes does ${name} come in?`,
      ar
        ? `متوفر بحجم ${sizes}.${small ? ' الحجم الصغير طريقة سهلة لتجربته أو لحمله في حقيبتك.' : ''}`
        : `${name} comes in ${sizes}.${small ? ' The small size is an easy way to try it, or to carry in your bag.' : ''}`
    );
  }

  // 6. How to apply
  const how = str(ar ? sp.how_to_use_ar || '' : sp.how_to_use);
  if (how) add(ar ? `كيف أستخدم «${name}»؟` : `How do I apply ${name}?`, how);

  // 7. Gift
  const line = str(ar ? p.short_description_ar : p.short_description);
  add(
    ar ? `هل «${name}» هدية مناسبة؟` : `Is ${name} a good gift?`,
    ar
      ? `نعم، إن كان من تهديه يحب ${famTxt ? `عطور ${famTxt}` : 'هذا الطابع'}. ${line ? `${line} ` : ''}وإن لم تكن متأكدًا من ذوقه، فالحجم الصغير أو مجموعة الاستكشاف بداية سهلة.`
      : `Yes, if they enjoy ${famTxt ? `${famTxt} scents` : 'this kind of scent'}. ${line ? `${line} ` : ''}If you are unsure of their taste, the small size or our Discovery Set is an easy place to start.`
  );

  // Extra questions written in the admin (spec "faq": [{ q_en, a_en, q_ar, a_ar }])
  let extra = sp.faq;
  if (typeof extra === 'string') { try { extra = JSON.parse(extra); } catch { extra = []; } }
  if (Array.isArray(extra)) extra.forEach((f) => add(str(ar ? f.q_ar || f.q_en : f.q_en), str(ar ? f.a_ar || f.a_en : f.a_en)));

  return out;
}

// ALAYNAAS content + mock catalogue. Shape mirrors what the Express API should return.
// Text fields are { en, ar? }. Anything without an `ar` value falls back to English.
// PRICES BELOW ARE PLACEHOLDERS — replace with real values (or serve them from the API).

// ── Architecture ───────────────────────────────────────────────────
// Categories are "rooms". Each has its own world (colours), copy and the shape of its product pages.
// Products carry a `category` slug. `variants` (optional) are the purchasable sizes of one product.
// `detailKeys` decides which sections a product page of that type shows (read from product.details[key]).
// NOTE: product names/prices for Bakhoor, Oud Ma'attar, Oils, Sets and Exclusive Creations are PLACEHOLDERS until real data is supplied.
export const categories = [
  {
    slug: 'eau-de-parfum', type: 'Eau de Parfum', href: '/fragrances/eau-de-parfum', image: '/images/formula-7.jpg',
    tag: { en: 'Eau de Parfum' }, name: { en: 'The Crown Collection' }, menu: { en: 'The Crown Collection' },
    relation: { en: 'I want to wear it' }, verb: { en: 'Wear' },
    world: { bg: '#e9e4d3', fg: '#1b1a14', accent: '#7d7a3a' },
    headline: { en: ['The Crown', 'Collection'] },
    intro: { en: ['Fragrance designed to be worn.', 'Four compositions. Four different worlds.', 'The first expression of ALAYNAAS.'] },
    cta: { en: 'Explore the Crown Collection' },
    teaser: null, detailKeys: [], journal: 'what-makes-a-fragrance-memorable', next: 'bakhoor',
    nextLabel: { en: 'Continue the scent ritual' },
  },
  {
    slug: 'bakhoor', type: 'Bakhoor', href: '/fragrances/bakhoor', image: '/images/bakhoor.jpg',
    tag: { en: 'Bakhoor' }, name: { en: 'Bakhoor' }, menu: { en: 'The Ritual' },
    relation: { en: 'I want to fill the room' }, verb: { en: 'Burn' },
    world: { bg: '#14100c', fg: '#eadfcf', accent: '#b9763a' },
    headline: { en: ['The ritual', 'of scent.'] },
    intro: { en: ['Before fragrance is worn, it can fill a room.', 'Smoke moves through the air. Wood warms. Resin opens.', 'Bakhoor is not simply fragrance for a space.', 'It changes the space itself.'] },
    cta: { en: 'Explore Bakhoor' },
    teaser: { label: { en: 'The ritual' }, h: { en: ['Some scents', 'are meant', 'to fill a room.'] }, cta: { en: 'Discover Bakhoor' } },
    detailKeys: ['burn', 'atmosphere', 'character', 'usage'], journal: 'the-search-for-the-right-materials', next: 'oud-maattar',
    nextLabel: { en: 'Explore the world of ALAYNAAS' },
  },
  {
    slug: 'oud-maattar', type: 'Oud Ma\u2019attar', href: '/fragrances/oud-maattar', image: '/images/oud-maattar.jpg',
    tag: { en: 'Oud Ma\u2019attar' }, name: { en: 'Oud Ma\u2019attar' }, menu: { en: 'The Essence of Oud' },
    relation: { en: 'I want something deeper' }, verb: { en: 'Apply' },
    world: { bg: '#1a0f0a', fg: '#efe2d0', accent: '#c07a3c' },
    headline: { en: ['Concentrated.', 'Intense.', 'Close.'] },
    intro: { en: ['Oud Ma\u2019attar belongs to a different relationship with fragrance.', 'More concentrated. More intimate. More deliberate.', 'A small amount can leave a presence long after the moment has passed.'] },
    cta: { en: 'Explore Oud Ma\u2019attar' },
    teaser: { label: { en: 'The essence of oud' }, h: { en: ['Concentrated', 'into a few', 'drops.'] }, cta: { en: 'Discover Oud Ma\u2019attar' } },
    detailKeys: ['concentration', 'oud', 'application', 'longevity'], journal: 'the-search-for-the-right-materials', next: 'concentrated-oils',
    nextLabel: { en: 'Explore the world of ALAYNAAS' },
  },
  {
    slug: 'concentrated-oils', type: 'Concentrated Perfume Oil', href: '/fragrances/concentrated-oils', image: '/images/parfum-oils.jpg',
    tag: { en: 'Concentrated Perfume Oils' }, name: { en: 'Concentrated Perfume Oils' }, menu: { en: 'The Essence' },
    relation: { en: 'I want it close to my skin' }, verb: { en: 'Apply' },
    world: { bg: '#e8dfd0', fg: '#1d1812', accent: '#8a5a32' },
    headline: { en: ['The essence.'] },
    intro: { en: ['No distance.', 'No projection designed for the room.', 'Just fragrance, close to the skin.', 'Concentrated perfume oils designed to be experienced differently.'] },
    cta: { en: 'Explore Concentrated Oils' },
    teaser: { label: { en: 'The essence' }, h: { en: ['Closer to', 'the skin.'] }, cta: { en: 'Explore Perfume Oils' } },
    detailKeys: ['application', 'skin', 'concentration', 'character'], journal: 'behind-the-bottle', next: 'sets',
    nextLabel: { en: 'Try before you choose' },
  },
  {
    slug: 'sets', type: 'Set', href: '/fragrances/sets', image: '/images/discovery-set.jpg',
    tag: { en: 'Discovery & Travel Sets' }, name: { en: 'Discovery & Travel Sets' }, menu: { en: 'Try. Carry.' },
    relation: { en: 'I want to try before I choose' }, verb: { en: 'Try' },
    world: { bg: '#ddd5c4', fg: '#1d1812', accent: '#8a5a32' },
    headline: { en: ['Try.', 'Carry.'] },
    intro: { en: ['Live with a fragrance before you choose it.', 'Small formats, made for trying and for travelling.'] },
    cta: { en: 'Explore the sets' },
    teaser: { label: { en: 'Discovery & Travel' }, h: { en: ['Small bottles.', 'Big decisions.'] }, cta: { en: 'Explore the sets' } },
    detailKeys: ['contents'], journal: 'what-makes-a-fragrance-memorable', next: 'eau-de-parfum',
    nextLabel: { en: 'Find your full bottle' },
  },
  {
    slug: 'exclusive-creations', type: 'Exclusive Creation', href: '/exclusive-creations', image: '/images/exclusive.jpg',
    tag: { en: 'Exclusive Creations' }, name: { en: 'Exclusive Creations' }, menu: { en: 'The Uncommon' },
    relation: { en: 'I want something exclusive' }, verb: { en: 'Discover' },
    world: { bg: '#0a0908', fg: '#e9e2d6', accent: '#a58a63' },
    headline: { en: ['Exclusive', 'Creations'] },
    intro: { en: ['Not everything needs to become part of the collection.', 'Some ideas are too unusual. Some experiments deserve to exist only for a moment. Some fragrances are created for the few who find them.', 'Exclusive Creations is where those ideas live.'] },
    cta: { en: 'Enter Exclusive Creations' },
    teaser: { label: { en: 'Exclusive Creations' }, h: { en: ['Not everything', 'belongs', 'to the collection.'] }, sub: { en: ['Exclusive ideas.', 'Limited creations.', 'Fragrances that exist outside the expected.'] }, cta: { en: 'Enter Exclusive Creations' } },
    detailKeys: ['idea', 'character', 'materials', 'creation', 'availability'], journal: 'why-we-dont-want-another-generic-perfume', next: 'exclusive-creations',
    nextLabel: { en: 'More from the uncommon' },
  },
];

export const catBySlug = (slug) => categories.find((c) => c.slug === slug) || null;
// Intensity is read from the product if set, otherwise derived from its Soft→Bold spectrum value.
export const intensityOf = (p) => p.intensity || (p.spectrum ? (p.spectrum[2][2] < 40 ? 'soft' : p.spectrum[2][2] < 70 ? 'present' : 'bold') : null);
// Character tags (used by the fragrance finder), derived from the spectrum when a product has one.
export const characterOf = (p) => {
  if (p.character) return p.character;
  if (!p.spectrum) return [];
  const [fw, bd, sb, ad] = p.spectrum.map((s) => s[2]);
  const out = [];
  out.push(fw < 45 ? 'fresh' : 'warm');
  if (bd > 65) out.push('dark');
  if (sb < 45) out.push('soft');
  if (ad > 65) out.push('deep');
  return out;
};

export const products = [
  {
    category: 'eau-de-parfum', type: 'Eau de Parfum', collection: 'crown', availability: 'available',
    id: 1, slug: 'formula-7', no: '01', name: 'Formula 7', image: '/images/formula-7.jpg',
    price: 450, size: '100ml', variants: [{ key: '100ml', label: '100ml', price: 450 }, { key: '10ml', label: '10ml', price: 95 }],
    world: { bg: '#e9e4d3', fg: '#1b1a14', accent: '#7d7a3a' },
    line: { en: 'Vibrant freshness to lasting attraction.', ar: 'انتعاش نابض يتحول إلى جاذبية تبقى.' },
    mood: { en: 'Luminous · expressive', ar: 'مشرق · معبّر' },
    impression: {
      en: 'Light that arrives all at once. Bright, a little fearless, and then, slowly, something warmer underneath.',
      ar: 'ضوء يصل دفعة واحدة. مشرق، جريء قليلاً، ثم ببطء يظهر شيء أدفأ تحته.',
    },
    story: {
      en: ['Formula 7 is built around one idea: freshness that does not disappear into nothing.', 'It opens bright and fruity, moves through soft, powdery florals, and settles into amber and vetiver. It is meant to be noticed, but never forced.'],
    },
    spectrum: [[{ en: 'Fresh' }, { en: 'Warm' }, 30], [{ en: 'Bright' }, { en: 'Dark' }, 20], [{ en: 'Soft' }, { en: 'Bold' }, 55], [{ en: 'Airy' }, { en: 'Deep' }, 40]],
    notes: { top: ['Pineapple', 'Pink pepper'], heart: ['Hyacinth', 'Iris', 'Jasmine'], base: ['Amber', 'Vetiver'] },
    experience: {
      opening: { en: 'Pineapple and pink pepper. Sparkling, slightly sharp, awake.' },
      heart: { en: 'Hyacinth, iris and jasmine soften everything into something powdery and floral.' },
      drydown: { en: 'Amber and vetiver hold the line. Dry, warm, close to the skin.' },
    },
    wear: [{ en: 'Morning' }, { en: 'A first meeting' }, { en: 'Warm days' }, { en: 'When you want to be noticed, quietly' }],
    moods: ['arrival'],
  },
  {
    category: 'eau-de-parfum', type: 'Eau de Parfum', collection: 'crown', availability: 'available',
    id: 2, slug: 'ember-noir', no: '02', name: 'Ember Noir', image: '/images/ember-noir.jpg',
    price: 490, size: '100ml', variants: [{ key: '100ml', label: '100ml', price: 490 }, { key: '10ml', label: '10ml', price: 105 }],
    world: { bg: '#0d0b09', fg: '#efe7da', accent: '#c88a3e' },
    line: { en: 'Not everyone leaves an impression. Ember Noir does.', ar: 'ليس كل أحد يترك أثراً. إمبر نوار يفعل.' },
    mood: { en: 'Dark · warm · controlled', ar: 'داكن · دافئ · متحكم' },
    impression: {
      en: 'Dark, warm and controlled. It does not announce itself. It arrives, and the room adjusts.',
      ar: 'داكن، دافئ، ومتحكم. لا يعلن عن نفسه. يصل، ويتغير المكان.',
    },
    story: {
      en: ['Ember Noir is about presence without volume.', 'A bright, herbal opening gives way to amber and oud, then settles on leather and vetiver. It is for evenings, for shadows, and for people who do not need to explain themselves.'],
    },
    spectrum: [[{ en: 'Fresh' }, { en: 'Warm' }, 78], [{ en: 'Bright' }, { en: 'Dark' }, 85], [{ en: 'Soft' }, { en: 'Bold' }, 80], [{ en: 'Airy' }, { en: 'Deep' }, 85]],
    notes: { top: ['Davana', 'Italian bergamot', 'Pink pepper'], heart: ['White amber', 'African rosemary', 'Oud'], base: ['Musk', 'Leather', 'Haitian vetiver'] },
    experience: {
      opening: { en: 'Davana and Italian bergamot with pink pepper: a bright, slightly boozy flash before the dark arrives.' },
      heart: { en: 'White amber, African rosemary and oud. The temperature drops and rises at once.' },
      drydown: { en: 'Musk, leather and Haitian vetiver. Smooth, dry and low.' },
    },
    wear: [{ en: 'An evening that matters' }, { en: 'Cold air' }, { en: 'A quiet room with good lighting' }, { en: 'When you would rather be remembered than loud' }],
    moods: ['night', 'unforgettable'],
  },
  {
    category: 'eau-de-parfum', type: 'Eau de Parfum', collection: 'crown', availability: 'available',
    id: 3, slug: 'after-dark', no: '03', name: 'After Dark', image: '/images/after-dark.jpg',
    price: 470, size: '100ml', variants: [{ key: '100ml', label: '100ml', price: 470 }, { key: '10ml', label: '10ml', price: 100 }],
    world: { bg: '#22110d', fg: '#f0e1d2', accent: '#c9885a' },
    line: { en: 'Some moments are worth staying for.', ar: 'بعض اللحظات تستحق أن تبقى لأجلها.' },
    mood: { en: 'Warm · deep · close', ar: 'دافئ · عميق · قريب' },
    impression: {
      en: 'Warm, deep and close. For the part of the evening after everyone has stopped performing.',
      ar: 'دافئ، عميق، وقريب. للجزء من المساء بعد أن يتوقف الجميع عن التمثيل.',
    },
    story: {
      en: ['After Dark is the closest of the four. Not loud, not distant. Warm, a little addictive, the kind of scent people lean toward.', 'It is not trying to be seductive. It is trying to be honest.'],
    },
    spectrum: [[{ en: 'Fresh' }, { en: 'Warm' }, 70], [{ en: 'Bright' }, { en: 'Dark' }, 75], [{ en: 'Soft' }, { en: 'Bold' }, 55], [{ en: 'Airy' }, { en: 'Deep' }, 80]],
    notes: null,
    experience: {
      opening: { en: 'It begins quietly.' },
      heart: { en: 'Then it deepens, and gets closer.' },
      drydown: { en: 'And it stays, long after the light has changed.' },
    },
    wear: [{ en: 'Late evening' }, { en: 'A quiet dinner' }, { en: 'The drive home' }, { en: 'Someone’s company' }],
    moods: ['close'],
  },
  {
    category: 'eau-de-parfum', type: 'Eau de Parfum', collection: 'crown', availability: 'available',
    id: 4, slug: 'lost-summer', no: '04', name: 'Lost Summer', image: '/images/lost-summer.jpg',
    price: 460, size: '100ml', variants: [{ key: '100ml', label: '100ml', price: 460 }, { key: '10ml', label: '10ml', price: 100 }],
    world: { bg: '#efe3d1', fg: '#2a211a', accent: '#b9774e' },
    line: { en: 'Some summers end. Some stay on your skin.', ar: 'بعض الصيفيات تنتهي. وبعضها يبقى على بشرتك.' },
    mood: { en: 'Nostalgic · airy', ar: 'حنين · خفيف' },
    impression: {
      en: 'Airy and familiar, like something you almost remember.',
      ar: 'خفيف ومألوف، كشيء تكاد تتذكره.',
    },
    story: {
      en: ['Lost Summer is not about a place. It is about a feeling: sunlight on a windowsill, warm air, a sea you can no longer quite see.', 'It is an ALAYNAAS creation, built around memory, and around a summer you cannot return to.'],
    },
    spectrum: [[{ en: 'Fresh' }, { en: 'Warm' }, 40], [{ en: 'Bright' }, { en: 'Dark' }, 30], [{ en: 'Soft' }, { en: 'Bold' }, 25], [{ en: 'Airy' }, { en: 'Deep' }, 25]],
    notes: null,
    experience: {
      opening: { en: 'Light, like a window opening.' },
      heart: { en: 'Familiar, and just out of reach.' },
      drydown: { en: 'What is left is warm, and soft, and yours.' },
    },
    wear: [{ en: 'Afternoons' }, { en: 'Travelling' }, { en: 'Warm days when you are thinking of somewhere else' }, { en: 'A memory' }],
    moods: ['familiar', 'memory'],
  },
  // ── Placeholder products (names/prices to be replaced with real data) ──
  { id: 5, slug: 'bakhoor-no-1', no: '01', name: 'Bakhoor No. 1', category: 'bakhoor', type: 'Bakhoor', availability: 'available', image: '/images/bakhoor.jpg', price: 120, size: '', world: { bg: '#14100c', fg: '#eadfcf', accent: '#b9763a' }, line: { en: 'Slow smoke, for rooms and for moments.' }, mood: { en: 'Smoke · wood · resin' }, wear: [{ en: 'An evening at home' }, { en: 'When guests arrive' }, { en: 'A quiet room' }] },
  { id: 6, slug: 'bakhoor-no-2', no: '02', name: 'Bakhoor No. 2', category: 'bakhoor', type: 'Bakhoor', availability: 'available', image: '/images/bakhoor.jpg', price: 140, size: '', world: { bg: '#14100c', fg: '#eadfcf', accent: '#b9763a' }, line: { en: 'Slow smoke, for rooms and for moments.' }, mood: { en: 'Smoke · wood · resin' }, wear: [{ en: 'An evening at home' }, { en: 'When guests arrive' }, { en: 'A quiet room' }] },
  { id: 7, slug: 'oud-maattar-no-1', no: '01', name: 'Oud Ma\u2019attar No. 1', category: 'oud-maattar', type: 'Oud Ma\u2019attar', availability: 'available', image: '/images/oud-maattar.jpg', price: 280, size: '', world: { bg: '#1a0f0a', fg: '#efe2d0', accent: '#c07a3c' }, line: { en: 'Concentrated. Intense. Close.' }, mood: { en: 'Oud · deep · close' }, wear: [{ en: 'Close to the skin' }, { en: 'A moment that matters' }] },
  { id: 8, slug: 'oud-maattar-no-2', no: '02', name: 'Oud Ma\u2019attar No. 2', category: 'oud-maattar', type: 'Oud Ma\u2019attar', availability: 'available', image: '/images/oud-maattar.jpg', price: 340, size: '', world: { bg: '#1a0f0a', fg: '#efe2d0', accent: '#c07a3c' }, line: { en: 'Concentrated. Intense. Close.' }, mood: { en: 'Oud · deep · close' }, wear: [{ en: 'Close to the skin' }, { en: 'A moment that matters' }] },
  { id: 9, slug: 'perfume-oil-no-1', no: '01', name: 'Perfume Oil No. 1', category: 'concentrated-oils', type: 'Concentrated Perfume Oil', availability: 'available', image: '/images/parfum-oils.jpg', price: 150, size: '', world: { bg: '#e8dfd0', fg: '#1d1812', accent: '#8a5a32' }, line: { en: 'Fragrance, close to the skin.' }, mood: { en: 'Intimate · concentrated' }, wear: [{ en: 'Every day' }, { en: 'Close to the skin' }] },
  { id: 10, slug: 'perfume-oil-no-2', no: '02', name: 'Perfume Oil No. 2', category: 'concentrated-oils', type: 'Concentrated Perfume Oil', availability: 'available', image: '/images/parfum-oils.jpg', price: 150, size: '', world: { bg: '#e8dfd0', fg: '#1d1812', accent: '#8a5a32' }, line: { en: 'Fragrance, close to the skin.' }, mood: { en: 'Intimate · concentrated' }, wear: [{ en: 'Every day' }, { en: 'Close to the skin' }] },
  { id: 11, slug: 'perfume-oil-no-3', no: '03', name: 'Perfume Oil No. 3', category: 'concentrated-oils', type: 'Concentrated Perfume Oil', availability: 'available', image: '/images/parfum-oils.jpg', price: 150, size: '', world: { bg: '#e8dfd0', fg: '#1d1812', accent: '#8a5a32' }, line: { en: 'Fragrance, close to the skin.' }, mood: { en: 'Intimate · concentrated' }, wear: [{ en: 'Every day' }, { en: 'Close to the skin' }] },
  { id: 12, slug: 'perfume-oil-no-4', no: '04', name: 'Perfume Oil No. 4', category: 'concentrated-oils', type: 'Concentrated Perfume Oil', availability: 'available', image: '/images/parfum-oils.jpg', price: 150, size: '', world: { bg: '#e8dfd0', fg: '#1d1812', accent: '#8a5a32' }, line: { en: 'Fragrance, close to the skin.' }, mood: { en: 'Intimate · concentrated' }, wear: [{ en: 'Every day' }, { en: 'Close to the skin' }] },
  { id: 13, slug: 'discovery-set', no: '01', name: 'The Discovery Set', category: 'sets', type: 'Set', availability: 'available', image: '/images/discovery-set.jpg', price: 150, size: '5ml \u00d7 5', world: { bg: '#ddd5c4', fg: '#1d1812', accent: '#8a5a32' }, line: { en: 'Five fragrances. Five millilitres each.' }, mood: { en: 'Try before you choose' }, story: { en: ['Live with a fragrance for a few days before you commit to a full bottle.'] }, details: { contents: { en: 'Five ALAYNAAS fragrances, 5ml each.' } }, wear: [{ en: 'Before choosing a full bottle' }, { en: 'As a first gift' }] },
  { id: 14, slug: 'travel-set', no: '02', name: 'The Travel Set', category: 'sets', type: 'Set', availability: 'available', image: '/images/travel-set.jpg', price: 220, size: '10ml \u00d7 3', world: { bg: '#ddd5c4', fg: '#1d1812', accent: '#8a5a32' }, line: { en: 'Three fragrances. Ten millilitres each.' }, mood: { en: 'Made to be carried' }, story: { en: ['Three of your fragrances, in a size that goes everywhere with you.'] }, details: { contents: { en: 'Three ALAYNAAS fragrances, 10ml each.' } }, wear: [{ en: 'Travelling' }, { en: 'In a bag, for later' }] },
];

export const discoverPrompts = [
  { key: 'arrival', text: { en: 'Something that announces your arrival.', ar: 'شيء يعلن عن وصولك.' }, result: 'formula-7' },
  { key: 'close', text: { en: 'Something that stays close.', ar: 'شيء يبقى قريباً.' }, result: 'after-dark' },
  { key: 'night', text: { en: 'Something for the night.', ar: 'شيء لليل.' }, result: 'ember-noir' },
  { key: 'familiar', text: { en: 'Something that feels familiar.', ar: 'شيء يبدو مألوفاً.' }, result: 'lost-summer' },
  { key: 'unforgettable', text: { en: 'Something unforgettable.', ar: 'شيء لا يُنسى.' }, result: 'ember-noir' },
  { key: 'memory', text: { en: 'Something that feels like a memory.', ar: 'شيء يشبه الذكرى.' }, result: 'lost-summer' },
];

export const stages = [
  { k: { en: 'Idea', ar: 'فكرة' }, t: { en: 'Every fragrance starts as a feeling that is hard to explain. A mood, a place, a person, a moment you want to bottle.' } },
  { k: { en: 'Experiment', ar: 'تجربة' }, t: { en: 'Materials are combined, adjusted and combined again. Most of it does not work. That is part of it.' } },
  { k: { en: 'Test', ar: 'اختبار' }, t: { en: 'On paper, on skin, in different air. What smells good in the first minute is not always what you want at the sixth hour.' } },
  { k: { en: 'Rework', ar: 'إعادة' }, t: { en: 'Balance is moved a little at a time. Something too sweet gets dry. Something too loud gets quiet.' } },
  { k: { en: 'Character', ar: 'شخصية' }, t: { en: 'At some point the formula stops being a list and starts being someone. That is the moment you recognise it.' } },
  { k: { en: 'Fragrance', ar: 'عطر' }, t: { en: 'Only then does it become a bottle.' } },
];

export const materials = [
  ['Frankincense', 'Resin, smoke, warmth and something almost sacred.'],
  ['Oud', 'Dark wood, a little animal, entirely unhurried.'],
  ['Bergamot', 'Brightness before the shadows arrive.'],
  ['Vetiver', 'Dry earth. Green roots. Quiet depth.'],
  ['Jasmine', 'White flowers at night. Heady, warm, a little indecent.'],
  ['Iris', 'Cool powder. Cold stone. Something expensive and quiet.'],
  ['Amber', 'Warm skin in low light.'],
  ['Sandalwood', 'Creamy, soft-edged, like a held breath.'],
  ['Pink pepper', 'A small spark that keeps everything awake.'],
];

export const journal = [
  { slug: 'why-alaynaas-exists', title: 'Why ALAYNAAS exists', excerpt: 'Because fragrance can be more personal than smelling good.', body: ['ALAYNAAS began with fascination, and with the belief that fragrance could carry a mood, a memory, a presence.', 'This entry will be written in the founder’s own words.'] },
  { slug: 'the-first-fragrance', title: 'The first fragrance', excerpt: 'Where it started, and what it taught us.', body: ['A first fragrance teaches you what you do not know.', 'This entry will be written in the founder’s own words.'] },
  { slug: 'what-makes-a-fragrance-memorable', title: 'What makes a fragrance memorable?', excerpt: 'Not the bottle. Not the name. What remains after you leave.', body: ['We do not remember lists of notes. We remember how a fragrance made a moment feel.', 'The first five seconds are an introduction. The memory is made in what follows: the heart, the drydown, the way it sits on one person and not another.'] },
  { slug: 'behind-the-bottle', title: 'Behind the bottle', excerpt: 'What goes into a bottle before it reaches you.', body: ['A bottle is the last decision, not the first.', 'This entry will be written in the founder’s own words.'] },
  { slug: 'before-a-fragrance-is-released', title: 'What happens before a fragrance is released?', excerpt: 'Testing, adjusting, waiting, and testing again.', body: ['Before release there is testing, then adjusting, then more testing.', 'This entry will be written in the founder’s own words.'] },
  { slug: 'the-search-for-the-right-materials', title: 'The search for the right materials', excerpt: 'Every fragrance is only as good as what it is made from.', body: ['A fragrance is built from materials and imagination.', 'This entry will be written in the founder’s own words.'] },
  { slug: 'learning-fragrance-from-the-ground-up', title: 'Learning fragrance from the ground up', excerpt: 'Starting without all the answers.', body: ['ALAYNAAS is still learning, and is open about it.', 'This entry will be written in the founder’s own words.'] },
  { slug: 'when-a-formula-doesnt-work', title: 'When a formula doesn’t work', excerpt: 'Mistakes are part of the process, not a detour from it.', body: ['Some formulas fail. Some fail beautifully. The ones that fail teach you where the edges are.', 'This entry will be written in the founder’s own words.'] },
  { slug: 'building-alaynaas-from-the-uae', title: 'Building ALAYNAAS from the UAE', excerpt: 'The place where it is being made.', body: ['ALAYNAAS is a UAE fragrance brand, being built with the ambition to become a distinctive fragrance house.', 'This entry will be written in the founder’s own words.'] },
  { slug: 'the-story-behind-lost-summer', title: 'The story behind Lost Summer', excerpt: 'A summer that exists now only in memory.', body: ['Lost Summer is about the feeling of a summer you cannot return to.', 'This entry will be written in the founder’s own words.'] },
  { slug: 'why-we-dont-want-another-generic-perfume', title: 'Why we don’t want to make another generic perfume', excerpt: 'There are enough of those already.', body: ['There is no shortage of fragrances that smell fine. We would rather make something that smells like someone.', 'This entry will be written in the founder’s own words.'] },
];

export const policies = {
  shipping: {
    title: { en: 'Shipping & Delivery', ar: 'الشحن والتوصيل' },
    body: {
      en: ['We deliver across the UAE within 1–3 working days.', 'Orders above AED 300 ship free. Otherwise a flat AED 20 fee applies.'],
      ar: ['نوصل إلى جميع أنحاء الإمارات خلال 1–3 أيام عمل.', 'الشحن مجاني للطلبات فوق 300 درهم، وإلا تُطبق رسوم ثابتة 20 درهماً.'],
    },
  },
  returns: {
    title: { en: 'Returns & Exchanges', ar: 'الإرجاع والاستبدال' },
    body: {
      en: ['Unopened items may be returned within 7 days of delivery.', 'For hygiene reasons, opened fragrances cannot be returned.'],
      ar: ['يمكن إرجاع المنتجات غير المفتوحة خلال 7 أيام من التسليم.', 'لأسباب صحية لا يمكن إرجاع العطور المفتوحة.'],
    },
  },
  privacy: {
    title: { en: 'Privacy Policy', ar: 'سياسة الخصوصية' },
    body: {
      en: ['We only collect the information needed to process your order.', 'We never sell your personal data.'],
      ar: ['نجمع فقط المعلومات اللازمة لمعالجة طلبك.', 'لا نبيع بياناتك الشخصية أبداً.'],
    },
  },
  terms: {
    title: { en: 'Terms & Conditions', ar: 'الشروط والأحكام' },
    body: {
      en: ['By placing an order you agree to these terms.', 'All prices are in UAE Dirhams (AED) and include VAT.'],
      ar: ['بتقديم الطلب فإنك توافق على هذه الشروط.', 'جميع الأسعار بالدرهم الإماراتي وتشمل ضريبة القيمة المضافة.'],
    },
  },
};

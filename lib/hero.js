/**
 * Turns the admin-managed `hero_slides` setting into the slide shape HeroSlider expects.
 * Returns null when nothing usable is configured so the caller can fall back to built-in slides.
 */
export function buildHeroSlides(raw, lang = 'en') {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  // Schedule check uses plain YYYY-MM-DD strings (lexicographic order == date order)
  const today = new Date().toISOString().slice(0, 10);
  const pick = (s, field) => s[`${field}_${lang}`] || s[`${field}_en`] || '';

  const slides = raw
    .filter((s) => s && s.active !== false && s.img)
    .filter((s) => (!s.start_at || s.start_at <= today) && (!s.end_at || s.end_at >= today))
    .map((s) => ({
      img: s.img,
      pos: s.pos || undefined,
      kick: pick(s, 'kick'),
      l1: pick(s, 'l1'),
      l2: pick(s, 'l2'),
      sub: pick(s, 'sub'),
      alt: pick(s, 'alt'),
      cta: s.href ? pick(s, 'cta') : '',
      href: s.href || '',
      cta2: s.href2 ? pick(s, 'cta2') : '',
      href2: s.href2 || '',
    }))
    .filter((s) => s.l1);

  return slides.length ? slides : null;
}

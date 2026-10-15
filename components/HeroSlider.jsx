'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from './Providers';

const DEFAULT_INTERVAL = 7; // seconds
const SWIPE_MIN = 45; // px a horizontal drag must travel to change slide

/** Internal paths/anchors use next/link or a plain anchor; external URLs open safely in a new tab. */
function SlideLink({ href, className, tabIndex, children }) {
  if (href.startsWith('#')) return <a href={href} className={className} tabIndex={tabIndex}>{children}</a>;
  if (href.startsWith('/')) return <Link href={href} className={className} tabIndex={tabIndex}>{children}</Link>;
  return <a href={href} className={className} tabIndex={tabIndex} target="_blank" rel="noopener noreferrer">{children}</a>;
}

/*
 * Homepage hero slider.
 * slide = { img, kick, l1, l2, sub?, cta, href, cta2?, href2?, alt?, pos? }
 *  - img  : image URL (first slide is preloaded as the LCP image, the rest lazy-load)
 *  - alt  : image description for search engines/screen readers (defaults to the headline)
 *  - pos  : CSS object-position, e.g. "70% 40%" to keep the subject in frame on mobile
 * SEO/a11y: only slide 1 renders the page <h1>; inactive slides are aria-hidden with
 * unfocusable links; autoplay can be paused (WCAG 2.2.2), stops on hover/focus/hidden tab
 * and for reduced-motion users; fixed height prevents layout shift.
 */
export default function HeroSlider({ slides, label = 'ALAYNAAS', interval = DEFAULT_INTERVAL }) {
  const ms = Math.min(20, Math.max(3, interval)) * 1000;
  const { t } = useApp();
  const [i, setI] = useState(0);
  const [hover, setHover] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reduced, setReduced] = useState(false);
  const touch = useRef(null);
  const n = slides.length;
  const go = useCallback((k) => setI((k + n) % n), [n]);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const onVis = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const playing = !(hover || userPaused || hidden || reduced || n < 2);
  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => setI((x) => (x + 1) % n), ms);
    return () => clearTimeout(id);
  }, [i, playing, n, ms]);

  const onTouchStart = (e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchEnd = (e) => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > SWIPE_MIN && Math.abs(dx) > Math.abs(dy) * 1.4) {
      const rtl = document.documentElement.dir === 'rtl';
      go(i + (dx < 0 ? 1 : -1) * (rtl ? -1 : 1));
    }
  };
  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') go(i + 1);
    if (e.key === 'ArrowLeft') go(i - 1);
  };

  if (!n) return null;
  const nextSlide = n > 1 ? slides[(i + 1) % n] : null;

  return (
    <section
      className="hs"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onKeyDown={onKeyDown}
    >
      {slides.map((s, k) => {
        const Tag = k === 0 ? 'h1' : 'h2';
        const on = k === i;
        const alt = s.alt || [s.l1, s.l2].filter(Boolean).join(' ');
        return (
          <div
            key={`${s.img}-${k}`}
            className={`hs-slide ${on ? 'on' : ''}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${k + 1} / ${n}`}
            aria-hidden={!on}
            style={s.pos ? { '--pos': s.pos } : undefined}
          >
            <Image src={s.img} alt={alt} fill priority={k === 0} fetchPriority={k === 0 ? 'high' : 'auto'} quality={85} sizes="100vw" className="hs-img" />
            <div className="hs-shade" />
            <div className="wrap hs-in">
              <p className="label light hs-kick">{s.kick}</p>
              <Tag className="hs-h"><span>{s.l1}</span><span>{s.l2}</span></Tag>
              {s.sub && <p className="hs-sub">{s.sub}</p>}
              <div className="hs-actions">
                <SlideLink href={s.href} className="btn btn-light" tabIndex={on ? 0 : -1}>{s.cta}</SlideLink>
                {s.cta2 && s.href2 && <SlideLink href={s.href2} className="hs-ghost" tabIndex={on ? 0 : -1}>{s.cta2}</SlideLink>}
              </div>
            </div>
          </div>
        );
      })}

      {nextSlide && (
        <button type="button" className="hs-next" onClick={() => go(i + 1)} aria-label={`${t.hero?.next || 'Next'}: ${[nextSlide.l1, nextSlide.l2].filter(Boolean).join(' ')}`}>
          <span className="hs-next-img"><Image src={nextSlide.img} alt="" fill sizes="64px" /></span>
          <span><small>{t.hero?.next || 'Next'}</small><strong>{nextSlide.l1}</strong></span>
        </button>
      )}

      <div className="wrap hs-ctrl">
        <div className="hs-bars" role="tablist" aria-label={label}>
          {slides.map((s, k) => (
            <button
              key={k}
              role="tab"
              aria-selected={k === i}
              aria-label={`${k + 1} / ${n}`}
              className={`hs-bar ${k === i ? 'on' : ''} ${k < i ? 'done' : ''} ${k === i && playing ? 'run' : ''}`}
              onClick={() => go(k)}
              style={{ '--hs-ms': `${ms}ms` }}
            >
              <i />
            </button>
          ))}
        </div>
        <span className="hs-count" aria-hidden="true"><b>{String(i + 1).padStart(2, '0')}</b> / {String(n).padStart(2, '0')}</span>
        <div className="hs-arrows">
          {n > 1 && (
            <button type="button" className={`hs-pause ${userPaused ? 'is-paused' : ''}`} onClick={() => setUserPaused((p) => !p)} aria-label={userPaused ? 'Play slideshow' : 'Pause slideshow'}>
              <i />
            </button>
          )}
          <button type="button" className="hs-arrow prev" onClick={() => go(i - 1)} aria-label="Previous slide"><span /></button>
          <button type="button" className="hs-arrow next" onClick={() => go(i + 1)} aria-label="Next slide"><span /></button>
        </div>
      </div>
      <p className="sr-only" aria-live={playing ? 'off' : 'polite'}>{`${i + 1} / ${n}`}</p>
    </section>
  );
}

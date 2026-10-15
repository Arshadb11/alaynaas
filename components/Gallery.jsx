'use client';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

/* Gallery = the product's uploaded images, in the order arranged in the admin panel */
export function galleryOf(p) {
  if (!p) return [];
  const list = p.gallery?.length ? p.gallery : [p.image];
  return [...new Set(list.filter(Boolean))];
}

export default function Gallery({ images, alt }) {
  const track = useRef(null);
  const [i, setI] = useState(0);
  const dir = () => (typeof document !== 'undefined' && document.documentElement.dir === 'rtl' ? -1 : 1);
  const go = useCallback((n) => {
    const el = track.current;
    if (!el) return;
    const k = (n + images.length) % images.length;
    el.scrollTo({ left: k * el.clientWidth * dir(), behavior: 'smooth' });
    setI(k);
  }, [images.length]);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setI(Math.round(Math.abs(el.scrollLeft) / el.clientWidth)));
    };
    el.addEventListener('scroll', on, { passive: true });
    return () => { el.removeEventListener('scroll', on); cancelAnimationFrame(raf); };
  }, []);
  useEffect(() => {
    const k = (e) => {
      if (!track.current?.matches(':hover')) return;
      if (e.key === 'ArrowRight') go(i + dir());
      if (e.key === 'ArrowLeft') go(i - dir());
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [i, go]);

  return (
    <div className="gal" aria-roledescription="carousel" aria-label={alt}>
      <div className="gal-stage">
        <div className="gal-track" ref={track}>
          {images.map((src, n) => (
            <div className="gal-slide" key={src} aria-hidden={n !== i}>
              <Image src={src} alt={n === 0 ? alt : ''} fill priority={n === 0} sizes="(max-width:900px) 100vw, 52vw" />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <>
            <button className="gal-nav prev" onClick={() => go(i - 1)} aria-label="Previous image"><span /></button>
            <button className="gal-nav next" onClick={() => go(i + 1)} aria-label="Next image"><span /></button>
            <span className="gal-count">{String(i + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="gal-thumbs" role="tablist">
          {images.map((src, n) => (
            <button key={src} role="tab" aria-selected={n === i} aria-label={`Image ${n + 1}`} className={n === i ? 'on' : ''} onClick={() => go(n)}>
              <Image src={src} alt="" fill sizes="96px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

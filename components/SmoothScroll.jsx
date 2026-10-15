'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Site-wide inertial smooth scrolling (Lenis).
 * - Skipped when the visitor prefers reduced motion.
 * - Native scrolling still works inside elements marked data-lenis-prevent
 *   (cart drawer, mobile menu) so nested scroll areas are not hijacked.
 * - Same-page #anchor links are routed through Lenis so they glide too.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, anchors: true });
    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}

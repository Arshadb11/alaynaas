'use client';
import { useEffect, useRef, useState } from 'react';

export function useInView(margin = '0px 0px -8% 0px') {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setSeen(true);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [seen, margin]);
  return [ref, seen];
}

// Slow fade + rise on scroll.
export function Reveal({ children, delay = 0, as: Tag = 'div', className = '', ...rest }) {
  const [ref, seen] = useInView();
  return (
    <Tag ref={ref} className={`rv ${seen ? 'in' : ''} ${className}`} style={{ '--d': `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

// Masked line-by-line headline. lines: strings, or { em: 'text' } for an italic accent.
export function Headline({ lines, className = '', as: Tag = 'h2', delay = 0 }) {
  const [ref, seen] = useInView();
  return (
    <Tag ref={ref} className={`hl ${seen ? 'in' : ''} ${className}`}>
      {lines.map((ln, i) => (
        <span className="hl-mask" key={i}>
          <span className="hl-line" style={{ '--d': `${delay + i * 130}ms` }}>
            {typeof ln === 'string' ? ln : <em>{ln.em}</em>}
          </span>
        </span>
      ))}
    </Tag>
  );
}

// Each non-empty line fades in sequentially. Empty strings become a quiet pause.
export function Lines({ lines, className = '' }) {
  const [ref, seen] = useInView('0px 0px -12% 0px');
  return (
    <div ref={ref} className={`lines ${seen ? 'in' : ''} ${className}`}>
      {lines.map((l, i) => (l === '' ? <span key={i} className="pause" /> : <p key={i} style={{ '--d': `${i * 140}ms` }}>{l}</p>))}
    </div>
  );
}

// Slow scroll parallax. One rAF-throttled passive listener, transform only.
export function Parallax({ children, speed = 0.12, className = '' }) {
  const wrap = useRef(null);
  useEffect(() => {
    const el = wrap.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const mid = r.top + r.height / 2 - window.innerHeight / 2;
      el.style.setProperty('--py', `${(-mid * speed).toFixed(1)}px`);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, [speed]);
  return <div ref={wrap} className={`plx ${className}`}><div className="plx-in">{children}</div></div>;
}

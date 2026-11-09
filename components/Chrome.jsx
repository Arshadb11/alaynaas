'use client';
import Link from '@/components/Link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useApp } from './Providers';
import { subscribeNewsletter } from '@/lib/api';

export function Icon({ n, size = 20 }) {
  const p = {
    bag: <><path d="M8 10V7a4 4 0 0 1 8 0v3" /><path d="M3.5 10h17l-1.4 10a1 1 0 0 1-1 .9H5.9a1 1 0 0 1-1-.9L3.5 10Z" /></>,
    close: <path d="M5 5l14 14M19 5 5 19" />,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    down: <path d="M12 4v16m-6-6 6 6 6-6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    check: <path d="m5 12.5 4.5 4.5L19 7" />,
    lock: <><rect x="5" y="11" width="14" height="10" rx="1" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
    truck: <><path d="M2.5 6.5h11v9h-11z" /><path d="M13.5 9.5h4l3 3v3h-7" /><circle cx="7" cy="17" r="1.8" /><circle cx="17" cy="17" r="1.8" /></>,
    cash: <><rect x="3" y="6.5" width="18" height="11" rx="1" /><circle cx="12" cy="12" r="2.6" /><path d="M6.5 9.5v.01M17.5 14.5v.01" /></>,
    returns: <><path d="M4 12a8 8 0 1 0 2.6-5.9" /><path d="M4 4.5v4h4" /></>,
    spark: <path d="M12 3l1.9 5.4L19.5 10l-5.6 1.7L12 17l-1.9-5.3L4.5 10l5.6-1.6L12 3Z" />,
    mail: <><rect x="3" y="5.5" width="18" height="13" rx="1" /><path d="m3.5 7 8.5 6.5L20.5 7" /></>,
    phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A15 15 0 0 1 4 5a1 1 0 0 1 1-1Z" />,
    chat: <path d="M4 5h16v11H9l-5 4V5Z" />,
    pin: <><path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 0 0-13 0c0 5.4 6.5 11 6.5 11Z" /><circle cx="12" cy="10" r="2.3" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
    chev: <path d="m6 9 6 6 6-6" />,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.6 2.7 3.9 5.7 3.9 9s-1.3 6.3-3.9 9c-2.6-2.7-3.9-5.7-3.9-9S9.4 5.7 12 3Z" /></>,
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
    user: <><circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20.5c.8-3.6 3.9-5.6 7.5-5.6s6.7 2 7.5 5.6" /></>,
  }[n];
  return <svg className="ic" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{p}</svg>;
}

export function Header({ rooms = [], navMenu = [] }) {
  const { t, L, lang, setLang, totals, setDrawer, menu, setMenu, tone, settings, money } = useApp();
  const pathname = (usePathname() || '').replace(/^\/ar(?=\/|$)/, '') || '/';
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [searchOpen, setSearchOpen] = useState(false); // search bar under the compact / mobile header
  const [acc, setAcc] = useState(null); // which mobile-menu accordion is open
  const searchInput = useRef(null);
  const router = useRouter();
  const submitSearch = (e) => {
    e.preventDefault();
    const q = searchQ.trim();
    if (!q) return;
    setMenu(false);
    setSearchOpen(false);
    router.push(`${lang === 'ar' ? '/ar' : ''}/shop?q=${encodeURIComponent(q.slice(0, 100))}`);
  };
  // Announcement bar can be dismissed for the rest of the browser session
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('mq-closed') === '1') document.documentElement.classList.add('no-mq');
  }, []);
  const closeAnnouncement = () => {
    document.documentElement.classList.add('no-mq');
    try { sessionStorage.setItem('mq-closed', '1'); } catch { /* storage unavailable */ }
  };
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);
  const timer = useRef(null);
  // `mega` holds which nav item's panel is open (an item id, 'static' for the built-in fallback) or false
  const open = (key = 'static') => { clearTimeout(timer.current); setMega(key); };
  const close = () => { clearTimeout(timer.current); timer.current = setTimeout(() => setMega(false), 140); };

  useEffect(() => {
    const on = () => setScrolled((s) => (s ? window.scrollY > 24 : window.scrollY > 90));
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  // Close the language dropdown on outside click / Escape
  useEffect(() => {
    if (!langOpen) return;
    const onDown = (e) => { if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false); };
    const onKey = (e) => e.key === 'Escape' && setLangOpen(false);
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); window.removeEventListener('keydown', onKey); };
  }, [langOpen]);

  useEffect(() => { setMenu(false); setMega(false); setSearchOpen(false); setAcc(null); }, [pathname, setMenu]);
  useEffect(() => { if (!menu) setAcc(null); }, [menu]);
  useEffect(() => { if (searchOpen) searchInput.current?.focus(); }, [searchOpen]);
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') { setMega(false); setSearchOpen(false); } };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);

  const resolveAsset = (u, fallback) => {
    if (!u) return fallback;
    if (u.startsWith('http://') || u.startsWith('https://')) return u;
    return u.startsWith('/') ? u : `/${u}`;
  };

  const countLabel = (n) => (n === 0 ? t.rooms.soonShort : n === 1 ? t.rooms.one : t.rooms.many.replace('{n}', n));
  const main = rooms.filter((r) => r.slug !== 'exclusive-creations');
  const niche = rooms.find((r) => r.slug === 'exclusive-creations');
  const links = [['/story', t.nav.world], ['/shop', t.nav.fragrances, true], ['/exclusive-creations', t.nav.niche], ['/journal', t.nav.journal], ['/discover', t.nav.discover]];

  // ── Dynamic menu (Admin → Catalog → Menu). Falls back to the built-in links when empty. ──
  const dyn = Array.isArray(navMenu) && navMenu.length > 0;
  const lbl = (it) => it.label?.[lang] || it.label?.en || '';
  const itemHref = (it) => it.href || it.children?.find((c) => c.href)?.href || null;
  const isActiveHref = (h) => !!h && (h === '/' ? pathname === '/' : pathname === h || pathname.startsWith(`${h}/`));
  const renderLink = (it, props = {}) => {
    const { children, ...rest } = props;
    const text = children ?? lbl(it);
    if (!it.href) return <span {...rest}>{text}</span>;
    if (/^https?:\/\//i.test(it.href)) {
      return <a href={it.href} target={it.new_tab ? '_blank' : undefined} rel={it.new_tab ? 'noopener noreferrer' : undefined} {...rest}>{text}</a>;
    }
    return <Link href={it.href} target={it.new_tab ? '_blank' : undefined} {...rest}>{text}</Link>;
  };
  const badge = (it) => (it.badge ? <i className="nav-badge">{it.badge}</i> : null);
  // Light logo is no longer needed: the mobile menu is now a light panel too
  const light = false;

  const logoSrc = resolveAsset(
    light ? settings?.frontend_logo : (settings?.frontend_logo_dark || settings?.frontend_logo),
    '/images/alaynaas-logo-dark.svg'
  );
  const brandName = settings?.store_name || t.brand || 'ALAYNAAS';
  const logoHeight = Number(settings?.frontend_logo_height) || 28;

  /* Announcement bar: backend messages (en/ar) with {free_over} / {shipping_fee} tokens; falls back to built-in copy. */
  const mqEnabled = settings?.marquee_enabled !== false;
  const mqSpeed = Math.min(300, Math.max(10, Number(settings?.marquee_speed) || 48));
  const fillTokens = (s) => String(s)
    .replace('{free_over}', money(Number(settings?.shipping_free_over) || 0))
    .replace('{shipping_fee}', money(Number(settings?.shipping_fee) || 0));
  // Each message: { text, label, url }. Links are re-validated here as defence in depth.
  const safeUrl = (u) => (typeof u === 'string' && /^(\/(?!\/)|https?:\/\/)/i.test(u.trim()) ? u.trim() : '');
  const mqMessages = Array.isArray(settings?.marquee_items) && settings.marquee_items.length
    ? settings.marquee_items
        .filter((m) => m && m.active !== false)
        .map((m) => ({
          text: fillTokens(m[lang] || m.en || ''),
          label: m[`link_${lang}`] || m.link_en || '',
          url: safeUrl(m.url),
        }))
        .filter((m) => m.text)
    : (t.marquee || []).map((text) => ({ text, label: '', url: '' }));

  // Repeat the messages so one set is always wider than the screen: the loop never shows a gap
  const mqReps = Math.max(1, Math.ceil(12 / Math.max(1, mqMessages.length)));
  const mqSet = Array.from({ length: mqReps }, () => mqMessages).flat();
  const regionCode = (settings?.country_code || 'AE').toString().toUpperCase().slice(0, 3);

  // Mobile menu entries: top-level links, each with optional flattened sub-links (accordion)
  const mkKids = (arr = []) => arr.flatMap((k) => [
    ...(k.href ? [{ key: `k${k.id}`, href: k.href, label: lbl(k) }] : []),
    ...((k.children || []).filter((c) => c.href).map((c) => ({ key: `k${c.id}`, href: c.href, label: lbl(c) }))),
  ]);
  const mobileNav = [
    { key: 'home', href: '/', label: t.nav.home, kids: [] },
    ...(dyn
      ? navMenu.map((it) => ({ key: `n${it.id}`, href: it.href || null, label: lbl(it), kids: mkKids(it.children) }))
      : links.map(([h, l, hasMega]) => ({
          key: h, href: h, label: l,
          kids: hasMega ? main.map((r) => ({ key: r.slug, href: r.href, label: L(r.tag) })) : [],
        }))),
  ];


  return (
    <header className={`hdr solid ${menu ? 'menu-open' : ''} ${scrolled && !menu ? 'scrolled' : ''} ${searchOpen ? 'search-open' : ''}`}>
      {mqEnabled && mqMessages.length > 0 && (
        <div className="mq-bar">
        <div className="mq" role="region" aria-label={brandName}>
          <div className="mq-track" style={{ animationDuration: `${mqSpeed * mqReps}s` }}>
            {[0, 1].map((k) => (
              <ul key={k} className="mq-set" aria-hidden={k === 1 ? 'true' : undefined}>
                {mqSet.map((m, i) => (
                  <li key={i}>
                    <span>
                      {m.text}
                      {m.url && m.label && (
                        m.url.startsWith('/')
                          ? <Link href={m.url} className="mq-link" tabIndex={k === 1 ? -1 : undefined}>{m.label}</Link>
                          : <a href={m.url} className="mq-link" target="_blank" rel="noopener noreferrer" tabIndex={k === 1 ? -1 : undefined}>{m.label}</a>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
        <button type="button" className="mq-close" onClick={closeAnnouncement} aria-label={t.nav.close}><Icon n="close" size={14} /></button>
        </div>
      )}
      <div className="hdr-row">
        <button className="menu-btn" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label={menu ? t.nav.close : t.nav.menu}>
          <i /><i />
        </button>
        <form className="hdr-searchform" role="search" onSubmit={submitSearch}>
          <input
            type="search"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            maxLength={100}
            placeholder={lang === 'en' ? 'Search for products' : 'ابحث عن المنتجات'}
            aria-label={lang === 'en' ? 'Search for products' : 'ابحث عن المنتجات'}
          />
          <button type="submit" aria-label={lang === 'en' ? 'Search' : 'بحث'}><Icon n="search" size={16} /></button>
        </form>
        <Link href="/" className="wordmark" aria-label={brandName}>
          <img
            src={logoSrc}
            alt={brandName}
            className="logo-img"
            style={{ height: `${logoHeight}px` }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const sib = e.currentTarget.nextElementSibling;
              if (sib) sib.style.display = 'inline-block';
            }}
          />
          <span className="logo-fallback-text" style={{ display: 'none' }}>{brandName}</span>
        </Link>
        <div className="hdr-end">
          <button type="button" className="hdr-sicon" onClick={() => setSearchOpen((v) => !v)} aria-expanded={searchOpen} aria-label={lang === 'en' ? 'Search' : '\u0628\u062d\u062b'}>
            <Icon n={searchOpen ? 'close' : 'search'} size={19} />
          </button>
          <div className="lang-dd" ref={langRef}>
            <button className="lang" onClick={() => setLangOpen((v) => !v)} aria-haspopup="listbox" aria-expanded={langOpen} aria-label="Language">
              {lang === 'en' ? 'EN' : 'AR'} <Icon n="chev" size={12} />
            </button>
            {langOpen && (
              <ul className="lang-menu" role="listbox" aria-label="Language">
                {[['en', 'English'], ['ar', 'العربية']].map(([code, label]) => (
                  <li key={code} role="option" aria-selected={lang === code}>
                    <button type="button" className={lang === code ? 'on' : ''} lang={code} onClick={() => { setLang(code); setLangOpen(false); }}>
                      {label}{lang === code && <Icon n="check" size={13} />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Link href="/account" className="hdr-acct" aria-label={t.nav.account}><Icon n="user" size={19} /></Link>
          <button className="bag-btn" onClick={() => setDrawer(true)} aria-label={`${t.nav.bag} (${totals.count})`}>
            <Icon n="bag" size={19} />{totals.count > 0 && <b>{totals.count}</b>}
          </button>
        </div>
      </div>
      <div className="hdr-sub">
        <nav className="hdr-nav" aria-label="Primary">
          {dyn ? navMenu.map((it) => {
            const kids = it.children || [];
            const topActive = isActiveHref(it.href) || kids.some((k) => isActiveHref(k.href));
            if (!kids.length) {
              return <Fragment key={it.id}>{renderLink(it, { className: topActive ? 'active' : '', children: <>{lbl(it)}{badge(it)}</> })}</Fragment>;
            }
            const isOpen = mega === it.id;
            return (
              <div key={it.id} className={`nav-item ${it.is_mega ? 'has-mega' : 'has-dd'}`} onMouseEnter={() => open(it.id)} onMouseLeave={close} onFocus={() => open(it.id)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) close(); }}>
                {renderLink(it, { className: topActive ? 'active' : '', 'aria-haspopup': 'true', 'aria-expanded': isOpen, children: <>{lbl(it)}{badge(it)}</> })}
                {it.is_mega ? (
                  <div className={`mega-panel mm ${isOpen ? 'open' : ''}`}>
                    <div className="mm-in">
                      {kids.map((col) => (
                        <div className="mm-col" key={col.id}>
                          {col.image && (
                            <span className="mm-img"><Image src={resolveAsset(col.image)} alt="" fill sizes="220px" /></span>
                          )}
                          {renderLink(col, { className: 'mm-title', tabIndex: isOpen ? 0 : -1, children: <>{lbl(col)}{badge(col)}</> })}
                          {col.children?.length > 0 && (
                            <ul>
                              {col.children.map((l) => (
                                <li key={l.id}>{renderLink(l, { tabIndex: isOpen ? 0 : -1, children: <>{lbl(l)}{badge(l)}</> })}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <ul className={`dd-panel ${isOpen ? 'open' : ''}`}>
                    {kids.map((k) => (
                      <li key={k.id}>
                        {renderLink(k, { tabIndex: isOpen ? 0 : -1, children: <>{lbl(k)}{badge(k)}</> })}
                        {k.children?.length > 0 && (
                          <ul>
                            {k.children.map((l) => <li key={l.id}>{renderLink(l, { tabIndex: isOpen ? 0 : -1 })}</li>)}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          }) : links.map(([h, l, hasMega]) => hasMega ? (
            <div key={h} className="nav-item" onMouseEnter={() => open()} onMouseLeave={close} onFocus={() => open()} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) close(); }}>
              <Link href={h} className={pathname.startsWith('/fragrance') ? 'active' : ''} aria-haspopup="true" aria-expanded={mega}>{l}</Link>
              <div className={`mega-panel ${mega ? 'open' : ''}`}>
                <div className="mega-in">
                  <div className="mega-intro">
                    <p className="label">{t.nav.fragrances}</p>
                    <strong>{t.home.shopRooms}</strong>
                    <Link href="/shop" className="tlink" tabIndex={mega ? 0 : -1}>{t.home.shopAll}</Link>
                    <Link href="/discover" className="tlink" tabIndex={mega ? 0 : -1}>{t.finder.kicker}</Link>
                  </div>
                  <div className="mega-cards">
                    {rooms.map((r) => (
                      <Link key={r.slug} href={r.href} className={`mc ${r.slug === 'exclusive-creations' ? 'mc-dark' : ''}`} tabIndex={mega ? 0 : -1}>
                        <span className="mc-img">{r.image && <Image src={r.image} alt="" fill sizes="96px" />}</span>
                        <span className="mc-t">
                          <span className="label">{L(r.tag)}</span>
                          <strong>{L(r.menu)}</strong>
                          <em>{r.slug === 'exclusive-creations' ? t.rooms.niche.label : countLabel(r.count)}</em>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : <Link key={h} href={h} className={pathname.startsWith(h) ? 'active' : ''}>{l}</Link>)}
        </nav>
      </div>
      {/* Search bar that drops under the compact (scrolled) and mobile header */}
      <div className={`hdr-sbar ${searchOpen ? 'open' : ''}`} aria-hidden={!searchOpen}>
        <form className="hdr-sbar-form" role="search" onSubmit={submitSearch}>
          <Icon n="search" size={18} />
          <input
            ref={searchInput}
            type="search"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            maxLength={100}
            tabIndex={searchOpen ? 0 : -1}
            placeholder={lang === 'en' ? 'Search for products' : 'ابحث عن المنتجات'}
            aria-label={lang === 'en' ? 'Search for products' : 'ابحث عن المنتجات'}
          />
        </form>
      </div>

      {/* Mobile menu: light panel, big serif links, accordions for sub-menus */}
      <div className={`fmenu ${menu ? 'open' : ''}`} aria-hidden={!menu} data-lenis-prevent>
        <div className="fm-scroll">
          <form className="fmenu-search" role="search" onSubmit={submitSearch}>
            <input type="search" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} maxLength={100} tabIndex={menu ? 0 : -1}
              placeholder={lang === 'en' ? 'Search for products' : 'ابحث عن المنتجات'} aria-label={lang === 'en' ? 'Search for products' : 'ابحث عن المنتجات'} />
            <button type="submit" tabIndex={menu ? 0 : -1} aria-label={lang === 'en' ? 'Search' : 'بحث'}><Icon n="search" size={18} /></button>
          </form>

          <ul className="fm-list">
            {mobileNav.map((it, i) => {
              const isOpen = acc === it.key;
              const hasKids = it.kids.length > 0;
              return (
                <li key={it.key} style={{ '--i': i }} className={isOpen ? 'open' : ''}>
                  <div className="fm-row">
                    {it.href
                      ? <Link href={it.href} className="fm-link" tabIndex={menu ? 0 : -1} onClick={() => setMenu(false)}>{it.label}</Link>
                      : <button type="button" className="fm-link" tabIndex={menu ? 0 : -1} onClick={() => setAcc(isOpen ? null : it.key)}>{it.label}</button>}
                    {hasKids && (
                      <button type="button" className="fm-toggle" tabIndex={menu ? 0 : -1} aria-expanded={isOpen} aria-label={it.label} onClick={() => setAcc(isOpen ? null : it.key)}>
                        <Icon n={isOpen ? 'minus' : 'plus'} size={16} />
                      </button>
                    )}
                  </div>
                  {hasKids && (
                    <ul className="fm-sub">
                      <li><div>
                        {it.kids.map((k) => (
                          <Link key={k.key} href={k.href} tabIndex={menu && isOpen ? 0 : -1} onClick={() => setMenu(false)}>{k.label}</Link>
                        ))}
                      </div></li>
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="fm-foot">
            <div className="fm-meta">
              <Link href="/account" tabIndex={menu ? 0 : -1} onClick={() => setMenu(false)}><Icon n="user" size={16} />{t.nav.account}</Link>
              <Link href="/contact" tabIndex={menu ? 0 : -1} onClick={() => setMenu(false)}>{t.nav.contact}</Link>
            </div>
            <div className="fm-lang" role="group" aria-label="Language">
              <button type="button" className={lang === 'en' ? 'on' : ''} tabIndex={menu ? 0 : -1} onClick={() => setLang('en')}>English</button>
              <button type="button" lang="ar" className={lang === 'ar' ? 'on' : ''} tabIndex={menu ? 0 : -1} onClick={() => setLang('ar')}>العربية</button>
            </div>
            <p className="fmenu-tag">{t.tagline}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export function CartDrawer() {
  const { t, L, money, items, totals, setQty, removeItem, drawer, setDrawer } = useApp();
  const pathname = (usePathname() || '').replace(/^\/ar(?=\/|$)/, '') || '/';
  useEffect(() => setDrawer(false), [pathname, setDrawer]);
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && setDrawer(false);
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [setDrawer]);
  const msg = totals.freeLeft > 0 ? t.cart.freeLeft.replace('{amt}', money(totals.freeLeft)) : t.cart.freeDone;
  return (
    <div className={`drawer-wrap ${drawer ? 'open' : ''}`} aria-hidden={!drawer}>
      <div className="scrim" onClick={() => setDrawer(false)} />
      <aside className="drawer" role="dialog" aria-label={t.cart.title}>
        <div className="drawer-head">
          <h2>{t.cart.title} <span className="muted">({totals.count})</span></h2>
          <button className="x" onClick={() => setDrawer(false)} aria-label={t.nav.close}><Icon n="close" /></button>
        </div>
        {items.length > 0 && (
          <div className="ship-bar"><p>{msg}</p><div className="bar"><i style={{ transform: `scaleX(${totals.freeProgress})` }} /></div></div>
        )}
        <div className="drawer-body" data-lenis-prevent>
          {items.length === 0 ? (
            <div className="empty-state"><h3>{t.cart.empty}</h3><p className="muted">{t.cart.emptySub}</p><Link href="/shop" className="btn" onClick={() => setDrawer(false)}>{t.cart.continue}</Link></div>
          ) : items.map((i) => (
            <div className="mini" key={i.id}>
              <Link href={`/fragrance/${i.slug}`} className="mini-img"><Image src={i.image} alt="" fill sizes="80px" /></Link>
              <div className="mini-info">
                <Link href={`/fragrance/${i.slug}`} className="mini-name">{L(i.name)}</Link>
                <span className="label">{i.size}</span>
                <div className="qty sm">
                  <button onClick={() => setQty(i.id, i.qty - 1)} aria-label="-"><Icon n="minus" size={14} /></button><span>{i.qty}</span>
                  <button onClick={() => setQty(i.id, i.qty + 1)} aria-label="+"><Icon n="plus" size={14} /></button>
                </div>
              </div>
              <div className="mini-end"><span>{money(i.price * i.qty)}</span><button className="link" onClick={() => removeItem(i.id)}>{t.cart.remove}</button></div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="drawer-foot">
            <div className="row-between"><span>{t.cart.subtotal}</span><strong>{money(totals.subtotal)}</strong></div>
            <p className="label">{t.cart.vat}</p>
            <Link href="/checkout" className="btn btn-block">{t.cart.checkout}</Link>
            <Link href="/cart" className="link center">{t.cart.viewCart}</Link>
          </div>
        )}
      </aside>
    </div>
  );
}

/* Footer: service highlights, link columns, newsletter, legal bar */
const DEFAULT_FOOT_PAGES = [{ slug: 'shipping', k: 'shipping' }, { slug: 'returns', k: 'refund' }, { slug: 'privacy', k: 'privacy' }, { slug: 'terms', k: 'terms' }];
const FOOT_TXT = {
  en: {
    ship: 'Delivered across the UAE', shipSub: 'Within {days} working days',
    cod: 'Convenient Cash on Delivery', codSub: 'Simple, safe, and flexible payment at delivery',
    support: 'Quick Online Support', supportSub: 'Call us or WhatsApp for assistance',
    gifts: 'Complimentary Gifts & Samples', giftsSub: 'Discover more with complimentary samples',
    cats: 'Categories', shopAll: 'Shop All',
    info: 'Information', shipping: 'Shipping & Delivery', refund: 'Refund Policy', privacy: 'Privacy Policy', terms: 'Terms of Service', contact: 'Contact Us',
    about: 'About', creations: '{brand} Creations', journal: 'The Journal', discover: 'Discover', track: 'Track Your Order', corporate: 'Corporate Orders',
    news: 'Newsletter', email: 'Enter email address', agree: 'I agree with the', termsLink: 'terms and conditions',
    thanks: 'Thank you for subscribing.', invalid: 'Please enter a valid email address.', accept: 'Please accept the terms to subscribe.', fail: 'Could not subscribe right now. Please try again.',
    join: 'Subscribe',
  },
  ar: {
    ship: 'توصيل إلى جميع أنحاء الإمارات', shipSub: 'خلال {days} أيام عمل',
    cod: 'الدفع عند الاستلام', codSub: 'دفع بسيط وآمن ومرن عند التسليم',
    support: 'دعم سريع عبر الإنترنت', supportSub: 'اتصل بنا أو راسلنا عبر واتساب',
    gifts: 'هدايا وعينات مجانية', giftsSub: 'اكتشف المزيد مع العينات المجانية',
    cats: 'الفئات', shopAll: 'تسوق الكل',
    info: 'معلومات', shipping: 'الشحن والتوصيل', refund: 'سياسة الاسترجاع', privacy: 'سياسة الخصوصية', terms: 'شروط الخدمة', contact: 'اتصل بنا',
    about: 'عن العلامة', creations: 'إبداعات {brand}', journal: 'المجلة', discover: 'اكتشف', track: 'تتبع طلبك', corporate: 'طلبات الشركات',
    news: 'النشرة البريدية', email: 'أدخل البريد الإلكتروني', agree: 'أوافق على', termsLink: 'الشروط والأحكام',
    thanks: 'شكراً لاشتراكك.', invalid: 'يرجى إدخال بريد إلكتروني صحيح.', accept: 'يرجى الموافقة على الشروط للاشتراك.', fail: 'تعذر الاشتراك حالياً. يرجى المحاولة مرة أخرى.',
    join: 'اشتراك',
  },
};

const FT_ICONS = {
  ship: <><path d="M3 7h11v9H3z" /><path d="M14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.7" /><circle cx="17" cy="17.5" r="1.7" /></>,
  cod: <><path d="M12 3v5" /><path d="M10 5h3.2a1.8 1.8 0 0 1 0 3.6h-2.4a1.8 1.8 0 0 0 0 3.6H14" /><path d="M3 17c3 0 4.5-1.2 6-1.2h5a1.5 1.5 0 0 1 0 3H10.5" /><path d="M14 17.8 20.5 15a1.6 1.6 0 0 1 1.5 2.7L15 21.5H9L3 19" /></>,
  support: <><path d="M4 5h16v11H9l-4 3.5V16H4z" /><path d="M8 9.5h8M8 12.5h5" /></>,
  gifts: <><rect x="8" y="9" width="8" height="12" rx="1.2" /><path d="M10 9V6h4v3M12 3v3" /><path d="M16.5 4.5l1.2-1.2M18 6.5h1.6" /></>,
};

const SOCIAL_ICONS = {
  instagram: ['Instagram', <><rect x="4" y="4" width="16" height="16" rx="4.5" /><circle cx="12" cy="12" r="3.6" /><path d="M16.8 7.2v.01" /></>],
  facebook: ['Facebook', <path d="M14 8.5h2.5V5H14a3.5 3.5 0 0 0-3.5 3.5V11H8v3.5h2.5V21H14v-6.5h2.4l.6-3.5H14V8.5Z" />],
  tiktok: ['TikTok', <path d="M14 4v10.2a3.4 3.4 0 1 1-3.4-3.4M14 4c.3 2.3 1.8 3.8 4.2 4" />],
  youtube: ['YouTube', <><rect x="3" y="6" width="18" height="12" rx="3.5" /><path d="m10.5 9.5 4 2.5-4 2.5v-5Z" /></>],
  x: ['X', <path d="M5 5l14 14M19 5 5 19" />],
  snapchat: ['Snapchat', <path d="M12 3.5c2.6 0 4 1.9 4 4.2V10c.5.4 1.3.5 2.2.5-.3.9-1 1.2-1.9 1.4.4 1 1.2 1.7 2.2 2-.9.7-2 .8-3 .9-.3.6-.9 1.2-1.7 1.2-.6 0-1-.4-1.8-.4s-1.2.4-1.8.4c-.8 0-1.4-.6-1.7-1.2-1-.1-2.1-.2-3-.9 1-.3 1.8-1 2.2-2-.9-.2-1.6-.5-1.9-1.4.9 0 1.7-.1 2.2-.5V7.7c0-2.3 1.4-4.2 4-4.2Z" />],
};
const PAY_LABELS = {
  cod: { en: 'Cash on delivery', ar: 'الدفع عند الاستلام' },
  visa: { en: 'VISA', ar: 'VISA' },
  mastercard: { en: 'Mastercard', ar: 'Mastercard' },
  amex: { en: 'AMEX', ar: 'AMEX' },
  applepay: { en: 'Apple Pay', ar: 'Apple Pay' },
  tabby: { en: 'tabby', ar: 'tabby' },
  tamara: { en: 'tamara', ar: 'tamara' },
};

export function Footer({ rooms = [], pages = [] }) {
  const { t, L, lang, money, settings } = useApp();
  const footPages = pages.filter((p) => p.show_in_footer);
  const x = FOOT_TXT[lang === 'ar' ? 'ar' : 'en'];
  const ig = settings?.social_instagram || process.env.NEXT_PUBLIC_INSTAGRAM_URL || '#';
  const brandName = settings?.store_name || t.brand || 'ALAYNAAS';
  const ar = lang === 'ar';
  const socials = Object.keys(SOCIAL_ICONS).filter((k) => /^https?:\/\//i.test(String(settings?.[`social_${k}`] || '')));
  const payments = String(settings?.footer_payment_methods || '').split(',').map((p) => p.trim()).filter((p) => PAY_LABELS[p]);
  const trn = String(settings?.tax_trn || '').trim();

  const [email, setEmail] = useState('');
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [busy, setBusy] = useState(false);

  const resolveAsset = (u, fallback) => {
    if (!u) return fallback;
    if (u.startsWith('http://') || u.startsWith('https://')) return u;
    return u.startsWith('/') ? u : `/${u}`;
  };
  const footerLogoSrc = resolveAsset(settings?.footer_logo || settings?.frontend_logo_dark || settings?.frontend_logo, null);

  const freeOver = Number(settings?.shipping_free_over) || 0;
  const waDigits = String(settings?.whatsapp_number || '').replace(/\D/g, '');
  const supportHref = waDigits ? `https://wa.me/${waDigits}` : '/contact';

  const features = [
    { k: 'ship', title: x.ship, sub: x.shipSub.replace('{days}', settings?.delivery_days || '2 - 5'), href: '/policies/shipping' },
    { k: 'cod', title: x.cod, sub: x.codSub, href: '/policies/shipping' },
    { k: 'support', title: x.support, sub: x.supportSub, href: supportHref, ext: !!waDigits },
    { k: 'gifts', title: x.gifts, sub: x.giftsSub, href: '/discover' },
  ];

  const submit = async (e) => {
    e.preventDefault();
    const v = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || v.length > 150) return setStatus({ type: 'err', msg: x.invalid });
    if (!agree) return setStatus({ type: 'err', msg: x.accept });
    setBusy(true);
    try {
      await subscribeNewsletter(v, lang === 'ar' ? 'ar' : 'en');
      setStatus({ type: 'ok', msg: x.thanks });
      setEmail('');
      setAgree(false);
    } catch {
      setStatus({ type: 'err', msg: x.fail });
    } finally {
      setBusy(false);
    }
  };

  return (
    <footer className="ft">
      <div className="ft-wrap">
        <ul className="ft-feats">
          {features.map((f) => (
            <li key={f.k}>
              <a href={f.href} {...(f.ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                <svg className="ft-ic" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{FT_ICONS[f.k]}</svg>
                <strong>{f.title}</strong>
                <span>{f.sub}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="ft-cols">
          <nav aria-label={x.cats}>
            <h2>{x.cats}</h2>
            <ul>
              {rooms.map((r) => <li key={r.slug}><Link href={r.href}>{L(r.tag)}</Link></li>)}
              <li><Link href="/shop">{x.shopAll}</Link></li>
            </ul>
          </nav>
          <nav aria-label={x.info}>
            <h2>{x.info}</h2>
            <ul>
              {(footPages.length ? footPages : DEFAULT_FOOT_PAGES.map((d) => ({ slug: d.slug, title_en: x[d.k], title_ar: x[d.k] }))).map((p) => (
                <li key={p.slug}><Link href={`/policies/${p.slug}`}>{(lang === 'ar' && p.title_ar) || p.title_en}</Link></li>
              ))}
              <li><Link href="/contact">{x.contact}</Link></li>
            </ul>
          </nav>
          <nav aria-label={x.about}>
            <h2>{x.about}</h2>
            <ul>
              <li><Link href="/story">{x.creations.replace('{brand}', brandName)}</Link></li>
              <li><Link href="/journal">{x.journal}</Link></li>
              <li><Link href="/discover">{x.discover}</Link></li>
              <li><Link href="/corporate-orders">{x.corporate}</Link></li>
              <li><Link href="/account">{x.track}</Link></li>
            </ul>
          </nav>
          <div className="ft-news">
            <h2>{x.news}</h2>
            <form onSubmit={submit} noValidate>
              <div className="ft-field">
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); if (status.msg) setStatus({ type: '', msg: '' }); }}
                  placeholder={x.email} aria-label={x.email} autoComplete="email" maxLength={150} />
                <button type="submit" disabled={busy} aria-label={x.join}><Icon n="arrow" size={18} /></button>
              </div>
              <label className="ft-agree">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                <span>{x.agree} <Link href="/policies/terms">{x.termsLink}</Link></span>
              </label>
              <p className={`ft-msg ${status.type}`} role="status" aria-live="polite">{status.msg}</p>
            </form>
          </div>
        </div>

        {(socials.length > 0 || payments.length > 0 || trn) && (
          <div className="ft-trust">
            {socials.length > 0 && (
              <ul className="ft-social" aria-label={ar ? 'تابعنا' : 'Follow us'}>
                {socials.map((k) => (
                  <li key={k}>
                    <a href={settings[`social_${k}`]} target="_blank" rel="noopener noreferrer" aria-label={SOCIAL_ICONS[k][0]} title={SOCIAL_ICONS[k][0]}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{SOCIAL_ICONS[k][1]}</svg>
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {payments.length > 0 && (
              <ul className="ft-pay" aria-label={ar ? 'طرق الدفع' : 'Payment methods'}>
                {payments.map((p) => <li key={p}>{PAY_LABELS[p][ar ? 'ar' : 'en']}</li>)}
              </ul>
            )}
            {trn && <p className="ft-trn">{ar ? 'الرقم الضريبي' : 'TRN'} <span dir="ltr">{trn}</span></p>}
          </div>
        )}

        <div className="ft-bottom">
          {footerLogoSrc && <img src={footerLogoSrc} alt={brandName} className="ft-logo" style={{ height: `${Number(settings?.footer_logo_height) || 40}px` }} />}
          <span>© {new Date().getFullYear()} {brandName}. {t.footer.rights}</span>
          <span className="ft-bottom-links">
            {socials.length === 0 && ig !== '#' && <a href={ig} target="_blank" rel="noreferrer">{t.footer.instagram}</a>}
            <span>{t.footer.country}</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

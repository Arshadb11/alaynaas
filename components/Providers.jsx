'use client';
import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { dict, SHIPPING_FEE, SHIPPING_FREE_OVER } from '@/lib/i18n';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

// Pages with a dark opening call useTone('light') so the transparent header turns ivory.
export function useTone(tone) {
  const { setTone } = useApp();
  useEffect(() => {
    setTone(tone);
    return () => setTone('dark');
  }, [tone, setTone]);
}

export default function Providers({ initialLang, settings = {}, children }) {
  const [lang, setLangState] = useState(initialLang);
  const [items, setItems] = useState([]); // { id, slug, qty, price, name, image, size }
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState('');
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const [tone, setTone] = useState('dark');
  const toastTimer = useRef();

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem('aly_cart') || '[]')); } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem('aly_cart', JSON.stringify(items)); }, [items, ready]);
  useEffect(() => { document.body.style.overflow = drawer || menu ? 'hidden' : ''; }, [drawer, menu]);

  const setLang = useCallback((l) => {
    document.cookie = `lang=${l}; path=/; max-age=31536000`;
    document.documentElement.lang = l;
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    setLangState(l);
  }, []);

  const t = dict[lang];
  // Localise { en, ar } objects; falls back to English when a translation is missing.
  const L = useCallback((o) => (o && typeof o === 'object' && !Array.isArray(o) ? o[lang] ?? o.en : o), [lang]);
  const money = useCallback(
    (n) => (lang === 'ar' ? `${Number(n).toLocaleString('ar-AE')} د.إ` : `AED ${Number(n).toLocaleString('en-AE')}`),
    [lang]
  );

  // Dynamic shipping calculation from Admin Settings
  const shippingFee = Number(settings?.shipping_fee ?? SHIPPING_FEE);
  const shippingFreeOver = Number(settings?.shipping_free_over ?? SHIPPING_FREE_OVER);

  // addItem(product, qty, variant?) - a variant ({ key, label, price }) is one purchasable size; each size is its own cart line.
  const addItem = (product, qty = 1, variant) => {
    const id = variant ? `${product.id}-${variant.key}` : product.id;
    const price = variant ? variant.price : product.price;
    const size = variant ? variant.label : product.size;
    setItems((prev) => {
      const found = prev.find((i) => i.id === id);
      if (found) return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { id, productId: product.id, slug: product.slug, qty, price, name: product.name, image: product.image, size }];
    });
    setDrawer(true);
  };
  const setQty = (id, qty) => setItems((p) => (qty < 1 ? p.filter((i) => i.id !== id) : p.map((i) => (i.id === id ? { ...i, qty } : i))));
  const removeItem = (id) => setItems((p) => p.filter((i) => i.id !== id));
  const clearCart = () => setItems([]);
  const notify = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  }, []);

  const totals = useMemo(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
    const shipping = items.length === 0 || subtotal >= shippingFreeOver ? 0 : shippingFee;
    return {
      count,
      subtotal,
      shipping,
      total: subtotal + shipping,
      freeLeft: Math.max(0, shippingFreeOver - subtotal),
      freeProgress: Math.min(1, subtotal / shippingFreeOver),
    };
  }, [items, shippingFee, shippingFreeOver]);

  if (settings?.maintenance_mode) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0b0a09', color: '#e8dfd5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem', color: '#D4AF37' }}>
          {settings.store_name || 'ALAYNAAS'}
        </h1>
        <p style={{ fontSize: '0.875rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a8a29e', marginBottom: '2rem' }}>
          {settings.store_tagline || 'For those who carry the crown'}
        </p>
        <div style={{ maxWidth: '480px', padding: '1.5rem', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '1rem', background: 'rgba(0,0,0,0.5)' }}>
          <p style={{ lineHeight: '1.7', fontSize: '1rem' }}>
            {settings.maintenance_message || 'ALAYNAAS online boutique is currently undergoing scheduled enhancements.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Ctx.Provider value={{ lang, setLang, t, L, money, items, addItem, setQty, removeItem, clearCart, totals, ready, drawer, setDrawer, menu, setMenu, tone, setTone, notify, settings }}>
      {children}
      <div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">{toast}</div>
    </Ctx.Provider>
  );
}

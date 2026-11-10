'use client';
import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { useApp } from './Providers';

/*
 * Static QR codes: the content (link, text, Wi-Fi…) is encoded directly in the pattern,
 * generated in the browser. Nothing is stored or redirected, so the codes never expire.
 */

const TYPES = ['url', 'text', 'whatsapp', 'phone', 'email', 'wifi'];

const esc = (s) => String(s).replace(/([\\;,:"])/g, '\\$1'); // Wi-Fi QR escaping

function payload(type, v) {
  switch (type) {
    case 'url': {
      const u = v.url.trim();
      if (!u) return '';
      return /^[a-z][a-z0-9+.-]*:/i.test(u) ? u : `https://${u}`;
    }
    case 'text': return v.text;
    case 'whatsapp': {
      const n = v.phone.replace(/[^0-9]/g, '');
      if (!n) return '';
      return `https://wa.me/${n}${v.message.trim() ? `?text=${encodeURIComponent(v.message.trim())}` : ''}`;
    }
    case 'phone': {
      const n = v.phone.replace(/[^0-9+]/g, '');
      return n ? `tel:${n}` : '';
    }
    case 'email': {
      const e = v.email.trim();
      if (!e) return '';
      const q = [v.subject.trim() && `subject=${encodeURIComponent(v.subject.trim())}`, v.message.trim() && `body=${encodeURIComponent(v.message.trim())}`].filter(Boolean).join('&');
      return `mailto:${e}${q ? `?${q}` : ''}`;
    }
    case 'wifi': {
      if (!v.ssid.trim()) return '';
      const sec = v.security === 'nopass' ? 'nopass' : v.security;
      return `WIFI:T:${sec};S:${esc(v.ssid)};${sec === 'nopass' ? '' : `P:${esc(v.password)};`}${v.hidden ? 'H:true;' : ''};`;
    }
    default: return '';
  }
}

function download(href, name) {
  const a = document.createElement('a');
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function QrGeneratorView() {
  const { lang } = useApp();
  const isAr = lang === 'ar';
  const L = isAr
    ? {
      kicker: 'أداة', title: 'مولّد رمز QR', lead: 'أنشئ رمز QR ثابتاً صالحاً مدى الحياة. يتم ترميز المحتوى داخل الرمز نفسه، لذلك لا تنتهي صلاحيته أبداً.',
      types: { url: 'رابط', text: 'نص', whatsapp: 'واتساب', phone: 'هاتف', email: 'بريد', wifi: 'واي فاي' },
      url: 'الرابط', text: 'النص', phone: 'رقم الهاتف (مع رمز الدولة)', message: 'الرسالة (اختياري)', email: 'البريد الإلكتروني', subject: 'الموضوع (اختياري)',
      ssid: 'اسم الشبكة', password: 'كلمة المرور', security: 'الحماية', none: 'بدون', hidden: 'شبكة مخفية',
      fg: 'لون الرمز', bg: 'لون الخلفية', size: 'الحجم (بكسل)', level: 'تصحيح الأخطاء', margin: 'الهامش',
      png: 'تنزيل PNG', svg: 'تنزيل SVG', copy: 'نسخ الصورة', copied: 'تم النسخ', empty: 'أدخل المحتوى لإنشاء الرمز', tooLong: 'المحتوى طويل جداً لرمز QR.',
      note: 'الرمز صالح مدى الحياة طالما بقي الرابط نفسه يعمل. استخدم SVG للطباعة بأي حجم.',
      lowContrast: 'التباين منخفض: قد لا تقرأ بعض الكاميرات الرمز. استخدم لوناً داكناً على خلفية فاتحة.',
    }
    : {
      kicker: 'Tool', title: 'QR Code Generator', lead: 'Create a static QR code that is valid for life. The content is encoded in the code itself, so it never expires and needs no account or subscription.',
      types: { url: 'Link', text: 'Text', whatsapp: 'WhatsApp', phone: 'Phone', email: 'Email', wifi: 'Wi-Fi' },
      url: 'Link', text: 'Text', phone: 'Phone number (with country code)', message: 'Message (optional)', email: 'Email address', subject: 'Subject (optional)',
      ssid: 'Network name', password: 'Password', security: 'Security', none: 'None', hidden: 'Hidden network',
      fg: 'Code colour', bg: 'Background', size: 'Size (px)', level: 'Error correction', margin: 'Quiet zone',
      png: 'Download PNG', svg: 'Download SVG', copy: 'Copy image', copied: 'Copied', empty: 'Enter some content to create your code', tooLong: 'That content is too long for a QR code.',
      note: 'The code works for life as long as what it points to (for a link, the web page) keeps working. Use SVG for print at any size.',
      lowContrast: 'Low contrast: some cameras may not read this code. Use a dark colour on a light background.',
    };

  const [type, setType] = useState('url');
  const [v, setV] = useState({ url: '', text: '', phone: '', message: '', email: '', subject: '', ssid: '', password: '', security: 'WPA', hidden: false });
  const [fg, setFg] = useState('#15231b');
  const [bg, setBg] = useState('#ffffff');
  const [size, setSize] = useState(1024);
  const [level, setLevel] = useState('M');
  const [margin, setMargin] = useState(4);
  const [png, setPng] = useState('');
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const set = (k) => (e) => setV((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const data = useMemo(() => payload(type, v), [type, v]);

  useEffect(() => {
    let live = true;
    if (!data) { setPng(''); setSvg(''); setError(''); return undefined; }
    const opts = { errorCorrectionLevel: level, margin: Number(margin), color: { dark: fg, light: bg } };
    Promise.all([
      QRCode.toDataURL(data, { ...opts, width: Number(size) }),
      QRCode.toString(data, { ...opts, type: 'svg' }),
    ]).then(([p, s]) => {
      if (!live) return;
      setPng(p); setSvg(s); setError('');
    }).catch(() => {
      if (!live) return;
      setPng(''); setSvg(''); setError(L.tooLong);
    });
    return () => { live = false; };
  }, [data, fg, bg, size, level, margin, L.tooLong]);

  const lum = (hex) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const contrast = (Math.max(lum(fg), lum(bg)) + 0.05) / (Math.min(lum(fg), lum(bg)) + 0.05);
  const inverted = lum(fg) > lum(bg);

  const fileBase = `qr-${type}-${Date.now()}`;
  async function copyImage() {
    try {
      const blob = await (await fetch(png)).blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard images unsupported: downloads still work */ }
  }

  return (
    <div className="ct qr">
      <section className="ct-hero">
        <p className="ct-kicker">{L.kicker}</p>
        <h1>{L.title}</h1>
        <p className="ct-lead">{L.lead}</p>
      </section>

      <div className="qr-grid">
        <div className="ct-form">
          <div className="qr-tabs" role="tablist">
            {TYPES.map((k) => (
              <button key={k} type="button" role="tab" aria-selected={type === k} className={type === k ? 'on' : ''} onClick={() => setType(k)}>{L.types[k]}</button>
            ))}
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            {type === 'url' && <label>{L.url}<input className="inp" dir="ltr" inputMode="url" placeholder="https://www.alaynaas.com" value={v.url} onChange={set('url')} /></label>}
            {type === 'text' && <label>{L.text}<textarea className="inp" rows={5} value={v.text} onChange={set('text')} maxLength={2000} /></label>}
            {(type === 'whatsapp' || type === 'phone') && <label>{L.phone}<input className="inp" dir="ltr" inputMode="tel" placeholder="+971 50 000 0000" value={v.phone} onChange={set('phone')} /></label>}
            {type === 'whatsapp' && <label>{L.message}<textarea className="inp" rows={3} value={v.message} onChange={set('message')} maxLength={500} /></label>}
            {type === 'email' && (
              <>
                <label>{L.email}<input className="inp" type="email" dir="ltr" value={v.email} onChange={set('email')} /></label>
                <label>{L.subject}<input className="inp" value={v.subject} onChange={set('subject')} maxLength={160} /></label>
                <label>{L.message}<textarea className="inp" rows={3} value={v.message} onChange={set('message')} maxLength={500} /></label>
              </>
            )}
            {type === 'wifi' && (
              <>
                <label>{L.ssid}<input className="inp" dir="ltr" value={v.ssid} onChange={set('ssid')} /></label>
                <div className="ct-row">
                  <label>{L.security}
                    <select className="inp" value={v.security} onChange={set('security')}>
                      <option value="WPA">WPA / WPA2 / WPA3</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">{L.none}</option>
                    </select>
                  </label>
                  {v.security !== 'nopass' && <label>{L.password}<input className="inp" dir="ltr" value={v.password} onChange={set('password')} /></label>}
                </div>
                <label className="qr-check"><input type="checkbox" checked={v.hidden} onChange={set('hidden')} />{L.hidden}</label>
              </>
            )}

            <div className="qr-opts">
              <label>{L.fg}<span className="qr-color"><input type="color" value={fg} onChange={(e) => setFg(e.target.value)} /><code>{fg}</code></span></label>
              <label>{L.bg}<span className="qr-color"><input type="color" value={bg} onChange={(e) => setBg(e.target.value)} /><code>{bg}</code></span></label>
              <label>{L.size}
                <select className="inp" value={size} onChange={(e) => setSize(e.target.value)}>
                  {[512, 1024, 2048, 4096].map((n) => <option key={n} value={n}>{n} × {n}</option>)}
                </select>
              </label>
              <label>{L.level}
                <select className="inp" value={level} onChange={(e) => setLevel(e.target.value)}>
                  <option value="L">L · 7%</option>
                  <option value="M">M · 15%</option>
                  <option value="Q">Q · 25%</option>
                  <option value="H">H · 30%</option>
                </select>
              </label>
              <label>{L.margin}
                <select className="inp" value={margin} onChange={(e) => setMargin(e.target.value)}>
                  {[0, 1, 2, 4, 6].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
            </div>
          </form>
        </div>

        <aside className="qr-preview">
          <div className="qr-frame" style={{ background: bg }}>
            {svg
              // eslint-disable-next-line react/no-danger -- SVG markup generated locally by the qrcode library
              ? <div className="qr-img" dangerouslySetInnerHTML={{ __html: svg }} />
              : <p className="qr-empty">{error || L.empty}</p>}
          </div>
          {svg && (contrast < 3 || inverted) && <p className="ct-err">{L.lowContrast}</p>}
          <div className="qr-actions">
            <button type="button" className="btn btn-block" disabled={!png} onClick={() => download(png, `${fileBase}.png`)}>{L.png}</button>
            <button type="button" className="btn btn-line btn-block" disabled={!svg} onClick={() => download(URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })), `${fileBase}.svg`)}>{L.svg}</button>
            <button type="button" className="btn btn-line btn-block" disabled={!png} onClick={copyImage}>{copied ? L.copied : L.copy}</button>
          </div>
          {data && <p className="qr-data" dir="ltr">{data}</p>}
          <p className="qr-note">{L.note}</p>
        </aside>
      </div>
    </div>
  );
}

'use client';
import Link from '@/components/Link';
import { useApp } from './Providers';

/**
 * Policy / static page, content comes from Admin > Storefront > Pages.
 * Lightweight markdown: "## heading", "- bullet", "1. numbered", "**bold**", "[label](url)", blank line = paragraph.
 * Text is rendered as React nodes (never as HTML), links are limited to site paths and http(s).
 */

const SAFE_URL = /^(\/(?!\/)|https?:\/\/|mailto:|tel:)/i;

export function inline(text, keyPrefix) {
  const out = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      out.push(<strong key={`${keyPrefix}-b${i++}`}>{m[1]}</strong>);
    } else if (SAFE_URL.test(m[3])) {
      const external = /^https?:/i.test(m[3]);
      out.push(
        external
          ? <a key={`${keyPrefix}-a${i++}`} href={m[3]} target="_blank" rel="noopener noreferrer">{m[2]}</a>
          : /^(mailto|tel):/i.test(m[3])
            ? <a key={`${keyPrefix}-a${i++}`} href={m[3]}>{m[2]}</a>
            : <Link key={`${keyPrefix}-a${i++}`} href={m[3]}>{m[2]}</Link>
      );
    } else {
      out.push(m[2]);
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Turn the text into blocks: { type: 'h'|'p'|'ul'|'ol', ... } */
export function parseBlocks(src) {
  const blocks = [];
  let para = [];
  let list = null;
  const flushPara = () => { if (para.length) { blocks.push({ type: 'p', text: para.join(' ') }); para = []; } };
  const flushList = () => { if (list) { blocks.push(list); list = null; } };

  for (const raw of String(src || '').replace(/\r/g, '').split('\n')) {
    const line = raw.trim();
    if (!line) { flushPara(); flushList(); continue; }
    let m;
    if ((m = line.match(/^#{1,3}\s+(.*)$/))) { flushPara(); flushList(); blocks.push({ type: 'h', text: m[1] }); continue; }
    if ((m = line.match(/^[-*•]\s+(.*)$/))) {
      flushPara();
      if (!list || list.type !== 'ul') { flushList(); list = { type: 'ul', items: [] }; }
      list.items.push(m[1]);
      continue;
    }
    if ((m = line.match(/^\d+[.)]\s+(.*)$/))) {
      flushPara();
      if (!list || list.type !== 'ol') { flushList(); list = { type: 'ol', items: [] }; }
      list.items.push(m[1]);
      continue;
    }
    flushList();
    para.push(line);
  }
  flushPara();
  flushList();
  return blocks;
}

export function PolicyPage({ page, pages = [] }) {
  const { lang, money, settings } = useApp();
  const ar = lang === 'ar';

  const feeNum = Number(settings?.shipping_fee);
  const freeNum = Number(settings?.shipping_free_over);
  const tokens = {
    shipping_fee: Number.isFinite(feeNum) ? money(feeNum) : '',
    free_over: Number.isFinite(freeNum) && freeNum > 0 ? money(freeNum) : '',
    delivery_days: String(settings?.delivery_days ?? '2 - 5'),
    refund_days: String(settings?.refund_days ?? 7),
    support_email: settings?.support_email || '',
    support_phone: settings?.support_phone || '',
    store_name: settings?.store_name || 'ALAYNAAS',
    store_address: settings?.store_address || '',
  };
  const fill = (s) => String(s || '').replace(/\{(\w+)\}/g, (all, k) => (k in tokens ? tokens[k] : all));

  const title = (ar && page.title_ar) || page.title_en;
  const summary = fill((ar && page.summary_ar) || page.summary_en);
  const content = fill((ar && page.content_ar) || page.content_en);
  const blocks = parseBlocks(content);
  const headings = blocks.filter((b) => b.type === 'h');

  const updated = page.updated_at ? new Date(page.updated_at) : null;
  const updatedLabel = updated && !Number.isNaN(updated.getTime())
    ? updated.toLocaleDateString(ar ? 'ar-AE' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const slugify = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');

  return (
    <div className="pol">
      <header className="pol-head">
        <div className="pol-wrap">
          <p className="pol-kicker">{ar ? 'معلومات' : 'Information'}</p>
          <h1 className="pol-title">{title}</h1>
          {summary && <p className="pol-lead">{summary}</p>}
          {updatedLabel && <p className="pol-updated">{ar ? 'آخر تحديث' : 'Last updated'} · {updatedLabel}</p>}
        </div>
      </header>

      <div className="pol-wrap pol-grid">
        <aside className="pol-side" aria-label={ar ? 'صفحات المعلومات' : 'Information pages'}>
          {pages.length > 0 && (
            <nav className="pol-nav">
              {pages.map((p) => (
                <Link
                  key={p.slug}
                  href={`/policies/${p.slug}`}
                  className={p.slug === page.slug ? 'on' : ''}
                  aria-current={p.slug === page.slug ? 'page' : undefined}
                >
                  {(ar && p.title_ar) || p.title_en}
                </Link>
              ))}
            </nav>
          )}
          {headings.length > 2 && (
            <nav className="pol-toc" aria-label={ar ? 'في هذه الصفحة' : 'On this page'}>
              <p>{ar ? 'في هذه الصفحة' : 'On this page'}</p>
              {headings.map((h, i) => <a key={i} href={`#${slugify(h.text)}`}>{h.text}</a>)}
            </nav>
          )}
        </aside>

        <article className="pol-body">
          {blocks.map((b, i) => {
            if (b.type === 'h') return <h2 key={i} id={slugify(b.text)}>{b.text}</h2>;
            if (b.type === 'p') return <p key={i}>{inline(b.text, `p${i}`)}</p>;
            const Tag = b.type;
            return <Tag key={i}>{b.items.map((it, j) => <li key={j}>{inline(it, `l${i}-${j}`)}</li>)}</Tag>;
          })}

          <div className="pol-help">
            <p>{ar ? 'هل تحتاج إلى مساعدة؟' : 'Need a hand?'}</p>
            <Link href="/contact">{ar ? 'تواصل معنا' : 'Contact us'}</Link>
          </div>
        </article>
      </div>
    </div>
  );
}

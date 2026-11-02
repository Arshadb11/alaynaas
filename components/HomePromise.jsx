'use client';
import { useApp } from './Providers';
import { Icon } from './Chrome';

const ICONS = ['spark', 'truck', 'returns', 'cash'];

/** "Our promise" block on the home page. Texts come from Admin > Storefront > Contact > Trust & footer. */
export default function HomePromise() {
  const { lang, settings = {}, money } = useApp();
  const ar = lang === 'ar';
  const pick = (k) => ((ar && settings[`${k}_ar`]) || settings[`${k}_en`] || '').toString();
  const fill = (s) => s
    .replace('{free_over}', money(Number(settings.shipping_free_over) || 0))
    .replace('{delivery_days}', String(settings.delivery_days || '2 - 5'))
    .replace('{refund_days}', String(settings.refund_days || 7));

  const title = pick('promise_title');
  const items = [1, 2, 3, 4]
    .map((n) => ({ n, title: pick(`promise_${n}_title`), text: fill(pick(`promise_${n}_text`)) }))
    .filter((i) => i.title);
  if (!title || !items.length) return null;

  return (
    <section className="pm" aria-labelledby="pm-title">
      <div className="pm-wrap">
        {pick('promise_kicker') && <p className="pm-kicker">{pick('promise_kicker')}</p>}
        <h2 id="pm-title">{title}</h2>
        <ul className="pm-grid">
          {items.map((i) => (
            <li key={i.n}>
              <span className="pm-ic"><Icon n={ICONS[i.n - 1]} size={26} /></span>
              <strong>{i.title}</strong>
              {i.text && <p>{i.text}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

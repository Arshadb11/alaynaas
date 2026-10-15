'use client';
import Link from 'next/link';
import { useApp } from './Providers';
import { Headline } from './Reveal';
import { Icon } from './Chrome';

/* Everything needed to buy, placed beside the gallery at the top of a product page */
export default function BuyPanel({ product, label, vi, setVi, qty, setQty, price, variant, buyable = true, buyRef }) {
  const { t, L, money, addItem } = useApp();
  return (
    <div className="fhero-copy buy">
      <p className="label">{label}</p>
      <Headline as="h1" className="buy-name" lines={[product.name]} delay={150} />
      {product.line && <p className="buy-line">{L(product.line)}</p>}

      {price != null ? (
        <p className="price-line">
          <strong>{money(price)}</strong>
          <span className="label">{variant ? `${variant.label} · ` : product.size ? `${product.size} · ` : ''}{t.product.vat}</span>
        </p>
      ) : (
        <p className="price-line"><span className="label">{t.rooms.priceSoon}</span></p>
      )}

      {buyable && (
        <div ref={buyRef} className="buy-box">
          {product.variants && (
            <div className="sizes" role="group" aria-label={t.home.sizes}>
              {product.variants.map((v, i) => (
                <button key={v.key} className={i === vi ? 'on' : ''} onClick={() => setVi(i)}>{v.label} <span>{money(v.price)}</span></button>
              ))}
            </div>
          )}
          <div className="buy-row">
            <div className="qty" aria-label={t.product.qty}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="-"><Icon n="minus" size={16} /></button><span>{qty}</span>
              <button onClick={() => setQty(qty + 1)} aria-label="+"><Icon n="plus" size={16} /></button>
            </div>
            <button className="btn btn-fill" onClick={() => addItem(product, qty, variant)}>{t.product.add} · {money(price * qty)}</button>
          </div>
          <p className="label buy-secure"><Icon n="lock" size={13} /> {t.product.secure}</p>
        </div>
      )}

      <div className="buy-acc">
        <details className="mini-acc"><summary>{t.product.delivery}<Icon n="chev" size={16} /></summary><p>{t.product.deliveryText}</p></details>
        <details className="mini-acc"><summary>{t.product.returns}<Icon n="chev" size={16} /></summary><p>{t.product.returnsText}</p></details>
      </div>
    </div>
  );
}

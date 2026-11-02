/**
 * Ecommerce events for Google Analytics 4 / Google Tag Manager / Meta Pixel.
 * Safe to call anywhere on the client: does nothing when no tracking ID is configured.
 */
export function track(event, p = {}) {
  if (typeof window === 'undefined') return;
  try {
    const items = (p.items || []).map((i) => ({
      item_id: String(i.productId || i.id),
      item_name: typeof i.name === 'object' ? i.name?.en : i.name,
      price: Number(i.price) || 0,
      quantity: i.qty || 1,
    }));
    const data = { currency: 'AED', value: Number(p.value) || 0, items, ...(p.transaction_id ? { transaction_id: String(p.transaction_id) } : {}) };
    if (typeof window.gtag === 'function') window.gtag('event', event, data);
    else if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event, ecommerce: data });

    if (typeof window.fbq === 'function') {
      const map = { view_item: 'ViewContent', add_to_cart: 'AddToCart', begin_checkout: 'InitiateCheckout', purchase: 'Purchase' };
      if (map[event]) {
        window.fbq('track', map[event], {
          value: data.value, currency: 'AED', content_type: 'product',
          content_ids: items.map((i) => i.item_id), num_items: items.reduce((a, i) => a + i.quantity, 0),
        });
      }
    }
  } catch { /* tracking must never break the shop */ }
}

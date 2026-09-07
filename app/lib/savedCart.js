export const SAVED_CART_NAMESPACE = 'custom';
export const SAVED_CART_KEY = 'carrinho_alcimo';
export const SAVED_CART_TYPE = 'json';
export const SAVED_CART_MAX_LINES = 50;
export const SAVED_CART_MAX_QUANTITY = 99;

export function normalizeSavedCartItems(items) {
  if (!Array.isArray(items)) return [];
  const byVariant = new Map();
  for (const item of items) {
    const variantId = String(item?.variantId ?? item?.variant_id ?? item?.id ?? '').trim();
    const quantity = Math.max(0, Math.min(SAVED_CART_MAX_QUANTITY, Number.parseInt(item?.quantity, 10) || 0));
    if (!/^\d+$/.test(variantId) || quantity <= 0) continue;
    byVariant.set(variantId, Math.min(SAVED_CART_MAX_QUANTITY, (byVariant.get(variantId) || 0) + quantity));
    if (byVariant.size >= SAVED_CART_MAX_LINES) break;
  }
  return [...byVariant.entries()].map(([variantId, quantity]) => ({variantId, quantity}));
}

export function parseSavedCartItems(value) {
  if (!value) return [];
  let parsed = value;
  if (typeof value === 'string') {
    try { parsed = JSON.parse(value); } catch { return []; }
  }
  return normalizeSavedCartItems(parsed);
}

export function stringifySavedCartItems(items) {
  return JSON.stringify(normalizeSavedCartItems(items));
}

export function mergeSavedCartItems(currentItems, incomingItems) {
  return normalizeSavedCartItems([...normalizeSavedCartItems(currentItems), ...normalizeSavedCartItems(incomingItems)]);
}

export function savedCartItemCount(items) {
  return normalizeSavedCartItems(items).reduce((total, item) => total + item.quantity, 0);
}

export function getCustomerSavedCartItems(customer) {
  // Formato atual: carrinho e favoritos vivem juntos no metafield
  // custom.favoritos_alcimo. Isso evita depender de um segundo metafield
  // e mantém compatibilidade com contas que ainda têm o formato antigo.
  const rawValue = customer?.favorites?.value;

  if (rawValue) {
    try {
      const parsed = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
      if (parsed && !Array.isArray(parsed) && typeof parsed === 'object') {
        return normalizeSavedCartItems(parsed.cart);
      }
    } catch {
      // Continua para o fallback legado abaixo.
    }
  }

  return parseSavedCartItems(customer?.savedCart?.value);
}

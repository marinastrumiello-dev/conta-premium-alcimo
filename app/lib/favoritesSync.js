import {createCustomerFavoritesScope} from '~/lib/favorites';
import {normalizeSavedCartItems} from '~/lib/savedCart';

const ACCOUNT_FAVORITES_STORAGE_KEY = 'alcimo:account-favorites';
const ACTIVE_SCOPE_SESSION_KEY = 'alcimo:account-favorites:active-scope';
const FAVORITES_SCOPE_COOKIE = 'alcimo_customer_scope';
const FAVORITES_EVENT = 'alcimo:favorites-changed';
const FAVORITES_CHANNEL = 'alcimo:favorites';
const SHOPIFY_PRODUCT_GID_PREFIX = 'gid://shopify/Product/';
const STORE_FAVORITES_RETURN_PARAMETER = 'favoritesSync';
const STORE_FAVORITES_SCOPE_PARAMETER = 'favoritesScope';
const STORE_CART_RESTORE_PARAMETER = 'cartRestore';
const ACCOUNT_CART_COOKIE = 'alcimo_account_cart';

export function normalizeFavoriteIds(favoriteIds) {
  if (!Array.isArray(favoriteIds)) return [];

  return [
    ...new Set(
      favoriteIds
        .map((productId) => String(productId))
        .filter((productId) =>
          productId.startsWith(SHOPIFY_PRODUCT_GID_PREFIX),
        ),
    ),
  ];
}

export function activateCustomerFavoritesScope(customerId) {
  if (typeof window === 'undefined') {
    return createCustomerFavoritesScope(customerId);
  }

  const scope = createCustomerFavoritesScope(customerId);
  if (!scope) return '';

  try {
    window.sessionStorage.setItem(ACTIVE_SCOPE_SESSION_KEY, scope);
  } catch {
    // Continua funcionando mesmo sem sessionStorage.
  }

  try {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${FAVORITES_SCOPE_COOKIE}=${encodeURIComponent(scope)}; Path=/; Domain=.alcimo.com; Max-Age=2592000; SameSite=Lax${secure}`;
  } catch {
    // O parâmetro favoritesScope ainda permite sincronizar com a loja.
  }

  return scope;
}

export function getActiveCustomerFavoritesScope() {
  if (typeof window === 'undefined') return '';

  try {
    const cookiePrefix = `${FAVORITES_SCOPE_COOKIE}=`;
    const cookie = document.cookie
      .split('; ')
      .find((item) => item.startsWith(cookiePrefix));

    if (cookie) {
      return decodeURIComponent(cookie.slice(cookiePrefix.length));
    }
  } catch {
    // Tenta o fallback abaixo.
  }

  try {
    return window.sessionStorage.getItem(ACTIVE_SCOPE_SESSION_KEY) || '';
  } catch {
    return '';
  }
}

function getScopedStorageKey(scope = '') {
  const normalizedScope = String(scope || getActiveCustomerFavoritesScope()).trim();
  return normalizedScope
    ? `${ACCOUNT_FAVORITES_STORAGE_KEY}:${normalizedScope}`
    : ACCOUNT_FAVORITES_STORAGE_KEY;
}

export function readAccountFavoriteIds(fallbackIds = [], scope = '') {
  const normalizedFallback = normalizeFavoriteIds(fallbackIds);

  if (typeof window === 'undefined') return normalizedFallback;

  try {
    const storedValue = window.sessionStorage.getItem(
      getScopedStorageKey(scope),
    );

    if (storedValue === null) return normalizedFallback;

    return normalizeFavoriteIds(JSON.parse(storedValue));
  } catch {
    return normalizedFallback;
  }
}

export function writeAccountFavoriteIds(favoriteIds, scope = '') {
  const normalizedIds = normalizeFavoriteIds(favoriteIds);

  if (typeof window === 'undefined') return normalizedIds;

  try {
    window.sessionStorage.setItem(
      getScopedStorageKey(scope),
      JSON.stringify(normalizedIds),
    );
  } catch {
    // A interface continua funcionando mesmo sem armazenamento disponível.
  }

  return normalizedIds;
}

export function clearAccountFavoriteIds(scope = '') {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.removeItem(getScopedStorageKey(scope));
  } catch {
    // Ignora indisponibilidade do armazenamento.
  }
}

export function dispatchFavoritesChanged({
  type,
  productId = '',
  isFavorite = false,
  favoriteIds = [],
  message = '',
  scope = '',
}) {
  if (typeof window === 'undefined') return;

  const activeScope = scope || getActiveCustomerFavoritesScope();
  const normalizedIds = writeAccountFavoriteIds(favoriteIds, activeScope);
  const detail = {
    type,
    productId,
    isFavorite,
    favoriteIds: normalizedIds,
    favoritesCount: normalizedIds.length,
    message,
    scope: activeScope,
  };

  window.dispatchEvent(new CustomEvent(FAVORITES_EVENT, {detail}));

  try {
    const channel = new BroadcastChannel(FAVORITES_CHANNEL);
    channel.postMessage(detail);
    channel.close();
  } catch {
    // BroadcastChannel não é obrigatório para o funcionamento principal.
  }
}

export function subscribeToFavoritesChanged(callback) {
  if (typeof window === 'undefined') return () => {};

  const handleWindowEvent = (event) => callback(event.detail || {});
  window.addEventListener(FAVORITES_EVENT, handleWindowEvent);

  let channel = null;

  try {
    channel = new BroadcastChannel(FAVORITES_CHANNEL);
    channel.addEventListener('message', (event) => callback(event.data || {}));
  } catch {
    channel = null;
  }

  return () => {
    window.removeEventListener(FAVORITES_EVENT, handleWindowEvent);
    channel?.close();
  };
}

export function activateCustomerCartSnapshot(cartItems) {
  if (typeof document === 'undefined') return normalizeSavedCartItems(cartItems);

  const normalizedItems = normalizeSavedCartItems(cartItems);

  try {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    const value = encodeURIComponent(JSON.stringify(normalizedItems));
    document.cookie = `${ACCOUNT_CART_COOKIE}=${value}; Path=/; Domain=.alcimo.com; Max-Age=2592000; SameSite=Lax${secure}`;
  } catch {
    // Continua funcionando mesmo sem cookie compartilhado.
  }

  return normalizedItems;
}

export function readCustomerCartSnapshot() {
  if (typeof document === 'undefined') return [];

  try {
    const prefix = `${ACCOUNT_CART_COOKIE}=`;
    const cookie = document.cookie.split('; ').find((item) => item.startsWith(prefix));
    if (!cookie) return [];
    return normalizeSavedCartItems(JSON.parse(decodeURIComponent(cookie.slice(prefix.length))));
  } catch {
    return [];
  }
}

/**
 * Monta uma URL da loja levando a fotografia mais recente dos favoritos
 * da Área do Cliente. A fotografia agora também leva um escopo da conta,
 * impedindo que dois clientes no mesmo navegador compartilhem favoritos.
 */
export function buildStoreSyncUrl(destination, favoriteIds, scope = '') {
  if (!destination) return '#';
  if (typeof window === 'undefined') return destination;

  const activeScope = scope || getActiveCustomerFavoritesScope();
  const normalizedIds = normalizeFavoriteIds(
    Array.isArray(favoriteIds)
      ? favoriteIds
      : readAccountFavoriteIds([], activeScope),
  );

  try {
    const destinationUrl = new URL(destination, window.location.origin);
    destinationUrl.searchParams.set(
      STORE_FAVORITES_RETURN_PARAMETER,
      JSON.stringify(normalizedIds),
    );

    if (activeScope) {
      destinationUrl.searchParams.set(
        STORE_FAVORITES_SCOPE_PARAMETER,
        activeScope,
      );
    }

    destinationUrl.searchParams.set(
      STORE_CART_RESTORE_PARAMETER,
      JSON.stringify(readCustomerCartSnapshot()),
    );

    return destinationUrl.toString();
  } catch {
    return destination;
  }
}

export function handleStoreNavigation(event, destination, favoriteIds, scope = '') {
  if (!destination || typeof window === 'undefined') return;

  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  event.preventDefault();
  window.location.assign(
    buildStoreSyncUrl(destination, favoriteIds, scope),
  );
}

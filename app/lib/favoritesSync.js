const ACCOUNT_FAVORITES_STORAGE_KEY = 'alcimo:account-favorites';
const FAVORITES_EVENT = 'alcimo:favorites-changed';
const FAVORITES_CHANNEL = 'alcimo:favorites';
const SHOPIFY_PRODUCT_GID_PREFIX = 'gid://shopify/Product/';

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

export function readAccountFavoriteIds(fallbackIds = []) {
  const normalizedFallback = normalizeFavoriteIds(fallbackIds);

  if (typeof window === 'undefined') return normalizedFallback;

  try {
    const storedValue = window.sessionStorage.getItem(
      ACCOUNT_FAVORITES_STORAGE_KEY,
    );

    if (storedValue === null) return normalizedFallback;

    return normalizeFavoriteIds(JSON.parse(storedValue));
  } catch {
    return normalizedFallback;
  }
}

export function writeAccountFavoriteIds(favoriteIds) {
  const normalizedIds = normalizeFavoriteIds(favoriteIds);

  if (typeof window === 'undefined') return normalizedIds;

  try {
    window.sessionStorage.setItem(
      ACCOUNT_FAVORITES_STORAGE_KEY,
      JSON.stringify(normalizedIds),
    );
  } catch {
    // A interface continua funcionando mesmo sem armazenamento disponível.
  }

  return normalizedIds;
}

export function clearAccountFavoriteIds() {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.removeItem(ACCOUNT_FAVORITES_STORAGE_KEY);
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
}) {
  if (typeof window === 'undefined') return;

  const normalizedIds = writeAccountFavoriteIds(favoriteIds);
  const detail = {
    type,
    productId,
    isFavorite,
    favoriteIds: normalizedIds,
    favoritesCount: normalizedIds.length,
    message,
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

const STORE_FAVORITES_RETURN_PARAMETER = 'favoritesSync';

/**
 * Monta uma URL da loja levando a fotografia mais recente dos favoritos
 * da Área do Cliente. A loja consome o parâmetro `favoritesSync`, atualiza
 * o localStorage e remove o parâmetro da barra de endereço em seguida.
 *
 * Isso é necessário porque `conta.alcimo.com` e `alcimo.com` são origens
 * diferentes e, portanto, não compartilham sessionStorage/localStorage.
 */
export function buildStoreSyncUrl(destination, favoriteIds) {
  if (!destination) return '#';
  if (typeof window === 'undefined') return destination;

  const normalizedIds = normalizeFavoriteIds(
    Array.isArray(favoriteIds)
      ? favoriteIds
      : readAccountFavoriteIds(),
  );

  try {
    const destinationUrl = new URL(destination, window.location.origin);
    destinationUrl.searchParams.set(
      STORE_FAVORITES_RETURN_PARAMETER,
      JSON.stringify(normalizedIds),
    );

    return destinationUrl.toString();
  } catch {
    return destination;
  }
}

export function handleStoreNavigation(event, destination, favoriteIds) {
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
    buildStoreSyncUrl(destination, favoriteIds),
  );
}

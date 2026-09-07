/**
 * ============================================================
 * FAVORITOS ALCIMO
 * ============================================================
 *
 * Funções compartilhadas pelo sistema de Favoritos.
 *
 * O metafield armazena um array JSON contendo os IDs globais
 * dos produtos da Shopify.
 *
 * Exemplo:
 *
 * [
 *   "gid://shopify/Product/123456789",
 *   "gid://shopify/Product/987654321"
 * ]
 */

export const FAVORITES_NAMESPACE = 'custom';
export const FAVORITES_KEY = 'favoritos_alcimo';
export const FAVORITES_TYPE = 'json';

/**
 * Quantidade máxima de produtos mantidos na lista.
 *
 * O limite evita que o metafield cresça indefinidamente e
 * mantém a consulta dos produtos rápida.
 */
export const FAVORITES_MAX_ITEMS = 100;

/**
 * Cria um escopo curto e estável para separar os favoritos de contas
 * diferentes no mesmo navegador. Não é um token de autenticação.
 *
 * @param {unknown} customerId
 * @returns {string}
 */
export function createCustomerFavoritesScope(customerId) {
  const value = String(customerId || '');
  if (!value) return '';

  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `c${(hash >>> 0).toString(36)}`;
}


/**
 * Converte o valor do metafield em uma lista segura de IDs.
 *
 * Aceita:
 * - uma string JSON;
 * - um array;
 * - null;
 * - undefined;
 *
 * @param {unknown} value
 * @returns {string[]}
 */
export function parseAccountState(value) {
  if (!value) {
    return {favorites: [], cart: []};
  }

  let parsedValue = value;

  if (typeof value === 'string') {
    try {
      parsedValue = JSON.parse(value);
    } catch (error) {
      console.error('Invalid ALCIMO account state JSON:', error);
      return {favorites: [], cart: []};
    }
  }

  // Compatibilidade com o formato antigo: o metafield era apenas um array
  // contendo os IDs dos produtos favoritos.
  if (Array.isArray(parsedValue)) {
    return {
      favorites: normalizeFavoriteIds(parsedValue),
      cart: [],
    };
  }

  if (!parsedValue || typeof parsedValue !== 'object') {
    return {favorites: [], cart: []};
  }

  return {
    favorites: normalizeFavoriteIds(
      parsedValue.favorites ?? parsedValue.favoriteIds ?? [],
    ),
    cart: Array.isArray(parsedValue.cart) ? parsedValue.cart : [],
  };
}

export function stringifyAccountState(favoriteIds, cartItems = []) {
  return JSON.stringify({
    favorites: normalizeFavoriteIds(favoriteIds),
    cart: Array.isArray(cartItems) ? cartItems : [],
  });
}

export function parseFavoriteIds(value) {
  return parseAccountState(value).favorites;
}

/**
 * Remove valores inválidos e IDs duplicados.
 *
 * @param {unknown[]} values
 * @returns {string[]}
 */
export function normalizeFavoriteIds(values) {
  if (!Array.isArray(values)) return [];

  const validIds = values.filter((value) => {
    return (
      typeof value === 'string' &&
      value.trim().startsWith('gid://shopify/Product/')
    );
  });

  return [...new Set(validIds)].slice(0, FAVORITES_MAX_ITEMS);
}

/**
 * Verifica se determinado produto está salvo.
 *
 * @param {string[]} favoriteIds
 * @param {string} productId
 * @returns {boolean}
 */
export function isFavoriteProduct(favoriteIds, productId) {
  if (!productId || !Array.isArray(favoriteIds)) {
    return false;
  }

  return favoriteIds.includes(productId);
}

/**
 * Adiciona um produto ao início da lista.
 *
 * O item mais recentemente favoritado ficará primeiro.
 *
 * @param {string[]} favoriteIds
 * @param {string} productId
 * @returns {string[]}
 */
export function addFavoriteProduct(favoriteIds, productId) {
  if (!isShopifyProductId(productId)) {
    return normalizeFavoriteIds(favoriteIds);
  }

  const currentIds = normalizeFavoriteIds(favoriteIds);

  return normalizeFavoriteIds([
    productId,
    ...currentIds.filter((id) => id !== productId),
  ]);
}

/**
 * Remove um produto da lista.
 *
 * @param {string[]} favoriteIds
 * @param {string} productId
 * @returns {string[]}
 */
export function removeFavoriteProduct(favoriteIds, productId) {
  const currentIds = normalizeFavoriteIds(favoriteIds);

  if (!productId) {
    return currentIds;
  }

  return currentIds.filter((id) => id !== productId);
}

/**
 * Alterna o estado de um produto.
 *
 * @param {string[]} favoriteIds
 * @param {string} productId
 * @returns {{
 *   favoriteIds: string[];
 *   isFavorite: boolean;
 * }}
 */
export function toggleFavoriteProduct(favoriteIds, productId) {
  const currentIds = normalizeFavoriteIds(favoriteIds);
  const productIsFavorite = isFavoriteProduct(currentIds, productId);

  if (productIsFavorite) {
    return {
      favoriteIds: removeFavoriteProduct(currentIds, productId),
      isFavorite: false,
    };
  }

  return {
    favoriteIds: addFavoriteProduct(currentIds, productId),
    isFavorite: true,
  };
}

/**
 * Prepara a lista para ser gravada no metafield JSON.
 *
 * @param {string[]} favoriteIds
 * @returns {string}
 */
export function stringifyFavoriteIds(favoriteIds) {
  return JSON.stringify(normalizeFavoriteIds(favoriteIds));
}

/**
 * Valida um ID global de produto da Shopify.
 *
 * @param {unknown} productId
 * @returns {productId is string}
 */
export function isShopifyProductId(productId) {
  return (
    typeof productId === 'string' &&
    productId.startsWith('gid://shopify/Product/')
  );
}

/**
 * Retorna os IDs salvos diretamente do objeto customer.
 *
 * @param {{
 *   favorites?: {
 *     value?: string | null;
 *   } | null;
 * } | null | undefined} customer
 * @returns {string[]}
 */
export function getCustomerFavoriteIds(customer) {
  return parseFavoriteIds(customer?.favorites?.value);
}
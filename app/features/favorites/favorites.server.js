import {
  data as remixData,
  redirect,
} from 'react-router';

import {CUSTOMER_FAVORITES_MUTATION} from '~/graphql/customer-account/CustomerFavoritesMutation';
import {CUSTOMER_FAVORITES_QUERY} from '~/graphql/customer-account/CustomerFavoritesQuery';

import {
  FAVORITES_KEY,
  FAVORITES_NAMESPACE,
  FAVORITES_TYPE,
  addFavoriteProduct,
  isShopifyProductId,
  parseFavoriteIds,
  stringifyFavoriteIds,
  toggleFavoriteProduct,
} from '~/lib/favorites';

export async function favoritesLoader({
  request,
  context,
}) {
  const {customerAccount, storefront} =
    context;

  const requestUrl = new URL(request.url);

  const productIdToAdd =
    requestUrl.searchParams.get('add');

  const storeSync = getStoreSync(requestUrl);

  /*
   * Recebe a fotografia local enviada pelo header da loja.
   *
   * ?merge=[...] adiciona favoritos locais aos existentes na conta.
   * É usado antes de a loja reconhecer uma sessão autenticada.
   *
   * ?sync=[...] substitui a fotografia da conta pela fotografia da loja.
   * É usado depois que a loja reconhece a sessão, permitindo também remoções.
   */
  if (storeSync !== null) {
    const customer = await getCustomerWithFavorites(customerAccount);

    const currentFavoriteIds = parseFavoriteIds(customer.favorites?.value);

    const nextFavoriteIds =
      storeSync.mode === 'sync'
        ? storeSync.favoriteIds
        : mergeFavoriteIds(currentFavoriteIds, storeSync.favoriteIds);

    const favoritesChanged = !areFavoriteListsEqual(
      currentFavoriteIds,
      nextFavoriteIds,
    );

    if (favoritesChanged) {
      await saveCustomerFavorites({
        customerAccount,
        customerId: customer.id,
        favoriteIds: nextFavoriteIds,
      });
    }

    return redirect(
      favoritesChanged
        ? '/account/favorites?saved=true'
        : '/account/favorites',
    );
  }

  /*
   * Mantém compatibilidade com o fluxo
   * anterior que adicionava um produto
   * individualmente usando ?add=.
   */
  if (
    productIdToAdd &&
    isShopifyProductId(productIdToAdd)
  ) {
    const customer =
      await getCustomerWithFavorites(
        customerAccount,
      );

    const currentFavoriteIds =
      parseFavoriteIds(
        customer.favorites?.value,
      );

    const nextFavoriteIds =
      addFavoriteProduct(
        currentFavoriteIds,
        productIdToAdd,
      );

    if (
      nextFavoriteIds.length !==
      currentFavoriteIds.length
    ) {
      await saveCustomerFavorites({
        customerAccount,
        customerId: customer.id,
        favoriteIds: nextFavoriteIds,
      });
    }

    return redirect(
      '/account/favorites?saved=true',
    );
  }

  const customer =
    await getCustomerWithFavorites(
      customerAccount,
    );

  const favoriteIds = parseFavoriteIds(
    customer.favorites?.value,
  );

  if (!favoriteIds.length) {
    return createLoaderResponse({
      products: [],
      favoriteIds: [],
      productSaved:
        requestUrl.searchParams.get(
          'saved',
        ) === 'true',
    });
  }

  const productData =
    await storefront.query(
      FAVORITE_PRODUCTS_QUERY,
      {
        variables: {
          ids: favoriteIds,
        },
        cache: storefront.CacheNone(),
      },
    );

  const productsById = new Map(
    (productData?.nodes || [])
      .filter(Boolean)
      .map((product) => [
        product.id,
        product,
      ]),
  );

  /*
   * Mantém a mesma ordem em que os IDs
   * estão salvos no metafield.
   */
  const products = favoriteIds
    .map((favoriteId) =>
      productsById.get(favoriteId),
    )
    .filter(Boolean);

  return createLoaderResponse({
    products,
    favoriteIds,
    productSaved:
      requestUrl.searchParams.get(
        'saved',
      ) === 'true',
  });
}

export async function favoritesAction({
  request,
  context,
}) {
  const {customerAccount} = context;
  const formData = await request.formData();

  const intent = String(
    formData.get('intent') || '',
  );

  const productId = String(
    formData.get('productId') || '',
  );

  if (intent !== 'toggle-favorite') {
    return remixData(
      {
        ok: false,
        error:
          'Ação de favoritos inválida.',
      },
      {
        status: 400,
      },
    );
  }

  if (!isShopifyProductId(productId)) {
    return remixData(
      {
        ok: false,
        error: 'Produto inválido.',
      },
      {
        status: 400,
      },
    );
  }

  try {
    const customer =
      await getCustomerWithFavorites(
        customerAccount,
      );

    const currentFavoriteIds =
      parseFavoriteIds(
        customer.favorites?.value,
      );

    const result = toggleFavoriteProduct(
      currentFavoriteIds,
      productId,
    );

    await saveCustomerFavorites({
      customerAccount,
      customerId: customer.id,
      favoriteIds:
        result.favoriteIds,
    });

    return remixData({
      ok: true,
      productId,
      isFavorite: result.isFavorite,
      favoriteIds:
        result.favoriteIds,
    });
  } catch (error) {
    console.error(
      'Favorites action error:',
      error,
    );

    return remixData(
      {
        ok: false,
        productId,
        error:
          error instanceof Error
            ? error.message
            : 'Não foi possível atualizar os favoritos.',
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * Lê e valida a lista enviada pelo Header
 * da loja no parâmetro ?sync=.
 *
 * Retornos:
 * - null: parâmetro sync não existe;
 * - []: parâmetro existe, mas não contém IDs válidos;
 * - [...]: produtos válidos para sincronização.
 */
function getStoreSync(requestUrl) {
  const mode = requestUrl.searchParams.has('sync')
    ? 'sync'
    : requestUrl.searchParams.has('merge')
      ? 'merge'
      : null;

  if (!mode) return null;

  const rawValue = requestUrl.searchParams.get(mode);

  if (!rawValue) {
    return {mode, favoriteIds: []};
  }

  try {
    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return {mode, favoriteIds: []};
    }

    return {
      mode,
      favoriteIds: [
        ...new Set(
          parsedValue
            .map((productId) => String(productId))
            .filter(isShopifyProductId),
        ),
      ],
    };
  } catch (error) {
    console.error('Favorites sync parse error:', error);
    return {mode, favoriteIds: []};
  }
}

/**
 * Mescla os favoritos já gravados na conta
 * com os favoritos recebidos da loja.
 *
 * Os IDs existentes são mantidos e os novos
 * são adicionados sem duplicação.
 */
function mergeFavoriteIds(
  currentFavoriteIds,
  syncedFavoriteIds,
) {
  return [
    ...new Set([
      ...currentFavoriteIds,
      ...syncedFavoriteIds,
    ]),
  ].filter(isShopifyProductId);
}

/**
 * Verifica se houve alguma alteração real
 * antes de executar a mutation.
 */
function areFavoriteListsEqual(
  firstList,
  secondList,
) {
  if (
    firstList.length !== secondList.length
  ) {
    return false;
  }

  return firstList.every(
    (productId, index) =>
      productId === secondList[index],
  );
}

function createLoaderResponse(payload) {
  return remixData(payload, {
    headers: {
      'Cache-Control':
        'no-cache, no-store, must-revalidate',
    },
  });
}

async function getCustomerWithFavorites(
  customerAccount,
) {
  const result =
    await customerAccount.query(
      CUSTOMER_FAVORITES_QUERY,
      {
        variables: {
          language:
            customerAccount.i18n.language,
        },
      },
    );

  const customer = result?.data?.customer;
  const errors = result?.errors;

  if (errors?.length || !customer) {
    console.error(
      'Favorites customer query errors:',
      errors,
    );

    throw new Error(
      'Não foi possível acessar os favoritos do cliente.',
    );
  }

  return customer;
}

async function saveCustomerFavorites({
  customerAccount,
  customerId,
  favoriteIds,
}) {
  const result =
    await customerAccount.mutate(
      CUSTOMER_FAVORITES_MUTATION,
      {
        variables: {
          metafields: [
            {
              ownerId: customerId,
              namespace:
                FAVORITES_NAMESPACE,
              key: FAVORITES_KEY,
              type: FAVORITES_TYPE,
              value:
                stringifyFavoriteIds(
                  favoriteIds,
                ),
            },
          ],
        },
      },
    );

  const graphqlErrors =
    result?.errors || [];

  const userErrors =
    result?.data?.metafieldsSet
      ?.userErrors || [];

  if (
    graphqlErrors.length ||
    userErrors.length
  ) {
    console.error(
      'Favorites mutation errors:',
      {
        graphqlErrors,
        userErrors,
      },
    );

    throw new Error(
      userErrors[0]?.message ||
        'Não foi possível salvar o produto nos favoritos.',
    );
  }

  return (
    result.data.metafieldsSet
      .metafields?.[0] || null
  );
}

const FAVORITE_PRODUCTS_QUERY = `#graphql
  query FavoriteProducts($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        title
        handle
        availableForSale

        featuredImage {
          id
          url
          altText
          width
          height
        }

        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;
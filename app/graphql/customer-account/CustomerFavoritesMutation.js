/**
 * Atualiza o metafield JSON que armazena os produtos favoritos
 * do cliente autenticado.
 *
 * Metafield configurado no Shopify Admin:
 *
 * Namespace: custom
 * Key: favoritos_alcimo
 * Type: json
 * Customer Account access: read_write
 */

export const CUSTOMER_FAVORITES_MUTATION = `#graphql
  mutation CustomerFavoritesUpdate(
    $metafields: [MetafieldsSetInput!]!
  ) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        namespace
        key
        type
        value
        compareDigest
      }

      userErrors {
        field
        message
        code
      }
    }
  }
`;
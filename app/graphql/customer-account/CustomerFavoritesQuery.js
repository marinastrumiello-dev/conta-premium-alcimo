/**
 * Consulta o cliente autenticado e o metafield usado pela lista de Favoritos.
 *
 * Este documento precisa permanecer dentro de app/graphql/customer-account
 * para ser validado pelo schema correto da Customer Account API.
 */
export const CUSTOMER_FAVORITES_QUERY = `#graphql
  query CustomerFavorites($language: LanguageCode)
  @inContext(language: $language) {
    customer {
      id

      favorites: metafield(
        namespace: "custom"
        key: "favoritos_alcimo"
      ) {
        id
        namespace
        key
        type
        value
        compareDigest
      }
    }
  }
`;

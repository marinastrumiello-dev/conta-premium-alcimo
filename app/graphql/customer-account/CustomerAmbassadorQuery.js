export const CUSTOMER_AMBASSADOR_QUERY = `#graphql
  query CustomerAmbassador($language: LanguageCode)
  @inContext(language: $language) {
    customer {
      id
      displayName
      firstName
      lastName

      ambassador: metafield(
        namespace: "custom"
        key: "embaixador_alcimo"
      ) {
        id
        namespace
        key
        type
        value
        compareDigest
      }

      orders(first: 100, reverse: true) {
        nodes {
          id
          name
          processedAt
          financialStatus
          fulfillmentStatus
          totalPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

export const CUSTOMER_AMBASSADOR_MUTATION = `#graphql
  mutation CustomerAmbassadorUpdate(
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

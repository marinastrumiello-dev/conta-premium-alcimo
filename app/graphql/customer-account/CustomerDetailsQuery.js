// Customer data used across the premium ALCIMO account portal.
export const CUSTOMER_FRAGMENT = `#graphql
  fragment Customer on Customer {
    id
    displayName
    firstName
    lastName
    imageUrl

    emailAddress {
      emailAddress
    }

    phoneNumber {
      phoneNumber
    }

    defaultAddress {
      ...Address
    }

    addresses(first: 6) {
      nodes {
        ...Address
      }
    }

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

    orders(first: 1, reverse: true) {
      nodes {
        id
        name
        confirmationNumber
        createdAt
        financialStatus
        fulfillmentStatus

        totalPrice {
          amount
          currencyCode
        }

        lineItems(first: 3) {
          nodes {
            id
            name
            quantity
            variantTitle

            image {
              url
              altText
              width
              height
            }
          }
        }
      }
    }
  }

  fragment Address on CustomerAddress {
    id
    formatted
    firstName
    lastName
    company
    address1
    address2
    territoryCode
    zoneCode
    city
    zip
    phoneNumber
  }
`;

// Customer Account API query used by app/routes/account.jsx.
export const CUSTOMER_DETAILS_QUERY = `#graphql
  query CustomerDetails($language: LanguageCode)
  @inContext(language: $language) {
    customer {
      ...Customer
    }
  }

  ${CUSTOMER_FRAGMENT}
`;
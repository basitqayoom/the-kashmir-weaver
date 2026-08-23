// Storefront API GraphQL documents — hand-written, no codegen.

export const MONEY_FRAGMENT = /* GraphQL */ `
  fragment MoneyFragment on MoneyV2 {
    amount
    currencyCode
  }
`;

export const IMAGE_FRAGMENT = /* GraphQL */ `
  fragment ImageFragment on Image {
    url
    altText
    width
    height
  }
`;

export const PRODUCT_CARD_FRAGMENT = /* GraphQL */ `
  fragment ProductCardFragment on Product {
    id
    handle
    title
    vendor
    productType
    createdAt
    updatedAt
    featuredImage {
      ...ImageFragment
    }
    images(first: 6) {
      nodes {
        ...ImageFragment
      }
    }
    options {
      name
      values
    }
    collections(first: 5) {
      nodes {
        handle
        title
      }
    }
    priceRange {
      minVariantPrice {
        ...MoneyFragment
      }
      maxVariantPrice {
        ...MoneyFragment
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...MoneyFragment
      }
    }
    availableForSale
  }
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
`;

/**
 * All-products listing — mirrors Hydrogen's ALL_PRODUCTS_QUERY exactly: the
 * plain `products` field (native ProductSortKeys: CREATED_AT/PRICE/
 * BEST_SELLING/etc), no client text search, no native `filters` argument
 * (top-level `products` never accepted one on any tested API version).
 * Collection/price/colour filtering happens client-side — see catalog-pagination.ts.
 */
export const PRODUCTS_QUERY = /* GraphQL */ `
  query Products(
    $first: Int!
    $after: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) {
    products(
      first: $first
      after: $after
      sortKey: $sortKey
      reverse: $reverse
    ) {
      nodes {
        ...ProductCardFragment
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export const COLLECTIONS_QUERY = /* GraphQL */ `
  query Collections {
    collections(first: 20) {
      nodes {
        handle
        title
        description
        image {
          ...ImageFragment
        }
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;

export const COLLECTION_BY_HANDLE_QUERY = /* GraphQL */ `
  query CollectionByHandle($handle: String!) {
    collection(handle: $handle) {
      handle
      title
      description
      image {
        ...ImageFragment
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;

/**
 * Finds the one solid product with the colour studio enabled. The flag lives on
 * a metafield rather than a fixed handle, so it is read from the listing query
 * instead of hard-coding a product.
 */
export const COLOUR_STUDIO_PRODUCTS_QUERY = /* GraphQL */ `
  query ColourStudioProducts($handle: String!, $first: Int!, $after: String) {
    collection(handle: $handle) {
      products(first: $first, after: $after) {
        nodes {
          ...ProductCardFragment
          showColourStudio: metafield(
            namespace: "custom"
            key: "show_colour_studio"
          ) {
            value
          }
          shadePalette: metafield(namespace: "custom", key: "shade_palette") {
            value
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      vendor
      productType
      description
      descriptionHtml
      tags
      createdAt
      publishedAt
      seo {
        title
        description
      }
      featuredImage {
        ...ImageFragment
      }
      priceRange {
        minVariantPrice {
          ...MoneyFragment
        }
        maxVariantPrice {
          ...MoneyFragment
        }
      }
      options {
        name
        values
      }
      images(first: 12) {
        nodes {
          ...ImageFragment
        }
      }
      variants(first: 25) {
        nodes {
          id
          title
          availableForSale
          quantityAvailable
          sku
          weight
          weightUnit
          price {
            ...MoneyFragment
          }
          compareAtPrice {
            ...MoneyFragment
          }
          selectedOptions {
            name
            value
          }
          image {
            ...ImageFragment
          }
        }
      }
      collections(first: 5) {
        nodes {
          handle
          title
        }
      }
      shortDescription: metafield(
        namespace: "custom"
        key: "short_description"
      ) {
        key
        value
      }
      story: metafield(namespace: "custom", key: "story") {
        key
        value
      }
      material: metafield(namespace: "custom", key: "material") {
        key
        value
      }
      origin: metafield(namespace: "custom", key: "origin") {
        key
        value
      }
      weave: metafield(namespace: "custom", key: "weave") {
        key
        value
      }
      care: metafield(namespace: "custom", key: "care") {
        key
        value
      }
      limited: metafield(namespace: "custom", key: "limited") {
        key
        value
      }
      requestPrice: metafield(namespace: "custom", key: "request_price") {
        key
        value
      }
      requestMoreImages: metafield(
        namespace: "custom"
        key: "request_more_images"
      ) {
        key
        value
      }
      stockQty: metafield(namespace: "custom", key: "stock_qty") {
        key
        value
      }
      guaranteesDelivery: metafield(
        namespace: "custom"
        key: "guarantees_delivery"
      ) {
        key
        value
      }
      returnsCare: metafield(namespace: "custom", key: "returns_care") {
        key
        value
      }
      shadePalette: metafield(namespace: "custom", key: "shade_palette") {
        key
        value
      }
      showColourStudio: metafield(
        namespace: "custom"
        key: "show_colour_studio"
      ) {
        key
        value
      }
      reviewRating: metafield(namespace: "reviews", key: "rating") {
        key
        value
      }
      reviewCount: metafield(namespace: "reviews", key: "rating_count") {
        key
        value
      }
    }
  }
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
`;

export const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    discountCodes {
      code
      applicable
    }
    discountAllocations {
      discountedAmount {
        ...MoneyFragment
      }
    }
    appliedGiftCards {
      id
      lastCharacters
      amountUsed {
        ...MoneyFragment
      }
    }
    cost {
      subtotalAmount {
        ...MoneyFragment
      }
      totalAmount {
        ...MoneyFragment
      }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        attributes {
          key
          value
        }
        cost {
          totalAmount {
            ...MoneyFragment
          }
          amountPerQuantity {
            ...MoneyFragment
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            availableForSale
            quantityAvailable
            selectedOptions {
              name
              value
            }
            image {
              ...ImageFragment
            }
            product {
              handle
              title
            }
          }
        }
      }
    }
  }
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
`;

export const CART_QUERY = /* GraphQL */ `
  query CartQuery($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFragment
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_CREATE_MUTATION = /* GraphQL */ `
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_LINES_ADD_MUTATION = /* GraphQL */ `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_LINES_UPDATE_MUTATION = /* GraphQL */ `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_LINES_REMOVE_MUTATION = /* GraphQL */ `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_DISCOUNT_CODES_UPDATE_MUTATION = /* GraphQL */ `
  mutation CartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]!) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_GIFT_CARD_CODES_ADD_MUTATION = /* GraphQL */ `
  mutation CartGiftCardCodesAdd($cartId: ID!, $giftCardCodes: [String!]!) {
    cartGiftCardCodesAdd(cartId: $cartId, giftCardCodes: $giftCardCodes) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const SEARCH_PRODUCTS_QUERY = /* GraphQL */ `
  query SearchProducts($term: String!, $first: Int!, $after: String) {
    products: search(
      after: $after
      first: $first
      query: $term
      sortKey: RELEVANCE
      types: [PRODUCT]
      unavailableProducts: HIDE
    ) {
      nodes {
        ... on Product {
          ...ProductCardFragment
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

/** Native Shopify shop policies — the same source Hydrogen's policies routes use. */
export const SHOP_POLICY_QUERY = /* GraphQL */ `
  query ShopPolicy(
    $privacyPolicy: Boolean!
    $termsOfService: Boolean!
    $shippingPolicy: Boolean!
    $refundPolicy: Boolean!
  ) {
    shop {
      privacyPolicy @include(if: $privacyPolicy) {
        title
        body
        handle
        url
      }
      termsOfService @include(if: $termsOfService) {
        title
        body
        handle
        url
      }
      shippingPolicy @include(if: $shippingPolicy) {
        title
        body
        handle
        url
      }
      refundPolicy @include(if: $refundPolicy) {
        title
        body
        handle
        url
      }
    }
  }
`;

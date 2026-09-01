/** Product JSON-LD helpers — mirrors Hydrogen catalog.controller shipping/returns policy. */

const FREE_SHIPPING_THRESHOLD = 200;
const INTERNATIONAL_SHIPPING_RATE = 25;
const PRICE_VALIDITY_DAYS = 30;

/** Google drops offers without a future expiry; matches the merchant feed window. */
export function offerPriceValidUntil(): string {
  const expiry = new Date(Date.now() + PRICE_VALIDITY_DAYS * 86_400_000);
  return expiry.toISOString().split("T")[0];
}

function monetaryAmount(value: number, currency: string) {
  return {
    "@type": "MonetaryAmount" as const,
    value: String(value),
    currency,
  };
}

function deliveryTime(transitMin: number, transitMax: number) {
  return {
    "@type": "ShippingDeliveryTime" as const,
    handlingTime: {
      "@type": "QuantitativeValue" as const,
      minValue: 2,
      maxValue: 4,
      unitCode: "DAY",
    },
    transitTime: {
      "@type": "QuantitativeValue" as const,
      minValue: transitMin,
      maxValue: transitMax,
      unitCode: "DAY",
    },
  };
}

export function offerShippingDetails(
  priceAmount: number,
  currencyCode: string,
): Array<Record<string, unknown>> {
  const internationalRate =
    priceAmount >= FREE_SHIPPING_THRESHOLD ? 0 : INTERNATIONAL_SHIPPING_RATE;

  return [
    {
      "@type": "OfferShippingDetails",
      shippingRate: monetaryAmount(0, currencyCode),
      shippingDestination: {
        "@type": "DefinedRegion",
        addressCountry: "IN",
      },
      deliveryTime: deliveryTime(5, 7),
    },
    {
      "@type": "OfferShippingDetails",
      shippingRate: monetaryAmount(internationalRate, currencyCode),
      shippingDestination: {
        "@type": "DefinedRegion",
        addressCountry: "US",
      },
      deliveryTime: deliveryTime(7, 12),
    },
  ];
}

export function merchantReturnPolicy(returnsUrl: string): Record<string, unknown> {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: ["IN", "US"],
    returnPolicyCategory:
      "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 14,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
    url: returnsUrl,
  };
}

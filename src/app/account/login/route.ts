import type { NextRequest } from "next/server";
import {
  createCustomerAccountForRequest,
  finalizeCustomerAccountResponse,
  productionLoginRedirectIfLocalhost,
} from "@/lib/shopify/customer-account";

export async function GET(request: NextRequest) {
  const localRedirect = productionLoginRedirectIfLocalhost(request);
  if (localRedirect) return localRedirect;

  const url = new URL(request.url);
  const { customerAccount, session } =
    await createCustomerAccountForRequest(request);

  const response = await customerAccount.login({
    countryCode: "IN",
    acrValues: url.searchParams.get("acr_values") || undefined,
    loginHint: url.searchParams.get("login_hint") || undefined,
    loginHintMode: url.searchParams.get("login_hint_mode") || undefined,
    locale: url.searchParams.get("locale") || undefined,
  });

  return finalizeCustomerAccountResponse(response, session);
}

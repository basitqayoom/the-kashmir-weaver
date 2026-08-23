import { createNextCustomerAccountClient } from "./customer-account-client";
import { NextHydrogenSession } from "./customer-account-session";
import {
  shopifyHostedAccountUrl,
  shopifyHostedOrderUrl,
} from "./shopify-account-url";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} environment variable is not set`);
  }
  return value;
}

export async function createCustomerAccountForRequest(request: Request) {
  const session = await NextHydrogenSession.fromRequest(request);
  const customerAccount = createNextCustomerAccountClient({
    request,
    session,
    customerAccountId: requireEnv("PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID"),
    shopId: requireEnv("SHOP_ID"),
  });
  return { customerAccount, session };
}

export function storeUrlFromRequest(request: Request): string {
  return (
    process.env.PUBLIC_STORE_URL?.replace(/\/$/, "") ??
    new URL(request.url).origin
  );
}

export function productionLoginRedirectIfLocalhost(
  request: Request,
): Response | null {
  const url = new URL(request.url);
  if (!LOCAL_HOSTS.has(url.hostname)) return null;

  const storeUrl = storeUrlFromRequest(request);
  const productionLogin = new URL("/account/login", storeUrl);
  url.searchParams.forEach((value, key) => {
    productionLogin.searchParams.set(key, value);
  });
  return Response.redirect(productionLogin.toString(), 302);
}

export async function requireCustomerAccountAuth(request: Request) {
  const { customerAccount, session } =
    await createCustomerAccountForRequest(request);
  await customerAccount.handleAuthStatus();
  return { customerAccount, session };
}

export function redirectToHostedAccount(
  page: "orders" | "profile" | "addresses" = "orders",
) {
  const shopId = requireEnv("SHOP_ID");
  return Response.redirect(shopifyHostedAccountUrl(shopId, page), 302);
}

export function redirectToHostedOrder(orderId: string) {
  const shopId = requireEnv("SHOP_ID");
  return Response.redirect(shopifyHostedOrderUrl(shopId, orderId), 302);
}

export async function finalizeCustomerAccountResponse(
  response: Response,
  session: NextHydrogenSession,
): Promise<Response> {
  return session.applyToResponse(response);
}

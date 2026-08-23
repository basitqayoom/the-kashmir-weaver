import type { NextRequest } from "next/server";
import {
  finalizeCustomerAccountResponse,
  redirectToHostedAccount,
  requireCustomerAccountAuth,
} from "@/lib/shopify/customer-account";

async function authThenRedirect(
  request: NextRequest,
  page: "orders" | "profile" | "addresses",
) {
  try {
    const { session } = await requireCustomerAccountAuth(request);
    const response = redirectToHostedAccount(page);
    return finalizeCustomerAccountResponse(response, session);
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}

export async function GET(request: NextRequest) {
  return authThenRedirect(request, "orders");
}

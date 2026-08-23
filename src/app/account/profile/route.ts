import type { NextRequest } from "next/server";
import {
  finalizeCustomerAccountResponse,
  redirectToHostedAccount,
  requireCustomerAccountAuth,
} from "@/lib/shopify/customer-account";

export async function GET(request: NextRequest) {
  try {
    const { session } = await requireCustomerAccountAuth(request);
    const response = redirectToHostedAccount("profile");
    return finalizeCustomerAccountResponse(response, session);
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}

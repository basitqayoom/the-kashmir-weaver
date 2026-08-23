import type { NextRequest } from "next/server";
import {
  finalizeCustomerAccountResponse,
  redirectToHostedOrder,
  requireCustomerAccountAuth,
} from "@/lib/shopify/customer-account";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const { session } = await requireCustomerAccountAuth(request);
    const response = redirectToHostedOrder(id);
    return finalizeCustomerAccountResponse(response, session);
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}

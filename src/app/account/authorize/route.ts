import type { NextRequest } from "next/server";
import {
  createCustomerAccountForRequest,
  finalizeCustomerAccountResponse,
} from "@/lib/shopify/customer-account";

export async function GET(request: NextRequest) {
  const { customerAccount, session } =
    await createCustomerAccountForRequest(request);
  const response = await customerAccount.authorize();
  return finalizeCustomerAccountResponse(response, session);
}

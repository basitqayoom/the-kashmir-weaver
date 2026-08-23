import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  createCustomerAccountForRequest,
  finalizeCustomerAccountResponse,
} from "@/lib/shopify/customer-account";

export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/", request.url), 302);
}

export async function POST(request: NextRequest) {
  const { customerAccount, session } =
    await createCustomerAccountForRequest(request);
  const response = await customerAccount.logout();
  return finalizeCustomerAccountResponse(response, session);
}

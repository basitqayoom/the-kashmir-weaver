import { NextResponse } from "next/server";
import { getCustomerLoginState } from "@/lib/shopify/customer-login-state";

export const dynamic = "force-dynamic";

/**
 * Session state is read here rather than in the server-rendered header so that
 * every page can stay statically prerendered instead of opting into dynamic
 * rendering just to decide which account icon to show.
 */
export async function GET() {
  const isLoggedIn = await getCustomerLoginState().catch(() => false);
  return NextResponse.json(
    { isLoggedIn },
    { headers: { "Cache-Control": "no-store" } },
  );
}

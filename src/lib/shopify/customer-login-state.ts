import { headers } from "next/headers";
import { NextHydrogenSession } from "./customer-account-session";

const CUSTOMER_ACCOUNT_SESSION_KEY = "customerAccount";

/** Server-only — whether the signed session cookie has a customer access token. */
export async function getCustomerLoginState(): Promise<boolean> {
  const headerList = await headers();
  const request = new Request("https://thekashmirweaver.com", {
    headers: headerList,
  });
  const session = await NextHydrogenSession.fromRequest(request);
  const account = session.get(CUSTOMER_ACCOUNT_SESSION_KEY) as
    | { accessToken?: string }
    | undefined;
  return Boolean(account?.accessToken);
}

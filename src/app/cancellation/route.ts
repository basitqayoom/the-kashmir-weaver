import { NextResponse } from "next/server";

/** Legacy URL — cancellation rules live under Returns. */
export function GET(request: Request) {
  return NextResponse.redirect(new URL("/returns", request.url), 301);
}

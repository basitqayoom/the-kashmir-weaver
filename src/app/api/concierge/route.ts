import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { sendConciergeInquiryEmail } from "@/lib/concierge-email";
import { getShopSettings } from "@/lib/shopify/shop-settings";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const inquiryType = String(form.get("inquiryType") ?? "").trim();
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const location = String(form.get("location") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();

  const errors: Record<string, string> = {};
  if (!inquiryType) errors.inquiryType = "Please select an inquiry type.";
  if (!name) errors.name = "Please enter your name.";
  if (!email) errors.email = "Please enter your email.";
  else if (!EMAIL_RE.test(email)) errors.email = "Please enter a valid email.";
  if (!location) errors.location = "Please enter your country or city.";
  if (!message) errors.message = "Please tell us how we may assist you.";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ success: false, errors }, { status: 400 });
  }

  const shopSettings = await getShopSettings();
  const emailResult = await sendConciergeInquiryEmail(
    {
      inquiryType,
      name,
      email,
      location,
      phone: phone || null,
      message,
      submittedAt: new Date().toISOString(),
    },
    { shopContactEmail: shopSettings.contact.email },
  );

  if (!emailResult.ok) {
    return NextResponse.json(
      { success: false, errors: { form: emailResult.error } },
      { status: 503 },
    );
  }

  return NextResponse.json({ success: true });
}

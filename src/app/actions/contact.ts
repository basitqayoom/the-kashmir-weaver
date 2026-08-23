"use server";

import { sendContactInquiryEmail } from "@/lib/contact-email";
import { sendConciergeInquiryEmail } from "@/lib/concierge-email";
import { getShopSettings } from "@/lib/shopify/shop-settings";

export type ContactFormState = {
  success: boolean;
  errors: Record<string, string>;
};

export type ConciergeFormState = ContactFormState;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContactInquiry(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const inquiryType = String(formData.get("inquiry_type") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const volume = String(formData.get("volume") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  const b2bTypes = [
    "Wholesale Order",
    "Corporate Gifting",
    "Bulk Custom Order",
    "Boutique Partnership",
  ];
  const isB2B = b2bTypes.includes(inquiryType);

  const errors: Record<string, string> = {};
  if (!inquiryType) errors.inquiry_type = "Please select an inquiry type.";
  if (!name) errors.name = "Please enter your name.";
  if (!email) errors.email = "Please enter your email.";
  else if (!EMAIL_RE.test(email)) errors.email = "Please enter a valid email.";
  if (isB2B && !company) errors.company = "Please enter your company name.";

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const result = await sendContactInquiryEmail({
    inquiryType,
    name,
    email,
    phone: phone || null,
    company: company || null,
    volume: volume || null,
    message,
    submittedAt: new Date().toISOString(),
  });

  if (!result.ok) {
    return { success: false, errors: { form: result.error } };
  }

  return { success: true, errors: {} };
}

export async function submitConciergeInquiry(
  _prevState: ConciergeFormState,
  formData: FormData,
): Promise<ConciergeFormState> {
  const inquiryType = String(formData.get("inquiryType") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  const errors: Record<string, string> = {};
  if (!inquiryType) errors.inquiryType = "Please select an inquiry type.";
  if (!name) errors.name = "Please enter your name.";
  if (!email) errors.email = "Please enter your email.";
  else if (!EMAIL_RE.test(email)) errors.email = "Please enter a valid email.";
  if (!location) errors.location = "Please enter your country or city.";
  if (!message) errors.message = "Please tell us how we may assist you.";

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const shopSettings = await getShopSettings();
  const result = await sendConciergeInquiryEmail(
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

  if (!result.ok) {
    return { success: false, errors: { form: result.error } };
  }

  return { success: true, errors: {} };
}

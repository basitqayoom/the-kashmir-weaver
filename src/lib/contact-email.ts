import { siteConfig } from "@/config/site";

export type ContactInquiry = {
  inquiryType: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  volume: string | null;
  message: string;
  submittedAt: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function formatContactInquiryEmail(inquiry: ContactInquiry) {
  const lines = [
    `Type: ${inquiry.inquiryType}`,
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    inquiry.phone ? `Phone: ${inquiry.phone}` : null,
    inquiry.company ? `Company: ${inquiry.company}` : null,
    inquiry.volume ? `Estimated Volume: ${inquiry.volume}` : null,
    "",
    "Message:",
    inquiry.message || "(none provided)",
    "",
    `Submitted: ${inquiry.submittedAt}`,
  ].filter((line): line is string => line !== null);

  const text = lines.join("\n");
  const html = lines
    .map((line) => (line === "" ? "<br>" : `<p>${escapeHtml(line)}</p>`))
    .join("");

  return {
    subject: `[Inquiry] ${inquiry.inquiryType} — ${inquiry.name}`,
    text,
    html,
  };
}

/** Mirrors Hydrogen's concierge-email.ts — same Resend REST call, same fallback chain. */
export async function sendContactInquiryEmail(
  inquiry: ContactInquiry,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error("Contact email skipped: RESEND_API_KEY is not configured.");
    return { ok: false, error: "Email delivery is not configured." };
  }

  const to = process.env.CONCIERGE_EMAIL_TO?.trim() || siteConfig.contact.email;
  const from =
    process.env.CONCIERGE_EMAIL_FROM?.trim() ||
    "The Kashmir Weaver <concierge@thekashmirweaver.shop>";
  const { subject, text, html } = formatContactInquiryEmail(inquiry);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: inquiry.email,
        subject,
        text,
        html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("Contact email failed:", response.status, body);
      return { ok: false, error: "Unable to deliver your inquiry email." };
    }

    return { ok: true };
  } catch (error) {
    console.error("Contact email error:", error);
    return { ok: false, error: "Unable to deliver your inquiry email." };
  }
}

"use client";

import { useState, FormEvent } from "react";

const inquiryTypes = [
  "Individual Purchase",
  "Gift Order",
  "Wholesale Order",
  "Corporate Gifting",
  "Bulk Custom Order",
  "Boutique Partnership",
  "Other",
];

const b2bTypes = ["Wholesale Order", "Corporate Gifting", "Bulk Custom Order", "Boutique Partnership"];

const volumeOptions = [
  "1–5 pieces",
  "5–20 pieces",
  "20–50 pieces",
  "50–200 pieces",
  "200+ pieces",
];

export default function ContactForm() {
  const [inquiryType, setInquiryType] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const isB2B = b2bTypes.includes(inquiryType);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("https://formspree.io/f/{FORM_ID}", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
        setInquiryType("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-charcoal">
          Full Name <span className="text-burgundy">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full rounded-lg border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-charcoal">
          Email Address <span className="text-burgundy">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-charcoal">
          Phone / WhatsApp Number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+91 XXXXX XXXXX"
          className="w-full rounded-lg border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
        />
      </div>

      {/* Inquiry Type */}
      <div>
        <label htmlFor="inquiry_type" className="mb-1.5 block text-sm font-medium text-charcoal">
          Type of Inquiry <span className="text-burgundy">*</span>
        </label>
        <select
          id="inquiry_type"
          name="inquiry_type"
          required
          value={inquiryType}
          onChange={(e) => setInquiryType(e.target.value)}
          className="w-full rounded-lg border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
        >
          <option value="">Select...</option>
          {inquiryTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Company Name */}
      <div>
        <label htmlFor="company" className="mb-1.5 block text-sm font-medium text-charcoal">
          Company Name {isB2B && <span className="text-burgundy">*</span>}
        </label>
        <input
          id="company"
          name="company"
          type="text"
          required={isB2B}
          className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:ring-1 ${
            isB2B
              ? "border-gold focus:border-gold focus:ring-gold"
              : "border-charcoal/15 focus:border-gold focus:ring-gold"
          }`}
        />
      </div>

      {/* Volume */}
      <div>
        <label htmlFor="volume" className="mb-1.5 block text-sm font-medium text-charcoal">
          Estimated Volume
        </label>
        <select
          id="volume"
          name="volume"
          className="w-full rounded-lg border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
        >
          <option value="">Select...</option>
          {volumeOptions.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-charcoal">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Tell us about your requirements..."
          className="w-full rounded-lg border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-lg bg-gold py-3.5 text-sm font-semibold text-charcoal transition-all hover:bg-gold-muted disabled:opacity-60"
      >
        {status === "sending" ? "Sending..." : "Send Inquiry"}
      </button>

      {status === "success" && (
        <p className="text-center text-sm font-medium text-green-700">
          Thank you! We&rsquo;ll be in touch within 24 hours.
        </p>
      )}
      {status === "error" && (
        <p className="text-center text-sm font-medium text-red-600">
          Something went wrong. Please try again or message us on WhatsApp.
        </p>
      )}
    </form>
  );
}

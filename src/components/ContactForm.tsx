"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitContactInquiry, type ContactFormState } from "@/app/actions/contact";
import Spinner from "./Spinner";

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

const initialState: ContactFormState = { success: false, errors: {} };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="font-accent flex w-full items-center justify-center gap-2 bg-gold py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal transition-colors hover:bg-gold-dark disabled:opacity-60"
    >
      {pending && <Spinner size="sm" label="Sending inquiry" />}
      {pending ? "Sending…" : "Send Inquiry"}
    </button>
  );
}

export default function ContactForm({ defaultInquiryType = "" }: { defaultInquiryType?: string }) {
  const [inquiryType, setInquiryType] = useState(defaultInquiryType);
  const [state, formAction] = useActionState(submitContactInquiry, initialState);

  const isB2B = b2bTypes.includes(inquiryType);

  if (state.success) {
    return (
      <div className="border border-gold/30 bg-gold/5 p-8 text-center">
        <p className="font-heading text-lg font-semibold text-charcoal">Thank you.</p>
        <p className="mt-2 text-sm text-charcoal/70">
          We&rsquo;ll be in touch within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
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
          className="w-full border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
        />
        {state.errors.name && <p className="mt-1 text-xs text-burgundy">{state.errors.name}</p>}
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
          className="w-full border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
        />
        {state.errors.email && <p className="mt-1 text-xs text-burgundy">{state.errors.email}</p>}
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
          className="w-full border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
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
          className="w-full border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
        >
          <option value="">Select...</option>
          {inquiryTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {state.errors.inquiry_type && (
          <p className="mt-1 text-xs text-burgundy">{state.errors.inquiry_type}</p>
        )}
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
          className={`w-full border bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:ring-1 ${isB2B
              ? "border-gold focus:border-gold focus:ring-gold"
              : "border-charcoal/15 focus:border-gold focus:ring-gold"
            }`}
        />
        {state.errors.company && <p className="mt-1 text-xs text-burgundy">{state.errors.company}</p>}
      </div>

      {/* Volume */}
      <div>
        <label htmlFor="volume" className="mb-1.5 block text-sm font-medium text-charcoal">
          Estimated Volume
        </label>
        <select
          id="volume"
          name="volume"
          className="w-full border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
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
          className="w-full border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
        />
      </div>

      <SubmitButton />

      {state.errors.form && (
        <p className="text-center text-sm font-medium text-burgundy">
          {state.errors.form} Please try again or message us on WhatsApp.
        </p>
      )}
    </form>
  );
}

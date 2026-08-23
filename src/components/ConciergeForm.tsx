"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  submitConciergeInquiry,
  type ConciergeFormState,
} from "@/app/actions/contact";
import Spinner from "./Spinner";

const INQUIRY_TYPES = [
  "Custom Orders",
  "Bespoke Pashmina",
  "Wedding Gifting",
  "Corporate Gifting",
  "Wholesale Inquiries",
  "Personal Shopping",
  "Press & Partnerships",
];

const initialState: ConciergeFormState = { success: false, errors: {} };

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

export default function ConciergeForm() {
  const [state, formAction] = useActionState(
    submitConciergeInquiry,
    initialState,
  );

  if (state.success) {
    return (
      <div className="border border-gold/30 bg-gold/5 p-8 text-center">
        <p className="font-heading text-lg font-semibold text-charcoal">
          Thank you.
        </p>
        <p className="mt-2 text-sm text-charcoal/70">
          Our atelier will respond personally within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label
          htmlFor="inquiryType"
          className="mb-1.5 block text-sm font-medium text-charcoal"
        >
          Type of Inquiry <span className="text-burgundy">*</span>
        </label>
        <select
          id="inquiryType"
          name="inquiryType"
          required
          defaultValue={INQUIRY_TYPES[0]}
          className="w-full border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
        >
          {INQUIRY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {state.errors.inquiryType && (
          <p className="mt-1 text-xs text-burgundy">{state.errors.inquiryType}</p>
        )}
      </div>

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-charcoal">
          Full Name <span className="text-burgundy">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="w-full border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
        />
        {state.errors.name && (
          <p className="mt-1 text-xs text-burgundy">{state.errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-charcoal">
          Email Address <span className="text-burgundy">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
        />
        {state.errors.email && (
          <p className="mt-1 text-xs text-burgundy">{state.errors.email}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="location"
          className="mb-1.5 block text-sm font-medium text-charcoal"
        >
          Country / City <span className="text-burgundy">*</span>
        </label>
        <input
          id="location"
          name="location"
          type="text"
          required
          autoComplete="address-level2"
          className="w-full border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
        />
        {state.errors.location && (
          <p className="mt-1 text-xs text-burgundy">{state.errors.location}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-charcoal">
          Phone (optional)
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+91 XXXXX XXXXX"
          className="w-full border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-1.5 block text-sm font-medium text-charcoal"
        >
          How may we assist you? <span className="text-burgundy">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          className="w-full border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-gold focus:ring-1 focus:ring-gold"
        />
        {state.errors.message && (
          <p className="mt-1 text-xs text-burgundy">{state.errors.message}</p>
        )}
      </div>

      <SubmitButton />

      {state.errors.form && (
        <p className="text-center text-sm font-medium text-burgundy">
          {state.errors.form}
        </p>
      )}
    </form>
  );
}

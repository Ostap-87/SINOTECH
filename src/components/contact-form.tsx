"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function ContactForm({ form }: { form: Dictionary["contacts"]["form"] }) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-2xl border border-accent/40 bg-surface p-8 text-center">
        <p className="text-lg font-medium">{form.thanks}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
      className="space-y-5 rounded-2xl border border-border bg-surface p-8"
    >
      <div>
        <label htmlFor="name" className="text-sm font-medium">
          {form.name}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder={form.namePlaceholder}
          className="mt-2 w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none placeholder:text-muted focus:border-accent"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="text-sm font-medium">
            {form.email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder={form.emailPlaceholder}
            className="mt-2 w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none placeholder:text-muted focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="phone" className="text-sm font-medium">
            {form.phone}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder={form.phonePlaceholder}
            className="mt-2 w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none placeholder:text-muted focus:border-accent"
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="text-sm font-medium">
          {form.message}
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder={form.messagePlaceholder}
          className="mt-2 w-full resize-none rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none placeholder:text-muted focus:border-accent"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        {form.submit}
      </button>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cartSubtotal, clearCart, useCart, type CartLine } from "@/lib/cart-store";
import { saveOrder, type StoredOrder } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";

const TAX_RATE = 0.08;

interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal: string;
  country: string;
  card: string;
  expiry: string;
  cvc: string;
}

interface BuildOrderInput {
  lines: CartLine[];
  totals: { subtotal: number; tax: number; total: number };
  customer: Customer;
}

function buildOrder({ lines, totals, customer }: BuildOrderInput): StoredOrder {
  const stamp = Date.now().toString(36).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return {
    id: `NN-${stamp}-${suffix}`,
    createdAt: new Date().toISOString(),
    status: "confirmed",
    items: lines.map((line) => ({
      productId: line.productId,
      slug: line.slug,
      name: line.name,
      brand: line.brand,
      price: line.price,
      qty: line.qty,
    })),
    totals: { subtotal: totals.subtotal, tax: totals.tax, total: totals.total },
    customer: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: `${customer.address}, ${customer.city} ${customer.postal}, ${customer.country}`,
    },
    payment: { last4: customer.card.replace(/\D/g, "").slice(-4) },
  };
}

const EMPTY_CUSTOMER: Customer = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  postal: "",
  country: "",
  card: "",
  expiry: "",
  cvc: "",
};

export function CheckoutView() {
  const lines = useCart();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer>(EMPTY_CUSTOMER);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const subtotal = cartSubtotal(lines);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  function update(field: keyof Customer, value: string) {
    setCustomer((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  function validate() {
    const next: Record<string, string> = {};
    if (customer.name.trim().length < 2) next.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) next.email = "Enter a valid email.";
    if (customer.phone.trim().length < 6) next.phone = "Enter a phone number.";
    if (customer.address.trim().length < 4) next.address = "Enter a street address.";
    if (customer.city.trim().length < 2) next.city = "Enter a city.";
    if (customer.postal.trim().length < 3) next.postal = "Enter a postal code.";
    if (customer.country.trim().length < 2) next.country = "Enter a country.";
    if (customer.card.replace(/\s/g, "").length < 15) next.card = "Enter a card number.";
    if (!/^\d{2}\s?\/\s?\d{2}$/.test(customer.expiry.trim())) next.expiry = "Use MM/YY.";
    if (customer.cvc.trim().length < 3) next.cvc = "Enter the CVC.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lines.length === 0) return;
    if (!validate()) return;

    setSubmitting(true);
    const order = buildOrder({
      lines,
      totals: { subtotal, tax, total },
      customer,
    });

    saveOrder(order);

    window.setTimeout(() => {
      clearCart();
      router.push(`/checkout/success?order=${order.id}`);
    }, 350);
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-surface px-8 py-20 text-center">
        <h1 className="text-3xl font-bold text-ink">Nothing to check out</h1>
        <p className="mt-3 text-sm text-muted">Your cart is empty.</p>
        <Link href="/#launched" className="btn-primary mt-8 inline-block rounded-full px-6 py-3 text-sm font-bold">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Step 2 of 2</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">Checkout</h1>
        </div>
        <Link href="/cart" className="text-sm font-semibold text-muted hover:text-accent">
          ← Back to cart
        </Link>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-8">
          <fieldset className="rounded-3xl border border-line bg-surface p-6">
            <legend className="px-2 text-sm font-bold uppercase tracking-widest text-ink">
              Contact
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Full name"
                value={customer.name}
                onChange={(value) => update("name", value)}
                error={errors.name}
                autoComplete="name"
              />
              <Field
                label="Email"
                type="email"
                value={customer.email}
                onChange={(value) => update("email", value)}
                error={errors.email}
                autoComplete="email"
              />
              <Field
                label="Phone"
                type="tel"
                value={customer.phone}
                onChange={(value) => update("phone", value)}
                error={errors.phone}
                autoComplete="tel"
              />
            </div>
          </fieldset>

          <fieldset className="rounded-3xl border border-line bg-surface p-6">
            <legend className="px-2 text-sm font-bold uppercase tracking-widest text-ink">
              Shipping
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Street address"
                value={customer.address}
                onChange={(value) => update("address", value)}
                error={errors.address}
                autoComplete="street-address"
                full
              />
              <Field
                label="City"
                value={customer.city}
                onChange={(value) => update("city", value)}
                error={errors.city}
                autoComplete="address-level2"
              />
              <Field
                label="Postal code"
                value={customer.postal}
                onChange={(value) => update("postal", value)}
                error={errors.postal}
                autoComplete="postal-code"
              />
              <Field
                label="Country"
                value={customer.country}
                onChange={(value) => update("country", value)}
                error={errors.country}
                autoComplete="country-name"
              />
            </div>
          </fieldset>

          <fieldset className="rounded-3xl border border-accent/40 bg-surface p-6">
            <legend className="px-2 text-sm font-bold uppercase tracking-widest text-accent">
              Payment
            </legend>
            <p className="mb-4 rounded-2xl border border-dashed border-line bg-surface-2 px-4 py-3 text-xs text-muted">
              Demo checkout — no card is charged and no payment data leaves your browser. Use any
              digits (for example <span className="font-mono text-ink">4242 4242 4242 4242</span>).
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Card number"
                value={customer.card}
                onChange={(value) => update("card", value)}
                error={errors.card}
                inputMode="numeric"
                placeholder="4242 4242 4242 4242"
                autoComplete="cc-number"
                full
              />
              <Field
                label="Expiry"
                value={customer.expiry}
                onChange={(value) => update("expiry", value)}
                error={errors.expiry}
                placeholder="MM/YY"
                autoComplete="cc-exp"
              />
              <Field
                label="CVC"
                value={customer.cvc}
                onChange={(value) => update("cvc", value)}
                error={errors.cvc}
                inputMode="numeric"
                placeholder="123"
                autoComplete="cc-csc"
              />
            </div>
          </fieldset>
        </div>

        <aside className="h-fit rounded-3xl border border-line bg-surface p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-ink">Order summary</h2>
          <ul className="mt-4 space-y-3">
            {lines.map((line) => (
              <li key={line.productId} className="flex items-start justify-between gap-3 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-ink">
                    {line.brand} {line.name}
                  </span>
                  <span className="text-muted">Qty {line.qty}</span>
                </span>
                <span className="shrink-0 font-semibold text-ink">
                  {formatPrice(line.price * line.qty)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-semibold text-ink">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Tax (8%)</dt>
              <dd className="font-semibold text-ink">{formatPrice(tax)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd className="font-semibold text-accent">Free</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base">
              <dt className="font-bold text-ink">Total</dt>
              <dd className="font-extrabold text-ink">{formatPrice(total)}</dd>
            </div>
          </dl>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary mt-6 w-full rounded-full px-6 py-3.5 text-sm font-bold disabled:opacity-60"
          >
            {submitting ? "Placing order…" : `Pay ${formatPrice(total)}`}
          </button>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">
            By placing this order you agree to NextNova&apos;s demo terms of sale.
          </p>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  full = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "text" | "tel" | "email";
  full?: boolean;
}) {
  const id = `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-muted">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-xl border bg-surface-2 px-4 py-3 text-sm text-ink placeholder:text-muted/70 focus:outline-none ${
          error ? "border-accent-2" : "border-line focus:border-accent"
        }`}
      />
      {error ? <p className="mt-1 text-xs font-semibold text-accent-2">{error}</p> : null}
    </div>
  );
}

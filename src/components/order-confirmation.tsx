"use client";

import Link from "next/link";
import { useOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";

export function OrderConfirmation({ orderId }: { orderId: string | null }) {
  const orders = useOrders();
  const order = orderId ? (orders.find((item) => item.id === orderId) ?? null) : null;

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center text-muted" role="status">
        Loading your order…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-accent">Orders</p>
        <h1 className="mt-4 text-3xl font-bold text-ink">Order not found</h1>
        <p className="mt-3 text-sm text-muted">
          We could not find that order in this browser. Place a new order to see the confirmation.
        </p>
        <Link
          href="/#launched"
          className="btn-primary mt-8 inline-block rounded-full px-6 py-3 text-sm font-bold"
        >
          Back to marketplace
        </Link>
      </div>
    );
  }

  const eta = new Date(order.createdAt);
  eta.setDate(eta.getDate() + 5);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-3xl border border-accent/40 bg-surface">
        <div className="relative px-8 py-10 text-center">
          <div aria-hidden className="aurora absolute inset-0" />
          <div className="relative">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-2xl text-bg shadow-[0_20px_45px_-20px_var(--accent)]">
              ✓
            </span>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.3em] text-accent">
              Payment authorised · demo
            </p>
            <h1 className="mt-3 text-3xl font-extrabold text-ink">
              Thanks, {order.customer.name}!
            </h1>
            <p className="mt-2 text-sm text-muted">
              Order <span className="font-mono font-bold text-ink">{order.id}</span> is confirmed. A
              receipt was prepared for {order.customer.email}.
            </p>
          </div>
        </div>

        <div className="border-t border-line px-8 py-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-ink">Your items</h2>
          <ul className="mt-4 space-y-3">
            {order.items.map((item) => (
              <li
                key={item.productId}
                className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface-2 px-4 py-3"
              >
                <Link
                  href={`/products/${item.slug}`}
                  className="min-w-0 truncate text-sm font-semibold text-ink hover:text-accent"
                >
                  {item.brand} {item.name}
                </Link>
                <span className="shrink-0 text-sm text-muted">
                  Qty {item.qty} · {formatPrice(item.price * item.qty)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-semibold text-ink">{formatPrice(order.totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Tax</dt>
              <dd className="font-semibold text-ink">{formatPrice(order.totals.tax)}</dd>
            </div>
            <div className="flex justify-between text-base">
              <dt className="font-bold text-ink">Paid</dt>
              <dd className="font-extrabold text-ink">{formatPrice(order.totals.total)}</dd>
            </div>
          </dl>

          <div className="mt-5 grid gap-3 rounded-2xl border border-line bg-surface-2 p-4 text-xs text-muted sm:grid-cols-2">
            <p>
              <span className="block font-bold text-ink">Shipping to</span>
              {order.customer.address}
            </p>
            <p>
              <span className="block font-bold text-ink">Estimated delivery</span>
              {eta.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
              <span className="block">Card ending {order.payment.last4 || "••••"}</span>
            </p>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/#launched" className="btn-primary rounded-full px-6 py-3 text-sm font-bold">
              Continue shopping
            </Link>
            <Link
              href="/cart"
              className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink hover:border-accent hover:text-accent"
            >
              View cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

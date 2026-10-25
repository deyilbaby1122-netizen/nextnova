"use client";

import Link from "next/link";
import { cartSubtotal, clearCart, removeFromCart, setQuantity, useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";

const SHIPPING = 0;
const TAX_RATE = 0.08;

export function CartView() {
  const lines = useCart();
  const subtotal = cartSubtotal(lines);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax + SHIPPING;

  if (lines.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-surface px-8 py-20 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-accent">Cart</p>
        <h1 className="mt-4 text-3xl font-bold text-ink">Your cart is empty</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          Add a launched product from the marketplace and it will show up here, ready for
          checkout.
        </p>
        <Link href="/#launched" className="btn-primary mt-8 inline-block rounded-full px-6 py-3 text-sm font-bold">
          Browse launched products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink">Your cart</h1>
      <p className="mt-1 text-sm text-muted">
        {lines.length} item{lines.length === 1 ? "" : "s"} ready for checkout
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <ul className="space-y-4">
          {lines.map((line) => (
            <li
              key={line.productId}
              className="flex flex-wrap items-center gap-4 rounded-3xl border border-line bg-surface p-4"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-line">
                <div
                  className="h-full w-full"
                  style={{
                    background: `linear-gradient(135deg, hsl(${line.hue} 78% 55%), hsl(${
                      (line.hue + 40) % 360
                    } 55% 22%))`,
                  }}
                  aria-hidden
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-bold uppercase tracking-widest text-muted">
                  {line.brand}
                </p>
                <Link
                  href={`/products/${line.slug}`}
                  className="truncate font-semibold text-ink hover:text-accent"
                >
                  {line.name}
                </Link>
                <p className="text-sm text-muted">{formatPrice(line.price)}</p>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-line bg-surface-2 px-2 py-1">
                <button
                  type="button"
                  aria-label={`Decrease quantity of ${line.name}`}
                  onClick={() => setQuantity(line.productId, line.qty - 1)}
                  className="h-7 w-7 rounded-full text-ink hover:bg-surface"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-bold text-ink" aria-live="polite">
                  {line.qty}
                </span>
                <button
                  type="button"
                  aria-label={`Increase quantity of ${line.name}`}
                  onClick={() => setQuantity(line.productId, line.qty + 1)}
                  className="h-7 w-7 rounded-full text-ink hover:bg-surface"
                >
                  +
                </button>
              </div>

              <p className="w-24 text-right font-bold text-ink">
                {formatPrice(line.price * line.qty)}
              </p>

              <button
                type="button"
                onClick={() => removeFromCart(line.productId)}
                aria-label={`Remove ${line.name} from cart`}
                className="text-sm text-muted transition hover:text-accent-2"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-3xl border border-line bg-surface p-6">
          <h2 className="text-lg font-bold text-ink">Order summary</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-semibold text-ink">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Estimated tax (8%)</dt>
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

          <Link
            href="/checkout"
            className="btn-primary mt-6 block rounded-full px-6 py-3 text-center text-sm font-bold"
          >
            Proceed to checkout
          </Link>
          <Link
            href="/#launched"
            className="mt-3 block rounded-full border border-line px-6 py-3 text-center text-sm font-semibold text-ink hover:border-accent hover:text-accent"
          >
            Keep shopping
          </Link>
          <button
            type="button"
            onClick={clearCart}
            className="mt-4 w-full text-center text-xs font-semibold text-muted transition hover:text-accent-2"
          >
            Empty cart
          </button>
        </aside>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ProductVisual } from "@/components/product-visual";
import { addToCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  selected: boolean;
  onToggleCompare: (product: Product) => void;
  index?: number;
}

const MAX_TILT = 9;

export function ProductCard({ product, selected, onToggleCompare, index = 0 }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, mx: 50, my: 50, active: false });
  const [added, setAdded] = useState(false);
  const price = formatPrice(product.price);

  function handleAdd() {
    if (!addToCart(product)) return;
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    setTilt({
      x: (0.5 - py) * MAX_TILT * 2,
      y: (px - 0.5) * MAX_TILT * 2,
      mx: px * 100,
      my: py * 100,
      active: true,
    });
  }

  function reset() {
    setTilt((prev) => ({ ...prev, x: 0, y: 0, active: false }));
  }

  const isUpcoming = product.status === "upcoming";

  return (
    <article className="scene h-full">
      <div
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        className="tilt relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_20px_60px_-40px_rgba(0,0,0,0.9)] hover:border-accent/50"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${tilt.active ? 1.015 : 1})`,
        }}
      >
        {/* cursor-following specular highlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            opacity: tilt.active ? 1 : 0,
            background: `radial-gradient(340px circle at ${tilt.mx}% ${tilt.my}%, rgba(255,255,255,0.16), transparent 62%)`,
          }}
        />

        <div className="relative aspect-[4/3] overflow-hidden preserve-3d">
          <div className="tilt-layer h-full w-full">
            <ProductVisual product={product} />
          </div>
          <div className="absolute left-3 top-3 flex gap-2">
            {product.badge ? (
              <span className="rounded-full bg-bg/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent backdrop-blur">
                {product.badge}
              </span>
            ) : null}
            {isUpcoming && !product.badge ? (
              <span className="rounded-full bg-accent-2/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                Upcoming
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onToggleCompare(product)}
            aria-pressed={selected}
            aria-label={`${selected ? "Remove" : "Add"} ${product.name} ${selected ? "from" : "to"} comparison`}
            className={`absolute right-3 top-3 z-30 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider backdrop-blur transition ${
              selected
                ? "border-accent bg-accent text-bg"
                : "border-white/30 bg-black/45 text-white hover:border-accent hover:text-accent"
            }`}
          >
            {selected ? "✓ Comparing" : "Compare"}
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
              {product.brand} · {product.category}
            </p>
            <h3 className="mt-1.5 text-xl font-bold leading-snug text-ink">{product.name}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{product.tagline}</p>
          </div>

          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-2xl border border-line bg-surface-2 p-3 text-xs">
            {product.specs.slice(0, 4).map((spec) => (
              <div key={spec.label} className="min-w-0">
                <dt className="truncate text-muted">{spec.label}</dt>
                <dd className="truncate font-semibold text-ink" title={spec.value}>
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-auto flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-lg font-bold text-ink">
                {price ?? <span className="text-base font-semibold text-muted">Price TBA</span>}
              </p>
              {product.priceNote ? (
                <p className="truncate text-xs text-muted" title={product.priceNote}>
                  {product.priceNote}
                </p>
              ) : null}
              {isUpcoming && product.expectedLaunch ? (
                <p className="text-xs font-semibold text-accent-2">Launch: {product.expectedLaunch}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 gap-2">
              <Link
                href={`/products/${product.slug}`}
                className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink transition hover:border-accent hover:text-accent"
              >
                Details
              </Link>
              {isUpcoming || product.price === null ? (
                <a
                  href={product.buyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink transition hover:border-accent hover:text-accent"
                >
                  Official page
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleAdd}
                  className="btn-primary rounded-full px-4 py-2 text-xs font-bold"
                >
                  {added ? "✓ Added" : "Add to cart"}
                </button>
              )}
            </div>
          </div>

          <p className="text-[10px] uppercase tracking-widest text-muted/70" style={{ animationDelay: `${index * 40}ms` }}>
            Source: {product.sourceLabel}
          </p>
        </div>
      </div>
    </article>
  );
}

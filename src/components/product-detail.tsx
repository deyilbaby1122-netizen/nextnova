"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CompareBar, CompareModal } from "@/components/compare";
import { ProductCard } from "@/components/product-card";
import { ProductVisual } from "@/components/product-visual";
import { Reveal } from "@/components/reveal";
import { addToCart } from "@/lib/cart-store";
import {
  clearCompare,
  MAX_COMPARE,
  removeCompare,
  toggleCompare,
  useCompareIds,
} from "@/lib/compare-store";
import { useProducts } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ProductDetailProps {
  slug: string;
  seedProduct: Product | null;
}

export function ProductDetail({ slug, seedProduct }: ProductDetailProps) {
  const products = useProducts();
  const compareIds = useCompareIds();
  const router = useRouter();
  const [compareOpen, setCompareOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const product = useMemo(
    () => products.find((item) => item.slug === slug) ?? seedProduct,
    [products, slug, seedProduct],
  );

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-28 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-accent">404</p>
        <h1 className="mt-4 text-3xl font-bold text-ink">That product is not in the catalogue</h1>
        <p className="mt-3 text-muted">
          It may have been removed from the admin dashboard, or the link is out of date.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="btn-primary rounded-full px-6 py-3 text-sm font-bold">
            Back to marketplace
          </Link>
          <Link
            href="/admin"
            className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink hover:border-accent"
          >
            Open admin
          </Link>
        </div>
      </div>
    );
  }

  const price = formatPrice(product.price);
  const isUpcoming = product.status === "upcoming";
  const selected = compareIds.includes(product.id);

  const compareItems = compareIds
    .map((id) => products.find((item) => item.id === id))
    .filter((item): item is Product => Boolean(item));

  const handleCompare = () => {
    const added = toggleCompare(product.id);
    if (!added && !selected) {
      setNotice(`Compare up to ${MAX_COMPARE} products at a time.`);
      window.setTimeout(() => setNotice(null), 2600);
    }
  };

  const related = products
    .filter(
      (item) =>
        item.id !== product.id &&
        (item.category === product.category || item.brand === product.brand),
    )
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-xs text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-accent">
              Marketplace
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li>
            <Link href={isUpcoming ? "/#upcoming" : "/#launched"} className="hover:text-accent">
              {isUpcoming ? "Upcoming launches" : "Launched products"}
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li className="font-semibold text-ink">{product.name}</li>
        </ol>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_1fr]">
        {/* artwork */}
        <div className="scene">
          <div
            className="tilt overflow-hidden rounded-3xl border border-line shadow-[0_50px_100px_-60px_rgba(0,0,0,1)]"
            style={{ transform: "rotateX(2deg) rotateY(-3deg)" }}
          >
            <div className="aspect-[4/3] w-full">
              <ProductVisual product={product} withTitle />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {product.highlights.slice(0, 3).map((highlight, index) => (
              <div
                key={highlight}
                className="rounded-2xl border border-line bg-surface p-3 text-[11px] leading-snug text-muted"
              >
                <span className="mb-1 block font-mono font-bold text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {highlight}
              </div>
            ))}
          </div>
        </div>

        {/* facts */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-line px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-muted">
              {product.category}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${
                isUpcoming
                  ? "bg-accent-2/15 text-accent-2"
                  : "bg-accent/15 text-accent"
              }`}
            >
              {isUpcoming ? "Upcoming" : "Launched"}
            </span>
            {product.confidence ? (
              <span className="rounded-full border border-dashed border-line px-3 py-1 text-[11px] font-semibold text-muted">
                {product.confidence === "official" ? "Official announcement" : "Reported — unconfirmed"}
              </span>
            ) : null}
          </div>

          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-muted">
            {product.brand}
          </p>
          <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-3 text-lg text-muted">{product.tagline}</p>

          <div className="mt-6 rounded-3xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-end gap-3">
              <p className="text-3xl font-extrabold text-ink">
                {price ?? <span className="text-xl text-muted">Price to be announced</span>}
              </p>
              {product.priceNote ? (
                <p className="text-sm text-muted">{product.priceNote}</p>
              ) : null}
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted">
                  {isUpcoming ? "Expected launch" : "Availability"}
                </dt>
                <dd className="font-semibold text-ink">
                  {isUpcoming ? product.expectedLaunch ?? "To be announced" : product.releasedOn ?? "In stock"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted">Source</dt>
                <dd className="font-semibold text-ink">{product.sourceLabel}</dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-wrap gap-3">
              {product.price !== null && !isUpcoming ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (addToCart(product)) {
                        setAdded(true);
                        window.setTimeout(() => setAdded(false), 2000);
                      }
                    }}
                    className="btn-primary rounded-full px-6 py-3 text-sm font-bold"
                  >
                    {added ? "✓ Added to cart" : `Add to cart — ${price}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (addToCart(product)) router.push("/checkout");
                    }}
                    className="rounded-full border border-line px-6 py-3 text-sm font-bold text-ink transition hover:border-accent hover:text-accent"
                  >
                    Buy now
                  </button>
                </>
              ) : (
                <a
                  href={product.buyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary rounded-full px-6 py-3 text-sm font-bold"
                >
                  Visit official announcement
                </a>
              )}
              <button
                type="button"
                onClick={handleCompare}
                aria-pressed={selected}
                className={`rounded-full border px-6 py-3 text-sm font-bold transition ${
                  selected
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-line text-ink hover:border-accent hover:text-accent"
                }`}
              >
                {selected ? "✓ In comparison" : "Add to comparison"}
              </button>
            </div>
            <a
              href={product.buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-xs font-semibold text-muted underline decoration-dotted hover:text-accent"
            >
              Official page · {product.sourceLabel} ↗
            </a>
            {notice ? (
              <p role="status" className="mt-3 text-xs font-semibold text-accent-2">
                {notice}
              </p>
            ) : null}
          </div>

          <p className="mt-6 text-sm leading-relaxed text-muted">{product.description}</p>
        </div>
      </div>

      {/* specs */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-ink">Specifications</h2>
        <dl className="mt-5 overflow-hidden rounded-3xl border border-line">
          {product.specs.map((spec, index) => (
            <div
              key={spec.label}
              className={`grid gap-1 px-5 py-4 sm:grid-cols-[minmax(180px,240px)_1fr] sm:gap-6 ${
                index % 2 === 0 ? "bg-surface" : "bg-surface-2"
              }`}
            >
              <dt className="text-xs font-bold uppercase tracking-wider text-muted">{spec.label}</dt>
              <dd className="text-sm font-semibold text-ink">{spec.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {related.length > 0 ? (
        <section className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold text-ink">Related products</h2>
            <Link href="/" className="text-sm font-semibold text-accent hover:underline">
              Back to marketplace
            </Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item, index) => (
              <Reveal key={item.id} delay={index * 70}>
                <ProductCard
                  product={item}
                  index={index}
                  selected={compareIds.includes(item.id)}
                  onToggleCompare={(target) => toggleCompare(target.id)}
                />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      <CompareBar
        items={compareItems}
        onOpen={() => setCompareOpen(true)}
        onRemove={(item) => removeCompare(item.id)}
        onClear={() => {
          clearCompare();
          setCompareOpen(false);
        }}
      />

      {compareOpen && compareItems.length >= 2 ? (
        <CompareModal
          items={compareItems}
          onClose={() => setCompareOpen(false)}
          onRemove={(item) => removeCompare(item.id)}
        />
      ) : null}
    </div>
  );
}


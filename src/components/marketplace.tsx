"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CompareBar, CompareModal, MAX_COMPARE } from "@/components/compare";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { useProducts } from "@/lib/store";
import { cn, matchesQuery } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function Marketplace() {
  const products = useProducts();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set(products.map((product) => product.category));
    return ["All", ...Array.from(set).sort()];
  }, [products]);

  const matches = (product: Product) =>
    (category === "All" || product.category === category) && matchesQuery(product, query);

  const launched = products.filter((product) => product.status === "launched");
  const upcoming = products.filter((product) => product.status === "upcoming");
  const filteredLaunched = launched.filter(matches);
  const filteredUpcoming = upcoming.filter(matches);

  const compareItems = compareIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice((current) => (current === message ? null : current)), 2600);
  }

  function toggleCompare(product: Product) {
    setCompareIds((current) => {
      if (current.includes(product.id)) return current.filter((id) => id !== product.id);
      if (current.length >= MAX_COMPARE) {
        flash(`You can compare up to ${MAX_COMPARE} products at a time.`);
        return current;
      }
      return [...current, product.id];
    });
  }

  function clearCompare() {
    setCompareIds([]);
    setCompareOpen(false);
  }

  const totalResults = filteredLaunched.length + filteredUpcoming.length;

  return (
    <div className="space-y-16">
      {/* ------------------------------ toolbar ------------------------------ */}
      <div className="scroll-thin sticky top-[68px] z-30 -mx-3 px-3 pb-3 pt-3 sm:-mx-6 sm:px-6">
        <div className="glass rounded-3xl border border-line p-3 shadow-[0_18px_44px_-34px_rgba(0,0,0,0.9)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative flex-1">
              <span className="sr-only">Search products</span>
              <span aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                ⌕
              </span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Live search: humanoid, drone, glasses, Tesla…"
                className="w-full rounded-2xl border border-line bg-surface-2 py-3 pl-11 pr-10 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 text-muted hover:text-ink"
                >
                  ✕
                </button>
              ) : null}
            </label>

            <p
              aria-live="polite"
              className="shrink-0 rounded-2xl border border-line bg-surface-2 px-4 py-3 text-xs text-muted lg:text-center"
            >
              <span className="font-bold text-accent">{totalResults}</span> of {products.length}{" "}
              products
            </p>
          </div>

          <div className="scroll-thin mt-3 flex gap-2 overflow-x-auto pb-1">
            {categories.map((item) => {
              const active = category === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  aria-pressed={active}
                  className={cn(
                    "chip shrink-0 rounded-full border px-4 py-2 text-xs font-semibold",
                    active
                      ? "border-accent bg-accent text-bg"
                      : "border-line bg-surface-2 text-muted hover:border-accent/60 hover:text-ink",
                  )}
                >
                  {item}
                </button>
              );
            })}
          </div>

          {notice ? (
            <p className="mt-2 px-1 text-xs font-semibold text-accent-2" role="status">
              {notice}
            </p>
          ) : null}
        </div>
      </div>

      {/* ---------------------------- launched ------------------------------ */}
      <section id="launched" className="scroll-mt-40 space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">
              Section 01 — Available now
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Launched Products
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Real AI cars, robots, machines and smart gadgets you can order today, with live
              prices, specifications and official purchase links.
            </p>
          </div>
          <p className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-muted">
            {filteredLaunched.length} product{filteredLaunched.length === 1 ? "" : "s"}
          </p>
        </header>

        {filteredLaunched.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {filteredLaunched.map((product, index) => (
              <Reveal key={product.id} delay={(index % 4) * 70}>
                <ProductCard
                  product={product}
                  index={index}
                  selected={compareIds.includes(product.id)}
                  onToggleCompare={toggleCompare}
                />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState
            label="launched products"
            onReset={() => {
              setQuery("");
              setCategory("All");
            }}
          />
        )}
      </section>

      {/* ---------------------------- upcoming ------------------------------ */}
      <section id="upcoming" className="scroll-mt-40 space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent-2">
              Section 02 — On the horizon
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Upcoming Launches
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Officially announced future technology with expected launch windows, specifications
              and the source of every claim. Reported (unconfirmed) details are labelled.
            </p>
          </div>
          <p className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-muted">
            {filteredUpcoming.length} announcement{filteredUpcoming.length === 1 ? "" : "s"}
          </p>
        </header>

        {filteredUpcoming.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {filteredUpcoming.map((product, index) => (
              <Reveal key={product.id} delay={(index % 4) * 70}>
                <ProductCard
                  product={product}
                  index={index}
                  selected={compareIds.includes(product.id)}
                  onToggleCompare={toggleCompare}
                />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState
            label="upcoming launches"
            onReset={() => {
              setQuery("");
              setCategory("All");
            }}
          />
        )}
      </section>

      <CompareBar
        items={compareItems}
        onOpen={() => setCompareOpen(true)}
        onRemove={(product) =>
          setCompareIds((current) => current.filter((id) => id !== product.id))
        }
        onClear={clearCompare}
      />

      {compareOpen && compareItems.length >= 2 ? (
        <CompareModal
          items={compareItems}
          onClose={() => setCompareOpen(false)}
          onRemove={(product) =>
            setCompareIds((current) => current.filter((id) => id !== product.id))
          }
        />
      ) : null}
    </div>
  );
}

function EmptyState({ label, onReset }: { label: string; onReset: () => void }) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-surface p-10 text-center">
      <p className="text-lg font-semibold text-ink">No {label} match that filter.</p>
      <p className="mt-1 text-sm text-muted">Try a different keyword or category.</p>
      <div className="mt-5 flex justify-center gap-3">
        <button
          type="button"
          onClick={onReset}
          className="btn-primary rounded-full px-5 py-2.5 text-sm font-bold"
        >
          Reset filters
        </button>
        <Link
          href="/admin"
          className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:border-accent hover:text-accent"
        >
          Add a product
        </Link>
      </div>
    </div>
  );
}

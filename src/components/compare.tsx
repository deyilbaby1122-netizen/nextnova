"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ProductVisual } from "@/components/product-visual";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

export const MAX_COMPARE = 3;

interface CompareBarProps {
  items: Product[];
  onOpen: () => void;
  onRemove: (product: Product) => void;
  onClear: () => void;
}

export function CompareBar({ items, onOpen, onRemove, onClear }: CompareBarProps) {
  if (items.length === 0) return null;
  const ready = items.length >= 2;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-6 sm:pb-5">
      <div className="glass mx-auto flex max-w-5xl flex-wrap items-center gap-3 rounded-2xl border border-accent/40 px-4 py-3 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.9)]">
        <div className="flex items-center gap-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onRemove(item)}
              title={`Remove ${item.name}`}
              className="group flex items-center gap-2 rounded-full border border-line bg-surface-2 py-1 pl-1 pr-3 text-xs font-semibold text-ink transition hover:border-accent"
            >
              <span className="h-7 w-7 overflow-hidden rounded-full">
                <ProductVisual product={item} />
              </span>
              <span className="max-w-28 truncate">{item.name}</span>
              <span aria-hidden className="text-muted group-hover:text-accent">
                ✕
              </span>
            </button>
          ))}
          {items.length < MAX_COMPARE ? (
            <span className="hidden text-xs text-muted sm:inline">
              Add up to {MAX_COMPARE} products
            </span>
          ) : null}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onClear}
            className="rounded-full px-3 py-2 text-xs font-semibold text-muted transition hover:text-ink"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onOpen}
            disabled={!ready}
            className="btn-primary rounded-full px-5 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-45"
          >
            Compare {items.length >= 2 ? `(${items.length})` : ""}
          </button>
        </div>
      </div>
      {!ready ? (
        <p className="mx-auto mt-1 max-w-5xl text-center text-[11px] text-muted">
          Select at least two products to compare them side by side.
        </p>
      ) : null}
    </div>
  );
}

interface CompareModalProps {
  items: Product[];
  onClose: () => void;
  onRemove: (product: Product) => void;
}

export function CompareModal({ items, onClose, onRemove }: CompareModalProps) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const specLabels: string[] = [];
  for (const item of items) {
    for (const spec of item.specs) {
      if (!specLabels.includes(spec.label)) specLabels.push(spec.label);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Product comparison"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="scroll-thin max-h-[92vh] w-full max-w-6xl overflow-auto rounded-t-3xl border border-line bg-elev sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-elev/95 px-5 py-4 backdrop-blur">
          <div>
            <h2 className="text-lg font-bold text-ink">Compare products</h2>
            <p className="text-xs text-muted">Side-by-side specifications from official sources</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comparison"
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
          >
            Close
          </button>
        </div>

        <div className="overflow-x-auto px-4 pb-6 pt-4">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-40 border-b border-line px-3 py-3 text-left align-bottom text-xs uppercase tracking-wider text-muted">
                  Attribute
                </th>
                {items.map((item) => (
                  <th key={item.id} className="border-b border-line px-3 py-3 align-bottom">
                    <div className="space-y-2">
                      <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line">
                        <ProductVisual product={item} />
                      </div>
                      <div className="text-left">
                        <p className="text-[11px] uppercase tracking-wider text-muted">{item.brand}</p>
                        <p className="font-bold text-ink">{item.name}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={onClose}
                          className="rounded-full border border-line px-3 py-1 text-[11px] font-semibold text-ink hover:border-accent hover:text-accent"
                        >
                          Details
                        </Link>
                        <button
                          type="button"
                          onClick={() => onRemove(item)}
                          className="rounded-full border border-line px-3 py-1 text-[11px] font-semibold text-muted hover:border-accent hover:text-accent"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <Row label="Brand" values={items.map((i) => i.brand)} />
              <Row label="Category" values={items.map((i) => i.category)} />
              <Row
                label="Price"
                values={items.map((i) => formatPrice(i.price) ?? "Price TBA")}
              />
              <Row
                label="Status"
                values={items.map((i) => (i.status === "launched" ? "Launched" : "Upcoming"))}
              />
              <Row
                label="Release"
                values={items.map(
                  (i) => i.releasedOn ?? i.expectedLaunch ?? "To be announced",
                )}
              />
              <Row
                label="Source"
                values={items.map((i) => i.sourceLabel)}
              />
              {specLabels.map((label) => (
                <Row
                  key={label}
                  label={label}
                  values={items.map(
                    (item) => item.specs.find((spec) => spec.label === label)?.value ?? "—",
                  )}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Row({ label, values }: { label: string; values: string[] }) {
  return (
    <tr className="align-top">
      <th className="border-b border-line px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </th>
      {values.map((value, index) => (
        <td key={`${label}-${index}`} className="border-b border-line px-3 py-3 text-ink">
          {value}
        </td>
      ))}
    </tr>
  );
}

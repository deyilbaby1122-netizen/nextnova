"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductVisual } from "@/components/product-visual";
import { addProduct, removeProduct, resetCatalog, updateProduct, useProducts } from "@/lib/store";
import { cn, formatPrice } from "@/lib/utils";
import type { Product, Spec } from "@/lib/types";

interface FormState {
  name: string;
  brand: string;
  category: string;
  status: "launched" | "upcoming";
  tagline: string;
  description: string;
  price: string;
  priceNote: string;
  hue: string;
  releasedOn: string;
  expectedLaunch: string;
  expectedDate: string;
  buyUrl: string;
  sourceLabel: string;
  confidence: "official" | "reported" | "";
  badge: string;
  specs: Spec[];
  highlights: string;
  tags: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  brand: "",
  category: "AI Machines",
  status: "launched",
  tagline: "",
  description: "",
  price: "",
  priceNote: "",
  hue: "200",
  releasedOn: "Available now",
  expectedLaunch: "",
  expectedDate: "",
  buyUrl: "",
  sourceLabel: "",
  confidence: "",
  badge: "",
  specs: [{ label: "", value: "" }],
  highlights: "",
  tags: "",
};

function toForm(product: Product | null): FormState {
  if (!product) return EMPTY_FORM;
  return {
    name: product.name,
    brand: product.brand,
    category: product.category,
    status: product.status,
    tagline: product.tagline,
    description: product.description,
    price: product.price === null ? "" : String(product.price),
    priceNote: product.priceNote ?? "",
    hue: String(product.hue ?? 200),
    releasedOn: product.releasedOn ?? "",
    expectedLaunch: product.expectedLaunch ?? "",
    expectedDate: product.expectedDate ?? "",
    buyUrl: product.buyUrl,
    sourceLabel: product.sourceLabel,
    confidence: product.confidence ?? "",
    badge: product.badge ?? "",
    specs: product.specs.length ? product.specs : [{ label: "", value: "" }],
    highlights: product.highlights.join("\n"),
    tags: (product.tags ?? []).join(", "),
  };
}

const CATEGORIES = [
  "AI Cars",
  "Humanoid Robots",
  "Robot Dogs",
  "Drones",
  "AI Machines",
  "Smart Glasses",
  "AR/VR Headsets",
  "Smartphones",
  "Wearables",
];

export function AdminDashboard() {
  const products = useProducts();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "launched" | "upcoming">("all");
  const [draft, setDraft] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  const stats = useMemo(
    () => ({
      total: products.length,
      launched: products.filter((p) => p.status === "launched").length,
      upcoming: products.filter((p) => p.status === "upcoming").length,
      categories: new Set(products.map((p) => p.category)).size,
    }),
    [products],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => {
      const statusMatch = status === "all" || product.status === status;
      const textMatch =
        !needle ||
        `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(needle);
      return statusMatch && textMatch;
    });
  }, [products, query, status]);

  function openEditor(product?: Product) {
    setDraft(toForm(product ?? null));
    setEditingId(product?.id ?? null);
    setErrors({});
    setEditorOpen(true);
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function save() {
    const nextErrors: Record<string, string> = {};
    if (draft.name.trim().length < 2) nextErrors.name = "Name is required.";
    if (draft.brand.trim().length < 2) nextErrors.brand = "Brand is required.";
    if (draft.tagline.trim().length < 4) nextErrors.tagline = "Add a short tagline.";
    if (draft.buyUrl && !/^https?:\/\//.test(draft.buyUrl))
      nextErrors.buyUrl = "Link must start with http(s)://";
    if (draft.price && Number.isNaN(Number(draft.price)))
      nextErrors.price = "Price must be a number.";
    if (draft.status === "upcoming" && !draft.expectedLaunch.trim())
      nextErrors.expectedLaunch = "Upcoming products need an expected launch window.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const specs = draft.specs
      .map((spec) => ({ label: spec.label.trim(), value: spec.value.trim() }))
      .filter((spec) => spec.label && spec.value);

    const payload = {
      name: draft.name.trim(),
      brand: draft.brand.trim(),
      category: draft.category.trim(),
      status: draft.status,
      tagline: draft.tagline.trim(),
      description: draft.description.trim() || draft.tagline.trim(),
      price: draft.price.trim() === "" ? null : Number(draft.price),
      priceNote: draft.priceNote.trim() || undefined,
      hue: Number(draft.hue) || 200,
      releasedOn: draft.status === "launched" ? draft.releasedOn.trim() || "Available now" : undefined,
      expectedLaunch: draft.status === "upcoming" ? draft.expectedLaunch.trim() : undefined,
      expectedDate: draft.status === "upcoming" ? draft.expectedDate.trim() || undefined : undefined,
      buyUrl: draft.buyUrl.trim() || "https://www.google.com/search?q=" + encodeURIComponent(draft.name),
      sourceLabel: draft.sourceLabel.trim() || "Added by admin",
      confidence: draft.confidence || undefined,
      badge: draft.badge.trim() || undefined,
      specs,
      highlights: draft.highlights
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      tags: draft.tags
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    };

    if (editingId) {
      updateProduct(editingId, payload);
    } else {
      addProduct(payload);
    }
    setEditorOpen(false);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">
            Admin dashboard
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-ink sm:text-4xl">Manage catalogue</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Create, edit and remove products across both sections. Changes are stored in this
            browser and appear on the storefront straight away.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:border-accent hover:text-accent"
          >
            View storefront
          </Link>
          <button
            type="button"
            onClick={() => openEditor()}
            className="btn-primary rounded-full px-5 py-2.5 text-sm font-bold"
          >
            + New product
          </button>
        </div>
      </div>

      {/* stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total products", value: stats.total, accent: false },
          { label: "Launched", value: stats.launched, accent: true },
          { label: "Upcoming", value: stats.upcoming, accent: true },
          { label: "Categories", value: stats.categories, accent: false },
        ].map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "rounded-3xl border bg-surface p-5",
              stat.accent ? "border-accent/40" : "border-line",
            )}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
              {stat.label}
            </p>
            <p className="mt-2 text-3xl font-extrabold text-ink">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* toolbar */}
      <div className="mt-8 flex flex-wrap items-center gap-3 rounded-3xl border border-line bg-surface p-3">
        <label className="relative min-w-56 flex-1">
          <span className="sr-only">Search catalogue</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, brand or category…"
            className="w-full rounded-2xl border border-line bg-surface-2 px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </label>
        <div className="flex gap-2">
          {(["all", "launched", "upcoming"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatus(value)}
              aria-pressed={status === value}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-semibold capitalize transition",
                status === value
                  ? "border-accent bg-accent text-bg"
                  : "border-line text-muted hover:text-ink",
              )}
            >
              {value}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Reset the catalogue back to the shipped seed data?")) {
              resetCatalog();
            }
          }}
          className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-muted transition hover:border-accent-2 hover:text-accent-2"
        >
          Reset catalogue
        </button>
      </div>

      {/* list */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-line">
        <div className="hidden grid-cols-[3rem_1.6fr_1fr_0.8fr_0.9fr_auto] gap-4 border-b border-line bg-surface-2 px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-muted md:grid">
          <span>#</span>
          <span>Product</span>
          <span>Category</span>
          <span>Status</span>
          <span>Price</span>
          <span className="text-right">Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-surface px-6 py-14 text-center">
            <p className="font-semibold text-ink">No products match that filter.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setStatus("all");
              }}
              className="mt-4 rounded-full border border-line px-5 py-2 text-sm font-semibold text-ink hover:border-accent"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <ul>
            {filtered.map((product, index) => (
              <li
                key={product.id}
                className="grid gap-4 border-b border-line bg-surface px-5 py-4 last:border-b-0 hover:bg-surface-2 md:grid-cols-[3rem_1.6fr_1fr_0.8fr_0.9fr_auto] md:items-center"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted md:hidden">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="hidden h-11 w-11 overflow-hidden rounded-xl border border-line md:block">
                    <ProductVisual product={product} />
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">
                    {product.brand} {product.name}
                  </p>
                  <p className="truncate text-xs text-muted">{product.tagline}</p>
                  <span className="font-mono text-[10px] text-muted/70">/{product.slug}</span>
                </div>

                <p className="text-sm text-muted">{product.category}</p>

                <span
                  className={cn(
                    "w-fit rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider",
                    product.status === "launched"
                      ? "bg-accent/15 text-accent"
                      : "bg-accent-2/15 text-accent-2",
                  )}
                >
                  {product.status}
                </span>

                <p className="font-semibold text-ink">
                  {formatPrice(product.price) ?? <span className="text-muted">TBA</span>}
                </p>

                <div className="flex gap-2 md:justify-end">
                  <button
                    type="button"
                    onClick={() => openEditor(product)}
                    className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold text-ink transition hover:border-accent hover:text-accent"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(product)}
                    className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold text-muted transition hover:border-accent-2 hover:text-accent-2"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-4 text-xs text-muted">
        {filtered.length} of {products.length} products shown · stored under{" "}
        <code className="text-ink">nextnova:catalog:v1</code>
      </p>

      {/* editor */}
      {editorOpen ? (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
          onClick={() => setEditorOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={editingId ? "Edit product" : "New product"}
        >
          <div
            className="scroll-thin h-full w-full max-w-2xl overflow-y-auto border-l border-line bg-elev"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-elev/95 px-6 py-4 backdrop-blur">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-accent">
                  {editingId ? "Edit product" : "New product"}
                </p>
                <h2 className="text-xl font-bold text-ink">
                  {editingId ? draft.name || "Untitled" : "Add to the catalogue"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                aria-label="Close editor"
                className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted hover:text-ink"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-5 px-6 py-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Name" value={draft.name} onChange={(v) => set("name", v)} error={errors.name} />
                <TextField label="Brand" value={draft.brand} onChange={(v) => set("brand", v)} error={errors.brand} />

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-muted">Category</span>
                  <input
                    list="category-options"
                    value={draft.category}
                    onChange={(event) => set("category", event.target.value)}
                    className="w-full rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
                  />
                  <datalist id="category-options">
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-muted">Section</span>
                  <select
                    value={draft.status}
                    onChange={(event) => set("status", event.target.value as FormState["status"])}
                    className="w-full rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
                  >
                    <option value="launched">Launched (buyable now)</option>
                    <option value="upcoming">Upcoming (announced)</option>
                  </select>
                </label>
              </div>

              <TextField label="Tagline" value={draft.tagline} onChange={(v) => set("tagline", v)} error={errors.tagline} />

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-muted">Description</span>
                <textarea
                  value={draft.description}
                  onChange={(event) => set("description", event.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-3">
                <TextField
                  label="Price (USD)"
                  value={draft.price}
                  onChange={(v) => set("price", v)}
                  error={errors.price}
                  placeholder="39990"
                />
                <TextField
                  label="Accent hue (0-360)"
                  value={draft.hue}
                  onChange={(v) => set("hue", v)}
                  placeholder="200"
                />
                <TextField
                  label="Badge"
                  value={draft.badge}
                  onChange={(v) => set("badge", v)}
                  placeholder="New"
                />
              </div>

              <TextField label="Price note" value={draft.priceNote} onChange={(v) => set("priceNote", v)} placeholder="Pro $2,800 · X $4,500" />

              <div className="grid gap-4 sm:grid-cols-2">
                {draft.status === "launched" ? (
                  <TextField
                    label="Release / availability"
                    value={draft.releasedOn}
                    onChange={(v) => set("releasedOn", v)}
                    placeholder="October 23, 2026"
                  />
                ) : (
                  <>
                    <TextField
                      label="Expected launch"
                      value={draft.expectedLaunch}
                      onChange={(v) => set("expectedLaunch", v)}
                      error={errors.expectedLaunch}
                      placeholder="Spring 2027"
                    />
                    <TextField
                      label="Expected date (ISO)"
                      value={draft.expectedDate}
                      onChange={(v) => set("expectedDate", v)}
                      placeholder="2027-04-01"
                    />
                  </>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Official link"
                  value={draft.buyUrl}
                  onChange={(v) => set("buyUrl", v)}
                  error={errors.buyUrl}
                  placeholder="https://…"
                />
                <TextField
                  label="Source label"
                  value={draft.sourceLabel}
                  onChange={(v) => set("sourceLabel", v)}
                  placeholder="tesla.com"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-muted">Confidence</span>
                  <select
                    value={draft.confidence}
                    onChange={(event) => set("confidence", event.target.value as FormState["confidence"])}
                    className="w-full rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
                  >
                    <option value="">Not shown</option>
                    <option value="official">Official announcement</option>
                    <option value="reported">Reported (unconfirmed)</option>
                  </select>
                </label>
                <TextField
                  label="Tags (comma separated)"
                  value={draft.tags}
                  onChange={(v) => set("tags", v)}
                  placeholder="robot, ai, research"
                />
              </div>

              {/* specs */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted">Specifications</span>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        specs: [...current.specs, { label: "", value: "" }],
                      }))
                    }
                    className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-ink hover:border-accent hover:text-accent"
                  >
                    + Add row
                  </button>
                </div>
                <div className="space-y-2">
                  {draft.specs.map((spec, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        value={spec.label}
                        placeholder="Label"
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            specs: current.specs.map((item, i) =>
                              i === index ? { ...item, label: event.target.value } : item,
                            ),
                          }))
                        }
                        className="w-1/3 rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                      />
                      <input
                        value={spec.value}
                        placeholder="Value"
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            specs: current.specs.map((item, i) =>
                              i === index ? { ...item, value: event.target.value } : item,
                            ),
                          }))
                        }
                        className="flex-1 rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                      />
                      <button
                        type="button"
                        aria-label={`Remove spec row ${index + 1}`}
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            specs: current.specs.filter((_, i) => i !== index),
                          }))
                        }
                        className="grid w-9 shrink-0 place-items-center rounded-xl border border-line text-muted hover:border-accent-2 hover:text-accent-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-muted">
                  Highlights (one per line)
                </span>
                <textarea
                  value={draft.highlights}
                  onChange={(event) => set("highlights", event.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
                />
              </label>

              {/* live preview */}
              <div className="rounded-3xl border border-line bg-surface p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
                  Preview
                </p>
                <div className="aspect-[16/6] w-full overflow-hidden rounded-2xl border border-line">
                  <ProductVisual
                    product={{
                      id: "preview",
                      slug: "preview",
                      name: draft.name || "Product name",
                      brand: draft.brand || "Brand",
                      category: draft.category,
                      status: draft.status,
                      tagline: draft.tagline,
                      description: draft.description,
                      price: draft.price ? Number(draft.price) : null,
                      hue: Number(draft.hue) || 200,
                      specs: draft.specs,
                      highlights: [],
                      buyUrl: draft.buyUrl,
                      sourceLabel: draft.sourceLabel,
                    }}
                    withTitle
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 flex gap-3 border-t border-line bg-elev/95 px-6 py-4 backdrop-blur">
              <button
                type="button"
                onClick={save}
                className="btn-primary flex-1 rounded-full px-6 py-3 text-sm font-bold"
              >
                {editingId ? "Save changes" : "Create product"}
              </button>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink hover:border-accent"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* delete confirm */}
      {pendingDelete ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-4 backdrop-blur-sm"
          onClick={() => setPendingDelete(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Confirm delete"
        >
          <div
            className="w-full max-w-md rounded-3xl border border-line bg-elev p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-ink">Delete this product?</h2>
            <p className="mt-2 text-sm text-muted">
              {pendingDelete.brand} {pendingDelete.name} will be removed from the storefront. You
              can restore the original catalogue with “Reset catalogue”.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  removeProduct(pendingDelete.id);
                  setPendingDelete(null);
                }}
                className="flex-1 rounded-full bg-accent-2 px-5 py-3 text-sm font-bold text-white"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="flex-1 rounded-full border border-line px-5 py-3 text-sm font-semibold text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  error,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}) {
  const id = `admin-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted">{label}</span>
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "w-full rounded-xl border bg-surface-2 px-4 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:outline-none",
          error ? "border-accent-2" : "border-line focus:border-accent",
        )}
      />
      {error ? <span className="mt-1 block text-xs font-semibold text-accent-2">{error}</span> : null}
    </label>
  );
}

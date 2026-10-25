"use client";

import { useEffect, useSyncExternalStore } from "react";
import { seedProducts } from "./seed-products";
import type { Product, ProductDraft } from "./types";
import { slugify } from "./utils";

const STORAGE_KEY = "nextnova:catalog:v1";

interface CatalogState {
  products: Product[];
  hydrated: boolean;
}

const state: CatalogState = { products: seedProducts, hydrated: false };
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => state.products;
const getServerSnapshot = () => seedProducts;

function hydrate() {
  if (typeof window === "undefined" || state.hydrated) return;
  state.hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        state.products = parsed as Product[];
      }
    }
  } catch {
    /* corrupted storage: fall back to the seed catalogue */
  }
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.products));
  } catch {
    /* storage full or unavailable — in-memory only */
  }
}

function commit(next: Product[]) {
  state.products = next;
  persist();
  emit();
}

/** Live catalogue: seed data on the server, localStorage overrides on the client. */
export function useProducts(): Product[] {
  const products = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => {
    hydrate();
    emit();
  }, []);
  return products;
}

/** Read without subscribing (safe during event handlers). */
export function getCatalog(): Product[] {
  return state.products;
}

export function addProduct(draft: ProductDraft): Product {
  const baseSlug = slugify(draft.slug || draft.name);
  const existing = getCatalog();
  let slug = baseSlug;
  let n = 2;
  while (existing.some((p) => p.slug === slug)) slug = `${baseSlug}-${n++}`;

  const product: Product = {
    ...draft,
    id: draft.id ?? `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    slug,
    specs: draft.specs ?? [],
    highlights: draft.highlights ?? [],
  };
  commit([product, ...existing]);
  return product;
}

export function updateProduct(id: string, patch: Partial<Product>): Product | null {
  let updated: Product | null = null;
  const next = getCatalog().map((p) => {
    if (p.id !== id) return p;
    updated = { ...p, ...patch };
    return updated;
  });
  if (updated) commit(next);
  return updated;
}

export function removeProduct(id: string) {
  commit(getCatalog().filter((p) => p.id !== id));
}

export function resetCatalog() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  state.products = seedProducts;
  emit();
}

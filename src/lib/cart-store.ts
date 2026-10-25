"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { Product } from "./types";

const STORAGE_KEY = "nextnova:cart:v1";
export const ORDERS_KEY = "nextnova:orders:v1";

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  hue: number;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  hydrated: boolean;
}

const state: CartState = { lines: [], hydrated: false };
const listeners = new Set<() => void>();

const EMPTY: CartLine[] = [];

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => state.lines;
const getServerSnapshot = () => EMPTY;

function hydrate() {
  if (typeof window === "undefined" || state.hydrated) return;
  state.hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) state.lines = parsed as CartLine[];
    }
  } catch {
    /* ignore corrupt cart */
  }
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines));
  } catch {
    /* storage unavailable */
  }
}

function commit(lines: CartLine[]) {
  state.lines = lines;
  persist();
  emit();
}

export function useCart(): CartLine[] {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => {
    hydrate();
    emit();
  }, []);
  return lines;
}

export function addToCart(product: Product) {
  hydrate();
  if (product.price === null || product.price === undefined) return false;
  const existing = state.lines.find((line) => line.productId === product.id);
  if (existing) {
    commit(
      state.lines.map((line) =>
        line.productId === product.id ? { ...line, qty: Math.min(line.qty + 1, 99) } : line,
      ),
    );
    return true;
  }
  commit([
    ...state.lines,
    {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      hue: product.hue,
      qty: 1,
    },
  ]);
  return true;
}

export function setQuantity(productId: string, qty: number) {
  hydrate();
  if (qty <= 0) {
    commit(state.lines.filter((line) => line.productId !== productId));
    return;
  }
  commit(
    state.lines.map((line) =>
      line.productId === productId ? { ...line, qty: Math.min(qty, 99) } : line,
    ),
  );
}

export function removeFromCart(productId: string) {
  hydrate();
  commit(state.lines.filter((line) => line.productId !== productId));
}

export function clearCart() {
  hydrate();
  commit([]);
}

export function cartCount(lines: CartLine[]) {
  return lines.reduce((total, line) => total + line.qty, 0);
}

export function cartSubtotal(lines: CartLine[]) {
  return lines.reduce((total, line) => total + line.qty * line.price, 0);
}

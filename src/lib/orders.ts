"use client";

import { useSyncExternalStore } from "react";

export const ORDERS_KEY = "nextnova:orders:v1";

export interface StoredOrder {
  id: string;
  createdAt: string;
  status: string;
  items: {
    productId: string;
    slug: string;
    name: string;
    brand: string;
    price: number;
    qty: number;
  }[];
  totals: { subtotal: number; tax: number; total: number };
  customer: { name: string; email: string; phone: string; address: string };
  payment: { last4: string };
}

const EMPTY: StoredOrder[] = [];
let orders: StoredOrder[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) orders = parsed as StoredOrder[];
  } catch {
    orders = EMPTY;
  }
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => {
  hydrate();
  return orders;
};

const getServerSnapshot = () => EMPTY;

/** Orders stored in this browser. Server renders an empty list. */
export function useOrders(): StoredOrder[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function saveOrder(order: StoredOrder) {
  hydrate();
  orders = [order, ...orders];
  try {
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {
    /* storage unavailable — the order still exists for this session */
  }
  for (const listener of listeners) listener();
}

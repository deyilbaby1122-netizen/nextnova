"use client";

import { useSyncExternalStore } from "react";

export const MAX_COMPARE = 3;

const EMPTY: string[] = [];
let selected: string[] = EMPTY;
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

const getSnapshot = () => selected;

export function useCompareIds(): string[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

/**
 * Returns true when the product was added, false when it was removed.
 * Selecting beyond MAX_COMPARE is rejected so the UI can explain why.
 */
export function toggleCompare(id: string): boolean {
  if (selected.includes(id)) {
    selected = selected.filter((item) => item !== id);
    emit();
    return false;
  }
  if (selected.length >= MAX_COMPARE) return false;
  selected = [...selected, id];
  emit();
  return true;
}

export function removeCompare(id: string) {
  selected = selected.filter((item) => item !== id);
  emit();
}

export function clearCompare() {
  selected = EMPTY;
  emit();
}

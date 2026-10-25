"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "nextnova:theme";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readDark() {
  if (typeof document === "undefined") return true;
  return document.documentElement.classList.contains("dark");
}

function notify() {
  for (const listener of listeners) listener();
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const dark = useSyncExternalStore(subscribe, readDark, () => true);

  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      /* ignore */
    }
    notify();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light theme" : "Dark theme"}
      className={`group relative inline-flex h-10 w-[4.5rem] items-center rounded-full border border-line bg-surface-2 p-1 transition-colors hover:border-accent/60 ${className}`}
    >
      <span
        className="absolute h-8 w-8 rounded-full bg-gradient-to-br from-accent to-accent-2 shadow-lg transition-transform duration-300 ease-out"
        style={{ transform: dark ? "translateX(0)" : "translateX(2.1rem)" }}
      />
      <span className="relative z-10 flex w-full items-center justify-between px-1.5 text-[13px]">
        <span aria-hidden className={dark ? "text-bg" : "text-muted"}>
          🌙
        </span>
        <span aria-hidden className={!dark ? "text-bg" : "text-muted"}>
          ☀️
        </span>
      </span>
    </button>
  );
}

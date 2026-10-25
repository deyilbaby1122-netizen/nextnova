"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cartCount, useCart } from "@/lib/cart-store";
import { useProducts } from "@/lib/store";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const products = useProducts();
  const cartItems = cartCount(useCart());

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) setOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const counts = {
    launched: products.filter((p) => p.status === "launched").length,
    upcoming: products.filter((p) => p.status === "upcoming").length,
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3" aria-label="NextNova home">
          <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-accent to-accent-2 text-sm font-black text-bg shadow-[0_10px_30px_-12px_var(--accent)]">
            N
            <span className="absolute inset-0 rounded-xl ring-1 ring-white/30" />
          </span>
          <span className="leading-none">
            <span className="block text-lg font-extrabold tracking-[0.2em] text-ink">NEXTNOVA</span>
            <span className="block text-[10px] uppercase tracking-[0.32em] text-muted">
              Future tech marketplace
            </span>
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Main">
          <NavLink href="/#launched" onClick={() => setOpen(false)}>
            Launched <Count value={counts.launched} />
          </NavLink>
          <NavLink href="/#upcoming" onClick={() => setOpen(false)}>
            Upcoming <Count value={counts.upcoming} />
          </NavLink>
          <NavLink href="/admin" onClick={() => setOpen(false)}>
            Admin
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/#launched"
            className="hidden rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink transition hover:border-accent hover:text-accent sm:inline-flex"
          >
            Browse
          </Link>
          <Link
            href="/admin"
            className="btn-primary hidden rounded-full px-4 py-2 text-xs font-bold sm:inline-flex"
          >
            Manage products
          </Link>
          <ThemeToggle />
          <Link
            href="/cart"
            aria-label={`Cart with ${cartItems} item${cartItems === 1 ? "" : "s"}`}
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-line text-ink transition hover:border-accent hover:text-accent"
          >
            <span aria-hidden className="text-base leading-none">🛒</span>
            {cartItems > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-bg">
                {cartItems}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label="Toggle navigation menu"
            className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink md:hidden"
          >
            <span className="text-lg leading-none">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      <div className={cn("border-t border-line bg-elev md:hidden", open ? "block" : "hidden")}>
        <nav className="mx-auto grid max-w-7xl gap-1 px-4 py-3" aria-label="Mobile">
          <MobileLink href="/#launched" onClick={() => setOpen(false)}>
            Launched products ({counts.launched})
          </MobileLink>
          <MobileLink href="/#upcoming" onClick={() => setOpen(false)}>
            Upcoming launches ({counts.upcoming})
          </MobileLink>
          <MobileLink href="/cart" onClick={() => setOpen(false)}>
            Cart ({cartItems})
          </MobileLink>
          <MobileLink href="/admin" onClick={() => setOpen(false)}>
            Admin dashboard
          </MobileLink>
        </nav>
      </div>
    </header>
  );
}

function Count({ value }: { value: number }) {
  return (
    <span className="ml-1.5 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-bold text-muted">
      {value}
    </span>
  );
}

function NavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-full px-4 py-2 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-ink"
    >
      {children}
    </Link>
  );
}

function MobileLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-xl px-3 py-3 text-sm font-semibold text-ink hover:bg-surface-2"
    >
      {children}
    </Link>
  );
}

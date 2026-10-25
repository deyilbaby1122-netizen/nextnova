import Link from "next/link";

// Evaluated once at build time so prerendering stays deterministic.
const YEAR = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-elev">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-sm font-black text-bg">
                N
              </span>
              <span className="text-base font-extrabold tracking-[0.2em] text-ink">NEXTNOVA</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              A futuristic marketplace cataloguing real, already-released AI hardware alongside
              officially announced future launches. Every price and specification links back to
              the vendor&apos;s own page.
            </p>
          </div>

          <FooterColumn
            title="Marketplace"
            links={[
              { href: "/#launched", label: "Launched products" },
              { href: "/#upcoming", label: "Upcoming launches" },
              { href: "/admin", label: "Admin dashboard" },
            ]}
          />
          <FooterColumn
            title="Categories"
            links={[
              { href: "/#launched", label: "AI cars & robots" },
              { href: "/#launched", label: "Smart glasses" },
              { href: "/#launched", label: "AI machines" },
            ]}
          />
          <FooterColumn
            title="Product pages"
            links={[
              { href: "/products/tesla-model-y-2026", label: "Tesla Model Y" },
              { href: "/products/tesla-optimus-gen-3", label: "Tesla Optimus" },
              { href: "/products/meta-ray-ban-display", label: "Ray-Ban Display" },
            ]}
          />
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {YEAR} NextNova. Product data sourced from official vendor pages.</p>
          <p className="flex items-center gap-3">
            <Link href="/#launched" className="hover:text-accent">
              Launched
            </Link>
            <Link href="/#upcoming" className="hover:text-accent">
              Upcoming
            </Link>
            <Link href="/admin" className="hover:text-accent">
              Admin
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <nav aria-label={title}>
      <h3 className="text-xs font-bold uppercase tracking-[0.24em] text-ink">{title}</h3>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="text-muted transition hover:text-accent">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

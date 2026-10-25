import Link from "next/link";
import { ProductVisual } from "@/components/product-visual";
import { Reveal } from "@/components/reveal";
import { seedProducts } from "@/lib/seed-products";

const launchedCount = seedProducts.filter((p) => p.status === "launched").length;
const upcomingCount = seedProducts.filter((p) => p.status === "upcoming").length;
const categoryCount = new Set(seedProducts.map((p) => p.category)).size;

const floating = [
  seedProducts.find((p) => p.slug === "tesla-model-y-2026"),
  seedProducts.find((p) => p.slug === "unitree-g1"),
  seedProducts.find((p) => p.slug === "meta-ray-ban-display"),
].filter(Boolean);

const ticker = [
  "AI Cars",
  "Humanoid Robots",
  "Robot Dogs",
  "Smart Glasses",
  "AR / VR",
  "AI Machines",
  "Drones",
  "Wearables",
  "Smartphones",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div aria-hidden className="aurora absolute inset-0" />
      <div aria-hidden className="grid-bg absolute inset-0" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-24">
        <div>
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-surface/70 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-accent">
              <span className="h-2 w-2 animate-pulse-glow rounded-full bg-accent" />
              {launchedCount} live products · {upcomingCount} announced launches
            </p>
          </Reveal>

          <Reveal delay={90}>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl xl:text-7xl">
              The marketplace
              <span className="block bg-gradient-to-r from-accent via-accent-2 to-accent bg-clip-text text-transparent">
                for tomorrow&apos;s hardware.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              NextNova tracks two things: technology you can <strong className="text-ink">buy
              today</strong> — AI cars, humanoid robots, smart gadgets — and technology that has
              been <strong className="text-ink">officially announced</strong> for launch. Prices,
              specifications and dates are sourced from the vendors themselves.
            </p>
          </Reveal>

          <Reveal delay={230}>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#launched" className="btn-primary rounded-full px-7 py-3.5 text-sm font-bold">
                Browse launched products
              </a>
              <a
                href="#upcoming"
                className="rounded-full border border-line px-7 py-3.5 text-sm font-bold text-ink transition hover:border-accent hover:text-accent"
              >
                See upcoming launches
              </a>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <dl className="mt-12 grid max-w-lg grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { value: `${launchedCount}`, label: "In stock" },
                { value: `${upcomingCount}`, label: "Announced" },
                { value: `${categoryCount}`, label: "Categories" },
                { value: "100%", label: "Vendor sourced" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-line bg-surface/70 p-4">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 text-2xl font-extrabold text-ink">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* floating 3D stack */}
        <div className="scene relative min-h-[380px] lg:min-h-[520px]">
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/30 animate-spin-slow" />
          <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-2/30 animate-spin-slow" style={{ animationDirection: "reverse" }} />

          <div className="absolute left-0 top-4 w-[62%] animate-float sm:left-4">
            <FloatCard product={floating[0]} rotate={-6} delay="0s" />
          </div>
          <div className="absolute right-0 top-32 w-[54%] animate-float sm:right-2" style={{ animationDelay: "1.6s" }}>
            <FloatCard product={floating[1]} rotate={7} delay="1.2s" />
          </div>
          <div className="absolute bottom-2 left-[16%] w-[58%] animate-float" style={{ animationDelay: "3.1s" }}>
            <FloatCard product={floating[2]} rotate={-3} delay="2.4s" />
          </div>
        </div>
      </div>

      {/* category ticker */}
      <div className="relative overflow-hidden border-t border-line bg-elev/70 py-3">
        <div className="animate-ticker flex w-max gap-10 whitespace-nowrap text-xs font-bold uppercase tracking-[0.3em] text-muted">
          {[...ticker, ...ticker].map((item, index) => (
            <span key={`${item}-${index}`} className="flex items-center gap-4">
              {item} <span className="text-accent">◆</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function FloatCard({
  product,
  rotate,
  delay,
}: {
  product: (typeof seedProducts)[number] | undefined;
  rotate: number;
  delay: string;
}) {
  if (!product) return null;
  return (
    <Link
      href={`/products/${product.slug}`}
      className="tilt block overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_40px_80px_-45px_rgba(0,0,0,0.95)] transition hover:border-accent/60"
      style={{ transform: `rotate(${rotate}deg)`, animationDelay: delay }}
    >
      <div className="aspect-[4/3] w-full">
        <ProductVisual product={product} />
      </div>
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-ink">{product.name}</p>
          <p className="truncate text-[11px] text-muted">{product.brand}</p>
        </div>
        <span className="shrink-0 rounded-full bg-surface-2 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
          {product.status}
        </span>
      </div>
    </Link>
  );
}

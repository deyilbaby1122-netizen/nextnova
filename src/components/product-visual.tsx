import type { Product } from "@/lib/types";

const GLYPHS: Record<string, React.ReactNode> = {
  "AI Cars": (
    <>
      <path d="M3 13l2-5a2 2 0 012-1h10a2 2 0 012 1l2 5" />
      <rect x="2.5" y="13" width="19" height="5" rx="1.5" />
      <path d="M6 12.5h12" />
      <circle cx="7" cy="18.5" r="2" />
      <circle cx="17" cy="18.5" r="2" />
    </>
  ),
  "Humanoid Robots": (
    <>
      <circle cx="12" cy="4.5" r="2.5" />
      <path d="M12 7.5v6.5M12 14l-3.5 6M12 14l3.5 6M6.5 9.5L12 8l5.5 1.5" />
    </>
  ),
  "Robot Dogs": (
    <>
      <rect x="3.5" y="8" width="12" height="6" rx="2" />
      <path d="M15.5 10l4-2.5v6l-4-2" />
      <path d="M6 14v4.5M9 14v4.5M12.5 14v4.5M15 14v4.5" />
    </>
  ),
  Drones: (
    <>
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="18" r="3" />
      <path d="M8.2 8.2l7.6 7.6M15.8 8.2l-7.6 7.6" />
      <rect x="10" y="10" width="4" height="4" rx="1.2" />
    </>
  ),
  "AI Machines": (
    <>
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <rect x="10.5" y="10.5" width="3" height="3" rx="0.5" />
      <path d="M10 7V4M14 7V4M10 20v-3M14 20v-3M7 10H4M7 14H4M20 10h-3M20 14h-3" />
    </>
  ),
  "Smart Glasses": (
    <>
      <circle cx="6.5" cy="13.5" r="3.5" />
      <circle cx="17.5" cy="13.5" r="3.5" />
      <path d="M10 13h4M3 11.5l1.5-4.5M21 11.5l-1.5-4.5" />
    </>
  ),
  "AR/VR Headsets": (
    <>
      <rect x="3" y="8.5" width="18" height="9" rx="3.5" />
      <path d="M6 8.5a6 6 0 0112 0" />
      <circle cx="8.5" cy="13" r="1.6" />
      <circle cx="15.5" cy="13" r="1.6" />
    </>
  ),
  Smartphones: (
    <>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
      <path d="M10.5 5.5h3M10.5 18.5h3" />
    </>
  ),
  Wearables: (
    <>
      <circle cx="12" cy="12" r="5.5" />
      <path d="M9 6.6L9.4 2.6h5.2l.4 4M9 17.4l.4 4h5.2l.4-4" />
    </>
  ),
};

function glyphFor(category: string) {
  return GLYPHS[category] ?? GLYPHS["AI Machines"];
}

interface ProductVisualProps {
  product: Product;
  className?: string;
  /** Renders the product name inside the artwork (used on detail pages). */
  withTitle?: boolean;
}

/**
 * Deterministic artwork for a product: a gradient scene, a blueprint grid and
 * a line-art glyph for the category. Generated locally so the marketplace has
 * zero image payload and never hot-links third party assets.
 */
export function ProductVisual({ product, className = "", withTitle = false }: ProductVisualProps) {
  const hue = product.hue ?? 210;
  const id = product.id.replace(/[^a-zA-Z0-9_-]/g, "");
  const grad = `g-${id}`;
  const glow = `glow-${id}`;
  const grid = `grid-${id}`;

  return (
    <svg
      viewBox="0 0 400 300"
      role="img"
      aria-label={`${product.brand} ${product.name} artwork`}
      className={`h-full w-full ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={`hsl(${hue} 78% 55%)`} />
          <stop offset="55%" stopColor={`hsl(${(hue + 22) % 360} 62% 34%)`} />
          <stop offset="100%" stopColor={`hsl(${(hue + 45) % 360} 55% 14%)`} />
        </linearGradient>
        <radialGradient id={glow} cx="72%" cy="24%" r="60%">
          <stop offset="0%" stopColor={`hsl(${hue} 95% 85%)`} stopOpacity="0.75" />
          <stop offset="100%" stopColor={`hsl(${hue} 95% 85%)`} stopOpacity="0" />
        </radialGradient>
        <pattern id={grid} width="26" height="26" patternUnits="userSpaceOnUse">
          <path d="M26 0H0V26" fill="none" stroke="#fff" strokeOpacity="0.14" strokeWidth="1" />
        </pattern>
      </defs>

      <rect width="400" height="300" fill={`url(#${grad})`} />
      <rect width="400" height="300" fill={`url(#${grid})`} />
      <rect width="400" height="300" fill={`url(#${glow})`} />

      <g
        transform="translate(128 46) scale(8.6)"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.4"
        strokeWidth={0.16}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {glyphFor(product.category)}
      </g>

      <circle
        className="animate-float-slow"
        cx="330"
        cy="215"
        r="70"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.25"
        strokeWidth="1.5"
      />
      <circle
        className="animate-pulse-glow"
        cx="66"
        cy="70"
        r="6"
        fill="#fff"
        fillOpacity="0.85"
      />
      <circle cx="352" cy="76" r="3" fill="#fff" fillOpacity="0.5" />

      <g fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">
        <text x="24" y="34" fill="#fff" fillOpacity="0.9" fontSize="15" letterSpacing="3.2">
          {product.brand.toUpperCase()}
        </text>
        <text x="24" y="52" fill="#fff" fillOpacity="0.6" fontSize="11" letterSpacing="2">
          {product.category.toUpperCase()}
        </text>
        {withTitle ? (
          <text x="24" y="276" fill="#fff" fontSize="30" fontWeight="700">
            {product.name}
          </text>
        ) : null}
      </g>

      {product.status === "upcoming" ? (
        <g transform="translate(300 18)">
          <rect width="80" height="24" rx="12" fill="#05070f" fillOpacity="0.55" />
          <text
            x="40"
            y="16"
            textAnchor="middle"
            fill="#fff"
            fontSize="11"
            letterSpacing="1.4"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          >
            SOON
          </text>
        </g>
      ) : null}
    </svg>
  );
}

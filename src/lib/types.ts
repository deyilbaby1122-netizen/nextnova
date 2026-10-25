export type ProductStatus = "launched" | "upcoming";

/** Whether the announcement came from the company itself or from reporting. */
export type Confidence = "official" | "reported";

export interface Spec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  status: ProductStatus;
  tagline: string;
  description: string;
  /** Starting price in USD. `null` when the vendor does not publish one. */
  price: number | null;
  /** Extra pricing context, e.g. "Pro $2,800 · X $4,500" or an expected price. */
  priceNote?: string;
  /** Hue (0-360) used to render the generated product artwork. */
  hue: number;
  /**
   * Official / press photograph of the product, hot-linked from the vendor or
   * its newsroom. When absent (or blocked by the host) the generated artwork
   * is shown instead.
   */
  image?: string;
  /** Accessible description for `image`. Defaults to "brand + name". */
  imageAlt?: string;
  /** CSS object-position for `image`, e.g. "50% 15%" for tall photos. */
  imagePosition?: string;
  specs: Spec[];
  highlights: string[];
  /** Official purchase / product page. */
  buyUrl: string;
  /** Where the data comes from, shown on the card. */
  sourceLabel: string;
  /** Human readable release date for launched products. */
  releasedOn?: string;
  /** Human readable expected launch window for upcoming products. */
  expectedLaunch?: string;
  /** ISO date used for sorting / countdowns. */
  expectedDate?: string;
  confidence?: Confidence;
  badge?: string;
  featured?: boolean;
  tags?: string[];
}

export type ProductDraft = Omit<Product, "id" | "slug"> & {
  id?: string;
  slug?: string;
};

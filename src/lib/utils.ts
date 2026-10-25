export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function formatPrice(value: number | null | undefined) {
  if (value === null || value === undefined) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function daysUntil(iso?: string) {
  if (!iso) return null;
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return null;
  return Math.ceil((target - Date.now()) / 86_400_000);
}

export function matchesQuery(product: {
  name: string;
  brand: string;
  category: string;
  tagline: string;
  description: string;
  tags?: string[];
}, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    product.name,
    product.brand,
    product.category,
    product.tagline,
    product.description,
    ...(product.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();
  return q.split(/\s+/).every((token) => haystack.includes(token));
}

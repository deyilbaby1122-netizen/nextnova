import type { MetadataRoute } from "next";
import { seedProducts } from "@/lib/seed-products";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const productRoutes: MetadataRoute.Sitemap = seedProducts.map((product) => ({
    url: `${siteUrl}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: product.status === "launched" ? 0.9 : 0.7,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...productRoutes,
  ];
}

import type { Metadata } from "next";
import { ProductDetail } from "@/components/product-detail";
import { seedProducts } from "@/lib/seed-products";
import { siteUrl } from "@/lib/site";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return seedProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = seedProducts.find((item) => item.slug === slug);

  if (!product) {
    return {
      title: "Product not found",
      robots: { index: false },
    };
  }

  const description = `${product.brand} ${product.name} — ${product.tagline} ${
    product.price !== null
      ? `From $${product.price.toLocaleString("en-US")}.`
      : `Expected launch: ${product.expectedLaunch ?? "to be announced"}.`
  } Specifications and official link.`;

  return {
    title: `${product.brand} ${product.name}`,
    description,
    keywords: [product.brand, product.name, product.category, ...(product.tags ?? [])],
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${product.brand} ${product.name} · NextNova`,
      description,
      url: `${siteUrl}/products/${product.slug}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.brand} ${product.name} · NextNova`,
      description,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = seedProducts.find((item) => item.slug === slug) ?? null;

  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: `${product.brand} ${product.name}`,
        description: `${product.tagline} ${product.description}`,
        brand: { "@type": "Brand", name: product.brand },
        category: product.category,
        url: `${siteUrl}/products/${product.slug}`,
        ...(product.price !== null
          ? {
              offers: {
                "@type": "Offer",
                price: product.price,
                priceCurrency: "USD",
                url: product.buyUrl,
                availability:
                  product.status === "launched"
                    ? "https://schema.org/InStock"
                    : "https://schema.org/PreOrder",
              },
            }
          : {}),
        ...(product.expectedLaunch
          ? { releaseDate: product.expectedDate ?? product.expectedLaunch }
          : {}),
      }
    : null;

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      ) : null}
      <ProductDetail slug={slug} seedProduct={product} />
    </>
  );
}

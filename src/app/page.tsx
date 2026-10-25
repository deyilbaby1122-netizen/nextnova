import { Hero } from "@/components/hero";
import { Marketplace } from "@/components/marketplace";
import { Reveal } from "@/components/reveal";
import { seedProducts } from "@/lib/seed-products";
import { siteUrl } from "@/lib/site";

export default function HomePage() {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "NextNova",
    url: siteUrl,
    description:
      "Technology marketplace listing released AI hardware and officially announced upcoming launches.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const catalogJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "NextNova product catalogue",
    numberOfItems: seedProducts.length,
    itemListElement: seedProducts.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: `${product.brand} ${product.name}`,
        category: product.category,
        description: product.tagline,
        brand: { "@type": "Brand", name: product.brand },
        url: `${siteUrl}/products/${product.slug}`,
        ...(product.price !== null
          ? { offers: { "@type": "Offer", price: product.price, priceCurrency: "USD", availability: "https://schema.org/InStock" } }
          : { description: `${product.tagline} Expected launch: ${product.expectedLaunch ?? "to be announced"}` }),
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogJsonLd).replace(/</g, "\\u003c") }}
      />

      <Hero />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Launched products",
              body: "Everything here is on sale right now. Prices, core specifications and a link to the vendor's own store — no guesswork, no affiliate markup.",
            },
            {
              step: "02",
              title: "Upcoming launches",
              body: "Announced hardware with an expected launch window. Anything the vendor has not confirmed is labelled as reported so you always know how solid the date is.",
            },
            {
              step: "03",
              title: "Compare before you commit",
              body: "Pick up to three products and inspect them side by side: price, release status, source and every specification that matters.",
            },
          ].map((item, index) => (
            <Reveal key={item.step} delay={index * 90}>
              <article className="h-full rounded-3xl border border-line bg-surface p-6">
                <p className="font-mono text-sm font-bold text-accent">{item.step}</p>
                <h2 className="mt-3 text-lg font-bold text-ink">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-16">
          <Marketplace />
        </div>
      </div>
    </>
  );
}

import type { Product } from "./types";

/** Compact product shape the assistant reasons over. */
export type ChatProduct = Pick<
  Product,
  "slug" | "name" | "brand" | "category" | "status" | "price" | "tagline"
> &
  Partial<Pick<Product, "priceNote" | "expectedLaunch" | "buyUrl" | "tags">>;

export interface ChatAnswer {
  reply: string;
  slugs: string[];
}

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "do", "does", "can", "could", "i", "you", "it", "of", "for",
  "to", "in", "on", "my", "me", "what", "which", "and", "or", "with", "how", "much", "many",
]);

function tokens(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9$\s.-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

function scoreProduct(product: ChatProduct, words: string[]) {
  const haystack = [
    product.name,
    product.brand,
    product.category,
    product.tagline,
    ...(product.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;
  for (const word of words) {
    const clean = word.replace(/[$]/g, "");
    if (!clean) continue;
    if (product.name.toLowerCase().includes(clean)) score += 5;
    if (product.brand.toLowerCase().includes(clean)) score += 4;
    if (product.category.toLowerCase().includes(clean)) score += 3;
    if (haystack.includes(clean)) score += 2;
  }
  return score;
}

function rank(products: ChatProduct[], words: string[], limit = 4) {
  return products
    .map((product) => ({ product, score: scoreProduct(product, words) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.product);
}

function money(value: number | null) {
  if (value === null) return "price TBA";
  return `$${value.toLocaleString("en-US")}`;
}

function bulletList(items: string[]) {
  return items.map((item) => `• ${item}`).join("\n");
}

function describe(product: ChatProduct) {
  const line = [
    `${product.brand} ${product.name} (${product.category}) — ${money(product.price)}`,
    product.priceNote ? `Pricing note: ${product.priceNote}` : "",
    product.status === "upcoming"
      ? `Expected launch: ${product.expectedLaunch ?? "to be announced"}`
      : "Status: available now",
    product.tagline,
  ]
    .filter(Boolean)
    .join("\n");
  return line;
}

function parseBudget(words: string[]) {
  for (const word of words) {
    const match = word.match(/^\$?(\d{2,6})k?$/i);
    if (match) {
      const value = Number(match[1]) * (word.toLowerCase().endsWith("k") ? 1000 : 1);
      if (value >= 100) return value;
    }
  }
  const joined = words.join(" ");
  const phrase = joined.match(/under\s+\$?(\d{2,6})/);
  if (phrase) return Number(phrase[1]);
  return null;
}

export function respondTo(rawMessage: string, products: ChatProduct[]): ChatAnswer {
  const message = rawMessage.trim();
  const lower = message.toLowerCase();
  const words = tokens(message);

  if (!message) {
    return {
      reply:
        "Ask me anything about this marketplace — try “which robots can I buy today?”, “what launches in 2027?” or “compare the Vision Pro and Ray-Ban Display”.",
      slugs: [],
    };
  }

  /* greetings & capability questions --------------------------------- */
  if (/^(hi|hey|hello|yo|salam|assalam)/.test(lower) || words.length <= 1) {
    return {
      reply:
        "Hey — I'm the NextNova assistant. I know every product in this catalogue: real, released AI hardware and the officially announced launches still to come.\n\nTry one of these:\n" +
        bulletList([
          "What can I buy under $500?",
          "Which humanoid robots are available?",
          "What is launching in 2027?",
          "Compare Vision Pro and Ray-Ban Display",
          "How does checkout work?",
        ]),
      slugs: [],
    };
  }

  if (/(what can you|help|how do you work|capabilities|who are you)/.test(lower)) {
    return {
      reply:
        "I'm the NextNova catalogue assistant, built into this site. I can:\n" +
        bulletList([
          "Find products by category, brand or budget",
          "Explain what is available today vs. still upcoming",
          "Give prices, specs and expected launch windows",
          "Compare two or more products side by side",
          "Walk you through buying and the admin dashboard",
        ]) +
        "\nI answer from this site's data — every figure links back to the vendor's own page.",
      slugs: [],
    };
  }

  /* buying / checkout ------------------------------------------------- */
  if (/(buy|purchase|order|checkout|cart|pay|shipping|delivery)/.test(lower) && words.length <= 6) {
    const wanted = rank(products, words.filter((word) => !/(buy|cart|order|pay|checkout)/.test(word)), 3);
    return {
      reply:
        "To buy on NextNova:\n" +
        bulletList([
          "Open a launched product and press “Add to cart” (or “Buy now”)",
          "Review quantities on the cart page",
          "Fill in contact, shipping and payment details at checkout",
          "You get an order confirmation with an order number",
        ]) +
        "\nUpcoming products can't be bought yet — their official announcement page is linked instead." +
        (wanted.length
          ? `\n\nPopular right now:\n${bulletList(wanted.map((p) => `${p.brand} ${p.name} — ${money(p.price)}`))}`
          : ""),
      slugs: wanted.map((p) => p.slug),
    };
  }

  /* admin ------------------------------------------------------------- */
  if (/(admin|dashboard|manage|add a product|edit product|delete)/.test(lower)) {
    return {
      reply:
        "The admin dashboard lives at /admin. From there you can:\n" +
        bulletList([
          "Create new launched or upcoming products",
          "Edit price, specs, links, launch dates and categories",
          "Delete or restore catalogue entries",
          "See live counts by status and category",
        ]) +
        "\nChanges are saved in your browser and show up on the storefront immediately.",
      slugs: [],
    };
  }

  /* comparing two named products -------------------------------------- */
  if (/(compare|vs\.?|versus|difference between|better)/.test(lower)) {
    const matches = rank(products, words, 3);
    if (matches.length >= 2) {
      const [a, b] = matches;
      const lines = matches.map((product) => describe(product));
      const cheaper =
        a.price !== null && b.price !== null
          ? a.price < b.price
            ? `${a.name} is cheaper by ${money(b.price - a.price)}`
            : b.price < a.price
              ? `${b.name} is cheaper by ${money(a.price - b.price)}`
              : "Both cost the same"
          : "Pricing is not fully announced yet";
      return {
        reply:
          `Here's the head-to-head:\n\n${lines.join("\n\n")}\n\n${cheaper}.\n\nOpen either product page and use “Add to comparison” to see every specification in one table.`,
        slugs: matches.map((p) => p.slug),
      };
    }
    return {
      reply:
        "Tell me which two products to compare — for example “compare Apple Vision Pro and Ray-Ban Display”. You can also tick “Compare” on up to three cards in the marketplace.",
      slugs: [],
    };
  }

  /* upcoming / launch dates ------------------------------------------- */
  if (/(upcoming|coming soon|launch|release|when|announced|future|2027|2028|next year)/.test(lower)) {
    const upcoming = products
      .filter((product) => product.status === "upcoming")
      .sort((a, b) => (a.expectedLaunch ?? "").localeCompare(b.expectedLaunch ?? ""));

    if (upcoming.length) {
      const wanted = rank(upcoming, words, 5);
      const list = (wanted.length >= 2 ? wanted : upcoming).slice(0, 5);
      return {
        reply:
          "Upcoming launches on NextNova:\n" +
          bulletList(
            list.map(
              (product) =>
                `${product.brand} ${product.name} — ${product.expectedLaunch ?? "TBA"} (${
                  product.priceNote ?? "price TBA"
                })`,
            ),
          ) +
          "\nAnything marked “reported” is press information, not a vendor confirmation.",
        slugs: list.map((p) => p.slug),
      };
    }
  }

  /* budget ------------------------------------------------------------- */
  const budget = parseBudget(words);
  if (budget || /(cheap|budget|affordable|under|less than|cost)/.test(lower)) {
    const limit = budget ?? 500;
    const affordable = products
      .filter((product) => product.status === "launched" && (product.price ?? Infinity) <= limit)
      .sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
      .slice(0, 5);

    if (affordable.length) {
      return {
        reply:
          `Here's what you can get for under ${money(limit)}:\n` +
          bulletList(affordable.map((p) => `${p.brand} ${p.name} — ${money(p.price)}`)) +
          "\nTap a product below for the full specification sheet.",
        slugs: affordable.map((p) => p.slug),
      };
    }
    return {
      reply: `Nothing in the catalogue is listed under ${money(limit)} yet. Raise the budget a little — try “under $2000”.`,
      slugs: [],
    };
  }

  /* price extremes ----------------------------------------------------- */
  if (/(expensive|most costly|pricey|top end|flagship)/.test(lower)) {
    const sorted = [...products]
      .filter((product) => product.price !== null)
      .sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
      .slice(0, 3);
    return {
      reply:
        `The priciest hardware in the catalogue:\n${bulletList(
          sorted.map((p) => `${p.brand} ${p.name} — ${money(p.price)}`),
        )}`,
      slugs: sorted.map((p) => p.slug),
    };
  }

  if (/(cheap|cheapest|affordable|lowest)/.test(lower)) {
    const sorted = [...products]
      .filter((product) => product.price !== null && product.status === "launched")
      .sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
      .slice(0, 3);
    return {
      reply:
        `The most affordable ways in:\n${bulletList(
          sorted.map((p) => `${p.brand} ${p.name} — ${money(p.price)}`),
        )}`,
      slugs: sorted.map((p) => p.slug),
    };
  }

  /* category matches --------------------------------------------------- */
  const categoryMatch = products.find((product) =>
    product.category.toLowerCase().split(/\s+/).some((word) => words.includes(word)),
  );
  const wantsCategory =
    categoryMatch &&
    (/(category|categories|show|list|give|which|any|do you have|kind of|type of)/.test(lower) ||
      words.length <= 3);

  if (categoryMatch && wantsCategory) {
    const list = products
      .filter((product) => product.category === categoryMatch.category)
      .slice(0, 6);
    return {
      reply:
        `${list.length} ${categoryMatch.category.toLowerCase()} in the catalogue:\n` +
        bulletList(
          list.map(
            (product) =>
              `${product.brand} ${product.name} — ${money(product.price)}${
                product.status === "upcoming"
                  ? ` (launches ${product.expectedLaunch ?? "TBA"})`
                  : ""
              }`,
          ),
        ),
      slugs: list.map((p) => p.slug),
    };
  }

  /* product-level answers ---------------------------------------------- */
  const matches = rank(products, words, 3);
  if (matches.length > 0) {
    const primary = matches[0];
    return {
      reply:
        `Here's what I know about ${primary.brand} ${primary.name}:\n\n${describe(primary)}\n\n${
          primary.buyUrl ? `Official page: ${primary.buyUrl}` : ""
        }` +
        (matches.length > 1
          ? `\n\nRelated:\n${bulletList(
              matches.slice(1).map((p) => `${p.brand} ${p.name} — ${money(p.price)}`),
            )}`
          : ""),
      slugs: matches.map((p) => p.slug),
    };
  }

  /* fallback ------------------------------------------------------------ */
  const categories = Array.from(new Set(products.map((product) => product.category))).sort();
  return {
    reply:
      `I couldn't match “${message}” to anything in the catalogue. Try one of these angles:\n` +
      bulletList([
        `Categories: ${categories.slice(0, 6).join(", ")}`,
        "A budget, e.g. “under $1000”",
        "A brand, e.g. Tesla, Unitree, Apple, Meta, NVIDIA",
        "“What's coming in 2027?”",
      ]),
    slugs: [],
  };
}

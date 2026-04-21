/**
 * Procedural editorial content generators for Easy Street Markets.
 *
 * Pattern ported from saaschoice's `content-app/src/lib/guide-content.ts`. Every programmatic
 * page type should consume a generator from this file instead of relying on static
 * Supabase description fields alone. Generators are pure, deterministic, idempotent
 * functions — no LLM calls, no network, no randomness. They synthesize 500-2000 word
 * unique editorial from structured data at render time.
 *
 * Page-type word targets:
 *   - Category hub:        2,000+ words
 *   - Animal entity page:  1,000+ words
 *   - Intersection page:     500+ words
 *   - Comparison page:       800+ words
 */
import type { Product, Animal, Category } from "./types";
import { CATEGORY_LABELS } from "./utils";

// ============================================================================
// Shared helpers
// ============================================================================

function priceStats(products: Product[]): {
  min: number | null;
  max: number | null;
  median: number | null;
  p25: number | null;
  p75: number | null;
  count: number;
} {
  const prices = products
    .map((p) => p.price_min)
    .filter((p): p is number => typeof p === "number" && p > 0)
    .sort((a, b) => a - b);
  if (prices.length === 0) {
    return { min: null, max: null, median: null, p25: null, p75: null, count: 0 };
  }
  return {
    min: prices[0],
    max: prices[prices.length - 1],
    median: prices[Math.floor(prices.length / 2)],
    p25: prices[Math.floor(prices.length * 0.25)],
    p75: prices[Math.floor(prices.length * 0.75)],
    count: prices.length,
  };
}

function topMerchants(products: Product[], limit = 5): { source: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of products) {
    if (!p.source) continue;
    counts.set(p.source, (counts.get(p.source) || 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([source, count]) => ({ source, count }));
}

function formatUSD(n: number | null): string {
  if (n === null) return "—";
  return n < 10 ? `$${n.toFixed(2)}` : `$${Math.round(n)}`;
}

function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function sourceLabel(source: string): string {
  const m: Record<string, string> = {
    etsy: "Etsy",
    amazon: "Amazon",
    walmart: "Walmart",
    target: "Target",
    redbubble: "Redbubble",
    zazzle: "Zazzle",
    teepublic: "TeePublic",
    kohls: "Kohl's",
    wayfair: "Wayfair",
    ebay: "eBay",
  };
  return m[source] || capitalize(source);
}

// ============================================================================
// Intersection editorial — /[category]/[animal]/
// Target: 500+ words of unique content per (category, animal) combination
// ============================================================================

export interface IntersectionEditorial {
  intro: string;
  whyMatters: string;
  whatToLookFor: string;
  priceGuide: string;
  pickingRight: string;
  conservationNote: string | null;
  faqs: { question: string; answer: string }[];
}

export function generateIntersectionEditorial(
  category: Category,
  animal: Animal,
  products: Product[]
): IntersectionEditorial {
  const categoryLabel = (CATEGORY_LABELS[category.slug] || category.name).toLowerCase();
  const categorySingular = categoryLabel.replace(/s$/, "");
  const animalName = animal.common_name;
  const animalLower = animalName.toLowerCase();
  const count = products.length;
  const stats = priceStats(products);
  const merchants = topMerchants(products);
  const merchantList =
    merchants.length > 0
      ? merchants.map((m) => `${sourceLabel(m.source)} (${m.count})`).join(", ")
      : "a curated set of merchants";

  // ----- Intro paragraph (~90 words) ------------------------------------------
  const intro = `We compared ${count} ${animalLower} ${categoryLabel} to build this page, pulled from ${merchants.length || "several"} affiliate-capable stores including ${merchants.slice(0, 3).map((m) => sourceLabel(m.source)).join(", ") || "major marketplaces"}. ${animal.scientific_name ? `The ${animalName} (${animal.scientific_name})` : `The ${animalName}`} is ${animal.conservation_status && animal.conservation_status !== "Least Concern" ? `a ${animal.conservation_status.toLowerCase()} species ` : ""}one of the more searched animals in the wildlife merchandise market${animal.habitat ? `, native to ${animal.habitat.toLowerCase()}` : ""}. This page is for anyone shopping for a ${categorySingular} that features it — whether as a gift, a wearable, or a piece of home decor.`;

  // ----- Why this matters (~110 words) ----------------------------------------
  let whyMatters = `Wildlife ${categoryLabel} have become one of the dominant formats in the nature-gift market, and the ${animalName} is consistently among the top-requested subjects. Print-on-demand platforms like Etsy, Redbubble, Zazzle, and TeePublic list tens of thousands of ${animalLower}-themed designs; Amazon and Walmart carry branded and mass-market versions; and independent wildlife artists sell directly through their own storefronts. The result is a fragmented market with enormous variation in quality, accuracy, and ethics. Some ${categoryLabel} are photographically accurate, made with eco-friendly materials, and produced by artists who donate to conservation. Others are generic ${animalLower} clipart printed on the cheapest blanks available. This page is a filter.`;

  // ----- What to look for (~140 words) ----------------------------------------
  const lookForByCategory: Record<string, string> = {
    "t-shirts": `For ${animalLower} t-shirts, the three variables that matter are fabric weight (look for 5-6oz cotton or heavier — anything lighter fades quickly), print method (screen-printed and direct-to-garment outperform sublimation on cotton), and anatomical accuracy. Nature enthusiasts notice when a ${animalLower} is drawn with the wrong number of toes, the wrong tail shape, or a hybrid of multiple species. Prefer designs by named wildlife artists or organizations with a conservation tie. Avoid anything labeled "cute cartoon" unless that's specifically the vibe you want.`,
    mugs: `Ceramic mugs split cleanly into two quality tiers. Handmade pottery ($30-80) from ceramicists gives you a one-of-a-kind object with a ${animalLower} illustration painted or carved directly into the clay. Mass-produced printed mugs ($10-20) give you a photographic-quality image via sublimation, but the print sits on top of the glaze and can scratch. Dishwasher and microwave safety matter — check the listing for both. For gifting, 11oz is the safe default; 15oz is for committed coffee drinkers.`,
    "tote-bags": `Tote bag quality varies enormously. Cheap totes ($8-12) use lightweight 4oz cotton canvas that stretches, stains, and tears at the handles within months. Quality totes ($15-25) use 10-12oz cotton canvas with reinforced handles and flat bottoms. For an eco-minded ${animalLower} design, prefer organic cotton or recycled materials — a sea turtle tote made from virgin polyester sends a contradictory message. Screen-printed designs from dedicated wildlife brands outlast sublimation-printed POD totes by years.`,
    "art-prints": `When shopping for ${animalLower} wall art, the format dictates the quality. Canvas wall art and oversized canvas prints offer the most impact for the price, especially for large walls, but check the frame depth (1.5-inch gallery wrap is standard; 0.75-inch looks cheap). Framed wall art provides a finished look but adds shipping weight — ensure the listing specifies real glass or optical-grade acrylic, not cheap styrene. For unframed art prints, look for archival inks, acid-free paper (200gsm+), and edition information. An unsigned open-edition poster at $15 is fundamentally different from a signed limited-edition giclée at $120. For the ${animalLower}, prefer artists who have actually observed the animal.`,
    signs: `Metal and wood signs in this category fall into two buckets: novelty humor ("${animalName} Crossing", "Beware of ${animalName}") and serious decor (hand-painted wildlife portraits). The humor signs are ~$15-30 and made from 24-gauge aluminum or MDF. The decor signs are ~$40-150 and made from welded steel, reclaimed wood, or layered metal. For outdoor use, confirm UV-resistant printing and weatherproof mounting. Indoor-only signs will fade within a year in direct sunlight.`,
    stickers: `Sticker quality comes down to material and print. Cheap stickers ($1-3) use paper or low-grade vinyl that peels and fades in sunlight. Quality stickers ($3-8) use waterproof matte or glossy vinyl with UV laminate — these survive water bottles, laptops, and outdoor use. For a ${animalLower} sticker, check the listed width (most productive stickers are 3-4"), finish (matte reads as natural, glossy pops more), and kiss-cut vs die-cut. Etsy has the widest selection of indie wildlife artists; Redbubble has the largest volume of styles.`,
    magnets: `Fridge magnets split between flat printed magnets ($2-8) and dimensional/3D souvenir magnets ($8-15). Flat magnets are basically laminated prints with a magnetic backing; their quality hinges on the print resolution and the thickness of the magnet (weaker magnets fall off a textured fridge). 3D magnets use resin, ceramic, or acrylic casting and last much longer. For a ${animalLower}, prefer a design that shows the whole animal rather than just a face — the visual read across a room matters.`,
    caps: `Baseball caps and trucker hats with ${animalLower} designs are often embroidered rather than printed, which dramatically affects longevity. Embroidered designs survive hundreds of washes; printed or patched designs start peeling at wash 5-10. For dad hats and trucker styles, the crown profile matters — unstructured caps fit more people than structured ones. Etsy wildlife artists frequently offer embroidered options; Redbubble and Zazzle default to print, which looks sharper but wears worse.`,
  };
  const whatToLookFor =
    lookForByCategory[category.slug] ||
    `For ${animalLower} ${categoryLabel}, the main considerations are design quality, material, and source. Prefer listings from sellers who can answer specific questions about the ${animalLower} — those who care about the animal tend to care about the product.`;

  // ----- Price guide (~90 words) ----------------------------------------------
  let priceGuide: string;
  if (stats.count >= 3 && stats.median !== null) {
    priceGuide = `Across the ${count} ${animalLower} ${categoryLabel} on this page, the typical price is ${formatUSD(stats.median)}. The middle half (25th to 75th percentile) falls between ${formatUSD(stats.p25)} and ${formatUSD(stats.p75)}, which gives you a useful reference point for spotting outliers. The cheapest option is ${formatUSD(stats.min)} and the most expensive is ${formatUSD(stats.max)}. As a rough rule, anything priced below the 25th percentile is worth inspecting for fabric weight, print method, or build quality — cheap options exist for a reason, but not always a good one.`;
  } else {
    priceGuide = `${animalName} ${categoryLabel} span a wide price range depending on maker, material, and print method. Handmade and artist-direct options tend to sit at the top; print-on-demand options sit in the middle; mass-market and drop-shipped items anchor the bottom. Price alone is not a quality signal — a $15 POD item from a dedicated wildlife brand can outperform a $40 handmade item from an uninterested seller. The other variables matter more.`;
  }

  // ----- Picking the right one (~110 words) -----------------------------------
  const pickingRight = `The right ${animalLower} ${categorySingular} depends on who it's for. If you're buying for yourself, prioritize accuracy and durability — pick the design that most closely matches how you think about the ${animalLower}, from a seller you'd buy from again. If you're gifting, the relationship matters more than the product: a zoo-fanatic niece wants a different ${categorySingular} than a coworker who vaguely likes animals. For conservation-minded recipients, pick items from sellers who donate to wildlife organizations or use sustainable materials — many of the Etsy and independent sellers below do. For kids, prefer bright, simple, anatomically recognizable designs over subtle illustrator work; the kid has to recognize the ${animalLower} instantly.`;

  // ----- Conservation note (conditional, ~80 words) ---------------------------
  let conservationNote: string | null = null;
  if (animal.conservation_status && animal.conservation_status !== "Least Concern") {
    conservationNote = `One note specific to ${animalName}: the species is classified as ${animal.conservation_status} on the IUCN Red List. That affects what ethical sourcing looks like — for merchandise, the ethical issue isn't usually the product itself but the supply chain and the royalties. Prefer sellers who contribute to ${animal.family || "wildlife"} conservation organizations, avoid anything that claims real ${animalLower} parts${animal.conservation_status.toLowerCase().includes("endangered") ? " (which would be illegal in most jurisdictions regardless)" : ""}, and favor artists who've worked with conservation groups. We flag these where we can identify them.`;
  }

  // ----- Intersection-specific FAQs (5 data-driven questions) -----------------
  const faqs: { question: string; answer: string }[] = [
    {
      question: `How many ${animalLower} ${categoryLabel} are on this page?`,
      answer: `${count} products, compared across ${merchants.length || "several"} affiliate-capable stores${merchants.length > 0 ? ` including ${merchants.slice(0, 3).map((m) => sourceLabel(m.source)).join(", ")}` : ""}. The list is filtered to exclude random indie shops without affiliate programs and defaults to sort by seller reputation and product completeness.`,
    },
    {
      question: `What is the typical price of a ${animalLower} ${categorySingular}?`,
      answer:
        stats.count >= 3 && stats.median !== null
          ? `The median price across the ${count} ${animalLower} ${categoryLabel} on this page is ${formatUSD(stats.median)}, with most landing between ${formatUSD(stats.p25)} and ${formatUSD(stats.p75)}. The cheapest is ${formatUSD(stats.min)}, the most expensive is ${formatUSD(stats.max)}.`
          : `${animalName} ${categoryLabel} range from budget POD items in the $10-20 range to handmade and artist-direct pieces that can exceed $50. Price alone is not a quality signal.`,
    },
    {
      question: `Where do these ${animalLower} ${categoryLabel} ship from?`,
      answer: `Most listings on this page ship from US-based sellers or US distribution centers, with Etsy sellers spanning North America and Europe and print-on-demand items fulfilled regionally. Specific shipping times and costs are listed on each merchant's own product page, which the Compare button takes you to directly.`,
    },
    {
      question: `Are any of these ${animalLower} ${categoryLabel} eco-friendly?`,
      answer: `Some are, some are not — and the listings don't always say so explicitly. Look for phrases like "organic cotton", "recycled materials", "sustainable", "water-based inks", "FSC-certified", or named fair-trade certifications. Etsy sellers are more likely to volunteer this information than POD or mass-market retailers. If eco-credentials matter, filter by seller rather than by product.`,
    },
    {
      question: `Do you earn a commission on these links?`,
      answer: `Yes — when you buy through a link on this page, we earn a small affiliate commission from the merchant. It doesn't change the price you pay, and no seller pays us for placement or ranking. The catalog is curated by us, filtered to affiliate-capable stores, and ordered by our own criteria.`,
    },
  ];

  return {
    intro,
    whyMatters,
    whatToLookFor,
    priceGuide,
    pickingRight,
    conservationNote,
    faqs,
  };
}

// ============================================================================
// Category hub FAQs — replaces the hardcoded 3-FAQ block
// ============================================================================

export function generateCategoryFAQs(
  category: Category,
  products: Product[],
  animalsWithProducts: string[]
): { question: string; answer: string }[] {
  const categoryLabel = (CATEGORY_LABELS[category.slug] || category.name).toLowerCase();
  const categorySingular = categoryLabel.replace(/s$/, "");
  const stats = priceStats(products);
  const merchants = topMerchants(products, 5);
  const topAnimals = animalsWithProducts.slice(0, 6);

  const faqs: { question: string; answer: string }[] = [];

  faqs.push({
    question: `What are the best wildlife ${categoryLabel}?`,
    answer: `We compared ${products.length} ${categoryLabel} across ${animalsWithProducts.length} animals for this page. The strongest choices depend on who you're buying for: conservation-minded buyers should pick artist-direct listings from Etsy or independent wildlife brands; gift shoppers can safely pick from the featured section at the top; budget buyers should scan the lowest-priced options from Walmart, Amazon, and Target. Quality varies more by seller than by price.`,
  });

  if (topAnimals.length > 0) {
    faqs.push({
      question: `Which animals have the most ${categoryLabel} available?`,
      answer: `Our ${categoryLabel} selection covers ${animalsWithProducts.length} different species. The most popular — measured by product count — are ${topAnimals.slice(0, 5).map((a) => a.replace(/-/g, " ")).join(", ")}. Each has its own dedicated page with prices, merchants, and editorial notes. If you're looking for a less common species, check the full animal directory; we track 60 species in total.`,
    });
  }

  if (stats.count >= 5 && stats.median !== null) {
    faqs.push({
      question: `What is the typical cost of wildlife ${categoryLabel}?`,
      answer: `Across ${stats.count} listings with published pricing, the median price is ${formatUSD(stats.median)}. The middle half sits between ${formatUSD(stats.p25)} and ${formatUSD(stats.p75)}. Cheapest: ${formatUSD(stats.min)}. Most expensive: ${formatUSD(stats.max)}. Price is a weak signal for quality here — a cheap item from a dedicated wildlife brand often outperforms an expensive one from an uninterested drop-shipper.`,
    });
  }

  if (merchants.length > 0) {
    const merchantList = merchants
      .map((m) => `${sourceLabel(m.source)} (${m.count})`)
      .join(", ");
    faqs.push({
      question: `Where do these ${categoryLabel} come from?`,
      answer: `We pull from affiliate-capable marketplaces only — no random indie shops we can't track. The current breakdown for this category is ${merchantList}. Every product on the page links directly to the merchant, and we earn a small commission when you buy. We do not take sponsored placements; ranking is editorial.`,
    });
  }

  faqs.push({
    question: `How do you choose which ${categoryLabel} to include?`,
    answer: `Products are filtered to stores with public affiliate programs (Etsy via Awin, Amazon Associates, Walmart and Target via Impact, Redbubble and Zazzle via Impact, eBay Partner Network, Kohl's via Rakuten, Wayfair via CJ). Within those, we prioritize listings by seller reputation, product completeness, and our own editorial read on design quality. We do not rank by commission rate — the highest-commission item is rarely the best-fit item.`,
  });

  faqs.push({
    question: `Do you sell your own wildlife ${categoryLabel}?`,
    answer: `Not yet. Easy Street Markets is currently a comparison directory — we curate and compare existing ${categoryLabel} from other merchants. An in-house line of wildlife ${categoryLabel} featuring public-domain illustrations from the Biodiversity Heritage Library is in the roadmap, but it's not live yet.`,
  });

  faqs.push({
    question: `Can I get wholesale pricing on ${categoryLabel}?`,
    answer: `Not directly from us. Several of the merchants we list — particularly Etsy wildlife shops and dedicated nature-merch brands — offer wholesale pricing for retailers, zoos, and museum gift shops. Contact those sellers directly through their merchant pages. For larger B2B orders, our /wholesale/ page will be the starting point once it's live.`,
  });

  faqs.push({
    question: `How often is this ${categoryLabel} list updated?`,
    answer: `Continuously. Products are refreshed from the underlying Google Shopping data weekly, with major catalog expansions every month. Sold-out, discontinued, and 404'd listings are pruned on detection. The total product count across the site grows every month as we add new animals, new merchants, and new sub-niches.`,
  });

  return faqs;
}

// ============================================================================
// Animal editorial — /animals/[slug]/
// Target: 1,000+ words when combined with the existing Supabase description
// ============================================================================

export interface AnimalEditorial {
  quickFacts: { label: string; value: string }[];
  merchandiseOverview: string;
  bestGiftIdeas: string;
  priceGuide: string;
  categoryBreakdown: { category: string; count: number; label: string }[];
  faqs: { question: string; answer: string }[];
}

export function generateAnimalEditorial(
  animal: Animal,
  products: Product[],
  categoriesForAnimal: string[]
): AnimalEditorial {
  const animalName = animal.common_name;
  const animalLower = animalName.toLowerCase();
  const stats = priceStats(products);
  const merchants = topMerchants(products, 4);

  const quickFacts: { label: string; value: string }[] = [];
  if (animal.scientific_name) quickFacts.push({ label: "Scientific name", value: animal.scientific_name });
  if (animal.family) quickFacts.push({ label: "Family", value: animal.family });
  if (animal.order_name) quickFacts.push({ label: "Order", value: animal.order_name });
  if (animal.conservation_status) quickFacts.push({ label: "Conservation status", value: animal.conservation_status });
  if (animal.habitat) quickFacts.push({ label: "Habitat", value: animal.habitat });
  quickFacts.push({ label: "Products on site", value: String(products.length) });
  quickFacts.push({ label: "Merchants", value: String(merchants.length) });

  const merchandiseOverview = `${animalName} merchandise is one of the most-requested categories in the wildlife gift market, and for practical reasons — ${animalLower}s photograph well, translate cleanly into illustration, and appeal to a broad audience that spans nature enthusiasts, children, conservation donors, and gift shoppers. This page tracks ${products.length} ${animalLower} products across ${categoriesForAnimal.length} categories and ${merchants.length} affiliate-capable merchants. The selection spans mass-market retailers like Walmart and Target, print-on-demand platforms like Redbubble and Zazzle, handmade marketplaces like Etsy, and dedicated wildlife brands. We filter out random drop-shipping shops to keep tracking clean and affiliate commissions flowing to sellers who actually invest in their products.`;

  const bestGiftIdeas = `The best ${animalLower}-themed gift depends on the recipient. For adults who identify with the species — the fan, the naturalist, the conservation donor — lean toward higher-quality items from artist-direct sellers: a signed art print, a hand-painted ceramic mug, a screen-printed heavyweight tee. For kids and casual fans, the mass-market tier is genuinely fine: bright designs, recognizable silhouettes, low stakes. For eco-minded recipients, filter for organic cotton apparel, recycled-material totes, and sellers who disclose fair-trade sourcing. For conservation contributions, several Etsy and independent brands donate a percentage of sales to ${animal.family || "wildlife"} conservation programs — we flag those where we can identify them.`;

  let priceGuide: string;
  if (stats.count >= 3 && stats.median !== null) {
    priceGuide = `${animalName} products on this page range from ${formatUSD(stats.min)} to ${formatUSD(stats.max)}. The median is ${formatUSD(stats.median)}, with the middle half (25th-75th percentile) sitting between ${formatUSD(stats.p25)} and ${formatUSD(stats.p75)}. That range covers the usual spread from print-on-demand stickers and magnets at the low end, through POD apparel and mugs in the middle, up to handmade ceramics and signed art prints at the top. Stickers and magnets typically fall under $10; t-shirts and tote bags cluster in the $15-30 range; mugs and art prints range from $15 for mass-market to $80+ for handmade work.`;
  } else {
    priceGuide = `${animalName} merchandise spans a wide price range depending on category, maker, and material. Stickers and magnets start under $5. T-shirts, mugs, and tote bags typically fall between $15 and $30. Art prints, signs, and handmade items range from $20 to $150+. We list the price range for each product where available.`;
  }

  const categoryBreakdown = (() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      counts.set(p.category, (counts.get(p.category) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([slug, count]) => ({
        category: slug,
        count,
        label: CATEGORY_LABELS[slug] || slug,
      }))
      .sort((a, b) => b.count - a.count);
  })();

  const faqs: { question: string; answer: string }[] = [];

  faqs.push({
    question: `What kinds of ${animalLower} merchandise can I find here?`,
    answer:
      categoryBreakdown.length > 0
        ? `${products.length} products across ${categoryBreakdown.length} categories: ${categoryBreakdown.map((c) => `${c.label.toLowerCase()} (${c.count})`).join(", ")}. Each category has its own dedicated page with price comparisons and editorial notes specific to that intersection.`
        : `We're currently building out the ${animalLower} product catalog. Check back soon or browse related animals in the meantime.`,
  });

  if (animal.conservation_status) {
    faqs.push({
      question: `Is the ${animalName} endangered?`,
      answer: `The ${animalName} is classified as ${animal.conservation_status} on the IUCN Red List${animal.conservation_status === "Least Concern" ? ", meaning it's not currently at immediate risk of extinction — though that status can change quickly with habitat loss and climate change" : ". Buying merchandise that supports conservation organizations working on this species is one low-friction way to contribute"}. Where we can identify sellers who donate to ${animal.family || "relevant"} conservation programs, we flag it.`,
    });
  }

  if (animal.habitat) {
    faqs.push({
      question: `Where does the ${animalName} live?`,
      answer: `${animal.habitat}. The species distribution matters for merchandise in one specific way: local artists in those regions tend to produce the most anatomically accurate and culturally relevant designs. If you're buying as a gift for someone who has a personal connection to ${animalName} habitat, prefer sellers from those regions when possible.`,
    });
  }

  if (stats.count >= 3 && stats.median !== null) {
    faqs.push({
      question: `What is the typical price of ${animalLower} merchandise?`,
      answer: `Across ${stats.count} listings on this page, the median price is ${formatUSD(stats.median)}. Most products fall between ${formatUSD(stats.p25)} and ${formatUSD(stats.p75)}. The cheapest option is ${formatUSD(stats.min)} and the most expensive is ${formatUSD(stats.max)}. Sticker and magnet products anchor the low end; handmade ceramic and signed art prints anchor the top.`,
    });
  }

  faqs.push({
    question: `Where do the ${animalLower} products come from?`,
    answer: `${merchants.length > 0 ? `Primarily from ${merchants.map((m) => sourceLabel(m.source)).join(", ")}. ` : ""}Every product links directly to the merchant's own page, and we earn a small affiliate commission when you buy. We don't accept sponsored placements — ranking is editorial, based on seller reputation and product completeness.`,
  });

  if (animal.fun_fact) {
    faqs.push({
      question: `What's something interesting about the ${animalName}?`,
      answer: animal.fun_fact,
    });
  }

  return {
    quickFacts,
    merchandiseOverview,
    bestGiftIdeas,
    priceGuide,
    categoryBreakdown,
    faqs,
  };
}

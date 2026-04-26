import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getCategory,
  getAnimal,
  getProducts,
  getCategoriesForAnimal,
  getAnimalsForCategory,
} from "@/lib/data";
import ProductGrid from "@/components/ProductGrid";
import Breadcrumbs from "@/components/Breadcrumbs";
import { CATEGORIES, CATEGORY_LABELS, SITE_URL, SITE_NAME } from "@/lib/utils";
import { generateIntersectionEditorial } from "@/lib/guide-content";
import { graph, breadcrumbSchema, ORG_ID } from "@/lib/schema";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; animal: string }>;
}): Promise<Metadata> {
  const { category, animal } = await params;
  const [cat, an] = await Promise.all([getCategory(category), getAnimal(animal)]);
  if (!cat || !an) return {};
  const label = CATEGORY_LABELS[category] || cat.name;
  return {
    title: `Best ${an.common_name} ${label} (Top Picks & Gifts) | Easy Street Markets`,
    description: `Compare ${an.common_name.toLowerCase()} ${label.toLowerCase()} from Etsy, Amazon, Walmart, Zazzle, Redbubble, and more. Prices, sellers, and buying guide.`,
    alternates: { canonical: `${SITE_URL}/${category}/${animal}` },
  };
}

export default async function IntersectionPage({
  params,
}: {
  params: Promise<{ category: string; animal: string }>;
}) {
  const { category, animal } = await params;

  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    notFound();
  }

  const [cat, an, products, otherCategoriesForAnimal, otherAnimalsForCategory] = await Promise.all([
    getCategory(category),
    getAnimal(animal),
    getProducts({ category, animal }),
    getCategoriesForAnimal(animal),
    getAnimalsForCategory(category),
  ]);

  if (!cat || !an) notFound();

  const label = CATEGORY_LABELS[category] || cat.name;
  const otherCats = otherCategoriesForAnimal.filter((c) => c !== category).slice(0, 6);
  const relatedAnimals = otherAnimalsForCategory.filter((a) => a !== animal).slice(0, 5);

  // Thin-content guard: if the combo has fewer than 3 products, noindex it rather
  // than serve a sparse page that risks a programmatic-spam signal.
  const isThin = products.length < 3;

  // Procedural editorial — 500+ words of unique content per (category, animal) combo.
  // Replaces the previous 1-paragraph stub with synthesized long-form from data.
  const editorial = generateIntersectionEditorial(cat, an, products);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {isThin && <meta name="robots" content="noindex,follow" />}

      <Breadcrumbs
        items={[
          { label, href: `/${category}/` },
          { label: an.common_name, href: `/${category}/${animal}/` },
        ]}
      />

      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-3">
          The Best {an.common_name} {label} — {products.length} Top Picks Compared
        </h1>
        {an.scientific_name && (
          <p className="text-sm italic text-foreground/60 mb-2">{an.scientific_name}</p>
        )}
      </header>

      {/* Intro + Why it matters */}
      <section className="max-w-3xl mb-10 prose prose-forest">
        <p className="mb-5 leading-relaxed text-foreground/85 text-lg">{editorial.intro}</p>
        <p className="mb-5 leading-relaxed text-foreground/80">{editorial.whyMatters}</p>
      </section>

      {/* Products */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">
          All {an.common_name} {label}
        </h2>
        <ProductGrid products={products} />
      </section>

      {/* What to look for */}
      <section className="max-w-3xl mb-10">
        <h2 className="text-2xl font-bold mb-4">
          What to Look for in {an.common_name} {label}
        </h2>
        <p className="leading-relaxed text-foreground/80">{editorial.whatToLookFor}</p>
      </section>

      {/* Price guide */}
      <section className="max-w-3xl mb-10 bg-sand rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Price Guide</h2>
        <p className="leading-relaxed text-foreground/80">{editorial.priceGuide}</p>
      </section>

      {/* Picking the right one */}
      <section className="max-w-3xl mb-10">
        <h2 className="text-2xl font-bold mb-4">
          Picking the Right {an.common_name.split(" ").pop()} {label.replace(/s$/, "")}
        </h2>
        <p className="leading-relaxed text-foreground/80">{editorial.pickingRight}</p>
      </section>

      {/* Conservation note (conditional) */}
      {editorial.conservationNote && (
        <section className="max-w-3xl mb-10 bg-forest/10 border border-forest/20 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-3 text-forest">
            {an.common_name} Conservation Note
          </h2>
          <p className="leading-relaxed text-foreground/80">{editorial.conservationNote}</p>
        </section>
      )}

      {/* Cross-links: other categories for this animal */}
      {otherCats.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">More {an.common_name} Products</h2>
          <div className="flex flex-wrap gap-2">
            {otherCats.map((c) => (
              <Link
                key={c}
                href={`/${c}/${animal}`}
                className="px-4 py-2 rounded-full bg-sand hover:bg-forest hover:text-white transition-colors text-sm"
              >
                {CATEGORY_LABELS[c] || c}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related animals in same category */}
      {relatedAnimals.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">More Wildlife {label}</h2>
          <div className="flex flex-wrap gap-2">
            {relatedAnimals.map((a) => (
              <Link
                key={a}
                href={`/${category}/${a}`}
                className="px-4 py-2 rounded-full bg-sand hover:bg-forest hover:text-white transition-colors text-sm capitalize"
              >
                {a.replace(/-/g, " ")}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Learn more about the animal */}
      <section className="max-w-3xl mb-10">
        <Link
          href={`/animals/${animal}`}
          className="inline-block text-forest font-medium hover:underline"
        >
          Read more about the {an.common_name} →
        </Link>
      </section>

      {/* FAQ */}
      <section className="bg-sand rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-5">
          {editorial.faqs.map((faq, i) => (
            <div key={i}>
              <h3 className="font-semibold mb-2">{faq.question}</h3>
              <p className="text-foreground/70 text-sm leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* JSON-LD: CollectionPage + BreadcrumbList + FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            graph([
              {
                "@type": "CollectionPage",
                "@id": `${SITE_URL}/${category}/${animal}/#collectionpage`,
                name: `${an.common_name} ${label}`,
                description: `${products.length} ${an.common_name.toLowerCase()} ${label.toLowerCase()} compared across Etsy, Amazon, Walmart, and other affiliate-capable stores.`,
                url: `${SITE_URL}/${category}/${animal}/`,
                isPartOf: { "@id": `${SITE_URL}/#website` },
                publisher: { "@id": ORG_ID },
                about: {
                  "@type": "Thing",
                  name: an.common_name,
                  alternateName: an.scientific_name || undefined,
                },
              },
              breadcrumbSchema([
                { name: SITE_NAME, url: SITE_URL },
                { name: label, url: `${SITE_URL}/${category}/` },
                { name: an.common_name, url: `${SITE_URL}/${category}/${animal}/` },
              ]),
              {
                "@type": "FAQPage",
                mainEntity: editorial.faqs.map((faq) => ({
                  "@type": "Question",
                  name: faq.question,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: faq.answer,
                  },
                })),
              },
            ])
          ),
        }}
      />
    </div>
  );
}

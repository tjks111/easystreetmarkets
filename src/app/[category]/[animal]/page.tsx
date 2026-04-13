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
import { CATEGORIES, CATEGORY_LABELS, SITE_URL } from "@/lib/utils";

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
    title: `${an.common_name} ${label} — Compared`,
    description: `The best ${an.common_name.toLowerCase()} ${label.toLowerCase()} compared across Amazon, Redbubble, Etsy, and independent brands.`,
    alternates: { canonical: `${SITE_URL}/${category}/${animal}/` },
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

  // noindex if thin content
  const isThin = products.length < 3;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {isThin && (
        <meta name="robots" content="noindex,follow" />
      )}

      <Breadcrumbs
        items={[
          { label, href: `/${category}/` },
          { label: an.common_name, href: `/${category}/${animal}/` },
        ]}
      />

      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-3">
          {an.common_name} {label} — {products.length} Products Compared
        </h1>
        {an.scientific_name && (
          <p className="text-sm italic text-foreground/60 mb-2">{an.scientific_name}</p>
        )}
      </header>

      {/* Mini animal bio */}
      {an.description && (
        <section className="bg-sand rounded-lg p-6 mb-8 max-w-3xl">
          <p className="text-foreground/80 leading-relaxed">
            {an.description.split("\n\n")[0]}
          </p>
          <Link
            href={`/animals/${animal}/`}
            className="inline-block mt-3 text-forest font-medium hover:underline text-sm"
          >
            Read more about the {an.common_name} →
          </Link>
        </section>
      )}

      {/* Products */}
      <section className="mb-12">
        <ProductGrid products={products} />
      </section>

      {/* Cross-links: other categories for this animal */}
      {otherCats.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">More {an.common_name} Products</h2>
          <div className="flex flex-wrap gap-2">
            {otherCats.map((c) => (
              <Link
                key={c}
                href={`/${c}/${animal}/`}
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
                href={`/${category}/${a}/`}
                className="px-4 py-2 rounded-full bg-sand hover:bg-forest hover:text-white transition-colors text-sm capitalize"
              >
                {a.replace(/-/g, " ")}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${an.common_name} ${label}`,
            url: `${SITE_URL}/${category}/${animal}/`,
            about: {
              "@type": "Thing",
              name: an.common_name,
              alternateName: an.scientific_name,
            },
            publisher: { "@id": `${SITE_URL}/#organization` },
          }),
        }}
      />
    </div>
  );
}

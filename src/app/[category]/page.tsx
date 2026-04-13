import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getCategories,
  getCategory,
  getProducts,
  getAnimalsForCategory,
} from "@/lib/data";
import ProductGrid from "@/components/ProductGrid";
import Breadcrumbs from "@/components/Breadcrumbs";
import { CATEGORIES, CATEGORY_LABELS, SITE_URL, capitalize } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = await getCategory(category);
  if (!cat) return {};
  const label = CATEGORY_LABELS[category] || cat.name;
  return {
    title: `Best Wildlife ${label} — Curated & Compared`,
    description: cat.meta_description || `Compare the best wildlife ${label.toLowerCase()} from Amazon, Redbubble, Etsy, and independent brands.`,
    alternates: { canonical: `${SITE_URL}/${category}/` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    notFound();
  }

  const [cat, products, animalsWithProducts] = await Promise.all([
    getCategory(category),
    getProducts({ category }),
    getAnimalsForCategory(category),
  ]);

  if (!cat) notFound();

  const label = CATEGORY_LABELS[category] || cat.name;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label, href: `/${category}/` }]} />

      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-3">
          Best Wildlife {label} — Curated &amp; Compared
        </h1>
        <p className="text-foreground/70">
          {products.length} products compared across {animalsWithProducts.length} animals
        </p>
      </header>

      {/* Editorial */}
      {cat.description && (
        <section className="max-w-3xl mb-12 prose prose-forest">
          {cat.description.split("\n\n").map((p, i) => (
            <p key={i} className="mb-4 leading-relaxed text-foreground/80">
              {p}
            </p>
          ))}
        </section>
      )}

      {/* Animal filter strip */}
      {animalsWithProducts.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Shop by Animal</h2>
          <div className="flex flex-wrap gap-2">
            {animalsWithProducts.map((a) => (
              <Link
                key={a}
                href={`/${category}/${a}/`}
                className="px-4 py-2 rounded-full bg-sand hover:bg-forest hover:text-white transition-colors text-sm"
              >
                {capitalize(a)}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">All {label}</h2>
        <ProductGrid products={products} />
      </section>

      {/* FAQ */}
      <section className="bg-sand rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">What are the best wildlife {label.toLowerCase()} for nature lovers?</h3>
            <p className="text-foreground/70 text-sm">
              We curate across animal, art style, and price so you can match the gift to the person.
              Popular picks are elephants, wolves, bears, and sea turtles.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Where are these products from?</h3>
            <p className="text-foreground/70 text-sm">
              We compare across Amazon, Redbubble, Etsy, and independent wildlife brands. Every product links
              directly to the seller.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Do you earn a commission?</h3>
            <p className="text-foreground/70 text-sm">
              Yes, when you buy through our affiliate links. No vendor pays for placement.
            </p>
          </div>
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `Best Wildlife ${label}`,
            description: cat.meta_description,
            url: `${SITE_URL}/${category}/`,
            publisher: { "@id": `${SITE_URL}/#organization` },
          }),
        }}
      />
    </div>
  );
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCollection, getCollections, getProducts } from "@/lib/data";
import ProductGrid from "@/components/ProductGrid";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SITE_URL } from "@/lib/utils";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const collections = await getCollections();
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) return {};
  return {
    title: collection.name,
    description: collection.meta_description ?? undefined,
    alternates: { canonical: `${SITE_URL}/collections/${slug}` },
  };
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) notFound();

  // For collections without explicit product_ids, pull a themed selection.
  // Cap the pool to 500 — enough headroom to find 24 picks after filtering,
  // and keeps the Worker payload under the memory budget.
  const allProducts = await getProducts({ limit: 500 });

  let products = allProducts;

  // Apply smart filtering per collection
  if (slug === "nature-gifts-under-25") {
    products = allProducts.filter((p) => p.price_min !== null && p.price_min <= 25).slice(0, 24);
  } else if (slug === "endangered-species-collection") {
    const endangeredAnimals = ["elephant", "tiger", "sea-turtle", "monarch-butterfly", "whale-shark", "gorilla", "panda"];
    products = allProducts.filter((p) => p.animal && endangeredAnimals.includes(p.animal)).slice(0, 24);
  } else if (slug === "vintage-botanical-art-prints") {
    products = allProducts.filter((p) => p.category === "art-prints").slice(0, 24);
  } else if (slug === "zoo-gift-shop-bestsellers") {
    const tier1 = ["elephant", "wolf", "bear", "bald-eagle", "tiger"];
    products = allProducts.filter((p) => p.animal && tier1.includes(p.animal)).slice(0, 24);
  } else if (slug === "gifts-for-nature-lovers") {
    products = allProducts.filter((p) => p.price_min !== null && p.price_min >= 15 && p.price_min <= 40).slice(0, 24);
  } else {
    products = allProducts.slice(0, 24);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Collections", href: "/collections/" },
          { label: collection.name, href: `/collections/${slug}/` },
        ]}
      />

      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-3">{collection.name}</h1>
      </header>

      {collection.description && (
        <section className="max-w-3xl mb-12 prose prose-forest">
          {collection.description.split("\n\n").map((p, i) => (
            <p key={i} className="mb-4 leading-relaxed text-foreground/80">
              {p}
            </p>
          ))}
        </section>
      )}

      <ProductGrid products={products} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: collection.name,
            description: collection.meta_description,
            url: `${SITE_URL}/collections/${slug}/`,
            publisher: { "@id": `${SITE_URL}/#organization` },
          }),
        }}
      />
    </div>
  );
}

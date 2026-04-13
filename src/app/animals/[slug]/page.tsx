import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getAnimal, getAnimals, getProducts, getCategoriesForAnimal } from "@/lib/data";
import ProductGrid from "@/components/ProductGrid";
import Breadcrumbs from "@/components/Breadcrumbs";
import { CATEGORY_LABELS, SITE_URL, SITE_NAME } from "@/lib/utils";
import { graph, breadcrumbSchema, ORG_ID, PERSON_ID } from "@/lib/schema";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const animals = await getAnimals();
  return animals.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const animal = await getAnimal(slug);
  if (!animal) return {};
  return {
    title: `${animal.common_name} — Wildlife Merchandise & Conservation`,
    description: `${animal.common_name} (${animal.scientific_name}) — educational content, conservation status (${animal.conservation_status}), and curated merchandise featuring this species.`,
    alternates: { canonical: `${SITE_URL}/animals/${slug}/` },
  };
}

export default async function AnimalDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const animal = await getAnimal(slug);
  if (!animal) notFound();

  const [products, categoriesForAnimal] = await Promise.all([
    getProducts({ animal: slug }),
    getCategoriesForAnimal(slug),
  ]);

  // Group products by category
  const byCategory = products.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {} as Record<string, typeof products>);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Animals", href: "/animals/" },
          { label: animal.common_name, href: `/animals/${slug}/` },
        ]}
      />

      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{animal.common_name}</h1>
          {animal.scientific_name && (
            <p className="text-lg italic text-foreground/60 mb-4">{animal.scientific_name}</p>
          )}
          <div className="flex flex-wrap gap-3 text-sm">
            {animal.family && (
              <span className="bg-sand px-3 py-1 rounded">Family: {animal.family}</span>
            )}
            {animal.order_name && (
              <span className="bg-sand px-3 py-1 rounded">Order: {animal.order_name}</span>
            )}
            {animal.conservation_status && (
              <span className="bg-forest text-white px-3 py-1 rounded">
                IUCN: {animal.conservation_status}
              </span>
            )}
          </div>
        </header>

        {/* Description */}
        {animal.description && (
          <section className="max-w-3xl mb-8">
            {animal.description.split("\n\n").map((p, i) => (
              <p key={i} className="mb-4 leading-relaxed text-foreground/80">
                {p}
              </p>
            ))}
          </section>
        )}

        {/* Habitat */}
        {animal.habitat && (
          <section className="max-w-3xl mb-8 bg-sand rounded-lg p-6">
            <h2 className="font-bold mb-2">Habitat</h2>
            <p className="text-foreground/80">{animal.habitat}</p>
          </section>
        )}

        {/* Fun fact */}
        {animal.fun_fact && (
          <section className="max-w-3xl mb-8 bg-forest text-white rounded-lg p-6">
            <h2 className="font-bold mb-2">Fun Fact</h2>
            <p className="italic">{animal.fun_fact}</p>
          </section>
        )}

        {/* Products by category */}
        {products.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              {animal.common_name} Merchandise ({products.length} products)
            </h2>
            {categoriesForAnimal.map((cat) => (
              <div key={cat} className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">
                    {CATEGORY_LABELS[cat] || cat}
                  </h3>
                  <Link
                    href={`/${cat}/${slug}/`}
                    className="text-sm text-forest hover:underline"
                  >
                    See all →
                  </Link>
                </div>
                <ProductGrid products={(byCategory[cat] || []).slice(0, 4)} />
              </div>
            ))}
          </section>
        )}

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              graph([
                {
                  "@type": "Article",
                  headline: animal.common_name,
                  alternateName: animal.scientific_name,
                  description: animal.description?.split("\n\n")[0],
                  author: { "@id": PERSON_ID },
                  publisher: { "@id": ORG_ID },
                  mainEntityOfPage: `${SITE_URL}/animals/${slug}/`,
                  about: {
                    "@type": "Thing",
                    name: animal.common_name,
                    alternateName: animal.scientific_name,
                    sameAs: [
                      `https://en.wikipedia.org/wiki/${encodeURIComponent(
                        (animal.scientific_name || animal.common_name).replace(/ /g, "_")
                      )}`,
                    ],
                  },
                },
                breadcrumbSchema([
                  { name: SITE_NAME, url: SITE_URL },
                  { name: "Animals", url: `${SITE_URL}/animals/` },
                  { name: animal.common_name, url: `${SITE_URL}/animals/${slug}/` },
                ]),
              ])
            ),
          }}
        />
      </article>
    </div>
  );
}

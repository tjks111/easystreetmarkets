import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getCategory,
  getProducts,
  getAnimalsForCategory,
  getProductCountByCategory,
} from "@/lib/data";
import ProductGrid from "@/components/ProductGrid";
import Breadcrumbs from "@/components/Breadcrumbs";
import { CATEGORIES, CATEGORY_LABELS, SITE_URL, SITE_NAME, capitalize } from "@/lib/utils";
import { generateCategoryFAQs } from "@/lib/guide-content";
import { graph, breadcrumbSchema, ORG_ID } from "@/lib/schema";

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
    description:
      cat.meta_description ||
      `Compare the best wildlife ${label.toLowerCase()} from Amazon, Redbubble, Etsy, and independent brands.`,
    alternates: { canonical: `${SITE_URL}/${category}/` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { category } = await params;
  const resolvedSearchParams = await searchParams;
  const pageParam = resolvedSearchParams.page;
  const page = typeof pageParam === "string" ? parseInt(pageParam, 10) : 1;

  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    notFound();
  }

  const PRODUCT_GRID_CAP = 100;

  const [cat, products, animalsWithProducts, totalCount] = await Promise.all([
    getCategory(category),
    getProducts({ category, limit: PRODUCT_GRID_CAP, page }),
    getAnimalsForCategory(category),
    getProductCountByCategory(category),
  ]);

  if (!cat) notFound();

  const label = CATEGORY_LABELS[category] || cat.name;
  const faqs = generateCategoryFAQs(cat, products, animalsWithProducts);
  const totalPages = Math.ceil(totalCount / PRODUCT_GRID_CAP);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label, href: `/${category}/` }]} />

      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-3">
          Best Wildlife {label} — Curated &amp; Compared
        </h1>
        <p className="text-foreground/70">
          {totalCount} products compared across {animalsWithProducts.length} animals
          {totalPages > 1 && ` — showing page ${page} of ${totalPages}, browse by animal below for the full selection`}
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
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            {page > 1 ? (
              <Link 
                href={`/${category}/?page=${page - 1}`} 
                className="px-6 py-2 bg-forest text-white rounded-md hover:bg-forest/90 transition-colors"
              >
                Previous
              </Link>
            ) : (
              <span className="px-6 py-2 bg-gray-200 text-gray-400 rounded-md cursor-not-allowed">
                Previous
              </span>
            )}
            <span className="px-4 py-2 font-medium text-foreground/80">
              Page {page} of {totalPages}
            </span>
            {page < totalPages ? (
              <Link 
                href={`/${category}/?page=${page + 1}`} 
                className="px-6 py-2 bg-forest text-white rounded-md hover:bg-forest/90 transition-colors"
              >
                Next
              </Link>
            ) : (
              <span className="px-6 py-2 bg-gray-200 text-gray-400 rounded-md cursor-not-allowed">
                Next
              </span>
            )}
          </div>
        )}
      </section>

      {/* FAQ — data-driven via generateCategoryFAQs */}
      <section className="bg-sand rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-5">
          {faqs.map((faq, i) => (
            <div key={i}>
              <h3 className="font-semibold mb-2">{faq.question}</h3>
              <p className="text-foreground/70 text-sm leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            graph([
              {
                "@type": "CollectionPage",
                "@id": `${SITE_URL}/${category}/#collectionpage`,
                name: `Best Wildlife ${label}`,
                description: cat.meta_description,
                url: `${SITE_URL}/${category}/`,
                isPartOf: { "@id": `${SITE_URL}/#website` },
                publisher: { "@id": ORG_ID },
              },
              breadcrumbSchema([
                { name: SITE_NAME, url: SITE_URL },
                { name: label, url: `${SITE_URL}/${category}/` },
              ]),
              {
                "@type": "FAQPage",
                mainEntity: faqs.map((faq) => ({
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

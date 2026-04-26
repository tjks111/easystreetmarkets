import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getCategory,
  getProducts,
  getAnimalsForCategory,
  getProductCountByCategory,
} from "@/lib/data";
import ProductGrid from "@/components/ProductGrid";
import Breadcrumbs from "@/components/Breadcrumbs";
import { CATEGORIES, CATEGORY_LABELS, SITE_URL, SITE_NAME, capitalize } from "@/lib/utils";
import { generateCategoryFAQs, getCategoryOverrides } from "@/lib/guide-content";
import { graph, breadcrumbSchema, ORG_ID } from "@/lib/schema";

export default async function CategoryTemplate({
  category,
  page,
}: {
  category: string;
  page: number;
}) {
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

  const totalPages = Math.ceil(totalCount / PRODUCT_GRID_CAP);

  // Out of bounds check
  if (page > 1 && page > totalPages) {
    notFound();
  }

  const label = CATEGORY_LABELS[category] || cat.name;
  const overrides = getCategoryOverrides(category);
  const displayH1 = overrides?.h1 || `The Best Wildlife ${label} — Top Picks & Gift Ideas`;
  const displayDescription = overrides?.editorialText || cat.description;
  const faqs = generateCategoryFAQs(cat, products, animalsWithProducts);

  const prevPageUrl = page === 2 ? `/${category}` : `/${category}/page/${page - 1}`;
  const nextPageUrl = `/${category}/page/${page + 1}`;
  const canonicalUrl = page > 1 ? `${SITE_URL}/${category}/page/${page}` : `${SITE_URL}/${category}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label, href: `/${category}` }]} />

      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-3">
          {displayH1}
        </h1>
        <p className="text-foreground/70">
          {totalCount} products compared across {animalsWithProducts.length} animals
          {totalPages > 1 &&
            ` — showing page ${page} of ${totalPages}, browse by animal below for the full selection`}
        </p>
      </header>

      {/* Editorial */}
      {displayDescription && (
        <section className="max-w-3xl mb-12 prose prose-forest">
          {displayDescription.split("\n\n").map((p, i) => (
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
                href={`/${category}/${a}`}
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
                href={prevPageUrl}
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
                href={nextPageUrl}
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
              <p className="text-foreground/70 text-sm leading-relaxed">
                {faq.answer}
              </p>
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
                "@id": `${SITE_URL}/${category}#collectionpage`,
                name: `Best Wildlife ${label}`,
                description: cat.meta_description,
                url: canonicalUrl,
                isPartOf: { "@id": `${SITE_URL}#website` },
                publisher: { "@id": ORG_ID },
              },
              breadcrumbSchema([
                { name: SITE_NAME, url: SITE_URL },
                { name: label, url: `${SITE_URL}/${category}` },
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
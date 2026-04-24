import Link from "next/link";
import { getCategories, getProducts, getCollections, getAnimals, getBlogPosts } from "@/lib/data";
import ProductGrid from "@/components/ProductGrid";
import AnimalCard from "@/components/AnimalCard";
import { SITE_NAME, CATEGORY_LABELS } from "@/lib/utils";

export const revalidate = 3600;

export default async function HomePage() {
  const [categories, featuredProducts, collections, animals, blogPosts] = await Promise.all([
    getCategories(),
    getProducts({ limit: 8 }),
    getCollections(),
    getAnimals(),
    getBlogPosts(),
  ]);

  const tier1Slugs = ["elephant", "wolf", "bear", "bald-eagle", "tiger", "deer", "owl", "sea-turtle", "dolphin", "monarch-butterfly"];
  const tier1Animals = animals
    .filter((a) => tier1Slugs.includes(a.slug))
    .sort((a, b) => tier1Slugs.indexOf(a.slug) - tier1Slugs.indexOf(b.slug));

  return (
    <>
      {/* Hero */}
      <section className="bg-forest text-white py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Wildlife &amp; Nature Merchandise
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-6">
            Curated, Compared, Honest
          </p>
          <p className="text-white/80 leading-relaxed">
            209 million Americans visit zoos every year. 74% of online shoppers
            abandon their cart from choice overload. We built the comparison layer
            that wildlife merchandise has been missing for 20 years.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold mb-2 text-center">Browse by Category</h2>
        <p className="text-center text-foreground/70 mb-8">
          {categories.reduce((acc, c) => acc + c.product_count, 0)} products across 8 categories
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="bg-white border border-forest/10 hover:bg-forest hover:text-white hover:border-forest transition-colors rounded-lg p-6 text-center"
            >
              <div className="font-semibold">{CATEGORY_LABELS[cat.slug] || cat.name}</div>
              <div className="text-xs mt-1 opacity-70">{cat.product_count} products</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Products</h2>
        <ProductGrid products={featuredProducts} />
      </section>

      {/* Tier 1 Animals */}
      <section className="bg-sand py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-center">Top Wildlife</h2>
          <p className="text-center text-foreground/70 mb-8">
            The 10 most-searched wildlife subjects in merchandise
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {tier1Animals.map((a) => (
              <AnimalCard key={a.slug} animal={a} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/animals"
              className="inline-block bg-forest text-white px-6 py-3 rounded-full hover:bg-forest-light transition-colors font-medium"
            >
              Browse All 60 Animals
            </Link>
          </div>
        </div>
      </section>

      {/* Blog */}
      {blogPosts.length > 0 && (
        <section className="max-w-7xl mx-auto py-16 px-4">
          <h2 className="text-3xl font-bold mb-2 text-center">From the Blog</h2>
          <p className="text-center text-foreground/70 mb-8">
            Honest writing about wildlife merchandise, the markets that make it, and the buyers they fail.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.slice(0, 3).map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="bg-white rounded-lg border border-forest/10 hover:border-forest/40 hover:shadow-lg transition-all p-6"
              >
                <h3 className="font-bold text-lg text-forest mb-3 leading-snug">{post.title}</h3>
                {post.excerpt && (
                  <p className="text-sm text-foreground/70 line-clamp-4">{post.excerpt}</p>
                )}
                <div className="mt-4 text-sm text-forest font-medium">Read →</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Collections */}
      <section className="max-w-7xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Curated Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {collections.slice(0, 3).map((c) => (
            <Link
              key={c.slug}
              href={`/collections/${c.slug}`}
              className="bg-white rounded-lg border border-forest/10 hover:border-forest/40 hover:shadow-lg transition-all p-6"
            >
              <h3 className="font-bold text-lg text-forest mb-2">{c.name}</h3>
              <p className="text-sm text-foreground/70 line-clamp-3">
                {c.meta_description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* About strip */}
      <section className="bg-forest text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">About {SITE_NAME}</h2>
          <p className="text-white/90 leading-relaxed">
            Founded in 2003 as a wildlife merchandise store in Gainesville, FL, we&apos;re
            back in 2026 — rebuilt as the internet&apos;s first wildlife merchandise comparison
            directory. We curate products from Amazon, Redbubble, Etsy, and independent
            artists so you can find exactly what you&apos;re looking for without the endless
            scroll. No vendor pays for placement. We earn a small commission when you buy
            through our links.
          </p>
          <Link
            href="/about"
            className="inline-block mt-6 border border-white/40 px-6 py-2 rounded-full hover:bg-white hover:text-forest transition-colors"
          >
            Our story
          </Link>
        </div>
      </section>
    </>
  );
}

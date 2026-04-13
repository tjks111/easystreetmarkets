import Link from "next/link";
import { SITE_NAME, CATEGORY_LABELS } from "@/lib/utils";

export default function HomePage() {
  const categories = Object.entries(CATEGORY_LABELS);

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="bg-forest text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Wildlife &amp; Nature Merchandise
        </h1>
        <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-2">
          Curated, Compared, Honest
        </p>
        <p className="text-white/70 max-w-xl mx-auto mt-4">
          209 million Americans visit zoos every year. 74% of online shoppers
          abandon their cart from choice overload. We built the comparison layer
          that wildlife merchandise has been missing for 20 years.
        </p>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto py-16 px-6">
        <h2 className="text-2xl font-bold mb-8 text-center">
          Browse by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(([slug, label]) => (
            <Link
              key={slug}
              href={`/${slug}/`}
              className="bg-sand hover:bg-forest hover:text-white transition-colors rounded-lg p-6 text-center font-medium"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="bg-sand py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            About {SITE_NAME}
          </h2>
          <p className="text-foreground/80 leading-relaxed">
            Founded in 2003 as a wildlife merchandise store in Gainesville, FL,
            Easy Street Markets is back — rebuilt as the internet&apos;s first
            wildlife merchandise comparison directory. We curate products from
            Amazon, Redbubble, Etsy, and independent artists so you can find
            exactly what you&apos;re looking for without the endless scroll. No
            vendor pays for placement. We earn a small commission when you buy
            through our links.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-forest-dark text-white/70 py-8 px-6 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
        <p className="mt-1">
          Wildlife illustrations from the Biodiversity Heritage Library. Conservation data from the IUCN Red List.
        </p>
      </footer>
    </main>
  );
}

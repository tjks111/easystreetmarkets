import Link from "next/link";
import type { Metadata } from "next";
import { getCollections } from "@/lib/data";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SITE_URL } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Curated Wildlife Collections",
  description: "Curated collections of wildlife and nature merchandise: gifts for nature lovers, endangered species, zoo gift shop bestsellers, and more.",
  alternates: { canonical: `${SITE_URL}/collections` },
};

export default async function CollectionsIndexPage() {
  const collections = await getCollections();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: "Collections", href: "/collections/" }]} />

      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-3">Curated Collections</h1>
        <p className="text-foreground/70">
          Hand-picked groupings of wildlife merchandise for gifts, conservation, and style.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {collections.map((c) => (
          <Link
            key={c.slug}
            href={`/collections/${c.slug}`}
            className="bg-white rounded-lg border border-forest/10 hover:border-forest/40 hover:shadow-lg transition-all p-6"
          >
            <h2 className="font-bold text-xl text-forest mb-2">{c.name}</h2>
            <p className="text-sm text-foreground/70">{c.meta_description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

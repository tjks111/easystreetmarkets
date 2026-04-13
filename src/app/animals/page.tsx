import type { Metadata } from "next";
import { getAnimals } from "@/lib/data";
import AnimalCard from "@/components/AnimalCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SITE_URL } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Animal Directory — 60+ Species",
  description: "Browse 60+ wildlife species with educational content, conservation status, and curated merchandise. From elephants to monarch butterflies.",
  alternates: { canonical: `${SITE_URL}/animals/` },
};

export default async function AnimalDirectoryPage() {
  const animals = await getAnimals();

  // Group by first letter
  const grouped = animals.reduce((acc, animal) => {
    const letter = animal.common_name[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(animal);
    return acc;
  }, {} as Record<string, typeof animals>);

  const letters = Object.keys(grouped).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: "Animals", href: "/animals/" }]} />

      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-3">Animal Directory</h1>
        <p className="text-foreground/70">
          {animals.length} wildlife species with educational content, IUCN conservation status, and curated merchandise.
        </p>
      </header>

      {letters.map((letter) => (
        <section key={letter} className="mb-10">
          <h2 className="text-2xl font-bold text-forest mb-4">{letter}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {grouped[letter].map((a) => (
              <AnimalCard key={a.slug} animal={a} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

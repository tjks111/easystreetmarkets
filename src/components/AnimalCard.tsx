import Link from "next/link";
import type { Animal } from "@/lib/types";

const statusColors: Record<string, string> = {
  "Least Concern": "bg-green-100 text-green-900",
  "Near Threatened": "bg-yellow-100 text-yellow-900",
  Vulnerable: "bg-orange-100 text-orange-900",
  Endangered: "bg-red-100 text-red-900",
  "Critically Endangered": "bg-red-200 text-red-950",
  Extinct: "bg-gray-200 text-gray-900",
};

export default function AnimalCard({ animal }: { animal: Animal }) {
  const statusClass = animal.conservation_status
    ? statusColors[animal.conservation_status] || "bg-gray-100 text-gray-900"
    : "";

  return (
    <Link
      href={`/animals/${animal.slug}/`}
      className="group flex flex-col bg-white rounded-lg border border-foreground/5 hover:border-forest/40 hover:shadow-lg transition-all overflow-hidden"
    >
      <div className="aspect-[4/3] bg-sand flex items-center justify-center overflow-hidden relative">
        {animal.image_url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={animal.image_url}
              alt={animal.common_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              style={{ filter: "saturate(0.85) contrast(1.05) brightness(0.98)" }}
              loading="lazy"
            />
            {/* Unified forest-tinted overlay so all photos read as one set */}
            <div
              className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-25 group-hover:opacity-10 transition-opacity duration-500"
              style={{ background: "linear-gradient(135deg, #2d4a2b 0%, #3d5d3a 50%, #5b7a4a 100%)" }}
              aria-hidden="true"
            />
            {/* Subtle vignette for depth */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ boxShadow: "inset 0 -40px 60px -20px rgba(20, 35, 18, 0.45)" }}
              aria-hidden="true"
            />
          </>
        ) : (
          <div className="text-6xl">🌿</div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col gap-2">
        <h3 className="font-bold group-hover:text-forest transition-colors">
          {animal.common_name}
        </h3>
        {animal.scientific_name && (
          <p className="text-xs text-foreground/60 italic">{animal.scientific_name}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-2 gap-2">
          {animal.conservation_status && (
            <span className={`text-xs px-2 py-0.5 rounded ${statusClass}`}>
              {animal.conservation_status}
            </span>
          )}
          {animal.product_count > 0 && (
            <span className="text-xs text-foreground/60">
              {animal.product_count} products
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

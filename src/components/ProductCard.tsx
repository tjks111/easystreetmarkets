import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice, SOURCE_LABELS, capitalize } from "@/lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  const sourceLabel = SOURCE_LABELS[product.source] || capitalize(product.source);

  return (
    <a
      href={`/go/${product.slug}/`}
      target="_blank"
      rel="sponsored nofollow noopener"
      className="group flex flex-col bg-white rounded-lg border border-foreground/5 hover:border-forest/40 hover:shadow-lg transition-all overflow-hidden"
    >
      <div className="aspect-square bg-sand flex items-center justify-center overflow-hidden">
        {product.image_url && !product.image_url.includes("placeholder") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            loading="lazy"
          />
        ) : (
          <div className="text-5xl opacity-40">🌿</div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col gap-2">
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-forest transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="font-semibold text-forest">
            {formatPrice(product.price_min, product.price_max)}
          </span>
          <span className="text-xs text-foreground/60 bg-sand px-2 py-1 rounded">
            {sourceLabel}
          </span>
        </div>
        {product.rating && (
          <div className="text-xs text-foreground/60">
            ⭐ {product.rating.toFixed(1)} {product.review_count > 0 && `(${product.review_count})`}
          </div>
        )}
      </div>
    </a>
  );
}

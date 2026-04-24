import type { Product } from "@/lib/types";
import { formatPrice, SOURCE_LABELS, capitalize } from "@/lib/utils";
import PodCardInteractive from "./PodCardInteractive";

// Map animal slug to emoji for branded fallback
const ANIMAL_EMOJI: Record<string, string> = {
  elephant: "🐘",
  wolf: "🐺",
  bear: "🐻",
  "bald-eagle": "🦅",
  tiger: "🐅",
  deer: "🦌",
  owl: "🦉",
  "sea-turtle": "🐢",
  dolphin: "🐬",
  "monarch-butterfly": "🦋",
  fox: "🦊",
  hummingbird: "🐦",
  whale: "🐋",
  shark: "🦈",
  penguin: "🐧",
  flamingo: "🦩",
  otter: "🦦",
  lion: "🦁",
  moose: "🫎",
  frog: "🐸",
  rabbit: "🐰",
  bison: "🦬",
  raccoon: "🦝",
  elk: "🦌",
  squirrel: "🐿️",
  octopus: "🐙",
  snake: "🐍",
  dragonfly: "🦗",
  bee: "🐝",
  ladybug: "🐞",
  dinosaur: "🦕",
  cardinal: "🐦",
  hawk: "🦅",
  pelican: "🦢",
  parrot: "🦜",
  starfish: "⭐",
  "polar-bear": "🐻‍❄️",
  gorilla: "🦍",
  panda: "🐼",
  koala: "🐨",
  cheetah: "🐆",
  sloth: "🦥",
};

const CATEGORY_EMOJI: Record<string, string> = {
  "t-shirts": "👕",
  mugs: "☕",
  signs: "🪧",
  "tote-bags": "👜",
  "art-prints": "🖼️",
  magnets: "🧲",
  caps: "🧢",
  stickers: "🏷️",
};

export default function ProductCard({ product }: { product: Product }) {
  const sourceLabel = SOURCE_LABELS[product.source] || capitalize(product.source);
  const hasRealImage =
    product.image_url &&
    !product.image_url.includes("placeholder") &&
    !product.image_url.endsWith("/placeholder.jpg");

  const animalEmoji = product.animal ? ANIMAL_EMOJI[product.animal] : null;
  const categoryEmoji = CATEGORY_EMOJI[product.category] || "🌿";

  const cardContent = (
    <div className="h-full flex flex-col">
      <div className="aspect-square bg-gradient-to-br from-sand to-cream flex items-center justify-center overflow-hidden relative">
        {hasRealImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url!}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="text-6xl">{animalEmoji || categoryEmoji}</div>
            {animalEmoji && (
              <div className="text-2xl opacity-50">{categoryEmoji}</div>
            )}
          </div>
        )}
        <span className="absolute top-2 right-2 text-[10px] text-white bg-forest/80 px-2 py-0.5 rounded-full uppercase tracking-wide">
          {sourceLabel}
        </span>
      </div>
      <div className="p-4 flex-1 flex flex-col gap-2">
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-forest transition-colors min-h-[2.5rem]">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="font-semibold text-forest">
            {formatPrice(product.price_min, product.price_max)}
          </span>
          {product.rating && (
            <span className="text-xs text-foreground/60">
              ⭐ {product.rating.toFixed(1)}
              {product.review_count > 0 && ` (${product.review_count})`}
            </span>
          )}
        </div>
        {product.product_type === 'pod' && product.stripe_price_id && product.price_min && (
          <div className="w-full mt-2 bg-forest text-cream py-2 rounded font-medium group-hover:bg-forest/90 transition-colors z-10 relative text-center flex items-center justify-center pointer-events-none">
            Select Options
          </div>
        )}
      </div>
    </div>
  );

  const className = "group flex flex-col bg-white rounded-lg border border-foreground/5 hover:border-forest/40 hover:shadow-lg transition-all overflow-hidden h-full";

  if (product.product_type === 'pod') {
    return (
      <div className={className}>
        <PodCardInteractive product={product} className="w-full h-full text-left cursor-pointer focus:outline-none">
          {cardContent}
        </PodCardInteractive>
      </div>
    );
  }

  return (
    <a
      href={`/go/${product.slug}`}
      target="_blank"
      rel="sponsored nofollow noopener"
      className={className}
    >
      {cardContent}
    </a>
  );
}

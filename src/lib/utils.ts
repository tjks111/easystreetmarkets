export function formatPrice(min: number | null, max: number | null): string {
  if (min === null && max === null) return "Price varies";
  if (min !== null && max !== null && min === max) return `$${min.toFixed(2)}`;
  if (min !== null && max !== null) return `$${min.toFixed(2)} - $${max.toFixed(2)}`;
  if (min !== null) return `From $${min.toFixed(2)}`;
  return `Up to $${max!.toFixed(2)}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function capitalize(text: string): string {
  return text
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export const SITE_URL = "https://easystreetmarkets.com";
export const SITE_NAME = "Easy Street Markets";
export const SITE_DESCRIPTION =
  "Wildlife & nature merchandise — curated, compared, honest. Find the best wildlife t-shirts, mugs, signs, art prints, and more from 700K+ artists across Amazon, Redbubble, and Etsy.";

export const CATEGORIES = [
  "t-shirts",
  "mugs",
  "signs",
  "tote-bags",
  "art-prints",
  "magnets",
  "caps",
  "stickers",
] as const;

export type CategorySlug = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<string, string> = {
  "t-shirts": "T-Shirts",
  mugs: "Mugs",
  signs: "Signs",
  "tote-bags": "Tote Bags",
  "art-prints": "Art Prints",
  magnets: "Magnets",
  caps: "Caps & Hats",
  stickers: "Stickers",
};

export const SOURCE_LABELS: Record<string, string> = {
  amazon: "Amazon",
  redbubble: "Redbubble",
  etsy: "Etsy",
  teepublic: "TeePublic",
  society6: "Society6",
  "printful-own": "Easy Street Originals",
};

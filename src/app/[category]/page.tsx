import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategory } from "@/lib/data";
import { CATEGORIES, CATEGORY_LABELS, SITE_URL } from "@/lib/utils";
import { getCategoryOverrides } from "@/lib/guide-content";
import CategoryTemplate from "@/components/CategoryTemplate";

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
  
  const overrides = getCategoryOverrides(category);
  const canonicalUrl = `${SITE_URL}/${category}`;

  return {
    title: overrides?.title || `Best Wildlife ${label} (Top Picks & Gifts) | Easy Street Markets`,
    description: overrides?.editorialText || cat.meta_description ||
      `Compare the best wildlife ${label.toLowerCase()} from Amazon, Redbubble, Etsy, and independent brands.`,
    alternates: { canonical: canonicalUrl },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    notFound();
  }

  return <CategoryTemplate category={category} page={1} />;
}
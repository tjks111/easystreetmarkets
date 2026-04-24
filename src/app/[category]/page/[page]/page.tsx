import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategory } from "@/lib/data";
import { CATEGORIES, CATEGORY_LABELS, SITE_URL } from "@/lib/utils";
import CategoryTemplate from "@/components/CategoryTemplate";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; page: string }>;
}): Promise<Metadata> {
  const { category, page: pageStr } = await params;
  const page = parseInt(pageStr, 10);

  if (isNaN(page) || page < 2) {
    return {};
  }

  const cat = await getCategory(category);
  if (!cat) return {};
  const label = CATEGORY_LABELS[category] || cat.name;

  const canonicalUrl = `${SITE_URL}/${category}/page/${page}`;

  return {
    title: `Best Wildlife ${label} — Curated & Compared (Page ${page})`,
    description:
      cat.meta_description ||
      `Compare the best wildlife ${label.toLowerCase()} from Amazon, Redbubble, Etsy, and independent brands.`,
    alternates: { canonical: canonicalUrl },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function PaginatedCategoryPage({
  params,
}: {
  params: Promise<{ category: string; page: string }>;
}) {
  const { category, page: pageStr } = await params;
  const page = parseInt(pageStr, 10);

  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    notFound();
  }

  if (isNaN(page) || page < 2) {
    notFound();
  }

  return <CategoryTemplate category={category} page={page} />;
}
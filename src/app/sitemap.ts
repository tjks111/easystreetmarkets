import type { MetadataRoute } from "next";
import { getCategories, getAnimals, getIntersectionKeys, getCollections, getBlogPosts } from "@/lib/data";
import { SITE_URL } from "@/lib/utils";

// Force dynamic rendering so new products propagate to the sitemap immediately.
// Google only crawls this a few times per day and users never hit it, so the
// per-request Supabase cost is trivial. Caching it at the edge (via revalidate)
// leaves the sitemap stale for up to an hour after catalog expansions.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, animals, intersectionKeys, collections, blogPosts] = await Promise.all([
    getCategories(),
    getAnimals(),
    getIntersectionKeys(),
    getCollections(),
    getBlogPosts(),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}`, lastModified: now, priority: 1.0, changeFrequency: "daily" },
    { url: `${SITE_URL}/animals`, lastModified: now, priority: 0.8, changeFrequency: "weekly" },
    { url: `${SITE_URL}/collections`, lastModified: now, priority: 0.8, changeFrequency: "weekly" },
    { url: `${SITE_URL}/blog`, lastModified: now, priority: 0.8, changeFrequency: "weekly" },
    { url: `${SITE_URL}/about`, lastModified: now, priority: 0.5, changeFrequency: "monthly" },
    { url: `${SITE_URL}/about/tim`, lastModified: now, priority: 0.5, changeFrequency: "monthly" },
  ];

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.published_at),
    priority: 0.8,
    changeFrequency: "monthly",
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/${c.slug}`,
    lastModified: now,
    priority: 0.9,
    changeFrequency: "daily",
  }));

  const animalRoutes: MetadataRoute.Sitemap = animals.map((a) => ({
    url: `${SITE_URL}/animals/${a.slug}`,
    lastModified: now,
    priority: 0.7,
    changeFrequency: "weekly",
  }));

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((c) => ({
    url: `${SITE_URL}/collections/${c.slug}`,
    lastModified: now,
    priority: 0.8,
    changeFrequency: "weekly",
  }));

  // Intersection pages: category x animal where products exist
  const intersectionSet = new Set<string>();
  intersectionKeys.forEach((p) => {
    if (p.animal) {
      intersectionSet.add(`${p.category}/${p.animal}`);
    }
  });
  const intersectionRoutes: MetadataRoute.Sitemap = Array.from(intersectionSet).map((key) => ({
    url: `${SITE_URL}/${key}`,
    lastModified: now,
    priority: 0.7,
    changeFrequency: "weekly",
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...collectionRoutes,
    ...blogRoutes,
    ...animalRoutes,
    ...intersectionRoutes,
  ];
}

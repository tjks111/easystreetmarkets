import { supabase } from "./supabase";
import type { Product, Category, Animal, Collection, BlogPost } from "./types";

// Categories
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getCategory(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data;
}

// Animals
export async function getAnimals(): Promise<Animal[]> {
  const { data, error } = await supabase
    .from("animals")
    .select("*")
    .order("common_name");
  if (error) throw error;
  return data ?? [];
}

export async function getAnimal(slug: string): Promise<Animal | null> {
  const { data, error } = await supabase
    .from("animals")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data;
}

// Product display projection — excludes heavy text fields (description, tags,
// source_url, affiliate_url) that aren't used by list/grid/editorial rendering.
// Keeping the payload small matters on Cloudflare Workers (128MB memory cap).
const PRODUCT_LIST_FIELDS =
  "id,slug,name,category,subcategory,animal,image_url,price_min,price_max,source,is_featured,rating,review_count,in_stock,created_at,updated_at";

// Products
export async function getProducts(filters?: {
  category?: string;
  animal?: string;
  featured?: boolean;
  limit?: number;
}): Promise<Product[]> {
  let query = supabase
    .from("products")
    .select(PRODUCT_LIST_FIELDS)
    .eq("in_stock", true);

  if (filters?.category) query = query.eq("category", filters.category);
  if (filters?.animal) query = query.eq("animal", filters.animal);
  if (filters?.featured) query = query.eq("is_featured", true);
  if (filters?.limit) query = query.limit(filters.limit);

  query = query.order("is_featured", { ascending: false }).order("rating", { ascending: false, nullsFirst: false });

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as Product[];
}

// Lightweight query for sitemap — only the fields needed to derive intersection URLs.
// Paginates around Supabase PostgREST's 1,000-row default cap so the full catalog
// is reflected in the sitemap, not just the first 1,000 rows.
export async function getIntersectionKeys(): Promise<Array<{ category: string; animal: string }>> {
  const CHUNK = 1000;
  const combos = new Set<string>();
  for (let offset = 0; offset < 20000; offset += CHUNK) {
    const { data, error } = await supabase
      .from("products")
      .select("category,animal")
      .eq("in_stock", true)
      .not("animal", "is", null)
      .range(offset, offset + CHUNK - 1);
    if (error) return Array.from(combos).map(parseCombo);
    const rows = (data ?? []) as Array<{ category: string; animal: string }>;
    for (const r of rows) {
      if (r.animal) combos.add(`${r.category}|${r.animal}`);
    }
    if (rows.length < CHUNK) break;
  }
  return Array.from(combos).map(parseCombo);
}

function parseCombo(s: string): { category: string; animal: string } {
  const [category, animal] = s.split("|");
  return { category, animal };
}

export async function getProduct(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data;
}

export async function getProductCountByCategory(category: string): Promise<number> {
  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category", category)
    .eq("in_stock", true);
  if (error) return 0;
  return count ?? 0;
}

export async function getProductCountByAnimal(animal: string): Promise<number> {
  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("animal", animal)
    .eq("in_stock", true);
  if (error) return 0;
  return count ?? 0;
}

// Get unique animals that have products in a given category.
// Paginates around Supabase's 1,000-row cap so categories with >1,000 products
// (t-shirts at 1,030+) don't silently drop animal slugs.
export async function getAnimalsForCategory(category: string): Promise<string[]> {
  const CHUNK = 1000;
  const unique = new Set<string>();
  for (let offset = 0; offset < 20000; offset += CHUNK) {
    const { data, error } = await supabase
      .from("products")
      .select("animal")
      .eq("category", category)
      .eq("in_stock", true)
      .not("animal", "is", null)
      .range(offset, offset + CHUNK - 1);
    if (error) break;
    const rows = data ?? [];
    for (const r of rows) if (r.animal) unique.add(r.animal as string);
    if (rows.length < CHUNK) break;
  }
  return Array.from(unique).sort();
}

// Get categories that have products for a given animal.
// Paginates for consistency, though any single animal is unlikely to exceed 1,000
// products in practice (current max is elephant at ~100).
export async function getCategoriesForAnimal(animal: string): Promise<string[]> {
  const CHUNK = 1000;
  const unique = new Set<string>();
  for (let offset = 0; offset < 20000; offset += CHUNK) {
    const { data, error } = await supabase
      .from("products")
      .select("category")
      .eq("animal", animal)
      .eq("in_stock", true)
      .range(offset, offset + CHUNK - 1);
    if (error) break;
    const rows = data ?? [];
    for (const r of rows) unique.add(r.category);
    if (rows.length < CHUNK) break;
  }
  return Array.from(unique).sort();
}

// Collections
export async function getCollections(): Promise<Collection[]> {
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getCollection(slug: string): Promise<Collection | null> {
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data;
}

// Blog Posts
export async function getBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data;
}

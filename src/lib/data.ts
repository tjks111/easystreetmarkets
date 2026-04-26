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
  "id,slug,name,category,subcategory,animal,image_url,price_min,price_max,source,is_featured,rating,review_count,in_stock,product_type,is_own_product,stripe_price_id,variants,created_at,updated_at";

// Products
export async function getProducts(filters?: {
  category?: string;
  animal?: string;
  featured?: boolean;
  limit?: number;
  page?: number;
}): Promise<Product[]> {
  const PRIORITY_SOURCES = ["printful-own", "amazon", "ebay"];
  const limit = filters?.limit ?? 100;
  const page = filters?.page ?? 1;
  const offset = (page > 0 ? page - 1 : 0) * limit;

  // Helper to build the base query with shared filters
  const buildBaseQuery = () => {
    let q = supabase
      .from("products")
      .select(PRODUCT_LIST_FIELDS)
      .eq("in_stock", true);

    if (filters?.category) q = q.eq("category", filters.category);
    if (filters?.animal) q = q.eq("animal", filters.animal);
    if (filters?.featured) q = q.eq("is_featured", true);

    return q
      .order("is_own_product", { ascending: false, nullsFirst: false })
      .order("is_featured", { ascending: false, nullsFirst: false })
      .order("rating", { ascending: false, nullsFirst: false });
  };

  // We need the total count of priority products matching the filters to know how to paginate
  let countQuery = supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("in_stock", true)
    .in("source", PRIORITY_SOURCES);
    
  if (filters?.category) countQuery = countQuery.eq("category", filters.category);
  if (filters?.animal) countQuery = countQuery.eq("animal", filters.animal);
  if (filters?.featured) countQuery = countQuery.eq("is_featured", true);

  const { count: priorityCount, error: countError } = await countQuery;
  if (countError) throw countError;
  const pCount = priorityCount || 0;

  let results: Product[] = [];

  // Case 1: The entire requested page starts within priority products
  if (offset < pCount) {
    let pQuery = buildBaseQuery()
      .in("source", PRIORITY_SOURCES)
      .range(offset, offset + limit - 1);
      
    const { data: pData, error: pError } = await pQuery;
    if (pError) throw pError;
    
    results = (pData ?? []) as unknown as Product[];

    // If we need more to fill the limit, fetch from others starting at offset 0
    if (results.length < limit) {
      const remainingLimit = limit - results.length;
      let oQuery = buildBaseQuery()
        .not("source", "in", `(${PRIORITY_SOURCES.map(s => `"${s}"`).join(",")})`)
        .range(0, remainingLimit - 1);
        
      const { data: oData, error: oError } = await oQuery;
      if (oError) throw oError;
      
      results = [...results, ...((oData ?? []) as unknown as Product[])];
    }
  }
  // Case 2: The requested page is entirely within other products
  else {
    const othersOffset = offset - pCount;
    let oQuery = buildBaseQuery()
      .not("source", "in", `(${PRIORITY_SOURCES.map(s => `"${s}"`).join(",")})`)
      .range(othersOffset, othersOffset + limit - 1);
      
    const { data: oData, error: oError } = await oQuery;
    if (oError) throw oError;
    
    results = (oData ?? []) as unknown as Product[];
  }

  return results;
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

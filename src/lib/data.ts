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

// Products
export async function getProducts(filters?: {
  category?: string;
  animal?: string;
  featured?: boolean;
  limit?: number;
}): Promise<Product[]> {
  let query = supabase.from("products").select("*").eq("in_stock", true);

  if (filters?.category) query = query.eq("category", filters.category);
  if (filters?.animal) query = query.eq("animal", filters.animal);
  if (filters?.featured) query = query.eq("is_featured", true);
  if (filters?.limit) query = query.limit(filters.limit);

  query = query.order("is_featured", { ascending: false }).order("rating", { ascending: false, nullsFirst: false });

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
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

// Get unique animals that have products in a given category
export async function getAnimalsForCategory(category: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("products")
    .select("animal")
    .eq("category", category)
    .eq("in_stock", true)
    .not("animal", "is", null);
  if (error) return [];
  const unique = [...new Set((data ?? []).map((p) => p.animal as string))];
  return unique.sort();
}

// Get categories that have products for a given animal
export async function getCategoriesForAnimal(animal: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("products")
    .select("category")
    .eq("animal", animal)
    .eq("in_stock", true);
  if (error) return [];
  const unique = [...new Set((data ?? []).map((p) => p.category))];
  return unique.sort();
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

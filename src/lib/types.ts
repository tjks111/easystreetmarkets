export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  animal: string | null;
  image_url: string | null;
  price_min: number | null;
  price_max: number | null;
  source: string;
  affiliate_url: string | null;
  source_url: string | null;
  is_own_product: boolean;
  is_featured: boolean;
  tags: string[] | null;
  rating: number | null;
  review_count: number;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  slug: string;
  name: string;
  description: string | null;
  meta_description: string | null;
  image_url: string | null;
  product_count: number;
  created_at: string;
}

export interface Animal {
  slug: string;
  common_name: string;
  scientific_name: string | null;
  family: string | null;
  order_name: string | null;
  conservation_status: string | null;
  habitat: string | null;
  description: string | null;
  fun_fact: string | null;
  image_url: string | null;
  image_attribution: string | null;
  product_count: number;
  created_at: string;
}

export interface Collection {
  slug: string;
  name: string;
  description: string | null;
  meta_description: string | null;
  image_url: string | null;
  product_ids: string[] | null;
  created_at: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  meta_description: string | null;
  image_url: string | null;
  author: string;
  published_at: string;
  created_at: string;
}

import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  // Fetch all POD products to get their images and variants
  // We use range to paginate if there are many products
  let allProducts: any[] = [];
  const CHUNK = 1000;
  for (let offset = 0; offset < 20000; offset += CHUNK) {
    const { data, error } = await supabase
      .from('products')
      .select('slug, category, image_url, variants')
      .not('image_url', 'is', null)
      .range(offset, offset + CHUNK - 1);
      
    if (error) {
      console.error("Error fetching products for image sitemap:", error);
      break;
    }
    
    if (data) {
      allProducts = allProducts.concat(data);
    }
    
    if (!data || data.length < CHUNK) break;
  }

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://easystreetmarkets.com';

  // Build the XML content
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  // We group images by category page, as the products appear on their category grid
  const categoryImages: Record<string, string[]> = {};

  allProducts.forEach((product) => {
    const catUrl = `${BASE_URL}/${product.category}`;
    if (!categoryImages[catUrl]) {
      categoryImages[catUrl] = [];
    }
    
    // Add main image
    if (product.image_url && product.image_url.includes('supabase')) {
      categoryImages[catUrl].push(product.image_url);
    }
    
    // Add variant images
    if (product.variants && Array.isArray(product.variants)) {
      product.variants.forEach((v: any) => {
        if (v.image_url && v.image_url.includes('supabase') && v.image_url !== product.image_url) {
          categoryImages[catUrl].push(v.image_url);
        }
      });
    }
  });

  // Create <url> entries for each category page containing its images
  for (const [pageUrl, images] of Object.entries(categoryImages)) {
    if (images.length === 0) continue;
    
    xml += `  <url>\n`;
    xml += `    <loc>${pageUrl}</loc>\n`;
    
    // Deduplicate images for this page
    const uniqueImages = Array.from(new Set(images));
    
    uniqueImages.forEach((imgUrl) => {
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${imgUrl}</image:loc>\n`;
      xml += `    </image:image>\n`;
    });
    
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
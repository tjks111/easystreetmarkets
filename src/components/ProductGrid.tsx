import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-foreground/60">
        <p>No products found. Check back soon — we add products daily.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((p) => (
        <div key={p.id}>
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}

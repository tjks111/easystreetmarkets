import Link from "next/link";
import { CATEGORY_LABELS, SITE_NAME } from "@/lib/utils";

export default function Nav() {
  const categories = Object.entries(CATEGORY_LABELS);

  return (
    <header className="bg-cream border-b border-forest/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-forest text-lg shrink-0">
            <span className="text-2xl">🌿</span>
            <span className="hidden sm:inline">{SITE_NAME}</span>
            <span className="sm:hidden">ESM</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/animals/" className="hover:text-forest transition-colors">
              Animals
            </Link>
            <Link href="/collections/" className="hover:text-forest transition-colors">
              Collections
            </Link>
            <Link href="/blog/" className="hover:text-forest transition-colors">
              Blog
            </Link>
            <Link href="/about/" className="hover:text-forest transition-colors">
              About
            </Link>
          </nav>
        </div>
        <nav className="mt-3 flex items-center gap-1 overflow-x-auto pb-1 text-sm">
          {categories.map(([slug, label]) => (
            <Link
              key={slug}
              href={`/${slug}/`}
              className="px-3 py-1 rounded-full hover:bg-forest hover:text-white transition-colors whitespace-nowrap"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

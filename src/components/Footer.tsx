import Link from "next/link";
import { SITE_NAME, CATEGORY_LABELS } from "@/lib/utils";

export default function Footer() {
  const categories = Object.entries(CATEGORY_LABELS);

  return (
    <footer className="bg-forest-dark text-white/80 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <h3 className="font-bold text-white text-lg mb-2">{SITE_NAME}</h3>
          <p className="text-sm text-white/70">
            Wildlife &amp; nature merchandise curated from Amazon, Redbubble, Etsy, and
            independent artists. Since 2003.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Categories</h4>
          <ul className="space-y-2 text-sm">
            {categories.map(([slug, label]) => (
              <li key={slug}>
                <Link href={`/${slug}/`} className="hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Discover</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/animals/" className="hover:text-white">Animal Directory</Link></li>
            <li><Link href="/collections/" className="hover:text-white">Curated Collections</Link></li>
            <li><Link href="/blog/" className="hover:text-white">Blog</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">About</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about/" className="hover:text-white">About Us</Link></li>
            <li><Link href="/about/tim/" className="hover:text-white">Author</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-6 text-center text-xs text-white/60">
        <p>&copy; {new Date().getFullYear()} {SITE_NAME}. Established 2003, relaunched 2026.</p>
        <p className="mt-1">
          Wildlife illustrations from the Biodiversity Heritage Library. Conservation data from the IUCN Red List.
        </p>
        <p className="mt-1">
          As an Amazon Associate we earn from qualifying purchases. No vendor pays for placement.
        </p>
      </div>
    </footer>
  );
}

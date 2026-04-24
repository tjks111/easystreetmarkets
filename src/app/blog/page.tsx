import Link from "next/link";
import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/data";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SITE_URL } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog — Wildlife Merchandise Guides, Reviews & Commentary",
  description: "Honest writing about the wildlife merchandise market: the Safari Scroll, the Plumage Problem, the Extinction Shelf, and more.",
  alternates: { canonical: `${SITE_URL}/blog` },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogIndexPage() {
  const posts = await getBlogPosts();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: "Blog", href: "/blog/" }]} />

      <header className="mb-10">
        <h1 className="text-4xl font-bold mb-3">The Easy Street Markets Blog</h1>
        <p className="text-foreground/70 text-lg">
          Honest writing about wildlife merchandise, the markets that make it, and the buyers they fail.
        </p>
      </header>

      <div className="space-y-8">
        {posts.map((post) => (
          <article key={post.slug} className="bg-white rounded-lg border border-forest/10 p-6 hover:border-forest/40 hover:shadow-lg transition-all">
            <Link href={`/blog/${post.slug}`} className="block">
              <time className="text-xs text-foreground/60">{formatDate(post.published_at)}</time>
              <h2 className="text-2xl font-bold text-forest mt-2 mb-3 hover:underline">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="text-foreground/80 leading-relaxed">{post.excerpt}</p>
              )}
              <div className="mt-4 text-sm text-forest font-medium">Read the post →</div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

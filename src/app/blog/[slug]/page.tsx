import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getBlogPost, getBlogPosts } from "@/lib/data";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SITE_URL, SITE_NAME } from "@/lib/utils";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.meta_description ?? post.excerpt ?? undefined,
    alternates: { canonical: `${SITE_URL}/blog/${slug}/` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt ?? undefined,
      publishedTime: post.published_at,
      authors: [post.author],
    },
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const paragraphs = post.content.split("\n\n");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Blog", href: "/blog/" },
          { label: post.title, href: `/blog/${slug}/` },
        ]}
      />

      <article>
        <header className="mb-8">
          <time className="text-sm text-foreground/60">{formatDate(post.published_at)}</time>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 leading-tight">{post.title}</h1>
          {post.excerpt && (
            <p className="text-xl text-foreground/70 mt-4 leading-relaxed">{post.excerpt}</p>
          )}
          <p className="mt-4 text-sm text-foreground/60">
            By{" "}
            <Link href="/about/tim/" className="text-forest hover:underline">
              {post.author}
            </Link>
          </p>
        </header>

        <div className="prose prose-lg max-w-none">
          {paragraphs.map((p, i) => (
            <p key={i} className="mb-5 leading-relaxed text-foreground/90">
              {p}
            </p>
          ))}
        </div>

        <footer className="mt-12 pt-8 border-t border-foreground/10">
          <p className="text-foreground/70 mb-4">
            Start comparing: browse the{" "}
            <Link href="/animals/" className="text-forest underline">animal directory</Link>
            , or check out our{" "}
            <Link href="/collections/" className="text-forest underline">curated collections</Link>.
          </p>
        </footer>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: post.title,
              description: post.excerpt,
              datePublished: post.published_at,
              author: {
                "@type": "Person",
                "@id": `${SITE_URL}/about/tim/#person`,
                name: post.author,
                url: `${SITE_URL}/about/tim/`,
              },
              publisher: { "@id": `${SITE_URL}/#organization` },
              mainEntityOfPage: `${SITE_URL}/blog/${slug}/`,
            }),
          }}
        />
      </article>
    </div>
  );
}

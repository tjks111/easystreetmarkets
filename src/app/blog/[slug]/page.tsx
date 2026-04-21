import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getBlogPost, getBlogPosts } from "@/lib/data";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SITE_URL } from "@/lib/utils";
import { articleSchema } from "@/lib/schema";

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

function getTopicsForSlug(slug: string): string[] {
  if (slug.includes("elephant")) return ["https://en.wikipedia.org/wiki/Elephant", "https://www.wikidata.org/wiki/Q7378"];
  if (slug.includes("turtle") || slug.includes("sea-turtle")) return ["https://en.wikipedia.org/wiki/Sea_turtle", "https://www.wikidata.org/wiki/Q219350"];
  if (slug.includes("wolf")) return ["https://en.wikipedia.org/wiki/Wolf", "https://www.wikidata.org/wiki/Q184"];
  if (slug.includes("bear")) return ["https://en.wikipedia.org/wiki/Bear", "https://www.wikidata.org/wiki/Q12126"];
  if (slug.includes("shark")) return ["https://en.wikipedia.org/wiki/Shark", "https://www.wikidata.org/wiki/Q7372"];
  if (slug.includes("whale")) return ["https://en.wikipedia.org/wiki/Whale", "https://www.wikidata.org/wiki/Q168"];
  if (slug.includes("lion")) return ["https://en.wikipedia.org/wiki/Lion", "https://www.wikidata.org/wiki/Q140"];
  if (slug.includes("tiger")) return ["https://en.wikipedia.org/wiki/Tiger", "https://www.wikidata.org/wiki/Q19939"];
  if (slug.includes("penguin")) return ["https://en.wikipedia.org/wiki/Penguin", "https://www.wikidata.org/wiki/Q1048"];
  if (slug.includes("dolphin")) return ["https://en.wikipedia.org/wiki/Dolphin", "https://www.wikidata.org/wiki/Q7369"];
  // General wildlife fallback
  return ["https://en.wikipedia.org/wiki/Wildlife", "https://www.wikidata.org/wiki/Q196299"];
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const topicEntities = getTopicsForSlug(slug);
  const schema = articleSchema(post, topicEntities);

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

        <div className="prose prose-lg max-w-none prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3 prose-p:leading-relaxed prose-p:text-foreground/90 prose-p:mb-5 prose-a:text-forest prose-a:underline hover:prose-a:text-forest/80 prose-img:rounded-lg prose-img:my-6 prose-table:text-sm prose-th:bg-sand prose-th:p-2 prose-th:text-left prose-td:p-2 prose-td:border prose-td:border-foreground/10 prose-ul:my-4 prose-ol:my-4 prose-li:my-1">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
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
            __html: JSON.stringify(schema),
          }}
        />
      </article>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SITE_URL, SITE_NAME } from "@/lib/utils";
import { getBlogPosts } from "@/lib/data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About Tim — Founder & Curator",
  description: "Tim is a GTM engineer who rebuilt Easy Street Markets in 2026 as the internet's first wildlife merchandise comparison directory.",
  alternates: { canonical: `${SITE_URL}/about/tim/` },
};

export default async function AuthorPage() {
  const posts = await getBlogPosts();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "About", href: "/about/" },
          { label: "Tim", href: "/about/tim/" },
        ]}
      />

      <article className="prose prose-forest max-w-none">
        <h1 className="text-4xl font-bold mb-6">Tim</h1>
        <p className="text-xl text-foreground/70 mb-6">
          Founder &amp; curator, {SITE_NAME}
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-3">Background</h2>
        <p className="mb-4 leading-relaxed text-foreground/80">
          I&apos;m a GTM engineer based in South Africa, building outbound and content
          systems for B2B SaaS companies with AI and automation. I rebuild expired domains
          with original authority into content brands that solve navigation problems for
          specific audiences.
        </p>
        <p className="mb-4 leading-relaxed text-foreground/80">
          I acquired easystreetmarkets.com in 2026. It had been an online wildlife merchandise
          store for twenty years before going dark in 2023, supplied by Atlas Screen Printing
          in Gainesville, Florida. The domain still had traffic, business citations across Yellow
          Pages, Superpages, and BBB, and an audience who kept visiting long after the store
          stopped selling. I rebuilt it as a comparison directory because that is what the
          wildlife merchandise market has always needed and never had.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-3">What I Actually Do Here</h2>
        <p className="mb-4 leading-relaxed text-foreground/80">
          I write the editorial content, curate the product lineups, maintain the animal
          database (species, conservation status, educational facts), and decide which brands
          earn placement. Every product on this site was added because it met a specific bar:
          recognizable as the animal it depicts, produced on quality materials, and sold by
          a vendor that meets our transparency standards.
        </p>
        <p className="mb-4 leading-relaxed text-foreground/80">
          I don&apos;t accept payment for placement. I don&apos;t feature products because
          a vendor offered a higher affiliate commission. When I recommend a print method
          or a brand, I have verified it myself.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-3">Areas I Know</h2>
        <ul className="list-disc pl-6 mb-6 space-y-1 text-foreground/80">
          <li>Programmatic SEO and content-driven directory sites</li>
          <li>Wildlife merchandise markets (apparel, print-on-demand, affiliate networks)</li>
          <li>Conservation data sourcing (IUCN Red List, AZA, USFWS)</li>
          <li>Public domain wildlife illustrations (Biodiversity Heritage Library)</li>
          <li>Outbound GTM systems for B2B SaaS</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-3">Posts I&apos;ve Written</h2>
        <ul className="list-disc pl-6 mb-6 space-y-2 text-foreground/80">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}/`} className="text-forest underline">
                {post.title}
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-3">Get in Touch</h2>
        <p className="mb-4 leading-relaxed text-foreground/80">
          If you run a wildlife art brand, a conservation nonprofit, or a zoo/museum gift
          shop and want to talk about placement, partnerships, or wholesale — or if you&apos;re
          a nature enthusiast with a product recommendation or a correction on any of our
          animal pages — I read every message.
        </p>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "@id": `${SITE_URL}/about/tim/#person`,
            name: "Tim",
            jobTitle: "Founder & Curator",
            worksFor: { "@id": `${SITE_URL}/#organization` },
            url: `${SITE_URL}/about/tim/`,
            knowsAbout: [
              "Wildlife merchandise",
              "Programmatic SEO",
              "Conservation data",
              "Biodiversity Heritage Library",
              "Affiliate marketing",
              "Content brand building",
            ],
          }),
        }}
      />
    </div>
  );
}

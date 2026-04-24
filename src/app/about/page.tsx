import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SITE_URL, SITE_NAME } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About Easy Street Markets",
  description: "Founded 2003 in Gainesville, FL as a wildlife merchandise store. Relaunched 2026 as the internet's first wildlife merchandise comparison directory.",
  alternates: { canonical: `${SITE_URL}/about` },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: "About", href: "/about/" }]} />

      <article className="prose prose-forest">
        <h1 className="text-4xl font-bold mb-6">About {SITE_NAME}</h1>

        <h2 className="text-2xl font-bold mt-8 mb-3">Est. 2003. Relaunched 2026.</h2>
        <p className="mb-4 leading-relaxed text-foreground/80">
          Easy Street Markets was founded in 2003 in Gainesville, Florida, as an online store
          selling screen-printed wildlife and nature merchandise. For twenty years, we sold
          wildlife t-shirts, mugs, crossing signs, and tote bags to zoo visitors, nature lovers,
          and gift shop buyers across the United States. Our products were supplied by Atlas
          Screen Printing (wildcotton.com), a family-run print shop that is still in operation
          today.
        </p>
        <p className="mb-4 leading-relaxed text-foreground/80">
          In 2023 the original store went dark. In 2026, we brought the domain back — but instead
          of rebuilding another storefront, we built something the wildlife merchandise market
          has been missing for twenty years: a comparison directory.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-3">Why A Comparison Directory?</h2>
        <p className="mb-4 leading-relaxed text-foreground/80">
          209 million Americans visit zoos every year. 96 million are active birdwatchers. Across
          every demographic, interest in wildlife, conservation, and nature has never been higher.
          And yet when someone sees an elephant at the zoo and wants to buy a shirt featuring one
          later, the online experience is a mess. Thousands of Amazon results, thousands of Etsy
          shops, thousands of Redbubble artists, no curation, no comparison, no guide.
        </p>
        <p className="mb-4 leading-relaxed text-foreground/80">
          74% of online shoppers abandon their cart from choice overload. That is the exact
          problem we exist to solve for wildlife merchandise. We call it{" "}
          <em>The Safari Scroll</em>, and we built this directory to end it.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-3">How We Make Money</h2>
        <p className="mb-4 leading-relaxed text-foreground/80">
          When you click a product and buy it from Amazon, Redbubble, Etsy, or any other seller,
          we may earn a small commission. That is our only revenue source. Every product link
          includes affiliate tracking, which adds nothing to your cost — the seller pays us a
          small percentage of their margin in exchange for the referral.
        </p>
        <p className="mb-4 leading-relaxed text-foreground/80">
          <strong>Here is what we do not do:</strong> Accept payment for placement. Feature
          products because a vendor paid for visibility. Hide the affiliate relationship. Cherry-pick
          products based on which seller pays the highest commission.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-3">Our Sources</h2>
        <p className="mb-4 leading-relaxed text-foreground/80">
          Conservation status data comes from the{" "}
          <a href="https://www.iucnredlist.org" className="text-forest underline">IUCN Red List</a>,
          the authoritative global database on the status of species. Wildlife illustrations on
          animal pages come from the{" "}
          <a href="https://www.flickr.com/photos/biodivlibrary/" className="text-forest underline">
            Biodiversity Heritage Library
          </a>, which hosts over 250,000 public-domain wildlife illustrations from the 1700s through
          the early 1900s, freely licensed for commercial use. Product data is gathered from public
          product listings and verified manually.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-3">Contact</h2>
        <p className="mb-4 leading-relaxed text-foreground/80">
          Have a product you think we should feature? A question about a species? A request from a
          zoo or museum gift shop?{" "}
          <Link href="/about/tim" className="text-forest underline">Meet the person behind the site</Link>.
        </p>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": `${SITE_URL}/#organization`,
            name: SITE_NAME,
            url: SITE_URL,
            foundingDate: "2003",
            foundingLocation: "Gainesville, FL, USA",
            description: "Wildlife and nature merchandise comparison directory",
          }),
        }}
      />
    </div>
  );
}

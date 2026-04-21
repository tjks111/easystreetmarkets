import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "./utils";

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const PERSON_ID = `${SITE_URL}/about/tim/#person`;

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    foundingDate: "2003",
    foundingLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Gainesville",
        addressRegion: "FL",
        addressCountry: "US",
      },
    },
    sameAs: [
      "https://www.facebook.com/EasyStreetMarkets/",
      "https://www.bbb.org/us/fl/gainesville/profile/screen-printing/easy-street-markets-0403-183500883",
      "https://en.wikipedia.org/wiki/E-commerce",
      "https://www.wikidata.org/wiki/Q81307",
    ],
    founder: {
      "@id": PERSON_ID,
    },
  };
}

export function personSchema() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Tim",
    url: `${SITE_URL}/about/tim/`,
    jobTitle: "Founder",
    sameAs: [
      "https://en.wikipedia.org/wiki/Entrepreneurship",
      "https://www.wikidata.org/wiki/Q131524",
      "https://github.com/tjks111",
    ],
    worksFor: {
      "@id": ORG_ID,
    },
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    publisher: { "@id": ORG_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/animals/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function articleSchema(
  post: {
    title: string;
    excerpt?: string | null;
    published_at: string;
    author: string;
    slug: string;
  },
  topicEntities: string[] = []
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || undefined,
    datePublished: post.published_at,
    author: {
      "@type": "Person",
      "@id": PERSON_ID,
      name: post.author,
      url: `${SITE_URL}/about/tim/`,
    },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}/`,
    ...(topicEntities.length > 0 && {
      about: topicEntities.map((url) => ({
        "@type": "Thing",
        sameAs: url,
      })),
    }),
  };
}

export function graph(items: object[]) {
  return {
    "@context": "https://schema.org",
    "@graph": items,
  };
}

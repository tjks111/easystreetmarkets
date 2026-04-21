import { NextRequest, NextResponse } from "next/server";
import { getProduct } from "@/lib/data";

export const dynamic = "force-dynamic";

const AMAZON_ASSOCIATES_TAG = "tjks111-20";
const ZAZZLE_AMBASSADOR_ID = "238761723362098216";
const EBAY_CAMPAIGN_ID = "5339149507";
const EBAY_ROTATION_ID = "711-53200-19255-0"; // eBay US Partner Network rotation

// Inject affiliate tracking parameters for networks that use URL-based tracking.
// Add new store handlers here as new affiliate programs are approved.
function withAffiliateParams(rawUrl: string, productSlug?: string): string {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.toLowerCase();

    // Amazon Associates — any amazon.com URL gets the tag parameter
    if (host === "amazon.com" || host.endsWith(".amazon.com")) {
      url.searchParams.set("tag", AMAZON_ASSOCIATES_TAG);
      return url.toString();
    }

    // Zazzle Ambassador — cross-promotion mode (we don't own the shops we
    // link to), 15% commission. Works on zazzle.com + all international
    // domains (zazzle.co.uk, zazzle.ca, zazzle.com.au, zazzle.de, etc.).
    if (host === "zazzle.com" || /\.zazzle\.[a-z.]+$/.test(host) || /\bzazzle\.[a-z.]+$/.test(host)) {
      url.searchParams.set("rf", ZAZZLE_AMBASSADOR_ID);
      return url.toString();
    }

    // eBay Partner Network — campaign-based tracking with per-product customid
    // for attribution analytics. Works on ebay.com + international domains.
    if (host === "ebay.com" || /\.ebay\.[a-z.]+$/.test(host) || /\bebay\.[a-z.]+$/.test(host)) {
      url.searchParams.set("mkcid", "1");
      url.searchParams.set("mkrid", EBAY_ROTATION_ID);
      url.searchParams.set("siteid", "0");
      url.searchParams.set("campid", EBAY_CAMPAIGN_ID);
      url.searchParams.set("toolid", "10001");
      url.searchParams.set("mkevt", "1");
      if (productSlug) url.searchParams.set("customid", productSlug);
      return url.toString();
    }

    return rawUrl;
  } catch {
    return rawUrl;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product || !product.affiliate_url) {
    return NextResponse.redirect(new URL("/", _request.url), 302);
  }

  const finalUrl = withAffiliateParams(product.affiliate_url, slug);

  return NextResponse.redirect(finalUrl, {
    status: 302,
    headers: {
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "no-store",
      Link: `<${finalUrl}>; rel="sponsored"`,
    },
  });
}

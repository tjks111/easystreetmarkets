import { NextRequest, NextResponse } from "next/server";
import { getProduct } from "@/lib/data";
import { GA_ID } from "@/components/Analytics";

export const dynamic = "force-dynamic";

const AMAZON_ASSOCIATES_TAG = "tjks111-20";
const ZAZZLE_AMBASSADOR_ID = "238761723362098216";
const EBAY_CAMPAIGN_ID = "5339149507";
const EBAY_ROTATION_ID = "711-53200-19255-0"; // eBay US Partner Network rotation

// Inject affiliate tracking parameters for networks that use URL-based tracking.
// Add new store handlers here as new affiliate programs are approved.
function withAffiliateParams(rawUrl: string, productSlug?: string): { url: string, store: string } {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.toLowerCase();

    // Amazon Associates
    if (host === "amazon.com" || host.endsWith(".amazon.com")) {
      url.searchParams.set("tag", AMAZON_ASSOCIATES_TAG);
      return { url: url.toString(), store: "amazon" };
    }

    // Zazzle Ambassador
    if (host === "zazzle.com" || /\.zazzle\.[a-z.]+$/.test(host) || /\bzazzle\.[a-z.]+$/.test(host)) {
      url.searchParams.set("rf", ZAZZLE_AMBASSADOR_ID);
      return { url: url.toString(), store: "zazzle" };
    }

    // eBay Partner Network
    if (host === "ebay.com" || /\.ebay\.[a-z.]+$/.test(host) || /\bebay\.[a-z.]+$/.test(host)) {
      url.searchParams.set("mkcid", "1");
      url.searchParams.set("mkrid", EBAY_ROTATION_ID);
      url.searchParams.set("siteid", "0");
      url.searchParams.set("campid", EBAY_CAMPAIGN_ID);
      url.searchParams.set("toolid", "10001");
      url.searchParams.set("mkevt", "1");
      if (productSlug) url.searchParams.set("customid", productSlug);
      return { url: url.toString(), store: "ebay" };
    }
    
    // Etsy or others
    if (host.includes("etsy.com")) return { url: rawUrl, store: "etsy" };
    if (host.includes("redbubble.com")) return { url: rawUrl, store: "redbubble" };

    return { url: rawUrl, store: "other" };
  } catch {
    return { url: rawUrl, store: "unknown" };
  }
}

// Fire-and-forget server-side GA4 tracking via Measurement Protocol
async function trackOutboundClick(request: NextRequest, slug: string, finalUrl: string, store: string) {
  try {
    // We need a GA4 API Secret to use Measurement Protocol securely.
    // If not configured, we'll gracefully skip tracking to not break redirects.
    const apiSecret = process.env.GA4_MEASUREMENT_SECRET;
    if (!apiSecret) return;

    // Try to get client ID from cookies (_ga), fallback to IP/User-Agent hash or random UUID
    let clientId = request.cookies.get('_ga')?.value;
    if (clientId && clientId.startsWith('GA1.1.')) {
      clientId = clientId.split('GA1.1.')[1];
    } else if (clientId && clientId.startsWith('GA1.2.')) {
      clientId = clientId.split('GA1.2.')[1];
    } else {
      clientId = crypto.randomUUID();
    }

    await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${GA_ID}&api_secret=${apiSecret}`, {
      method: "POST",
      body: JSON.stringify({
        client_id: clientId,
        events: [{
          name: "outbound_click",
          params: {
            link_url: finalUrl,
            outbound_store: store,
            product_slug: slug,
            page_location: request.url
          }
        }]
      })
    });
  } catch (e) {
    // Ignore tracking errors to ensure redirect always works
    console.error("GA4 Server Tracking Error:", e);
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

  const { url: finalUrl, store } = withAffiliateParams(product.affiliate_url, slug);

  // Track the click server-side before redirecting
  // Await it so Vercel/Cloudflare doesn't kill the background promise
  await trackOutboundClick(_request, slug, finalUrl, store);

  return NextResponse.redirect(finalUrl, {
    status: 302,
    headers: {
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "no-store",
      Link: `<${finalUrl}>; rel="sponsored"`,
    },
  });
}

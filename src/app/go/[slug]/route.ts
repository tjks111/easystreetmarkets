import { NextRequest, NextResponse } from "next/server";
import { getProduct } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product || !product.affiliate_url) {
    return NextResponse.redirect(new URL("/", _request.url), 302);
  }

  return NextResponse.redirect(product.affiliate_url, {
    status: 302,
    headers: {
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "no-store",
      Link: `<${product.affiliate_url}>; rel="sponsored"`,
    },
  });
}

"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import Script from "next/script";

export const GA_ID = "G-Z75TJXZVK3";

function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
      (window as any).gtag("config", GA_ID, {
        page_path: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

export default function Analytics() {
  return (
    <>
      <Script id="ga-init" strategy="afterInteractive">
        {`
          // Dynamically load gtag.js to bypass Cloudflare's broken GA proxy
          const s = document.createElement('script');
          s.async = true;
          s.src = 'https://www.google' + 'tagmanager.com/gtag/js?id=${GA_ID}';
          document.head.appendChild(s);

          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          // Disable automatic page_view on load to prevent double-counting
          // since AnalyticsTracker handles it on route changes
          gtag('config', '${GA_ID}', {
            send_page_view: false
          });
        `}
      </Script>
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
    </>
  );
}
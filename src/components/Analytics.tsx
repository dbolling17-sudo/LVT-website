import Script from "next/script";
import { SITE } from "@/config/site";

/** Google Analytics 4. Renders nothing until NEXT_PUBLIC_GA4_ID is set. */
export function Analytics() {
  const id = SITE.ga4MeasurementId;
  if (!id) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${id}');`}
      </Script>
    </>
  );
}

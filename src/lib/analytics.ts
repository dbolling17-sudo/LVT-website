import { SITE } from "@/config/site";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Records that someone opened the ordering page from a given button.
 * This is a click, not a completed order: Heartland handles checkout and we never see it.
 */
export function trackOrderClick(location: string) {
  const params = { button_location: location, link_url: SITE.orderUrl, outbound: true };
  window.gtag?.("event", "order_online_click", params);
  window.dispatchEvent(new CustomEvent("lvt:order-click", { detail: params }));
}

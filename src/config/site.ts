// Business facts and site-wide settings. Every "Order Online" button reads SITE.orderUrl,
// so changing the ordering link means changing it here (or setting NEXT_PUBLIC_ORDER_URL).
// Anything marked TBC is not confirmed yet and renders as a visible placeholder.

function siteUrl() {
  const explicit = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.trim().replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return vercel ? `https://${vercel}` : "http://localhost:3000";
}

export const SITE = {
  name: "Lakewood Village Tavern",
  shortName: "LVT",
  tagline: "Friends, Food & Spirits",
  established: 1939,
  /** Heartland Online Ordering, confirmed by Devon on 2026-10-09. Pickup only. */
  orderUrl: process.env.NEXT_PUBLIC_ORDER_URL || "https://lakewoodvillagetavern.hrpos.heartland.us/menu",
  /** Google Analytics 4, e.g. G-XXXXXXX. Nothing is sent until this is set. */
  ga4MeasurementId: process.env.NEXT_PUBLIC_GA4_ID || "",
  /** Public address of the site. On Vercel it defaults to the production domain, so no setting is needed. */
  siteUrl: siteUrl(),
  timeZone: "America/New_York",
  phone: { display: "216-521-0301", tel: "+12165210301" },
  city: "Lakewood, Ohio",
  /** Kitchen hours by weekday (0 = Sunday), 24h clock; "24:00" is midnight. Pickup hours are the same. */
  kitchenHours: [
    { days: [0, 1, 2, 3, 4], label: "Sun – Thu", open: "11:00", close: "23:00", text: "11 AM – 11 PM" },
    { days: [5, 6], label: "Fri – Sat", open: "11:00", close: "24:00", text: "11 AM – Midnight" },
  ],
  /** Bar (opening) hours, confirmed by Devon on 2026-10-09: every day, closing past midnight. */
  barHours: { open: "11:00", close: "02:30", text: "Open daily 11 AM – 2:30 AM" },
  /** Confirmed by Devon on 2026-10-09. */
  address: { street: "13437 Madison Ave", city: "Lakewood", region: "OH", postalCode: "44107" },
  // Instagram is TBC: fill it in once Devon confirms it.
  social: { facebook: "https://facebook.com/LVTlakewood" as null | string, instagram: null as null | string },
  photoCredit: "descry",
} as const;

export const NAV = [
  { href: "/#specials", label: "Specials", mobile: "Today's Specials" },
  { href: "/events", label: "Events", mobile: "Events" },
  { href: "/menu", label: "Menu", mobile: "Menu" },
  { href: "/#about", label: "About", mobile: "About" },
  { href: "/#visit", label: "Visit", mobile: "Hours & Location" },
];

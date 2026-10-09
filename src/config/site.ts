// Business facts and site-wide settings. Every "Order Online" button reads SITE.orderUrl,
// so changing the ordering link means changing it here (or setting NEXT_PUBLIC_ORDER_URL).
// Anything marked TBC is not confirmed yet and renders as a visible placeholder.

export const SITE = {
  name: "Lakewood Village Tavern",
  shortName: "LVT",
  tagline: "Friends, Food & Spirits",
  established: 1939,
  /** Heartland Online Ordering, confirmed by Devon on 2026-10-09. Pickup only. */
  orderUrl: process.env.NEXT_PUBLIC_ORDER_URL || "https://lakewoodvillagetavern.hrpos.heartland.us/menu",
  /** Google Analytics 4, e.g. G-XXXXXXX. Nothing is sent until this is set. */
  ga4MeasurementId: process.env.NEXT_PUBLIC_GA4_ID || "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  timeZone: "America/New_York",
  phone: { display: "216-521-0301", tel: "+12165210301" },
  city: "Lakewood, Ohio",
  /** Kitchen hours by weekday (0 = Sunday), 24h clock; "24:00" is midnight. Pickup hours are the same. */
  kitchenHours: [
    { days: [0, 1, 2, 3, 4], label: "Sun – Thu", open: "11:00", close: "23:00", text: "11 AM – 11 PM" },
    { days: [5, 6], label: "Fri – Sat", open: "11:00", close: "24:00", text: "11 AM – Midnight" },
  ],
  // TBC: fill these in once Devon confirms them.
  address: null as null | { street: string; city: string; region: string; postalCode: string },
  barHours: null as null | string,
  social: { facebook: null as null | string, instagram: null as null | string },
  photoCredit: "descry",
} as const;

export const NAV = [
  { href: "/#specials", label: "Specials", mobile: "Today's Specials" },
  { href: "/events", label: "Events", mobile: "Events" },
  { href: "/menu", label: "Menu", mobile: "Menu" },
  { href: "/#about", label: "About", mobile: "About" },
  { href: "/#visit", label: "Visit", mobile: "Hours & Location" },
];

# Lakewood Village Tavern website

Next.js (App Router, TypeScript, Tailwind) on Vercel, with Sanity for events and specials.
Design: "Modern Neighborhood Tavern", approved by Devon on 2026-10-09.

## Pages

| Path | What it is |
| --- | --- |
| `/` | Homepage: hero, today's specials chalkboard, next 3 events, favorites, pickup, hours |
| `/menu` | Food menu from `src/data/menu.json` (the printed menu of 2026-10-09) |
| `/events` | Upcoming list and month view, filterable by type |
| `/events/[id]` | One event, with sign-up link, flyer and share buttons |
| `/studio` | Sanity Studio, where staff edit events and specials |

## Where things live

- **Ordering link:** `SITE.orderUrl` in `src/config/site.ts` (or `NEXT_PUBLIC_ORDER_URL`). Every Order Online
  button reads it and opens Heartland in a new tab. There is no cart or checkout on this site.
- **Click tracking:** `order_online_click` in GA4 with `button_location`, once `NEXT_PUBLIC_GA4_ID` is set.
  A click means someone opened the ordering page, not that they ordered.
- **Business facts and placeholders:** `src/config/site.ts`. Address, bar hours and social links are `null`
  until confirmed and render as visible placeholders.
- **Events and specials rules:** `src/lib/events.ts` and `src/lib/specials.ts`, all in Lakewood time
  (America/New_York). Events expire on their own after their last date; specials archive after their end date.
- **Content:** `src/lib/content.ts` reads Sanity. If Sanity has no weekly specials yet, or can't be reached,
  it shows Devon's weekly specials (`src/data/starting-content.ts`).

## Running it

```bash
npm install
cp .env.example .env.local   # fill in what you have
npm run dev                  # http://localhost:3000
npm test                     # rules: recurrence, expiry, specials, hours
npm run build && npm run test:e2e   # browser checks on desktop and phone
```

## Connecting Sanity

The site uses Devon's Sanity project `vp3mgov9` (dataset `production`) by default.

1. In sanity.io/manage → API → CORS origins, add the site's domains and `http://localhost:3000`, with credentials allowed, so `/studio` can sign in.
2. Add a webhook to `https://<domain>/api/revalidate` for `event` and `special` documents, with projection
   `{_type}` and a secret matching `SANITY_REVALIDATE_SECRET`.
3. Copy the weekly specials into Sanity: `SANITY_API_TOKEN=... node scripts/seed-weekly-specials.mjs`.
   Until a weekly special exists in Sanity, the site keeps showing the starting schedule.

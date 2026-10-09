@AGENTS.md

# Project rules
- Don't invent business information, hours, prices, events or menu items; unconfirmed facts stay `null` in `src/config/site.ts` and render as placeholders.
- The Heartland ordering link is set only in `src/config/site.ts`. No custom cart or checkout, no private Heartland APIs, never sign into the POS.
- Never describe an Order Online click as a completed order.
- Dates are wall-clock strings in America/New_York; use `src/lib/dates.ts`.
- Before pushing: `npm run lint && npm run typecheck && npm test && npm run build && npm run test:e2e`.

// Reads events and specials. With Sanity connected, results are cached and tagged so a
// publish in the Studio refreshes them (see src/app/api/revalidate). Without Sanity, the
// site shows Devon's weekly specials as starting content and no events.
import { cacheLife, cacheTag } from "next/cache";
import { defineQuery } from "next-sanity";
import { client } from "@/sanity/client";
import { WEEKLY_STARTING_CONTENT } from "@/data/starting-content";
import { fixtureEvents } from "@/data/test-fixtures";
import type { LvtEvent } from "./events";
import type { Special } from "./specials";

const IMAGE = `{ "url": asset->url, alt, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height }`;

const EVENTS_QUERY = defineQuery(`*[_type == "event" && defined(date) && defined(title)]{
  "id": _id, title, category, description, date, startTime, endTime, recur, skip, registrationUrl,
  "image": image${IMAGE}, "flyerUrl": flyer.asset->url
}`);

const SPECIALS_QUERY = defineQuery(`*[_type == "special" && defined(name)]{
  "id": _id, name, description, price, type, days, startDate, endDate, replacesWeekly,
  "image": image${IMAGE}
}`);

function clean<T extends { image?: { url?: string } | null }>(rows: T[]): T[] {
  return rows.map((r) => (r.image?.url ? r : { ...r, image: null }));
}

export async function getEvents(): Promise<LvtEvent[]> {
  "use cache";
  cacheTag("event");
  cacheLife("hours");
  if (process.env.LVT_FIXTURES === "1") return fixtureEvents();
  if (!client) return [];
  return clean(await client.fetch<LvtEvent[]>(EVENTS_QUERY));
}

export async function getSpecials(): Promise<Special[]> {
  "use cache";
  cacheTag("special");
  cacheLife("hours");
  if (!client) return WEEKLY_STARTING_CONTENT;
  return clean(await client.fetch<Special[]>(SPECIALS_QUERY));
}

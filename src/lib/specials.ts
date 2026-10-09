// Daily specials. Weekly specials repeat on their weekdays; additional specials run between
// a start and end date. Both are content edited in Sanity, not rules in code.
import { D, type IsoDate } from "./dates";
import type { ImageRef } from "./events";

export type Special = {
  id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  type: "weekly" | "rotating";
  days?: number[] | null;
  startDate?: IsoDate | null;
  endDate?: IsoDate | null;
  /** An additional special that takes the place of the weekly special on the days it runs. */
  replacesWeekly?: boolean | null;
  image?: ImageRef | null;
};

export function specialOn(sp: Special, s: IsoDate) {
  if (sp.startDate && s < sp.startDate) return false;
  if (sp.endDate && s > sp.endDate) return false;
  if (sp.type === "weekly") return (sp.days || []).includes(D.dow(s));
  return true;
}

/** The lineup for one day: weekly specials first (unless replaced), then additional ones ending soonest first. */
export function specialsFor(list: Special[], s: IsoDate) {
  const on = list.filter((sp) => specialOn(sp, s));
  const extra = on
    .filter((sp) => sp.type !== "weekly")
    .sort((a, b) => (a.endDate || "9999").localeCompare(b.endDate || "9999"));
  const replaced = extra.some((sp) => sp.replacesWeekly);
  const weekly = replaced ? [] : on.filter((sp) => sp.type === "weekly");
  return { list: [...weekly, ...extra], replaced, extraCount: extra.length };
}

export function specialState(sp: Special, today: IsoDate): "active" | "scheduled" | "archived" {
  if (sp.endDate && sp.endDate < today) return "archived";
  if (sp.startDate && sp.startDate > today) return "scheduled";
  return "active";
}

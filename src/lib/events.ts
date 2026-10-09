// Event recurrence and expiry. Nothing is deleted on a timer: an event stops showing
// once its last occurrence has ended, and that is worked out every time a page renders.
import { D, DOW, DOWL, fmtDate, toMin, type Clock, type IsoDate } from "./dates";

export const CATEGORIES = {
  bingo: "Bingo",
  music: "Live entertainment",
  sports: "Sports viewing",
  holiday: "Holiday party",
  promo: "Special promotion",
  other: "Other",
} as const;
export type Category = keyof typeof CATEGORIES;

export type Recurrence = {
  type: "none" | "weekly" | "monthly";
  /** Weekdays (0 = Sunday) for weekly events; empty means the first date's weekday. */
  days?: number[];
  /** 1 = every week, 2 = every other week. */
  interval?: number;
  /** Monthly events repeat on the same weekday: "nth" (e.g. second Tuesday) or "last". */
  nth?: "nth" | "last";
  /** Last date it can happen on; empty repeats until deleted. */
  until?: IsoDate | null;
};

export type ImageRef = { url: string; alt?: string; width?: number; height?: number };

export type LvtEvent = {
  id: string;
  title: string;
  category: Category;
  description?: string;
  date: IsoDate;
  startTime: string;
  endTime?: string | null;
  recur?: Recurrence | null;
  skip?: IsoDate[] | null;
  registrationUrl?: string | null;
  image?: ImageRef | null;
  flyerUrl?: string | null;
};

export type Occurrence = { e: LvtEvent; s: IsoDate };

const nthOf = (s: IsoDate) => Math.ceil(D.dom(s) / 7);
const isLastOf = (s: IsoDate) => D.dom(s) + 7 > D.dim(s);

export function occursOn(ev: LvtEvent, s: IsoDate): boolean {
  if (s < ev.date) return false;
  const r = ev.recur || { type: "none" };
  if (r.type !== "none" && r.until && s > r.until) return false;
  if ((ev.skip || []).includes(s)) return false;
  if (r.type === "none" || !r.type) return s === ev.date;
  if (r.type === "weekly") {
    const days = r.days && r.days.length ? r.days : [D.dow(ev.date)];
    if (!days.includes(D.dow(s))) return false;
    const iv = Number(r.interval) || 1;
    if (iv === 1) return true;
    const weekStart = (x: IsoDate) => D.add(x, -D.dow(x));
    return Math.floor(D.diff(weekStart(ev.date), weekStart(s)) / 7) % iv === 0;
  }
  if (r.type === "monthly") {
    if (D.dow(s) !== D.dow(ev.date)) return false;
    return r.nth === "last" ? isLastOf(s) : nthOf(s) === nthOf(ev.date);
  }
  return false;
}

export function occurrences(ev: LvtEvent, from: IsoDate, to: IsoDate): IsoDate[] {
  const out: IsoDate[] = [];
  for (let s = from; s <= to; s = D.add(s, 1)) if (occursOn(ev, s)) out.push(s);
  return out;
}

/** End of one occurrence as [date, time]. No end time means 3 hours after the start; an end earlier than the start runs past midnight. */
export function occEnd(ev: LvtEvent, s: IsoDate): [IsoDate, string] {
  const st = toMin(ev.startTime);
  let en = ev.endTime ? toMin(ev.endTime) : st + 180;
  if (en <= st && ev.endTime) en += 1440;
  const day = D.add(s, Math.floor(en / 1440));
  const m = en % 1440;
  return [day, `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`];
}

export function isPast(ev: LvtEvent, s: IsoDate, now: Clock) {
  const [d, t] = occEnd(ev, s);
  return d < now.date || (d === now.date && t <= now.time);
}

/** True once the last occurrence has ended (one-time events, or repeating ones with an end date). */
export function expired(ev: LvtEvent, now: Clock) {
  const r = ev.recur || { type: "none" };
  if (r.type === "none" || !r.type) return isPast(ev, ev.date, now);
  if (!r.until) return false;
  const from = D.add(r.until, -62) < ev.date ? ev.date : D.add(r.until, -62);
  const last = occurrences(ev, from, r.until).pop();
  return !last || isPast(ev, last, now);
}

/** Occurrences that haven't ended yet, within the next `days` days, soonest first. */
export function upcoming(events: LvtEvent[], now: Clock, days: number, category?: string): Occurrence[] {
  const out: Occurrence[] = [];
  const to = D.add(now.date, days);
  for (const e of events) {
    if (category && category !== "all" && e.category !== category) continue;
    for (const s of occurrences(e, D.add(now.date, -1), to)) if (!isPast(e, s, now)) out.push({ e, s });
  }
  return out.sort((a, b) => (a.s + a.e.startTime).localeCompare(b.s + b.e.startTime));
}

export function recurText(e: LvtEvent) {
  const r = e.recur || { type: "none" };
  const until = r.until ? ` until ${fmtDate(r.until)}` : "";
  if (r.type === "weekly") {
    const days = (r.days && r.days.length ? r.days : [D.dow(e.date)]).map((i) => DOW[i]).join(", ");
    return (Number(r.interval) === 2 ? "Every other week on " : "Every ") + days + until;
  }
  if (r.type === "monthly") {
    const n = r.nth === "last" ? "Last" : ["", "First", "Second", "Third", "Fourth", "Fifth"][nthOf(e.date)];
    return `${n} ${DOWL[D.dow(e.date)]} of each month${until}`;
  }
  return "One time";
}

/** Problems that would make an event show up wrong; the editor checks the same rules. */
export function validateEvent(e: Partial<LvtEvent>): string[] {
  const errs: string[] = [];
  if (!e.title?.trim()) errs.push("Add a title.");
  if (!D.valid(e.date)) errs.push("Pick a date.");
  if (!/^\d{2}:\d{2}$/.test(e.startTime || "")) errs.push("Pick a start time.");
  const r = e.recur;
  if (r?.type === "weekly" && r.days && r.days.some((d) => d < 0 || d > 6)) errs.push("Weekdays must be Sunday to Saturday.");
  if (r?.until && e.date && r.until < e.date) errs.push("The repeat end date is before the first date.");
  if ((e.skip || []).some((d) => !D.valid(d))) errs.push("Skip dates must look like 2026-11-26.");
  return errs;
}

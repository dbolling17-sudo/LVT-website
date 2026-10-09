// Wall-clock dates in Lakewood time. Dates are "YYYY-MM-DD" strings and times are "HH:MM",
// so date math never shifts across time zones or daylight saving changes.
import { SITE } from "@/config/site";

export type IsoDate = string;
export type Clock = { date: IsoDate; time: string };

export const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DOWL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const MON = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY = 864e5;

export const D = {
  parse: (s: IsoDate) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  },
  fmt: (t: number): IsoDate => new Date(t).toISOString().slice(0, 10),
  add: (s: IsoDate, n: number) => D.fmt(D.parse(s) + n * DAY),
  dow: (s: IsoDate) => new Date(D.parse(s)).getUTCDay(),
  diff: (a: IsoDate, b: IsoDate) => Math.round((D.parse(b) - D.parse(a)) / DAY),
  dom: (s: IsoDate) => Number(s.slice(8, 10)),
  dim: (s: IsoDate) => {
    const [y, m] = s.split("-").map(Number);
    return new Date(Date.UTC(y, m, 0)).getUTCDate();
  },
  valid: (s?: string | null): s is IsoDate => /^\d{4}-\d{2}-\d{2}$/.test(s || "") && !isNaN(D.parse(s!)),
};

/** The current date and time in Lakewood. */
export function nowET(at: Date = new Date()): Clock {
  const p: Record<string, string> = {};
  new Intl.DateTimeFormat("en-US", {
    timeZone: SITE.timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  })
    .formatToParts(at)
    .forEach((x) => (p[x.type] = x.value));
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

export const toMin = (t?: string) => {
  const [h, m] = (t || "0:0").split(":").map(Number);
  return h * 60 + m;
};

export function fmtTime(t?: string) {
  if (!t) return "";
  const [h24, m] = t.split(":").map(Number);
  const ap = h24 >= 12 ? "PM" : "AM";
  const h = h24 % 12 || 12;
  return m ? `${h}:${String(m).padStart(2, "0")} ${ap}` : `${h} ${ap}`;
}

export function fmtDate(s: IsoDate, long = false) {
  const d = new Date(D.parse(s));
  const month = MON[d.getUTCMonth()];
  return `${(long ? DOWL : DOW)[d.getUTCDay()]}, ${long ? month : month.slice(0, 3)} ${d.getUTCDate()}`;
}

export const money = (v?: number | null) =>
  v === null || v === undefined ? "" : "$" + v.toFixed(2).replace(/\.00$/, "");

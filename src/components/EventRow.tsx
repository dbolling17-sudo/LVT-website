import Link from "next/link";
import { D, DOW, fmtTime, type IsoDate } from "@/lib/dates";
import { CATEGORIES, type LvtEvent } from "@/lib/events";

/** One dated event line with a calendar tile, linking to the event's page. */
export function EventRow({ e, s }: { e: LvtEvent; s: IsoDate }) {
  const repeats = e.recur?.type && e.recur.type !== "none";
  return (
    <div className="ev">
      <div className="cal" aria-hidden="true">
        <span>{DOW[D.dow(s)].toUpperCase()}</span>
        <b>{D.dom(s)}</b>
      </div>
      <div>
        <div className="meta">
          {fmtTime(e.startTime)} · {CATEGORIES[e.category] ?? "Event"}
          {repeats ? " · Repeats" : ""}
        </div>
        <h3>
          <Link href={`/events/${e.id}?d=${s}`}>{e.title}</Link>
        </h3>
        {e.description && <p>{e.description.length > 140 ? e.description.slice(0, 137) + "…" : e.description}</p>}
      </div>
    </div>
  );
}

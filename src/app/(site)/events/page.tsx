import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { EventRow } from "@/components/EventRow";
import { getEvents } from "@/lib/content";
import { D, DOW, MON, fmtDate, nowET, type IsoDate } from "@/lib/dates";
import { CATEGORIES, occurrences, upcoming, type LvtEvent } from "@/lib/events";

export const metadata: Metadata = {
  title: "Events",
  description: "Bingo, live entertainment, sports on every screen and holiday parties at Lakewood Village Tavern.",
};

type Search = { view?: string; type?: string; m?: string };

export default function EventsPage({ searchParams }: { searchParams: Promise<Search> }) {
  return (
    <div className="wrap" style={{ paddingBottom: 56 }}>
      <div className="page-h">
        <div className="eyebrow">Events</div>
        <h1>What&apos;s happening at the Village</h1>
      </div>
      <Suspense fallback={<p className="muted">Loading events…</p>}>
        <EventsBody searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function href(q: Search) {
  const p = new URLSearchParams(Object.entries(q).filter(([, v]) => v) as [string, string][]);
  const s = p.toString();
  return s ? `/events?${s}` : "/events";
}

async function EventsBody({ searchParams }: { searchParams: Promise<Search> }) {
  const q = await searchParams;
  await connection();
  const now = nowET();
  const events = await getEvents();
  const view = q.view === "month" ? "month" : "list";
  const type = q.type && q.type in CATEGORIES ? q.type : "all";
  const shown = type === "all" ? events : events.filter((e) => e.category === type);

  return (
    <>
      <div className="chips" role="group" aria-label="View">
        <Link href={href({ ...q, view: undefined })} aria-current={view === "list"}>Upcoming</Link>
        <Link href={href({ ...q, view: "month" })} aria-current={view === "month"}>Month</Link>
      </div>
      <div className="chips" role="group" aria-label="Type of event">
        <Link href={href({ ...q, type: undefined })} aria-current={type === "all"}>All</Link>
        {Object.entries(CATEGORIES).map(([k, label]) => (
          <Link key={k} href={href({ ...q, type: k })} aria-current={type === k}>{label}</Link>
        ))}
      </div>
      {view === "list" ? <ListView events={shown} now={now} /> : <MonthView events={shown} today={now.date} q={{ ...q, type: type === "all" ? undefined : type }} />}
    </>
  );
}

function ListView({ events, now }: { events: LvtEvent[]; now: ReturnType<typeof nowET> }) {
  const occ = upcoming(events, now, 90);
  if (!occ.length) return <p className="muted">No events posted yet. Check back soon.</p>;
  const byDay = new Map<IsoDate, typeof occ>();
  for (const o of occ) byDay.set(o.s, [...(byDay.get(o.s) || []), o]);
  return (
    <>
      {[...byDay].map(([day, list]) => (
        <div key={day}>
          <h2 className="day-h">{day === now.date ? "Today" : day === D.add(now.date, 1) ? "Tomorrow" : fmtDate(day, true)}</h2>
          {list.map((o) => <EventRow key={o.e.id + o.s} {...o} />)}
        </div>
      ))}
    </>
  );
}

function MonthView({ events, today, q }: { events: LvtEvent[]; today: IsoDate; q: Search }) {
  const first = q.m && /^\d{4}-\d{2}$/.test(q.m) ? `${q.m}-01` : `${today.slice(0, 7)}-01`;
  const gridStart = D.add(first, -D.dow(first));
  const last = `${first.slice(0, 8)}${String(D.dim(first)).padStart(2, "0")}`;
  const gridEnd = D.add(last, 6 - D.dow(last));
  const days: IsoDate[] = [];
  for (let s = gridStart; s <= gridEnd; s = D.add(s, 1)) days.push(s);
  const byDay = new Map<IsoDate, LvtEvent[]>();
  for (const e of events) for (const s of occurrences(e, gridStart, gridEnd)) byDay.set(s, [...(byDay.get(s) || []), e]);
  const month = (n: number) => {
    let [y, m] = first.split("-").map(Number);
    m += n;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    return `${y}-${String(m).padStart(2, "0")}`;
  };
  const [y, mo] = first.split("-").map(Number);
  return (
    <>
      <div className="month-nav">
        <h2>{MON[mo - 1]} {y}</h2>
        <Link className="btn btn-line btn-sm" href={href({ ...q, view: "month", m: month(-1) })} aria-label="Previous month">←</Link>
        <Link className="btn btn-line btn-sm" href={href({ ...q, view: "month", m: undefined })}>This month</Link>
        <Link className="btn btn-line btn-sm" href={href({ ...q, view: "month", m: month(1) })} aria-label="Next month">→</Link>
      </div>
      <div className="month">
        {DOW.map((d) => <div key={d} className="dh">{d}</div>)}
        {days.map((s) => (
          <div key={s} className={[s.slice(0, 7) !== first.slice(0, 7) && "out", s === today && "today"].filter(Boolean).join(" ")}>
            <span className="n">{D.dom(s)}</span>
            {(byDay.get(s) || []).sort((a, b) => a.startTime.localeCompare(b.startTime)).map((e) => (
              <Link key={e.id} href={`/events/${e.id}?d=${s}`} title={e.title}>{e.title}</Link>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

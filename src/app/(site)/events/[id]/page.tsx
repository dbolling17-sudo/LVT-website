import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { SITE } from "@/config/site";
import { ShareButtons } from "@/components/ShareButtons";
import { getEvents } from "@/lib/content";
import { D, fmtDate, fmtTime, nowET } from "@/lib/dates";
import { CATEGORIES, expired, isPast, occEnd, occursOn, recurText, upcoming } from "@/lib/events";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ d?: string }> };

async function find(id: string) {
  return (await getEvents()).find((e) => e.id === id) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const e = await find((await params).id);
  if (!e) return { title: "Event" };
  return {
    title: e.title,
    description: e.description || `${CATEGORIES[e.category]} at ${SITE.name}.`,
    openGraph: { title: e.title, images: e.image ? [e.image.url] : ["/img/p26.jpg"] },
  };
}

export default function EventPage(props: Props) {
  return (
    <div className="wrap">
      <Suspense fallback={<p className="muted" style={{ paddingBlock: 40 }}>Loading event…</p>}>
        <EventBody {...props} />
      </Suspense>
    </div>
  );
}

async function EventBody({ params, searchParams }: Props) {
  const [{ id }, { d }] = await Promise.all([params, searchParams]);
  await connection();
  const e = await find(id);
  if (!e) notFound();
  const now = nowET();
  const gone = expired(e, now);
  const next = upcoming([e], now, 365).slice(0, 6).map((o) => o.s);
  const shown = d && D.valid(d) && occursOn(e, d) && !isPast(e, d, now) ? d : next[0];
  const repeats = e.recur?.type && e.recur.type !== "none";
  const url = `${SITE.siteUrl}/events/${e.id}`;

  return (
    <article className="detail">
      <div>
        {e.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="hero" src={`${e.image.url}?w=1200&auto=format`} alt={e.image.alt || ""} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="hero" src="/img/p26.jpg" alt="The tavern's wood door under the Lambchop Av street sign" />
        )}
      </div>
      <div>
        <Link className="more" href="/events" style={{ color: "var(--gold)", fontWeight: 600, textDecoration: "none" }}>← All events</Link>
        <div className="eyebrow" style={{ marginTop: 16 }}>{CATEGORIES[e.category] ?? "Event"}</div>
        <h1 style={{ fontSize: "clamp(32px,6vw,48px)", fontWeight: 800, marginTop: 8 }}>{e.title}</h1>
        {gone || !shown ? (
          <p className="facts"><b>This event has ended.</b></p>
        ) : (
          <div className="facts">
            <div><b>{fmtDate(shown, true)}</b></div>
            <div>{fmtTime(e.startTime)}{e.endTime ? ` – ${fmtTime(occEnd(e, shown)[1])}` : ""}</div>
            {repeats && <div className="muted">{recurText(e)}</div>}
          </div>
        )}
        {e.description && <p style={{ whiteSpace: "pre-line" }}>{e.description}</p>}
        <div className="ctas" style={{ marginTop: 18 }}>
          {e.registrationUrl && !gone && (
            <a className="btn btn-order" href={e.registrationUrl} target="_blank" rel="noopener">Sign up / Tickets</a>
          )}
          {e.flyerUrl && <a className="btn btn-line" href={e.flyerUrl} target="_blank" rel="noopener">View flyer</a>}
        </div>
        {repeats && next.length > 1 && !gone && (
          <>
            <h2 className="day-h">Upcoming dates</h2>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {next.map((s) => <li key={s}>{fmtDate(s, true)}</li>)}
            </ul>
          </>
        )}
        <ShareButtons url={url} title={`${e.title} at ${SITE.name}`} />
      </div>
    </article>
  );
}

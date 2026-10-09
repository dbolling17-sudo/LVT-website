import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { SITE } from "@/config/site";
import { OrderButton } from "@/components/OrderButton";
import { SpecialsBoard } from "@/components/SpecialsBoard";
import { EventRow } from "@/components/EventRow";
import { getEvents, getSpecials } from "@/lib/content";
import { nowET } from "@/lib/dates";
import { upcoming } from "@/lib/events";
import { kitchenStatus } from "@/lib/hours";

const FAVORITES = [
  { img: "/img/p19.jpg", alt: "Village Idiot burger", name: "Village Idiot", line: "Burger between two grilled cheeses · $13" },
  { img: "/img/p15.jpg", alt: "Jumbo chicken wings", name: "Jumbo Wings", line: "15 sauces · 6 for $7.50 · 10 for $12" },
  { img: "/img/p24.jpg", alt: "Cajun chicken pasta", name: "Cajun Chicken Pasta", line: "Bowtie pasta, Cajun cream · $13" },
  { img: "/img/p28.jpg", alt: "Grilled chicken quesadilla", name: "Chicken Quesadilla", line: "Half $10 · Full $14" },
];

export default function Home() {
  return (
    <>
      <div className="wrap intro" id="top">
        <div>
          <Image className="logo" src="/img/lvt-logo.svg" alt="Lakewood Village Tavern logo" width={240} height={240} priority />
          <div className="eyebrow" style={{ marginTop: 18 }}>{SITE.city} · {SITE.tagline}</div>
          <h1>Lakewood&apos;s neighborhood tavern since {SITE.established}.</h1>
          <p>Hand-pressed half-pound burgers, jumbo wings, a different special every day, and the game on.</p>
          <div className="ctas">
            <OrderButton location="hero">Order Online for Pickup</OrderButton>
            <Link className="btn btn-line" href="/menu">View Menu</Link>
          </div>
          <Suspense fallback={<div className="status"><span className="dot" />Kitchen hours today</div>}>
            <KitchenStatus />
          </Suspense>
        </div>
        <div className="mosaic">
          <Image src="/img/p18.jpg" alt="The Village Idiot: a burger between two grilled cheese sandwiches, with fries" width={1600} height={1600} priority sizes="(min-width: 860px) 35vw, 60vw" />
          <Image src="/img/p26.jpg" alt="The tavern's wood door under the Lambchop Av street sign" width={800} height={800} sizes="(min-width: 860px) 25vw, 40vw" />
          <Image src="/img/p16.jpg" alt="Brisket mac and cheese topped with fried onion strings" width={800} height={800} sizes="(min-width: 860px) 25vw, 40vw" />
        </div>
      </div>

      <section id="specials" style={{ paddingTop: 0 }}>
        <div className="wrap today-grid">
          <Suspense fallback={<div className="chalk"><div className="top"><h2>Today&apos;s Specials</h2></div></div>}>
            <TodaysSpecials />
          </Suspense>
          <div id="events">
            <div className="sec-h">
              <h2>Coming Up</h2>
              <Link className="more" href="/events">Full calendar →</Link>
            </div>
            <Suspense fallback={<p className="muted">Loading events…</p>}>
              <NextEvents />
            </Suspense>
          </div>
        </div>
      </section>

      <section id="menu-favorites" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-h">
            <h2>Tavern Favorites</h2>
            <Link className="more" href="/menu">Full menu →</Link>
          </div>
          <div className="plates">
            {FAVORITES.map((f) => (
              <div className="plate" key={f.name}>
                <Image src={f.img} alt={f.alt} width={600} height={600} sizes="(min-width: 860px) 25vw, 50vw" />
                <h3>{f.name}</h3>
                <p>{f.line}</p>
              </div>
            ))}
          </div>
          <div className="menu-cta">
            <OrderButton location="menu">Order Online</OrderButton>
            <span className="muted" style={{ fontSize: 14 }}>Sides, sauces and add-ons are chosen on the ordering page.</span>
          </div>
        </div>
      </section>

      <div className="pickup">
        <div className="wrap" style={{ paddingBlock: 40 }}>
          <div>
            <div className="eyebrow">Pickup</div>
            <h2 style={{ marginTop: 8 }}>Order ahead, pick it up hot.</h2>
            <ul>
              <li>Same prices as dining in</li>
              <li>Your order prints straight to our kitchen</li>
              <li>Pickup during kitchen hours · food only, no drinks to go</li>
            </ul>
          </div>
          <div>
            <OrderButton location="pickup_band">Start Your Order</OrderButton>
            <small>Opens our secure ordering page.</small>
          </div>
        </div>
      </div>

      <section className="heritage" id="about">
        <div className="wrap">
          <div className="year">{SITE.established}</div>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800 }}>Part of the neighborhood since {SITE.established}.</h2>
            <p className="ph" style={{ marginTop: 10, maxWidth: "56ch" }}>
              [Your story goes here: who opened the tavern, what&apos;s changed and what hasn&apos;t. We&apos;ll write it together from your notes.]
            </p>
          </div>
        </div>
      </section>

      <section id="visit" style={{ paddingTop: 0 }}>
        <div className="wrap visit">
          <div>
            <h3>Kitchen hours</h3>
            <table className="hours">
              <tbody>
                {SITE.kitchenHours.map((h) => (
                  <tr key={h.label}><td>{h.label}</td><td>{h.text}</td></tr>
                ))}
              </tbody>
            </table>
            <p className="ph" style={{ fontSize: 14, marginTop: 8 }}>{SITE.barHours ?? "Bar hours: to be confirmed"}</p>
          </div>
          <div>
            <h3>Address</h3>
            {SITE.address ? (
              <p style={{ margin: 0 }}>{SITE.address.street}<br />{SITE.address.city}, {SITE.address.region} {SITE.address.postalCode}</p>
            ) : (
              <p className="ph" style={{ margin: 0 }}>[Street address, Lakewood, OH — to be confirmed]</p>
            )}
          </div>
          <div>
            <h3>Phone</h3>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              <a href={`tel:${SITE.phone.tel}`} style={{ textDecoration: "none" }}>{SITE.phone.display}</a>
            </p>
          </div>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd()) }} />
    </>
  );
}

async function KitchenStatus() {
  await connection();
  const s = kitchenStatus(nowET());
  return (
    <div className="status">
      <span className="dot" style={s.open ? undefined : { background: "var(--gold-btn)" }} />
      <span>{s.text}</span>
    </div>
  );
}

async function TodaysSpecials() {
  await connection();
  const specials = await getSpecials();
  return <SpecialsBoard today={nowET().date} specials={specials} />;
}

async function NextEvents() {
  await connection();
  const now = nowET();
  const next = upcoming(await getEvents(), now, 90).slice(0, 3);
  if (!next.length) return <p className="muted">No events posted yet. Check back soon.</p>;
  return (
    <>
      {next.map((o) => <EventRow key={o.e.id + o.s} {...o} />)}
    </>
  );
}

function restaurantJsonLd() {
  const day = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: SITE.name,
    slogan: SITE.tagline,
    foundingDate: String(SITE.established),
    telephone: SITE.phone.tel,
    url: SITE.siteUrl,
    image: `${SITE.siteUrl}/img/p18.jpg`,
    servesCuisine: "American",
    hasMenu: `${SITE.siteUrl}/menu`,
    potentialAction: { "@type": "OrderAction", target: SITE.orderUrl, deliveryMethod: "http://purl.org/goodrelations/v1#DeliveryModePickUp" },
    openingHoursSpecification: SITE.kitchenHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days.map((d) => day[d]),
      opens: h.open,
      closes: h.close === "24:00" ? "23:59" : h.close,
    })),
    ...(SITE.address && {
      address: { "@type": "PostalAddress", streetAddress: SITE.address.street, addressLocality: SITE.address.city, addressRegion: SITE.address.region, postalCode: SITE.address.postalCode },
    }),
  };
}

import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/config/site";
import { OrderButton } from "./OrderButton";

export function Footer() {
  const { facebook, instagram } = SITE.social;
  return (
    <footer>
      <div className="wrap">
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Image src="/img/lvt-logo.svg" alt="" width={52} height={52} />
          <div>
            <b style={{ color: "var(--ink)" }}>{SITE.name}</b>
            <br />
            {SITE.tagline} · Est. {SITE.established}
          </div>
        </div>
        <div className="flinks">
          <Link href="/#specials">Specials</Link>
          <Link href="/events">Events</Link>
          <Link href="/menu">Menu</Link>
          <Link href="/#visit">Visit</Link>
          <OrderButton location="footer" plain>Order Online</OrderButton>
        </div>
        {facebook || instagram ? (
          <div className="flinks">
            {facebook && <a href={facebook}>Facebook</a>}
            {instagram && <a href={instagram}>Instagram</a>}
          </div>
        ) : (
          <div className="ph">[Facebook / Instagram links — to be confirmed]</div>
        )}
        <div>Photos by {SITE.photoCredit}</div>
      </div>
    </footer>
  );
}

/** Phone-only bar pinned to the bottom of the screen. */
export function StickyOrderBar() {
  return (
    <div className="bar">
      <OrderButton location="sticky_mobile">Order Online</OrderButton>
      <a className="btn btn-line" href={`tel:${SITE.phone.tel}`} aria-label={`Call ${SITE.phone.display}`}>Call</a>
    </div>
  );
}

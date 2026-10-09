import type { Metadata } from "next";
import { OrderButton } from "@/components/OrderButton";
import { money } from "@/lib/dates";
import menu from "@/data/menu.json";

// The printed menu from 2026-10-09 (src/data/menu.json). Heartland stays the source of
// truth for what can be ordered right now; this page is for reading.
type Option = string | { name: string; price?: number };
type Item = { name: string; description?: string; prices?: { label: string; price: number }[]; options?: Record<string, Option[]>; notes?: string };
type Category = { name: string; description?: string; items: Item[]; options?: Record<string, Option[]> };

export const metadata: Metadata = {
  title: "Menu",
  description: "Burgers, wings, quesadillas, ribs, sandwiches and more at Lakewood Village Tavern. Order online for pickup.",
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const optText = (o: Option) => (typeof o === "string" ? o : o.price != null ? `${o.name} +${money(o.price)}` : o.name);

export default function MenuPage() {
  const cats = menu.categories as Category[];
  return (
    <div className="wrap menu-page">
      <div className="sec-h" style={{ marginTop: 32 }}>
        <div>
          <div className="eyebrow">Menu</div>
          <h1>Food Menu</h1>
        </div>
        <OrderButton location="menu_page">Order Online for Pickup</OrderButton>
      </div>
      <nav className="cat-nav" aria-label="Menu sections">
        {cats.map((c) => <a key={c.name} href={`#${slug(c.name)}`}>{c.name.replace(/Build Your Own Fresh Hand Pressed 1\/2 Pound /, "")}</a>)}
      </nav>
      {cats.map((c) => (
        <section key={c.name} id={slug(c.name)} className="menu-cat">
          <h2>{c.name}</h2>
          {c.description && <p className="muted">{c.description}</p>}
          <div className="menu-items">
            {c.items.map((it) => (
              <div className="menu-item" key={it.name}>
                <div className="mi-head">
                  <h3>{it.name}</h3>
                  <span className="mi-price">
                    {(it.prices || []).map((p) => (p.label ? `${p.label} ${money(p.price)}` : money(p.price))).join(" · ")}
                  </span>
                </div>
                {it.description && <p>{it.description}</p>}
                {it.options && Object.entries(it.options).filter(([k]) => k !== "Style").map(([k, v]) => (
                  <p className="mi-opt" key={k}><b>{k}:</b> {v.map(optText).join(", ")}</p>
                ))}
              </div>
            ))}
          </div>
        </section>
      ))}
      <div className="menu-cta" style={{ marginBottom: 48 }}>
        <OrderButton location="menu_page_bottom">Order Online</OrderButton>
        <span className="muted" style={{ fontSize: 14 }}>Same prices as dining in. Availability and add-ons are shown on the ordering page.</span>
      </div>
      <p className="muted" style={{ fontSize: 13, marginBottom: 32 }}>{menu.business.consumerAdvisory}</p>
    </div>
  );
}

"use client";
import { useState } from "react";
import { D, DOW, DOWL, MON, money, type IsoDate } from "@/lib/dates";
import { specialsFor, type Special } from "@/lib/specials";
import { OrderButton } from "./OrderButton";

/** The chalkboard: today's specials, with the rest of the week one tap away. */
export function SpecialsBoard({ today, specials }: { today: IsoDate; specials: Special[] }) {
  const [offset, setOffset] = useState(0);
  const day = D.add(today, offset);
  const dow = D.dow(day);
  const { list } = specialsFor(specials, day);
  const date = new Date(D.parse(day));
  return (
    <div>
      <div className="chalk" aria-live="polite">
        <div className="top">
          <h2>{offset === 0 ? "Today's Specials" : `${DOWL[dow]}'s Specials`}</h2>
          <span className="date">{`${DOWL[dow]}, ${MON[date.getUTCMonth()].slice(0, 3)} ${date.getUTCDate()}`}</span>
        </div>
        <ul>
          {list.length === 0 && (
            <li><b>No special posted</b><span>Ask your server what&apos;s good today</span></li>
          )}
          {list.map((s) => (
            <li key={s.id}>
              <b>{s.name}</b>
              <span>{s.description || (s.type === "weekly" ? `Every ${DOWL[dow]}` : s.endDate ? `Through ${DOW[D.dow(s.endDate)]} ${Number(s.endDate.slice(5, 7))}/${D.dom(s.endDate)}` : "")}</span>
              {s.price != null && <i>{money(s.price)}</i>}
            </li>
          ))}
        </ul>
        <div className="foot">
          <span>{list.some((s) => s.price != null) ? "Prices before tax" : "Ask your server for prices"}</span>
          <OrderButton location="specials" className="btn-sm">Order Online</OrderButton>
        </div>
      </div>
      <div className="week" role="group" aria-label="See another day's special">
        {Array.from({ length: 7 }, (_, i) => (
          <button key={i} type="button" aria-pressed={i === offset} onClick={() => setOffset(i)}>
            {i === 0 ? "Today" : DOW[D.dow(D.add(today, i))]}
          </button>
        ))}
      </div>
    </div>
  );
}

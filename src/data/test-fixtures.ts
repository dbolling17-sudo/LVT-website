// Sample events used only by the end-to-end tests (LVT_FIXTURES=1). Never shown on the live site.
import { D, nowET } from "@/lib/dates";
import type { LvtEvent } from "@/lib/events";

export function fixtureEvents(): LvtEvent[] {
  const today = nowET().date;
  const nextSunday = D.add(today, (7 - D.dow(today)) % 7 || 7);
  return [
    { id: "test-bingo", title: "Test Bingo", category: "bingo", date: nextSunday, startTime: "19:00", recur: { type: "weekly", days: [0], interval: 1 }, description: "Weekly test event." },
    { id: "test-music", title: "Test Band", category: "music", date: D.add(today, 2), startTime: "21:00", endTime: "01:00", registrationUrl: "https://example.com/tickets" },
    { id: "test-past", title: "Test Ended", category: "promo", date: D.add(today, -3), startTime: "18:00" },
  ];
}

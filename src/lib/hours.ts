import { SITE } from "@/config/site";
import { D, toMin, type Clock } from "./dates";

/** Kitchen open/closed message for the given Lakewood time. */
export function kitchenStatus(now: Clock) {
  const dow = D.dow(now.date);
  const today = SITE.kitchenHours.find((h) => (h.days as readonly number[]).includes(dow))!;
  const t = toMin(now.time);
  const open = t >= toMin(today.open) && t < toMin(today.close);
  const closeText = today.close === "24:00" ? "midnight" : "11 PM";
  const text = open
    ? `Kitchen open now · until ${closeText}`
    : t < toMin(today.open)
      ? "Kitchen opens at 11 AM today"
      : "Kitchen closed · opens 11 AM tomorrow";
  return { open, text, todayLabel: today.label };
}

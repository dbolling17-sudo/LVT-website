// Devon's weekly specials (2026-10-09), used only until Sanity is connected.
// Once it is, these live in the dashboard as editable content and this file is just a fallback.
import type { Special } from "@/lib/specials";

const W = (day: number, name: string): Special => ({ id: `weekly-${day}`, name, type: "weekly", days: [day] });

export const WEEKLY_STARTING_CONTENT: Special[] = [
  W(0, "Burgers and breakfast specials"),
  W(1, "Mussels"),
  W(2, "Tacos"),
  W(3, "Ribs and burgers"),
  W(4, "60¢ wings"),
  W(5, "Steak special"),
  W(6, "Half-slab ribs and tacos"),
];

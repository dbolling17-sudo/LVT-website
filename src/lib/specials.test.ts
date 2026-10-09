import { describe, expect, it } from "vitest";
import { specialsFor, specialState, type Special } from "./specials";
import { WEEKLY_STARTING_CONTENT } from "@/data/starting-content";

const sched = WEEKLY_STARTING_CONTENT;
const names = (l: Special[], d: string) => specialsFor(l, d).list.map((s) => s.name);
const add: Special = { id: "a", name: "Brisket Sliders", type: "rotating", startDate: "2026-10-09", endDate: "2026-10-15" };

describe("specials", () => {
  it("shows Devon's weekly schedule on the right days", () => {
    expect(names(sched, "2026-10-12")).toEqual(["Mussels"]); // Mon
    expect(names(sched, "2026-10-09")).toEqual(["Steak special"]); // Fri
    expect(names(sched, "2026-10-15")).toEqual(["60¢ wings"]); // Thu
    expect(names(sched, "2026-10-11")).toEqual(["Burgers and breakfast specials"]); // Sun
  });
  it("shows additional specials alongside, only while they run", () => {
    expect(names([...sched, add], "2026-10-12")).toEqual(["Mussels", "Brisket Sliders"]);
    expect(names([...sched, add], "2026-10-16")).toEqual(["Steak special"]);
    expect(names([...sched, { ...add, startDate: "2026-10-20", endDate: "2026-10-25" }], "2026-10-12")).toEqual(["Mussels"]);
  });
  it("lets an additional special replace the weekly one for its days only", () => {
    const holiday: Special = { id: "h", name: "Thanksgiving Eve special", type: "rotating", startDate: "2026-11-25", endDate: "2026-11-25", replacesWeekly: true };
    expect(names([...sched, holiday], "2026-11-25")).toEqual(["Thanksgiving Eve special"]);
    expect(names([...sched, holiday], "2026-11-26")).toEqual(["60¢ wings"]);
  });
  it("pauses a weekly special after its end date", () => {
    expect(specialsFor([{ ...sched[2], endDate: "2026-10-31" }], "2026-11-03").list).toHaveLength(0);
  });
  it("archives and schedules by date", () => {
    expect(specialState(add, "2026-10-16")).toBe("archived");
    expect(specialState({ ...add, startDate: "2026-10-20" }, "2026-10-12")).toBe("scheduled");
    expect(specialState(add, "2026-10-12")).toBe("active");
  });
});

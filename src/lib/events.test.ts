import { describe, expect, it } from "vitest";
import { expired, occEnd, occurrences, occursOn, upcoming, recurText, validateEvent, type LvtEvent } from "./events";
import { nowET } from "./dates";
import { kitchenStatus } from "./hours";

const E = (o: Partial<LvtEvent>): LvtEvent =>
  ({ id: "x", title: "t", category: "bingo", startTime: "19:00", endTime: "", skip: [], date: "2026-10-09", ...o }) as LvtEvent;

const bingo = E({ date: "2026-10-11", recur: { type: "weekly", days: [0], interval: 1, until: "" } });
const alt = E({ date: "2026-10-06", recur: { type: "weekly", days: [2, 4], interval: 2, until: "" } });
const trivia = E({ date: "2026-10-07", recur: { type: "weekly", days: [3], interval: 1, until: "2026-11-04" }, skip: ["2026-10-21"] });
const once = E({ date: "2026-10-09", startTime: "19:00", endTime: "22:00", recur: { type: "none" } });
const late = E({ date: "2026-10-09", startTime: "21:00", endTime: "01:00", recur: { type: "none" } });

describe("recurrence", () => {
  it("repeats weekly from the first date", () => {
    expect(occurrences(bingo, "2026-10-01", "2026-11-01")).toEqual(["2026-10-11", "2026-10-18", "2026-10-25", "2026-11-01"]);
    expect(occursOn(bingo, "2026-10-04")).toBe(false);
  });
  it("keeps the weekday across the daylight saving change", () => {
    expect(occurrences(bingo, "2026-10-31", "2026-11-09")).toEqual(["2026-11-01", "2026-11-08"]);
  });
  it("supports every other week on several days", () => {
    expect(occurrences(alt, "2026-10-01", "2026-11-01")).toEqual(["2026-10-06", "2026-10-08", "2026-10-20", "2026-10-22"]);
  });
  it("honours an end date and skipped dates", () => {
    expect(occurrences(trivia, "2026-10-01", "2026-12-01")).toEqual(["2026-10-07", "2026-10-14", "2026-10-28", "2026-11-04"]);
  });
  it("repeats monthly on the nth weekday", () => {
    const first = E({ date: "2026-10-04", recur: { type: "monthly", nth: "nth" } });
    expect(occurrences(first, "2026-10-01", "2027-01-31")).toEqual(["2026-10-04", "2026-11-01", "2026-12-06", "2027-01-03"]);
  });
  it("repeats monthly on the last weekday", () => {
    const last = E({ date: "2026-10-30", recur: { type: "monthly", nth: "last" } });
    expect(occurrences(last, "2026-10-01", "2027-02-28")).toEqual(["2026-10-30", "2026-11-27", "2026-12-25", "2027-01-29", "2027-02-26"]);
  });
  it("describes the pattern in words", () => {
    expect(recurText(bingo)).toBe("Every Sun");
    expect(recurText(alt)).toBe("Every other week on Tue, Thu");
    expect(recurText(trivia)).toBe("Every Wed until Wed, Nov 4");
    expect(recurText(once)).toBe("One time");
  });
});

describe("expiry", () => {
  it("expires a one-time event when it ends", () => {
    expect(expired(once, { date: "2026-10-09", time: "21:59" })).toBe(false);
    expect(expired(once, { date: "2026-10-09", time: "22:00" })).toBe(true);
  });
  it("handles an end time past midnight", () => {
    expect(occEnd(late, "2026-10-09")).toEqual(["2026-10-10", "01:00"]);
    expect(expired(late, { date: "2026-10-10", time: "00:30" })).toBe(false);
    expect(expired(late, { date: "2026-10-10", time: "01:00" })).toBe(true);
  });
  it("defaults to three hours when there is no end time", () => {
    expect(occEnd(E({ startTime: "22:30" }), "2026-10-09")).toEqual(["2026-10-10", "01:30"]);
  });
  it("expires a repeating event after its last date, and never without one", () => {
    expect(expired(trivia, { date: "2026-11-05", time: "00:00" })).toBe(true);
    expect(expired(trivia, { date: "2026-11-04", time: "21:00" })).toBe(false);
    expect(expired(bingo, { date: "2030-01-01", time: "00:00" })).toBe(false);
  });
  it("lists upcoming occurrences soonest first, hiding ones that ended", () => {
    expect(upcoming([bingo, once], { date: "2026-10-09", time: "22:30" }, 10).map((o) => o.s)).toEqual(["2026-10-11", "2026-10-18"]);
  });
});

describe("validation", () => {
  it("rejects missing fields and bad dates", () => {
    expect(validateEvent({ title: "", date: "x", startTime: "" })).toHaveLength(3);
    expect(validateEvent({ ...trivia, recur: { type: "weekly", until: "2026-10-01" } })).toEqual(["The repeat end date is before the first date."]);
    expect(validateEvent({ ...trivia, skip: ["Nov 26"] })).toEqual(["Skip dates must look like 2026-11-26."]);
    expect(validateEvent(trivia)).toEqual([]);
  });
});

describe("Lakewood time", () => {
  it("converts to Eastern time on both sides of daylight saving", () => {
    expect(nowET(new Date("2026-10-10T03:30:00Z"))).toEqual({ date: "2026-10-09", time: "23:30" });
    expect(nowET(new Date("2026-12-01T04:30:00Z"))).toEqual({ date: "2026-11-30", time: "23:30" });
  });
  it("knows the kitchen hours", () => {
    expect(kitchenStatus({ date: "2026-10-08", time: "22:59" }).open).toBe(true); // Thu
    expect(kitchenStatus({ date: "2026-10-08", time: "23:00" }).open).toBe(false);
    expect(kitchenStatus({ date: "2026-10-09", time: "23:30" }).text).toBe("Kitchen open now · until midnight"); // Fri
    expect(kitchenStatus({ date: "2026-10-09", time: "10:00" }).text).toBe("Kitchen opens at 11 AM today");
  });
});

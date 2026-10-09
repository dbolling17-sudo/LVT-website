import { defineField, defineType } from "sanity";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const special = defineType({
  name: "special",
  title: "Special",
  type: "document",
  fields: [
    defineField({
      name: "type", title: "Kind", type: "string", initialValue: "rotating",
      options: { list: [
        { value: "weekly", title: "Weekly (repeats on weekdays)" },
        { value: "rotating", title: "Additional (runs between two dates)" },
      ], layout: "radio" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "name", type: "string", validation: (r) => r.required().max(60) }),
    defineField({ name: "description", type: "text", rows: 2 }),
    defineField({ name: "price", title: "Price (optional)", type: "number", description: "Leave empty to show no price.", validation: (r) => r.min(0) }),
    defineField({
      name: "days", title: "Which days", type: "array", of: [{ type: "number" }],
      options: { list: DAYS.map((title, value) => ({ title, value })) },
      hidden: ({ parent }) => parent?.type !== "weekly",
      validation: (r) => r.custom((v, ctx) =>
        (ctx.parent as { type?: string })?.type === "weekly" && !(v as number[] | undefined)?.length ? "Pick at least one day." : true),
    }),
    defineField({
      name: "startDate", title: "Start date", type: "date",
      description: "Optional for weekly specials.",
      validation: (r) => r.custom((v, ctx) =>
        (ctx.parent as { type?: string })?.type === "rotating" && !v ? "Additional specials need a start date." : true),
    }),
    defineField({
      name: "endDate", title: "End date", type: "date",
      description: "After this date the special is archived automatically. Optional for weekly specials (use it to pause one).",
      validation: (r) => r.custom((v, ctx) => {
        const p = ctx.parent as { type?: string; startDate?: string };
        if (p?.type === "rotating" && !v) return "Additional specials need an end date.";
        if (v && p?.startDate && (v as string) < p.startDate) return "This is before the start date.";
        return true;
      }),
    }),
    defineField({
      name: "replacesWeekly", title: "Takes the place of the weekly special", type: "boolean", initialValue: false,
      description: "For holidays: hides the regular weekly special on the days this one runs.",
      hidden: ({ parent }) => parent?.type !== "rotating",
    }),
    defineField({
      name: "image", title: "Photo", type: "image", options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Describe the photo", type: "string" })],
    }),
  ],
  preview: {
    select: { title: "name", type: "type", start: "startDate", end: "endDate", media: "image" },
    prepare: ({ title, type, start, end, media }) => ({
      title,
      subtitle: type === "weekly" ? "Weekly" : `${start || "?"} to ${end || "?"}`,
      media,
    }),
  },
});

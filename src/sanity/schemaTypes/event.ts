import { defineField, defineType } from "sanity";
import { CATEGORIES } from "../../lib/events";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const isDate = (v?: string) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v);

export const event = defineType({
  name: "event",
  title: "Event",
  type: "document",
  groups: [
    { name: "basics", title: "Basics", default: true },
    { name: "repeat", title: "Repeat" },
    { name: "more", title: "More options" },
  ],
  fields: [
    defineField({ name: "title", type: "string", group: "basics", validation: (r) => r.required().max(80) }),
    defineField({
      name: "category", title: "Type", type: "string", group: "basics", initialValue: "bingo",
      options: { list: Object.entries(CATEGORIES).map(([value, title]) => ({ value, title })), layout: "radio" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "date", title: "Date (first date, if it repeats)", type: "date", group: "basics", validation: (r) => r.required() }),
    defineField({
      name: "startTime", title: "Start time", type: "string", group: "basics", initialValue: "19:00",
      description: "24-hour time, e.g. 19:00 for 7 PM.",
      validation: (r) => r.required().regex(/^([01]\d|2[0-3]):[0-5]\d$/, { name: "time" }),
    }),
    defineField({
      name: "recur", title: "Repeats", type: "object", group: "repeat",
      options: { collapsible: false },
      fields: [
        defineField({
          name: "type", title: "How often", type: "string", initialValue: "none",
          options: { list: [
            { value: "none", title: "Does not repeat" },
            { value: "weekly", title: "Weekly" },
            { value: "monthly", title: "Monthly (same weekday)" },
          ], layout: "radio" },
        }),
        defineField({
          name: "days", title: "Repeat on", type: "array", of: [{ type: "number" }],
          description: "Leave empty to use the first date's weekday.",
          options: { list: DAYS.map((title, value) => ({ title, value })) },
          hidden: ({ parent }) => parent?.type !== "weekly",
        }),
        defineField({
          name: "interval", title: "Every", type: "number", initialValue: 1,
          options: { list: [{ value: 1, title: "Every week" }, { value: 2, title: "Every other week" }], layout: "radio" },
          hidden: ({ parent }) => parent?.type !== "weekly",
        }),
        defineField({
          name: "nth", title: "Which one", type: "string", initialValue: "nth",
          description: "Same week of the month as the first date (e.g. second Tuesday), or the last one.",
          options: { list: [{ value: "nth", title: "Same week as the first date" }, { value: "last", title: "Last one of the month" }], layout: "radio" },
          hidden: ({ parent }) => parent?.type !== "monthly",
        }),
        defineField({
          name: "until", title: "Stop repeating after (optional)", type: "date",
          description: "Leave empty to keep repeating until you delete it.",
          hidden: ({ parent }) => !parent?.type || parent.type === "none",
          validation: (r) => r.custom((until, ctx) => {
            const date = (ctx.document as { date?: string } | undefined)?.date;
            return until && date && (until as string) < date ? "This is before the first date." : true;
          }),
        }),
      ],
    }),
    defineField({
      name: "skip", title: "Skip these dates", type: "array", group: "repeat", of: [{ type: "date" }],
      description: "Cancel single dates of a repeating event, like a holiday.",
      validation: (r) => r.custom((v) => (((v as string[] | undefined) || []).every(isDate) ? true : "Use real dates.")),
    }),
    defineField({ name: "description", type: "text", rows: 3, group: "more" }),
    defineField({
      name: "endTime", title: "End time (optional)", type: "string", group: "more",
      description: "Defaults to 3 hours after the start. An end earlier than the start means it runs past midnight.",
      validation: (r) => r.regex(/^([01]\d|2[0-3]):[0-5]\d$/, { name: "time" }),
    }),
    defineField({
      name: "registrationUrl", title: "Sign-up or ticket link (optional)", type: "url", group: "more",
      validation: (r) => r.uri({ scheme: ["https", "http"] }),
    }),
    defineField({
      name: "image", title: "Photo", type: "image", group: "more", options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Describe the photo", type: "string" })],
    }),
    defineField({ name: "flyer", title: "Flyer (image or PDF)", type: "file", group: "more", options: { accept: "image/*,application/pdf" } }),
  ],
  orderings: [{ title: "Date", name: "dateDesc", by: [{ field: "date", direction: "desc" }] }],
  preview: {
    select: { title: "title", date: "date", time: "startTime", type: "recur.type", media: "image" },
    prepare: ({ title, date, time, type, media }) => ({
      title,
      subtitle: `${date || "No date"} ${time || ""}${type && type !== "none" ? ` · repeats ${type}` : ""}`,
      media,
    }),
  },
});

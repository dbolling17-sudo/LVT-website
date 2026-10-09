// Copies Devon's weekly specials into Sanity as editable documents (weekly-0 … weekly-6).
// Safe to run more than once: existing documents are left as they are.
// Usage: SANITY_API_TOKEN=... node scripts/seed-weekly-specials.mjs
import { createClient } from "@sanity/client";

const token = process.env.SANITY_API_TOKEN;
if (!token) throw new Error("Set SANITY_API_TOKEN (an Editor token from sanity.io/manage).");

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "vp3mgov9",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-10-01",
  token,
  useCdn: false,
});

// Same list as src/data/starting-content.ts.
const WEEKLY = [
  [0, "Burgers and breakfast specials"],
  [1, "Mussels"],
  [2, "Tacos"],
  [3, "Ribs and burgers"],
  [4, "60¢ wings"],
  [5, "Steak special"],
  [6, "Half-slab ribs and tacos"],
];

const tx = client.transaction();
for (const [day, name] of WEEKLY) {
  tx.createIfNotExists({ _id: `weekly-${day}`, _type: "special", type: "weekly", name, days: [day] });
}
const res = await tx.commit();
console.log(`Done: ${res.results.length} weekly specials checked or created.`);

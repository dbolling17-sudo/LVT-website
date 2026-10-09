// Sanity project settings. Until Devon's Sanity project exists these are empty,
// and the site falls back to src/data/starting-content.ts with no events.
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2026-10-01";
export const sanityConfigured = Boolean(projectId);

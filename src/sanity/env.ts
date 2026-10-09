// Sanity project settings. The project ID is public (it appears in every page that loads
// content), so Devon's project is the default; the env var can point a preview at another one.
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "vp3mgov9";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2026-10-01";
export const sanityConfigured = Boolean(projectId);

import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, sanityConfigured } from "./env";

// Published content only, read through Sanity's CDN. Pages cache the results and are
// refreshed by the webhook in src/app/api/revalidate when an editor publishes.
export const client = sanityConfigured
  ? createClient({ projectId, dataset, apiVersion, useCdn: true, perspective: "published" })
  : null;

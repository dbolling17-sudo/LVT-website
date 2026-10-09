import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";
import { sanityConfigured } from "@/sanity/env";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  if (!sanityConfigured) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1>Content dashboard</h1>
        <p>Sanity isn&apos;t connected yet. Set NEXT_PUBLIC_SANITY_PROJECT_ID to turn this on.</p>
      </main>
    );
  }
  return <NextStudio config={config} />;
}

import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/studio", "/api/"] }], sitemap: `${SITE.siteUrl}/sitemap.xml` };
}

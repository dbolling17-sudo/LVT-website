import type { Metadata, Viewport } from "next";
import { Kalam, Onest } from "next/font/google";
import { SITE } from "@/config/site";
import "./globals.css";

const onest = Onest({ variable: "--font-onest", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const kalam = Kalam({ variable: "--font-kalam", subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.siteUrl),
  title: { default: `${SITE.name} · ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: `${SITE.city}'s neighborhood tavern since ${SITE.established}. Daily specials, events, and online ordering for pickup.`,
  openGraph: { siteName: SITE.name, type: "website", images: ["/img/p18.jpg"] },
};

export const viewport: Viewport = { themeColor: "#141414" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${onest.variable} ${kalam.variable}`}>
      <body>{children}</body>
    </html>
  );
}

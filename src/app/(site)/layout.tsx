import { Analytics } from "@/components/Analytics";
import { Footer, StickyOrderBar } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <StickyOrderBar />
      <Analytics />
    </>
  );
}

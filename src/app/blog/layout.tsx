import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import FabSpeedDial from "@/components/FabSpeedDial";
import ScrollReveal from "@/components/ScrollReveal";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      {children}
      <Footer />
      <FabSpeedDial />
      <ScrollReveal />
    </>
  );
}

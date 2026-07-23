import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import ShopFAB from "@/components/ShopFAB";
import ShopAnnounceModal from "@/components/ShopAnnounceModal";
import ScrollReveal from "@/components/ScrollReveal";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <ShopFAB />
      <WhatsAppFAB />
      {/* <ShopAnnounceModal /> */}
      <ScrollReveal />
    </>
  );
}

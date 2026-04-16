import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/WhatsAppFAB";
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
      <WhatsAppFAB />
      <ScrollReveal />
    </>
  );
}

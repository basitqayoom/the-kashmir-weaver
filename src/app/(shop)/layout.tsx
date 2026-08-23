import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import FabSpeedDial from "@/components/FabSpeedDial";
import ScrollReveal from "@/components/ScrollReveal";
import ImageModalProvider from "@/components/ImageModal";

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ImageModalProvider>
            <SiteHeader />
            {children}
            <Footer />
            <FabSpeedDial />
            <ScrollReveal />
        </ImageModalProvider>
    );
}

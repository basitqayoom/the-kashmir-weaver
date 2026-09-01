import { ImageResponse } from "next/og";
import { getProductByHandle, getAllProductsForCatalog } from "@/lib/shopify/products";

export const alt = "The Kashmir Weaver Product";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const products = await getAllProductsForCatalog();
  return products.map((product) => ({ handle: product.handle }));
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  const title = product?.title ?? "Product";
  const type = product?.productType ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "60px",
          background: "linear-gradient(135deg, #2D2A26 0%, #6B1D2A 100%)",
          fontFamily: "serif",
        }}
      >
        {type && (
          <div
            style={{
              fontSize: 14,
              letterSpacing: "0.25em",
              color: "#D4AF37",
              textTransform: "uppercase",
              fontWeight: 600,
              marginBottom: "16px",
            }}
          >
            {type}
          </div>
        )}
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#FAF7F2",
            lineHeight: 1.2,
            maxWidth: "900px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginTop: "32px",
          }}
        >
          <div style={{ width: "40px", height: "2px", background: "#D4AF37" }} />
          <div
            style={{
              fontSize: 16,
              color: "#FAF7F2AA",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            The Kashmir Weaver
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

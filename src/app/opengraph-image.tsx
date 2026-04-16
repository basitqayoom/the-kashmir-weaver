import { ImageResponse } from "next/og";

export const alt = "The Kashmir Weaver — Authentic GI-Certified Kashmiri Pashmina";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6B1D2A 0%, #0A2E1C 100%)",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: 18,
              letterSpacing: "0.3em",
              color: "#D4AF37",
              textTransform: "uppercase",
              fontWeight: 300,
            }}
          >
            GI-Certified Kashmiri Pashmina
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#FAF7F2",
              textAlign: "center",
              lineHeight: 1.1,
              maxWidth: "900px",
            }}
          >
            The Kashmir Weaver
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#FAF7F2CC",
              textAlign: "center",
              maxWidth: "700px",
              lineHeight: 1.5,
              marginTop: "8px",
            }}
          >
            Authentic handwoven luxury from the looms of Kashmir
          </div>
          <div
            style={{
              marginTop: "24px",
              width: "60px",
              height: "2px",
              background: "#D4AF37",
            }}
          />
          <div
            style={{
              fontSize: 14,
              letterSpacing: "0.2em",
              color: "#D4AF3799",
              textTransform: "uppercase",
              marginTop: "8px",
            }}
          >
            thekashmirweaver.com
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

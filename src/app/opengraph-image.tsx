import { ImageResponse } from "next/og";

// Kartu Open Graph default (1200x630) untuk berbagi tautan ke WhatsApp/Facebook.
// Otomatis dipasang Next di metadata setiap rute yang tak menimpa openGraph.images.
export const alt = "Bani Amenan Effendi & Siti Djamilah";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          background:
            "radial-gradient(900px 500px at 50% -10%, rgba(15,122,87,0.45), transparent 60%), #0a120e",
          color: "#ecead9",
          fontFamily: "Georgia, 'Times New Roman', serif",
          padding: 80,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 132,
            height: 132,
            borderRadius: 28,
            background: "#0a120e",
            border: "3px solid rgba(193,154,46,0.55)",
            color: "#c19a2e",
            fontSize: 80,
            fontWeight: 700,
            marginBottom: 36,
          }}
        >
          ب
        </div>
        <div style={{ fontSize: 30, letterSpacing: 8, color: "#c19a2e", textTransform: "uppercase" }}>
          Silsilah Keluarga
        </div>
        <div style={{ fontSize: 72, fontWeight: 800, marginTop: 14, lineHeight: 1.1 }}>
          Bani Amenan Effendi
        </div>
        <div style={{ fontSize: 44, fontWeight: 600, color: "#9aa39b", marginTop: 6 }}>
          &amp; Siti Djamilah
        </div>
      </div>
    ),
    { ...size },
  );
}

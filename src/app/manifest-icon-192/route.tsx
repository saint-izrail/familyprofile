import { ImageResponse } from "next/og";

// Ikon PWA 192x192 (untuk install di layar utama).
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a120e",
          color: "#c19a2e",
          fontSize: 120,
          fontWeight: 700,
          fontFamily: "Georgia, 'Times New Roman', serif",
          lineHeight: 1,
        }}
      >
        ب
      </div>
    ),
    { width: 192, height: 192 },
  );
}

import { ImageResponse } from "next/og";

// Ikon aplikasi yang dibuat secara terprogram: latar emerald gelap dengan
// huruf "ب" emas (inisial "Bani"). ImageResponse hanya mendukung CSS terbatas.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 14,
          color: "#c19a2e",
          fontSize: 42,
          fontWeight: 700,
          fontFamily: "Georgia, 'Times New Roman', serif",
          lineHeight: 1,
        }}
      >
        ب
      </div>
    ),
    { ...size },
  );
}

"use client";

// Batas galat untuk root layout itu sendiri. Menggantikan seluruh dokumen,
// jadi harus menyertakan <html>/<body> dan gaya sendiri (token tema tak tersedia).
import { useEffect } from "react";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
          padding: 24,
          textAlign: "center",
          background:
            "radial-gradient(900px 500px at 50% -10%, rgba(15,122,87,0.35), transparent 60%), #0a120e",
          color: "#ecead9",
          fontFamily: "system-ui, -apple-system, Segoe UI, Arial, sans-serif",
        }}
      >
        <title>Terjadi kesalahan — Bani Amenan Effendi</title>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 72,
            height: 72,
            borderRadius: 18,
            border: "2px solid rgba(193,154,46,0.5)",
            color: "#c19a2e",
            fontFamily: "Georgia, serif",
            fontSize: 40,
            fontWeight: 700,
          }}
        >
          ب
        </div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Terjadi kesalahan</h1>
        <p style={{ margin: 0, maxWidth: 420, fontSize: 14, lineHeight: 1.6, color: "#9aa39b" }}>
          Maaf, aplikasi mengalami kendala. Silakan muat ulang halaman.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          style={{
            marginTop: 8,
            cursor: "pointer",
            border: "none",
            borderRadius: 9999,
            background: "#0b6347",
            color: "#fff",
            padding: "12px 26px",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Coba lagi
        </button>
      </body>
    </html>
  );
}

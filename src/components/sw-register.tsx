"use client";

// Mendaftarkan service worker (PWA installable). Saat versi SW baru mengambil
// alih kontrol, muat ulang sekali agar aset & HTML konsisten — hanya untuk
// pengunjung yang sudah punya controller (pengunjung baru tak ikut reload).
import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {});

    if (!navigator.serviceWorker.controller) return; // instalasi pertama: tak perlu reload

    let refreshing = false;
    const onChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onChange);
    return () => navigator.serviceWorker.removeEventListener("controllerchange", onChange);
  }, []);

  return null;
}

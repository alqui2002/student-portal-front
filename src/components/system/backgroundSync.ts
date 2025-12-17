"use client";

import { useEffect } from "react";

export default function BackgroundSync() {
  useEffect(() => {
    const runSync = async () => {
      try {
        await Promise.allSettled([]);
      } catch (err) {
        console.warn("⚠️ Error en background sync:", err);
      }
    };

    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => runSync());
    } else {
      setTimeout(runSync, 500);
    }
  }, []);

  return null;
}

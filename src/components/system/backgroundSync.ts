"use client";

import { useEffect } from "react";
// import { syncPurchases, syncWallet } from "@/lib/api/tienda";
// import { syncEvents } from "@/lib/api/calendar";
// import { syncUserWithBackend } from "@/lib/api/user-sync";
// import { syncCareer, syncCommissions, syncCouses } from "@/lib/api/core";

export default function BackgroundSync() {
  useEffect(() => {
    const runSync = async () => {
      try {
        await Promise.allSettled([
          // syncCareer(),
          // syncUserWithBackend(),
          // syncWallet(),
          // syncPurchases(),
          // syncEvents(),
          // syncCouses(),
          // syncCommissions(),
        ]);
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

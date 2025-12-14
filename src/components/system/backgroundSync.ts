"use client";

import { useEffect } from "react";
import { syncPurchases, syncWallet } from "@/lib/api/tienda";
import { syncEvents } from "@/lib/api/calendar"; // si existe
import { syncUserWithBackend } from "@/lib/api/user-sync";
import { syncCareer, syncCouses } from "@/lib/api/core";

export default function BackgroundSync() {
  useEffect(() => {
    const runSync = async () => {
      // Ejecuta todo en paralelo → no bloquea la UI
      try {
        console.log("🔄 Background sync iniciado...");

        await Promise.allSettled([
          syncUserWithBackend(),
          syncWallet(),
          syncPurchases(),
          syncEvents(),
          syncCareer(),
          syncCouses(),
        ]);

        console.log("✅ Background sync completado.");
      } catch (err) {
        console.warn("⚠️ Error en background sync:", err);
      }
    };

    // Espera que la app esté libre para no afectar performance
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => runSync());
    } else {
      setTimeout(runSync, 500);
    }
  }, []);

  return null; // No renderiza nada
}

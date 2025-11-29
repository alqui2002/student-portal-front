import type { Metadata } from "next";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import NotificationPopup from "@/components/ui/NotificationsPuopup";
import { cookies } from "next/headers";
// import { validateToken } from "@/lib/auth"; // opcional si ya querés validar

export const metadata: Metadata = {
  title: "UADE Connect",
  description: "Portal del estudiante",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // 🔐 leer JWT desde la cookie (por ahora solo para tenerlo disponible)
  const cookieStore = await cookies();
  const jwt = cookieStore.get("JWT")?.value;
  console.log("JWT en layout:", jwt);

  // Si quisieras validar acá:
  // let user = null;
  // if (jwt) {
  //   const result = validateToken(jwt);
  //   if (result.valid) user = result.payload;
  // }

  return (
    <html lang="es" suppressHydrationWarning>
      <body className="flex h-screen">
        <SidebarProvider>
          <AppSidebar />
          <main className="flex-1 bg-white overflow-y-auto">{children}</main>
        </SidebarProvider>

        {/* 🔔 Notificación global */}
        <NotificationPopup />
      </body>
    </html>
  );
}

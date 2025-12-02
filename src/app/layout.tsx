import type { Metadata } from "next";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import NotificationPopup from "@/components/ui/NotificationsPuopup";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "UADE Connect",
  description: "Portal del estudiante",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const jwt = cookieStore.get("JWT")?.value;
  console.log("JWT en layout:", jwt);

  return (
    <html lang="es" suppressHydrationWarning>
      <body className="flex h-screen">
        <SidebarProvider>
          <AppSidebar />
          <main className="flex-1 bg-white overflow-y-auto">{children}</main>
        </SidebarProvider>

        <NotificationPopup />
      </body>
    </html>
  );
}

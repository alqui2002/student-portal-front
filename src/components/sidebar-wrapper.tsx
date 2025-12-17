"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export function SidebarWrapper() {
  return (
    <SidebarProvider>
      <AppSidebar />
    </SidebarProvider>
  );
}

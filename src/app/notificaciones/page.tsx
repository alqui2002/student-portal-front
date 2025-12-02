// src/app/notificaciones/page.tsx
import React from "react";
import { PanelLeft } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import NotificationList from "@/components/notificationList";
import { Metadata } from "next";
import Link from "next/link";
import ArrowUpRight from "lucide-react";

export const metadata: Metadata = {
  title: "Notificaciones | UADE Connect",
};

export default function NotificacionesPage() {
  return (
    <main className="w-full flex flex-col gap-8 bg-white">
      <div className="pt-9.5 pb-9.5 pl-8 flex gap-4 items-center space-x-2 text-sm text-muted-foreground border-b h-[53px]">
        <PanelLeft size={15}></PanelLeft>
        <span className="text-muted-foreground">|</span>
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbPage>Historial de Notificaciones</BreadcrumbPage>
          </BreadcrumbItem>
        </Breadcrumb>
      </div>

      <div className="pl-8 pr-8">
        <NotificationList />
      </div>
    </main>
  );
}

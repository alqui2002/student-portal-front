"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAllNotificationsByUser } from "@/lib/api/notifs";
import type { NotificationData } from "@/lib/api/types";

type Notification = NotificationData;

// 🏷️ Etiquetas según tipo
const getBadgeProps = (type: Notification["type"]) => {
  switch (type) {
    case "exam":
    case "examen":
      return { text: "Exámenes", class: "bg-[#6F97F0] text-[#FFFFFF]" };
    case "sancion":
      return { text: "Sanción", class: "bg-[#6E2F2C] text-[#FFFFFF]" };
    case "evento":
      return { text: "Evento", class: "bg-[#9A6D38] text-[#FFFFFF]" };
    default:
      return { text: "General", class: "bg-gray-200 text-gray-700" };
  }
};

// ⏱️ Tiempo relativo
const timeAgo = (date?: string) => {
  if (!date) return "";
  const diff = new Date().getTime() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Hace minutos";
  return `Hace ${hours} horas`;
};

// 🔔 Componente individual
const NotificationItem: React.FC<{ notification: Notification }> = ({
  notification,
}) => {
  const { text, class: badgeClass } = getBadgeProps(notification.type);

  // 🔗 Rutas por tipo (por defecto)
  const linkMap: Record<string, string> = {
    exam: "/misCursos",
    examen: "/misCursos",
    evento: "/calendario",
    sancion: "/biblioteca",
  };

  const contextLink =
    notification.contextLink || linkMap[notification.type] || "/";
  const context =
    notification.context ||
    (notification.type === "exam" ? "Mis Cursos" : "Notificación");

  return (
    <Link href={contextLink} className="block">
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer">
        <div className="flex justify-between items-start">
          <div className="flex-grow space-y-2">
            <p className="font-semibold text-gray-800">{notification.title}</p>
            <p className="text-sm text-gray-500">
              {notification.message || notification.description}
            </p>

            <div className="flex items-center gap-4 pt-2">
              <Badge
                className={`font-medium rounded-md px-2 py-0.5 ${badgeClass}`}
                variant="default"
              >
                {text}
              </Badge>

              <div className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                <ArrowUpRight size={14} className="mr-1" />
                <span>{context}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400 mt-1">
            {timeAgo(notification.date)}
          </div>
        </div>
      </div>
    </Link>
  );
};

// 📋 Lista completa
export default function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<
    "todos" | "examenes" | "eventos" | "sanciones"
  >("todos");

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const data = await getAllNotificationsByUser();
        console.log("📬 Notificaciones desde backend:", data);
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Error al traer notificaciones:", err);
      }
    }

    fetchNotifications();
  }, []);

  const filtered =
    activeTab === "todos"
      ? notifications
      : notifications.filter(n => {
          const map: Record<string, Notification["type"]> = {
            examenes: "exam",
            eventos: "evento",
            sanciones: "sancion",
          };
          return n.type === map[activeTab] || n.type === map[activeTab];
        });

  const counts = {
    todos: notifications.length,
    examenes: notifications.filter(
      n => n.type === "exam" || n.type === "examen"
    ).length,
    eventos: notifications.filter(n => n.type === "evento").length,
    sanciones: notifications.filter(n => n.type === "sancion").length,
  };

  const tabs = [
    { id: "todos", label: `Todos (${counts.todos})` },
    { id: "examenes", label: `Exámenes (${counts.examenes})` },
    { id: "eventos", label: `Eventos (${counts.eventos})` },
    { id: "sanciones", label: `Sanciones (${counts.sanciones})` },
  ];

  return (
    <section className="bg-white w-full">
      <div className="flex gap-8 border-b border-gray-200 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filtered.map(notif => (
          <NotificationItem key={notif.id} notification={notif} />
        ))}

        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No hay notificaciones disponibles.
          </p>
        )}
      </div>
    </section>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAllNotificationsByUser } from "@/lib/api/notifs";
import { getEnrollmentsByUser } from "@/lib/api/enrollments";
import type { NotificationData } from "@/lib/api/types";

type Notification = NotificationData;
type Tab = "todos" | "examenes" | "eventos" | "sanciones";

/* ---------------- HELPERS ---------------- */

function getJWT() {
  if (typeof document === "undefined") return null;
  return document.cookie
    .split("; ")
    .find(c => c.startsWith("JWT="))
    ?.split("=")[1];
}

function isTomorrowUTC(dateString?: string) {
  if (!dateString) return false;

  const d = new Date(dateString);
  const now = new Date();

  const tomorrowUTC = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1
  );

  const dayUTC = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

  return dayUTC === tomorrowUTC;
}

const timeAgo = (date?: string) => {
  if (!date) return "";
  const diff = new Date().getTime() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Hace minutos";
  return `Hace ${hours} horas`;
};

const getBadgeProps = (type: Notification["type"]) => {
  switch (type) {
    case "exam":
    case "examen":
      return { text: "Exámenes", class: "bg-[#6F97F0] text-white" };
    case "sancion":
    case "sanction":
      return { text: "Sanción", class: "bg-[#6E2F2C] text-white" };
    case "event":
    case "evento":
      return { text: "Evento", class: "bg-[#9A6D38] text-white" };
    default:
      return { text: "General", class: "bg-gray-200 text-gray-700" };
  }
};

// 👇 misma lógica que popup: metadata.courseId = commissionId
function buildExamLinkFromEnrollments(notif: any, enrollments: any[]) {
  if (!notif || (notif.type !== "exam" && notif.type !== "examen")) return null;

  const commissionId = notif.metadata?.courseId;
  if (!commissionId) return "/misCursos";

  const enrollment = enrollments.find(
    (e: any) => e?.commission?.id === commissionId
  );

  const courseId = enrollment?.course?.id;
  if (!courseId) return "/misCursos";

  return `/misCursos/${courseId}?commissionId=${commissionId}`;
}

/* ---------------- ITEM ---------------- */

const NotificationItem: React.FC<{
  notification: Notification;
  enrollments: any[];
}> = ({ notification, enrollments }) => {
  const jwt = getJWT();

  let title = notification.title;
  let message = notification.message || (notification as any).description;
  let link = "/";
  let context = "Notificación";

  // EXAMS (✅ link correcto)
  if (notification.type === "exam" || notification.type === "examen") {
    context = "Mis Cursos";
    link =
      buildExamLinkFromEnrollments(notification, enrollments) || "/misCursos";
  }

  // SANCTIONS
  if (notification.type === "sancion" || notification.type === "sanction") {
    context = "Biblioteca";
    link = jwt
      ? `https://biblioteca-uade.vercel.app/penalties?JWT=${jwt}`
      : "/";

    if (notification.metadata?.status === "PAID") {
      title = "✅ Sanción regularizada";
      message = "La sanción fue abonada correctamente.";
    } else {
      title = "📚 Tenés sanciones pendientes en Biblioteca";
      message =
        "Registramos una sanción pendiente. Ingresá a Biblioteca para regularizarla.";
    }
  }

  // EVENTS (solo mañana)
  if (notification.type === "event" || notification.type === "evento") {
    if (!isTomorrowUTC(notification.createdAt)) return null;

    title = `🎓 Evento mañana: ${notification.title}`;
    message = notification.message ?? "Tenés un evento programado para mañana.";
    context = "Eventos";
    link = jwt
      ? `https://desap2-eventos-front.onrender.com/#/?JWT=${jwt}`
      : "https://desap2-eventos-front.onrender.com/#/";
  }

  const { text, class: badgeClass } = getBadgeProps(notification.type);

  const isExternal = link.startsWith("http://") || link.startsWith("https://");

  return (
    <a
      href={link}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="block"
    >
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer">
        <div className="flex justify-between items-start">
          <div className="flex-grow space-y-2">
            <p className="font-semibold text-gray-800">{title}</p>
            <p className="text-sm text-gray-500">{message}</p>

            <div className="flex items-center gap-4 pt-2">
              <Badge
                className={`font-medium rounded-md px-2 py-0.5 ${badgeClass}`}
              >
                {text}
              </Badge>

              <div className="flex items-center text-sm text-gray-500">
                <ArrowUpRight size={14} className="mr-1" />
                <span>{context}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400 mt-1">
            {timeAgo(notification.createdAt)}
          </div>
        </div>
      </div>
    </a>
  );
};

/* ---------------- LIST ---------------- */

export default function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("todos");

  useEffect(() => {
    async function fetchAll() {
      try {
        const [data, enrolls] = await Promise.all([
          getAllNotificationsByUser(),
          getEnrollmentsByUser(),
        ]);

        const clean = Array.isArray(data)
          ? data.filter(n => {
              const t = `${n.title ?? ""} ${n.message ?? ""}`.toLowerCase();
              return !t.includes("transferencia");
            })
          : [];

        setNotifications(clean);
        setEnrollments(Array.isArray(enrolls) ? enrolls : []);
      } catch (e) {
        console.error("❌ Error cargando notificaciones/enrollments:", e);
      }
    }

    fetchAll();
  }, []);

  const filtered = notifications.filter(n => {
    if (activeTab === "todos") return true;
    if (activeTab === "examenes")
      return n.type === "exam" || n.type === "examen";
    if (activeTab === "sanciones")
      return n.type === "sancion" || n.type === "sanction";
    if (activeTab === "eventos")
      return (
        (n.type === "event" || n.type === "evento") &&
        isTomorrowUTC(n.createdAt)
      );
    return false;
  });

  const counts = {
    todos: notifications.length,
    examenes: notifications.filter(
      n => n.type === "exam" || n.type === "examen"
    ).length,
    sanciones: notifications.filter(
      n => n.type === "sancion" || n.type === "sanction"
    ).length,
    eventos: notifications.filter(
      n =>
        (n.type === "event" || n.type === "evento") &&
        isTomorrowUTC(n.createdAt)
    ).length,
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "todos", label: `Todos (${counts.todos})` },
    { id: "examenes", label: `Exámenes (${counts.examenes})` },
    { id: "eventos", label: `Eventos (${counts.eventos})` },
    { id: "sanciones", label: `Sanciones (${counts.sanciones})` },
  ];

  return (
    <section className="bg-white w-full">
      {/* TABS */}
      <div className="flex gap-8 border-b border-gray-200 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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

      {/* LIST */}
      <div className="grid gap-4">
        {filtered.map(n => (
          <NotificationItem
            key={n.id}
            notification={n}
            enrollments={enrollments}
          />
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

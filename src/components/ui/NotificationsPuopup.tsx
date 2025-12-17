"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import {
  getNotificationsByUser,
  patchReadNotification,
} from "@/lib/api/notifs";
import { getEnrollmentsByUser } from "@/lib/api/enrollments";

function getAssessmentLabel(type?: string) {
  switch (type) {
    case "PARCIAL_1":
      return "Parcial 1";
    case "PARCIAL_2":
      return "Parcial 2";
    case "RECUPERATORIO":
      return "Recuperatorio";
    case "FINAL":
      return "Examen final";
    default:
      return "Evaluación";
  }
}

function getCourseNameFromEnrollments(notif: any, enrollments: any[]) {
  if (!notif || notif.type !== "exam") return null;

  const commissionId = notif.metadata?.courseId;
  if (!commissionId) return null;

  const enrollment = enrollments.find(e => e.commission?.id === commissionId);

  return enrollment?.course?.name ?? null;
}

function buildExamSubtitle(notif: any) {
  if (!notif || notif.type !== "exam" || !notif.metadata) return null;

  const label = getAssessmentLabel(notif.metadata.assessmentType);
  const grade = notif.metadata.grade;

  return grade ? `${label}: ${grade}` : label;
}

function buildCourseLinkFromEnrollments(notif: any, enrollments: any[]) {
  if (!notif || notif.type !== "exam") return null;

  const commissionId = notif.metadata?.courseId;
  if (!commissionId) return null;

  const enrollment = enrollments.find(e => e.commission?.id === commissionId);

  const courseId = enrollment?.course?.id;
  return courseId
    ? `/misCursos/${courseId}?commissionId=${commissionId}`
    : null;
}

function buildSanctionTitle(notif: any) {
  return notif.metadata?.status === "PAID"
    ? "✅ Sanción regularizada"
    : "📚 Tenés sanciones pendientes en Biblioteca";
}

function buildSanctionMessage(notif: any) {
  const status = notif.metadata?.status;
  const amount = notif.metadata?.amount;

  if (status === "PAID") {
    return amount
      ? `La sanción fue abonada correctamente.`
      : "La sanción fue abonada correctamente.";
  }

  return "Registramos una sanción pendiente. Ingresá a Biblioteca para regularizarla.";
}

function buildLibraryLink() {
  if (typeof document === "undefined") return null;

  const token = document.cookie
    .split("; ")
    .find(c => c.startsWith("JWT="))
    ?.split("=")[1];

  return token
    ? `https://biblioteca-uade.vercel.app/penalties?JWT=${token}`
    : null;
}

function isTomorrow(dateString?: string) {
  if (!dateString) return false;

  const eventUTC = new Date(dateString);

  const now = new Date();

  // hoy en UTC (00:00)
  const todayUTC = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );

  // mañana en UTC (00:00)
  const tomorrowUTC = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1
  );

  const eventDayUTC = Date.UTC(
    eventUTC.getUTCFullYear(),
    eventUTC.getUTCMonth(),
    eventUTC.getUTCDate()
  );

  return eventDayUTC === tomorrowUTC;
}

function buildEventTitle(notif: any) {
  return `🎓 Evento mañana: ${notif.title}`;
}

function buildEventMessage(notif: any) {
  return notif.message ?? "Tenés un evento programado para mañana.";
}

function buildEventLink() {
  if (typeof document === "undefined") return null;

  const token = document.cookie
    .split("; ")
    .find(c => c.startsWith("JWT="))
    ?.split("=")[1];

  return token
    ? `https://desap2-eventos-front.onrender.com/#/?JWT=${token}`
    : null;
}

export default function NotificationPopup() {
  const [open, setOpen] = useState(false);
  const [notif, setNotif] = useState<any | null>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);

  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const [notifs, enrolls] = await Promise.all([
          getNotificationsByUser(),
          getEnrollmentsByUser(),
        ]);

        setEnrollments(Array.isArray(enrolls) ? enrolls : []);

        const validNotif = Array.isArray(notifs)
          ? notifs.find((n: any) => {
              if (!n || n.title?.toLowerCase().includes("transferencia")) {
                return false;
              }

              if (n.type === "exam" || n.type === "sanction") return true;

              if (n.type === "event") {
                return isTomorrow(n.createdAt);
              }

              return false;
            })
          : null;

        if (validNotif) {
          setNotif(validNotif);
          setOpen(true);
        }
      } catch (err) {
        console.error("❌ Error cargando popup de notificaciones:", err);
      }
    }

    fetchData();
  }, []);

  if (!notif) return null;

  const courseName = getCourseNameFromEnrollments(notif, enrollments);
  const examSubtitle = buildExamSubtitle(notif);
  const courseLink = buildCourseLinkFromEnrollments(notif, enrollments);
  const libraryLink = notif.type === "sanction" ? buildLibraryLink() : null;
  const eventLink = notif.type === "event" ? buildEventLink() : null;

  async function handleClose() {
    await patchReadNotification(notif.id);
    setOpen(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-[420px] rounded-xl bg-white shadow-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold text-black">
            {notif.type === "exam" && courseName
              ? `Tienes una nueva nota en ${courseName}`
              : notif.type === "sanction"
                ? buildSanctionTitle(notif)
                : notif.type === "event"
                  ? buildEventTitle(notif)
                  : notif.title}
          </AlertDialogTitle>

          <AlertDialogDescription className="text-gray-700 mt-2">
            {notif.type === "exam"
              ? (examSubtitle ?? notif.message)
              : notif.type === "sanction"
                ? buildSanctionMessage(notif)
                : notif.type === "event"
                  ? buildEventMessage(notif)
                  : notif.message}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-5 flex justify-end gap-2">
          {courseLink && (
            <AlertDialogAction
              onClick={() => {
                handleClose();
                router.push(courseLink);
              }}
              className="bg-[#6F97F0] text-white"
            >
              Ver materia
            </AlertDialogAction>
          )}

          {libraryLink && (
            <AlertDialogAction
              onClick={() => {
                handleClose();
                window.open(libraryLink, "_blank");
              }}
              className="bg-[#6F97F0] text-white"
            >
              Ver Biblioteca
            </AlertDialogAction>
          )}

          {eventLink && (
            <AlertDialogAction
              onClick={() => {
                handleClose();
                window.open(eventLink, "_blank");
              }}
              className="bg-[#6F97F0] text-white"
            >
              Ver evento
            </AlertDialogAction>
          )}

          <AlertDialogAction
            onClick={handleClose}
            className="bg-gray-200 text-black"
          >
            Entendido
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

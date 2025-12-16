import { jwtDecode } from "jwt-decode";
import { apiFetch } from "./client";
import { getEnrollmentsByUser } from "@/lib/api/enrollments";

type Enrollment = {
  commissionId: string;
};

type ClaseIndividual = {
  id_clase: string;
  titulo: string;
  fecha_clase: string;
  tipo: string;
};


const userId = getUserIdFromToken();

export async function getEventsByUser() {
  return apiFetch(`/calendar/user/${userId}`);
}

export async function syncEvents() {
  return apiFetch(`/calendar/sync`);
}

function getUserIdFromToken(): string {
  if (typeof document === "undefined") return "";

  const token = document.cookie
    .split("; ")
    .find(row => row.startsWith("JWT="))
    ?.split("=")[1];

  if (!token) throw new Error("No hay sesión activa");

  const decoded: any = jwtDecode(token);
  return decoded.sub;
}



// --- helper interno ---
async function getClassesByCommission(
  commissionId: string
): Promise<ClaseIndividual[]> {
  return apiFetch(
    `https://backoffice-production-df78.up.railway.app/api/v1/clases-individuales?param=id_curso&value=${commissionId}`
  );
}


export async function getExamEventsByUser() {
  // 👇 tipado explícito
  const enrollments = (await getEnrollmentsByUser()) as Enrollment[];

  const commissionIds: string[] = [
    ...new Set(enrollments.map(e => e.commissionId)),
  ];

  const responses: ClaseIndividual[][] = await Promise.all(
    commissionIds.map(id => getClassesByCommission(id))
  );

  const allClasses: ClaseIndividual[] = responses.flat();

  const examTypes = [
    "final",
    "parcial_1",
    "parcial_2",
    "recuperatorio",
  ];

  return allClasses
    .filter(c => examTypes.includes(c.tipo))
    .map(c => ({
      id: c.id_clase,
      title: c.titulo,
      date: c.fecha_clase,
      type: "examen" as const,
      description: `Tipo: ${c.tipo}`,
    }));
}



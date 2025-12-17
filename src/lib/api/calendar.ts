import { jwtDecode } from "jwt-decode";
import { apiFetch } from "./client";

const userId = getUserIdFromToken();

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
export async function getEventsByUser() {
  return apiFetch(`/calendar/user/${userId}`);
}

export async function syncEvents() {
  return apiFetch(`/calendar/sync`);
}

export async function getExams(commissionIds: string[]) {
  return apiFetch(`/calendar/classes-by-commissions`, {
    method: "POST",
    body: JSON.stringify({
      commissionIds,
    }),
  });
}

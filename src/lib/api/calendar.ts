import { jwtDecode } from "jwt-decode";
import { apiFetch } from "./client";

const userId = getUserIdFromToken();
const token = getJwtFromCookie();


function getJwtFromCookie() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/JWT=([^;]+)/);
  return match ? match[1] : null;
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


export async function getEventsByUser() {
  return apiFetch(`/calendar/user/${userId}`);
}


export async function syncEvents() {
  return apiFetch(`/calendar/sync`, {
    method: "POST",
  headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

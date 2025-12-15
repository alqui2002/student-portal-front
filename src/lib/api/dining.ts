import { apiFetch } from "./client";
import { DiningReservation } from "./types";
import { jwtDecode } from "jwt-decode";

// Función auxiliar para sacar el ID del token (igual que en tienda.ts)
function getUserIdFromToken(): string {
  if (typeof document === "undefined") return "";
  const token = document.cookie
    .split("; ")
    .find(row => row.startsWith("JWT="))
    ?.split("=")[1];
  if (!token) return "";
  const decoded: any = jwtDecode(token);
  return decoded.sub;
}

// Obtener todas las reservas del usuario
export async function getUserDiningReservations(): Promise<
  DiningReservation[]
> {
  const userId = getUserIdFromToken();
  if (!userId) return [];

  // ATENCIÓN: Uso 'dinning' con doble N porque así se llama la carpeta en tu backend
  return apiFetch<DiningReservation[]>(`/dinning/user/${userId}`);
}

import { apiFetch } from "./client";
import { DiningReservation } from "./types";
import { jwtDecode } from "jwt-decode";

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

export async function getUserDiningReservations(): Promise<
  DiningReservation[]
> {
  const userId = getUserIdFromToken();
  if (!userId) return [];

  return apiFetch<DiningReservation[]>(`/dinning/user/${userId}`);
}

import { apiFetch } from "./client";
import { NotificationData } from "./types";


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
const token = getJwtFromCookie();

export async function getNotificationsByUser(): Promise<NotificationData[]> {
  return apiFetch<NotificationData[]>(
    `/notifications?status=unread&userId=${userId}`
  );
}

export async function patchReadNotification(notificationId: string) {
  return apiFetch(`/notifications/${notificationId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isRead: true }),
  });
}

export async function getAllNotificationsByUser(): Promise<NotificationData[]> {
  return apiFetch<NotificationData[]>(`/notifications?userId=${userId}`);
}

function getJwtFromCookie() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/JWT=([^;]+)/);
  return match ? match[1] : null;
}

import { apiFetch } from "./client";
import { NotificationData } from "./types";

const userId = "00debe32-abd2-45a8-bece-3d3b752fa140";
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

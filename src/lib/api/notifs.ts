import { apiFetch } from "./client";
import { NotificationData } from "./types";

const userId = "3e7df85d-2eac-4c1d-aa7f-87e1ec2b11e6";
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
  if (typeof document === "undefined") return null; // SSR safe
  const match = document.cookie.match(/JWT=([^;]+)/);
  return match ? match[1] : null;
}

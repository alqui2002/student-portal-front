import { apiFetch } from "./client";
import { NotificationData } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const userId = "09109e49-e243-4db8-b3b8-291e1f997bda";

const FIXED_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhM2I1ZjZkNC05YzI4LTRiNDEtYmI5MC05ZDM2YTkyZjRiMTciLCJlbWFpbCI6ImdyZWdvcmlvY2FycmFuemFAaG90bWFpbC5jb20iLCJuYW1lIjoiR3JlZ29yaW8iLCJyb2xlIjoiQUxVTU5PIiwiY2FyZWVyIjp7InV1aWQiOiJlZGI1YTc1NC02NTE5LTQ4OTUtODQ2NC1iNzcwN2U3Nzc5NjMiLCJuYW1lIjoiTGljZW5jaWF0dXJhIGVuIFNpc3RlbWFzIGRlIEluZm9ybWFjacOzbiJ9LCJpYXQiOjE3NjI5ODc2MDEsImV4cCI6MTc2Mjk5NjYwMX0.6F-RRfC2XHUHNSg2v96mrrzVo0E2wrA_-3WgLa-0JFQ";

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
      Authorization: `Bearer ${FIXED_TOKEN}`,
    },
    body: JSON.stringify({ isRead: true }),
  });
}

export async function getAllNotificationsByUser(): Promise<NotificationData[]> {
  return apiFetch<NotificationData[]>(`/notifications?userId=${userId}`);
}

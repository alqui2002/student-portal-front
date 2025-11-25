import { apiFetch } from "./client";
import { NotificationData } from "./types";

const userId = "3e7df85d-2eac-4c1d-aa7f-87e1ec2b11e6";

const FIXED_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhM2I1ZjZkNC05YzI4LTRiNDEtYmI5MC05ZDM2YTkyZjRiMTciLCJlbWFpbCI6ImdyZWdvcmlvY2FycmFuemFAaG90bWFpbC5jb20iLCJuYW1lIjoiR3JlZ29yaW8iLCJyb2xlIjoiQUxVTU5PIiwiY2FyZWVyIjp7InV1aWQiOiJlZGI1YTc1NC02NTE5LTQ4OTUtODQ2NC1iNzcwN2U3Nzc5NjMiLCJuYW1lIjoiTGljZW5jaWF0dXJhIGVuIFNpc3RlbWFzIGRlIEluZm9ybWFjacOzbiJ9LCJpYXQiOjE3NjQxMDY3NDIsImV4cCI6MTc2NDExNTc0Mn0.K6jAvy-QW-tjnbRBSc6GiZi61qachJIHrr7XJV09VN0";

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

import { apiFetch } from "./client";

const userId = "3e7df85d-2eac-4c1d-aa7f-87e1ec2b11e6";

export async function getEventsByUser() {
  return apiFetch(`/calendar/user/${userId}`);
}

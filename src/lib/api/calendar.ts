import { apiFetch } from "./client";

const userId = "00debe32-abd2-45a8-bece-3d3b752fa140";

export async function getEventsByUser() {
  return apiFetch(`/calendar/user/${userId}`);
}

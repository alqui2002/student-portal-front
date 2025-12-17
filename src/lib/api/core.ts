import { apiFetch } from "./client";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://student-portal-api-production.up.railway.app";

export async function getUser() {
  return apiFetch("/account/me");
}

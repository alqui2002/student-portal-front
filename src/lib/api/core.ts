import { apiFetch } from "./client";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://student-portal-api-production.up.railway.app";
//http://localhost:3000/users

export async function getUserInfoByUserID(userId: number) {
  return apiFetch(`/enrollments?userId=${userId}`);
}

// lib/api/client.ts

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://student-portal-api-production.up.railway.app";

const STATIC_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhM2I1ZjZkNC05YzI4LTRiNDEtYmI5MC05ZDM2YTkyZjRiMTciLCJlbWFpbCI6ImdyZWdvcmlvY2FycmFuemFAaG90bWFpbC5jb20iLCJuYW1lIjoiR3JlZ29yaW8iLCJyb2xlIjoiQUxVTU5PIiwiY2FyZWVyIjp7InV1aWQiOiJlZGI1YTc1NC02NTE5LTQ4OTUtODQ2NC1iNzcwN2U3Nzc5NjMiLCJuYW1lIjoiTGljZW5jaWF0dXJhIGVuIFNpc3RlbWFzIGRlIEluZm9ybWFjacOzbiJ9LCJpYXQiOjE3NjQxMDI5MzEsImV4cCI6MTc2NDExMTkzMX0.U_N6BqNOuJY1ihkRPx5CQvuyX1srtgV5S6K0koVIm8c";
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STATIC_TOKEN}`,
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const errorText = await res.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || `Error ${res.status}`);
    } catch (e) {
      throw new Error(errorText || `Error ${res.status}`);
    }
  }

  const text = await res.text();
  if (!text) {
    return true as T;
  }

  return JSON.parse(text);
}

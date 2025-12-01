const API_URL = "https://student-portal-api-production.up.railway.app";

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getJwtFromBrowser();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    console.error("Error:", res.status, await res.text());
    throw new Error("API Error");
  }

  return res.json() as Promise<T>;
}

function getJwtFromBrowser() {
  if (typeof document === "undefined") return null;

  const match = document.cookie.split("; ").find(row => row.startsWith("JWT="));

  return match ? match.split("=")[1] : null;
}

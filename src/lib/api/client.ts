const API_URL = "https://student-portal-api-production.up.railway.app";

const CORE_LOGIN_URL = "https://core-frontend-2025-02.netlify.app";

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

  if (res.status === 401) {
    console.error("Sesión expirada o inválida. Redirigiendo al login...");

    document.cookie = "JWT=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

    if (typeof window !== "undefined") {
      const returnUrl = encodeURIComponent(window.location.origin);

      window.location.href = `${CORE_LOGIN_URL}/?redirectUrl=${returnUrl}`;
    }

    return new Promise(() => {});
  }

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

export function performLogout() {
  document.cookie = "JWT=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

  window.location.href = "https://core-frontend-2025-02.netlify.app/logout";
}

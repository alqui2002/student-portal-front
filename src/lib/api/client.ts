const API_URL = "https://student-portal-api-production.up.railway.app";
// URL del Login del CORE para redirigir en caso de error
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

  // -------------------------------------------------------------------
  // INTERCEPTOR DE SEGURIDAD (Nuevo)
  // -------------------------------------------------------------------
  if (res.status === 401) {
    console.error("Sesión expirada o inválida. Redirigiendo al login...");

    // 1. Borramos la cookie inválida para evitar bucles
    document.cookie = "JWT=; path=/; max-age=0";

    // 2. Preparamos la URL de retorno
    // Verificamos que 'window' exista (por si esto corre en servidor)
    if (typeof window !== "undefined") {
      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `${CORE_LOGIN_URL}/?redirectUrl=${currentUrl}`;
    }

    // CAMBIO AQUÍ:
    // En lugar de throw new Error("Session expired");
    // Devolvemos una promesa que nunca termina.
    // Esto evita que React intente renderizar con datos rotos mientras nos vamos.
    return new Promise(() => {});
  }
  // -------------------------------------------------------------------

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

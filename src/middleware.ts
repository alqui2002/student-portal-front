import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode"; // Usamos la librería que instalaste

// URL del Login del CORE
const CORE_LOGIN_URL = "https://core-frontend-2025-02.netlify.app";

// Interface para que Typescript entienda qué hay dentro del token
interface JWTPayload {
  exp: number; // Expiration time (unix timestamp)
  // Puedes agregar user, role, etc si lo necesitas
}

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // 1. IGNORAR ARCHIVOS PÚBLICOS Y ESTÁTICOS
  // Si no hacemos esto, el middleware intentará validar el token para cargar
  // el logo, el CSS, las imágenes, etc., haciendo la web lenta.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // Si tiene punto (ej: image.png) es un archivo
  ) {
    return NextResponse.next();
  }

  // -----------------------------------------------------------------------
  // ESCENARIO A: El usuario viene del CORE con un JWT en la URL
  // -----------------------------------------------------------------------
  const jwtFromUrl = searchParams.get("JWT");

  if (jwtFromUrl) {
    // Limpiamos la URL (quitamos el ?JWT=...)
    const cleanUrl = new URL(pathname, req.url);

    // Mantenemos otros parámetros si existieran (buena práctica)
    searchParams.forEach((value, key) => {
      if (key !== "JWT") cleanUrl.searchParams.set(key, value);
    });

    const res = NextResponse.redirect(cleanUrl);

    // Guardamos la cookie
    res.cookies.set("JWT", jwtFromUrl, {
      httpOnly: false, // false para que tu cliente HTTP pueda leerla si es necesario
      secure: process.env.NODE_ENV === "production", // True en Railway, False en Localhost
      sameSite: "lax",
      path: "/",
    });

    return res;
  }

  // -----------------------------------------------------------------------
  // ESCENARIO B: Navegación normal (Validar cookie existente)
  // -----------------------------------------------------------------------
  const cookieJwt = req.cookies.get("JWT")?.value;

  // Función helper para expulsar al usuario al login del Core
  const redirectToCore = () => {
    // encodeURIComponent es vital para que la URL viaje bien como parámetro
    const redirectBack = encodeURIComponent(req.url);
    return NextResponse.redirect(
      `${CORE_LOGIN_URL}/?redirectUrl=${redirectBack}`
    );
  };

  // 1. Si NO tiene cookie -> Redirigir al Core
  if (!cookieJwt) {
    return redirectToCore();
  }

  // 2. Si TIENE cookie -> Verificar si expiró (Lo que pidió tu equipo)
  try {
    const decoded = jwtDecode<JWTPayload>(cookieJwt);
    const currentTime = Date.now() / 1000; // Convertimos milisegundos a segundos UNIX

    // Si la fecha de expiración es menor a la actual, ya venció
    if (decoded.exp < currentTime) {
      console.log("Token vencido. Redirigiendo al Core para renovar.");

      // Opcional: Borramos la cookie vieja antes de redirigir
      const response = redirectToCore();
      response.cookies.delete("JWT");
      return response;
    }
  } catch (error) {
    // Si el token es basura (texto random) o está corrupto -> Redirigir
    console.error("Token inválido:", error);
    return redirectToCore();
  }

  // Si llegamos acá: Tiene cookie y NO ha expirado. Pase, amigo.
  return NextResponse.next();
}

// Configuración del Matcher optimizada
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * - api (rutas de backend interno)
     * - _next/static (archivos estáticos de next)
     * - _next/image (imágenes optimizadas)
     * - favicon.ico (icono)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

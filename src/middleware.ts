import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

const CORE_LOGIN_URL = "https://core-frontend-2025-02.netlify.app";

interface JWTPayload {
  exp: number;
}

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const jwtFromUrl = searchParams.get("JWT");

  if (jwtFromUrl) {
    const cleanUrl = new URL(pathname, req.url);

    searchParams.forEach((value, key) => {
      if (key !== "JWT") cleanUrl.searchParams.set(key, value);
    });

    const res = NextResponse.redirect(cleanUrl);

    res.cookies.set("JWT", jwtFromUrl, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res;
  }

  const cookieJwt = req.cookies.get("JWT")?.value;

  const redirectToCore = () => {
    const returnUrl = encodeURIComponent(req.nextUrl.origin);

    return NextResponse.redirect(`${CORE_LOGIN_URL}/?redirectUrl=${returnUrl}`);
  };

  if (!cookieJwt) {
    return redirectToCore();
  }

  try {
    const decoded = jwtDecode<JWTPayload>(cookieJwt);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      console.log("Token vencido. Redirigiendo al Core para renovar.");
      const response = redirectToCore();
      response.cookies.delete("JWT");
      return response;
    }
  } catch (error) {
    console.error("Token inválido:", error);
    return redirectToCore();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

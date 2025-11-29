import { NextRequest, NextResponse } from "next/server";

const CORE_LOGIN_URL = "https://core-frontend-2025-02.netlify.app";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const jwtFromUrl = url.searchParams.get("JWT");

  // 1) Capturar JWT y guardarlo en cookie accesible por js
  if (jwtFromUrl) {
    const res = NextResponse.redirect(new URL(url.pathname, req.url));

    // SIEMPRE cuando viene ?JWT=...
    res.cookies.set("JWT", jwtFromUrl, {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    return res;
  }

  const cookieJwt = req.cookies.get("JWT")?.value;
  if (cookieJwt) return NextResponse.next();

  const redirectBack = encodeURIComponent(url.href);
  return NextResponse.redirect(
    `${CORE_LOGIN_URL}/?redirectUrl=${redirectBack}`
  );
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};

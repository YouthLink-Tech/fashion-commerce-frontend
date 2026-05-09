import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED_ROUTES = ["/user", "/reset-password", "/order-confirmed"];

const needsAuthCheck = (pathname) =>
  PROTECTED_ROUTES.some((route) => pathname.includes(route));

export async function middleware(req) {
  const pathname = req.nextUrl.pathname
  const fullUrl = req.url;

  // Pure URL corrections — no auth needed
  if (/\/product\/?$/i.test(fullUrl))
    return NextResponse.redirect(new URL("/shop", fullUrl));

  // Skip token lookup entirely for public routes
  if (!needsAuthCheck(pathname)) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Redirect to homepage, if the user is:
  //   1. not logged in and trying to access any of the user pages, or
  //   2. logged in and trying to access the reset password page

  // Unauthenticated user hitting /user/* → redirect home
  if (!token && (pathname.includes("/user") || pathname.includes("/order-confirmed")))
    return NextResponse.redirect(new URL("/", fullUrl));

  // Authenticated user hitting exact /user → redirect to /user/profile
  if (token && /\/user\/?$/i.test(pathname))
    return NextResponse.redirect(new URL("/user/profile", fullUrl));

  // Authenticated user hitting reset-password → redirect home
  if (token && pathname.includes("reset-password"))
    return NextResponse.redirect(new URL("/", fullUrl));

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const pathname = req.nextUrl.pathname
  const fullUrl = req.url;

  // If user enters wrong user/shop page URL, redirect to the correct one
  if (/\/user\/?$/i.test(fullUrl))
    return NextResponse.redirect(new URL("/user/profile", fullUrl));
  if (/\/product\/?$/i.test(fullUrl))
    return NextResponse.redirect(new URL("/shop", fullUrl));

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Redirect to homepage, if the user is:
  //   1. not logged in and trying to access any of the user pages, or
  //   2. logged in and trying to access the reset password page
  if (
    (!token && pathname.includes("user")) ||
    (token && pathname.includes("reset-password"))
  ) {
    return NextResponse.redirect(new URL("/", fullUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

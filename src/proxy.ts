// File: src/proxy.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const isPublicPath = path === "/" || path === "/register" || path === "/signin";
  
  // Get authentication token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // Redirect authenticated users away from public pages
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/home", request.url));
  }
  
  // Redirect unauthenticated users to signin
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }
  
  // Allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/register",
    "/signin",
    "/home",
    "/study-plan",
    "/resources",
    "/timer",
    "/analytics",
    "/settings",
    "/profile",
  ],
};
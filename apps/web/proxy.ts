import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  const protectedRoutes = ["/AddWorkKanban", "/Dash"];
  const isProtected = protectedRoutes.some((r) =>
    req.nextUrl.pathname.startsWith(r),
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

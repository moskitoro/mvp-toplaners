import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const session = await auth()
  const isLoggedIn = !!session?.user
  const isOnLogin = request.nextUrl.pathname === "/login"

  if (isOnLogin) {
    if (isLoggedIn) return NextResponse.redirect(new URL("/", request.url))
    return NextResponse.next()
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

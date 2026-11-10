import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl
  const role = (req.auth?.user as any)?.role

  // Super Admin routes
  if (pathname.startsWith("/admin")) {
    if (!req.auth || role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/auth/login?from=admin", req.url))
    }
  }

  // Seller routes
  if (pathname.startsWith("/seller")) {
    if (!req.auth || role !== "SELLER") {
      return NextResponse.redirect(new URL("/auth/login?from=seller", req.url))
    }
  }

  // User/Customer dashboard
  if (pathname.startsWith("/dashboard")) {
    if (!req.auth) {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*", "/seller/:path*", "/dashboard/:path*"],
}

import type { NextAuthConfig } from "next-auth"

// Konfigurasi aman-edge (tanpa Prisma/bcrypt) yang dipakai proxy.ts.
// Provider dan adapter ditambahkan di src/auth.ts.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        // @ts-ignore
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        // @ts-ignore
        session.user.role = token.role
      }
      return session
    },
  },
} satisfies NextAuthConfig

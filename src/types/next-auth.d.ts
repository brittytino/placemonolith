import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      batchId?: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: string
    batchId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    batchId?: string
  }
}

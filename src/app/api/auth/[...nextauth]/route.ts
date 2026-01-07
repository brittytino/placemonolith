import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/db/prisma"
import { comparePassword } from "@/lib/auth/password"

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                console.log("[NextAuth] Authorize called with email:", credentials?.email)

                if (!credentials?.email || !credentials?.password) {
                    console.log("[NextAuth] Missing credentials")
                    return null
                }

                const email = credentials.email.toLowerCase()

                // Hardcoded Super Admin
                if (email === "superadmin@psgtech.ac.in" && credentials.password === "Superadmin@psgmx") {
                    console.log("[NextAuth] Super admin login successful")
                    return {
                        id: "super-admin",
                        email: "superadmin@psgtech.ac.in",
                        name: "Super Admin",
                        role: "SUPER_ADMIN"
                    }
                }

                try {
                    // PlacementRep
                    const rep = await prisma.placementRep.findUnique({ where: { email } })
                    if (rep) {
                        const isValid = await comparePassword(credentials.password, rep.password)
                        if (isValid) {
                            console.log("[NextAuth] PlacementRep login successful:", rep.email)
                            return {
                                id: rep.id,
                                email: rep.email,
                                name: rep.name,
                                role: "PLACEMENT_REP"
                            }
                        }
                    }

                    // Student
                    const student = await prisma.student.findUnique({ where: { email } })
                    if (student) {
                        const isValid = await comparePassword(credentials.password, student.password)
                        if (isValid && student.isActive) {
                            console.log("[NextAuth] Student login successful:", student.email)
                            return {
                                id: student.id,
                                email: student.email,
                                name: student.name,
                                role: student.isClassRep ? "CLASS_REP" : "STUDENT",
                                batchId: student.batchId
                            }
                        }
                    }
                } catch (error) {
                    console.error("[NextAuth] Database error:", error)
                }

                console.log("[NextAuth] Login failed for:", email)
                return null
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            console.log("[NextAuth] JWT callback - user:", !!user, "token:", !!token)
            if (user) {
                token.id = user.id
                token.email = user.email
                token.name = user.name
                token.role = user.role
                token.batchId = user.batchId
                console.log("[NextAuth] JWT updated with user data")
            }
            return token
        },
        async session({ session, token }) {
            console.log("[NextAuth] Session callback - token:", !!token)
            if (token && session.user) {
                session.user.id = token.id as string
                session.user.email = token.email as string
                session.user.name = token.name as string
                session.user.role = token.role as string
                session.user.batchId = token.batchId as string | undefined
                console.log("[NextAuth] Session created for:", session.user.email)
            }
            return session
        }
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: true,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

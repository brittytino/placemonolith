import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const ADMIN_ROLES = ['SUPER_ADMIN', 'PLACEMENT_REP']
const VERIFICATION_ROLES = ['SUPER_ADMIN', 'PLACEMENT_REP', 'CLASS_REP']

// Obfuscated admin routes mapping
const SECURE_ROUTES = {
    '/portal/dashboard': true,
    '/portal/users': true,
    '/portal/organizations': true,
    '/portal/campaigns': true,
    '/portal/verify': true,
    '/portal/insights': true,
    '/portal/metrics': true,
}

const PUBLIC_ROUTES = ['/', '/login', '/setup']

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET
    })

    // Allow public routes
    if (PUBLIC_ROUTES.includes(pathname)) {
        // Redirect to dashboard if already logged in
        if (token) {
            const dashboardUrl = ADMIN_ROLES.includes(token.role as string)
                ? '/portal/dashboard'
                : '/student-dashboard'
            return NextResponse.redirect(new URL(dashboardUrl, req.url))
        }
        return NextResponse.next()
    }

    // Require authentication for all other routes
    if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    // Secure admin portal routes
    if (pathname.startsWith('/portal/')) {
        if (!ADMIN_ROLES.includes(token.role as string)) {
            // Log unauthorized access attempt
            console.warn(`[SECURITY] Unauthorized access attempt to ${pathname} by ${token.email}`)
            return NextResponse.redirect(new URL('/student-dashboard', req.url))
        }
    }

    // Verification route protection
    if (pathname.startsWith('/verification')) {
        if (!VERIFICATION_ROLES.includes(token.role as string)) {
            console.warn(`[SECURITY] Unauthorized verification access by ${token.email}`)
            return NextResponse.redirect(new URL('/', req.url))
        }
    }

    // Student routes protection
    if (pathname.startsWith('/student-')) {
        if (ADMIN_ROLES.includes(token.role as string)) {
            return NextResponse.redirect(new URL('/portal/dashboard', req.url))
        }
    }

    // API route protection
    if (pathname.startsWith('/api/admin/') || pathname.startsWith('/api/portal/')) {
        if (!ADMIN_ROLES.includes(token.role as string)) {
            console.warn(`[SECURITY] Unauthorized API access to ${pathname} by ${token.email}`)
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
    ],
}

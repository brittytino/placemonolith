'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
    const pathname = usePathname();
    const { data: session, status } = useSession();

    // Hide navbar on landing page (unless logged in) and auth pages
    if (!session && pathname === '/') {
        return null;
    }

    if (pathname === '/login' || pathname === '/setup') {
        return null;
    }

    // Don't render during loading to prevent flash
    if (status === 'loading') {
        return null;
    }

    return <Navbar />;
}

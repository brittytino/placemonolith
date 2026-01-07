'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export function AuthProvider({ children }: { children: ReactNode }) {
    return (
        <SessionProvider
            refetchInterval={0}
            refetchOnWindowFocus={false}
        >
            {children}
        </SessionProvider>
    );
}

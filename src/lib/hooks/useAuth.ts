'use client';

import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  const isLoading = status === 'loading';
  const isAuthenticated = !!session?.user;

  const user = session?.user ? {
    id: session.user.id,
    email: session.user.email!,
    name: session.user.name!,
    role: session.user.role,
    batchId: session.user.batchId,
  } : null;

  return {
    user,
    isLoading,
    isAuthenticated,
    session,
  };
}

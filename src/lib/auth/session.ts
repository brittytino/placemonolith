import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error('Unauthorized');
  }
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    batchId: session.user.batchId
  };
}

export async function getSession() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    batchId: session.user.batchId
  };
}

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, data: null }, { status: 401 });
        }

        return NextResponse.json({ success: true, data: session });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Session check failed' }, { status: 500 });
    }
}

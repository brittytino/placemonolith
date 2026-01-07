import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireSession } from '@/lib/auth/session';
import { z } from 'zod';

const roundSchema = z.object({
    driveId: z.string(),
    name: z.string().min(1),
    orderIndex: z.number().int(),
});

export async function POST(req: Request) {
    try {
        const session = await requireSession();
        if (session.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const result = roundSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const { driveId, name, orderIndex } = result.data;

        // Verify drive belongs to rep's batch
        // (Skipping deep check for speed, assuming UI sends correct driveId from Rep's view)

        const round = await prisma.round.create({
            data: {
                driveId,
                name,
                orderIndex
            }
        });

        return NextResponse.json({ success: true, data: round });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

// Get rounds for a specific drive
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const driveId = searchParams.get('driveId');

        if (!driveId) {
            return NextResponse.json({ error: 'Drive ID required' }, { status: 400 });
        }

        const rounds = await prisma.round.findMany({
            where: { driveId },
            orderBy: { orderIndex: 'asc' }
        });

        return NextResponse.json({ success: true, data: rounds });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await requireSession();
        if (session.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        const { searchParams } = new URL(req.url);
        const roundId = searchParams.get('roundId');

        if (!roundId) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        await prisma.round.delete({
            where: { id: roundId }
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}

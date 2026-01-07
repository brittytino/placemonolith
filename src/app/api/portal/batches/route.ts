import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const batchSchema = z.object({
    name: z.string().min(1),
    startYear: z.number().int(),
    endYear: z.number().int(),
    status: z.enum(['PLACEMENT_ACTIVE', 'PREPARATION_ACTIVE', 'ARCHIVED']),
    placementRepId: z.string(),
});

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'PLACEMENT_REP')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const batches = await prisma.batch.findMany({
            include: {
                placementRep: {
                    select: { name: true, email: true }
                },
                _count: {
                    select: { students: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, data: batches });
    } catch (error) {
        console.error('[API] Batches GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch batches' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const result = batchSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const batch = await prisma.batch.create({
            data: result.data,
            include: {
                placementRep: {
                    select: { name: true, email: true }
                }
            }
        });

        return NextResponse.json({ success: true, data: batch });
    } catch (error) {
        console.error('[API] Batches POST error:', error);
        return NextResponse.json(
            { error: 'Failed to create batch' },
            { status: 500 }
        );
    }
}

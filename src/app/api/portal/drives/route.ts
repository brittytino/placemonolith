import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireSession } from '@/lib/auth/session';
import { z } from 'zod';

const driveSchema = z.object({
    role: z.string().min(2),
    companyId: z.string().min(1),
    package: z.string(),
    description: z.string().optional(),
    date: z.string(), // ISO String
});

export async function POST(req: Request) {
    try {
        const session = await requireSession();
        if (session.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const result = driveSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        // Get Rep's active batch
        const batch = await prisma.batch.findFirst({
            where: { placementRepId: session.id }
        });

        if (!batch) {
            return NextResponse.json({ error: 'No active batch found' }, { status: 400 });
        }

        const { role, companyId, package: pkg, date, description } = result.data;

        const drive = await prisma.drive.create({
            data: {
                role,
                companyId,
                batchId: batch.id,
                package: pkg,
                driveDate: new Date(date),
                eligibilityCriteria: description
            }
        });

        return NextResponse.json({ success: true, data: drive });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await requireSession();
        // Rep sees drives for THEIR batch
        // Student sees drives for THEIR batch

        let batchId: string | undefined;

        if (session.role === 'SUPER_ADMIN') {
            const batch = await prisma.batch.findFirst({
                where: { placementRepId: session.id }
            });
            batchId = batch?.id;
        } else {
            batchId = session.batchId;
        }

        if (!batchId) {
            return NextResponse.json({ success: true, data: [] });
        }

        const drives = await prisma.drive.findMany({
            where: { batchId },
            include: {
                company: true
            },
            orderBy: { driveDate: 'desc' }
        });

        return NextResponse.json({ success: true, data: drives });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

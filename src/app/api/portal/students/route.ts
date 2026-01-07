import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireSession } from '@/lib/auth/session';

export async function GET(req: Request) {
    try {
        const session = await requireSession();
        if (session.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Rep can only see students in their Managed Batch? 
        // Or all students?
        // "One placement representative per batch" -> "Cannot access other batch write operations"

        // Let's find the batch managed by this rep
        const batch = await prisma.batch.findFirst({
            where: { placementRepId: session.id }
        });

        // If Admin has no batch, they see nothing? Or maybe they see all if they are 'Super'?
        // "Placement Rep (Super Admin – batch scoped)"

        // If the rep handles a batch, filter by that batch.
        const whereClause = batch ? { batchId: batch.id } : {};

        const students = await prisma.student.findMany({
            where: whereClause,
            orderBy: { rollNo: 'asc' },
            select: {
                id: true,
                name: true,
                rollNo: true,
                email: true,
                cgpa: true,
                isActive: true,
                batch: { select: { name: true } }
            }
        });

        return NextResponse.json({ success: true, data: students });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

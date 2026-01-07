import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireSession } from '@/lib/auth/session';

export async function GET(req: Request) {
    try {
        const session = await requireSession();
        if (session.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // 1. Total Students in current batch
        // Assuming admin manages ONE batch for now or we take the latest.
        // Let's find the batch the admin is Rep for.
        const batch = await prisma.batch.findFirst({ where: { placementRepId: session.id } });
        if (!batch) return NextResponse.json({ error: 'No batch' }, { status: 400 });

        const totalStudents = await prisma.student.count({ where: { batchId: batch.id } });

        // 2. Placed Count (Unique students who have at least ONE 'OFFERED' status in a drive)
        // Wait, we defined status 'OFFERED' in logic?
        // In drive participation, we update status.
        // Let's assume 'OFFERED' or we check if they passed ALL rounds of a drive?
        // Simplified: Check if they have participation with status 'OFFERED'.
        const placedStudents = await prisma.studentDriveParticipation.findMany({
            where: {
                drive: { batchId: batch.id },
                currentStatus: 'OFFERED'
            },
            select: { studentId: true },
            distinct: ['studentId']
        });
        const placedCount = placedStudents.length;

        // 3. Company-wise Offers
        const companyStats = await prisma.drive.findMany({
            where: { batchId: batch.id },
            select: {
                company: { select: { name: true } },
                role: true,
                package: true,
                _count: {
                    select: {
                        participations: { where: { currentStatus: 'OFFERED' } }
                    }
                }
            }
        });

        // Formatting for chart
        const chartData = companyStats.map(d => ({
            name: d.company.name,
            offers: d._count.participations,
            package: d.package
        })).filter(d => d.offers > 0);

        return NextResponse.json({
            success: true,
            data: {
                totalStudents,
                placedCount,
                unplacedCount: totalStudents - placedCount,
                placementPercentage: totalStudents > 0 ? ((placedCount / totalStudents) * 100).toFixed(1) : 0,
                companyStats: chartData
            }
        });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

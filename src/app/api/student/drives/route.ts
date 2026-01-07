import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireSession } from '@/lib/auth/session';

export async function GET(req: Request) {
    try {
        const session = await requireSession();
        if (session.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        if (!session.batchId) {
            return NextResponse.json({ error: 'No batch assigned' }, { status: 400 });
        }

        // Fetch drives for this batch
        // Also fetch the student's participation status for each drive
        const drives = await prisma.drive.findMany({
            where: {
                batchId: session.batchId
            },
            include: {
                company: {
                    select: { name: true, domain: true }
                },
                _count: {
                    select: { rounds: true }
                }
                // We can't easily include "StudentDriveParticipation" for *just this student* 
                // in a single simple relation query without 'where' on the include, which Prisma supports but
                // let's do it cleanly:
            },
            orderBy: { driveDate: 'desc' }
        });

        // Now fetch participation for this student
        const participations = await prisma.studentDriveParticipation.findMany({
            where: {
                studentId: session.id,
                driveId: { in: drives.map(d => d.id) }
            }
        });

        // Merge data
        const result = drives.map(drive => {
            const p = participations.find(p => p.driveId === drive.id);
            return {
                ...drive,
                status: p?.currentStatus || 'OPEN' // Default to OPEN if no participation record yet? 
                // actually if no record, they haven't "started" or it's just "Upcoming".
                // Let's call it "ELIGIBLE" or "NOT_STARTED".
            };
        });

        return NextResponse.json({ success: true, data: result });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

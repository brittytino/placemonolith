import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireSession } from '@/lib/auth/session';
import { pusherServer } from '@/lib/pusher';

const VERIFICATION_ROLES = ['SUPER_ADMIN', 'PLACEMENT_REP', 'CLASS_REP'];

export async function GET() {
    try {
        const session = await requireSession();

        // Check if user has verification permissions
        let canVerify = VERIFICATION_ROLES.includes(session.role);

        if (session.role === 'STUDENT' || session.role === 'CLASS_REP') {
            const student = await prisma.student.findUnique({
                where: { id: session.id },
                select: { isClassRep: true, batchId: true }
            });

            if (!student?.isClassRep) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
            }
        }

        // Get batch ID
        let batchId = session.batchId;
        if (session.role === 'SUPER_ADMIN' || session.role === 'PLACEMENT_REP') {
            const batch = await prisma.batch.findFirst({
                where: { placementRepId: session.id }
            });
            batchId = batch?.id;
        }

        if (!batchId) {
            return NextResponse.json({ error: 'No batch found' }, { status: 400 });
        }

        // Fetch unverified outcomes
        const outcomes = await prisma.roundOutcome.findMany({
            where: {
                verifiedBy: null,
                student: { batchId }
            },
            include: {
                student: {
                    select: { name: true, rollNo: true, email: true }
                },
                round: {
                    select: {
                        name: true,
                        drive: {
                            select: {
                                company: { select: { name: true } },
                                role: true
                            }
                        }
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        return NextResponse.json({ success: true, data: outcomes });
    } catch (error) {
        console.error('[API] Verification GET error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await requireSession();

        // Check verification permissions
        if (session.role === 'STUDENT' || session.role === 'CLASS_REP') {
            const student = await prisma.student.findUnique({
                where: { id: session.id },
                select: { isClassRep: true }
            });

            if (!student?.isClassRep) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
            }
        } else if (!VERIFICATION_ROLES.includes(session.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { outcomeId, action } = body;

        if (!outcomeId) {
            return NextResponse.json({ error: 'Missing outcome ID' }, { status: 400 });
        }

        if (action === 'VERIFY') {
            const updated = await prisma.roundOutcome.update({
                where: { id: outcomeId },
                data: { verifiedBy: session.id },
                select: { studentId: true }
            });

            // Trigger real-time notification
            if (updated) {
                await pusherServer.trigger(
                    `student-${updated.studentId}`,
                    'outcome-verified',
                    { message: 'Your round outcome has been verified!' }
                );
            }

            return NextResponse.json({ success: true, message: 'Outcome verified' });
        }

        if (action === 'REJECT') {
            await prisma.roundOutcome.delete({
                where: { id: outcomeId }
            });

            return NextResponse.json({ success: true, message: 'Outcome rejected' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('[API] Verification POST error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

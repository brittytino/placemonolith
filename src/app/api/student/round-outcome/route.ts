import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireSession } from '@/lib/auth/session';
import { z } from 'zod';

const outcomeSchema = z.object({
    driveId: z.string(),
    roundId: z.string(),
    result: z.enum(['PASS', 'FAIL']),
    reflection: z.string().optional(),
    questions: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const session = await requireSession();
        if (session.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const result = outcomeSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const { driveId, roundId, result: outcomeResult, reflection, questions } = result.data;

        // Transaction to ensure atomic updates
        // 1. Create Round Outcome
        // 2. Update StudentDriveParticipation status (If Fail -> ELIMINATED, If Pass -> Check if last round?)

        // We need to know if this is the last round to mark OFFERED?
        // Or if we just mark outcomes and let Admin mark OFFERED? 
        // Spec says: "Placement Rep... locks final outcomes"
        // But also "Student enters round round outcome data"

        // Let's stick to:
        // If FAIL -> Set Participation Status to ELIMINATED
        // If PASS -> Keep IN_PROGRESS (unless it was last round, maybe?)
        // Actually, usually Rep confirms final offer. So let's just keep IN_PROGRESS on pass.

        await prisma.$transaction(async (tx) => {
            // 1. Upsert Participation (if not exists, create it as IN_PROGRESS)
            // Actually, if they are submitting an outcome, they are Participating.

            const participation = await tx.studentDriveParticipation.upsert({
                where: {
                    studentId_driveId: {
                        studentId: session.id,
                        driveId: driveId
                    }
                },
                create: {
                    studentId: session.id,
                    driveId: driveId,
                    currentStatus: 'IN_PROGRESS'
                },
                update: {} // No change if exists
            });

            // 2. Create Outcome
            await tx.roundOutcome.create({
                data: {
                    studentId: session.id,
                    roundId: roundId,
                    attended: true,
                    result: outcomeResult,
                    studentReflection: reflection,
                    questionsAsked: questions
                }
            });

            // 3. Update Status if Fail
            if (outcomeResult === 'FAIL') {
                await tx.studentDriveParticipation.update({
                    where: {
                        studentId_driveId: {
                            studentId: session.id,
                            driveId: driveId
                        }
                    },
                    data: {
                        currentStatus: 'ELIMINATED'
                    }
                });
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

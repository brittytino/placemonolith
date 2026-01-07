import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireSession } from '@/lib/auth/session';

export async function GET(
    req: Request,
    props: { params: Promise<{ driveId: string }> }
) {
    try {
        const session = await requireSession();

        if (!['STUDENT', 'CLASS_REP'].includes(session.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const params = await props.params;
        const { driveId } = params;

        const drive = await prisma.drive.findUnique({
            where: { id: driveId },
            include: {
                company: true,
                rounds: {
                    orderBy: { orderIndex: 'asc' }
                }
            }
        });

        if (!drive) {
            return NextResponse.json({ error: 'Drive not found' }, { status: 404 });
        }

        // Check batch access
        if (drive.batchId !== session.batchId) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Get student participation
        const participation = await prisma.studentDriveParticipation.findUnique({
            where: {
                studentId_driveId: {
                    studentId: session.id,
                    driveId: driveId
                }
            },
            include: {
                roundOutcomes: {
                    include: {
                        round: {
                            select: { name: true, orderIndex: true }
                        }
                    },
                    orderBy: { created_at: 'desc' }
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                ...drive,
                participation
            }
        });
    } catch (error) {
        console.error('[API] Student drive error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

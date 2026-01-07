import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireSession } from '@/lib/auth/session';

export async function GET(req: Request) {
    try {
        const session = await requireSession();
        const { searchParams } = new URL(req.url);
        const companyId = searchParams.get('companyId');
        const roleMatch = searchParams.get('role');

        // Build query filters
        const where: any = {
            verifiedBy: { not: null },
            studentReflection: { not: null }
        };

        if (companyId) {
            where.round = {
                drive: { companyId }
            };
        }

        if (roleMatch) {
            where.round = {
                ...where.round,
                drive: {
                    ...where.round?.drive,
                    role: { contains: roleMatch, mode: 'insensitive' }
                }
            };
        }

        const insights = await prisma.roundOutcome.findMany({
            where,
            include: {
                student: {
                    select: {
                        batch: { select: { name: true } }
                    }
                },
                round: {
                    select: {
                        name: true,
                        drive: {
                            select: {
                                role: true,
                                company: { select: { name: true } },
                                package: true
                            }
                        }
                    }
                }
            },
            orderBy: { created_at: 'desc' },
            take: 100
        });

        return NextResponse.json({ success: true, data: insights });
    } catch (error) {
        console.error('[API] Insights error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

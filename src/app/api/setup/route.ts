import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth/password';
import { setupSchema } from '@/lib/validation/setup';

export async function POST(req: Request) {
    try {
        // 1. Check if ANY placement rep exists. If so, setup is locked.
        const repCount = await prisma.placementRep.count();
        if (repCount > 0) {
            return NextResponse.json(
                { error: 'Setup has already been completed. Please login.' },
                { status: 403 }
            );
        }

        // 2. Validate Body
        const body = await req.json();
        const result = setupSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { name, email, password, batchName, startYear, endYear } = result.data;

        // 3. Create Rep + Batch Transactionally
        const hashedPassword = await hashPassword(password);

        await prisma.$transaction(async (tx) => {
            // Create Rep
            const rep = await tx.placementRep.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                }
            });

            // Create Batch linked to Rep
            await tx.batch.create({
                data: {
                    name: batchName,
                    startYear,
                    endYear,
                    status: 'PLACEMENT_ACTIVE', // First batch is active by default
                    placementRepId: rep.id
                }
            });
        });

        return NextResponse.json({ success: true, message: 'System setup complete' });

    } catch (error) {
        console.error('Setup failed:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

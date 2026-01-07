import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireSession } from '@/lib/auth/session';
import { z } from 'zod';

const companySchema = z.object({
    name: z.string().min(2),
    domain: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
    notes: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const session = await requireSession();
        if (session.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const result = companySchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const company = await prisma.company.create({
            data: result.data
        });

        return NextResponse.json({ success: true, data: company });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const companies = await prisma.company.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json({ success: true, data: companies });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

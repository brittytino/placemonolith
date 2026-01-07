import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireSession } from '@/lib/auth/session';
import { hashPassword } from '@/lib/auth/password';
import { z } from 'zod';

const profileUpdateSchema = z.object({
    resumeUrl: z.string().url().optional().or(z.literal('')),
    password: z.string().min(6).optional().or(z.literal('')),
    name: z.string().optional()
});

export async function PUT(req: Request) {
    try {
        const session = await requireSession();
        if (session.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const result = profileUpdateSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const { resumeUrl, password, name } = result.data;

        const updateData: any = {};
        if (resumeUrl !== undefined) updateData.resumeUrl = resumeUrl;
        if (name) updateData.name = name;
        if (password) {
            updateData.password = await hashPassword(password);
        }

        const student = await prisma.student.update({
            where: { id: session.id },
            data: updateData
        });

        return NextResponse.json({ success: true, data: student });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await requireSession();
        if (session.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const student = await prisma.student.findUnique({
            where: { id: session.id },
            select: {
                id: true,
                name: true,
                rollNo: true,
                email: true,
                cgpa: true,
                resumeUrl: true,
                batch: { select: { name: true } }
            }
        });

        return NextResponse.json({ success: true, data: student });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

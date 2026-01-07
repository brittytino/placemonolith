import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireSession } from '@/lib/auth/session';
import { hashPassword } from '@/lib/auth/password';
import * as XLSX from 'xlsx';

// Helper to generate default password (e.g. rollno@123)
function generateDefaultPassword(rollNo: string) {
    return `${rollNo}@123`; // Simple default
}

export async function POST(req: Request) {
    try {
        const session = await requireSession();
        if (session.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Expected columns: Name, RollNo, Email, Gender, CGPA
        // We need to associate them with the Rep's batch
        const batch = await prisma.batch.findFirst({
            where: { placementRepId: session.id }
        });

        if (!batch) {
            return NextResponse.json({ error: 'No active batch found for this admin' }, { status: 400 });
        }

        let successCount = 0;
        let failCount = 0;
        const errors: string[] = [];

        // Process each row
        for (const row of jsonData as any[]) {
            try {
                const name = row['Name'];
                const rollNo = String(row['RollNo'] || row['Register Number'] || '');
                const email = row['Email'];
                const cgpa = parseFloat(row['CGPA'] || '0');

                if (!name || !rollNo || !email) {
                    failCount++;
                    errors.push(`Missing data for row: ${JSON.stringify(row)}`);
                    continue;
                }

                const password = await hashPassword(generateDefaultPassword(rollNo));

                // Upsert student
                await prisma.student.upsert({
                    where: { rollNo }, // Unique constraint
                    update: {
                        name,
                        email,
                        cgpa: isNaN(cgpa) ? null : cgpa,
                    },
                    create: {
                        name,
                        rollNo,
                        email,
                        password,
                        batchId: batch.id,
                        cgpa: isNaN(cgpa) ? null : cgpa,
                    }
                });
                successCount++;
            } catch (e: any) {
                failCount++;
                errors.push(`Failed to import ${row['RollNo']}: ${e.message}`);
            }
        }

        return NextResponse.json({
            success: true,
            count: successCount,
            errors: failCount > 0 ? errors : undefined
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Import failed' }, { status: 500 });
    }
}

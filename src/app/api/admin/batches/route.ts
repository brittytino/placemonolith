import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const batches = await prisma.batch.findMany({
      where: { isActive: true },
      orderBy: [{ startYear: 'desc' }, { endYear: 'desc' }],
    });

    const formattedBatches = batches.map((batch) => ({
      id: batch.id,
      name: `Batch ${batch.startYear}-${batch.endYear}`,
      year: `${batch.startYear}-${batch.endYear}`,
      startYear: batch.startYear,
      endYear: batch.endYear,
      isActive: batch.isActive,
    }));

    return NextResponse.json({
      success: true,
      data: formattedBatches,
    });
  } catch (error: any) {
    console.error('Error fetching batches:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch batches' },
      { status: 500 }
    );
  }
}

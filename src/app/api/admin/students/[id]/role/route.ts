import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const updateRoleSchema = z.object({
  role: z.enum(['STUDENT', 'CLASS_REP']),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const validatedData = updateRoleSchema.parse(body);
    const userId = params.id;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: validatedData.role },
      include: { studentProfile: true },
    });

    return NextResponse.json({
      success: true,
      message: `Student role updated to ${validatedData.role}`,
      data: {
        id: updatedUser.id,
        registerNumber: updatedUser.registerNumber,
        email: updatedUser.email,
        fullName: updatedUser.studentProfile?.fullName,
        role: updatedUser.role,
      },
    });
  } catch (error: any) {
    console.error('Error updating student role:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update student role' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const prisma = new PrismaClient();

const createStudentSchema = z.object({
  registerNumber: z.string().min(1, 'Register number is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(1, 'Full name is required'),
  phoneNumber: z.string().optional(),
  batchId: z.string().min(1, 'Batch ID is required'),
  groupId: z.string().optional(),
  role: z.enum(['STUDENT', 'CLASS_REP']).default('STUDENT'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = createStudentSchema.parse(body);

    // Check if student already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { registerNumber: validatedData.registerNumber },
          { email: validatedData.email },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Student with this register number or email already exists' },
        { status: 400 }
      );
    }

    // Fetch batch details
    const batch = await prisma.batch.findUnique({
      where: { id: validatedData.batchId },
    });

    if (!batch) {
      return NextResponse.json(
        { success: false, message: 'Invalid batch ID' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user and student profile
    const user = await prisma.user.create({
      data: {
        registerNumber: validatedData.registerNumber,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
        batchStartYear: batch.startYear,
        batchEndYear: batch.endYear,
        classSection: 'G1',
        academicYear: 1,
        studentProfile: {
          create: {
            fullName: validatedData.fullName,
            contactNumber: validatedData.phoneNumber || '',
            personalEmail: validatedData.email,
            dateOfBirth: new Date('2000-01-01'),
            gender: 'OTHER',
            ugDegree: '',
            ugCollege: '',
            ugPercentage: 0,
            schoolName: '',
            tenthPercentage: 0,
            isProfileComplete: false,
          },
        },
      },
      include: {
        studentProfile: true,
      },
    });

    // Assign to group if provided
    if (validatedData.groupId) {
      await prisma.groupMember.create({
        data: {
          userId: user.id,
          groupId: validatedData.groupId,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: `Student created successfully ${validatedData.role === 'CLASS_REP' ? 'with CLASS_REP role' : ''}`,
        data: {
          id: user.id,
          registerNumber: user.registerNumber,
          email: user.email,
          fullName: user.studentProfile?.fullName,
          role: user.role,
          batch: `${batch.startYear}-${batch.endYear}`,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating student:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create student' },
      { status: 500 }
    );
  }
}

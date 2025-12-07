import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      registerNumber, 
      email, 
      password,
      fullName,
      phoneNumber,
      personalEmail,
      dateOfBirth,
      gender,
      batchStartYear,
      batchEndYear,
      classSection,
      academicYear,
      ugDegree,
      ugCollege,
      ugPercentage,
      schoolName,
      tenthPercentage,
      twelfthPercentage,
      whatsappNumber
    } = body;

    // Check if any super admin already exists
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    if (existingSuperAdmin) {
      return NextResponse.json(
        { error: 'Super Admin already exists. This route is only for initial setup.' },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!registerNumber || !email || !password || !fullName || !batchStartYear || !batchEndYear || !classSection || !academicYear) {
      return NextResponse.json(
        { error: 'Missing required fields: registerNumber, email, password, fullName, batchStartYear, batchEndYear, classSection, academicYear' },
        { status: 400 }
      );
    }

    // Check if user with this register number already exists
    const existingUser = await prisma.user.findUnique({
      where: { registerNumber }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this register number already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create batch
    const batch = await prisma.batch.upsert({
      where: {
        startYear_endYear: {
          startYear: parseInt(batchStartYear),
          endYear: parseInt(batchEndYear)
        }
      },
      create: {
        startYear: parseInt(batchStartYear),
        endYear: parseInt(batchEndYear),
        isActive: true,
      },
      update: {
        isActive: true,
      }
    });

    // Create super admin user with profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          registerNumber,
          email,
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          batchStartYear: parseInt(batchStartYear),
          batchEndYear: parseInt(batchEndYear),
          classSection,
          academicYear: parseInt(academicYear),
        }
      });

      await tx.studentProfile.create({
        data: {
          userId: newUser.id,
          fullName,
          dateOfBirth: new Date(dateOfBirth || new Date()),
          gender: gender || 'MALE',
          contactNumber: phoneNumber || '',
          whatsappNumber: whatsappNumber || phoneNumber || '',
          personalEmail: personalEmail || email,
          ugDegree: ugDegree || 'Not Specified',
          ugCollege: ugCollege || 'Not Specified',
          ugPercentage: parseFloat(ugPercentage) || 0,
          schoolName: schoolName || 'Not Specified',
          tenthPercentage: parseFloat(tenthPercentage) || 0,
          twelfthPercentage: twelfthPercentage ? parseFloat(twelfthPercentage) : null,
          technicalSkills: [],
          certifications: [],
          areasOfInterest: [],
          isProfileComplete: false,
          profileCompletionScore: 30,
        }
      });

      return newUser;
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'SUPER_ADMIN_CREATED',
        entityType: 'User',
        entityId: user.id,
        details: {
          registerNumber,
          email,
          batchId: batch.id,
          batchRange: `${batchStartYear}-${batchEndYear}`
        },
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Super Admin (Placement Representative) created successfully',
      data: {
        id: user.id,
        registerNumber: user.registerNumber,
        email: user.email,
        role: user.role,
        batchId: batch.id,
        batchRange: `${batch.startYear}-${batch.endYear}`,
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Super Admin creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create Super Admin', details: error.message },
      { status: 500 }
    );
  }
}

// GET method to check if setup is needed
export async function GET() {
  try {
    const superAdminExists = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    return NextResponse.json({
      setupRequired: !superAdminExists,
      message: superAdminExists 
        ? 'Super Admin already exists. Setup is complete.' 
        : 'No Super Admin found. Setup is required.'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to check setup status', details: error.message },
      { status: 500 }
    );
  }
}

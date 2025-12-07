import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { authenticate } from '@/lib/middleware/rbac';

export async function POST(req: NextRequest) {
  try {
    // Authenticate and check if user is SUPER_ADMIN
    const authResult = await authenticate(req);
    
    if (!authResult.success) {
      return authResult.response;
    }
    
    const authContext = authResult.user;
    
    if (authContext.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Only Super Admin can create groups.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, groupNumber, studentIds } = body;

    // Validate required fields
    if (!name || !groupNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: name, groupNumber' },
        { status: 400 }
      );
    }

    // Check if group number already exists
    const existingGroup = await prisma.group.findUnique({
      where: { groupNumber: parseInt(groupNumber) }
    });

    if (existingGroup) {
      return NextResponse.json(
        { error: `Group number ${groupNumber} already exists` },
        { status: 400 }
      );
    }

    // Create group with members in transaction
    const group = await prisma.$transaction(async (tx) => {
      const newGroup = await tx.group.create({
        data: {
          name,
          groupNumber: parseInt(groupNumber),
          batchStartYear: authContext.batchStartYear,
          batchEndYear: authContext.batchEndYear,
          classSection: authContext.classSection,
          academicYear: authContext.academicYear,
          isActive: true,
        }
      });

      // Add members if provided
      if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
        const members = studentIds.map((userId: string) => ({
          groupId: newGroup.id,
          userId,
          role: 'MEMBER' as const,
        }));

        await tx.groupMember.createMany({
          data: members,
          skipDuplicates: true,
        });
      }

      return newGroup;
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: authContext.userId,
        action: 'GROUP_CREATED',
        entityType: 'Group',
        entityId: group.id,
        details: {
          groupName: name,
          groupNumber,
          memberCount: studentIds?.length || 0
        },
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Group created successfully',
      data: group
    }, { status: 201 });

  } catch (error: any) {
    console.error('Group creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create group', details: error.message },
      { status: 500 }
    );
  }
}

// GET all groups
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticate(req);
    
    if (!authResult.success) {
      return authResult.response;
    }

    const groups = await prisma.group.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { members: true, messages: true }
        }
      },
      orderBy: { groupNumber: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: groups
    });

  } catch (error: any) {
    console.error('Fetch groups error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups', details: error.message },
      { status: 500 }
    );
  }
}

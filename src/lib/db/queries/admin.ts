import prisma from '../prisma';
import { hashPassword } from '../../auth/password';

export async function createUser(data: any) {
  const hashedPassword = await hashPassword(data.password);
  
  return prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  });
}

export async function bulkCreateUsers(users: any[]) {
  const results = {
    successful: [] as any[],
    failed: [] as any[],
    count: 0
  };

  for (const userData of users) {
    try {
      const hashedPassword = await hashPassword(userData.password || `${userData.registerNumber}@psg`);
      
      // Create user with profile in transaction
      const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            registerNumber: userData.registerNumber,
            email: userData.email,
            password: hashedPassword,
            role: userData.role || 'STUDENT',
            batchStartYear: parseInt(userData.batchStartYear),
            batchEndYear: parseInt(userData.batchEndYear),
            classSection: userData.classSection || 'G1',
            academicYear: parseInt(userData.academicYear) || 1,
          }
        });

        await tx.studentProfile.create({
          data: {
            userId: newUser.id,
            fullName: userData.fullName,
            dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : new Date(),
            gender: userData.gender || 'MALE',
            contactNumber: userData.contactNumber || '',
            whatsappNumber: userData.whatsappNumber || userData.contactNumber || '',
            personalEmail: userData.personalEmail || userData.email,
            ugDegree: userData.ugDegree || 'Not Specified',
            ugCollege: userData.ugCollege || 'Not Specified',
            ugPercentage: parseFloat(userData.ugPercentage) || 0,
            schoolName: userData.schoolName || 'Not Specified',
            tenthPercentage: parseFloat(userData.tenthPercentage) || 0,
            twelfthPercentage: userData.twelfthPercentage ? parseFloat(userData.twelfthPercentage) : null,
            technicalSkills: [],
            certifications: [],
            areasOfInterest: [],
            isProfileComplete: false,
            profileCompletionScore: 20,
          }
        });

        return newUser;
      });

      results.successful.push({
        registerNumber: user.registerNumber,
        email: user.email,
      });
      results.count++;
    } catch (error: any) {
      results.failed.push({
        registerNumber: userData.registerNumber,
        error: error.message
      });
    }
  }

  return results;
}

export async function deleteUsersByBatch(batchStartYear: number, batchEndYear: number) {
  // Delete all related data first (cascade should handle this, but being explicit)
  await prisma.user.deleteMany({
    where: {
      batchStartYear,
      batchEndYear,
    },
  });
}

export async function getAllCustomFields() {
  return prisma.customField.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  });
}

export async function createCustomField(data: any) {
  return prisma.customField.create({
    data,
  });
}

export async function updateCustomField(fieldId: string, data: any) {
  return prisma.customField.update({
    where: { id: fieldId },
    data,
  });
}

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log('🌱 Seeding database...');

  // Create Placement Rep first
  const hashedPassword = await hashPassword('Superadmin@psgmx');
  const rep = await prisma.placementRep.create({
    data: {
      email: 'superadmin@psgtech.ac.in',
      password: hashedPassword,
      name: 'Super Admin'
    }
  });

  console.log('✅ Created super admin');

  // Create Batch
  const batch = await prisma.batch.create({
    data: {
      name: 'MCA 2024-2026',
      startYear: 2024,
      endYear: 2026,
      status: 'PLACEMENT_ACTIVE',
      placementRepId: rep.id
    }
  });

  console.log('✅ Created batch');

  // Create sample student
  const studentPass = await hashPassword('Student@123');
  await prisma.student.create({
    data: {
      email: 'student1@psgtech.ac.in',
      password: studentPass,
      name: 'Test Student',
      rollNo: '24MCA001',
      isClassRep: true,
      isActive: true,
      batchId: batch.id
    }
  });

  console.log('✅ Created student');
  console.log('');
  console.log('🎉 Seeding completed!');
  console.log('📝 Login: superadmin@psgtech.ac.in / Superadmin@psgmx');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';

async function main() {
  // Clear existing data safely before seeding
  await prisma.message.deleteMany();
  await prisma.favorite.deleteMany();

  const hashed = await bcrypt.hash('1234', 10);

  // 1. Seed บัญชีผู้ใช้ที่ 1 (Admin / Alice)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@tsu.ac.th' },
    update: { password: hashed },
    create: { email: 'admin@tsu.ac.th', password: hashed },
  });

  // 2. Seed บัญชีผู้ใช้ที่ 2 (Bob)
  const bobUser = await prisma.user.upsert({
    where: { email: 'bob@tsu.ac.th' },
    update: { password: hashed },
    create: { email: 'bob@tsu.ac.th', password: hashed },
  });

  // 3. Seed Messages (ผูก authorId กับเจ้าของบัญชีแต่ละคน)
  await prisma.message.createMany({
    data: [
      { name: 'Alice', email: 'a@tsu.ac.th', message: 'สวัสดี ฉันคือ Alice', authorId: adminUser.id },
      { name: 'Bob', email: 'b@tsu.ac.th', message: 'Hello ทุกคน ฉันคือ Bob', authorId: bobUser.id },
    ],
  });

  // 4. Seed Favorites
  await prisma.favorite.createMany({
    data: [
      {
        title: 'Next.js Documentation',
        url: 'https://nextjs.org/docs',
        category: 'Documentation',
      },
      {
        title: 'TypeScript Handbook',
        url: 'https://www.typescriptlang.org/docs/',
        category: 'Tutorial',
      },
    ],
  });

  console.log('Seed data created successfully with 2 test users (admin@tsu.ac.th & bob@tsu.ac.th)!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

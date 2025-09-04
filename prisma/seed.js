const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...')

  // Users
  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      name: 'Alice',
      passwordHash: '$2a$10$4J0Xy4t67Y8k7QdJpTt8GuqV5G7Zb4C8qkzQeZC2wS3N9F5K2bq9S', // "password" (bcrypt placeholder)
    },
  })

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      name: 'Bob',
      passwordHash: '$2a$10$4J0Xy4t67Y8k7QdJpTt8GuqV5G7Zb4C8qkzQeZC2wS3N9F5K2bq9S', // "password"
    },
  })

  // Group
  const group = await prisma.group.upsert({
    where: { id: 'seed-group-1' },
    update: {},
    create: {
      id: 'seed-group-1',
      name: 'Trip to Goa',
    },
  })

  // Members
  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId: group.id, userId: alice.id } },
    update: {},
    create: { groupId: group.id, userId: alice.id, role: 'OWNER' },
  })
  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId: group.id, userId: bob.id } },
    update: {},
    create: { groupId: group.id, userId: bob.id, role: 'MEMBER' },
  })

  // Expenses
  await prisma.expenseEvent.createMany({
    data: [
      {
        groupId: group.id,
        userId: alice.id,
        amount: 1250.00,
        merchant: 'Hotel SunShine',
        description: '2 nights stay',
        visibilityScope: 'GROUP',
      },
      {
        groupId: group.id,
        userId: bob.id,
        amount: 450.50,
        merchant: 'Cafe Lagoon',
        description: 'Dinner',
        visibilityScope: 'GROUP',
      },
      {
        groupId: group.id,
        userId: alice.id,
        amount: 199.99,
        merchant: 'Scooter Rental',
        description: 'Day rental',
        visibilityScope: 'GROUP',
      },
    ],
    skipDuplicates: true,
  })

  console.log('Seeding completed.')
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

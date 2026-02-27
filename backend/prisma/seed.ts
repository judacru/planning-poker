import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean up existing data
  await prisma.vote.deleteMany();
  await prisma.round.deleteMany();
  await prisma.gameParticipant.deleteMany();
  await prisma.game.deleteMany();
  await prisma.user.deleteMany();

  console.log("✓ Database cleaned");

  // Create sample users
  const user1 = await prisma.user.create({
    data: {
      email: "alice@example.com",
      nickname: "Alice",
      passwordHash: "$2a$10$...", // bcrypt hash
      firstName: "Alice",
      lastName: "Developer",
      verified: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "bob@example.com",
      nickname: "Bob",
      passwordHash: "$2a$10$...", // bcrypt hash
      firstName: "Bob",
      lastName: "Designer",
      verified: true,
    },
  });

  console.log("✓ Users created:", [user1.id, user2.id]);

  // Create a sample game
  const game = await prisma.game.create({
    data: {
      inviteCode: "POKER123",
      name: "Sprint 25",
      hostId: user1.id,
    },
  });

  console.log("✓ Game created:", game.id);

  // Add participants
  await prisma.gameParticipant.createMany({
    data: [
      { gameId: game.id, userId: user1.id },
      { gameId: game.id, userId: user2.id },
    ],
  });

  console.log("✓ Participants added");

  console.log("✓ Database seeded successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

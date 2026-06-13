import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.chatMessage.deleteMany();
  console.log("Chat history cleared.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

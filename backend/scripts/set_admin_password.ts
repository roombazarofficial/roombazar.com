import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/modules/auth/password";

const prisma = new PrismaClient();

async function main() {
  const password = "admin123";
  const passwordHash = await hashPassword(password);

  const officialAdmin = await prisma.user.upsert({
    where: { email: "roombazar.official@gmail.com" },
    update: {
      passwordHash,
      platformRole: "superadmin",
      trustLevel: "trusted",
      emailVerifiedAt: new Date(),
      name: "RoomBazar SuperAdmin",
    },
    create: {
      email: "roombazar.official@gmail.com",
      passwordHash,
      phone: "+919999999999",
      name: "RoomBazar SuperAdmin",
      platformRole: "superadmin",
      trustLevel: "trusted",
      emailVerifiedAt: new Date(),
      phoneVerifiedAt: new Date(),
    },
  });

  console.log(`Successfully set password for ${officialAdmin.email} to: ${password}`);
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

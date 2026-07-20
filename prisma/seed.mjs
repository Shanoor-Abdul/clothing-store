import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@store.com";
  const adminPassword = "admin123";

  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    await prisma.admin.create({
      data: {
        name: "Super Admin",
        email: adminEmail,
        password: await bcrypt.hash(adminPassword, 10),
        role: "SUPER_ADMIN",
      },
    });
    console.log("Admin created:", adminEmail, "/", adminPassword);
  } else {
    console.log("Admin already exists");
  }

  const userEmail = "user@store.com";
  const userPassword = "user123";

  const existingUser = await prisma.user.findFirst({
    where: { email: userEmail },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        name: "Demo User",
        email: userEmail,
        mobile: "+966500000000",
        password: await bcrypt.hash(userPassword, 10),
      },
    });
    console.log("User created:", userEmail, "/", userPassword);
  } else {
    console.log("User already exists");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

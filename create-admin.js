const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log("Usage: node create-admin.js <name> <email> <password> [SUPER_ADMIN|ADMIN]");
    console.log("Example: node create-admin.js \"John Doe\" john@example.com mysecurepassword SUPER_ADMIN");
    process.exit(1);
  }

  const name = args[0];
  const email = args[1];
  const plainPassword = args[2];
  const role = args[3] || "ADMIN";

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log(`❌ Admin with email ${email} already exists!`);
      process.exit(1);
    }

    // Hash the password (using cost factor 10 to match your auth logic)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // Create the admin
    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role,
        isActive: true
      },
    });

    console.log("✅ Admin successfully created!");
    console.log(`Name: ${admin.name}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);

  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

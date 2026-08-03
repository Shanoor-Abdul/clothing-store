const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRaw`
    SELECT relrowsecurity
    FROM pg_class
    WHERE relname = 'Order'
  `;
  console.log("RLS enabled on Order table:", result);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

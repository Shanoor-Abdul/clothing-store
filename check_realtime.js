const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRaw`SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime'`;
  console.log("Realtime tables:", result);
  
  const tables = await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`;
  console.log("Public tables:", tables);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

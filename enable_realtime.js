const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Set Replica Identity to FULL so we get OLD record details in UPDATE events
    await prisma.$executeRawUnsafe(`ALTER TABLE "Order" REPLICA IDENTITY FULL;`);
    console.log("Set REPLICA IDENTITY FULL on Order table");

    // Add Order table to supabase_realtime publication
    await prisma.$executeRawUnsafe(`ALTER PUBLICATION supabase_realtime ADD TABLE "Order";`);
    console.log("Added Order table to supabase_realtime publication");
  } catch (err) {
    if (err.message.includes("already in publication")) {
       console.log("Order table is already in supabase_realtime publication");
    } else {
       console.error("Error:", err.message);
    }
  }

  const result = await prisma.$queryRaw`SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime'`;
  console.log("Realtime tables now:", result);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

const getPrismaInstance = () => {
  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl && dbUrl.trim().length > 0) {
    let formattedUrl = dbUrl;
    if (!formattedUrl.includes("connection_limit")) {
      const separator = formattedUrl.includes("?") ? "&" : "?";
      formattedUrl = `${formattedUrl}${separator}connection_limit=20&pool_timeout=30`;
    }
    return new PrismaClient({
      datasources: {
        db: {
          url: formattedUrl,
        },
      },
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  }

  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
};

export const prisma = globalForPrisma.prisma ?? getPrismaInstance();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
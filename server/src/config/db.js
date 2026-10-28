import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Configuration de l'adaptateur natif PostgreSQL (architecture Prisma 7)
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

// Singleton PrismaClient
const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

export default prisma;

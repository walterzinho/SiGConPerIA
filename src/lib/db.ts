import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL || "file:db/custom.db";
  const dbAuthToken = process.env.DATABASE_AUTH_TOKEN;

  // If it's a Turso URL (libsql://), use the adapter for edge/serverless compatibility
  if (dbUrl.startsWith("libsql://")) {
    const adapter = new PrismaLibSql({
      url: dbUrl,
      authToken: dbAuthToken,
    });
    return new PrismaClient({ adapter });
  }

  // Fallback to local SQLite
  return new PrismaClient({ log: ["query"] });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
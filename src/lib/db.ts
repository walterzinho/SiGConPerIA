import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// SQL para crear las tablas en Turso (CREATE IF NOT EXISTS para ser idempotente)
const CREATE_CHARACTER_TABLE = `
CREATE TABLE IF NOT EXISTS "Character" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "imgUrl1" TEXT NOT NULL DEFAULT '',
  "imgUrl2" TEXT NOT NULL DEFAULT '',
  "imgUrl3" TEXT NOT NULL DEFAULT '',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
`;

const CREATE_CAMPAIGN_TABLE = `
CREATE TABLE IF NOT EXISTS "Campaign" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "characterId" TEXT NOT NULL,
  "characterName" TEXT NOT NULL,
  "characterDesc" TEXT NOT NULL,
  "enfoque" TEXT NOT NULL DEFAULT 'consejo',
  "photoStyle" TEXT NOT NULL DEFAULT 'cinematic',
  "copyLength" TEXT NOT NULL DEFAULT 'medio',
  "facebookFooter" TEXT NOT NULL DEFAULT '',
  "facebookHashtags" TEXT NOT NULL DEFAULT '',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
`;

const CREATE_CAMPAIGN_ITEM_TABLE = `
CREATE TABLE IF NOT EXISTS "CampaignItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "campaignId" TEXT NOT NULL,
  "tema" TEXT NOT NULL,
  "titulo" TEXT NOT NULL,
  "subtitulo" TEXT NOT NULL,
  "mensaje" TEXT NOT NULL,
  "copyFacebook" TEXT NOT NULL,
  "accion" TEXT NOT NULL,
  "entorno" TEXT NOT NULL,
  "promptFlow" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
`;

// Setup de tablas en Turso (fire-and-forget)
function ensureTursoTables(url: string, authToken?: string): void {
  // Usamos setImmediate para no bloquear la creación del PrismaClient
  setImmediate(async () => {
    try {
      const client = createClient({ url, authToken });
      await client.execute(CREATE_CHARACTER_TABLE);
      await client.execute(CREATE_CAMPAIGN_TABLE);
      await client.execute(CREATE_CAMPAIGN_ITEM_TABLE);
      console.log("[Turso] Verificación de tablas completada.");
    } catch (error) {
      console.error("[Turso] Error al verificar/crear tablas:", error);
    }
  });
}

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL || "file:db/custom.db";
  const dbAuthToken = process.env.DATABASE_AUTH_TOKEN;

  // Si es una URL de Turso (libsql://), usar el adapter
  if (dbUrl.startsWith("libsql://")) {
    // Iniciar setup de tablas en background
    ensureTursoTables(dbUrl, dbAuthToken);

    const adapter = new PrismaLibSql({
      url: dbUrl,
      authToken: dbAuthToken,
    });
    return new PrismaClient({ adapter });
  }

  // SQLite local
  return new PrismaClient({ log: ["query"] });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
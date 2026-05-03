import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function makePrisma(): PrismaClient {
  const url = process.env.DATABASE_URL;
  const tokenLen = process.env.DATABASE_AUTH_TOKEN?.length ?? 0;

  console.log("[prisma] DATABASE_URL prefix:", url?.slice(0, 30));
  console.log("[prisma] DATABASE_AUTH_TOKEN length:", tokenLen);

  if (url?.startsWith("libsql://")) {
    console.log("[prisma] Using libsql adapter");
    const adapter = new PrismaLibSQL({
      url,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
    return new PrismaClient({ adapter });
  }
  console.log("[prisma] Using default SQLite engine (NO ADAPTER)");
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? makePrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

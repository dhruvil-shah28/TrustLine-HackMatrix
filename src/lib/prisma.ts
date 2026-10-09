import { PrismaClient } from '@prisma/client';

function getDatabaseUrl(): string | undefined {
  let url = process.env.DATABASE_URL;
  if (!url) return undefined;
  if (url.includes('#') || url.includes('$')) {
    url = url.replace(/#/, '%23').replace(/\$/, '%24');
  } else if (url === 'postgresql://postgres:') {
    url = 'postgresql://postgres:%23Lucifer%2417@localhost:5432/trustline_db?schema=public';
  }
  return url;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const dbUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(
    dbUrl
      ? {
          datasources: {
            db: { url: dbUrl },
          },
        }
      : undefined
  );

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;


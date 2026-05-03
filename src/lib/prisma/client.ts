import { PrismaClient } from "../../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL ?? "";
  // The pg adapter does not understand Prisma-specific params like sslaccept=accept_invalid_certs.
  // In pg v8.12+ sslmode=require/prefer/verify-ca are also aliased to verify-full (see warning).
  // Strip both params from the URL and control SSL entirely via the PoolConfig ssl option.
  const url = new URL(connectionString);
  const sslaccept = url.searchParams.get("sslaccept");
  const sslmode = url.searchParams.get("sslmode");
  url.searchParams.delete("sslaccept");
  url.searchParams.delete("sslmode");

  // Enable SSL (with self-signed cert support) when the original URL requested it
  const needsSsl =
    sslaccept === "accept_invalid_certs" ||
    sslmode === "require" ||
    sslmode === "prefer" ||
    sslmode === "verify-ca" ||
    sslmode === "verify-full";

  const adapter = new PrismaPg({
    connectionString: url.toString(),
    ...(needsSsl && { ssl: { rejectUnauthorized: false } }),
  });
  return new PrismaClient({ adapter });
}

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Use a Proxy so the module can be imported at build time without
// triggering the URL constructor (which throws when DATABASE_URL is empty).
const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrismaClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export default prisma;

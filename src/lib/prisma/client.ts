import { PrismaClient } from "../../../generated/prisma/client";

let prisma: PrismaClient;

// Only initialize Prisma with the adapter on the server side
if (typeof window === "undefined") {
  const { PrismaPg } = require("@prisma/adapter-pg");
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  prisma = new PrismaClient({ adapter });
} else {
  // Client-side placeholder (should not be used)
  prisma = null as any;
}

export default prisma;

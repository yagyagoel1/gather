import { PrismaClient } from '@prisma/client';
export {Role} from '@prisma/client';
const prismaClientSingleton = () => {
  return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

// eslint-disable-next-line
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const db: PrismaClient = globalForPrisma.prisma ?? prismaClientSingleton();

export default db;

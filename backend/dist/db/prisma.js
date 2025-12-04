import { PrismaClient } from '@prisma/client';
let prisma;
if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
}
else {
    // In development, reuse the same Prisma instance
    const globalWithPrisma = global;
    if (!globalWithPrisma.prisma) {
        globalWithPrisma.prisma = new PrismaClient();
    }
    prisma = globalWithPrisma.prisma;
}
export { prisma };
//# sourceMappingURL=prisma.js.map
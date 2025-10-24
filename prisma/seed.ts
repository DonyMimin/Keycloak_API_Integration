import { runAllSeeds } from './seeds';
import { PrismaClient as SatriaClient } from "../prisma/generated/satria-client";

// Inisialisasi Prisma Client
const prisma = new SatriaClient();

async function main() {
    console.log('Seeding...');
    await runAllSeeds();
    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error('Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

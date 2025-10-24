import { PrismaClient as SatriaClient } from "../../prisma/generated/satria-client";
import bcrypt from "bcryptjs";
// Inisialisasi Prisma Client
const prisma = new SatriaClient();

export async function seedUser() {    
    const hashedPassword = await bcrypt.hash("Admin123!", 10);

    const users = Array.from({ length: 5 }, (_, i) => {
        const number = i + 1;
        return {
            mu_username: `admin${number}`,
            mu_mr_id: 1,
            mu_name: `admin${number}`,
            mu_password: hashedPassword,
            mu_status: "1",
            mu_created_by: 'creator',
            mu_created_date: new Date(),
        };
    });

    for (const user of users) {
        await prisma.user.upsert({
            where: { mu_username: user.mu_username },
            update: {
                mu_name: user.mu_name,
                mu_password: user.mu_password,
                mu_status: user.mu_status,
                mu_updated_by: "seed_script",
                mu_updated_date: new Date(),
            },
            create: user,
        });
    }

    console.log('User seeded');
}

import { PrismaClient as SatriaClient } from "../../prisma/generated/satria-client";

// Inisialisasi Prisma Client
const prisma = new SatriaClient();

export async function seedRoles() {
  // await prisma.roleDetail.deleteMany({});
  // await prisma.role.deleteMany({});
  // await prisma.$executeRawUnsafe(`DBCC CHECKIDENT ('mst_role', RESEED, 0)`);
  const semuaMenu = await prisma.menu.findMany();

  const roles = [{
    mr_name: 'Admin',
    mr_description: 'Administrator with full access',
    mr_type: 'system',
    mr_status: '1',
    mr_created_date: new Date(),
    mr_created_by: 'seed_script',
    roleDetails: {
        create: semuaMenu.map((menu) => ({
            mrd_permission: 'CRUD',
            mrd_mm_id: menu.mm_id
        }))
    }
  }];

    for (const role of roles) {
      const adminRole = await prisma.role.upsert({
        where: { mr_name: role.mr_name },
        update: {
          mr_description: role.mr_description,
          mr_type: role.mr_type,
          mr_status: role.mr_status,
          mr_updated_date: new Date(),
          mr_updated_by: "seed_script",
        },
        create: role,
      });
    }

  console.log('Role seeded');
}

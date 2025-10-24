import { PrismaClient as SatriaClient } from "../../prisma/generated/satria-client";

// Inisialisasi Prisma Client
const prisma = new SatriaClient();

// Model Role
export const Role = {
  // Mendapatkan pengguna berdasarkan ID
  findUnique: prisma.role.findUnique,

  // Mendapatkan semua pengguna
  findMany: prisma.role.findMany,

  // Membuat pengguna baru
  create: prisma.role.create,

  // Memperbarui pengguna
  update: prisma.role.update,

  // Menghapus pengguna
  delete: prisma.role.delete,

  // Fungsi lain yang terkait dengan model role
  count: prisma.role.count,
  findFirst: prisma.role.findFirst,
  upsert: prisma.role.upsert,
};

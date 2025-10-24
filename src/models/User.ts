import { PrismaClient as SatriaClient } from "../../prisma/generated/satria-client";

// Inisialisasi Prisma Client
const prisma = new SatriaClient();

// Model User
export const User = {
  // Mendapatkan pengguna berdasarkan ID
  findUnique: prisma.user.findUnique,

  // Mendapatkan semua pengguna
  findMany: prisma.user.findMany,

  // Membuat pengguna baru
  create: prisma.user.create,

  // Memperbarui pengguna
  update: prisma.user.update,

  // Menghapus pengguna
  delete: prisma.user.delete,

  // Fungsi lain yang terkait dengan model user
  count: prisma.user.count,
  findFirst: prisma.user.findFirst,
  upsert: prisma.user.upsert,
};

import { PrismaClient as SatriaClient } from "../../prisma/generated/satria-client";

// Inisialisasi Prisma Client
const prisma = new SatriaClient();

type MediaRoomClient = Pick<SatriaClient, "user">;

// Model User
export const createUserModel = (client: MediaRoomClient) => ({
  // Mendapatkan pengguna berdasarkan ID
  findUnique: client.user.findUnique,

  // Mendapatkan semua pengguna
  findMany: client.user.findMany,

  // Membuat pengguna baru
  create: client.user.create,

  // Memperbarui pengguna
  update: client.user.update,

  // Menghapus pengguna
  delete: client.user.delete,

  // Fungsi lain yang terkait dengan model user
  count: client.user.count,
  findFirst: client.user.findFirst,
  upsert: client.user.upsert,
});

export const User = createUserModel(prisma);
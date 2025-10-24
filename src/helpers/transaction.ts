import { PrismaClient } from "../../prisma/generated/satria-client";

const prisma = new PrismaClient();

type TxClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

export async function Transaction<T>(callback: (tx: TxClient) => Promise<T>): Promise<T> {
    return prisma.$transaction(callback);
}
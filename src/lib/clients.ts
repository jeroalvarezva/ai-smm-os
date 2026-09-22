import { ClientStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type CreateClientInput = {
  name: string;
  description?: string;
  industry?: string;
  website?: string;
  status: ClientStatus;
};

export async function listClients() {
  return prisma.client.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getClientById(id: string) {
  return prisma.client.findUnique({
    where: { id },
  });
}

export async function createClient(input: CreateClientInput) {
  try {
    return await prisma.client.create({
      data: {
        name: input.name,
        description: input.description || null,
        industry: input.industry || null,
        website: input.website || null,
        status: input.status,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error("The client could not be saved. Please check the information and try again.");
    }

    throw new Error("The client could not be saved right now. Please try again.");
  }
}
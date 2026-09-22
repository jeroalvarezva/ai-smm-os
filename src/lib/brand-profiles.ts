import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type BrandProfileInput = {
  brandName: string;
  description?: string;
  personality?: string;
  voice?: string;
  targetAudience?: string;
  valueProposition?: string;
};

export async function upsertBrandProfile(clientId: string, input: BrandProfileInput) {
  try {
    const client = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true } });

    if (!client) {
      throw new Error("The selected client could not be found.");
    }

    return await prisma.brandProfile.upsert({
      where: { clientId },
      create: {
        clientId,
        brandName: input.brandName,
        description: input.description || null,
        personality: input.personality || null,
        voice: input.voice || null,
        targetAudience: input.targetAudience || null,
        valueProposition: input.valueProposition || null,
      },
      update: {
        brandName: input.brandName,
        description: input.description || null,
        personality: input.personality || null,
        voice: input.voice || null,
        targetAudience: input.targetAudience || null,
        valueProposition: input.valueProposition || null,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "The selected client could not be found.") {
      throw error;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error("The Brand Profile could not be saved. Please check the information and try again.");
    }

    throw new Error("The Brand Profile could not be saved right now. Please try again.");
  }
}
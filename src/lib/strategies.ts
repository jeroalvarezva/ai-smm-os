import { Prisma, StrategyStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type StrategyInput = {
  status?: StrategyStatus;
  objectives?: string;
  audienceStrategy?: string;
  contentStrategy?: string;
  platformStrategy?: string;
  strategicNotes?: string;
};

export async function getStrategyByClientId(clientId: string) {
  return prisma.strategy.findUnique({
    where: { clientId },
  });
}

export async function upsertStrategy(clientId: string, input: StrategyInput) {
  try {
    const client = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true } });

    if (!client) {
      throw new Error("The selected client could not be found.");
    }

    return await prisma.strategy.upsert({
      where: { clientId },
      create: {
        clientId,
        status: input.status ?? StrategyStatus.DRAFT,
        objectives: input.objectives || null,
        audienceStrategy: input.audienceStrategy || null,
        contentStrategy: input.contentStrategy || null,
        platformStrategy: input.platformStrategy || null,
        strategicNotes: input.strategicNotes || null,
      },
      update: {
        status: input.status ?? StrategyStatus.DRAFT,
        objectives: input.objectives || null,
        audienceStrategy: input.audienceStrategy || null,
        contentStrategy: input.contentStrategy || null,
        platformStrategy: input.platformStrategy || null,
        strategicNotes: input.strategicNotes || null,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "The selected client could not be found.") {
      throw error;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error("The Strategy could not be saved. Please check the information and try again.");
    }

    throw new Error("The Strategy could not be saved right now. Please try again.");
  }
}

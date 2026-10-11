import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ContentProductionInput = {
  hook?: string;
  caption?: string;
  script?: string;
  callToAction?: string;
  visualDirection?: string;
  productionNotes?: string;
  onScreenText?: string;
  shotList?: string;
  aiImagePrompt?: string;
  aiVideoPrompt?: string;
  voiceover?: string;
  soundDirection?: string;
  thumbnailDirection?: string;
};

export async function updateContentProduction(id: string, input: ContentProductionInput) {
  try {
    return await prisma.contentItem.update({
      where: { id },
      data: {
        ...(input.hook !== undefined ? { hook: input.hook || null } : {}),
        ...(input.caption !== undefined ? { caption: input.caption || null } : {}),
        ...(input.script !== undefined ? { script: input.script || null } : {}),
        ...(input.callToAction !== undefined ? { callToAction: input.callToAction || null } : {}),
        ...(input.visualDirection !== undefined ? { visualDirection: input.visualDirection || null } : {}),
        ...(input.productionNotes !== undefined ? { productionNotes: input.productionNotes || null } : {}),
        ...(input.onScreenText !== undefined ? { onScreenText: input.onScreenText || null } : {}),
        ...(input.shotList !== undefined ? { shotList: input.shotList || null } : {}),
        ...(input.aiImagePrompt !== undefined ? { aiImagePrompt: input.aiImagePrompt || null } : {}),
        ...(input.aiVideoPrompt !== undefined ? { aiVideoPrompt: input.aiVideoPrompt || null } : {}),
        ...(input.voiceover !== undefined ? { voiceover: input.voiceover || null } : {}),
        ...(input.soundDirection !== undefined ? { soundDirection: input.soundDirection || null } : {}),
        ...(input.thumbnailDirection !== undefined ? { thumbnailDirection: input.thumbnailDirection || null } : {}),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error("The production details could not be saved. Please check the information and try again.");
    }
    throw new Error("The production details could not be saved right now. Please try again.");
  }
}

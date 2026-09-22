import { Prisma, ContentItem, ContentStatus, ContentType, Platform } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ContentItemInput = {
  title: string;
  description?: string;
  platform: Platform;
  contentType: ContentType;
  contentPillar?: string;
  objective?: string;
  targetAudience?: string;
  hook?: string;
  callToAction?: string;
  scheduledAt?: Date | null;
  status?: ContentStatus;
  notes?: string;
};

function contentData(input: ContentItemInput) {
  return {
    title: input.title,
    description: input.description || null,
    platform: input.platform,
    contentType: input.contentType,
    contentPillar: input.contentPillar || null,
    objective: input.objective || null,
    targetAudience: input.targetAudience || null,
    hook: input.hook || null,
    callToAction: input.callToAction || null,
    scheduledAt: input.scheduledAt ?? null,
    status: input.status ?? ContentStatus.DRAFT,
    notes: input.notes || null,
  };
}

export async function createContentItem(clientId: string, input: ContentItemInput) {
  try {
    return await prisma.contentItem.create({ data: { clientId, ...contentData(input) } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error("The content item could not be saved. Please check the information and try again.");
    }

    throw new Error("The content item could not be saved right now. Please try again.");
  }
}

export async function getContentItemById(id: string) {
  return prisma.contentItem.findUnique({ where: { id } });
}

export async function getContentItemsByClient(clientId: string) {
  return prisma.contentItem.findMany({
    where: { clientId },
    orderBy: [{ scheduledAt: "asc" }, { updatedAt: "desc" }],
  });
}

export async function updateContentItem(id: string, input: ContentItemInput) {
  try {
    return await prisma.contentItem.update({ where: { id }, data: contentData(input) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error("The content item could not be updated. Please check the information and try again.");
    }

    throw new Error("The content item could not be updated right now. Please try again.");
  }
}

export async function createContentItems(clientId: string, inputs: ContentItemInput[]) {
  try {
    return await prisma.$transaction(inputs.map((input) => prisma.contentItem.create({ data: { clientId, ...contentData(input) } })));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error("The content plan could not be saved. Please check the information and try again.");
    }

    throw new Error("The content plan could not be saved right now. Please try again.");
  }
}

export type ContentItemRecord = ContentItem;
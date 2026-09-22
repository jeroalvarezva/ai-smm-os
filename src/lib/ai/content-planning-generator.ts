import { ContentStatus, ContentType, Platform } from "@prisma/client";
import { getClientById } from "@/lib/clients";
import { getGeminiClient, getGeminiModel } from "@/lib/ai/strategy-generator";

export const MIN_CONTENT_PLAN_ITEMS = 1;
export const MAX_CONTENT_PLAN_ITEMS = 30;
export const DEFAULT_CONTENT_PLAN_ITEMS = 10;

export function isValidContentPlanCount(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= MIN_CONTENT_PLAN_ITEMS && value <= MAX_CONTENT_PLAN_ITEMS;
}

export type ContentPlanItemDraft = {
  title: string;
  description: string;
  platform: Platform;
  contentType: ContentType;
  contentPillar: string;
  objective: string;
  targetAudience: string;
  hook: string;
  callToAction: string;
  scheduledAt: string | null;
  status: ContentStatus;
  notes: string;
};

export type ContentPlanDraft = {
  items: ContentPlanItemDraft[];
};

type ContentPlanningInput = {
  client: {
    name: string;
    industry: string;
    description: string;
  };
  brandBrain: {
    brandName: string;
    description: string;
    personality: string;
    voice: string;
    targetAudience: string;
    valueProposition: string;
    offers: string;
    contentPillars: string;
    goals: string;
    platforms: string;
    brandRules: string;
  };
  strategy: {
    objectives: string;
    audienceStrategy: string;
    contentStrategy: string;
    platformStrategy: string;
    strategicNotes: string;
  };
};

const requiredStringFields = [
  "title",
  "description",
  "contentPillar",
  "objective",
  "targetAudience",
  "hook",
  "callToAction",
  "notes",
] as const;

function isValidDate(value: string) {
  return !Number.isNaN(new Date(value).getTime());
}

export function isValidContentPlanDraft(value: unknown, expectedCount?: number): value is ContentPlanDraft {
  if (!value || typeof value !== "object") return false;

  const draft = value as Record<string, unknown>;
  if (!Array.isArray(draft.items) || draft.items.length < MIN_CONTENT_PLAN_ITEMS || draft.items.length > MAX_CONTENT_PLAN_ITEMS) return false;
  if (expectedCount !== undefined && draft.items.length !== expectedCount) return false;

  return draft.items.every((value) => {
    if (!value || typeof value !== "object") return false;
    const item = value as Record<string, unknown>;

    if (!requiredStringFields.every((field) => typeof item[field] === "string" && item[field].trim().length > 0)) return false;
    if (typeof item.platform !== "string" || !Object.values(Platform).includes(item.platform as Platform)) return false;
    if (typeof item.contentType !== "string" || !Object.values(ContentType).includes(item.contentType as ContentType)) return false;
    if (typeof item.status !== "string" || !Object.values(ContentStatus).includes(item.status as ContentStatus)) return false;
    return item.scheduledAt === null || (typeof item.scheduledAt === "string" && isValidDate(item.scheduledAt));
  });
}

export interface ContentPlanningProvider {
  generateContentPlan(input: ContentPlanningInput, count: number): Promise<ContentPlanDraft>;
}

export class GeminiContentPlanningProvider implements ContentPlanningProvider {
  async generateContentPlan(input: ContentPlanningInput, count: number): Promise<ContentPlanDraft> {
    const ai = getGeminiClient();
    const model = getGeminiModel();
    const itemSchema = {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        platform: { type: "string", enum: Object.values(Platform) },
        contentType: { type: "string", enum: Object.values(ContentType) },
        contentPillar: { type: "string" },
        objective: { type: "string" },
        targetAudience: { type: "string" },
        hook: { type: "string" },
        callToAction: { type: "string" },
        scheduledAt: { type: "string", nullable: true },
        status: { type: "string", enum: Object.values(ContentStatus) },
        notes: { type: "string" },
      },
      required: ["title", "description", "platform", "contentType", "contentPillar", "objective", "targetAudience", "hook", "callToAction", "scheduledAt", "status", "notes"],
      additionalProperties: false,
    };
    const responseSchema = {
      type: "object",
      properties: { items: { type: "array", minItems: count, maxItems: count, items: itemSchema } },
      required: ["items"],
      additionalProperties: false,
    };
    const prompt = `You are a professional social media content planner creating a draft for human review. Generate exactly ${count} distinct content planning items. Follow the approved Brand Brain and Strategy. Respect brand personality, voice, audience, defined content pillars, strategic objectives, platform strategy, and brand rules. Distribute ideas across appropriate platforms and vary formats. Avoid repetitive concepts, generic filler, unsupported claims, invented products or offers, and disconnected viral ideas. Do not make unsupported health, legal, or financial claims. Scheduled dates are planning suggestions only, not recommendations based on real-time analytics. If no campaign start date is supplied, set scheduledAt to null rather than inventing an arbitrary date. Use only the supplied enum values and output only valid JSON matching the required structure. Every item must be purposeful and have non-empty strings for all string fields. All generated items must start with status DRAFT.

Approved planning context:
${JSON.stringify(input, null, 2)}`;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json", responseJsonSchema: responseSchema, temperature: 0.7 },
      });
      const raw = response.text;
      if (!raw) throw new Error("Gemini returned an empty content plan.");

      const parsed = JSON.parse(raw) as unknown;
      if (!isValidContentPlanDraft(parsed, count)) throw new Error("Gemini returned an invalid content plan.");
      return parsed;
    } catch (error) {
      if (error instanceof Error && (error.message === "Gemini API is not configured." || error.message === "Gemini returned an empty content plan." || error.message === "Gemini returned an invalid content plan.")) {
        throw error;
      }
      throw new Error("Gemini could not generate the content plan right now. Please try again.");
    }
  }
}

export function getDefaultContentPlanningProvider(): ContentPlanningProvider {
  getGeminiClient();
  return new GeminiContentPlanningProvider();
}

export async function generateContentPlanFromApprovedContext(clientId: string, count: number, provider?: ContentPlanningProvider) {
  const client = await getClientById(clientId);
  if (!client) throw new Error("The client could not be found.");
  if (!client.brandProfile) throw new Error("The Brand Brain must be completed before content planning.");
  if (!client.strategy) throw new Error("The strategy must be created and saved before content planning.");

  const input: ContentPlanningInput = {
    client: { name: client.name, industry: client.industry ?? "", description: client.description ?? "" },
    brandBrain: {
      brandName: client.brandProfile.brandName,
      description: client.brandProfile.description ?? "",
      personality: client.brandProfile.personality ?? "",
      voice: client.brandProfile.voice ?? "",
      targetAudience: client.brandProfile.targetAudience ?? "",
      valueProposition: client.brandProfile.valueProposition ?? "",
      offers: client.brandProfile.offers ?? "",
      contentPillars: client.brandProfile.contentPillars ?? "",
      goals: client.brandProfile.goals ?? "",
      platforms: client.brandProfile.platforms ?? "",
      brandRules: client.brandProfile.brandRules ?? "",
    },
    strategy: {
      objectives: client.strategy.objectives ?? "",
      audienceStrategy: client.strategy.audienceStrategy ?? "",
      contentStrategy: client.strategy.contentStrategy ?? "",
      platformStrategy: client.strategy.platformStrategy ?? "",
      strategicNotes: client.strategy.strategicNotes ?? "",
    },
  };

  const draft = await (provider ?? getDefaultContentPlanningProvider()).generateContentPlan(input, count);
  if (!isValidContentPlanDraft(draft, count)) throw new Error("The AI provider returned an invalid content plan.");
  return draft;
}

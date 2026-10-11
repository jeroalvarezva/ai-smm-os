import { ContentType, Platform } from "@prisma/client";
import { getClientById } from "@/lib/clients";
import { getContentItemById } from "@/lib/content-items";
import { getGeminiClient, getGeminiModel } from "@/lib/ai/strategy-generator";

export const productionDraftFields = [
  "hook",
  "caption",
  "script",
  "callToAction",
  "visualDirection",
  "productionNotes",
  "onScreenText",
  "shotList",
  "aiImagePrompt",
  "aiVideoPrompt",
  "voiceover",
  "soundDirection",
  "thumbnailDirection",
] as const;

export type ContentProductionDraft = Record<typeof productionDraftFields[number], string | null>;

type ProductionInput = {
  client: { name: string; industry: string; description: string };
  brandBrain: Record<string, string>;
  strategy: Record<string, string>;
  contentItem: {
    title: string;
    description: string;
    platform: Platform;
    contentType: ContentType;
    hook: string;
    callToAction: string;
    scheduledAt: string | null;
  };
};

export function isValidContentProductionDraft(value: unknown): value is ContentProductionDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Record<string, unknown>;
  return productionDraftFields.every((field) => draft[field] === null || typeof draft[field] === "string");
}

export class GeminiContentProductionProvider {
  async generateProductionDraft(input: ProductionInput): Promise<ContentProductionDraft> {
    const model = getGeminiModel();
    const ai = getGeminiClient();
    const nullableString = { type: ["string", "null"] };
    const responseSchema = {
      type: "object",
      properties: Object.fromEntries(productionDraftFields.map((field) => [field, nullableString])),
      required: [...productionDraftFields],
      additionalProperties: false,
    };
    const prompt = `You are a professional social media production planner creating an AI draft for human review. Use the supplied Brand Brain and saved Strategy as authoritative. Do not invent products, offers, brand facts, claims, or unsupported platform behavior. Adapt the output to the platform and content type. Use null for production fields that are not relevant; do not force video fields onto static content. For IMAGE, emphasize visual direction, image prompt, on-screen text, caption, CTA, and thumbnail direction when useful. For CAROUSEL, include slide-by-slide structure in shotList or visualDirection. For VIDEO, REEL, or STORY, include a strong opening hook, script, shotList, on-screen text, voiceover, sound direction, and video prompt when relevant. For TEXT, prioritize copy, hook, and CTA. Keep every value practical and production-ready. Do not imitate copyrighted characters or living artists. Return only JSON matching the schema.

Production context:
${JSON.stringify(input, null, 2)}`;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json", responseJsonSchema: responseSchema, temperature: 0.7 },
      });
      const raw = response.text;
      if (!raw) throw new Error("Gemini returned an empty production draft.");
      const parsed = JSON.parse(raw) as unknown;
      if (!isValidContentProductionDraft(parsed)) throw new Error("Gemini returned an invalid production draft.");
      return parsed;
    } catch (error) {
      const providerError = error as { name?: unknown; message?: unknown; status?: unknown; statusCode?: unknown; code?: unknown };
      console.error("[BUILD7B] Gemini generation failed", {
        model,
        sdk: "@google/genai 2.24.0",
        apiKeyPresent: Boolean(process.env.GEMINI_API_KEY?.trim()),
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        name: providerError.name,
        message: providerError.message,
        status: providerError.status,
        statusCode: providerError.statusCode,
        code: providerError.code,
      });
      if (error instanceof Error && (error.message === "Gemini API is not configured." || error.message === "Gemini returned an empty production draft." || error.message === "Gemini returned an invalid production draft.")) {
        throw error;
      }
      throw new Error(`Gemini generation failed: ${providerError.message ?? "Unknown provider error"}`);
    }
  }
}

export async function generateContentProductionDraft(clientId: string, contentId: string) {
  const client = await getClientById(clientId);
  if (!client) throw new Error("The client could not be found.");
  if (!client.brandProfile) throw new Error("The Brand Brain must be completed before production generation.");
  if (!client.strategy) throw new Error("The strategy must be created and saved before production generation.");

  const item = await getContentItemById(contentId);
  if (!item || item.clientId !== clientId) throw new Error("The content item could not be found.");

  const input: ProductionInput = {
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
    contentItem: {
      title: item.title,
      description: item.description ?? "",
      platform: item.platform,
      contentType: item.contentType,
      hook: item.hook ?? "",
      callToAction: item.callToAction ?? "",
      scheduledAt: item.scheduledAt?.toISOString() ?? null,
    },
  };

  return new GeminiContentProductionProvider().generateProductionDraft(input);
}

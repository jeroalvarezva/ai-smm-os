import { StrategyStatus } from "@prisma/client";
import { GoogleGenAI } from "@google/genai";
import { getClientById } from "@/lib/clients";

export type StrategyDraft = {
  status: StrategyStatus;
  objectives: string;
  audienceStrategy: string;
  contentStrategy: string;
  platformStrategy: string;
  strategicNotes: string;
};

export type StrategyGenerationInput = {
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

export interface StrategyProvider {
  generateStrategy(input: StrategyGenerationInput): Promise<StrategyDraft>;
}

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Gemini API is not configured.");
  }

  return new GoogleGenAI({ apiKey });
}

export function getGeminiModel() {
  return process.env.GEMINI_MODEL?.trim() || "gemini-3.6-flash";
}

export function isValidStrategyDraft(value: unknown): value is StrategyDraft {
  if (!value || typeof value !== "object") {
    return false;
  }

  const draft = value as Record<string, unknown>;

  if (typeof draft.status !== "string" || !Object.values(StrategyStatus).includes(draft.status as StrategyStatus)) {
    return false;
  }

  const requiredKeys = [
    "objectives",
    "audienceStrategy",
    "contentStrategy",
    "platformStrategy",
    "strategicNotes",
  ] as const;

  return requiredKeys.every((key) => typeof draft[key] === "string" && draft[key]?.trim().length > 0);
}

export class MockAIProvider implements StrategyProvider {
  async generateStrategy(input: StrategyGenerationInput): Promise<StrategyDraft> {
    const brandName = input.brandName || "This brand";

    return {
      status: StrategyStatus.DRAFT,
      objectives: `Build a durable social media presence for ${brandName} that strengthens awareness, engagement, trust, and conversion through a consistent, audience-first publishing rhythm.`,
      audienceStrategy: `Speak to ${input.targetAudience || "the primary audience"} using a ${input.personality || "clear and confident"} tone that reflects ${brandName}'s ${input.voice || "brand voice"}. The messaging should focus on relevance, trust, and practical value while maintaining authenticity.`,
      contentStrategy: `Shape content around ${input.contentPillars || "key brand themes"}, with a balanced mix of education, proof, community engagement, and offers that support ${input.valueProposition || "the brand's value proposition"}. Keep the storytelling consistent and supportive across every content touchpoint.`,
      platformStrategy: `Prioritize ${input.platforms || "the selected social platforms"} according to the brand's audience and workflow, tailoring tone, message length, format, and cadence to each channel while keeping the brand identity cohesive across touchpoints.`,
      strategicNotes: `Development AI Draft\n\nBrand foundation: ${input.description || "Description not defined yet."}\n\nKey offers: ${input.offers || "Not defined yet."}\n\nGoals: ${input.goals || "Not defined yet."}\n\nBrand rules: ${input.brandRules || "Not defined yet."}`,
    };
  }
}

export class GeminiProvider implements StrategyProvider {
  async generateStrategy(input: StrategyGenerationInput): Promise<StrategyDraft> {
    const model = getGeminiModel();
    const ai = getGeminiClient();
    const strategySchema = {
      type: "object",
      properties: {
        objectives: { type: "string" },
        audienceStrategy: { type: "string" },
        contentStrategy: { type: "string" },
        platformStrategy: { type: "string" },
        strategicNotes: { type: "string" },
      },
      required: ["objectives", "audienceStrategy", "contentStrategy", "platformStrategy", "strategicNotes"],
      additionalProperties: false,
    };

    const prompt = `You are a professional social media strategist generating a draft strategy for review. Use only the supplied Brand Brain information. You may make reasonable strategic inferences, but do not invent products, services, audiences, platforms, claims, statistics, competitors, or facts not supported by the Brand Brain. When information is missing, clearly describe it as missing or not defined. Output only valid JSON matching the required structure. This is a draft for human review, not a final approved strategy.\n\nBrand Brain data:\n${JSON.stringify(input, null, 2)}`;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseJsonSchema: strategySchema,
          temperature: 0.7,
        },
      });

      const raw = response.text;
      if (!raw) {
        throw new Error("Gemini returned an empty strategy draft.");
      }

      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const draft: StrategyDraft = {
        status: StrategyStatus.DRAFT,
        objectives: typeof parsed.objectives === "string" ? parsed.objectives : "",
        audienceStrategy: typeof parsed.audienceStrategy === "string" ? parsed.audienceStrategy : "",
        contentStrategy: typeof parsed.contentStrategy === "string" ? parsed.contentStrategy : "",
        platformStrategy: typeof parsed.platformStrategy === "string" ? parsed.platformStrategy : "",
        strategicNotes: typeof parsed.strategicNotes === "string" ? parsed.strategicNotes : "",
      };

      if (!isValidStrategyDraft(draft)) {
        throw new Error("Gemini returned an invalid strategy draft.");
      }

      return draft;
    } catch (error) {
      if (error instanceof Error && (error.message === "Gemini API is not configured." || error.message === "Gemini returned an invalid strategy draft." || error.message === "Gemini returned an empty strategy draft.")) {
        throw error;
      }

      throw new Error("Gemini could not generate the strategy right now. Please try again.");
    }
  }
}

export function getDefaultStrategyProvider(): StrategyProvider {
  getGeminiClient();
  return new GeminiProvider();
}

export async function generateStrategyFromBrandBrain(
  clientId: string,
  provider?: StrategyProvider,
): Promise<StrategyDraft> {
  const activeProvider = provider ?? getDefaultStrategyProvider();
  const client = await getClientById(clientId);

  if (!client) {
    throw new Error("The client could not be found.");
  }

  if (!client.brandProfile) {
    throw new Error("A Brand Profile is required before strategy generation.");
  }

  const profile = client.brandProfile;
  const input: StrategyGenerationInput = {
    brandName: profile.brandName || client.name,
    description: profile.description ?? "",
    personality: profile.personality ?? "",
    voice: profile.voice ?? "",
    targetAudience: profile.targetAudience ?? "",
    valueProposition: profile.valueProposition ?? "",
    offers: profile.offers ?? "",
    contentPillars: profile.contentPillars ?? "",
    goals: profile.goals ?? "",
    platforms: profile.platforms ?? "",
    brandRules: profile.brandRules ?? "",
  };

  const draft = await activeProvider.generateStrategy(input);

  if (!isValidStrategyDraft(draft)) {
    throw new Error("The AI provider returned an invalid strategy draft.");
  }

  return draft;
}

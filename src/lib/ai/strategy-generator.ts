import { StrategyStatus } from "@prisma/client";
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

  return requiredKeys.every((key) => typeof draft[key] === "string");
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

export const defaultStrategyProvider: StrategyProvider = new MockAIProvider();

export async function generateStrategyFromBrandBrain(
  clientId: string,
  provider: StrategyProvider = defaultStrategyProvider,
): Promise<StrategyDraft> {
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

  const draft = await provider.generateStrategy(input);

  if (!isValidStrategyDraft(draft)) {
    throw new Error("The AI provider returned an invalid strategy draft.");
  }

  return draft;
}

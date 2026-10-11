import { NextResponse } from "next/server";
import { generateContentProductionDraft } from "@/lib/ai/content-production-generator";

type RouteContext = { params: Promise<{ id: string; contentId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const { id, contentId } = await context.params;

  try {
    return NextResponse.json(await generateContentProductionDraft(id, contentId));
  } catch (error) {
    const message = error instanceof Error ? error.message : "The production draft could not be generated right now.";
    if (message === "The client could not be found.") return NextResponse.json({ error: message }, { status: 404 });
    if (message === "The content item could not be found.") return NextResponse.json({ error: message }, { status: 404 });
    if (message === "The Brand Brain must be completed before production generation." || message === "The strategy must be created and saved before production generation.") {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    if (message === "Gemini API is not configured.") return NextResponse.json({ error: message }, { status: 500 });
    console.error("[Content Studio AI Generation Error]", error);
return NextResponse.json(
  { error: message || "Unknown Gemini generation error." },
  { status: 500 },
);
  }
}

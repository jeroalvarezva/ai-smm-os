import { NextResponse } from "next/server";
import { upsertBrandProfile } from "@/lib/brand-profiles";

type RouteContext = { params: Promise<{ id: string }> };

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please submit the form again." }, { status: 400 });
  }

  const brandName = textValue(body.brandName);

  if (!brandName) {
    return NextResponse.json({ error: "Brand name is required." }, { status: 400 });
  }

  try {
    await upsertBrandProfile(id, {
      brandName,
      description: textValue(body.description),
      personality: textValue(body.personality),
      voice: textValue(body.voice),
      targetAudience: textValue(body.targetAudience),
      valueProposition: textValue(body.valueProposition),
      offers: textValue(body.offers),
      contentPillars: textValue(body.contentPillars),
      goals: textValue(body.goals),
      platforms: textValue(body.platforms),
      brandRules: textValue(body.brandRules),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The Brand Profile could not be saved right now. Please try again.";
    const status = message === "The selected client could not be found." ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
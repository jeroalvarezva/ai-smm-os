import { NextResponse } from "next/server";
import { generateStrategyFromBrandBrain } from "@/lib/ai/strategy-generator";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const draft = await generateStrategyFromBrandBrain(id);
    return NextResponse.json(draft);
  } catch (error) {
    const message = error instanceof Error ? error.message : "The strategy draft could not be generated right now.";

    if (message === "The client could not be found.") {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    if (message === "A Brand Profile is required before strategy generation.") {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    if (message === "Gemini API is not configured.") {
      return NextResponse.json({ error: message }, { status: 500 });
    }

    if (message === "Gemini could not generate the strategy right now. Please try again.") {
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({ error: "The strategy draft could not be generated right now." }, { status: 500 });
  }
}

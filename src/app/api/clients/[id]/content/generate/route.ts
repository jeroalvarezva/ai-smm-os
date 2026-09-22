import { NextResponse } from "next/server";
import {
  DEFAULT_CONTENT_PLAN_ITEMS,
  generateContentPlanFromApprovedContext,
  isValidContentPlanCount,
} from "@/lib/ai/content-planning-generator";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  let body: Record<string, unknown> = {};

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please submit a valid item count." }, { status: 400 });
  }

  const count = body.count === undefined ? DEFAULT_CONTENT_PLAN_ITEMS : body.count;
  if (!isValidContentPlanCount(count)) {
    return NextResponse.json({ error: "Choose a whole number of content items between 1 and 30." }, { status: 400 });
  }

  try {
    return NextResponse.json(await generateContentPlanFromApprovedContext(id, count));
  } catch (error) {
    const message = error instanceof Error ? error.message : "The content plan could not be generated right now.";

    if (message === "The client could not be found.") {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    if (message === "The Brand Brain must be completed before content planning." || message === "The strategy must be created and saved before content planning.") {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    if (message === "Gemini API is not configured.") {
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({ error: "The content plan could not be generated right now. Please try again." }, { status: 500 });
  }
}

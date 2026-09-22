import { NextResponse } from "next/server";
import { getClientById } from "@/lib/clients";
import { createContentItems } from "@/lib/content-items";
import { ContentPlanDraft, isValidContentPlanDraft } from "@/lib/ai/content-planning-generator";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const client = await getClientById(id);
  if (!client) return NextResponse.json({ error: "Client not found." }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please submit a valid content plan." }, { status: 400 });
  }

  if (!isValidContentPlanDraft(body)) {
    return NextResponse.json({ error: "The content plan is invalid and could not be saved." }, { status: 400 });
  }

  const draft = body as ContentPlanDraft;
  try {
    const items = await createContentItems(id, draft.items.map((item) => ({
      title: item.title,
      description: item.description,
      platform: item.platform,
      contentType: item.contentType,
      contentPillar: item.contentPillar,
      objective: item.objective,
      targetAudience: item.targetAudience,
      hook: item.hook,
      callToAction: item.callToAction,
      scheduledAt: item.scheduledAt ? new Date(item.scheduledAt) : null,
      status: item.status,
      notes: item.notes,
    })));

    return NextResponse.json({ items }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The content plan could not be saved right now. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

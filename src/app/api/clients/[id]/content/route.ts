import { ContentStatus, ContentType, Platform } from "@prisma/client";
import { NextResponse } from "next/server";
import { getClientById } from "@/lib/clients";
import { createContentItem, getContentItemsByClient } from "@/lib/content-items";

type RouteContext = { params: Promise<{ id: string }> };

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function enumValue<T extends string>(value: unknown, values: readonly T[]) {
  return typeof value === "string" && values.includes(value as T) ? value as T : null;
}

function parseInput(body: Record<string, unknown>) {
  const title = textValue(body.title);
  const platform = enumValue(body.platform, Object.values(Platform));
  const contentType = enumValue(body.contentType, Object.values(ContentType));
  const status = enumValue(body.status ?? ContentStatus.DRAFT, Object.values(ContentStatus));
  const scheduledAtValue = textValue(body.scheduledAt);

  if (!title) return { error: "Title is required." };
  if (!platform) return { error: "Choose a valid platform." };
  if (!contentType) return { error: "Choose a valid content type." };
  if (!status) return { error: "Choose a valid content status." };

  let scheduledAt: Date | null = null;
  if (scheduledAtValue) {
    scheduledAt = new Date(scheduledAtValue);
    if (Number.isNaN(scheduledAt.getTime())) return { error: "Enter a valid scheduled date." };
  }

  return {
    input: {
      title,
      platform,
      contentType,
      status,
      scheduledAt,
      description: textValue(body.description),
      contentPillar: textValue(body.contentPillar),
      objective: textValue(body.objective),
      targetAudience: textValue(body.targetAudience),
      hook: textValue(body.hook),
      callToAction: textValue(body.callToAction),
      notes: textValue(body.notes),
    },
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const client = await getClientById(id);

  if (!client) return NextResponse.json({ error: "Client not found." }, { status: 404 });
  return NextResponse.json(await getContentItemsByClient(id));
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const client = await getClientById(id);
  if (!client) return NextResponse.json({ error: "Client not found." }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please submit the form again." }, { status: 400 });
  }

  const parsed = parseInput(body);
  if (parsed.error || !parsed.input) return NextResponse.json({ error: parsed.error ?? "Invalid content item." }, { status: 400 });

  try {
    return NextResponse.json(await createContentItem(id, parsed.input), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The content item could not be saved right now. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export { parseInput };
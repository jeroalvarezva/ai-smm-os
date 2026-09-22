import { NextResponse } from "next/server";
import { StrategyStatus } from "@prisma/client";
import { upsertStrategy } from "@/lib/strategies";
import { getClientById } from "@/lib/clients";

type RouteContext = { params: Promise<{ id: string }> };

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isStrategyStatus(value: unknown): value is StrategyStatus {
  return typeof value === "string" && Object.values(StrategyStatus).includes(value as StrategyStatus);
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const client = await getClientById(id);

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json(client.strategy ?? null);
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please submit the form again." }, { status: 400 });
  }

  const statusValue = body.status;
  const status = typeof statusValue === "string" ? statusValue : StrategyStatus.DRAFT;

  if (!isStrategyStatus(status)) {
    return NextResponse.json({ error: "Strategy status is invalid." }, { status: 400 });
  }

  try {
    const saved = await upsertStrategy(id, {
      status,
      objectives: textValue(body.objectives),
      audienceStrategy: textValue(body.audienceStrategy),
      contentStrategy: textValue(body.contentStrategy),
      platformStrategy: textValue(body.platformStrategy),
      strategicNotes: textValue(body.strategicNotes),
    });

    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : "The Strategy could not be saved right now. Please try again.";
    const statusCode = message === "The selected client could not be found." ? 404 : 500;
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

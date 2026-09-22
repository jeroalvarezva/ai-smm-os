import { NextResponse } from "next/server";
import { getClientById } from "@/lib/clients";
import { getContentItemById, updateContentItem } from "@/lib/content-items";
import { parseInput } from "@/app/api/clients/[id]/content/route";

type RouteContext = { params: Promise<{ id: string; contentId: string }> };

async function getOwnedItem(clientId: string, contentId: string) {
  const item = await getContentItemById(contentId);
  return item?.clientId === clientId ? item : null;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id, contentId } = await context.params;
  const item = await getOwnedItem(id, contentId);
  if (!item) return NextResponse.json({ error: "Content item not found." }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(request: Request, context: RouteContext) {
  const { id, contentId } = await context.params;
  const client = await getClientById(id);
  if (!client) return NextResponse.json({ error: "Client not found." }, { status: 404 });
  if (!await getOwnedItem(id, contentId)) return NextResponse.json({ error: "Content item not found." }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please submit the form again." }, { status: 400 });
  }

  const parsed = parseInput(body);
  if (parsed.error || !parsed.input) return NextResponse.json({ error: parsed.error ?? "Invalid content item." }, { status: 400 });

  try {
    return NextResponse.json(await updateContentItem(contentId, parsed.input));
  } catch (error) {
    const message = error instanceof Error ? error.message : "The content item could not be updated right now. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
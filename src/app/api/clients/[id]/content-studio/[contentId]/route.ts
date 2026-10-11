import { NextResponse } from "next/server";
import { getClientById } from "@/lib/clients";
import { getContentItemById } from "@/lib/content-items";
import { updateContentProduction } from "@/lib/content-studio";

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
  if (!await getClientById(id)) return NextResponse.json({ error: "Client not found." }, { status: 404 });
  if (!await getOwnedItem(id, contentId)) return NextResponse.json({ error: "Content item not found." }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please submit the form again." }, { status: 400 });
  }

  const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
  const input = {
    hook: text(body.hook),
    caption: text(body.caption),
    script: text(body.script),
    callToAction: text(body.callToAction),
    visualDirection: text(body.visualDirection),
    productionNotes: text(body.productionNotes),
    ...(Object.prototype.hasOwnProperty.call(body, "onScreenText") ? { onScreenText: text(body.onScreenText) } : {}),
    ...(Object.prototype.hasOwnProperty.call(body, "shotList") ? { shotList: text(body.shotList) } : {}),
    ...(Object.prototype.hasOwnProperty.call(body, "aiImagePrompt") ? { aiImagePrompt: text(body.aiImagePrompt) } : {}),
    ...(Object.prototype.hasOwnProperty.call(body, "aiVideoPrompt") ? { aiVideoPrompt: text(body.aiVideoPrompt) } : {}),
    ...(Object.prototype.hasOwnProperty.call(body, "voiceover") ? { voiceover: text(body.voiceover) } : {}),
    ...(Object.prototype.hasOwnProperty.call(body, "soundDirection") ? { soundDirection: text(body.soundDirection) } : {}),
    ...(Object.prototype.hasOwnProperty.call(body, "thumbnailDirection") ? { thumbnailDirection: text(body.thumbnailDirection) } : {}),
  };

  if (Object.values(input).some((value) => value.length > 5000)) {
    return NextResponse.json({ error: "Production fields must be 5,000 characters or fewer." }, { status: 400 });
  }

  try {
    return NextResponse.json(await updateContentProduction(contentId, input));
  } catch (error) {
    const message = error instanceof Error ? error.message : "The production details could not be saved right now. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

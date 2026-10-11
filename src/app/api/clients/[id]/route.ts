import { NextResponse } from "next/server";
import { getClientById } from "@/lib/clients";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const client = await getClientById(id);

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json(client);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const client = await getClientById(id);

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.client.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "The client could not be deleted right now. Please try again." }, { status: 500 });
  }
}

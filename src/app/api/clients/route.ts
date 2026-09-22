import { ClientStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/clients";

function isClientStatus(value: unknown): value is ClientStatus {
  return typeof value === "string" && Object.values(ClientStatus).includes(value as ClientStatus);
}

function validWebsite(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please submit the form again." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const industry = typeof body.industry === "string" ? body.industry.trim() : "";
  const website = typeof body.website === "string" ? body.website.trim() : "";
  const status = body.status;

  if (!name) {
    return NextResponse.json({ error: "Client name is required." }, { status: 400 });
  }

  if (website && !validWebsite(website)) {
    return NextResponse.json({ error: "Enter a valid website URL beginning with http:// or https://." }, { status: 400 });
  }

  if (!isClientStatus(status)) {
    return NextResponse.json({ error: "Choose a valid client status." }, { status: 400 });
  }

  try {
    const client = await createClient({ name, description, industry, website, status });
    return NextResponse.json({ id: client.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The client could not be saved right now. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
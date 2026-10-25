import { NextResponse } from "next/server";
import { respondTo, type ChatProduct } from "@/lib/assistant";
import { seedProducts } from "@/lib/seed-products";


interface ChatRequestBody {
  message?: string;
  catalog?: ChatProduct[];
}

/**
 * Built-in catalogue assistant. Send `{ message, catalog }` and receive
 * `{ reply, slugs }`. Point `respondTo` at a model call instead when an LLM
 * key becomes available — the request/response shape stays the same.
 */
export async function POST(request: Request) {
  let body: ChatRequestBody = {};
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    body = {};
  }

  const message = typeof body.message === "string" ? body.message : "";
  if (message.length > 600) {
    return NextResponse.json({ error: "Message too long." }, { status: 400 });
  }

  const catalog: ChatProduct[] =
    Array.isArray(body.catalog) && body.catalog.length > 0
      ? body.catalog
      : (seedProducts as unknown as ChatProduct[]);

  const answer = respondTo(message, catalog);

  return NextResponse.json({
    ...answer,
    at: Date.now(),
  });
}

export async function GET() {
  return NextResponse.json({
    service: "nextnova-assistant",
    mode: "catalog",
    hints: ["What can I buy under $500?", "What launches in 2027?", "Compare Vision Pro and Ray-Ban Display"],
  });
}

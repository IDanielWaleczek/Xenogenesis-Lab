import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { streamOrganismImageResponse } from "@/server/organism-image";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Generates a controlled organism illustration or an explicit procedural fallback. */
export async function POST(request: Request) {
  try {
    const encoder = new TextEncoder();
    const stream = streamOrganismImageResponse(await request.json());
    return new Response(new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    }), { headers: {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Encoding": "none",
      "Content-Type": "text/event-stream",
      "X-Accel-Buffering": "no",
    } });
  } catch (error) {
    if (error instanceof ZodError || error instanceof RangeError) {
      return NextResponse.json({ error: "Invalid organism-image request." }, { status: 400 });
    }
    return NextResponse.json({ error: "Organism image generation failed." }, { status: 500 });
  }
}

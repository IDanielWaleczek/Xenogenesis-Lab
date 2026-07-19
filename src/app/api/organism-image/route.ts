import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { createOrganismImageResponse } from "@/server/organism-image";

/** Generates a controlled organism illustration or an explicit procedural fallback. */
export async function POST(request: Request) {
  try {
    return NextResponse.json(
      await createOrganismImageResponse(await request.json()),
    );
  } catch (error) {
    if (error instanceof ZodError || error instanceof RangeError) {
      return NextResponse.json({ error: "Invalid organism-image request." }, { status: 400 });
    }
    return NextResponse.json({ error: "Organism image generation failed." }, { status: 500 });
  }
}

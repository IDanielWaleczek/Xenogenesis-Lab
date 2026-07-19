import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { createLifeConsultantResponse } from "@/server/life-consultant";

/** Validates a simulator state and returns a provenance-labelled consultant analysis. */
export async function POST(request: Request) {
  try {
    return NextResponse.json(
      await createLifeConsultantResponse(await request.json()),
    );
  } catch (error) {
    if (error instanceof ZodError || error instanceof RangeError) {
      return NextResponse.json({ error: "Invalid simulator request." }, { status: 400 });
    }
    return NextResponse.json({ error: "Consultant analysis failed." }, { status: 500 });
  }
}

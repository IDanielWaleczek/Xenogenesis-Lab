import { NextResponse } from "next/server";

import { MissionInstructorRequestSchema } from "@/domain/mission/schema";
import { createMissionInstructorResponse } from "@/server/mission-instructor";

/** Handles the validated server-only Mission Instructor request. */
export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = MissionInstructorRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Mission Instructor request is invalid." },
      { status: 400 },
    );
  }

  const response = await createMissionInstructorResponse(parsed.data);
  return NextResponse.json(response);
}

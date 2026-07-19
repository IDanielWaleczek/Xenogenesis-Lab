import "server-only";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import { buildLocalDebrief } from "@/domain/mission/debrief";
import { VESPERA_MISSION } from "@/domain/mission/mission";
import {
  MissionDebriefSchema,
  MissionInstructorRequestSchema,
  MissionInstructorResponseSchema,
} from "@/domain/mission/schema";
import { compareHypothesis, simulateMission } from "@/domain/mission/simulate";

const MISSION_INSTRUCTOR_MODEL = "gpt-5.6";

/** Returns a validated GPT-5.6 debrief or an explicitly labelled local fallback. */
export async function createMissionInstructorResponse(
  rawRequest: unknown,
) {
  const request = MissionInstructorRequestSchema.parse(rawRequest);
  const simulation = simulateMission(request.hypothesis.world);
  const comparison = compareHypothesis(request.hypothesis, simulation);
  const fallback = buildLocalDebrief(request.language, comparison, simulation);
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return MissionInstructorResponseSchema.parse({
      source: "local-fallback",
      model: null,
      fallbackReason: "OPENAI_API_KEY is not configured on the server.",
      debrief: fallback,
    });
  }

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.responses.parse({
      model: MISSION_INSTRUCTOR_MODEL,
      reasoning: { effort: "low" },
      store: false,
      max_output_tokens: 900,
      input: [
        {
          role: "system",
          content:
            "You are the Xenogenesis Lab Mission Instructor. Evaluate the learner's structured mission decisions only against the supplied deterministic simulation. Do not alter calculated facts, add unsupported biology, or imply certainty beyond this educational model. Lead with a concise assessment, cite numerical evidence, identify trade-offs, ask one targeted question, and recommend one controlled follow-up experiment. Return the requested language.",
        },
        {
          role: "user",
          content: JSON.stringify({
            responseLanguage: request.language === "pl" ? "Polish" : "English",
            mission: { ...VESPERA_MISSION, world: request.hypothesis.world },
            committedHypothesis: request.hypothesis,
            deterministicSimulation: simulation,
            hypothesisComparison: comparison,
          }),
        },
      ],
      text: {
        format: zodTextFormat(MissionDebriefSchema, "mission_debrief"),
        verbosity: "medium",
      },
    });

    const debrief = MissionDebriefSchema.parse(response.output_parsed);

    return MissionInstructorResponseSchema.parse({
      source: "gpt-5.6",
      model: response.model,
      fallbackReason: null,
      debrief,
    });
  } catch {
    return MissionInstructorResponseSchema.parse({
      source: "local-fallback",
      model: null,
      fallbackReason:
        "The GPT-5.6 request failed or returned an invalid response.",
      debrief: fallback,
    });
  }
}

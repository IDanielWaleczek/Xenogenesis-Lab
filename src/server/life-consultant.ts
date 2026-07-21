import "server-only";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import { buildLocalLifeConsultant, buildValidatedExperimentContext } from "@/domain/simulator/consultant";
import {
  LifeConsultantContentSchema,
  LifeConsultantRequestSchema,
  LifeConsultantResponseSchema,
} from "@/domain/simulator/schema";
import type { LifeConsultantResponse } from "@/domain/simulator/schema";
import { hashSimulationState, runSurvivalSimulation } from "@/domain/simulator/simulate";

const LIFE_CONSULTANT_MODEL = "gpt-5.6-luna";
const LIFE_CONSULTANT_MAX_OUTPUT_TOKENS = 1_200;
const responseCache = new Map<string, LifeConsultantResponse>();

/** Returns one cached, validated scientific interpretation for a stable simulation state. */
export async function createLifeConsultantResponse(rawRequest: unknown) {
  const request = LifeConsultantRequestSchema.parse(rawRequest);
  const simulation = runSurvivalSimulation(request.simulation);
  const cacheKey = hashSimulationState({
    language: request.language,
    simulation: request.simulation,
    result: simulation,
  });
  const cached = responseCache.get(cacheKey);
  if (cached) return cached;

  const fallback = buildLocalLifeConsultant(
    request.language,
    request.simulation,
    simulation,
  );
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const response = LifeConsultantResponseSchema.parse({
      source: "local-fallback",
      model: null,
      fallbackReason: "OPENAI_API_KEY is not configured on the server.",
      cacheKey,
      content: fallback,
    });
    responseCache.set(cacheKey, response);
    return response;
  }

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.responses.parse({
      model: LIFE_CONSULTANT_MODEL,
      reasoning: { effort: "low" },
      store: false,
      max_output_tokens: LIFE_CONSULTANT_MAX_OUTPUT_TOKENS,
      input: [
        {
          role: "system",
          content:
            "You are the Xenogenesis Lab scientific consultant. Explain only the supplied deterministic planet, trait tradeoffs, regional scores, survival outcome, and population model. Never invent or alter simulation values or reveal hidden thresholds. Be concise and recommend one controlled experiment. For imageDirection, choose only the structured art-direction options that best present the supplied result; do not add anatomy or simulation facts. Return every user-visible string field, including organismName and all insight strings, entirely in the requested language. When responseLanguage is Polish, write natural Polish only; do not return English prose. Complete every field required by the JSON schema.",
        },
        {
          role: "user",
          content: JSON.stringify({
            responseLanguage: request.language === "pl" ? "Polish" : "English",
            validatedExperiment: buildValidatedExperimentContext(request.simulation, simulation),
          }),
        },
      ],
      text: {
        format: zodTextFormat(LifeConsultantContentSchema, "life_consultant"),
        verbosity: "medium",
      },
    });
    const result = LifeConsultantResponseSchema.parse({
      source: "gpt-5.6",
      model: response.model,
      fallbackReason: null,
      cacheKey,
      content: LifeConsultantContentSchema.parse(response.output_parsed),
    });
    responseCache.set(cacheKey, result);
    return result;
  } catch {
    const response = LifeConsultantResponseSchema.parse({
      source: "local-fallback",
      model: null,
      fallbackReason: "The GPT-5.6 request failed or returned invalid output.",
      cacheKey,
      content: fallback,
    });
    responseCache.set(cacheKey, response);
    return response;
  }
}

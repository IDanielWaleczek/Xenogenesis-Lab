import "server-only";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import { buildLocalLifeConsultant } from "@/domain/simulator/consultant";
import {
  LifeConsultantContentSchema,
  LifeConsultantRequestSchema,
  LifeConsultantResponseSchema,
} from "@/domain/simulator/schema";
import type { LifeConsultantResponse } from "@/domain/simulator/schema";
import { hashSimulationState, runSurvivalSimulation } from "@/domain/simulator/simulate";

const LIFE_CONSULTANT_MODEL = "gpt-5.4-mini";
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
      reasoning: { effort: "none" },
      store: false,
      max_output_tokens: 300,
      input: [
        {
          role: "system",
          content:
            "You are the Xenogenesis Lab scientific consultant. Explain only the supplied deterministic planet, trait tradeoffs, regional scores, survival outcome, and population model. Never invent or alter simulation values, reveal hidden thresholds, or solve the mission. Be concise and recommend one controlled experiment. For imageDirection, choose only the structured art-direction options that best present the supplied result; do not add anatomy or simulation facts. Return prose in the requested language.",
        },
        {
          role: "user",
          content: JSON.stringify({
            responseLanguage: request.language === "pl" ? "Polish" : "English",
            planet: request.simulation.planet,
            selectedTraits: request.simulation.traitIds,
            deterministicResult: simulation,
          }),
        },
      ],
      text: {
        format: zodTextFormat(LifeConsultantContentSchema, "life_consultant"),
        verbosity: "medium",
      },
    });
    const result = LifeConsultantResponseSchema.parse({
      source: "gpt-5.4-mini",
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
      fallbackReason: "The GPT-5.4-mini request failed or returned invalid output.",
      cacheKey,
      content: fallback,
    });
    responseCache.set(cacheKey, response);
    return response;
  }
}

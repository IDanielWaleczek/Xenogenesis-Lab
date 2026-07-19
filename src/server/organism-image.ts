import "server-only";

import OpenAI from "openai";

import { buildControlledOrganismImagePrompt } from "@/domain/simulator/consultant";
import {
  OrganismImageRequestSchema,
  OrganismImageResponseSchema,
} from "@/domain/simulator/schema";
import type { OrganismImageResponse } from "@/domain/simulator/schema";
import { hashSimulationState, runSurvivalSimulation } from "@/domain/simulator/simulate";

import { createLifeConsultantResponse } from "./life-consultant";

const ORGANISM_IMAGE_MODEL = "gpt-image-2";
const imageCache = new Map<string, OrganismImageResponse>();

/** Generates one controlled organism illustration per stable planet and trait state. */
export async function createOrganismImageResponse(rawRequest: unknown) {
  const request = OrganismImageRequestSchema.parse(rawRequest);
  const simulation = runSurvivalSimulation(request.simulation);
  const consultant = await createLifeConsultantResponse(request);
  const cacheKey = hashSimulationState({
    simulation: request.simulation,
    result: simulation,
    consultant: consultant.cacheKey,
    model: ORGANISM_IMAGE_MODEL,
  });
  const cached = imageCache.get(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const response = OrganismImageResponseSchema.parse({
      source: "procedural-fallback",
      model: null,
      fallbackReason: "OPENAI_API_KEY is not configured on the server.",
      cacheKey,
      imageDataUrl: null,
      organismName: consultant.content.organismName,
      scientificDescription: consultant.content.scientificDescription,
    });
    imageCache.set(cacheKey, response);
    return response;
  }

  try {
    const openai = new OpenAI({ apiKey });
    const result = await openai.images.generate({
      model: ORGANISM_IMAGE_MODEL,
      prompt: buildControlledOrganismImagePrompt(
        request.simulation,
        simulation,
        consultant.content.imageDirection,
      ),
      size: "1024x1024",
      quality: "low",
      output_format: "jpeg",
    });
    const base64 = result.data?.[0]?.b64_json;
    if (!base64) throw new Error("Image generation returned no image data.");
    const response = OrganismImageResponseSchema.parse({
      source: "gpt-image-2",
      model: ORGANISM_IMAGE_MODEL,
      fallbackReason: null,
      cacheKey,
      imageDataUrl: `data:image/jpeg;base64,${base64}`,
      organismName: consultant.content.organismName,
      scientificDescription: consultant.content.scientificDescription,
    });
    imageCache.set(cacheKey, response);
    return response;
  } catch {
    const response = OrganismImageResponseSchema.parse({
      source: "procedural-fallback",
      model: null,
      fallbackReason: "The organism illustration request failed or returned invalid image data.",
      cacheKey,
      imageDataUrl: null,
      organismName: consultant.content.organismName,
      scientificDescription: consultant.content.scientificDescription,
    });
    imageCache.set(cacheKey, response);
    return response;
  }
}

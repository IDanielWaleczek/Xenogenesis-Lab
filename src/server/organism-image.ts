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

export type OrganismImageStreamEvent =
  | { type: "status"; stage: "preparing" | "rendering" }
  | { type: "partial"; imageDataUrl: string }
  | { type: "complete"; response: OrganismImageResponse };

const createProceduralFallback = (
  cacheKey: string,
  consultant: Awaited<ReturnType<typeof createLifeConsultantResponse>>,
  fallbackReason: string,
) => OrganismImageResponseSchema.parse({
  source: "procedural-fallback",
  model: null,
  fallbackReason,
  cacheKey,
  imageDataUrl: null,
  organismName: consultant.content.organismName,
  scientificDescription: consultant.content.scientificDescription,
});

/** Generates one controlled organism illustration per stable planet and trait state. */
export async function* streamOrganismImageResponse(rawRequest: unknown): AsyncGenerator<OrganismImageStreamEvent> {
  const request = OrganismImageRequestSchema.parse(rawRequest);
  const simulation = runSurvivalSimulation(request.simulation);
  yield { type: "status", stage: "preparing" };
  const consultant = await createLifeConsultantResponse(request);
  const cacheKey = hashSimulationState({
    simulation: request.simulation,
    result: simulation,
    consultant: consultant.cacheKey,
    model: ORGANISM_IMAGE_MODEL,
  });
  const cached = imageCache.get(cacheKey);
  if (cached) {
    yield { type: "complete", response: cached };
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const response = createProceduralFallback(cacheKey, consultant, "OPENAI_API_KEY is not configured on the server.");
    imageCache.set(cacheKey, response);
    yield { type: "complete", response };
    return;
  }

  try {
    const openai = new OpenAI({ apiKey });
    yield { type: "status", stage: "rendering" };
    const stream = await openai.images.generate({
      model: ORGANISM_IMAGE_MODEL,
      prompt: buildControlledOrganismImagePrompt(
        request.simulation,
        simulation,
        consultant.content,
      ),
      size: "1536x1024",
      quality: "low",
      output_format: "jpeg",
      stream: true,
      partial_images: 3,
    });
    for await (const event of stream) {
      if (event.type === "image_generation.partial_image") {
        yield { type: "partial", imageDataUrl: `data:image/jpeg;base64,${event.b64_json}` };
        continue;
      }
      const response = OrganismImageResponseSchema.parse({
        source: "gpt-image-2",
        model: ORGANISM_IMAGE_MODEL,
        fallbackReason: null,
        cacheKey,
        imageDataUrl: `data:image/jpeg;base64,${event.b64_json}`,
        organismName: consultant.content.organismName,
        scientificDescription: consultant.content.scientificDescription,
      });
      imageCache.set(cacheKey, response);
      yield { type: "complete", response };
      return;
    }
    throw new Error("Image generation stream ended without a final image.");
  } catch {
    const response = createProceduralFallback(cacheKey, consultant, "The organism illustration request failed or returned invalid image data.");
    imageCache.set(cacheKey, response);
    yield { type: "complete", response };
  }
}

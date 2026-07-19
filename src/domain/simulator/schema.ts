import { z } from "zod";

import { WorldParametersSchema } from "../world/schema";
import { SIMULATOR_CONVENTIONS } from "./coefficients";

/** Version of the continuous suitability and population model. */
export const SIMULATOR_VERSION = "1.0.0";

/** Meaningful traits available in the first lifeform designer. */
export const LifeTraitIdSchema = z.enum([
  "compactBody",
  "largeBody",
  "internalSkeleton",
  "exoskeleton",
  "aquaticMovement",
  "terrestrialMovement",
  "aerialMovement",
  "oxygenRespiration",
  "lowOxygenMetabolism",
  "anaerobicMetabolism",
  "photosynthesis",
  "chemosynthesis",
  "radiationResistance",
  "thermalInsulation",
  "heatResistance",
  "waterConservation",
  "pressureResistance",
  "regenerativeTissue",
  "hibernation",
  "visibleVision",
  "infraredVision",
  "echolocation",
  "chemicalSensing",
  "rapidReproduction",
  "protectedEggs",
  "liveBirth",
  "spores",
  "parentalInvestment",
  "simpleNeuralSystem",
  "socialCoordination",
  "toolUsePotential",
  "complexCommunication",
  "adaptiveLearning",
]);

/** Planet regions evaluated independently by the local model. */
export const RegionIdSchema = z.enum([
  "coastal",
  "equatorial",
  "polar",
  "deepOcean",
  "underground",
  "highAltitude",
]);

/** Continuous metrics exposed to learners and the consultant. */
export const SimulationMetricIdSchema = z.enum([
  "liquidWater",
  "atmosphere",
  "thermalStability",
  "radiationSafety",
  "biologicalEnergy",
  "metabolicViability",
  "organismCompatibility",
  "reproductionPotential",
  "populationStability",
  "ecosystemPotential",
  "advancedLifePotential",
]);

/** Deterministic seeded planet state. */
export const PlanetStateSchema = z
  .object({
    seed: z.string().trim().min(3).max(80),
    world: WorldParametersSchema,
  })
  .strict();

/** Validated organism trait selection. */
export const LifeTraitSelectionSchema = z
  .array(LifeTraitIdSchema)
  .min(3)
  .max(14)
  .refine(
    (values) => new Set(values).size === values.length,
    "Lifeform traits must not contain duplicates.",
  );

/** Request for one deterministic simulation run. */
export const SurvivalSimulationRequestSchema = z
  .object({
    missionId: z.literal("genesis-01"),
    planet: PlanetStateSchema,
    traitIds: LifeTraitSelectionSchema,
    initialPopulation: z.number().int().min(10).max(10_000).default(120),
  })
  .strict();

const ScoreSchema = z.number().finite().min(0).max(1);

/** Deterministic survival and population result. */
export const SurvivalSimulationResultSchema = z
  .object({
    missionId: z.literal("genesis-01"),
    simulatorVersion: z.literal("1.0.0"),
    stateHash: z.string().min(8),
    outcome: z.enum([
      "immediateExtinction",
      "temporarySurvival",
      "regionalRefuge",
      "stableSimplePopulation",
      "expandingPopulation",
      "unstableDominance",
      "stableMulticellularEcosystem",
      "advancedAdaptiveLife",
    ]),
    missionSuccess: z.boolean(),
    objectiveScore: ScoreSchema,
    metrics: z.record(SimulationMetricIdSchema, ScoreSchema),
    regionScores: z.record(RegionIdSchema, ScoreSchema),
    habitableRegions: z.array(RegionIdSchema),
    selectedTraitCost: z.number().int().min(0),
    energyBudget: z.number().int().min(1),
    carryingCapacity: z.number().int().min(0),
    peakPopulation: z.number().int().min(0),
    finalPopulation: z.number().int().min(0),
    populationTimeline: z
      .array(
        z
          .object({
            generation: z.number().int().min(0),
            population: z.number().int().min(0),
          })
          .strict(),
      )
      .length(SIMULATOR_CONVENTIONS.population.generations + 1),
    strengths: z.array(SimulationMetricIdSchema).max(4),
    limitingFactors: z.array(SimulationMetricIdSchema).max(4),
  })
  .strict();

/** Supported consultant response languages. */
export const SimulatorLanguageSchema = z.enum(["en", "pl"]);

/** Request accepted by the server-only scientific consultant. */
export const LifeConsultantRequestSchema = z
  .object({
    language: SimulatorLanguageSchema,
    simulation: SurvivalSimulationRequestSchema,
  })
  .strict();

/** Structured interpretation produced by GPT-5.4-mini or the local fallback. */
export const LifeConsultantContentSchema = z
  .object({
    organismName: z.string().trim().min(3).max(90),
    scientificDescription: z.string().trim().min(30).max(900),
    planetAssessment: z.string().trim().min(30).max(700),
    traitAssessment: z.string().trim().min(30).max(700),
    insights: z.array(z.string().trim().min(12).max(260)).min(2).max(4),
    suggestedExperiment: z.string().trim().min(20).max(400),
    imageDirection: z
      .object({
        pose: z.enum(["resting", "foraging", "moving", "social"]),
        viewpoint: z.enum(["field-profile", "three-quarter", "environment-wide"]),
        lighting: z.enum(["diffuse", "low-angle", "backlit"]),
        emphasis: z.enum(["anatomy", "adaptation", "habitat"]),
      })
      .strict(),
  })
  .strict();

/** Provenance-preserving consultant response. */
export const LifeConsultantResponseSchema = z
  .object({
    source: z.enum(["gpt-5.4-mini", "local-fallback"]),
    model: z.string().min(1).nullable(),
    fallbackReason: z.string().min(1).nullable(),
    cacheKey: z.string().min(8),
    content: LifeConsultantContentSchema,
  })
  .strict();

/** Request for an optional AI-generated organism field illustration. */
export const OrganismImageRequestSchema = LifeConsultantRequestSchema;

/** Image-generation response with an honest procedural fallback. */
export const OrganismImageResponseSchema = z
  .object({
    source: z.enum(["gpt-image-2", "procedural-fallback"]),
    model: z.string().min(1).nullable(),
    fallbackReason: z.string().min(1).nullable(),
    cacheKey: z.string().min(8),
    imageDataUrl: z.string().startsWith("data:image/").nullable(),
    organismName: z.string().min(3),
    scientificDescription: z.string().min(30),
  })
  .strict();

export type LifeTraitId = z.infer<typeof LifeTraitIdSchema>;
export type RegionId = z.infer<typeof RegionIdSchema>;
export type SimulationMetricId = z.infer<typeof SimulationMetricIdSchema>;
export type PlanetState = z.infer<typeof PlanetStateSchema>;
export type SurvivalSimulationRequest = z.infer<typeof SurvivalSimulationRequestSchema>;
export type SurvivalSimulationResult = z.infer<typeof SurvivalSimulationResultSchema>;
export type SimulatorLanguage = z.infer<typeof SimulatorLanguageSchema>;
export type LifeConsultantContent = z.infer<typeof LifeConsultantContentSchema>;
export type LifeConsultantResponse = z.infer<typeof LifeConsultantResponseSchema>;
export type OrganismImageResponse = z.infer<typeof OrganismImageResponseSchema>;

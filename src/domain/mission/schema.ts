import { z } from "zod";

import { WorldParametersSchema } from "../world/schema";

/** Stable identifiers for the single mission's deterministic pressure rules. */
export const PressureIdSchema = z.enum([
  "highGravity",
  "thermalRange",
  "radiationExposure",
  "limitedWater",
]);

/** Stable identifiers for adaptations learners may predict. */
export const AdaptationIdSchema = z.enum([
  "compactBody",
  "reinforcedSupport",
  "thermalBuffering",
  "radiationProtection",
  "cellularRepair",
  "waterConservation",
  "protectedReproduction",
  "aerialFlight",
  "permeableSkin",
]);

/** Supported interface and instructor-response languages. */
export const MissionLanguageSchema = z.enum(["en", "pl"]);

/** The fixed, validated mission definition used by the MVP training loop. */
export const MissionDefinitionSchema = z
  .object({
    id: z.literal("vespera-01"),
    rulesetVersion: z.literal("0.2.0"),
    world: WorldParametersSchema,
  })
  .strict();

/** A learner prediction captured before deterministic results are revealed. */
export const HypothesisSchema = z
  .object({
    adaptationIds: z
      .array(AdaptationIdSchema)
      .min(1)
      .max(6)
      .refine(
        (values) => new Set(values).size === values.length,
        "Predicted adaptations must not contain duplicates.",
      ),
    reasoning: z.string().trim().min(20).max(800),
  })
  .strict();

/** A committed hypothesis tied to the mission and submission time. */
export const CommittedHypothesisSchema = HypothesisSchema.extend({
  missionId: z.literal("vespera-01"),
  committedAt: z.string().datetime(),
}).strict();

/** A model convention triggered by validated environmental input. */
export const EnvironmentalPressureSchema = z
  .object({
    id: PressureIdSchema,
    severity: z.enum(["moderate", "high"]),
    observedValue: z.number().finite(),
    thresholdValue: z.number().finite(),
    unit: z.string().min(1),
    adaptationIds: z.array(AdaptationIdSchema).min(1),
  })
  .strict();

/** An adaptation candidate derived from one or more deterministic pressures. */
export const AdaptationCandidateSchema = z
  .object({
    id: AdaptationIdSchema,
    confidence: z.enum(["supported", "stronglySupported"]),
    pressureIds: z.array(PressureIdSchema).min(1),
  })
  .strict();

/** Reproducible result emitted by ruleset 0.2.0. */
export const SimulationResultSchema = z
  .object({
    missionId: z.literal("vespera-01"),
    rulesetVersion: z.literal("0.2.0"),
    viability: z.literal("conditionallyPlausibleComplexLife"),
    normalizedFacts: z
      .object({
        oxygenPartialPressureAtm: z.number().finite(),
        minimumTemperatureC: z.number().finite(),
        maximumTemperatureC: z.number().finite(),
        radiationDoseRateMilliSvPerHour: z.number().finite(),
      })
      .strict(),
    pressures: z.array(EnvironmentalPressureSchema),
    adaptationCandidates: z.array(AdaptationCandidateSchema),
  })
  .strict();

/** Comparison between the committed prediction and deterministic candidates. */
export const HypothesisComparisonSchema = z
  .object({
    supportedPredictions: z.array(AdaptationIdSchema),
    missedAdaptations: z.array(AdaptationIdSchema),
    unsupportedPredictions: z.array(AdaptationIdSchema),
    alignmentPercent: z.number().int().min(0).max(100),
  })
  .strict();

/** Request accepted by the server-only Mission Instructor boundary. */
export const MissionInstructorRequestSchema = z
  .object({
    language: MissionLanguageSchema,
    hypothesis: CommittedHypothesisSchema,
  })
  .strict();

/** Structured educational output accepted from GPT-5.6 or the local fallback. */
export const MissionDebriefSchema = z
  .object({
    assessment: z.string().trim().min(20).max(900),
    evidence: z.array(z.string().trim().min(8).max(300)).min(2).max(4),
    tradeOffs: z.array(z.string().trim().min(8).max(300)).min(1).max(3),
    followUpQuestion: z.string().trim().min(10).max(300),
    recommendedExperiment: z.string().trim().min(10).max(400),
  })
  .strict();

/** Provenance-preserving response returned to the client. */
export const MissionInstructorResponseSchema = z
  .object({
    source: z.enum(["gpt-5.6", "local-fallback"]),
    model: z.string().min(1).nullable(),
    fallbackReason: z.string().min(1).nullable(),
    debrief: MissionDebriefSchema,
  })
  .strict();

/** Evidence-based revision submitted after the debrief. */
export const MissionRevisionSchema = z
  .object({
    reasoning: z.string().trim().min(20).max(800),
    evidencePressureIds: z
      .array(PressureIdSchema)
      .min(1)
      .refine(
        (values) => new Set(values).size === values.length,
        "Evidence pressure identifiers must not contain duplicates.",
      ),
  })
  .strict();

/** Session-only learning progress calculated from completed mission behavior. */
export const CompetencyProgressSchema = z
  .object({
    missionsCompleted: z.literal(1),
    hypothesisFormation: z.number().int().min(0).max(100),
    adaptationAnalysis: z.number().int().min(0).max(100),
    evidenceUse: z.number().int().min(0).max(100),
    certificationStage: z.literal("candidate"),
  })
  .strict();

export type PressureId = z.infer<typeof PressureIdSchema>;
export type AdaptationId = z.infer<typeof AdaptationIdSchema>;
export type MissionLanguage = z.infer<typeof MissionLanguageSchema>;
export type MissionDefinition = z.infer<typeof MissionDefinitionSchema>;
export type Hypothesis = z.infer<typeof HypothesisSchema>;
export type CommittedHypothesis = z.infer<typeof CommittedHypothesisSchema>;
export type SimulationResult = z.infer<typeof SimulationResultSchema>;
export type HypothesisComparison = z.infer<typeof HypothesisComparisonSchema>;
export type MissionDebrief = z.infer<typeof MissionDebriefSchema>;
export type MissionInstructorResponse = z.infer<typeof MissionInstructorResponseSchema>;
export type MissionRevision = z.infer<typeof MissionRevisionSchema>;
export type CompetencyProgress = z.infer<typeof CompetencyProgressSchema>;

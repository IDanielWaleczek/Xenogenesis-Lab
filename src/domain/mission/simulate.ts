import { normalizeWorldParameters } from "../world/schema";
import type { WorldParameters } from "../world/schema";
import {
  HypothesisComparisonSchema,
  SimulationResultSchema,
} from "./schema";
import type {
  AdaptationId,
  CommittedHypothesis,
  HypothesisComparison,
  PressureId,
  SimulationResult,
} from "./schema";

/** Named ruleset constants are educational model conventions, not universal biological limits. */
export const MISSION_RULES = {
  version: "0.2.0",
  highGravityThresholdG: 1.5,
  coldStressThresholdC: 0,
  heatStressThresholdC: 40,
  elevatedRadiationThresholdMilliSvPerHour: 0.1,
  limitedWaterThreshold: 0.4,
} as const;

type PressureDefinition = {
  id: PressureId;
  severity: "moderate" | "high";
  observedValue: number;
  thresholdValue: number;
  unit: string;
  adaptationIds: AdaptationId[];
};

/** Runs the deterministic ruleset for the fixed mission world. */
export function simulateMission(world: WorldParameters): SimulationResult {
  const normalized = normalizeWorldParameters(world);
  const pressures: PressureDefinition[] = [];

  if (normalized.gravityG >= MISSION_RULES.highGravityThresholdG) {
    pressures.push({
      id: "highGravity",
      severity: normalized.gravityG >= 2 ? "high" : "moderate",
      observedValue: normalized.gravityG,
      thresholdValue: MISSION_RULES.highGravityThresholdG,
      unit: "g",
      adaptationIds: ["compactBody", "reinforcedSupport"],
    });
  }

  if (
    normalized.temperatureRangeC.minimum <= MISSION_RULES.coldStressThresholdC ||
    normalized.temperatureRangeC.maximum >= MISSION_RULES.heatStressThresholdC
  ) {
    pressures.push({
      id: "thermalRange",
      severity:
        normalized.temperatureRangeC.minimum <= -20 ||
        normalized.temperatureRangeC.maximum >= 60
          ? "high"
          : "moderate",
      observedValue: normalized.temperatureVariationC,
      thresholdValue: MISSION_RULES.heatStressThresholdC,
      unit: "±°C",
      adaptationIds: ["thermalBuffering"],
    });
  }

  if (
    normalized.radiationDoseRateMilliSvPerHour >=
    MISSION_RULES.elevatedRadiationThresholdMilliSvPerHour
  ) {
    pressures.push({
      id: "radiationExposure",
      severity:
        normalized.radiationDoseRateMilliSvPerHour >= 1 ? "high" : "moderate",
      observedValue: normalized.radiationDoseRateMilliSvPerHour,
      thresholdValue: MISSION_RULES.elevatedRadiationThresholdMilliSvPerHour,
      unit: "mSv/h",
      adaptationIds: ["radiationProtection", "cellularRepair"],
    });
  }

  if (normalized.waterAvailability <= MISSION_RULES.limitedWaterThreshold) {
    pressures.push({
      id: "limitedWater",
      severity: normalized.waterAvailability <= 0.2 ? "high" : "moderate",
      observedValue: normalized.waterAvailability,
      thresholdValue: MISSION_RULES.limitedWaterThreshold,
      unit: "relative",
      adaptationIds: ["waterConservation", "protectedReproduction"],
    });
  }

  const adaptationMap = new Map<AdaptationId, PressureId[]>();
  for (const pressure of pressures) {
    for (const adaptationId of pressure.adaptationIds) {
      adaptationMap.set(adaptationId, [
        ...(adaptationMap.get(adaptationId) ?? []),
        pressure.id,
      ]);
    }
  }

  return SimulationResultSchema.parse({
    missionId: "vespera-01",
    rulesetVersion: MISSION_RULES.version,
    viability: "conditionallyPlausibleComplexLife",
    normalizedFacts: {
      oxygenPartialPressureAtm: normalized.oxygenPartialPressureAtm,
      minimumTemperatureC: normalized.temperatureRangeC.minimum,
      maximumTemperatureC: normalized.temperatureRangeC.maximum,
      radiationDoseRateMilliSvPerHour:
        normalized.radiationDoseRateMilliSvPerHour,
    },
    pressures,
    adaptationCandidates: [...adaptationMap.entries()].map(
      ([id, pressureIds]) => ({
        id,
        confidence:
          pressureIds.length > 1 ? "stronglySupported" : "supported",
        pressureIds,
      }),
    ),
  });
}

/** Compares the committed prediction with deterministic adaptation candidates. */
export function compareHypothesis(
  hypothesis: CommittedHypothesis,
  result: SimulationResult,
): HypothesisComparison {
  const expected = result.adaptationCandidates.map(({ id }) => id);
  const predicted = hypothesis.adaptationIds;
  const supportedPredictions = predicted.filter((id) => expected.includes(id));
  const missedAdaptations = expected.filter((id) => !predicted.includes(id));
  const unsupportedPredictions = predicted.filter((id) => !expected.includes(id));
  const precision = supportedPredictions.length / predicted.length;
  const recall = supportedPredictions.length / expected.length;
  const alignmentPercent =
    precision + recall === 0
      ? 0
      : Math.round((2 * precision * recall * 100) / (precision + recall));

  return HypothesisComparisonSchema.parse({
    supportedPredictions,
    missedAdaptations,
    unsupportedPredictions,
    alignmentPercent,
  });
}

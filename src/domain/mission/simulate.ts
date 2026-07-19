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

/** Runs the deterministic ruleset for a validated mission world or learner variant. */
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
      gravityG: normalized.gravityG,
      atmosphericPressureAtm: normalized.atmosphericPressureAtm,
      oxygenPartialPressureAtm: normalized.oxygenPartialPressureAtm,
      minimumTemperatureC: normalized.temperatureRangeC.minimum,
      maximumTemperatureC: normalized.temperatureRangeC.maximum,
      radiationDoseRateMilliSvPerHour:
        normalized.radiationDoseRateMilliSvPerHour,
      lightLevel: normalized.lightLevel,
      waterAvailability: normalized.waterAvailability,
      atmosphericDensityKgM3: normalized.atmosphericDensityKgM3 ?? null,
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
  const expectedPressures = result.pressures.map(({ id }) => id);
  const predictedPressures = hypothesis.pressureIds;
  const supportedPressurePredictions = predictedPressures.filter((id) =>
    expectedPressures.includes(id),
  );
  const missedPressures = expectedPressures.filter(
    (id) => !predictedPressures.includes(id),
  );
  const unsupportedPressurePredictions = predictedPressures.filter(
    (id) => !expectedPressures.includes(id),
  );
  const supportedPredictions = predicted.filter((id) => expected.includes(id));
  const missedAdaptations = expected.filter((id) => !predicted.includes(id));
  const unsupportedPredictions = predicted.filter((id) => !expected.includes(id));
  const calculateF1 = (matches: number, predictedCount: number, expectedCount: number) => {
    if (predictedCount === 0 && expectedCount === 0) return 1;
    if (predictedCount === 0 || expectedCount === 0) return 0;
    const precision = matches / predictedCount;
    const recall = matches / expectedCount;
    return precision + recall === 0
      ? 0
      : (2 * precision * recall) / (precision + recall);
  };
  const adaptationScore = calculateF1(
    supportedPredictions.length,
    predicted.length,
    expected.length,
  );
  const pressureScore = calculateF1(
    supportedPressurePredictions.length,
    predictedPressures.length,
    expectedPressures.length,
  );
  const alignmentPercent = Math.round((adaptationScore + pressureScore) * 50);

  return HypothesisComparisonSchema.parse({
    supportedPressurePredictions,
    missedPressures,
    unsupportedPressurePredictions,
    supportedPredictions,
    missedAdaptations,
    unsupportedPredictions,
    alignmentPercent,
  });
}

import { describe, expect, it } from "vitest";

import {
  buildLocalDebrief,
  calculateCompetencyProgress,
} from "./debrief";
import { VESPERA_MISSION } from "./mission";
import type { CommittedHypothesis } from "./schema";
import {
  MISSION_RULES,
  compareHypothesis,
  simulateMission,
} from "./simulate";
import { derivePlanetVisualState } from "./visualization";

/** Builds a committed hypothesis for comparison and progress tests. */
function createHypothesis(
  adaptationIds: CommittedHypothesis["adaptationIds"],
): CommittedHypothesis {
  return {
    missionId: "vespera-01",
    committedAt: "2026-07-19T09:00:00.000Z",
    world: VESPERA_MISSION.world,
    pressureIds: [
      "highGravity",
      "thermalRange",
      "radiationExposure",
      "limitedWater",
    ],
    adaptationIds,
    strategy: "surfaceConservation",
  };
}

describe("simulateMission", () => {
  it("produces the same validated result for identical mission input", () => {
    const first = simulateMission(VESPERA_MISSION.world);
    const second = simulateMission(VESPERA_MISSION.world);

    expect(second).toEqual(first);
    expect(first.rulesetVersion).toBe("0.2.0");
  });

  it("derives all four documented pressures for the Vespera mission", () => {
    const result = simulateMission(VESPERA_MISSION.world);

    expect(result.pressures.map(({ id }) => id)).toEqual([
      "highGravity",
      "thermalRange",
      "radiationExposure",
      "limitedWater",
    ]);
    expect(result.normalizedFacts).toEqual({
      gravityG: 1.7,
      atmosphericPressureAtm: 1.2,
      oxygenPartialPressureAtm: 0.252,
      minimumTemperatureC: -6,
      maximumTemperatureC: 42,
      radiationDoseRateMilliSvPerHour: 0.4,
      lightLevel: 0.62,
      waterAvailability: 0.38,
      atmosphericDensityKgM3: expect.any(Number),
    });
  });

  it("applies the named high-gravity convention at its boundary", () => {
    const below = simulateMission({
      ...VESPERA_MISSION.world,
      gravityG: MISSION_RULES.highGravityThresholdG - 0.01,
    });
    const atThreshold = simulateMission({
      ...VESPERA_MISSION.world,
      gravityG: MISSION_RULES.highGravityThresholdG,
    });

    expect(below.pressures.some(({ id }) => id === "highGravity")).toBe(false);
    expect(atThreshold.pressures.some(({ id }) => id === "highGravity")).toBe(true);
  });
});

describe("mission learning loop", () => {
  it("compares a committed hypothesis with calculated adaptations", () => {
    const result = simulateMission(VESPERA_MISSION.world);
    const comparison = compareHypothesis(
      createHypothesis(["compactBody", "waterConservation", "aerialFlight"]),
      result,
    );

    expect(comparison.supportedPredictions).toEqual([
      "compactBody",
      "waterConservation",
    ]);
    expect(comparison.unsupportedPredictions).toEqual(["aerialFlight"]);
    expect(comparison.supportedPressurePredictions).toHaveLength(4);
    expect(comparison.alignmentPercent).toBe(70);
  });

  it("handles a variant with no triggered pressure without invalid scores", () => {
    const world = {
      ...VESPERA_MISSION.world,
      gravityG: 1,
      averageTemperatureC: 20,
      temperatureVariationC: 5,
      radiationDoseRate: { value: 0.01, unit: "mSv/h" as const },
      waterAvailability: 0.8,
    };
    const result = simulateMission(world);
    const hypothesis = {
      ...createHypothesis(["compactBody"]),
      world,
      pressureIds: ["highGravity" as const],
    };
    const comparison = compareHypothesis(hypothesis, result);

    expect(result.pressures).toHaveLength(0);
    expect(comparison.alignmentPercent).toBe(0);
  });

  it("returns valid and explicitly local debriefs in both languages", () => {
    const result = simulateMission(VESPERA_MISSION.world);
    const comparison = compareHypothesis(
      createHypothesis(["compactBody", "waterConservation"]),
      result,
    );

    const english = buildLocalDebrief("en", comparison, result);
    const polish = buildLocalDebrief("pl", comparison, result);

    expect(english.assessment).toContain("not a GPT-5.6 response");
    expect(polish.assessment).toContain("nie odpowiedź GPT-5.6");
    expect(english.evidence).toHaveLength(4);
    expect(polish.evidence).toHaveLength(4);
  });

  it("calculates progress from prediction alignment and selected evidence", () => {
    const result = simulateMission(VESPERA_MISSION.world);
    const comparison = compareHypothesis(
      createHypothesis(["compactBody", "waterConservation"]),
      result,
    );
    const progress = calculateCompetencyProgress(
      comparison,
      {
        conclusion: "changeAdaptations",
        evidencePressureIds: ["thermalRange", "limitedWater"],
      },
      result,
    );

    expect(progress.missionsCompleted).toBe(1);
    expect(progress.hypothesisFormation).toBe(comparison.alignmentPercent);
    expect(progress.evidenceUse).toBe(75);
  });
});

describe("derivePlanetVisualState", () => {
  it("changes visual channels when the learner changes world inputs", () => {
    const baseline = derivePlanetVisualState(VESPERA_MISSION.world);
    const variant = derivePlanetVisualState({
      ...VESPERA_MISSION.world,
      gravityG: 3,
      atmosphericPressureAtm: 4,
      averageTemperatureC: 70,
      temperatureVariationC: 50,
      radiationDoseRate: { value: 4, unit: "mSv/h" },
      lightLevel: 0.1,
      waterAvailability: 0.8,
      habitat: "deep ocean",
      shieldingColumnMassKgM2: 1_000,
      geochemicalEnergyAvailability: "high",
      electronAcceptors: ["sulfate"],
    });

    expect(variant.gravityScaleY).not.toBe(baseline.gravityScaleY);
    expect(variant.atmosphereScale).not.toBe(baseline.atmosphereScale);
    expect(variant.terrainHue).not.toBe(baseline.terrainHue);
    expect(variant.thermalContrast).not.toBe(baseline.thermalContrast);
    expect(variant.radiationActivity).not.toBe(baseline.radiationActivity);
    expect(variant.illumination).not.toBe(baseline.illumination);
    expect(variant.waterCoverage).not.toBe(baseline.waterCoverage);
    expect(variant.shieldingVisibility).not.toBe(baseline.shieldingVisibility);
    expect(variant.chemistryGlow).not.toBe(baseline.chemistryGlow);
    expect(variant.surfaceBrightness).not.toBe(baseline.surfaceBrightness);
    expect(variant.surfaceDetail).not.toBe(baseline.surfaceDetail);
    expect(variant.habitat).toBe("deep ocean");
  });

  it("uses temperature and accessible water for a non-scientific ice-cap treatment", () => {
    const warmDry = derivePlanetVisualState(VESPERA_MISSION.world);
    const coldWet = derivePlanetVisualState({
      ...VESPERA_MISSION.world,
      averageTemperatureC: -30,
      waterAvailability: 0.9,
      habitat: "ice surface",
    });

    expect(coldWet.iceCoverage).toBeGreaterThan(warmDry.iceCoverage);
    expect(coldWet.iceCoverage).toBeGreaterThan(0);
  });

  it("maps atmosphere chemistry and electron-acceptor choices to visual feedback", () => {
    const baseline = derivePlanetVisualState(VESPERA_MISSION.world);
    const inertVariant = derivePlanetVisualState({
      ...VESPERA_MISSION.world,
      atmosphereComposition: {
        ...VESPERA_MISSION.world.atmosphereComposition,
        nitrogenFraction: 0.6906,
        inertGasFraction: 0.099,
      },
    });
    const nitrateVariant = derivePlanetVisualState({
      ...VESPERA_MISSION.world,
      geochemicalEnergyAvailability: "moderate",
      electronAcceptors: ["nitrate"],
    });
    const ironVariant = derivePlanetVisualState({
      ...VESPERA_MISSION.world,
      geochemicalEnergyAvailability: "moderate",
      electronAcceptors: ["ferricIron"],
    });

    expect(inertVariant.atmosphereHue).not.toBe(baseline.atmosphereHue);
    expect(ironVariant.chemistryGlow).toBeGreaterThan(nitrateVariant.chemistryGlow);
  });
});

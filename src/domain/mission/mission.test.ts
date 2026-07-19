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

/** Builds a committed hypothesis for comparison and progress tests. */
function createHypothesis(
  adaptationIds: CommittedHypothesis["adaptationIds"],
): CommittedHypothesis {
  return {
    missionId: "vespera-01",
    committedAt: "2026-07-19T09:00:00.000Z",
    adaptationIds,
    reasoning:
      "The organism should remain compact and conserve water because gravity and surface water availability are limiting.",
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
      oxygenPartialPressureAtm: 0.252,
      minimumTemperatureC: -6,
      maximumTemperatureC: 42,
      radiationDoseRateMilliSvPerHour: 0.4,
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
    expect(comparison.alignmentPercent).toBe(40);
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
        reasoning:
          "The calculated thermal range adds buffering to my revised organism design.",
        evidencePressureIds: ["thermalRange", "limitedWater"],
      },
      result,
    );

    expect(progress.missionsCompleted).toBe(1);
    expect(progress.hypothesisFormation).toBe(comparison.alignmentPercent);
    expect(progress.evidenceUse).toBe(75);
  });
});

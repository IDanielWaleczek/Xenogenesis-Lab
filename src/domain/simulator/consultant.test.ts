import { describe, expect, it } from "vitest";

import { buildLocalLifeConsultant } from "./consultant";
import { GENESIS_MISSION } from "./mission";
import type { LifeTraitId, SurvivalSimulationRequest } from "./schema";
import { runSurvivalSimulation } from "./simulate";

const TRAITS: LifeTraitId[] = [
  "compactBody",
  "internalSkeleton",
  "terrestrialMovement",
  "lowOxygenMetabolism",
  "photosynthesis",
  "radiationResistance",
  "protectedEggs",
  "socialCoordination",
];

const REQUEST: SurvivalSimulationRequest = {
  missionId: GENESIS_MISSION.id,
  planet: GENESIS_MISSION.planet,
  traitIds: TRAITS,
  initialPopulation: 120,
};

describe("local life consultant", () => {
  it("translates deterministic outcome, metric, and region identifiers into Polish", () => {
    const result = runSurvivalSimulation(REQUEST);
    const content = buildLocalLifeConsultant("pl", REQUEST, result);
    const renderedCopy = [
      content.scientificDescription,
      content.planetAssessment,
      content.traitAssessment,
      ...content.insights,
      content.suggestedExperiment,
    ].join(" ");

    expect(content.organismName).toMatch(/^Ksenotyp /);
    expect(content.scientificDescription).toContain("Model przewiduje wynik");
    expect(renderedCopy).not.toContain(result.outcome);

    for (const internalId of [
      ...result.strengths,
      ...result.limitingFactors,
      ...result.habitableRegions,
    ]) {
      expect(renderedCopy).not.toMatch(new RegExp(`\\b${internalId}\\b`));
    }
  });
});

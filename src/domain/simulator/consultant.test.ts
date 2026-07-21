import { describe, expect, it } from "vitest";

import { buildControlledOrganismImagePrompt, buildLocalLifeConsultant, buildValidatedExperimentContext } from "./consultant";
import { BASELINE_PLANET } from "./baseline";
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
  planet: BASELINE_PLANET,
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
    expect(content.scientificDescription).toContain(
      "To lokalny odczyt danych eksperymentu",
    );
    expect(renderedCopy).not.toContain(result.outcome);

    for (const internalId of [
      ...result.strengths,
      ...result.limitingFactors,
      ...result.habitableRegions,
    ]) {
      expect(renderedCopy).not.toMatch(new RegExp(`\\b${internalId}\\b`));
    }
  });

  it("builds the image prompt from every validated planet input, trait, survivability, and top region", () => {
    const result = runSurvivalSimulation(REQUEST);
    const context = buildValidatedExperimentContext(REQUEST, result);
    const prompt = buildControlledOrganismImagePrompt(REQUEST, result, {
      imageDirection: {
      pose: "moving",
      viewpoint: "environment-wide",
      lighting: "diffuse",
      emphasis: "habitat",
      },
      imageBrief: "A sparse documentary composition of the configured specimen.",
    });

    for (const parameterName of Object.keys(context.planet.parameters)) {
      expect(prompt).toContain(parameterName);
    }
    for (const traitId of TRAITS) {
      expect(prompt).toContain(traitId);
    }
    expect(prompt).toContain("Validated survivability: 0%");
    expect(prompt).toContain(`Top regional survivability: ${context.topRegionalSurvivability.region}`);
    expect(prompt).toContain("dead, intact specimen");
    expect(prompt).toContain("This is an airless barren world");
    expect(prompt).toContain("Do not show an atmosphere");
    expect(prompt).toContain("no atmospheric scattering or backlight");
  });

  it("requires an incandescent surface for a planet at 804 C", () => {
    const request: SurvivalSimulationRequest = {
      ...REQUEST,
      planet: {
        ...REQUEST.planet,
        world: {
          ...REQUEST.planet.world,
          averageTemperatureC: 804,
          temperatureVariationC: 0,
        },
      },
    };
    const result = runSurvivalSimulation(request);
    const prompt = buildControlledOrganismImagePrompt(request, result, {
      imageDirection: {
      pose: "resting",
      viewpoint: "field-profile",
      lighting: "diffuse",
      emphasis: "habitat",
      },
      imageBrief: "A sparse documentary composition of the configured specimen.",
    });

    expect(prompt).toContain("804 to 804 °C");
    expect(prompt).toContain("incandescent, heat-ravaged rocky landscape");
    expect(prompt).toContain("Do not show Earth-like soil, grass, forests");
  });
});

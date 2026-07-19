import { describe, expect, it } from "vitest";

import { GENESIS_MISSION } from "./mission";
import type { LifeTraitId, PlanetState, SurvivalSimulationRequest } from "./schema";
import { PlanetStateSchema } from "./schema";
import { runSurvivalSimulation } from "./simulate";
import { calculateTraitCost, hasTraitConflict, LIFE_ENERGY_BUDGET } from "./traits";

const BASELINE_TRAITS: LifeTraitId[] = [
  "compactBody",
  "internalSkeleton",
  "terrestrialMovement",
  "lowOxygenMetabolism",
  "photosynthesis",
  "radiationResistance",
  "protectedEggs",
  "socialCoordination",
];

/** Produces a validated planet variant without mutating the mission baseline. */
function planetVariant(
  worldPatch: Partial<PlanetState["world"]>,
): PlanetState {
  return PlanetStateSchema.parse({
    ...GENESIS_MISSION.planet,
    world: { ...GENESIS_MISSION.planet.world, ...worldPatch },
  });
}

/** Produces a valid simulator request for focused deterministic tests. */
function request(
  planet = GENESIS_MISSION.planet,
  traitIds = BASELINE_TRAITS,
): SurvivalSimulationRequest {
  return {
    missionId: "genesis-01",
    planet,
    traitIds,
    initialPopulation: 120,
  };
}

describe("continuous survival simulator", () => {
  it("returns identical results and hashes for identical input", () => {
    const first = runSurvivalSimulation(request());
    const second = runSurvivalSimulation(request());

    expect(second).toEqual(first);
    expect(first.stateHash).toMatch(/^xl-[0-9a-f]{8}$/);
    expect(first.populationTimeline).toHaveLength(41);
    expect(first.populationTimeline[0]).toEqual({ generation: 0, population: 120 });
  });

  it("supports an advanced aerobic surface strategy without a hidden exact solution", () => {
    const temperateWorld = planetVariant({
      gravityG: 1,
      atmosphericPressureAtm: 1,
      atmosphereComposition: {
        oxygenFraction: 0.21,
        carbonDioxideFraction: 0.012,
        nitrogenFraction: 0.763,
        inertGasFraction: 0.015,
        toxicGasFraction: 0,
      },
      averageTemperatureC: 18,
      temperatureVariationC: 12,
      radiationDoseRate: { value: 0.05, unit: "mSv/h" },
      lightLevel: 0.95,
      waterAvailability: 0.65,
      humidity: 0.62,
      magneticFieldStrengthEarth: 1,
    });
    const traits: LifeTraitId[] = [
      "internalSkeleton",
      "terrestrialMovement",
      "oxygenRespiration",
      "photosynthesis",
      "protectedEggs",
      "socialCoordination",
      "toolUsePotential",
      "adaptiveLearning",
    ];
    const result = runSurvivalSimulation(request(temperateWorld, traits));

    expect(calculateTraitCost(traits)).toBeLessThanOrEqual(LIFE_ENERGY_BUDGET);
    expect(result.missionSuccess).toBe(true);
    expect(result.outcome).toMatch(/advanced|stableMulticellular/i);
    expect(result.finalPopulation).toBeGreaterThan(1_000);
  });

  it("allows a distinct regional aquatic strategy in a low-light, low-oxygen world", () => {
    const oceanWorld = planetVariant({
      gravityG: 1.5,
      atmosphericPressureAtm: 2.1,
      atmosphereComposition: {
        oxygenFraction: 0.04,
        carbonDioxideFraction: 0.035,
        nitrogenFraction: 0.91,
        inertGasFraction: 0.015,
        toxicGasFraction: 0,
      },
      averageTemperatureC: 9,
      temperatureVariationC: 18,
      radiationDoseRate: { value: 0.24, unit: "mSv/h" },
      lightLevel: 0.16,
      waterAvailability: 0.94,
      humidity: 0.84,
      magneticFieldStrengthEarth: 0.65,
      geochemicalEnergyAvailability: "high",
      electronAcceptors: ["sulfate", "ferricIron", "carbonDioxide"],
    });
    const traits: LifeTraitId[] = [
      "compactBody",
      "aquaticMovement",
      "lowOxygenMetabolism",
      "chemosynthesis",
      "pressureResistance",
      "spores",
      "chemicalSensing",
      "socialCoordination",
      "adaptiveLearning",
    ];
    const result = runSurvivalSimulation(request(oceanWorld, traits));

    expect(result.regionScores.deepOcean).toBeGreaterThan(0.5);
    expect(result.habitableRegions).toContain("deepOcean");
    expect(result.outcome).not.toBe("immediateExtinction");
    expect(result.finalPopulation).toBeGreaterThan(0);
  });

  it("does not reduce radiation merely because the habitat label changes", () => {
    const surface = planetVariant({ habitat: "open surface" });
    const cave = planetVariant({ habitat: "cave" });

    const surfaceResult = runSurvivalSimulation(request(surface));
    const caveResult = runSurvivalSimulation(request(cave));

    expect(caveResult.metrics.radiationSafety).toBe(surfaceResult.metrics.radiationSafety);
  });

  it("responds continuously to explicit radiation defenses", () => {
    const exposedWorld = planetVariant({
      radiationDoseRate: { value: 2.2, unit: "mSv/h" },
      magneticFieldStrengthEarth: 0.05,
    });
    const weak = runSurvivalSimulation(
      request(exposedWorld, BASELINE_TRAITS.filter((id) => id !== "radiationResistance")),
    );
    const defended = runSurvivalSimulation(
      request(
        planetVariant({
          radiationDoseRate: { value: 2.2, unit: "mSv/h" },
          magneticFieldStrengthEarth: 1.8,
        }),
        BASELINE_TRAITS,
      ),
    );

    expect(defended.metrics.radiationSafety).toBeGreaterThan(weak.metrics.radiationSafety);
    expect(defended.metrics.organismCompatibility).toBeGreaterThan(weak.metrics.organismCompatibility);
  });

  it("requires an explicit geochemical gradient for anaerobic energy", () => {
    const traits: LifeTraitId[] = [
      "compactBody",
      "aquaticMovement",
      "anaerobicMetabolism",
      "chemosynthesis",
      "spores",
    ];
    const absent = runSurvivalSimulation(
      request(
        planetVariant({
          geochemicalEnergyAvailability: "none",
          electronAcceptors: [],
          lightLevel: 0.05,
        }),
        traits,
      ),
    );
    const supplied = runSurvivalSimulation(
      request(
        planetVariant({
          geochemicalEnergyAvailability: "high",
          electronAcceptors: ["sulfate", "ferricIron"],
          lightLevel: 0.05,
        }),
        traits,
      ),
    );

    expect(supplied.metrics.biologicalEnergy).toBeGreaterThan(absent.metrics.biologicalEnergy);
    expect(supplied.metrics.metabolicViability).toBeGreaterThan(absent.metrics.metabolicViability);
  });

  it("uses carbon dioxide as a continuous model input", () => {
    const withoutCarbon = planetVariant({
      atmosphereComposition: {
        oxygenFraction: 0.14,
        carbonDioxideFraction: 0,
        nitrogenFraction: 0.845,
        inertGasFraction: 0.015,
        toxicGasFraction: 0,
      },
    });
    const moderateCarbon = planetVariant({
      atmosphereComposition: {
        oxygenFraction: 0.14,
        carbonDioxideFraction: 0.02,
        nitrogenFraction: 0.825,
        inertGasFraction: 0.015,
        toxicGasFraction: 0,
      },
    });

    expect(runSurvivalSimulation(request(moderateCarbon)).metrics.biologicalEnergy)
      .toBeGreaterThan(runSurvivalSimulation(request(withoutCarbon)).metrics.biologicalEnergy);
  });

  it("connects every exposed environment control to deterministic output", () => {
    const traits = BASELINE_TRAITS.filter((id) => id !== "radiationResistance");
    const baseline = runSurvivalSimulation(request(GENESIS_MISSION.planet, traits));
    const compositionWithLowOxygen = {
      oxygenFraction: 0.02,
      carbonDioxideFraction: 0.018,
      nitrogenFraction: 0.947,
      inertGasFraction: 0.015,
      toxicGasFraction: 0,
    };
    const compositionWithHighCarbon = {
      oxygenFraction: 0.14,
      carbonDioxideFraction: 0.08,
      nitrogenFraction: 0.765,
      inertGasFraction: 0.015,
      toxicGasFraction: 0,
    };
    const cases = [
      ["gravity", { gravityG: 2.6 }, "organismCompatibility"],
      ["temperature", { averageTemperatureC: 82 }, "thermalStability"],
      ["pressure", { atmosphericPressureAtm: 3.2 }, "atmosphere"],
      ["oxygen", { atmosphereComposition: compositionWithLowOxygen }, "metabolicViability"],
      ["carbonDioxide", { atmosphereComposition: compositionWithHighCarbon }, "biologicalEnergy"],
      ["water", { waterAvailability: 0.08 }, "liquidWater"],
      ["radiation", { radiationDoseRate: { value: 2.4, unit: "mSv/h" as const } }, "radiationSafety"],
      ["light", { lightLevel: 0.05 }, "biologicalEnergy"],
      ["humidity", { humidity: 0.95 }, "biologicalEnergy"],
      ["magneticField", { magneticFieldStrengthEarth: 2.4 }, "radiationSafety"],
    ] as const;

    for (const [name, patch, metric] of cases) {
      const changed = runSurvivalSimulation(request(planetVariant(patch), traits));
      expect(changed.metrics[metric], name).not.toBe(baseline.metrics[metric]);
    }
  });

  it("evaluates both thermal extremes and lets relevant adaptations respond", () => {
    const variableWorld = planetVariant({
      averageTemperatureC: 5,
      temperatureVariationC: 52,
    });
    const uninsulated = runSurvivalSimulation(request(variableWorld, BASELINE_TRAITS));
    const insulated = runSurvivalSimulation(
      request(variableWorld, [...BASELINE_TRAITS, "thermalInsulation"]),
    );
    const stableMean = runSurvivalSimulation(
      request(
        planetVariant({ averageTemperatureC: 5, temperatureVariationC: 0 }),
        BASELINE_TRAITS,
      ),
    );

    expect(uninsulated.metrics.thermalStability).not.toBe(stableMean.metrics.thermalStability);
    expect(insulated.metrics.thermalStability).toBeGreaterThan(uninsulated.metrics.thermalStability);
  });

  it("rejects conflicting traits and selections above the energy budget", () => {
    expect(() =>
      runSurvivalSimulation(request(GENESIS_MISSION.planet, ["compactBody", "largeBody", "visibleVision"])),
    ).toThrow(/incompatible/i);

    const expensiveTraits: LifeTraitId[] = [
      "largeBody",
      "internalSkeleton",
      "terrestrialMovement",
      "lowOxygenMetabolism",
      "chemosynthesis",
      "radiationResistance",
      "pressureResistance",
      "regenerativeTissue",
      "infraredVision",
      "echolocation",
      "chemicalSensing",
      "liveBirth",
      "socialCoordination",
      "adaptiveLearning",
    ];

    expect(calculateTraitCost(expensiveTraits)).toBeGreaterThan(LIFE_ENERGY_BUDGET);
    expect(() => runSurvivalSimulation(request(GENESIS_MISSION.planet, expensiveTraits)))
      .toThrow(/energy budget/i);
    expect(hasTraitConflict(["compactBody"], "largeBody")).toBe(true);
  });
});

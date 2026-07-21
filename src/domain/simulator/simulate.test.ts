import { describe, expect, it } from "vitest";

import { GENESIS_MISSION } from "./mission";
import type { LifeTraitId, PlanetState, SurvivalSimulationRequest } from "./schema";
import { PlanetStateSchema } from "./schema";
import { runSurvivalSimulation } from "./simulate";
import { calculateTraitCost, hasTraitConflict } from "./traits";

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
    expect(first.simulatorVersion).toBe("1.7.0");
    expect(first.stateHash).toMatch(/^xl-[0-9a-f]{8}$/);
    expect(first.populationTimeline).toHaveLength(201);
    expect(first.populationTimeline[0]).toEqual({ generation: 0, population: 120 });
    expect(second.populationEvents).toEqual(first.populationEvents);
  });

  it("forces survival and population to zero when no selected metabolism is supported", () => {
    const world = planetVariant({
      atmosphericPressureAtm: 1,
      waterAvailability: 0.7,
      averageTemperatureC: 18,
      lightLevel: 1,
      geochemicalEnergyAvailability: "none",
      electronAcceptors: [],
    });
    const result = runSurvivalSimulation(request(world, [
      "multicellular",
      "terrestrialMovement",
      "visibleVision",
    ]));

    expect(result.metrics.advancedLifePotential).toBe(0);
    expect(result.metrics.reproductionPotential).toBe(0);
    expect(result.finalPopulation).toBe(0);
    expect(result.outcome).toBe("immediateExtinction");
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

    expect(calculateTraitCost(traits)).toBeGreaterThan(0);
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

  it("keeps pressure preferences but applies the gravity ceiling to effective atmosphere", () => {
    const volatileWorld = { waterAvailability: 0.7, humidity: 0.55, atmosphericPressureAtm: 1 };
    const lowGravity = runSurvivalSimulation(request(planetVariant({ ...volatileWorld, gravityG: 0.2 })));
    const earthGravity = runSurvivalSimulation(request(planetVariant({ ...volatileWorld, gravityG: 1 })));

    expect(lowGravity.metrics.liquidWater).toBeLessThan(earthGravity.metrics.liquidWater);
    expect(lowGravity.metrics.atmosphere).not.toBe(earthGravity.metrics.atmosphere);
    expect(lowGravity.metrics.organismCompatibility)
      .not.toBe(earthGravity.metrics.organismCompatibility);

    const capped = runSurvivalSimulation(
      request(planetVariant({ ...volatileWorld, atmosphericPressureAtm: 5, gravityG: 0.2 })),
    );
    const supported = runSurvivalSimulation(
      request(planetVariant({ ...volatileWorld, atmosphericPressureAtm: 5, gravityG: 1 })),
    );
    expect(capped.metrics.atmosphere).not.toBe(supported.metrics.atmosphere);
  });

  it("treats water inventory and atmospheric pressure as hard phase prerequisites", () => {
    const dry = runSurvivalSimulation(request(planetVariant({
      atmosphericPressureAtm: 1,
      waterAvailability: 0,
    })));
    const vacuum = runSurvivalSimulation(request(planetVariant({
      atmosphericPressureAtm: 0,
      waterAvailability: 0,
    })));

    expect(dry.metrics.liquidWater).toBe(0);
    expect(vacuum.metrics.atmosphere).toBe(0);
  });

  it("preserves explicit pressure and temperature variation in direct requests", () => {
    const denseStable = runSurvivalSimulation(request(planetVariant({
      gravityG: 0.2,
      atmosphericPressureAtm: 5,
      temperatureVariationC: 0,
      waterAvailability: 0.7,
      humidity: 0.5,
    })));
    const thinVariable = runSurvivalSimulation(request(planetVariant({
      gravityG: 0.2,
      atmosphericPressureAtm: 0.2,
      temperatureVariationC: 57,
      waterAvailability: 0.7,
      humidity: 0.5,
    })));

    // Both stored pressures express the same 0.2 atm after the 0.2 g ceiling.
    expect(denseStable.metrics.atmosphere).toBe(thinVariable.metrics.atmosphere);
    expect(denseStable.metrics.thermalStability)
      .not.toBe(thinVariable.metrics.thermalStability);

    const optimisticVacuum = runSurvivalSimulation(request(planetVariant({
      atmosphericPressureAtm: 0,
      temperatureVariationC: 0,
    })));
    const exposedVacuum = runSurvivalSimulation(request(planetVariant({
      atmosphericPressureAtm: 0,
      temperatureVariationC: 100,
    })));

    expect(optimisticVacuum.metrics.thermalStability)
      .not.toBe(exposedVacuum.metrics.thermalStability);
  });

  it("does not treat a vacuum as near-ideal pressure fitness", () => {
    const pressureWorld = (atmosphericPressureAtm: number) =>
      planetVariant({
        atmosphericPressureAtm,
        atmosphereComposition: {
          oxygenFraction: 0,
          carbonDioxideFraction: 0,
          nitrogenFraction: 0.985,
          inertGasFraction: 0.015,
          toxicGasFraction: 0,
        },
        averageTemperatureC: 18,
        temperatureVariationC: 0,
        waterAvailability: 0,
        humidity: 0,
        lightLevel: 0,
      });
    const traits: LifeTraitId[] = ["compactBody", "visibleVision", "spores"];
    const vacuum = runSurvivalSimulation(request(pressureWorld(0), traits));
    const traceAtmosphere = runSurvivalSimulation(request(pressureWorld(0.01), traits));
    const thinAtmosphere = runSurvivalSimulation(request(pressureWorld(0.1), traits));
    const oneAtmosphere = runSurvivalSimulation(request(pressureWorld(1), traits));

    expect(vacuum.metrics.organismCompatibility)
      .toBeLessThan(traceAtmosphere.metrics.organismCompatibility);
    expect(traceAtmosphere.metrics.organismCompatibility)
      .toBeLessThan(thinAtmosphere.metrics.organismCompatibility);
    expect(thinAtmosphere.metrics.organismCompatibility)
      .toBeLessThan(oneAtmosphere.metrics.organismCompatibility);
  });

  it("gates oxygen respiration continuously and exactly at zero oxygen", () => {
    const oxygenWorld = (oxygenFraction: number) =>
      planetVariant({
        atmosphericPressureAtm: 1,
        atmosphereComposition: {
          oxygenFraction,
          carbonDioxideFraction: 0,
          nitrogenFraction: 0.985 - oxygenFraction,
          inertGasFraction: 0.015,
          toxicGasFraction: 0,
        },
        averageTemperatureC: 18,
        temperatureVariationC: 0,
        waterAvailability: 0,
        humidity: 0,
        lightLevel: 0,
        geochemicalEnergyAvailability: "none",
        electronAcceptors: [],
      });
    const neutralTraits: LifeTraitId[] = [
      "compactBody",
      "visibleVision",
      "spores",
    ];
    const aerobicTraits: LifeTraitId[] = [...neutralTraits, "oxygenRespiration"];
    const zeroOxygen = runSurvivalSimulation(request(oxygenWorld(0), aerobicTraits));
    const noRespiration = runSurvivalSimulation(
      request(oxygenWorld(0), neutralTraits),
    );
    const traceOxygen = runSurvivalSimulation(request(oxygenWorld(0.01), aerobicTraits));
    const lowOxygen = runSurvivalSimulation(request(oxygenWorld(0.05), aerobicTraits));
    const nearIdealOxygen = runSurvivalSimulation(request(oxygenWorld(0.2), aerobicTraits));

    expect(zeroOxygen.metrics.metabolicViability)
      .toBe(noRespiration.metrics.metabolicViability);
    expect(traceOxygen.metrics.metabolicViability)
      .toBeGreaterThan(zeroOxygen.metrics.metabolicViability);
    expect(lowOxygen.metrics.metabolicViability)
      .toBeGreaterThan(traceOxygen.metrics.metabolicViability);
    expect(nearIdealOxygen.metrics.metabolicViability)
      .toBeGreaterThan(lowOxygen.metrics.metabolicViability);
  });

  it("scores frozen oceans as ice rather than liquid aquatic habitat", () => {
    const temperate = runSurvivalSimulation(request(planetVariant({
      atmosphericPressureAtm: 1,
      averageTemperatureC: 20,
      temperatureVariationC: 4,
      waterAvailability: 1,
    })));
    const frozen = runSurvivalSimulation(request(planetVariant({
      atmosphericPressureAtm: 1,
      averageTemperatureC: -40,
      temperatureVariationC: 4,
      waterAvailability: 1,
    })));

    expect(temperate.metrics.liquidWater).toBeGreaterThan(0.99);
    expect(frozen.metrics.liquidWater).toBe(0);
    expect(frozen.regionScores.deepOcean).toBeLessThan(temperate.regionScores.deepOcean);
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
    const coupledBaseline = planetVariant({
      gravityG: 1,
      atmosphericPressureAtm: 1,
      averageTemperatureC: 18,
      temperatureVariationC: 12,
      radiationDoseRate: { value: 0.4, unit: "mSv/h" as const },
      lightLevel: 0.7,
      waterAvailability: 0.65,
      humidity: 0.5,
      magneticFieldStrengthEarth: 0.8,
      atmosphereComposition: {
        oxygenFraction: 0.14,
        carbonDioxideFraction: 0.018,
        nitrogenFraction: 0.827,
        inertGasFraction: 0.015,
        toxicGasFraction: 0,
      },
    });
    const baseline = runSurvivalSimulation(request(coupledBaseline, traits));
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
      ["temperatureVariation", { temperatureVariationC: 72 }, "thermalStability"],
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
      const changed = runSurvivalSimulation(
        request(
          PlanetStateSchema.parse({
            ...coupledBaseline,
            world: { ...coupledBaseline.world, ...patch },
          }),
          traits,
        ),
      );
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

  it("uses the hot extreme at the equator and the cold extreme at the poles", () => {
    const stableWorld = planetVariant({
      atmosphericPressureAtm: 1,
      averageTemperatureC: 30,
      temperatureVariationC: 0,
      waterAvailability: 0,
      humidity: 0,
    });
    const variableWorld = planetVariant({
      atmosphericPressureAtm: 1,
      averageTemperatureC: 30,
      temperatureVariationC: 50,
      waterAvailability: 0,
      humidity: 0,
    });
    const stable = runSurvivalSimulation(request(stableWorld));
    const variable = runSurvivalSimulation(request(variableWorld));

    expect(variable.regionScores.equatorial).toBeLessThan(
      stable.regionScores.equatorial,
    );
    expect(variable.regionScores.polar).toBeGreaterThan(
      stable.regionScores.polar,
    );
  });

  it("allows unrestricted trait combinations for analysis", () => {
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

    expect(calculateTraitCost(expensiveTraits)).toBeGreaterThan(100);
    expect(() => runSurvivalSimulation(request(GENESIS_MISSION.planet, expensiveTraits)))
      .not.toThrow();
    expect(hasTraitConflict(["compactBody"], "largeBody")).toBe(true);
  });
});

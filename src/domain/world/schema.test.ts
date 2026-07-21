import { describe, expect, it } from "vitest";

import {
  deriveEffectiveAtmosphericPressureAtm,
  deriveGravityPressureLimitAtm,
  WorldParametersSchema,
  normalizeWorldParameters,
} from "./schema";
import type { WorldParametersInput } from "./schema";

/** Builds a valid reference world for focused schema and normalization tests. */
function createReferenceWorld(): WorldParametersInput {
  return {
    gravityG: 1,
    atmosphericPressureAtm: 1,
    atmosphereComposition: {
      oxygenFraction: 0.21,
      carbonDioxideFraction: 0.0004,
      nitrogenFraction: 0.7806,
      inertGasFraction: 0.009,
      toxicGasFraction: 0,
    },
    averageTemperatureC: 20,
    temperatureVariationC: 15,
    radiationDoseRate: {
      value: 0.002,
      unit: "Sv/h" as const,
    },
    lightLevel: 0.7,
    waterAvailability: 0.6,
    habitat: "open surface" as const,
  };
}

describe("WorldParametersSchema", () => {
  it("applies conservative defaults for shielding and geochemical inputs", () => {
    const result = WorldParametersSchema.parse(createReferenceWorld());

    expect(result.shieldingColumnMassKgM2).toBe(0);
    expect(result.geochemicalEnergyAvailability).toBe("none");
    expect(result.electronAcceptors).toEqual([]);
    expect(result.humidity).toBe(0.45);
    expect(result.magneticFieldStrengthEarth).toBe(0.7);
  });

  it("rejects atmospheric fractions that do not sum to one", () => {
    const world = createReferenceWorld();
    world.atmosphereComposition.oxygenFraction = 0.3;

    expect(WorldParametersSchema.safeParse(world).success).toBe(false);
  });

  it("requires an explicit molar mass for high-atmosphere worlds", () => {
    const world = createReferenceWorld();
    world.habitat = "high atmosphere";

    expect(WorldParametersSchema.safeParse(world).success).toBe(false);
  });

  it("rejects electron acceptors when no usable geochemical source is supplied", () => {
    const world = createReferenceWorld();
    world.electronAcceptors = ["nitrate"];

    expect(WorldParametersSchema.safeParse(world).success).toBe(false);
  });

  it("accepts magma-ocean temperatures but rejects ranges below absolute zero", () => {
    expect(
      WorldParametersSchema.safeParse({
        ...createReferenceWorld(),
        averageTemperatureC: 1_800,
        temperatureVariationC: 100,
      }).success,
    ).toBe(true);
    expect(
      WorldParametersSchema.safeParse({
        ...createReferenceWorld(),
        averageTemperatureC: -250,
        temperatureVariationC: 24,
      }).success,
    ).toBe(false);
  });

  it("derives an immediate gravity-dependent pressure ceiling", () => {
    expect(deriveGravityPressureLimitAtm(0.2)).toBe(0.2);
    expect(deriveGravityPressureLimitAtm(1)).toBe(5);
    expect(deriveGravityPressureLimitAtm(3)).toBe(5);
    expect(deriveEffectiveAtmosphericPressureAtm(0.2, 5)).toBe(0.2);
  });
});

describe("normalizeWorldParameters", () => {
  it("retains source radiation while normalizing it to millisieverts per hour", () => {
    const result = normalizeWorldParameters(createReferenceWorld());

    expect(result.radiationDoseRate).toEqual({ value: 0.002, unit: "Sv/h" });
    expect(result.radiationDoseRateMilliSvPerHour).toBe(2);
  });

  it("does not reduce normalized radiation for cave or deep-ocean labels", () => {
    const baseline = normalizeWorldParameters(createReferenceWorld());

    for (const habitat of ["cave", "deep ocean"] as const) {
      const result = normalizeWorldParameters({
        ...createReferenceWorld(),
        habitat,
        shieldingColumnMassKgM2: 10_000,
      });

      expect(result.radiationDoseRateMilliSvPerHour).toBe(
        baseline.radiationDoseRateMilliSvPerHour,
      );
    }
  });

  it("derives both temperature extremes, oxygen partial pressure, and local density", () => {
    const result = normalizeWorldParameters({
      ...createReferenceWorld(),
      atmosphericMeanMolarMassKgPerMol: 0.028_97,
    });

    expect(result.temperatureRangeC).toEqual({ minimum: 5, maximum: 35 });
    expect(result.effectiveAtmosphericPressureAtm).toBe(1);
    expect(result.oxygenPartialPressureAtm).toBeCloseTo(0.21, 8);
    expect(result.atmosphericDensityKgM3).toBeCloseTo(1.204, 3);
  });

  it("uses the gravity-limited pressure for oxygen partial pressure and density", () => {
    const result = normalizeWorldParameters({
      ...createReferenceWorld(),
      gravityG: 0.2,
      atmosphericPressureAtm: 5,
      atmosphericMeanMolarMassKgPerMol: 0.028_97,
    });

    expect(result.effectiveAtmosphericPressureAtm).toBe(0.2);
    expect(result.oxygenPartialPressureAtm).toBeCloseTo(0.042, 8);
    expect(result.atmosphericDensityKgM3).toBeCloseTo(0.241, 3);
  });

  it("accepts vacuum pressure and derives no oxygen partial pressure or atmospheric density", () => {
    const result = normalizeWorldParameters({
      ...createReferenceWorld(),
      atmosphericPressureAtm: 0,
      atmosphericMeanMolarMassKgPerMol: 0.028_97,
    });

    expect(result.oxygenPartialPressureAtm).toBe(0);
    expect(result.atmosphericDensityKgM3).toBe(0);
  });

  it("requires both a redox gradient and an electron acceptor for an alternative pathway", () => {
    const result = normalizeWorldParameters({
      ...createReferenceWorld(),
      geochemicalEnergyAvailability: "moderate",
      electronAcceptors: ["sulfate"],
    });

    expect(result.hasUsableAlternativeEnergyPathway).toBe(true);
  });
});

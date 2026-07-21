import { describe, expect, it } from "vitest";

import { BASELINE_PLANET } from "../simulator/baseline";

import { deriveWorldContext } from "./context";

describe("world context", () => {
  it("keeps design and analysis evidence tied to the shared effective world state", () => {
    const context = deriveWorldContext({
      ...BASELINE_PLANET.world,
      gravityG: 1,
      atmosphericPressureAtm: 1,
      atmosphereComposition: {
        oxygenFraction: 0.21,
        carbonDioxideFraction: 0.00042,
        nitrogenFraction: 0.78,
        inertGasFraction: 0.00958,
        toxicGasFraction: 0,
      },
      averageTemperatureC: 15,
      temperatureVariationC: 15,
      waterAvailability: 0.71,
      humidity: 0.6,
      magneticFieldStrengthEarth: 1,
      radiationDoseRate: { value: 0.0003, unit: "mSv/h" },
    });

    expect(context.temperatureMinimumC).toBe(0);
    expect(context.temperatureMaximumC).toBe(30);
    expect(context.temperatureVariationC).toBe(15);
    expect(context.effectivePressureAtm).toBe(1);
    expect(context.pressureCapacityAtm).toBe(5);
    expect(context.oxygenPartialPressureAtm).toBeCloseTo(0.21, 8);
    expect(context.surfaceWaterFraction).toBeGreaterThan(0.68);
    expect(context.liquidWaterFraction).toBeGreaterThan(0.65);
    expect(context.effectiveHumidity).toBeGreaterThan(0);
    expect(context.estimatedWaterBoilingPointC).toBeCloseTo(100, 0);
    expect(context.protectedRadiationMilliSvPerHour).toBeLessThan(
      context.incidentRadiationMilliSvPerHour,
    );
  });
});

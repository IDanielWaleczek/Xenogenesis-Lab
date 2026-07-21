import { describe, expect, it } from "vitest";

import { BASELINE_PLANET } from "@/domain/simulator/baseline";
import { deriveWorldContext } from "@/domain/world/context";

import { deriveExperimentReadiness } from "./experiment-tools";

describe("experiment readiness", () => {
  it("reports the barren baseline as advisory gaps without calculating survival", () => {
    const readiness = deriveExperimentReadiness(
      deriveWorldContext(BASELINE_PLANET.world),
      false,
    );

    expect(readiness).toEqual({
      water: "unavailable",
      energy: "unavailable",
      radiation: "elevated",
    });
  });

  it("recognizes a supported experimental starting point", () => {
    const readiness = deriveExperimentReadiness(
      deriveWorldContext({
        ...BASELINE_PLANET.world,
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
        radiationDoseRate: { value: 0.0003, unit: "mSv/h" },
      }),
      true,
    );

    expect(readiness).toEqual({
      water: "available",
      energy: "available",
      radiation: "manageable",
    });
  });
});

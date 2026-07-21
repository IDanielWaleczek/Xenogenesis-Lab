import { describe, expect, it } from "vitest";

import { deriveAdaptationArchetypes, deriveViableAdaptationArchetypes } from "./archetypes";
import { BASELINE_PLANET } from "./baseline";
import { PlanetStateSchema } from "./schema";

function supportedTemperatePlanet() {
  return PlanetStateSchema.parse({
    ...BASELINE_PLANET,
    world: {
      ...BASELINE_PLANET.world,
      atmosphericPressureAtm: 1,
      atmosphereComposition: { oxygenFraction: 0.21, carbonDioxideFraction: 0.012, nitrogenFraction: 0.763, inertGasFraction: 0.015, toxicGasFraction: 0 },
      averageTemperatureC: 18,
      temperatureVariationC: 12,
      radiationDoseRate: { value: 0.05, unit: "mSv/h" },
      lightLevel: 0.95,
      waterAvailability: 0.65,
      humidity: 0.62,
      magneticFieldStrengthEarth: 1,
    },
  });
}

describe("deterministic adaptation archetypes", () => {
  it("offers four distinct surviving strategies when hard life support is present", () => {
    const planet = supportedTemperatePlanet();
    const archetypes = deriveAdaptationArchetypes(planet);
    const viable = deriveViableAdaptationArchetypes(planet);

    expect(archetypes).toHaveLength(4);
    expect(new Set(archetypes.map(({ id }) => id)).size).toBe(4);
    expect(viable).toHaveLength(4);
    expect(viable.every(({ traitIds }) => traitIds.includes("biofilmColony"))).toBe(true);
  });

  it("does not invent an organism strategy when no supported metabolism exists", () => {
    expect(deriveAdaptationArchetypes(BASELINE_PLANET)).toEqual([]);
    expect(deriveViableAdaptationArchetypes(BASELINE_PLANET)).toEqual([]);
  });
});

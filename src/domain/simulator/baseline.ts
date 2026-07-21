import { PlanetStateSchema } from "./schema";

/** Immutable barren planet used as the laboratory's initial simulator state. */
export const BASELINE_PLANET = PlanetStateSchema.parse({
  seed: "VESPERA-7A-2049",
  world: {
    gravityG: 1,
    atmosphericPressureAtm: 0,
    atmosphereComposition: {
      oxygenFraction: 0,
      carbonDioxideFraction: 0,
      nitrogenFraction: 1,
      inertGasFraction: 0,
      toxicGasFraction: 0,
    },
    averageTemperatureC: -30,
    temperatureVariationC: 100,
    radiationDoseRate: { value: 0.4, unit: "mSv/h" },
    lightLevel: 0.72,
    waterAvailability: 0,
    humidity: 0,
    magneticFieldStrengthEarth: 0,
    habitat: "open surface",
    shieldingColumnMassKgM2: 0,
    geochemicalEnergyAvailability: "none",
    electronAcceptors: [],
    atmosphericMeanMolarMassKgPerMol: 0.0298,
  },
});

import { PlanetStateSchema } from "./schema";

/** Deterministic baseline for the first continuous life-engineering mission. */
export const GENESIS_MISSION = {
  id: "genesis-01" as const,
  seed: "VESPERA-7A-2049",
  planet: PlanetStateSchema.parse({
    seed: "VESPERA-7A-2049",
    world: {
      gravityG: 1.35,
      atmosphericPressureAtm: 0.82,
      atmosphereComposition: {
        oxygenFraction: 0.14,
        carbonDioxideFraction: 0.018,
        nitrogenFraction: 0.827,
        inertGasFraction: 0.015,
        toxicGasFraction: 0,
      },
      averageTemperatureC: 4,
      temperatureVariationC: 28,
      radiationDoseRate: { value: 0.32, unit: "mSv/h" },
      lightLevel: 0.74,
      waterAvailability: 0.46,
      humidity: 0.34,
      magneticFieldStrengthEarth: 0.42,
      habitat: "open surface",
      shieldingColumnMassKgM2: 0,
      geochemicalEnergyAvailability: "moderate",
      electronAcceptors: ["sulfate", "ferricIron"],
      atmosphericMeanMolarMassKgPerMol: 0.0298,
    },
  }),
};

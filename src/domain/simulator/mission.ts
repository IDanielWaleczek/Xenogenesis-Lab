import { PlanetStateSchema } from "./schema";

/** Deterministic barren starting state for the first continuous life-engineering mission. */
export const GENESIS_MISSION = {
  id: "genesis-01" as const,
  seed: "VESPERA-7A-2049",
  planet: PlanetStateSchema.parse({
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
  }),
};

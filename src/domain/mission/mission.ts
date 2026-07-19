import { MissionDefinitionSchema } from "./schema";

/** The single fixed training mission included in the MVP vertical slice. */
export const VESPERA_MISSION = MissionDefinitionSchema.parse({
  id: "vespera-01",
  rulesetVersion: "0.2.0",
  world: {
    gravityG: 1.7,
    atmosphericPressureAtm: 1.2,
    atmosphereComposition: {
      oxygenFraction: 0.21,
      carbonDioxideFraction: 0.0004,
      nitrogenFraction: 0.7806,
      inertGasFraction: 0.009,
      toxicGasFraction: 0,
    },
    averageTemperatureC: 18,
    temperatureVariationC: 24,
    radiationDoseRate: { value: 0.4, unit: "mSv/h" },
    lightLevel: 0.62,
    waterAvailability: 0.38,
    habitat: "open surface",
    shieldingColumnMassKgM2: 0,
    geochemicalEnergyAvailability: "none",
    electronAcceptors: [],
    atmosphericMeanMolarMassKgPerMol: 0.02897,
  },
});

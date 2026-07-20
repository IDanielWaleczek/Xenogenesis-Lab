import {
  deriveEffectiveRadiationDose,
  deriveWorldInteractionState,
} from "./interactions";
import {
  calculateOxygenPartialPressureAtm,
  deriveGravityPressureLimitAtm,
  deriveTemperatureRangeC,
  normalizeRadiationDoseRateMilliSvPerHour,
  type WorldParameters,
} from "./schema";

/** Deterministic world facts presented while designing and reviewing a lifeform. */
export type WorldContext = {
  meanTemperatureC: number;
  temperatureVariationC: number;
  temperatureMinimumC: number;
  temperatureMaximumC: number;
  gravityG: number;
  storedPressureAtm: number;
  pressureCapacityAtm: number;
  effectivePressureAtm: number;
  oxygenPartialPressureAtm: number;
  carbonDioxidePartialPressureAtm: number;
  waterAvailability: number;
  surfaceWaterFraction: number;
  liquidWaterFraction: number;
  iceWaterFraction: number;
  vaporWaterFraction: number;
  configuredHumidity: number;
  effectiveHumidity: number;
  cloudPotential: number;
  estimatedWaterBoilingPointC: number | null;
  lightLevel: number;
  incidentRadiationMilliSvPerHour: number;
  protectedRadiationMilliSvPerHour: number;
  magneticFieldStrengthEarth: number;
  shieldingColumnMassKgM2: number;
};

/** Derives the shared, parameter-backed evidence used outside the planet-engineering phase. */
export function deriveWorldContext(world: WorldParameters): WorldContext {
  const interactions = deriveWorldInteractionState(world);
  const temperatureRange = deriveTemperatureRangeC(
    world.averageTemperatureC,
    world.temperatureVariationC,
  );
  const incidentRadiationMilliSvPerHour = normalizeRadiationDoseRateMilliSvPerHour(
    world.radiationDoseRate,
  );

  return {
    meanTemperatureC: world.averageTemperatureC,
    temperatureVariationC: world.temperatureVariationC,
    temperatureMinimumC: temperatureRange.minimum,
    temperatureMaximumC: temperatureRange.maximum,
    gravityG: world.gravityG,
    storedPressureAtm: world.atmosphericPressureAtm,
    pressureCapacityAtm: deriveGravityPressureLimitAtm(world.gravityG),
    effectivePressureAtm: interactions.effectiveAtmosphericPressureAtm,
    oxygenPartialPressureAtm: calculateOxygenPartialPressureAtm(
      interactions.effectiveAtmosphericPressureAtm,
      world.atmosphereComposition.oxygenFraction,
    ),
    carbonDioxidePartialPressureAtm:
      interactions.effectiveAtmosphericPressureAtm *
      world.atmosphereComposition.carbonDioxideFraction,
    waterAvailability: world.waterAvailability,
    surfaceWaterFraction: interactions.surfaceWaterFraction,
    liquidWaterFraction: interactions.liquidWaterFraction,
    iceWaterFraction: interactions.iceWaterFraction,
    vaporWaterFraction: interactions.vaporWaterFraction,
    configuredHumidity: world.humidity,
    effectiveHumidity: interactions.effectiveHumidity,
    cloudPotential: interactions.cloudPotential,
    estimatedWaterBoilingPointC: interactions.estimatedWaterBoilingPointC,
    lightLevel: world.lightLevel,
    incidentRadiationMilliSvPerHour,
    protectedRadiationMilliSvPerHour: deriveEffectiveRadiationDose(
      incidentRadiationMilliSvPerHour,
      world.magneticFieldStrengthEarth,
    ),
    magneticFieldStrengthEarth: world.magneticFieldStrengthEarth,
    shieldingColumnMassKgM2: world.shieldingColumnMassKgM2,
  };
}

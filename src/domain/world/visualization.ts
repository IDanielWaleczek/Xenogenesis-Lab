import type { WorldParameters } from "./schema";
import {
  clamp,
  deriveEffectiveRadiationDose,
  deriveWorldInteractionState,
  smoothstep,
} from "./interactions";

export type PlanetVisualizationState = {
  surfaceWater: number;
  liquidWater: number;
  iceWater: number;
  vaporWater: number;
  meanTemperatureC: number;
  temperatureVariationC: number;
  effectiveHumidity: number;
  pressurePresence: number;
  radiation: number;
  biosphere: number;
  cloudCover: number;
  atmosphereDensity: number;
  atmosphereColor: readonly [number, number, number];
  daylight: number;
  lightLevel: number;
  aurora: number;
  vegetationClimateSuitability: number;
  sandClimateSuitability: number;
};

/** Shared planet-to-star vector used by lighting and camera validation. */
export const PLANET_SUN_POSITION = [-14.4, 30.6, -57.6] as const;

/** Initial orbit-camera position chosen to expose the illuminated hemisphere. */
export const PLANET_INITIAL_CAMERA_POSITION = [0.7, 0.65, -3] as const;

/** Basaltic surface begins visibly melting under the renderer convention. */
export const BASALT_MELT_TRANSITION_START_C = 780;

/** Basaltic surface is predominantly molten under the renderer convention. */
export const BASALT_MELT_TRANSITION_END_C = 1_050;

/** Samples a scalar climate response across a symmetric configured temperature range. */
function sampleTemperatureResponse(
  averageTemperatureC: number,
  temperatureVariationC: number,
  response: (temperatureC: number) => number,
): number {
  if (temperatureVariationC <= Number.EPSILON) return response(averageTemperatureC);

  const sampleCount = 33;
  let sum = 0;
  for (let index = 0; index < sampleCount; index += 1) {
    const rangePosition = index / (sampleCount - 1);
    const temperatureC =
      averageTemperatureC -
      temperatureVariationC +
      2 * temperatureVariationC * rangePosition;
    sum += response(temperatureC);
  }
  return sum / sampleCount;
}

/** Limits the green macroscopic-biosphere treatment to a defensible thermal display window. */
export function deriveVegetationClimateSuitability(
  averageTemperatureC: number,
  temperatureVariationC: number,
): number {
  return sampleTemperatureResponse(
    averageTemperatureC,
    temperatureVariationC,
    (temperatureC) =>
      smoothstep(-8, 8, temperatureC) *
      (1 - smoothstep(45, 60, temperatureC)),
  );
}

/** Allows arid sand on unfrozen mild terrain instead of introducing it at extreme heat. */
export function deriveSandClimateSuitability(
  averageTemperatureC: number,
  temperatureVariationC: number,
): number {
  return sampleTemperatureResponse(
    averageTemperatureC,
    temperatureVariationC,
    (temperatureC) => smoothstep(-12, 5, temperatureC),
  );
}

/** Maps latitude and a small local terrain signal to the configured hot-equator/cold-pole range. */
export function deriveLatitudinalTemperatureC(
  averageTemperatureC: number,
  temperatureVariationC: number,
  absoluteNormalizedLatitude: number,
  terrainSignal = 0,
): number {
  const latitude = clamp(absoluteNormalizedLatitude, 0, 1);
  const latitudeSignal = 2 * Math.sqrt(Math.max(0, 1 - latitude * latitude)) - 1;
  const thermalPosition = clamp(
    latitudeSignal + clamp(terrainSignal, -1, 1) * 0.55,
    -1,
    1,
  );
  return averageTemperatureC + temperatureVariationC * thermalPosition;
}

/** Derives the locally frozen share of visible water from latitude and available ice. */
export function deriveLocalWaterIceFraction(
  averageTemperatureC: number,
  temperatureVariationC: number,
  absoluteNormalizedLatitude: number,
  availableIceFraction: number,
): number {
  const localTemperatureC = deriveLatitudinalTemperatureC(
    averageTemperatureC,
    temperatureVariationC,
    absoluteNormalizedLatitude,
  );
  const localFreeze = 1 - smoothstep(-2, 2, localTemperatureC);
  const iceSupply = smoothstep(0.0001, 0.02, availableIceFraction);
  return localFreeze * iceSupply;
}

/** Derives the visible molten-rock share across the configured temperature range. */
export function deriveMoltenRockFraction(
  averageTemperatureC: number,
  temperatureVariationC: number,
): number {
  return sampleTemperatureResponse(
    averageTemperatureC,
    temperatureVariationC,
    (temperatureC) =>
      smoothstep(
        BASALT_MELT_TRANSITION_START_C,
        BASALT_MELT_TRANSITION_END_C,
        temperatureC,
      ),
  );
}

/** Reports whether the reset camera is on the illuminated side of the planet. */
export function deriveResetCameraLightAlignment(): number {
  const cameraLength = Math.hypot(...PLANET_INITIAL_CAMERA_POSITION);
  const sunLength = Math.hypot(...PLANET_SUN_POSITION);
  return PLANET_INITIAL_CAMERA_POSITION.reduce(
    (sum, component, index) =>
      sum +
      (component / cameraLength) *
        (PLANET_SUN_POSITION[index] / sunLength),
    0,
  );
}

/** Converts explicit world inputs into renderer values without creating new simulation facts. */
export function derivePlanetVisualizationState(
  world: WorldParameters,
  biosphereLevel: number,
): PlanetVisualizationState {
  const interactions = deriveWorldInteractionState(world);
  const doseMilliSvPerHour =
    world.radiationDoseRate.value *
    (world.radiationDoseRate.unit === "Sv/h" ? 1_000 : 1);
  const incidentRadiation = clamp(doseMilliSvPerHour / 3, 0, 1);
  const radiation = clamp(
    deriveEffectiveRadiationDose(
      doseMilliSvPerHour,
      world.magneticFieldStrengthEarth,
    ) / 3,
    0,
    1,
  );
  const magnetic = clamp(world.magneticFieldStrengthEarth / 3, 0, 1);
  const oxygen = world.atmosphereComposition.oxygenFraction;
  const carbonDioxide = world.atmosphereComposition.carbonDioxideFraction;
  const heatTint = smoothstep(70, 140, world.averageTemperatureC);
  const dust = clamp(carbonDioxide * 4 + heatTint * 0.45, 0, 1);
  const atmosphereColor = [
    clamp(0.1 + oxygen * 0.7 + dust * 0.4, 0, 1),
    clamp(0.2 + oxygen * 1.05 - dust * 0.08, 0, 1),
    clamp(0.34 + oxygen * 1.45 - dust * 0.26, 0, 1),
  ] as const;
  const atmosphereDensity = clamp(
    1 - Math.exp(-interactions.effectiveAtmosphericPressureAtm / 1.1),
    0,
    1,
  );
  const vegetationClimateSuitability = deriveVegetationClimateSuitability(
    world.averageTemperatureC,
    world.temperatureVariationC,
  );
  const sandClimateSuitability = deriveSandClimateSuitability(
    world.averageTemperatureC,
    world.temperatureVariationC,
  );
  const aurora =
    smoothstep(0.02, 0.2, atmosphereDensity) *
    smoothstep(0.02, 0.18, magnetic) *
    smoothstep(0.005, 0.15, incidentRadiation);

  return {
    surfaceWater: interactions.surfaceWaterFraction,
    liquidWater: interactions.liquidWaterFraction,
    iceWater: interactions.iceWaterFraction,
    vaporWater: interactions.vaporWaterFraction,
    meanTemperatureC: world.averageTemperatureC,
    temperatureVariationC: world.temperatureVariationC,
    effectiveHumidity: interactions.effectiveHumidity,
    pressurePresence: interactions.atmospherePresence,
    radiation,
    biosphere:
      clamp(biosphereLevel, 0, 1) * vegetationClimateSuitability,
    cloudCover: interactions.cloudPotential,
    atmosphereDensity,
    atmosphereColor,
    daylight: clamp(world.lightLevel, 0, 1),
    lightLevel: world.lightLevel,
    aurora,
    vegetationClimateSuitability,
    sandClimateSuitability,
  };
}

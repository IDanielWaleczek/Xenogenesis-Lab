import {
  deriveEffectiveAtmosphericPressureAtm,
  deriveTemperatureRangeC,
  type WorldParameters,
} from "./schema";

/** Water triple-point pressure converted from 6.11657 mbar to atmospheres. */
export const WATER_TRIPLE_POINT_PRESSURE_ATM = 0.006_036;

/** Smallest pressure treated as a configured atmosphere in status copy. */
export const ATMOSPHERE_CONTROL_MIN_PRESSURE_ATM = 0.001;

/** Versioned educational reduction of incident dose per Earth-relative magnetic field. */
export const MAGNETIC_RADIATION_PROTECTION_PER_EARTH_FIELD = 1.6;

/** Pressure by which the exposed-water stability transition is complete. */
const STABLE_EXPOSED_WATER_PRESSURE_ATM = 0.03;

/** Normal boiling point of water used by the constant-enthalpy phase approximation. */
const WATER_NORMAL_BOILING_POINT_K = 373.15;

/** Approximate molar enthalpy of water vaporization near its normal boiling point. */
const WATER_VAPORIZATION_ENTHALPY_J_PER_MOL = 40_650;

/** Universal gas constant used by the Clausius-Clapeyron approximation. */
const UNIVERSAL_GAS_CONSTANT_J_PER_MOL_K = 8.314_462_618;

/** Width of the educational solid/liquid transition around 0 degrees Celsius. */
const FREEZING_TRANSITION_HALF_WIDTH_C = 2;

/** Width of the educational liquid/vapor transition around the estimated boiling point. */
const BOILING_TRANSITION_HALF_WIDTH_C = 3;

/** Number of deterministic samples used across the configured temperature range. */
const TEMPERATURE_RANGE_SAMPLE_COUNT = 33;

export type WaterPhaseFractions = {
  ice: number;
  liquid: number;
  vapor: number;
};

/** Normalizes phase weights so floating-point rounding cannot create water mass. */
function normalizeWaterPhaseFractions(
  fractions: WaterPhaseFractions,
): WaterPhaseFractions {
  const total = fractions.ice + fractions.liquid + fractions.vapor;
  if (total <= Number.EPSILON) return { ice: 0, liquid: 0, vapor: 0 };
  return {
    ice: fractions.ice / total,
    liquid: fractions.liquid / total,
    vapor: fractions.vapor / total,
  };
}

export type WorldInteractionState = {
  hasAtmosphere: boolean;
  effectiveAtmosphericPressureAtm: number;
  supportsSurfaceWater: boolean;
  supportsHumidity: boolean;
  estimatedWaterBoilingPointC: number | null;
  atmospherePresence: number;
  exposedWaterPressureSupport: number;
  surfaceWaterFraction: number;
  liquidWaterFraction: number;
  iceWaterFraction: number;
  vaporWaterFraction: number;
  unavailableWaterFraction: number;
  effectiveHumidity: number;
  cloudPotential: number;
  phaseFractions: WaterPhaseFractions;
};

/** Clamps a scalar without importing UI or simulator helpers. */
export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

/** Produces a continuous cubic transition between two values. */
export function smoothstep(edge0: number, edge1: number, value: number): number {
  if (edge0 === edge1) return value < edge0 ? 0 : 1;
  const normalized = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return normalized * normalized * (3 - 2 * normalized);
}

/** Estimates the boiling point of pure water at the supplied pressure. */
export function estimateWaterBoilingPointC(pressureAtm: number): number | null {
  if (pressureAtm < WATER_TRIPLE_POINT_PRESSURE_ATM) return null;

  // This constant-enthalpy approximation is adequate for the UI range, not a full phase diagram.
  const inverseTemperature =
    1 / WATER_NORMAL_BOILING_POINT_K -
    (UNIVERSAL_GAS_CONSTANT_J_PER_MOL_K / WATER_VAPORIZATION_ENTHALPY_J_PER_MOL) *
      Math.log(pressureAtm);
  return 1 / inverseTemperature - 273.15;
}

/** Applies the shared incident-radiation convention used by simulation and rendering. */
export function deriveEffectiveRadiationDose(
  incidentDoseMilliSvPerHour: number,
  magneticFieldStrengthEarth: number,
): number {
  return (
    Math.max(0, incidentDoseMilliSvPerHour) /
    (1 +
      Math.max(0, magneticFieldStrengthEarth) *
        MAGNETIC_RADIATION_PROTECTION_PER_EARTH_FIELD)
  );
}

/** Averages a continuous response over the configured symmetric temperature range. */
function averageAcrossTemperatureRange(
  averageTemperatureC: number,
  temperatureVariationC: number,
  response: (temperatureC: number) => number,
): number {
  if (temperatureVariationC <= Number.EPSILON) return response(averageTemperatureC);

  const range = deriveTemperatureRangeC(averageTemperatureC, temperatureVariationC);
  let total = 0;
  for (let index = 0; index < TEMPERATURE_RANGE_SAMPLE_COUNT; index += 1) {
    const position = index / (TEMPERATURE_RANGE_SAMPLE_COUNT - 1);
    total += response(range.minimum + (range.maximum - range.minimum) * position);
  }
  return total / TEMPERATURE_RANGE_SAMPLE_COUNT;
}

/** Derives smoothly blended solid, liquid, and vapor shares for pure exposed water. */
export function deriveWaterPhaseFractions(
  averageTemperatureC: number,
  temperatureVariationC: number,
  boilingPointC: number,
): WaterPhaseFractions {
  let ice = 0;
  let liquid = 0;
  let vapor = 0;

  const accumulate = (temperatureC: number) => {
    const iceWeight =
      1 -
      smoothstep(
        -FREEZING_TRANSITION_HALF_WIDTH_C,
        FREEZING_TRANSITION_HALF_WIDTH_C,
        temperatureC,
      );
    const vaporWeight = smoothstep(
      boilingPointC - BOILING_TRANSITION_HALF_WIDTH_C,
      boilingPointC + BOILING_TRANSITION_HALF_WIDTH_C,
      temperatureC,
    );
    return {
      ice: iceWeight * (1 - vaporWeight),
      liquid: (1 - iceWeight) * (1 - vaporWeight),
      vapor: vaporWeight,
    };
  };

  if (temperatureVariationC <= Number.EPSILON) {
    return normalizeWaterPhaseFractions(accumulate(averageTemperatureC));
  }

  const range = deriveTemperatureRangeC(averageTemperatureC, temperatureVariationC);
  for (let index = 0; index < TEMPERATURE_RANGE_SAMPLE_COUNT; index += 1) {
    const position = index / (TEMPERATURE_RANGE_SAMPLE_COUNT - 1);
    const weights = accumulate(
      range.minimum + (range.maximum - range.minimum) * position,
    );
    ice += weights.ice;
    liquid += weights.liquid;
    vapor += weights.vapor;
  }

  return normalizeWaterPhaseFractions({
    ice: ice / TEMPERATURE_RANGE_SAMPLE_COUNT,
    liquid: liquid / TEMPERATURE_RANGE_SAMPLE_COUNT,
    vapor: vapor / TEMPERATURE_RANGE_SAMPLE_COUNT,
  });
}

/** Derives continuous physical consequences from explicit inputs without mutating them. */
export function deriveWorldInteractionState(
  world: WorldParameters,
): WorldInteractionState {
  const pressureAtm = deriveEffectiveAtmosphericPressureAtm(
    world.gravityG,
    world.atmosphericPressureAtm,
  );
  const hasAtmosphere = pressureAtm >= ATMOSPHERE_CONTROL_MIN_PRESSURE_ATM;
  const atmospherePresence = 1 - Math.exp(-pressureAtm / 0.05);
  const estimatedWaterBoilingPointC = estimateWaterBoilingPointC(pressureAtm);
  const exposedWaterPressureSupport =
    estimatedWaterBoilingPointC === null
      ? 0
      : smoothstep(
          WATER_TRIPLE_POINT_PRESSURE_ATM,
          STABLE_EXPOSED_WATER_PRESSURE_ATM,
          pressureAtm,
        );
  const phaseFractions =
    estimatedWaterBoilingPointC === null
      ? { ice: 0, liquid: 0, vapor: 0 }
      : deriveWaterPhaseFractions(
          world.averageTemperatureC,
          world.temperatureVariationC,
          estimatedWaterBoilingPointC,
        );
  const exposedInventory = world.waterAvailability * exposedWaterPressureSupport;
  const iceWaterFraction = exposedInventory * phaseFractions.ice;
  const liquidWaterFraction = exposedInventory * phaseFractions.liquid;
  const vaporWaterFraction = exposedInventory * phaseFractions.vapor;
  const surfaceWaterFraction = iceWaterFraction + liquidWaterFraction;
  const unavailableWaterFraction = Math.max(
    0,
    world.waterAvailability - exposedInventory,
  );

  // Humidity remains an explicit preference, while a warm fully aquatic world retains a small evaporation floor.
  const waterSupply = Math.pow(clamp(exposedInventory, 0, 1), 0.42);
  const oceanEvaporationFloor =
    smoothstep(0.85, 1, liquidWaterFraction) * 0.12;
  const effectiveHumidity =
    Math.max(world.humidity * waterSupply, oceanEvaporationFloor) *
    atmospherePresence;
  const coldCloudSupport = averageAcrossTemperatureRange(
    world.averageTemperatureC,
    world.temperatureVariationC,
    (temperatureC) => smoothstep(-80, -15, temperatureC),
  );
  const extremeHeatClearing = averageAcrossTemperatureRange(
    world.averageTemperatureC,
    world.temperatureVariationC,
    (temperatureC) => 1 - smoothstep(115, 150, temperatureC),
  );
  const cloudPotential = clamp(
    effectiveHumidity * coldCloudSupport * extremeHeatClearing,
    0,
    1,
  );
  return {
    hasAtmosphere,
    effectiveAtmosphericPressureAtm: pressureAtm,
    supportsSurfaceWater: surfaceWaterFraction > 0.000_001,
    supportsHumidity: effectiveHumidity > 0.000_001,
    estimatedWaterBoilingPointC,
    atmospherePresence,
    exposedWaterPressureSupport,
    surfaceWaterFraction,
    liquidWaterFraction,
    iceWaterFraction,
    vaporWaterFraction,
    unavailableWaterFraction,
    effectiveHumidity,
    cloudPotential,
    phaseFractions,
  };
}

import { WorldParametersSchema, type WorldParameters } from "./schema";
import {
  ATMOSPHERE_CONTROL_MIN_PRESSURE_ATM,
  deriveWorldInteractionState,
} from "./interactions";

/** Editable world inputs exposed by the planet-engineering controls. */
export type WorldEngineeringParameterId =
  | "gravity"
  | "temperature"
  | "temperatureVariation"
  | "pressure"
  | "oxygen"
  | "carbonDioxide"
  | "water"
  | "radiation"
  | "light"
  | "humidity"
  | "magneticField";

export type WorldEngineeringConstraint =
  | "requiresAtmosphere"
  | "requiresWaterPressure"
  | "surfaceWaterBoils"
  | "surfaceWaterLimited"
  | "requiresSurfaceWater"
  | "humidityLimitedByWater";

export type WorldEngineeringControlState = {
  disabled: boolean;
  displayedValue: number;
  preferredValue: number;
  constraint: WorldEngineeringConstraint | null;
};

/** Smallest continuous support treated as physically editable by the UI. */
const CONTROL_SUPPORT_EPSILON = 0.000_001;

/** Returns the current preference in the native units accepted by the basic setter. */
function readWorldParameterPreference(
  world: WorldParameters,
  id: WorldEngineeringParameterId,
): number {
  return id === "gravity"
    ? world.gravityG
    : id === "temperature"
      ? world.averageTemperatureC
      : id === "temperatureVariation"
        ? world.temperatureVariationC
        : id === "pressure"
          ? world.atmosphericPressureAtm
          : id === "oxygen"
            ? world.atmosphereComposition.oxygenFraction * 100
            : id === "carbonDioxide"
              ? world.atmosphereComposition.carbonDioxideFraction * 100
              : id === "water"
                ? world.waterAvailability * 100
                : id === "radiation"
                  ? world.radiationDoseRate.value
                  : id === "light"
                    ? world.lightLevel * 100
                    : id === "humidity"
                      ? world.humidity * 100
                      : world.magneticFieldStrengthEarth;
}

/** Derives the physical expression shown by a control without erasing its preference. */
export function deriveWorldEngineeringControlState(
  world: WorldParameters,
  id: WorldEngineeringParameterId,
): WorldEngineeringControlState {
  const interactions = deriveWorldInteractionState(world);
  const preferredValue = readWorldParameterPreference(world, id);

  if (id === "oxygen" || id === "carbonDioxide") {
    const fraction =
      id === "oxygen"
        ? world.atmosphereComposition.oxygenFraction
        : world.atmosphereComposition.carbonDioxideFraction;
    const disabled =
      world.atmosphericPressureAtm < ATMOSPHERE_CONTROL_MIN_PRESSURE_ATM;
    return {
      disabled,
      displayedValue: world.atmosphericPressureAtm * fraction,
      preferredValue,
      constraint: disabled ? "requiresAtmosphere" : null,
    };
  }

  if (id === "water") {
    const surfacePhaseSupport =
      interactions.exposedWaterPressureSupport *
      (interactions.phaseFractions.ice + interactions.phaseFractions.liquid);
    const disabled = surfacePhaseSupport <= CONTROL_SUPPORT_EPSILON;
    const constraint =
      interactions.exposedWaterPressureSupport <= CONTROL_SUPPORT_EPSILON
        ? "requiresWaterPressure"
        : disabled
          ? "surfaceWaterBoils"
          : surfacePhaseSupport < 1 - CONTROL_SUPPORT_EPSILON
            ? "surfaceWaterLimited"
            : null;
    return {
      disabled,
      displayedValue: interactions.surfaceWaterFraction * 100,
      preferredValue,
      constraint,
    };
  }

  if (id === "humidity") {
    const fullPreferenceState = deriveWorldInteractionState({
      ...world,
      humidity: 1,
    });
    const humiditySupport = fullPreferenceState.effectiveHumidity;
    const disabled = humiditySupport <= CONTROL_SUPPORT_EPSILON;
    const constraint =
      world.atmosphericPressureAtm < ATMOSPHERE_CONTROL_MIN_PRESSURE_ATM
        ? "requiresAtmosphere"
        : !interactions.supportsSurfaceWater
          ? "requiresSurfaceWater"
          : humiditySupport < 1 - CONTROL_SUPPORT_EPSILON
            ? "humidityLimitedByWater"
            : null;
    return {
      disabled,
      displayedValue: interactions.effectiveHumidity * 100,
      preferredValue,
      constraint,
    };
  }

  return {
    disabled: false,
    displayedValue: preferredValue,
    preferredValue,
    constraint: null,
  };
}

/** Applies one user preference without erasing independent inputs that are temporarily ineffective. */
export function applyWorldParameterChange(
  world: WorldParameters,
  id: WorldEngineeringParameterId,
  value: number,
): WorldParameters {
  if (id === "oxygen" || id === "carbonDioxide") {
    const composition = world.atmosphereComposition;
    const oxygenFraction = id === "oxygen" ? value / 100 : composition.oxygenFraction;
    const carbonDioxideFraction =
      id === "carbonDioxide" ? value / 100 : composition.carbonDioxideFraction;
    const nitrogenFraction =
      1 -
      oxygenFraction -
      carbonDioxideFraction -
      composition.inertGasFraction -
      composition.toxicGasFraction;

    return WorldParametersSchema.parse({
      ...world,
      atmosphereComposition: {
        ...composition,
        oxygenFraction,
        carbonDioxideFraction,
        nitrogenFraction,
      },
    });
  }

  const patch: Partial<WorldParameters> =
    id === "gravity"
      ? { gravityG: value }
      : id === "temperature"
        ? { averageTemperatureC: value }
        : id === "temperatureVariation"
          ? { temperatureVariationC: value }
          : id === "pressure"
            ? { atmosphericPressureAtm: value }
            : id === "water"
              ? { waterAvailability: value / 100 }
              : id === "radiation"
                ? { radiationDoseRate: { value, unit: "mSv/h" } }
                : id === "light"
                  ? { lightLevel: value / 100 }
                  : id === "humidity"
                    ? { humidity: value / 100 }
                    : { magneticFieldStrengthEarth: value };

  return WorldParametersSchema.parse({ ...world, ...patch });
}

/** Applies a value expressed in the effective units displayed by the UI control. */
export function applyWorldEngineeringControlChange(
  world: WorldParameters,
  id: WorldEngineeringParameterId,
  displayedValue: number,
): WorldParameters {
  if (id === "oxygen" || id === "carbonDioxide") {
    if (world.atmosphericPressureAtm < ATMOSPHERE_CONTROL_MIN_PRESSURE_ATM) {
      return world;
    }
    return applyWorldParameterChange(
      world,
      id,
      (displayedValue / world.atmosphericPressureAtm) * 100,
    );
  }

  if (id === "water") {
    const unitWaterState = deriveWorldInteractionState({
      ...world,
      waterAvailability: 1,
    });
    const surfaceSupport = unitWaterState.surfaceWaterFraction;
    if (surfaceSupport <= CONTROL_SUPPORT_EPSILON) return world;
    return applyWorldParameterChange(
      world,
      id,
      Math.min(100, Math.max(0, displayedValue / surfaceSupport)),
    );
  }

  if (id === "humidity") {
    const fullPreferenceState = deriveWorldInteractionState({
      ...world,
      humidity: 1,
    });
    const humiditySupport = fullPreferenceState.effectiveHumidity;
    if (humiditySupport <= CONTROL_SUPPORT_EPSILON) return world;
    return applyWorldParameterChange(
      world,
      id,
      Math.min(100, Math.max(0, displayedValue / humiditySupport)),
    );
  }

  return applyWorldParameterChange(world, id, displayedValue);
}

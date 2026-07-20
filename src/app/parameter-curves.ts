import type { ParameterId } from "./copy";

/** Upper low-range value reserved for the first half of the radiation slider. */
export const RADIATION_LOW_RANGE_MAX_MILLI_SV_PER_HOUR = 0.52;

/** Upper low-range value reserved for the first half of the carbon-dioxide slider. */
export const CARBON_DIOXIDE_LOW_RANGE_MAX_ATM = 0.001;

/** Upper low-range value reserved for the first half of the water slider. */
export const WATER_LOW_RANGE_MAX_PERCENT = 25;

/** Returns the pivot used by a slider that reserves half its travel for low values. */
function getSplitRangePivot(
  id: ParameterId,
  min: number,
  max: number,
): number | null {
  const pivot =
    id === "temperature"
      ? 90
      : id === "radiation"
        ? RADIATION_LOW_RANGE_MAX_MILLI_SV_PER_HOUR
        : id === "carbonDioxide"
          ? CARBON_DIOXIDE_LOW_RANGE_MAX_ATM
          : id === "water"
            ? WATER_LOW_RANGE_MAX_PERCENT
          : null;
  return pivot !== null && min < pivot && pivot < max ? pivot : null;
}

/** Maps a displayed parameter value to its native slider position. */
export function deriveParameterSliderPosition(
  id: ParameterId,
  value: number,
  min: number,
  max: number,
): number {
  const pivot = getSplitRangePivot(id, min, max);
  if (pivot === null) return max > min ? ((value - min) / (max - min)) * 100 : 0;
  return value <= pivot
    ? ((value - min) / (pivot - min)) * 50
    : 50 + ((value - pivot) / (max - pivot)) * 50;
}

/** Converts a native slider position back to the displayed parameter value. */
export function deriveParameterValueFromSliderPosition(
  id: ParameterId,
  position: number,
  min: number,
  max: number,
  step: number,
): number {
  const pivot = getSplitRangePivot(id, min, max);
  const unclampedValue =
    pivot === null
      ? min + (position / 100) * (max - min)
      : position <= 50
        ? min + (position / 50) * (pivot - min)
        : pivot + ((position - 50) / 50) * (max - pivot);
  const roundedValue = Math.round(unclampedValue / step) * step;
  return Math.min(max, Math.max(min, roundedValue));
}

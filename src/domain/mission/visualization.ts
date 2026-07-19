import { normalizeWorldParameters } from "../world/schema";
import type { WorldParameters } from "../world/schema";

/** Deterministic presentation values for the code-rendered planet preview. */
export type PlanetVisualState = {
  terrainHue: number;
  atmosphereHue: number;
  atmosphereOpacity: number;
  atmosphereScale: number;
  gravityScaleY: number;
  illumination: number;
  waterCoverage: number;
  thermalContrast: number;
  radiationActivity: number;
  shieldingVisibility: number;
  chemistryGlow: number;
  cloudOpacity: number;
  /** Uniform surface reflectance used without introducing a simulated day-night cycle. */
  surfaceBrightness: number;
  /** Cinematic ice-cap coverage derived from water availability and average temperature. */
  iceCoverage: number;
  /** Controls the density of non-scientific terrain texture in the preview. */
  surfaceDetail: number;
  habitat: WorldParameters["habitat"];
};

const HABITAT_HUE_OFFSET: Record<WorldParameters["habitat"], number> = {
  "open surface": 0,
  desert: 24,
  "shallow water": -18,
  "deep ocean": -32,
  cave: -8,
  "forest-like biome": 78,
  "ice surface": 155,
  "high atmosphere": 185,
};

const GEOCHEMICAL_ACTIVITY: Record<
  WorldParameters["geochemicalEnergyAvailability"],
  number
> = {
  none: 0,
  low: 0.28,
  moderate: 0.58,
  high: 1,
};

const ELECTRON_ACCEPTOR_ACTIVITY: Record<
  WorldParameters["electronAcceptors"][number],
  number
> = {
  nitrate: 0.05,
  sulfate: 0.08,
  ferricIron: 0.12,
  carbonDioxide: 0.15,
};

/** Restricts an aesthetic mapping to a normalized visual range. */
function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Maps every validated world input to a stable visual interpretation, not a scientific result. */
export function derivePlanetVisualState(world: WorldParameters): PlanetVisualState {
  const normalized = normalizeWorldParameters(world);
  const composition = normalized.atmosphereComposition;
  const densityInfluence = clamp01((normalized.atmosphericDensityKgM3 ?? 0) / 5);
  const chemistryGlow = clamp01(
    GEOCHEMICAL_ACTIVITY[normalized.geochemicalEnergyAvailability] * 0.75 +
      normalized.electronAcceptors.reduce(
        (total, acceptor) => total + ELECTRON_ACCEPTOR_ACTIVITY[acceptor],
        0,
      ),
  );

  return {
    terrainHue:
      (205 - normalized.averageTemperatureC * 0.75 +
        HABITAT_HUE_OFFSET[normalized.habitat] +
        360) %
      360,
    atmosphereHue:
      (195 +
        composition.oxygenFraction * 80 +
        composition.carbonDioxideFraction * 240 +
        composition.inertGasFraction * 60 -
        composition.toxicGasFraction * 120 +
        360) %
      360,
    atmosphereOpacity: clamp01(
      0.18 + normalized.atmosphericPressureAtm / 8 + densityInfluence * 0.2,
    ),
    atmosphereScale: 1.04 + clamp01(normalized.atmosphericPressureAtm / 10) * 0.12,
    gravityScaleY: 1.06 - clamp01((normalized.gravityG - 0.05) / 4.95) * 0.18,
    illumination: 0.2 + normalized.lightLevel * 0.8,
    waterCoverage: normalized.waterAvailability,
    thermalContrast: clamp01(normalized.temperatureVariationC / 60),
    radiationActivity: clamp01(
      Math.log10(1 + normalized.radiationDoseRateMilliSvPerHour * 10) / 2,
    ),
    shieldingVisibility: clamp01(
      Math.log10(1 + normalized.shieldingColumnMassKgM2) / 4,
    ),
    chemistryGlow,
    cloudOpacity: clamp01(
      normalized.waterAvailability * 0.55 +
        normalized.atmosphericPressureAtm / 10 +
        composition.carbonDioxideFraction * 2,
    ),
    surfaceBrightness: 0.35 + normalized.lightLevel * 0.5,
    iceCoverage: clamp01(
      ((8 - normalized.averageTemperatureC) / 48) *
        (0.35 + normalized.waterAvailability * 0.65),
    ),
    surfaceDetail: clamp01(
      0.25 +
        normalized.waterAvailability * 0.3 +
        normalized.temperatureVariationC / 160 +
        composition.oxygenFraction * 0.3,
    ),
    habitat: normalized.habitat,
  };
}

import { z } from "zod";

/** The deterministic ruleset version emitted with normalized input. */
export const RULESET_VERSION = "0.1.0";

/** Accepted numerical tolerance for atmospheric fractions that should sum to one. */
export const ATMOSPHERIC_COMPOSITION_SUM_TOLERANCE = 0.000_001;

/** Converts a pressure expressed in atmospheres to pascals. */
export const ATMOSPHERES_TO_PASCALS = 101_325;

/** Universal gas constant in joules per mole kelvin. */
export const UNIVERSAL_GAS_CONSTANT_J_PER_MOL_K = 8.314_462_618;

/** Converts Celsius values to absolute temperature in kelvin. */
export const CELSIUS_TO_KELVIN_OFFSET = 273.15;

/** Coldest editable mean temperature, kept just above absolute zero. */
export const MIN_AVERAGE_TEMPERATURE_C = -273;

/** Hottest editable mean temperature, sufficient for a molten rocky surface. */
export const MAX_AVERAGE_TEMPERATURE_C = 1_800;

/** Maximum exposed surface pressure represented by the planet-engineering control. */
export const MAX_EFFECTIVE_SURFACE_PRESSURE_ATM = 5;

/** Educational immediate-retention scale used to cap pressure by surface gravity. */
export const GRAVITY_PRESSURE_CAP_ATM_PER_G_SQUARED = 5;

/** Derives the pressure ceiling available at a supplied surface gravity. */
export function deriveGravityPressureLimitAtm(gravityG: number): number {
  const pressureLimit = Math.min(
    MAX_EFFECTIVE_SURFACE_PRESSURE_ATM,
    Math.pow(Math.max(0, gravityG), 2) *
      GRAVITY_PRESSURE_CAP_ATM_PER_G_SQUARED,
  );
  return Math.round(pressureLimit * 1_000_000_000) / 1_000_000_000;
}

/** Applies the gravity ceiling immediately without mutating the stored pressure preference. */
export function deriveEffectiveAtmosphericPressureAtm(
  gravityG: number,
  atmosphericPressureAtm: number,
): number {
  return Math.min(
    Math.max(0, atmosphericPressureAtm),
    deriveGravityPressureLimitAtm(gravityG),
  );
}

/** Supported habitats for the MVP deterministic model. */
export const HabitatSchema = z.enum([
  "open surface",
  "desert",
  "shallow water",
  "deep ocean",
  "cave",
  "forest-like biome",
  "ice surface",
  "high atmosphere",
]);

/** Supported radiation dose-rate units accepted at the input boundary. */
export const RadiationDoseRateUnitSchema = z.enum(["mSv/h", "Sv/h"]);

/** Electron acceptors that may support an explicitly supplied geochemical energy source. */
export const ElectronAcceptorSchema = z.enum([
  "nitrate",
  "sulfate",
  "ferricIron",
  "carbonDioxide",
]);

/** Qualitative availability of a usable geochemical redox gradient. */
export const GeochemicalEnergyAvailabilitySchema = z.enum([
  "none",
  "low",
  "moderate",
  "high",
]);

/** Atmospheric fractions used by the initial deterministic ruleset. */
export const AtmosphereCompositionSchema = z
  .object({
    oxygenFraction: z.number().finite().min(0).max(1),
    carbonDioxideFraction: z.number().finite().min(0).max(1),
    nitrogenFraction: z.number().finite().min(0).max(1),
    inertGasFraction: z.number().finite().min(0).max(1),
    toxicGasFraction: z.number().finite().min(0).max(1),
  })
  .strict()
  .superRefine((composition, context) => {
    const total =
      composition.oxygenFraction +
      composition.carbonDioxideFraction +
      composition.nitrogenFraction +
      composition.inertGasFraction +
      composition.toxicGasFraction;

    if (Math.abs(total - 1) > ATMOSPHERIC_COMPOSITION_SUM_TOLERANCE) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Atmospheric composition fractions must sum to 1.",
      });
    }
  });

/** The unnormalized radiation dose-rate value supplied by a user. */
export const RadiationDoseRateSchema = z
  .object({
    value: z.number().finite().min(0),
    unit: RadiationDoseRateUnitSchema,
  })
  .strict();

/** Authoritative, externally supplied world parameters for the deterministic model. */
export const WorldParametersSchema = z
  .object({
    gravityG: z.number().finite().min(0.05).max(5),
    atmosphericPressureAtm: z.number().finite().min(0).max(5),
    atmosphereComposition: AtmosphereCompositionSchema,
    averageTemperatureC: z
      .number()
      .finite()
      .min(MIN_AVERAGE_TEMPERATURE_C)
      .max(MAX_AVERAGE_TEMPERATURE_C),
    temperatureVariationC: z.number().finite().min(0).max(100),
    radiationDoseRate: RadiationDoseRateSchema,
    lightLevel: z.number().finite().min(0).max(1),
    waterAvailability: z.number().finite().min(0).max(1),
    humidity: z.number().finite().min(0).max(1).default(0.45),
    magneticFieldStrengthEarth: z.number().finite().min(0).max(5).default(0.7),
    habitat: HabitatSchema,
    shieldingColumnMassKgM2: z.number().finite().min(0).default(0),
    geochemicalEnergyAvailability: GeochemicalEnergyAvailabilitySchema.default(
      "none",
    ),
    electronAcceptors: z
      .array(ElectronAcceptorSchema)
      .max(4)
      .refine(
        (acceptors) => new Set(acceptors).size === acceptors.length,
        "Electron acceptors must not contain duplicates.",
      )
      .default([]),
    atmosphericMeanMolarMassKgPerMol: z
      .number()
      .finite()
      .min(0.002)
      .max(0.2)
      .optional(),
  })
  .strict()
  .superRefine((parameters, context) => {
    if (
      parameters.averageTemperatureC - parameters.temperatureVariationC <
      MIN_AVERAGE_TEMPERATURE_C
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["temperatureVariationC"],
        message: "Configured minimum temperature cannot be below absolute zero.",
      });
    }

    if (
      parameters.habitat === "high atmosphere" &&
      parameters.atmosphericMeanMolarMassKgPerMol === undefined
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["atmosphericMeanMolarMassKgPerMol"],
        message:
          "High-atmosphere worlds require a mean atmospheric molar mass to derive local density.",
      });
    }

    if (
      parameters.geochemicalEnergyAvailability === "none" &&
      parameters.electronAcceptors.length > 0
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["electronAcceptors"],
        message:
          "Electron acceptors require a declared usable geochemical energy source.",
      });
    }
  });

/** A validated world-parameter value with optional defaults resolved. */
export type WorldParameters = z.output<typeof WorldParametersSchema>;

/** Input accepted by the world-parameter boundary before schema defaults are applied. */
export type WorldParametersInput = z.input<typeof WorldParametersSchema>;

/** The inclusive temperature limits derived from the configured symmetric half-range. */
export type TemperatureRangeC = {
  minimum: number;
  maximum: number;
};

/** Validated world parameters enriched with deterministic derived values. */
export type NormalizedWorldParameters = WorldParameters & {
  radiationDoseRateMilliSvPerHour: number;
  temperatureRangeC: TemperatureRangeC;
  effectiveAtmosphericPressureAtm: number;
  oxygenPartialPressureAtm: number;
  atmosphericDensityKgM3?: number;
  hasUsableAlternativeEnergyPathway: boolean;
};

/** Converts a validated radiation dose rate to millisieverts per hour. */
export function normalizeRadiationDoseRateMilliSvPerHour(
  radiationDoseRate: WorldParameters["radiationDoseRate"],
): number {
  return radiationDoseRate.unit === "Sv/h"
    ? radiationDoseRate.value * 1_000
    : radiationDoseRate.value;
}

/** Derives the lower and upper temperatures from the configured symmetric half-range. */
export function deriveTemperatureRangeC(
  averageTemperatureC: number,
  temperatureVariationC: number,
): TemperatureRangeC {
  return {
    minimum: averageTemperatureC - temperatureVariationC,
    maximum: averageTemperatureC + temperatureVariationC,
  };
}

/** Calculates oxygen partial pressure from total local pressure and oxygen fraction. */
export function calculateOxygenPartialPressureAtm(
  atmosphericPressureAtm: number,
  oxygenFraction: number,
): number {
  return atmosphericPressureAtm * oxygenFraction;
}

/** Calculates local atmospheric density from the ideal-gas relationship ρ = pM / RT. */
export function calculateAtmosphericDensityKgM3(
  atmosphericPressureAtm: number,
  averageTemperatureC: number,
  atmosphericMeanMolarMassKgPerMol: number,
): number {
  const pressurePascals = atmosphericPressureAtm * ATMOSPHERES_TO_PASCALS;
  const temperatureKelvin = averageTemperatureC + CELSIUS_TO_KELVIN_OFFSET;

  return (
    (pressurePascals * atmosphericMeanMolarMassKgPerMol) /
    (UNIVERSAL_GAS_CONSTANT_J_PER_MOL_K * temperatureKelvin)
  );
}

/** Reports whether the supplied inputs establish a modelled non-aerobic energy pathway. */
export function hasUsableAlternativeEnergyPathway(
  parameters: Pick<
    WorldParameters,
    "geochemicalEnergyAvailability" | "electronAcceptors"
  >,
): boolean {
  return (
    parameters.geochemicalEnergyAvailability !== "none" &&
    parameters.electronAcceptors.length > 0
  );
}

/** Validates external input and derives values needed by later deterministic rules. */
export function normalizeWorldParameters(
  input: WorldParametersInput,
): NormalizedWorldParameters {
  const parameters = WorldParametersSchema.parse(input);
  const effectiveAtmosphericPressureAtm = deriveEffectiveAtmosphericPressureAtm(
    parameters.gravityG,
    parameters.atmosphericPressureAtm,
  );
  const atmosphericDensityKgM3 =
    parameters.atmosphericMeanMolarMassKgPerMol === undefined
      ? undefined
      : calculateAtmosphericDensityKgM3(
          effectiveAtmosphericPressureAtm,
          parameters.averageTemperatureC,
          parameters.atmosphericMeanMolarMassKgPerMol,
        );

  return {
    ...parameters,
    radiationDoseRateMilliSvPerHour:
      normalizeRadiationDoseRateMilliSvPerHour(parameters.radiationDoseRate),
    temperatureRangeC: deriveTemperatureRangeC(
      parameters.averageTemperatureC,
      parameters.temperatureVariationC,
    ),
    effectiveAtmosphericPressureAtm,
    oxygenPartialPressureAtm: calculateOxygenPartialPressureAtm(
      effectiveAtmosphericPressureAtm,
      parameters.atmosphereComposition.oxygenFraction,
    ),
    atmosphericDensityKgM3,
    hasUsableAlternativeEnergyPathway:
      hasUsableAlternativeEnergyPathway(parameters),
  };
}

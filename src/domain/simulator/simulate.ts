import { normalizeWorldParameters } from "../world/schema";
import {
  deriveEffectiveRadiationDose,
  deriveWorldInteractionState,
} from "../world/interactions";
import { SIMULATOR_CONVENTIONS } from "./coefficients";
import {
  SIMULATOR_VERSION,
  SurvivalSimulationRequestSchema,
  SurvivalSimulationResultSchema,
} from "./schema";
import type {
  RegionId,
  SimulationMetricId,
  SurvivalSimulationRequest,
  SurvivalSimulationResult,
} from "./schema";
import {
  calculateTraitCost,
  hasTraitConflict,
  LIFE_ENERGY_BUDGET,
  sumTraitModifiers,
} from "./traits";

/** Restricts a deterministic suitability component to its normalized range. */
function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Produces a smooth suitability curve around a documented ideal value. */
function bell(value: number, ideal: number, width: number): number {
  return Math.exp(-Math.pow((value - ideal) / width, 2));
}

/** Creates a stable FNV-1a state hash for caching and reproducibility labels. */
export function hashSimulationState(value: unknown): string {
  const text = JSON.stringify(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `xl-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

/** Runs the continuous deterministic habitability, compatibility, and population model. */
export function runSurvivalSimulation(
  rawRequest: SurvivalSimulationRequest,
): SurvivalSimulationResult {
  const request = SurvivalSimulationRequestSchema.parse(rawRequest);
  const convention = SIMULATOR_CONVENTIONS;
  const world = normalizeWorldParameters(request.planet.world);
  const modifiers = sumTraitModifiers(request.traitIds);
  const traitCost = calculateTraitCost(request.traitIds);
  if (traitCost > LIFE_ENERGY_BUDGET) {
    throw new RangeError("Selected lifeform traits exceed the biological energy budget.");
  }
  for (const [index, traitId] of request.traitIds.entries()) {
    if (hasTraitConflict(request.traitIds.slice(0, index), traitId)) {
      throw new RangeError("Selected lifeform traits contain an incompatible combination.");
    }
  }
  const energyOverrun = clamp01(
    (traitCost - LIFE_ENERGY_BUDGET) / convention.energyOverrunScale,
  );
  const effectiveRadiation = deriveEffectiveRadiationDose(
    world.radiationDoseRateMilliSvPerHour,
    world.magneticFieldStrengthEarth,
  );

  // Independent user inputs are preserved; only their derived physical expression is coupled.
  const interactions = deriveWorldInteractionState(world);
  const effectivePressureAtm = world.atmosphericPressureAtm;
  const effectiveOxygenPartialPressureAtm = world.oxygenPartialPressureAtm;
  const effectiveMinimumTemperatureC = world.temperatureRangeC.minimum;
  const effectiveMaximumTemperatureC = world.temperatureRangeC.maximum;
  const availableSurfaceWater = interactions.surfaceWaterFraction;
  const liquidWater = interactions.liquidWaterFraction;
  const retainedHumidity = interactions.effectiveHumidity;
  const carbonDioxideFraction =
    world.atmosphereComposition.carbonDioxideFraction;
  const excessCarbonDioxide = clamp01(
    (carbonDioxideFraction - convention.carbonDioxide.excessStartFraction) /
      convention.carbonDioxide.excessScaleFraction,
  );
  // A zero-pressure world has no atmosphere regardless of its latent composition fractions.
  const pressurePresence = interactions.atmospherePresence;
  const atmosphere = clamp01((
    bell(
      effectivePressureAtm,
      convention.atmosphere.pressureIdealAtm,
      convention.atmosphere.pressureWidthAtm,
    ) * convention.atmosphere.pressureWeight +
      bell(
        effectiveOxygenPartialPressureAtm,
        convention.atmosphere.oxygenIdealAtm,
        convention.atmosphere.oxygenWidthAtm,
      ) * convention.atmosphere.oxygenWeight +
      (1 - world.atmosphereComposition.toxicGasFraction) *
        convention.atmosphere.nonToxicWeight -
      excessCarbonDioxide * convention.carbonDioxide.atmospherePenalty) *
      pressurePresence,
  );
  const thermalStability = clamp01(
    bell(
      world.averageTemperatureC,
      convention.thermal.idealC,
      convention.thermal.widthC,
    ) * convention.thermal.meanWeight +
      bell(
        effectiveMinimumTemperatureC,
        convention.thermal.idealC,
        convention.thermal.widthC,
      ) * convention.thermal.minimumWeight +
      bell(
        effectiveMaximumTemperatureC,
        convention.thermal.idealC,
        convention.thermal.widthC,
      ) * convention.thermal.maximumWeight +
      (modifiers.thermalCold ?? 0) *
        clamp01(
          (convention.thermal.coldReferenceC -
            effectiveMinimumTemperatureC) /
            convention.thermal.coldScaleC,
        ) +
      (modifiers.thermalHeat ?? 0) *
        clamp01(
          (effectiveMaximumTemperatureC -
            convention.thermal.heatReferenceC) /
            convention.thermal.heatScaleC,
        ),
  );
  const radiationSafety = clamp01(
    Math.exp(
      -effectiveRadiation /
        convention.radiation.safetyDecayMilliSvPerHour,
    ) +
      (modifiers.radiationTolerance ?? 0),
  );
  const geochemicalEnergy =
    convention.geochemicalEnergy[world.geochemicalEnergyAvailability] *
    (world.electronAcceptors.length > 0 ? 1 : 0);
  const carbonAvailability = clamp01(
    (1 -
      Math.exp(
        -carbonDioxideFraction /
          convention.carbonDioxide.availabilityScaleFraction,
      )) *
      (1 -
        excessCarbonDioxide *
          convention.carbonDioxide.availabilityExcessPenalty),
  );
  const biologicalEnergy = clamp01(
    world.lightLevel * convention.biologicalEnergy.lightWeight +
      geochemicalEnergy * convention.biologicalEnergy.geochemicalWeight +
      liquidWater * convention.biologicalEnergy.liquidWaterWeight +
      retainedHumidity * convention.biologicalEnergy.humidityWeight +
      carbonAvailability * convention.biologicalEnergy.carbonWeight +
      (modifiers.lightEnergy ?? 0) * world.lightLevel +
      (modifiers.chemicalEnergy ?? 0) * geochemicalEnergy -
      energyOverrun * convention.biologicalEnergy.overrunPenalty -
      excessCarbonDioxide * convention.carbonDioxide.energyPenalty,
  );

  const has = (trait: SurvivalSimulationRequest["traitIds"][number]) =>
    request.traitIds.includes(trait);
  // Aerobic pathways approach zero continuously and cannot operate at zero oxygen.
  const oxygenAvailability =
    1 -
    Math.exp(
      -effectiveOxygenPartialPressureAtm /
        convention.metabolism.oxygenAvailabilityScaleAtm,
    );
  const oxygenMetabolism = has("oxygenRespiration")
    ? bell(
        effectiveOxygenPartialPressureAtm,
        convention.metabolism.oxygenIdealAtm,
        convention.metabolism.oxygenWidthAtm,
      ) * oxygenAvailability
    : 0;
  const lowOxygenMetabolism = has("lowOxygenMetabolism")
    ? bell(
        effectiveOxygenPartialPressureAtm,
        convention.metabolism.lowOxygenIdealAtm,
        convention.metabolism.lowOxygenWidthAtm,
      ) * oxygenAvailability
    : 0;
  const anaerobicMetabolism = has("anaerobicMetabolism")
    ? geochemicalEnergy * convention.metabolism.anaerobicEnergyFactor
    : 0;
  const metabolicViability = clamp01(
    Math.max(
      oxygenMetabolism,
      lowOxygenMetabolism,
      anaerobicMetabolism,
      convention.metabolism.minimumPathwayScore,
    ) * convention.metabolism.pathwayWeight +
      biologicalEnergy * convention.metabolism.biologicalEnergyWeight +
      (modifiers.oxygenEfficiency ?? 0) *
        convention.metabolism.oxygenModifierWeight *
        oxygenAvailability +
      (modifiers.alternativeMetabolism ?? 0) *
        geochemicalEnergy *
        convention.metabolism.alternativeModifierWeight,
  );

  const gravityFitness = clamp01(
    bell(
      world.gravityG,
      convention.physicalFitness.gravityIdealG,
      convention.physicalFitness.gravityWidthG,
    ) +
      (modifiers.gravityTolerance ?? 0) *
        clamp01(
          world.gravityG /
            convention.physicalFitness.gravityModifierScaleG,
        ),
  );
  const pressureFitness = clamp01(
    (
      bell(
        effectivePressureAtm,
        convention.physicalFitness.pressureIdealAtm,
        convention.physicalFitness.pressureWidthAtm,
      ) +
        (modifiers.pressureTolerance ?? 0) *
          clamp01(
            Math.abs(
              effectivePressureAtm -
                convention.physicalFitness.pressureIdealAtm,
            ) / convention.physicalFitness.pressureModifierScaleAtm,
          )
    ) *
      pressurePresence,
  );
  const hydration = clamp01(
    liquidWater * convention.hydration.liquidWaterWeight +
      retainedHumidity * convention.hydration.humidityWeight +
      (modifiers.hydration ?? 0) * (1 - liquidWater),
  );
  const movement = clamp01(
    convention.movement.base +
      (modifiers.movement ?? 0) +
      (has("aquaticMovement")
        ? liquidWater * convention.movement.aquaticWaterWeight
        : 0) +
      (has("terrestrialMovement")
        ? (1 -
            availableSurfaceWater *
              convention.movement.terrestrialWaterPenalty) *
          convention.movement.terrestrialWeight
        : 0) +
      (has("aerialMovement")
        ? clamp01(
            (world.atmosphericDensityKgM3 ?? 0) /
              convention.movement.aerialDensityScaleKgM3,
          ) * convention.movement.aerialDensityWeight -
          clamp01(
            (world.gravityG - convention.movement.aerialGravityStartG) /
              convention.movement.aerialGravityScaleG,
          ) * convention.movement.aerialGravityPenalty
        : 0),
  );

  const regionScores: Record<RegionId, number> = {
    coastal: clamp01(
      liquidWater * convention.regions.coastal.liquidWater +
        thermalStability * convention.regions.coastal.thermal +
        biologicalEnergy * convention.regions.coastal.energy +
        hydration * convention.regions.coastal.hydration,
    ),
    equatorial: clamp01(
      bell(
        effectiveMaximumTemperatureC,
        convention.regions.equatorial.temperatureIdealC,
        convention.regions.equatorial.temperatureWidthC,
      ) * convention.regions.equatorial.temperature +
        world.lightLevel * convention.regions.equatorial.light +
        atmosphere * convention.regions.equatorial.atmosphere +
        radiationSafety * convention.regions.equatorial.radiation,
    ),
    polar: clamp01(
      bell(
        effectiveMinimumTemperatureC,
        convention.regions.polar.temperatureIdealC,
        convention.regions.polar.temperatureWidthC,
      ) * convention.regions.polar.temperature +
        liquidWater * convention.regions.polar.liquidWater +
        radiationSafety * convention.regions.polar.radiation +
        (modifiers.thermalCold ?? 0) *
          convention.regions.polar.coldModifier,
    ),
    deepOcean: clamp01(
      liquidWater * convention.regions.deepOcean.water +
        (has("aquaticMovement")
          ? convention.regions.deepOcean.aquaticMovement
          : 0) +
        pressureFitness * convention.regions.deepOcean.pressure +
        geochemicalEnergy * convention.regions.deepOcean.geochemical +
        radiationSafety * convention.regions.deepOcean.radiation,
    ),
    underground: clamp01(
      radiationSafety * convention.regions.underground.radiation +
        geochemicalEnergy * convention.regions.underground.geochemical +
        pressureFitness * convention.regions.underground.pressure +
        hydration * convention.regions.underground.hydration +
        (has("chemosynthesis")
          ? convention.regions.underground.chemosynthesis
          : 0),
    ),
    highAltitude: clamp01(
      atmosphere * convention.regions.highAltitude.atmosphere +
        radiationSafety * convention.regions.highAltitude.radiation +
        gravityFitness * convention.regions.highAltitude.gravity +
        movement * convention.regions.highAltitude.movement +
        (has("aerialMovement")
          ? convention.regions.highAltitude.aerialMovement
          : 0) +
        (modifiers.oxygenEfficiency ?? 0) *
          convention.regions.highAltitude.oxygenModifier,
    ),
  };

  const bestRegion = Math.max(...Object.values(regionScores));
  const organismCompatibility = clamp01(
    gravityFitness * convention.organismCompatibility.gravity +
      pressureFitness * convention.organismCompatibility.pressure +
      thermalStability * convention.organismCompatibility.thermal +
      radiationSafety * convention.organismCompatibility.radiation +
      hydration * convention.organismCompatibility.hydration +
      metabolicViability * convention.organismCompatibility.metabolism +
      movement * convention.organismCompatibility.movement +
      bestRegion * convention.organismCompatibility.bestRegion -
      energyOverrun * convention.organismCompatibility.overrunPenalty,
  );
  const reproductionPotential = clamp01(
    organismCompatibility * convention.reproduction.compatibility +
      biologicalEnergy * convention.reproduction.energy +
      hydration * convention.reproduction.hydration +
      (modifiers.reproduction ?? 0) *
        convention.reproduction.traitModifier -
      Math.max(0, modifiers.complexity ?? 0) *
        convention.reproduction.complexityPenalty,
  );
  const adaptability = clamp01(
    convention.adaptability.base +
      (modifiers.adaptability ?? 0) +
      bestRegion * convention.adaptability.bestRegion,
  );
  const populationStability = clamp01(
    organismCompatibility * convention.populationStability.compatibility +
      reproductionPotential * convention.populationStability.reproduction +
      bestRegion * convention.populationStability.bestRegion +
      adaptability * convention.populationStability.adaptability,
  );
  const ecosystemPotential = clamp01(
    populationStability * convention.ecosystem.populationStability +
      biologicalEnergy * convention.ecosystem.energy +
      liquidWater * convention.ecosystem.liquidWater +
      atmosphere * convention.ecosystem.atmosphere +
      thermalStability * convention.ecosystem.thermal,
  );
  const complexity = clamp01(
    convention.complexity.base +
      (modifiers.complexity ?? 0) +
      request.traitIds.length * convention.complexity.perTrait -
      energyOverrun * convention.complexity.overrunPenalty,
  );
  const advancedLifePotential = clamp01(
    ecosystemPotential * convention.advancedLife.ecosystem +
      metabolicViability * convention.advancedLife.metabolism +
      adaptability * convention.advancedLife.adaptability +
      complexity * convention.advancedLife.complexity,
  );

  const metrics = {
    liquidWater,
    atmosphere,
    thermalStability,
    radiationSafety,
    biologicalEnergy,
    metabolicViability,
    organismCompatibility,
    reproductionPotential,
    populationStability,
    ecosystemPotential,
    advancedLifePotential,
  };

  const carryingCapacity = Math.round(
    convention.population.capacityBase *
      ecosystemPotential *
      Math.pow(
        Math.max(convention.population.minimumRegionFactor, bestRegion),
        convention.population.regionExponent,
      ) *
      (convention.population.energyBase +
        biologicalEnergy * convention.population.energyWeight),
  );
  const growthRate =
    convention.population.growthBase +
    reproductionPotential * convention.population.reproductionGrowth +
    adaptability * convention.population.adaptabilityGrowth;
  const mortalityPressure =
    (1 - organismCompatibility) *
      convention.population.incompatibilityMortality +
    energyOverrun * convention.population.overrunMortality;
  const populationTimeline = [{ generation: 0, population: request.initialPopulation }];
  let population = request.initialPopulation;
  for (
    let generation = 1;
    generation <= convention.population.generations;
    generation += 1
  ) {
    const capacity = Math.max(1, carryingCapacity);
    const logisticGrowth = growthRate * population * (1 - population / capacity);
    const mortality = mortalityPressure * population;
    population = Math.max(0, population + logisticGrowth - mortality);
    if (
      organismCompatibility < convention.population.collapseCompatibility
    ) {
      population *= convention.population.collapseRetention;
    }
    populationTimeline.push({ generation, population: Math.round(population) });
  }

  const populations = populationTimeline.map(({ population: value }) => value);
  const peakPopulation = Math.max(...populations);
  const finalPopulation = populations.at(-1) ?? 0;
  const missionSuccess =
    advancedLifePotential >= convention.missionSuccess.advancedLife &&
    ecosystemPotential >= convention.missionSuccess.ecosystem &&
    finalPopulation >= convention.missionSuccess.finalPopulation;
  let outcome: SurvivalSimulationResult["outcome"];
  if (
    finalPopulation === 0 ||
    organismCompatibility < convention.outcomes.extinctionCompatibility
  ) {
    outcome = "immediateExtinction";
  } else if (
    finalPopulation <
    request.initialPopulation * convention.outcomes.temporaryPopulationFraction
  ) {
    outcome = "temporarySurvival";
  } else if (
    bestRegion >= convention.regions.habitableScore &&
    organismCompatibility < convention.outcomes.refugeCompatibility
  ) {
    outcome = "regionalRefuge";
  } else if (
    advancedLifePotential >= convention.outcomes.advancedLife &&
    missionSuccess
  ) {
    outcome = "advancedAdaptiveLife";
  } else if (
    ecosystemPotential >= convention.outcomes.multicellularEcosystem &&
    populationStability >= convention.outcomes.multicellularStability
  ) {
    outcome = "stableMulticellularEcosystem";
  } else if (
    finalPopulation >
      carryingCapacity * convention.outcomes.dominanceCapacityFraction &&
    populationStability < convention.outcomes.dominanceStability
  ) {
    outcome = "unstableDominance";
  } else if (
    finalPopulation >
    request.initialPopulation * convention.outcomes.expandingPopulationMultiplier
  ) {
    outcome = "expandingPopulation";
  } else {
    outcome = "stableSimplePopulation";
  }

  const sortedMetrics = (Object.entries(metrics) as Array<[SimulationMetricId, number]>).sort(
    (first, second) => second[1] - first[1],
  );

  return SurvivalSimulationResultSchema.parse({
    missionId: request.missionId,
    simulatorVersion: SIMULATOR_VERSION,
    stateHash: hashSimulationState(request),
    outcome,
    missionSuccess,
    objectiveScore: advancedLifePotential,
    metrics,
    regionScores,
    habitableRegions: (Object.entries(regionScores) as Array<[RegionId, number]>)
      .filter(([, score]) => score >= convention.regions.habitableScore)
      .map(([id]) => id),
    selectedTraitCost: traitCost,
    energyBudget: LIFE_ENERGY_BUDGET,
    carryingCapacity,
    peakPopulation,
    finalPopulation,
    populationTimeline,
    strengths: sortedMetrics.slice(0, 3).map(([id]) => id),
    limitingFactors: sortedMetrics.slice(-3).reverse().map(([id]) => id),
  });
}

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
  PopulationEventId,
  RegionId,
  SimulationMetricId,
  SurvivalSimulationRequest,
  SurvivalSimulationResult,
  SurvivalFailureReason,
} from "./schema";
import { sumTraitModifiers } from "./traits";

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

/** Creates a reproducible pseudo-random source from the full experiment state. */
function createSeededRandom(seedText: string): () => number {
  let state = Number.parseInt(hashSimulationState(seedText).slice(3), 16) || 1;
  return () => {
    state = Math.imul(state ^ (state >>> 15), 1 | state);
    state ^= state + Math.imul(state ^ (state >>> 7), 61 | state);
    return ((state ^ (state >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** Runs the continuous deterministic habitability, compatibility, and population model. */
export function runSurvivalSimulation(
  rawRequest: SurvivalSimulationRequest,
): SurvivalSimulationResult {
  const request = SurvivalSimulationRequestSchema.parse(rawRequest);
  const convention = SIMULATOR_CONVENTIONS;
  const world = normalizeWorldParameters(request.planet.world);
  const modifiers = sumTraitModifiers(request.traitIds);
  const effectiveRadiation = deriveEffectiveRadiationDose(
    world.radiationDoseRateMilliSvPerHour,
    world.magneticFieldStrengthEarth,
  );

  // Independent user inputs are preserved; only their derived physical expression is coupled.
  const interactions = deriveWorldInteractionState(world);
  const effectivePressureAtm = world.effectiveAtmosphericPressureAtm;
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

  const rawRegionScores: Record<RegionId, number> = {
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

  const hasSupportedMetabolism = Math.max(
    oxygenMetabolism,
    lowOxygenMetabolism,
    anaerobicMetabolism,
  ) > 0.01;
  const coreViable =
    liquidWater >= convention.viabilityGate.minimumLiquidWater &&
    biologicalEnergy >= convention.viabilityGate.minimumBiologicalEnergy &&
    thermalStability >= convention.viabilityGate.minimumThermalStability &&
    radiationSafety >= convention.viabilityGate.minimumRadiationSafety &&
    hasSupportedMetabolism;
  const bestRegion = Math.max(...Object.values(rawRegionScores));
  const rawOrganismCompatibility = clamp01(
    gravityFitness * convention.organismCompatibility.gravity +
      pressureFitness * convention.organismCompatibility.pressure +
      thermalStability * convention.organismCompatibility.thermal +
      radiationSafety * convention.organismCompatibility.radiation +
      hydration * convention.organismCompatibility.hydration +
      metabolicViability * convention.organismCompatibility.metabolism +
      movement * convention.organismCompatibility.movement +
      bestRegion * convention.organismCompatibility.bestRegion,
  );
  // Keep component compatibility continuous for diagnosis; the viability gate below
  // still forces reproduction, ecosystem, advanced-life score, and population to zero.
  const organismCompatibility = rawOrganismCompatibility;
  const rawReproductionPotential = clamp01(
    organismCompatibility * convention.reproduction.compatibility +
      biologicalEnergy * convention.reproduction.energy +
      hydration * convention.reproduction.hydration +
      (modifiers.reproduction ?? 0) *
        convention.reproduction.traitModifier -
      Math.max(0, modifiers.complexity ?? 0) *
        convention.reproduction.complexityPenalty,
  );
  const reproductionPotential = coreViable ? rawReproductionPotential : 0;
  const adaptability = clamp01(
    convention.adaptability.base +
      (modifiers.adaptability ?? 0) +
      bestRegion * convention.adaptability.bestRegion,
  );
  const rawPopulationStability = clamp01(
    organismCompatibility * convention.populationStability.compatibility +
      reproductionPotential * convention.populationStability.reproduction +
      bestRegion * convention.populationStability.bestRegion +
      adaptability * convention.populationStability.adaptability,
  );
  const populationStability = coreViable ? rawPopulationStability : 0;
  const rawEcosystemPotential = clamp01(
    populationStability * convention.ecosystem.populationStability +
      biologicalEnergy * convention.ecosystem.energy +
      liquidWater * convention.ecosystem.liquidWater +
      atmosphere * convention.ecosystem.atmosphere +
      thermalStability * convention.ecosystem.thermal,
  );
  const ecosystemPotential = coreViable ? rawEcosystemPotential : 0;
  const complexity = clamp01(
    convention.complexity.base +
      (modifiers.complexity ?? 0) +
      request.traitIds.length * convention.complexity.perTrait,
  );
  const rawAdvancedLifePotential = clamp01(
    ecosystemPotential * convention.advancedLife.ecosystem +
      metabolicViability * convention.advancedLife.metabolism +
      adaptability * convention.advancedLife.adaptability +
      complexity * convention.advancedLife.complexity,
  );
  const advancedLifePotential = coreViable ? rawAdvancedLifePotential : 0;

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

  const carryingCapacity = coreViable ? Math.round(
    convention.population.capacityBase *
      ecosystemPotential *
      Math.pow(
        Math.max(convention.population.minimumRegionFactor, bestRegion),
        convention.population.regionExponent,
      ) *
      (convention.population.energyBase +
        biologicalEnergy * convention.population.energyWeight),
  ) : 0;
  const growthRate =
    convention.population.growthBase +
    organismCompatibility * convention.population.survivabilityGrowth +
    reproductionPotential * convention.population.reproductionGrowth +
    adaptability * convention.population.adaptabilityGrowth;
  const mortalityPressure =
    (1 - organismCompatibility) *
      convention.population.incompatibilityMortality;
  const hasThermalRefuge = has("hibernation") || has("dormantCysts");
  const hasGeochemicalPathway =
    geochemicalEnergy >= 0.28 && (has("chemosynthesis") || has("anaerobicMetabolism"));
  const eventYear = (baseYear: number, signal: number) =>
    baseYear + Math.round(clamp01(signal) * 4);
  const candidatePopulationEvents: Array<{
    id: PopulationEventId;
    generation: number;
    kind: "pressure" | "opportunity";
    impactFraction: number;
    active: boolean;
  }> = [
    { id: "vacuumExposure", generation: eventYear(8, 1 - pressurePresence), kind: "pressure", impactFraction: -(1 - pressurePresence) * 0.78, active: pressurePresence < 0.22 },
    { id: "oxygenShortfall", generation: eventYear(23, 1 - oxygenAvailability), kind: "pressure", impactFraction: -(1 - oxygenAvailability) * 0.58, active: effectiveOxygenPartialPressureAtm < 0.035 && !hasGeochemicalPathway },
    { id: "thermalShock", generation: eventYear(38, 1 - thermalStability), kind: "pressure", impactFraction: -clamp01(1 - thermalStability) * 0.62, active: world.temperatureVariationC >= 16 && thermalStability < 0.82 },
    { id: "radiationStorm", generation: eventYear(53, effectiveRadiation), kind: "pressure", impactFraction: -clamp01(1 - radiationSafety) * 0.72, active: effectiveRadiation >= 0.01 && radiationSafety < 0.9 },
    { id: "hydrosphereStress", generation: eventYear(68, 1 - hydration), kind: "pressure", impactFraction: -clamp01(1 - hydration) * 0.58, active: liquidWater < 0.48 && hydration < 0.82 },
    { id: "desiccationFront", generation: eventYear(83, 1 - retainedHumidity), kind: "pressure", impactFraction: -clamp01(1 - retainedHumidity) * 0.54, active: pressurePresence > 0.03 && retainedHumidity < 0.38 },
    { id: "lowLightFamine", generation: eventYear(98, 1 - world.lightLevel), kind: "pressure", impactFraction: -(1 - world.lightLevel) * 0.5, active: world.lightLevel < 0.28 && !hasGeochemicalPathway },
    { id: "resourceBloom", generation: eventYear(113, biologicalEnergy), kind: "opportunity", impactFraction: biologicalEnergy * 0.38, active: coreViable && world.lightLevel >= 0.25 && biologicalEnergy >= 0.3 },
    { id: "geothermalPulse", generation: eventYear(128, geochemicalEnergy), kind: "opportunity", impactFraction: geochemicalEnergy * 0.36, active: coreViable && hasGeochemicalPathway },
    { id: "thawWindow", generation: eventYear(143, interactions.iceWaterFraction), kind: "opportunity", impactFraction: Math.min(interactions.iceWaterFraction, liquidWater) * 0.4, active: coreViable && interactions.iceWaterFraction >= 0.035 && liquidWater >= 0.01 },
    { id: "reproductiveBottleneck", generation: eventYear(158, 1 - reproductionPotential), kind: "pressure", impactFraction: -clamp01(1 - reproductionPotential) * 0.52, active: coreViable && reproductionPotential < 0.76 },
    { id: "seasonalRefuge", generation: eventYear(173, world.temperatureVariationC / 100), kind: "opportunity", impactFraction: (hasThermalRefuge ? 0.32 : 0) * clamp01(world.temperatureVariationC / 45), active: coreViable && hasThermalRefuge && world.temperatureVariationC >= 14 },
    { id: "adaptiveBreakthrough", generation: eventYear(188, adaptability), kind: "opportunity", impactFraction: adaptability * 0.38, active: coreViable && adaptability >= 0.34 },
    { id: "nutrientUpwelling", generation: eventYear(68, liquidWater), kind: "opportunity", impactFraction: liquidWater * 0.42, active: coreViable && liquidWater >= 0.35 && (has("aquaticMovement") || has("biofilmColony") || has("gills")) },
    { id: "photosyntheticSurge", generation: eventYear(108, world.lightLevel), kind: "opportunity", impactFraction: world.lightLevel * 0.4, active: coreViable && world.lightLevel >= 0.55 && liquidWater >= 0.12 && has("photosynthesis") },
    { id: "nurserySeason", generation: eventYear(168, reproductionPotential), kind: "opportunity", impactFraction: reproductionPotential * 0.34, active: coreViable && reproductionPotential >= 0.45 && (has("protectedEggs") || has("liveBirth") || has("spores")) },
  ];
  const random = createSeededRandom(JSON.stringify({ planet: request.planet, traitIds: request.traitIds, simulatorVersion: SIMULATOR_VERSION }));
  const eventProbability = (event: (typeof candidatePopulationEvents)[number]) => {
    const impact = Math.abs(event.impactFraction);
    const baseline = event.kind === "pressure" ? 0.08 : 0.12;
    const severeEventBonus = Math.min(0.42, impact * 0.65);
    const diagnosticBonus = event.id === "vacuumExposure" || event.id === "oxygenShortfall" ? 0.18 : 0;
    return clamp01(baseline + severeEventBonus + diagnosticBonus);
  };
  const selectedCandidates = candidatePopulationEvents
    .filter(({ active, impactFraction, kind }) => active && Math.abs(impactFraction) >= (
      kind === "pressure"
        ? convention.population.minimumPressureEventImpact
        : convention.population.minimumOpportunityEventImpact
    ))
    .map((event) => ({ event, order: random(), occurs: random() < eventProbability(event) }))
    .filter(({ occurs }) => occurs)
    .sort((first, second) => first.order - second.order)
    .slice(0, convention.population.maximumEvents)
    .map(({ event }) => event);
  const populationEvents: Array<{ id: PopulationEventId; generation: number; kind: "pressure" | "opportunity"; impactFraction: number }> = [];
  for (const [index, event] of selectedCandidates.entries()) {
    const previousYear = populationEvents.at(-1)?.generation;
    const earliestYear = previousYear === undefined
      ? convention.population.firstEventMinimumYear
      : previousYear + convention.population.eventSpacingYears;
    const remainingEvents = selectedCandidates.length - index - 1;
    const latestYear = convention.population.finalEventMaximumYear -
      remainingEvents * convention.population.eventSpacingYears;
    if (earliestYear > latestYear) break;
    const generation = earliestYear + Math.floor(random() * (latestYear - earliestYear + 1));
    populationEvents.push({ id: event.id, generation, kind: event.kind, impactFraction: event.impactFraction });
  }
  const eventsByGeneration = new Map(populationEvents.map((event) => [event.generation, event]));
  const populationTimeline = [{ generation: 0, population: request.initialPopulation }];
  let population = request.initialPopulation;
  for (
    let generation = 1;
    generation <= convention.population.generations;
    generation += 1
  ) {
    if (!coreViable) {
      population = 0;
      populationTimeline.push({ generation, population: 0 });
      continue;
    }
    const capacity = Math.max(1, carryingCapacity);
    const logisticGrowth = growthRate * population * (1 - population / capacity);
    const mortality = mortalityPressure * population;
    population = Math.max(0, population + logisticGrowth - mortality);
    const event = eventsByGeneration.get(generation);
    if (event) population = Math.max(0, population * (1 + event.impactFraction));
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
  // Regional survival is zero when no population survives the modelled period.
  const regionScores = finalPopulation === 0
    ? Object.fromEntries(
        Object.keys(rawRegionScores).map((region) => [region, 0]),
      ) as Record<RegionId, number>
    : rawRegionScores;
  const supportsAdvancedLife =
    advancedLifePotential >= convention.advancedLifeQualification.advancedLife &&
    ecosystemPotential >= convention.advancedLifeQualification.ecosystem &&
    finalPopulation >= convention.advancedLifeQualification.finalPopulation;
  const failureReasons: SurvivalFailureReason[] = [
    ...(liquidWater < convention.viabilityGate.minimumLiquidWater
      ? ["noLiquidWater" as const]
      : []),
    ...(biologicalEnergy < convention.viabilityGate.minimumBiologicalEnergy
      ? ["insufficientEnergy" as const]
      : []),
    ...(thermalStability < convention.viabilityGate.minimumThermalStability
      ? ["thermalMismatch" as const]
      : []),
    ...(radiationSafety < convention.viabilityGate.minimumRadiationSafety
      ? ["unsafeRadiation" as const]
      : []),
    ...(!hasSupportedMetabolism
      ? ["unsupportedMetabolism" as const]
      : []),
  ];
  if (finalPopulation === 0 && failureReasons.length === 0) {
    failureReasons.push("organismMismatch");
  } else if (
    finalPopulation > 0 &&
    finalPopulation < request.initialPopulation &&
    failureReasons.length === 0
  ) {
    failureReasons.push("populationDecline");
  }
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
    supportsAdvancedLife
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
    simulatorVersion: SIMULATOR_VERSION,
    stateHash: hashSimulationState({ simulatorVersion: SIMULATOR_VERSION, request }),
    outcome,
    supportsAdvancedLife,
    objectiveScore: advancedLifePotential,
    metrics,
    regionScores,
    habitableRegions: (Object.entries(regionScores) as Array<[RegionId, number]>)
      .filter(([, score]) => score >= convention.regions.habitableScore)
      .map(([id]) => id),
    carryingCapacity,
    peakPopulation,
    finalPopulation,
    populationTimeline,
    populationEvents,
    failureReasons,
    strengths: sortedMetrics.slice(0, 3).map(([id]) => id),
    limitingFactors: sortedMetrics.slice(-3).reverse().map(([id]) => id),
  });
}

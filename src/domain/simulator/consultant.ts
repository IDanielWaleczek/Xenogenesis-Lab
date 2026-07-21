import type {
  LifeConsultantContent,
  RegionId,
  SimulationMetricId,
  SimulatorLanguage,
  SurvivalSimulationRequest,
  SurvivalSimulationResult,
} from "./schema";
import { LifeConsultantContentSchema } from "./schema";
import { normalizeWorldParameters } from "../world/schema";
import { LIFE_TRAITS } from "./traits";

const METRIC_LABELS: Record<
  SimulatorLanguage,
  Record<SimulationMetricId, string>
> = {
  en: {
    liquidWater: "liquid water",
    atmosphere: "atmospheric suitability",
    thermalStability: "thermal stability",
    radiationSafety: "radiation safety",
    biologicalEnergy: "biological energy",
    metabolicViability: "metabolic viability",
    organismCompatibility: "organism compatibility",
    reproductionPotential: "reproduction potential",
    populationStability: "population stability",
    ecosystemPotential: "ecosystem potential",
    advancedLifePotential: "advanced-life potential",
  },
  pl: {
    liquidWater: "woda w stanie ciekłym",
    atmosphere: "przydatność atmosfery",
    thermalStability: "stabilność termiczna",
    radiationSafety: "bezpieczeństwo radiacyjne",
    biologicalEnergy: "energia biologiczna",
    metabolicViability: "żywotność metaboliczna",
    organismCompatibility: "zgodność organizmu",
    reproductionPotential: "potencjał rozmnażania",
    populationStability: "stabilność populacji",
    ecosystemPotential: "potencjał ekosystemu",
    advancedLifePotential: "potencjał zaawansowanego życia",
  },
};

const REGION_LABELS: Record<SimulatorLanguage, Record<RegionId, string>> = {
  en: {
    coastal: "coastal zones",
    equatorial: "equatorial zones",
    polar: "polar zones",
    deepOcean: "the deep ocean",
    underground: "underground habitats",
    highAltitude: "the high atmosphere",
  },
  pl: {
    coastal: "strefy przybrzeżne",
    equatorial: "strefy równikowe",
    polar: "strefy polarne",
    deepOcean: "głęboki ocean",
    underground: "siedliska podziemne",
    highAltitude: "wysoka atmosfera",
  },
};

const OUTCOME_LABELS: Record<
  SimulatorLanguage,
  Record<SurvivalSimulationResult["outcome"], string>
> = {
  en: {
    immediateExtinction: "immediate extinction",
    temporarySurvival: "temporary survival",
    regionalRefuge: "a regional refuge",
    stableSimplePopulation: "a stable simple population",
    expandingPopulation: "an expanding population",
    unstableDominance: "unstable ecological dominance",
    stableMulticellularEcosystem: "a stable multicellular ecosystem",
    advancedAdaptiveLife: "advanced adaptable life",
  },
  pl: {
    immediateExtinction: "natychmiastowe wymarcie",
    temporarySurvival: "tymczasowe przetrwanie",
    regionalRefuge: "regionalne schronienie",
    stableSimplePopulation: "stabilna prosta populacja",
    expandingPopulation: "rosnąca populacja",
    unstableDominance: "niestabilna dominacja ekologiczna",
    stableMulticellularEcosystem: "stabilny ekosystem wielokomórkowy",
    advancedAdaptiveLife: "zaawansowane życie adaptacyjne",
  },
};

const REGION_ORDER: readonly RegionId[] = [
  "coastal",
  "equatorial",
  "polar",
  "deepOcean",
  "underground",
  "highAltitude",
];

/** Supplies both optional AI services with the same server-derived experiment evidence. */
export function buildValidatedExperimentContext(
  request: SurvivalSimulationRequest,
  result: SurvivalSimulationResult,
) {
  const topRegion = REGION_ORDER.reduce((best, region) =>
    result.regionScores[region] > result.regionScores[best] ? region : best,
  );
  const survivability = result.finalPopulation === 0
    ? 0
    : result.metrics.organismCompatibility;

  return {
    planet: {
      seed: request.planet.seed,
      parameters: normalizeWorldParameters(request.planet.world),
    },
    selectedTraits: request.traitIds.map((id) => ({
      id,
      category: LIFE_TRAITS[id].category,
      modifiers: LIFE_TRAITS[id].modifiers,
    })),
    survivability,
    topRegionalSurvivability: {
      region: topRegion,
      score: result.regionScores[topRegion],
    },
    deterministicResult: result,
  };
}

/** Builds the constrained field-illustration prompt from validated simulation data. */
export function buildControlledOrganismImagePrompt(
  request: SurvivalSimulationRequest,
  result: SurvivalSimulationResult,
  consultantDirection: LifeConsultantContent["imageDirection"],
): string {
  const context = buildValidatedExperimentContext(request, result);
  const { averageTemperatureC, temperatureVariationC } = context.planet.parameters;
  const minimumTemperatureC = averageTemperatureC - temperatureVariationC;
  const maximumTemperatureC = averageTemperatureC + temperatureVariationC;
  const pose = {
    resting: "resting in a stable pose",
    foraging: "foraging for its configured energy source",
    moving: "showing its configured movement anatomy",
    social: "interacting with two members of the same species",
  }[consultantDirection.pose];
  const viewpoint = {
    "field-profile": "orthographic field-guide profile",
    "three-quarter": "three-quarter observational view",
    "environment-wide": "wide environmental field study",
  }[consultantDirection.viewpoint];
  const lighting = {
    diffuse: "diffuse natural light",
    "low-angle": "restrained low-angle starlight",
    backlit: "subtle atmospheric backlight",
  }[consultantDirection.lighting];
  const emphasis = {
    anatomy: "emphasize legible anatomy",
    adaptation: "emphasize the selected adaptations",
    habitat: "emphasize organism-habitat scale and fit",
  }[consultantDirection.emphasis];
  const deadSpecimen = context.survivability <= 0.25;
  const organismState = deadSpecimen
    ? "Depict one dead, intact specimen matching every selected trait in the top region. It must be clearly non-living, with no gore, no living organisms, and no suggestion that this design survives."
    : "Depict a living organism matching every selected trait, actively adapted to the top region.";
  const thermalSurfaceRequirement = minimumTemperatureC >= 600
    ? "The entire depicted surface is an incandescent, heat-ravaged rocky landscape with glowing molten or thermally altered material. Do not show Earth-like soil, grass, forests, temperate water, or a cool terrestrial surface."
    : maximumTemperatureC >= 400
      ? "Show a severely heat-ravaged rocky surface with visible thermal alteration and no Earth-like temperate terrain, vegetation, or cool water."
      : minimumTemperatureC <= -120
        ? "Show a deeply frozen, ice-bound surface with no temperate soil, vegetation, or open liquid water."
        : "Match the surface state to the supplied temperature range and water availability; do not substitute an Earth-like habitat unless those parameters support it.";

  return [
    "Scientific astrobiology field illustration, landscape 3:2 composition, no text, no labels, no logos.",
    `Validated planet seed and all normalized planet parameters: ${JSON.stringify(context.planet)}.`,
    `All selected trait configurations: ${JSON.stringify(context.selectedTraits)}.`,
    `Validated survivability: ${(context.survivability * 100).toFixed(0)}%. Top regional survivability: ${context.topRegionalSurvivability.region}, ${(context.topRegionalSurvivability.score * 100).toFixed(0)}%. Deterministic outcome: ${result.outcome}.`,
    organismState,
    "Render the full organism in a realistic environment physically consistent with the supplied planet parameters and selected top region. Depict only anatomy supported by selected traits. Neutral scientific field documentation, realistic materials, restrained palette.",
    `Temperature range: ${minimumTemperatureC.toFixed(0)} to ${maximumTemperatureC.toFixed(0)} °C. ${thermalSurfaceRequirement}`,
    `Validated art direction: ${pose}; ${viewpoint}; ${lighting}; ${emphasis}.`,
  ].join(" ");
}

/** Creates a validated local consultant response when GPT-5.6 is unavailable. */
export function buildLocalLifeConsultant(
  language: SimulatorLanguage,
  request: SurvivalSimulationRequest,
  result: SurvivalSimulationResult,
): LifeConsultantContent {
  const strongestId = result.strengths[0] ?? "advancedLifePotential";
  const limitingId = result.limitingFactors[0] ?? "organismCompatibility";
  const strongest = METRIC_LABELS[language][strongestId];
  const limiting = METRIC_LABELS[language][limitingId];
  const regions =
    result.habitableRegions
      .map((region) => REGION_LABELS[language][region])
      .join(", ") || (language === "pl" ? "brak" : "none");
  const outcome = OUTCOME_LABELS[language][result.outcome];

  if (language === "pl") {
    return LifeConsultantContentSchema.parse({
      organismName: `Ksenotyp ${result.stateHash.slice(-4).toUpperCase()}`,
      scientificDescription: `Pierwsza linia życia Vespery otrzymała ${request.traitIds.length} wybranych adaptacji. Po 200 latach jej historia prowadzi do „${outcome}”, z populacją ${result.finalPopulation.toLocaleString("pl-PL")}. To lokalny odczyt danych eksperymentu, a nie odpowiedź GPT-5.6.`,
      planetAssessment: `Najsilniejszym składnikiem środowiska jest ${strongest}, a głównym ograniczeniem ${limiting}. Obszary z wynikiem regionalnym co najmniej 0,50: ${regions}.`,
      traitAssessment: `Wybrane cechy zmieniają tolerancję, koszt energii, rozmnażanie i złożoność. Wynik zgodności organizmu wynosi ${(result.metrics.organismCompatibility * 100).toFixed(0)}%, a potencjał rozmnażania ${(result.metrics.reproductionPotential * 100).toFixed(0)}%.`,
      insights: [
        `Potencjał zaawansowanego życia: ${(result.metrics.advancedLifePotential * 100).toFixed(0)}%.`,
        `Stabilność populacji: ${(result.metrics.populationStability * 100).toFixed(0)}%.`,
        `Pojemność środowiska: ${result.carryingCapacity.toLocaleString("pl-PL")}.`,
      ],
      suggestedExperiment: `Zmień tylko parametr związany z ograniczeniem „${limiting}”, uruchom ponownie model i porównaj przebieg populacji przy tych samych cechach.`,
      imageDirection: {
        pose: result.metrics.populationStability > 0.62 ? "social" : "moving",
        viewpoint: "three-quarter",
        lighting: request.planet.world.lightLevel < 0.3 ? "backlit" : "diffuse",
        emphasis: result.habitableRegions.length <= 1 ? "habitat" : "adaptation",
      },
    });
  }

  return LifeConsultantContentSchema.parse({
    organismName: `Xenotype ${result.stateHash.slice(-4).toUpperCase()}`,
    scientificDescription: `Vespera's first lineage carries ${request.traitIds.length} selected adaptations. After 200 years, its story reaches ${outcome}, with a population of ${result.finalPopulation.toLocaleString("en-US")}. This is a local reading of the experiment's evidence, not a GPT-5.6 response.`,
    planetAssessment: `The strongest environmental component is ${strongest}, while the leading constraint is ${limiting}. Regions scoring at least 0.50 are: ${regions}.`,
    traitAssessment: `The chosen traits modify tolerance, energy cost, reproduction, and complexity. Organism compatibility is ${(result.metrics.organismCompatibility * 100).toFixed(0)}% and reproduction potential is ${(result.metrics.reproductionPotential * 100).toFixed(0)}%.`,
    insights: [
      `Advanced-life potential: ${(result.metrics.advancedLifePotential * 100).toFixed(0)}%.`,
      `Population stability: ${(result.metrics.populationStability * 100).toFixed(0)}%.`,
      `Environmental carrying capacity: ${result.carryingCapacity.toLocaleString("en-US")}.`,
    ],
    suggestedExperiment: `Change only the parameter associated with ${limiting}, rerun the model, and compare the population curve with the same traits.`,
    imageDirection: {
      pose: result.metrics.populationStability > 0.62 ? "social" : "moving",
      viewpoint: "three-quarter",
      lighting: request.planet.world.lightLevel < 0.3 ? "backlit" : "diffuse",
      emphasis: result.habitableRegions.length <= 1 ? "habitat" : "adaptation",
    },
  });
}

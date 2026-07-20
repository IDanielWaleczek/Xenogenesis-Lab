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
import { deriveWorldInteractionState } from "../world/interactions";

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

/** Builds the constrained field-illustration prompt from validated simulation data. */
export function buildControlledOrganismImagePrompt(
  request: SurvivalSimulationRequest,
  result: SurvivalSimulationResult,
  consultantDirection: LifeConsultantContent["imageDirection"],
): string {
  const normalizedWorld = normalizeWorldParameters(request.planet.world);
  const interactions = deriveWorldInteractionState(request.planet.world);
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

  return [
    "Scientific astrobiology field illustration, square composition, no text, no labels, no logos.",
    `Planet seed: ${request.planet.seed}. Habitat: ${request.planet.world.habitat}.`,
    `Local gravity ${request.planet.world.gravityG.toFixed(2)} g, effective pressure ${normalizedWorld.effectiveAtmosphericPressureAtm.toFixed(2)} atm, temperature ${request.planet.world.averageTemperatureC.toFixed(1)} C, water ${(request.planet.world.waterAvailability * 100).toFixed(0)} percent, radiation ${request.planet.world.radiationDoseRate.value.toFixed(3)} ${request.planet.world.radiationDoseRate.unit}.`,
    `Validated traits: ${request.traitIds.join(", ")}.`,
    `Deterministic outcome: ${result.outcome}; habitable regions: ${result.habitableRegions.join(", ") || "none"}.`,
    "Depict only anatomy supported by those traits. Show the organism inside a matching planetary environment. Neutral scientific concept art, realistic materials, full organism visible, restrained palette.",
    `Validated art direction: ${pose}; ${viewpoint}; ${lighting}; ${emphasis}.`,
  ].join(" ");
}

/** Creates a validated local consultant response when GPT-5.4-mini is unavailable. */
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
      scientificDescription: `Projekt łączy ${request.traitIds.length} wybranych cech przy koszcie ${result.selectedTraitCost}/${result.energyBudget}. Model przewiduje wynik „${outcome}” oraz końcową populację ${result.finalPopulation.toLocaleString("pl-PL")} po 40 pokoleniach. To lokalna interpretacja deterministyczna, a nie odpowiedź GPT-5.6.`,
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
    scientificDescription: `This design combines ${request.traitIds.length} selected traits at a biological cost of ${result.selectedTraitCost}/${result.energyBudget}. The model predicts ${outcome} and a final population of ${result.finalPopulation.toLocaleString("en-US")} after 40 generations. This is a local deterministic interpretation, not a GPT-5.6 response.`,
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

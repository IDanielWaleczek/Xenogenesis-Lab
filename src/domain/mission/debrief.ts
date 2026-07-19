import {
  CompetencyProgressSchema,
  MissionDebriefSchema,
} from "./schema";
import type {
  CompetencyProgress,
  HypothesisComparison,
  MissionDebrief,
  MissionLanguage,
  MissionRevision,
  SimulationResult,
} from "./schema";

/** Builds an honest deterministic debrief when the GPT-5.6 route is unavailable. */
export function buildLocalDebrief(
  language: MissionLanguage,
  comparison: HypothesisComparison,
  result: SimulationResult,
): MissionDebrief {
  const matched = comparison.supportedPredictions.length;
  const total = result.adaptationCandidates.length;
  const pressureMatches = comparison.supportedPressurePredictions.length;
  const pressureTotal = result.pressures.length;
  const facts = result.normalizedFacts;

  if (language === "pl") {
    return MissionDebriefSchema.parse({
      assessment: `Twoje decyzje przewidziały ${pressureMatches} z ${pressureTotal} obliczonych presji oraz ${matched} z ${total} adaptacji wspieranych przez reguły modelu. Wynik zgodności wynosi ${comparison.alignmentPercent}%. To lokalna, deterministyczna odprawa, a nie odpowiedź GPT-5.6.`,
      evidence: [
        `Grawitacja wariantu wynosi ${facts.gravityG.toFixed(2)} g, a lokalne ciśnienie ${facts.atmosphericPressureAtm.toFixed(2)} atm.`,
        `Symetryczny zakres temperatury sięga od ${facts.minimumTemperatureC.toFixed(1)}°C do ${facts.maximumTemperatureC.toFixed(1)}°C.`,
        `Dawka ${facts.radiationDoseRateMilliSvPerHour.toFixed(3)} mSv/h pozostaje niezmniejszona przez samą etykietę siedliska.`,
        `Obliczone ciśnienie cząstkowe O₂ wynosi ${facts.oxygenPartialPressureAtm.toFixed(3)} atm, a dostępność wody ${facts.waterAvailability.toFixed(2)}.`,
      ],
      tradeOffs: [
        "Każda adaptacja wspierana przez model może zwiększać koszt materiałowy, energetyczny lub rozwojowy organizmu.",
        "Wybrana strategia jest interpretacją ucznia; zestaw reguł 0.2.0 ocenia presje i adaptacje, ale jej nie punktuje.",
      ],
      followUpQuestion:
        "Która obliczona presja najmocniej zmienia twoją pierwotną decyzję?",
      recommendedExperiment:
        `Porównaj ten wariant po zmianie tylko grawitacji z ${facts.gravityG.toFixed(2)} g do ${Math.max(0.05, facts.gravityG - 0.3).toFixed(2)} g.`,
    });
  }

  return MissionDebriefSchema.parse({
    assessment: `Your decisions predicted ${pressureMatches} of ${pressureTotal} calculated pressures and ${matched} of ${total} adaptations supported by this ruleset. The alignment score is ${comparison.alignmentPercent}%. This is a local deterministic debrief, not a GPT-5.6 response.`,
    evidence: [
      `Variant gravity is ${facts.gravityG.toFixed(2)} g and local pressure is ${facts.atmosphericPressureAtm.toFixed(2)} atm.`,
      `The symmetric temperature range extends from ${facts.minimumTemperatureC.toFixed(1)}°C to ${facts.maximumTemperatureC.toFixed(1)}°C.`,
      `Radiation at ${facts.radiationDoseRateMilliSvPerHour.toFixed(3)} mSv/h is not reduced by the habitat label alone.`,
      `Calculated O₂ partial pressure is ${facts.oxygenPartialPressureAtm.toFixed(3)} atm and water availability is ${facts.waterAvailability.toFixed(2)}.`,
    ],
    tradeOffs: [
      "Each model-supported adaptation may add material, energy, or developmental costs to the organism.",
      "The chosen strategy is learner interpretation; ruleset 0.2.0 scores pressures and adaptations but does not score that strategy.",
    ],
    followUpQuestion:
      "Which calculated pressure changes your original decision most?",
    recommendedExperiment:
      `Compare this variant after changing only gravity from ${facts.gravityG.toFixed(2)} g to ${Math.max(0.05, facts.gravityG - 0.3).toFixed(2)} g.`,
  });
}

/** Calculates session-only competency progress from meaningful mission actions. */
export function calculateCompetencyProgress(
  comparison: HypothesisComparison,
  revision: MissionRevision,
  result: SimulationResult,
): CompetencyProgress {
  const expectedAdaptations = result.adaptationCandidates.length;
  const adaptationRecall =
    expectedAdaptations === 0
      ? 0
      : comparison.supportedPredictions.length / expectedAdaptations;
  const evidenceCoverage =
    result.pressures.length === 0
      ? 1
      : revision.evidencePressureIds.length / result.pressures.length;

  return CompetencyProgressSchema.parse({
    missionsCompleted: 1,
    hypothesisFormation: comparison.alignmentPercent,
    adaptationAnalysis: Math.round(adaptationRecall * 100),
    evidenceUse: Math.min(100, 50 + Math.round(evidenceCoverage * 50)),
    certificationStage: "candidate",
  });
}

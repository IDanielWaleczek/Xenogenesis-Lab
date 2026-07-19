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

  if (language === "pl") {
    return MissionDebriefSchema.parse({
      assessment: `Twoja hipoteza przewidziała ${matched} z ${total} adaptacji wspieranych przez reguły modelu. Wynik zgodności wynosi ${comparison.alignmentPercent}%. To lokalna, deterministyczna odprawa, a nie odpowiedź GPT-5.6.`,
      evidence: [
        "Grawitacja 1,7 g przekracza konwencję modelu 1,5 g dla wysokiej grawitacji.",
        "Zakres od −6°C do 42°C uruchamia presję na buforowanie cieplne.",
        "Dawka 0,4 mSv/h pozostaje niezmniejszona przez samą etykietę siedliska.",
        "Dostępność wody 0,38 jest poniżej konwencji modelu 0,40.",
      ],
      tradeOffs: [
        "Silniejsze struktury podporowe zwiększają koszt materiałowy i energetyczny organizmu.",
        "Ochrona przed promieniowaniem i oszczędzanie wody mogą ograniczać tempo wzrostu.",
      ],
      followUpQuestion:
        "Która obliczona presja najmocniej zmienia twoją pierwotną hipotezę i dlaczego?",
      recommendedExperiment:
        "W kolejnej iteracji porównaj ten sam świat przy grawitacji 1,4 g, pozostawiając pozostałe parametry bez zmian.",
    });
  }

  return MissionDebriefSchema.parse({
    assessment: `Your hypothesis predicted ${matched} of ${total} adaptations supported by this ruleset. Its alignment score is ${comparison.alignmentPercent}%. This is a local deterministic debrief, not a GPT-5.6 response.`,
    evidence: [
      "Gravity at 1.7 g exceeds the model convention of 1.5 g for high gravity.",
      "The −6°C to 42°C range triggers thermal-buffering pressure.",
      "Radiation at 0.4 mSv/h is not reduced by the habitat label alone.",
      "Water availability at 0.38 is below the model convention of 0.40.",
    ],
    tradeOffs: [
      "Reinforced support structures increase the organism's material and energy costs.",
      "Radiation protection and water conservation may limit growth rate.",
    ],
    followUpQuestion:
      "Which calculated pressure changes your original hypothesis most, and why?",
    recommendedExperiment:
      "In a future run, compare this world at 1.4 g while holding the other parameters constant.",
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
      ? 0
      : revision.evidencePressureIds.length / result.pressures.length;

  return CompetencyProgressSchema.parse({
    missionsCompleted: 1,
    hypothesisFormation: comparison.alignmentPercent,
    adaptationAnalysis: Math.round(adaptationRecall * 100),
    evidenceUse: Math.min(100, 50 + Math.round(evidenceCoverage * 50)),
    certificationStage: "candidate",
  });
}

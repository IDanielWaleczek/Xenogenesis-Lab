"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { VESPERA_MISSION } from "@/domain/mission/mission";
import {
  CommittedHypothesisSchema,
  HypothesisSchema,
  MissionInstructorResponseSchema,
  MissionRevisionSchema,
} from "@/domain/mission/schema";
import type {
  AdaptationId,
  CommittedHypothesis,
  CompetencyProgress,
  HypothesisComparison,
  MissionInstructorResponse,
  PressureId,
  SimulationResult,
} from "@/domain/mission/schema";
import {
  calculateCompetencyProgress,
} from "@/domain/mission/debrief";
import { compareHypothesis, simulateMission } from "@/domain/mission/simulate";

import { COPY, type Language, type MissionStage } from "./copy";

const STAGES: MissionStage[] = [
  "briefing",
  "hypothesis",
  "simulation",
  "debrief",
  "progress",
];

const HYPOTHESIS_OPTIONS: AdaptationId[] = [
  "compactBody",
  "reinforcedSupport",
  "thermalBuffering",
  "radiationProtection",
  "cellularRepair",
  "waterConservation",
  "protectedReproduction",
  "aerialFlight",
  "permeableSkin",
];

/** Renders the orbital identity mark used by Mission Control. */
function OrbitMark() {
  return (
    <span aria-hidden="true" className="relative grid size-9 place-items-center">
      <span className="absolute size-7 rounded-full border border-cyan-300/60" />
      <span className="absolute h-3.5 w-9 rotate-[-28deg] rounded-[100%] border border-cyan-200/70" />
      <span className="size-1.5 rounded-full bg-cyan-100 shadow-[0_0_14px_4px_rgba(103,232,249,0.4)]" />
    </span>
  );
}

/** Renders a provenance label for learner, calculated, AI, and fallback content. */
function Provenance({
  children,
  tone = "cyan",
}: {
  children: React.ReactNode;
  tone?: "cyan" | "amber" | "violet" | "slate";
}) {
  const classes = {
    cyan: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
    amber: "border-amber-300/25 bg-amber-300/10 text-amber-100",
    violet: "border-violet-300/25 bg-violet-300/10 text-violet-100",
    slate: "border-slate-400/25 bg-slate-400/10 text-slate-200",
  }[tone];

  return <span className={`status-chip inline-flex ${classes}`}>{children}</span>;
}

/** Renders a compact list of adaptation labels. */
function AdaptationList({
  ids,
  language,
}: {
  ids: AdaptationId[];
  language: Language;
}) {
  const copy = COPY[language];

  if (ids.length === 0) {
    return <span className="text-slate-500">{copy.simulation.none}</span>;
  }

  return (
    <ul className="space-y-1.5">
      {ids.map((id) => (
        <li className="flex gap-2 text-sm text-slate-200" key={id}>
          <span aria-hidden="true" className="text-cyan-300">•</span>
          {copy.adaptations[id].title}
        </li>
      ))}
    </ul>
  );
}

/** Renders one competency score with an accessible progress bar. */
function CompetencyBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-sm">
        <span className="text-slate-200">{label}</span>
        <span className="font-mono text-cyan-100">{score}%</span>
      </div>
      <div
        aria-label={label}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={score}
        className="h-2 overflow-hidden rounded-full bg-slate-800"
        role="progressbar"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-200"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

/** Implements the smallest complete single-mission training loop. */
export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [stage, setStage] = useState<MissionStage>("briefing");
  const [selectedAdaptations, setSelectedAdaptations] = useState<AdaptationId[]>([]);
  const [reasoning, setReasoning] = useState("");
  const [hypothesis, setHypothesis] = useState<CommittedHypothesis | null>(null);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [comparison, setComparison] = useState<HypothesisComparison | null>(null);
  const [debrief, setDebrief] = useState<MissionInstructorResponse | null>(null);
  const [isLoadingDebrief, setIsLoadingDebrief] = useState(false);
  const [debriefError, setDebriefError] = useState(false);
  const [revision, setRevision] = useState("");
  const [revisionEvidence, setRevisionEvidence] = useState<PressureId[]>([]);
  const [progress, setProgress] = useState<CompetencyProgress | null>(null);
  const copy = COPY[language];
  const stageIndex = STAGES.indexOf(stage);
  const hypothesisValid = HypothesisSchema.safeParse({
    adaptationIds: selectedAdaptations,
    reasoning,
  }).success;
  const revisionValid = MissionRevisionSchema.safeParse({
    reasoning: revision,
    evidencePressureIds: revisionEvidence,
  }).success;

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = copy.document.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", copy.document.description);
  }, [copy.document.description, copy.document.title, language]);

  const resetMission = () => {
    setStage("briefing");
    setSelectedAdaptations([]);
    setReasoning("");
    setHypothesis(null);
    setSimulation(null);
    setComparison(null);
    setDebrief(null);
    setDebriefError(false);
    setRevision("");
    setRevisionEvidence([]);
    setProgress(null);
  };

  const toggleAdaptation = (id: AdaptationId) => {
    setSelectedAdaptations((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }

      return current.length >= 6 ? current : [...current, id];
    });
  };

  const commitHypothesis = () => {
    const parsed = HypothesisSchema.safeParse({
      adaptationIds: selectedAdaptations,
      reasoning,
    });
    if (!parsed.success) return;

    const committed = CommittedHypothesisSchema.parse({
      ...parsed.data,
      missionId: VESPERA_MISSION.id,
      committedAt: new Date().toISOString(),
    });
    setHypothesis(committed);
    setStage("simulation");
  };

  const runSimulation = () => {
    if (!hypothesis) return;

    const result = simulateMission(VESPERA_MISSION.world);
    setSimulation(result);
    setComparison(compareHypothesis(hypothesis, result));
  };

  const requestDebrief = async (responseLanguage: Language = language) => {
    if (!hypothesis || !simulation || !comparison) return;

    setStage("debrief");
    setDebrief(null);
    setDebriefError(false);
    setIsLoadingDebrief(true);

    try {
      const response = await fetch("/api/instructor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: responseLanguage, hypothesis }),
      });
      if (!response.ok) throw new Error("Mission Instructor request failed.");

      const payload = MissionInstructorResponseSchema.parse(await response.json());
      setDebrief(payload);
    } catch {
      setDebriefError(true);
    } finally {
      setIsLoadingDebrief(false);
    }
  };

  const changeLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    if (stage === "debrief" && hypothesis && simulation && comparison) {
      void requestDebrief(nextLanguage);
    }
  };

  const toggleRevisionEvidence = (id: PressureId) => {
    setRevisionEvidence((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const completeMission = () => {
    if (!comparison || !simulation) return;

    const parsed = MissionRevisionSchema.safeParse({
      reasoning: revision,
      evidencePressureIds: revisionEvidence,
    });
    if (!parsed.success) return;

    setProgress(calculateCompetencyProgress(comparison, parsed.data, simulation));
    setStage("progress");
  };

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-[#030817] text-slate-100 selection:bg-cyan-300/30 lg:h-dvh lg:overflow-hidden">
      <header className="shrink-0 border-b border-white/10 bg-[#050b1c]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3 sm:px-7 lg:px-8">
          <button
            className="group flex items-center gap-3 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
            onClick={resetMission}
            type="button"
          >
            <OrbitMark />
            <span>
              <span className="block text-sm font-semibold tracking-[-0.02em] text-white">Xenogenesis Lab</span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-200/80">{copy.header.subtitle}</span>
            </span>
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="status-chip hidden border-white/10 bg-white/[0.04] text-slate-300 sm:inline-flex">{copy.header.mission}</span>
            <div aria-label={copy.language.label} className="flex rounded-lg border border-white/10 bg-white/[0.035] p-1" role="group">
              {(["en", "pl"] as const).map((option) => (
                <button
                  aria-label={option === "en" ? copy.language.english : copy.language.polish}
                  aria-pressed={language === option}
                  className={`rounded-md px-2.5 py-1 font-mono text-[10px] font-semibold transition focus-visible:outline-2 focus-visible:outline-cyan-300 ${
                    language === option
                      ? "bg-cyan-300/15 text-cyan-100"
                      : "text-slate-500 hover:text-slate-200"
                  }`}
                  key={option}
                  onClick={() => changeLanguage(option)}
                  type="button"
                >
                  {option.toUpperCase()}
                </button>
              ))}
            </div>
            <button className="button-quiet hidden sm:inline-flex" onClick={resetMission} type="button">{copy.header.reset}</button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col lg:min-h-0 lg:flex-row">
        <aside className="shrink-0 border-b border-white/10 bg-[#050b1c]/70 px-4 py-4 sm:px-7 lg:w-64 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
          <nav aria-label={copy.stageNavigation}>
            <ol className="journey-scroll flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              {STAGES.map((item, index) => {
                const isCurrent = item === stage;
                const isComplete = index < stageIndex;
                return (
                  <li className="min-w-max lg:min-w-0" key={item}>
                    <div
                      aria-current={isCurrent ? "step" : undefined}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                        isCurrent
                          ? "border-cyan-200/35 bg-cyan-300/10 text-white"
                          : isComplete
                            ? "border-emerald-300/15 bg-emerald-300/[0.05] text-emerald-100"
                            : "border-white/[0.06] bg-white/[0.015] text-slate-500"
                      }`}
                    >
                      <span className="grid size-6 place-items-center rounded-full border border-current/20 font-mono text-[9px]">
                        {isComplete ? "✓" : `0${index + 1}`}
                      </span>
                      <span className="text-sm font-medium">{copy.stages[item]}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </nav>
          <div className="mt-6 hidden rounded-xl border border-white/10 bg-white/[0.025] p-4 lg:block">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">{copy.mission.planet}</p>
            <p className="mt-2 text-sm leading-5 text-slate-300">{copy.mission.objective}</p>
            <p className="mt-3 font-mono text-[9px] text-cyan-200/70">{copy.mission.ruleset}</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 lg:min-h-0 lg:overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
            {stage === "briefing" && (
              <section aria-labelledby="briefing-heading" className="animate-[rise_0.4s_ease-out]">
                <div className="relative isolate overflow-hidden rounded-2xl border border-cyan-200/15 bg-[#071126]">
                  <Image
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 -z-20 h-full w-full object-cover object-[55%_45%] opacity-45"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 1100px"
                    src="/XenogenesisLabBanner.png"
                  />
                  <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,8,23,0.98)_0%,rgba(3,8,23,0.82)_58%,rgba(3,8,23,0.28)_100%)]" />
                  <div className="max-w-3xl px-6 py-9 sm:px-9 sm:py-11">
                    <p className="eyebrow">{copy.mission.eyebrow}</p>
                    <h1 id="briefing-heading" className="mt-4 max-w-2xl text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-white sm:text-5xl">
                      {copy.mission.title}
                    </h1>
                    <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">{copy.mission.briefing}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                  <article className="glass-panel p-6">
                    <p className="eyebrow">{copy.mission.objectiveLabel}</p>
                    <h2 className="mt-3 text-xl font-semibold text-white">{copy.mission.planet}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{copy.mission.objective}</p>
                    <p className="mt-4 rounded-xl border border-amber-200/15 bg-amber-200/[0.04] p-4 text-sm leading-6 text-amber-50/85">{copy.mission.candidateTask}</p>
                    <button className="button-primary mt-6" onClick={() => setStage("hypothesis")} type="button">
                      {copy.mission.begin} <span aria-hidden="true">→</span>
                    </button>
                  </article>
                  <article className="glass-panel p-6">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-200">{copy.mission.factsTitle}</p>
                    <dl className="mt-4 grid grid-cols-2 gap-3">
                      {copy.mission.facts.map((fact) => (
                        <div className="rounded-xl border border-white/10 bg-slate-950/35 p-3" key={fact.label}>
                          <dt className="text-xs text-slate-500">{fact.label}</dt>
                          <dd className="mt-1 text-sm text-slate-100">{fact.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </article>
                </div>
              </section>
            )}

            {stage === "hypothesis" && (
              <section aria-labelledby="hypothesis-heading" className="animate-[rise_0.4s_ease-out] space-y-5">
                <div>
                  <p className="eyebrow">{copy.hypothesis.eyebrow}</p>
                  <h1 id="hypothesis-heading" className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">{copy.hypothesis.title}</h1>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{copy.hypothesis.instruction}</p>
                </div>
                <div className="glass-panel p-5 sm:p-6">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h2 className="font-medium text-white">{copy.hypothesis.selectionTitle}</h2>
                      <p className="mt-1 text-xs text-slate-500">{copy.hypothesis.selectionHint}</p>
                    </div>
                    <Provenance tone="amber">{copy.provenance.hypothesis}</Provenance>
                  </div>
                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {HYPOTHESIS_OPTIONS.map((id) => {
                      const selected = selectedAdaptations.includes(id);
                      return (
                        <button
                          aria-pressed={selected}
                          className={`rounded-xl border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
                            selected
                              ? "border-cyan-200/40 bg-cyan-300/10"
                              : "border-white/10 bg-slate-950/30 hover:border-white/20"
                          }`}
                          key={id}
                          onClick={() => toggleAdaptation(id)}
                          type="button"
                        >
                          <span className="flex items-start gap-3">
                            <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded border text-xs ${selected ? "border-cyan-200 bg-cyan-300 text-slate-950" : "border-slate-600 text-transparent"}`}>✓</span>
                            <span>
                              <span className="block text-sm font-medium text-slate-100">{copy.adaptations[id].title}</span>
                              <span className="mt-1 block text-xs leading-5 text-slate-400">{copy.adaptations[id].description}</span>
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-6">
                    <label className="text-sm font-medium text-white" htmlFor="hypothesis-reasoning">{copy.hypothesis.reasoningLabel}</label>
                    <textarea
                      className="mt-2 min-h-32 w-full resize-y rounded-xl border border-white/10 bg-slate-950/55 p-4 text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-200/50"
                      id="hypothesis-reasoning"
                      maxLength={800}
                      onChange={(event) => setReasoning(event.target.value)}
                      placeholder={copy.hypothesis.reasoningPlaceholder}
                      value={reasoning}
                    />
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-slate-500">{hypothesisValid ? `${selectedAdaptations.length}/6` : copy.hypothesis.validation}</p>
                      <button className="button-primary disabled:cursor-not-allowed disabled:opacity-40" disabled={!hypothesisValid} onClick={commitHypothesis} type="button">
                        {copy.hypothesis.commit} <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {stage === "simulation" && hypothesis && (
              <section aria-labelledby="simulation-heading" className="animate-[rise_0.4s_ease-out] space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="eyebrow">{copy.simulation.eyebrow}</p>
                    <h1 id="simulation-heading" className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">{copy.simulation.title}</h1>
                  </div>
                  <Provenance tone="amber">{copy.provenance.hypothesis}</Provenance>
                </div>
                <article className="glass-panel p-5">
                  <p className="text-xs text-amber-100/80">{copy.hypothesis.committed}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-200">{hypothesis.reasoning}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {hypothesis.adaptationIds.map((id) => (
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300" key={id}>{copy.adaptations[id].title}</span>
                    ))}
                  </div>
                </article>

                {!simulation ? (
                  <div className="glass-panel p-6 sm:p-8">
                    <p className="max-w-3xl text-sm leading-6 text-slate-300">{copy.simulation.ready}</p>
                    <button className="button-primary mt-5" onClick={runSimulation} type="button">{copy.simulation.run} <span aria-hidden="true">→</span></button>
                  </div>
                ) : comparison && (
                  <>
                    <div className="glass-panel border-cyan-200/20 p-5 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <Provenance>{copy.provenance.calculated}</Provenance>
                          <p className="mt-4 text-xs text-slate-500">{copy.simulation.viabilityLabel}</p>
                          <h2 className="mt-1 text-xl font-semibold text-white">{copy.simulation.viability}</h2>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">{copy.simulation.rulesetLabel}</p>
                          <p className="mt-1 font-mono text-sm text-cyan-100">{simulation.rulesetVersion}</p>
                        </div>
                      </div>
                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-white/10 bg-slate-950/35 p-3">
                          <p className="text-xs text-slate-500">{copy.simulation.facts[0].label}</p>
                          <p className="mt-1 text-sm text-slate-100">{simulation.normalizedFacts.oxygenPartialPressureAtm.toFixed(3)} atm</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-slate-950/35 p-3">
                          <p className="text-xs text-slate-500">{copy.simulation.facts[1].label}</p>
                          <p className="mt-1 text-sm text-slate-100">{simulation.normalizedFacts.minimumTemperatureC}°C → {simulation.normalizedFacts.maximumTemperatureC}°C</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-slate-950/35 p-3">
                          <p className="text-xs text-slate-500">{copy.simulation.facts[2].label}</p>
                          <p className="mt-1 text-sm text-slate-100">{simulation.normalizedFacts.radiationDoseRateMilliSvPerHour} mSv/h</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-2">
                      <article className="glass-panel p-5">
                        <h2 className="font-medium text-white">{copy.simulation.pressuresTitle}</h2>
                        <div className="mt-4 space-y-3">
                          {simulation.pressures.map((pressure, index) => (
                            <div className="rounded-xl border border-white/10 bg-slate-950/30 p-4" key={pressure.id}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex gap-3">
                                  <span className="font-mono text-[10px] text-cyan-200">0{index + 1}</span>
                                  <div>
                                    <h3 className="text-sm font-medium text-slate-100">{copy.pressures[pressure.id].title}</h3>
                                    <p className="mt-1 text-xs leading-5 text-slate-400">{copy.pressures[pressure.id].description}</p>
                                  </div>
                                </div>
                                <span className="rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-2 py-1 font-mono text-[9px] uppercase text-amber-100">{copy.severity[pressure.severity]}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </article>
                      <article className="glass-panel p-5">
                        <h2 className="font-medium text-white">{copy.simulation.organismTitle}</h2>
                        <p className="mt-1 text-sm text-cyan-100">{copy.simulation.organismName}</p>
                        <p className="mt-2 text-xs leading-5 text-slate-500">{copy.simulation.candidateNotice}</p>
                        <div className="mt-4 space-y-3">
                          {simulation.adaptationCandidates.map(({ id, confidence, pressureIds }) => (
                            <div className="rounded-xl border border-white/10 bg-slate-950/30 p-3" key={id}>
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="text-sm text-slate-100">{copy.adaptations[id].title}</h3>
                                  <p className="mt-1 text-xs leading-5 text-slate-400">{copy.adaptations[id].description}</p>
                                </div>
                                <span className={`mt-1 size-2 shrink-0 rounded-full ${confidence === "stronglySupported" ? "bg-emerald-300" : "bg-cyan-300"}`} />
                              </div>
                              <p className="mt-2 font-mono text-[9px] uppercase tracking-wider text-slate-600">{pressureIds.map((id) => copy.pressures[id].title).join(" · ")}</p>
                            </div>
                          ))}
                        </div>
                      </article>
                    </div>

                    <article className="glass-panel p-5 sm:p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="font-medium text-white">{copy.simulation.comparisonTitle}</h2>
                        <span className="font-mono text-sm text-cyan-100">{copy.simulation.alignment}: {comparison.alignmentPercent}%</span>
                      </div>
                      <div className="mt-5 grid gap-4 md:grid-cols-3">
                        <div>
                          <h3 className="mb-2 text-xs uppercase tracking-wider text-emerald-200">{copy.simulation.supported}</h3>
                          <AdaptationList ids={comparison.supportedPredictions} language={language} />
                        </div>
                        <div>
                          <h3 className="mb-2 text-xs uppercase tracking-wider text-amber-200">{copy.simulation.missed}</h3>
                          <AdaptationList ids={comparison.missedAdaptations} language={language} />
                        </div>
                        <div>
                          <h3 className="mb-2 text-xs uppercase tracking-wider text-rose-200">{copy.simulation.unsupported}</h3>
                          <AdaptationList ids={comparison.unsupportedPredictions} language={language} />
                        </div>
                      </div>
                      <button className="button-primary mt-6" onClick={() => void requestDebrief()} type="button">{copy.simulation.instructor} <span aria-hidden="true">→</span></button>
                    </article>
                  </>
                )}
              </section>
            )}

            {stage === "debrief" && simulation && comparison && (
              <section aria-labelledby="debrief-heading" className="animate-[rise_0.4s_ease-out] space-y-5">
                <div>
                  <p className="eyebrow">{copy.debrief.eyebrow}</p>
                  <h1 id="debrief-heading" className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">{copy.debrief.title}</h1>
                </div>

                {isLoadingDebrief && (
                  <div aria-live="polite" className="glass-panel grid min-h-48 place-items-center p-8 text-center">
                    <div>
                      <span aria-hidden="true" className="mx-auto block size-8 animate-spin rounded-full border-2 border-cyan-200/20 border-t-cyan-200" />
                      <p className="mt-4 text-sm text-slate-300">{copy.debrief.loading}</p>
                    </div>
                  </div>
                )}

                {debriefError && !isLoadingDebrief && (
                  <div className="glass-panel border-rose-300/20 p-6">
                    <p className="text-sm text-rose-100">{copy.debrief.error}</p>
                    <button className="button-quiet mt-4" onClick={() => void requestDebrief()} type="button">{copy.debrief.retry}</button>
                  </div>
                )}

                {debrief && !isLoadingDebrief && (
                  <>
                    <article className="glass-panel overflow-hidden">
                      <div className="border-b border-white/10 bg-gradient-to-r from-violet-300/[0.08] to-transparent px-5 py-4 sm:px-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <Provenance tone={debrief.source === "gpt-5.6" ? "violet" : "slate"}>
                            {debrief.source === "gpt-5.6" ? copy.provenance.ai : copy.provenance.local}
                          </Provenance>
                          <span className="font-mono text-[10px] text-slate-500">{debrief.source === "gpt-5.6" ? copy.debrief.liveSource : copy.debrief.fallbackSource}</span>
                        </div>
                      </div>
                      <div className="space-y-6 p-5 sm:p-6">
                        {debrief.source === "local-fallback" && (
                          <p className="rounded-xl border border-amber-200/15 bg-amber-200/[0.04] p-4 text-sm leading-6 text-amber-50/85">{copy.debrief.fallbackNotice}</p>
                        )}
                        <p className="text-base leading-7 text-slate-100">{debrief.debrief.assessment}</p>
                        <div className="grid gap-5 md:grid-cols-2">
                          <div>
                            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-200">{copy.debrief.evidence}</h2>
                            <ul className="mt-3 space-y-2">
                              {debrief.debrief.evidence.map((item) => <li className="flex gap-2 text-sm leading-6 text-slate-300" key={item}><span className="text-cyan-300">•</span>{item}</li>)}
                            </ul>
                          </div>
                          <div>
                            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-violet-200">{copy.debrief.tradeOffs}</h2>
                            <ul className="mt-3 space-y-2">
                              {debrief.debrief.tradeOffs.map((item) => <li className="flex gap-2 text-sm leading-6 text-slate-300" key={item}><span className="text-violet-300">•</span>{item}</li>)}
                            </ul>
                          </div>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="rounded-xl border border-white/10 bg-slate-950/35 p-4">
                            <p className="text-xs text-slate-500">{copy.debrief.question}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-200">{debrief.debrief.followUpQuestion}</p>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-slate-950/35 p-4">
                            <p className="text-xs text-slate-500">{copy.debrief.experiment}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-200">{debrief.debrief.recommendedExperiment}</p>
                          </div>
                        </div>
                      </div>
                    </article>

                    <article className="glass-panel p-5 sm:p-6">
                      <h2 className="text-lg font-semibold text-white">{copy.debrief.revisionTitle}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{copy.debrief.revisionInstruction}</p>
                      <fieldset className="mt-5">
                        <legend className="text-sm font-medium text-slate-100">{copy.debrief.evidenceLabel}</legend>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {simulation.pressures.map(({ id }) => {
                            const selected = revisionEvidence.includes(id);
                            return (
                              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm ${selected ? "border-cyan-200/35 bg-cyan-300/[0.08] text-cyan-50" : "border-white/10 bg-slate-950/30 text-slate-300"}`} key={id}>
                                <input checked={selected} className="accent-cyan-300" onChange={() => toggleRevisionEvidence(id)} type="checkbox" />
                                {copy.pressures[id].title}
                              </label>
                            );
                          })}
                        </div>
                      </fieldset>
                      <label className="mt-5 block text-sm font-medium text-slate-100" htmlFor="revision-reasoning">{copy.debrief.revisionLabel}</label>
                      <textarea
                        className="mt-2 min-h-28 w-full resize-y rounded-xl border border-white/10 bg-slate-950/55 p-4 text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-200/50"
                        id="revision-reasoning"
                        maxLength={800}
                        onChange={(event) => setRevision(event.target.value)}
                        placeholder={copy.debrief.revisionPlaceholder}
                        value={revision}
                      />
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs text-slate-500">{revisionValid ? `${revisionEvidence.length}/4` : copy.debrief.revisionValidation}</p>
                        <button className="button-primary disabled:cursor-not-allowed disabled:opacity-40" disabled={!revisionValid} onClick={completeMission} type="button">{copy.debrief.submit} <span aria-hidden="true">→</span></button>
                      </div>
                    </article>
                  </>
                )}
              </section>
            )}

            {stage === "progress" && progress && hypothesis && (
              <section aria-labelledby="progress-heading" className="animate-[rise_0.4s_ease-out] space-y-5">
                <div>
                  <p className="eyebrow">{copy.progress.eyebrow}</p>
                  <h1 id="progress-heading" className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">{copy.progress.title}</h1>
                  <p className="mt-3 text-sm text-slate-300">{copy.progress.completed}</p>
                </div>
                <div className="grid gap-5 lg:grid-cols-2">
                  <article className="glass-panel p-6">
                    <p className="eyebrow">{copy.progress.archiveTitle}</p>
                    <h2 className="mt-3 text-xl font-semibold text-white">{copy.progress.archiveEntry}</h2>
                    <dl className="mt-5 space-y-3 text-sm">
                      <div className="flex justify-between gap-4 border-b border-white/10 pb-3"><dt className="text-slate-500">{copy.mission.planet}</dt><dd className="text-slate-200">Vespera b</dd></div>
                      <div className="flex justify-between gap-4 border-b border-white/10 pb-3"><dt className="text-slate-500">{copy.simulation.rulesetLabel}</dt><dd className="font-mono text-cyan-100">0.2.0</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-slate-500">{copy.progress.certification}</dt><dd className="text-slate-200">{copy.progress.candidate}</dd></div>
                    </dl>
                    <p className="mt-5 rounded-xl border border-amber-200/15 bg-amber-200/[0.04] p-3 text-xs leading-5 text-amber-50/75">{copy.progress.sessionOnly}</p>
                  </article>
                  <article className="glass-panel p-6">
                    <p className="eyebrow">{copy.progress.competencyTitle}</p>
                    <div className="mt-5 space-y-5">
                      <CompetencyBar label={copy.progress.hypothesisFormation} score={progress.hypothesisFormation} />
                      <CompetencyBar label={copy.progress.adaptationAnalysis} score={progress.adaptationAnalysis} />
                      <CompetencyBar label={copy.progress.evidenceUse} score={progress.evidenceUse} />
                    </div>
                  </article>
                </div>
                <article className="glass-panel flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="eyebrow">{copy.progress.nextTitle}</p>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{copy.progress.nextDescription}</p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-amber-200">{copy.progress.todo}</p>
                  </div>
                  <button className="button-primary shrink-0" onClick={resetMission} type="button">{copy.progress.repeat} <span aria-hidden="true">↻</span></button>
                </article>
              </section>
            )}
          </div>
        </main>
      </div>

      <footer className="shrink-0 border-t border-white/10 px-4 py-2 text-center text-[10px] text-slate-600 sm:px-7">
        {copy.footer}
      </footer>
    </div>
  );
}

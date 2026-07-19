"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";

import { calculateCompetencyProgress } from "@/domain/mission/debrief";
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
  RevisionConclusion,
  SimulationResult,
  SurvivalStrategy,
} from "@/domain/mission/schema";
import { compareHypothesis, simulateMission } from "@/domain/mission/simulate";
import { derivePlanetVisualState } from "@/domain/mission/visualization";
import {
  normalizeWorldParameters,
  WorldParametersSchema,
} from "@/domain/world/schema";
import type { WorldParameters } from "@/domain/world/schema";

import { COPY, type Language, type MissionStage } from "./copy";

type SystemScreen = "boot" | "home" | "mission";
type EditableGas =
  | "oxygenFraction"
  | "carbonDioxideFraction"
  | "inertGasFraction"
  | "toxicGasFraction";

const STAGES: MissionStage[] = [
  "briefing",
  "world",
  "decisions",
  "simulation",
  "debrief",
  "progress",
];

const PRESSURE_OPTIONS: PressureId[] = [
  "highGravity",
  "thermalRange",
  "radiationExposure",
  "limitedWater",
];

const ADAPTATION_OPTIONS: AdaptationId[] = [
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

const STRATEGY_OPTIONS: SurvivalStrategy[] = [
  "surfaceConservation",
  "shelterSeeking",
  "mobileForaging",
  "aerialDispersal",
];

const REVISION_OPTIONS: RevisionConclusion[] = [
  "strengthenHypothesis",
  "changeAdaptations",
  "changeStrategy",
];

const HABITATS: WorldParameters["habitat"][] = [
  "open surface",
  "desert",
  "shallow water",
  "deep ocean",
  "cave",
  "forest-like biome",
  "ice surface",
  "high atmosphere",
];

const GEOCHEMICAL_LEVELS: WorldParameters["geochemicalEnergyAvailability"][] = [
  "none",
  "low",
  "moderate",
  "high",
];

const ELECTRON_ACCEPTORS: WorldParameters["electronAcceptors"][number][] = [
  "nitrate",
  "sulfate",
  "ferricIron",
  "carbonDioxide",
];

/** Creates an independent, validated copy of the immutable mission baseline. */
function createBaselineWorld(): WorldParameters {
  return WorldParametersSchema.parse(VESPERA_MISSION.world);
}

/** Formats scientific values for the selected interface language. */
function formatNumber(value: number, language: Language, digits = 2): string {
  return new Intl.NumberFormat(language === "pl" ? "pl-PL" : "en-US", {
    maximumFractionDigits: digits,
  }).format(value);
}

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

/** Renders a provenance label for learner, calculated, AI, and visual content. */
function Provenance({
  children,
  tone = "cyan",
}: {
  children: React.ReactNode;
  tone?: "cyan" | "amber" | "violet" | "slate" | "emerald";
}) {
  const classes = {
    cyan: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
    amber: "border-amber-300/25 bg-amber-300/10 text-amber-100",
    violet: "border-violet-300/25 bg-violet-300/10 text-violet-100",
    slate: "border-slate-400/25 bg-slate-400/10 text-slate-200",
    emerald: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  }[tone];

  return <span className={`status-chip inline-flex ${classes}`}>{children}</span>;
}

/** Renders one explained range input. */
function RangeControl({
  id,
  label,
  influence,
  value,
  displayValue,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  influence: string;
  value: number;
  displayValue: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/30 p-4">
      <div className="flex items-start justify-between gap-4">
        <label className="text-sm font-medium text-slate-100" htmlFor={id}>{label}</label>
        <output className="shrink-0 font-mono text-xs text-cyan-100" htmlFor={id}>{displayValue}</output>
      </div>
      <input
        className="xl-range mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-cyan-300"
        id={id}
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        type="range"
        value={value}
      />
      <p className="mt-2 text-xs leading-5 text-slate-500">{influence}</p>
    </div>
  );
}

/** Renders the smoothly changing code-native planet interpretation. */
function PlanetVisualization({ world, language, compact = false }: {
  world: WorldParameters;
  language: Language;
  compact?: boolean;
}) {
  const copy = COPY[language];
  const instanceId = useId().replaceAll(":", "");
  const visual = derivePlanetVisualState(world);
  const normalized = normalizeWorldParameters(world);
  const waterTop = 300 - visual.waterCoverage * 220;
  const terrain = `hsl(${visual.terrainHue} 44% ${20 + visual.surfaceBrightness * 18}%)`;
  const terrainLight = `hsl(${visual.terrainHue} 50% ${29 + visual.surfaceBrightness * 22}%)`;
  const terrainDry = `hsl(${(visual.terrainHue + 22) % 360} 42% ${25 + visual.surfaceBrightness * 16}%)`;
  const atmosphere = `hsl(${visual.atmosphereHue} 88% 68%)`;
  const oceanDeep = `hsl(${(visual.terrainHue + 335) % 360} 52% 20%)`;
  const oceanShallow = `hsl(${(visual.terrainHue + 335) % 360} 62% 36%)`;
  const surfaceMapId = `planet-surface-map-${instanceId}`;
  const planetClipId = `planet-clip-${instanceId}`;
  const oceanId = `planet-ocean-${instanceId}`;
  const glowId = `planet-glow-${instanceId}`;

  return (
    <div className={`planet-viewport relative overflow-hidden rounded-2xl border border-cyan-200/15 bg-[#020713] ${compact ? "min-h-72" : "min-h-[420px]"}`}>
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(34,211,238,0.08),transparent_30%),radial-gradient(circle_at_78%_75%,rgba(124,58,237,0.10),transparent_32%)]" />
      <svg aria-label={`${copy.world.previewTitle}: ${copy.world.habitats[world.habitat]}`} className="relative z-10 h-full min-h-inherit w-full" role="img" viewBox="0 0 400 380">
        <defs>
          <linearGradient id={oceanId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={oceanShallow} stopOpacity="0.86" />
            <stop offset="100%" stopColor={oceanDeep} stopOpacity="0.98" />
          </linearGradient>
          <clipPath id={planetClipId}><circle cx="200" cy="190" r="108" /></clipPath>
          <filter id={glowId}><feGaussianBlur stdDeviation="8" /></filter>
          <g id={surfaceMapId}>
            <path d="M32 138 C55 108 91 121 118 95 C147 67 179 79 205 112 C227 139 250 136 277 108 C309 76 355 84 385 101 C404 112 410 130 394 141 C356 153 333 142 300 151 C255 164 229 158 194 142 C154 124 137 137 105 146 C72 157 51 151 32 138 Z" fill={terrainLight} opacity={0.9} />
            <path d="M34 228 C66 202 104 205 137 227 C157 241 183 242 202 224 C221 207 248 212 264 231 C245 255 204 264 160 258 C115 254 68 250 34 228 Z" fill={terrain} opacity={0.9} />
            <path d="M294 208 C326 184 368 187 400 205 C417 216 431 221 440 223 L440 260 C407 258 374 247 344 240 C323 235 304 226 294 208 Z" fill={terrain} opacity={0.9} />
            <path d="M48 141 C87 119 112 136 155 114 C196 94 234 122 278 97 C321 74 354 88 394 104" fill="none" opacity={visual.surfaceDetail * 0.42} stroke={terrainDry} strokeLinecap="round" strokeWidth={3 + visual.surfaceDetail * 6} />
            <path d="M51 241 C93 222 121 237 154 216 C190 194 242 224 284 213 C323 202 355 216 396 197" fill="none" opacity={visual.surfaceDetail * 0.34} stroke={terrainLight} strokeLinecap="round" strokeWidth={2 + visual.surfaceDetail * 5} />
            <path d="M34 85 C70 66 102 78 120 103 M266 137 C300 106 341 115 370 138 M176 219 C206 197 233 201 258 225" fill="none" opacity={visual.surfaceDetail * 0.32} stroke="#e2e8f0" strokeLinecap="round" strokeWidth="1.5" />
          </g>
        </defs>

        <g className="planet-transition" opacity={0.2 + visual.radiationActivity * 0.8}>
          <path d="M28 82 L112 126" stroke="#f0abfc" strokeWidth={1 + visual.radiationActivity * 3} />
          <path d="M45 42 L130 110" stroke="#c084fc" strokeWidth={1 + visual.radiationActivity * 2} />
          <path d="M300 45 L270 105" stroke="#e879f9" strokeWidth={1 + visual.radiationActivity * 3} />
        </g>

        <circle
          className="planet-transition"
          cx="200"
          cy="190"
          fill="none"
          opacity={visual.atmosphereOpacity * 0.55}
          r="116"
          stroke={atmosphere}
          strokeWidth={8 + visual.atmosphereOpacity * 16}
          style={{ filter: `url(#${glowId})`, transform: `scale(${visual.atmosphereScale})`, transformOrigin: "200px 190px" }}
        />

        <g className="planet-transition" style={{ transform: `scaleY(${visual.gravityScaleY})`, transformOrigin: "200px 190px" }}>
          <circle cx="200" cy="190" fill={terrain} r="110" />
          <g clipPath={`url(#${planetClipId})`}>
            <path className="planet-transition" d={`M84 ${waterTop} C135 ${waterTop - 12} 162 ${waterTop + 10} 205 ${waterTop - 4} S274 ${waterTop - 14} 316 ${waterTop + 5} L316 300 L84 300 Z`} fill={`url(#${oceanId})`} />
            <g className="planet-surface-drift">
              <use href={`#${surfaceMapId}`} x="-240" y="50" />
              <use href={`#${surfaceMapId}`} x="200" y="50" />
              <use href={`#${surfaceMapId}`} x="640" y="50" />
            </g>
            <path d="M88 124 C122 106 159 107 196 117 S266 130 311 111" fill="none" opacity={visual.cloudOpacity * 0.6} stroke="white" strokeLinecap="round" strokeWidth={5 + visual.cloudOpacity * 8} />
            <path className="planet-cloud-drift" d="M55 191 C100 170 156 182 201 166 S292 174 350 150" fill="none" opacity={visual.cloudOpacity * 0.42} stroke="#cffafe" strokeDasharray="56 20" strokeLinecap="round" strokeWidth="5" />
            <path d="M103 108 C150 87 249 87 298 108 L290 123 C238 110 157 110 110 125 Z" fill="#f8fafc" opacity={visual.iceCoverage * 0.9} />
            <path d="M101 271 C159 247 244 247 300 271 L288 282 C238 265 158 265 112 282 Z" fill="#e0f2fe" opacity={visual.iceCoverage} />
            <circle className="planet-transition" cx="200" cy="238" fill="#fb7185" filter={`url(#${glowId})`} opacity={visual.chemistryGlow * 0.65} r={28 + visual.chemistryGlow * 28} />
          </g>
          <circle className="planet-transition" cx="200" cy="190" fill="none" opacity={0.18 + visual.thermalContrast * 0.7} r="111" stroke="#fb923c" strokeDasharray={`${8 + visual.thermalContrast * 24} 10`} strokeWidth={1 + visual.thermalContrast * 5} />
          <circle className="planet-transition" cx="200" cy="190" fill="none" opacity={visual.shieldingVisibility * 0.8} r="125" stroke="#67e8f9" strokeDasharray="4 7" strokeWidth={1 + visual.shieldingVisibility * 5} />
        </g>

        <g aria-hidden="true" fill="white" opacity="0.5">
          <circle cx="57" cy="284" r="1" /><circle cx="336" cy="96" r="1.4" /><circle cx="319" cy="294" r="1" /><circle cx="88" cy="59" r="1" />
        </g>
        <text fill="#a5f3fc" fontFamily="monospace" fontSize="9" letterSpacing="1.6" textAnchor="middle" x="200" y="344">
          {copy.world.habitats[world.habitat].toUpperCase()}
        </text>
      </svg>
      <div className="absolute left-4 top-4 z-20"><Provenance tone="violet">{copy.provenance.visual}</Provenance></div>
      <div className="absolute bottom-4 left-4 right-4 z-20 grid grid-cols-3 gap-2 text-center font-mono text-[9px] uppercase tracking-wider text-slate-400">
        <span>{formatNumber(normalized.gravityG, language)} g</span>
        <span>{formatNumber(normalized.temperatureRangeC.minimum, language, 1)}°—{formatNumber(normalized.temperatureRangeC.maximum, language, 1)}°</span>
        <span>{formatNumber(normalized.waterAvailability * 100, language, 0)}% H₂O</span>
      </div>
    </div>
  );
}

/** Renders one competency score with an accessible progress bar. */
function CompetencyBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-sm"><span className="text-slate-200">{label}</span><span className="font-mono text-cyan-100">{score}%</span></div>
      <div aria-label={label} aria-valuemax={100} aria-valuemin={0} aria-valuenow={score} className="h-2 overflow-hidden rounded-full bg-slate-800" role="progressbar">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-200 transition-[width] duration-700" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

/** Implements the complete single-mission experimental training loop. */
export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [screen, setScreen] = useState<SystemScreen>("boot");
  const [bootStep, setBootStep] = useState(0);
  const [stage, setStage] = useState<MissionStage>("briefing");
  const [world, setWorld] = useState<WorldParameters>(createBaselineWorld);
  const [lockedWorld, setLockedWorld] = useState<WorldParameters | null>(null);
  const [selectedPressures, setSelectedPressures] = useState<PressureId[]>([]);
  const [selectedAdaptations, setSelectedAdaptations] = useState<AdaptationId[]>([]);
  const [strategy, setStrategy] = useState<SurvivalStrategy | null>(null);
  const [hypothesis, setHypothesis] = useState<CommittedHypothesis | null>(null);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [comparison, setComparison] = useState<HypothesisComparison | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [debrief, setDebrief] = useState<MissionInstructorResponse | null>(null);
  const [isLoadingDebrief, setIsLoadingDebrief] = useState(false);
  const [debriefError, setDebriefError] = useState(false);
  const [revisionEvidence, setRevisionEvidence] = useState<PressureId[]>([]);
  const [revisionConclusion, setRevisionConclusion] = useState<RevisionConclusion | null>(null);
  const [progress, setProgress] = useState<CompetencyProgress | null>(null);
  const copy = COPY[language];
  const stageIndex = STAGES.indexOf(stage);
  const worldResult = WorldParametersSchema.safeParse(world);
  const normalizedWorld = worldResult.success ? normalizeWorldParameters(worldResult.data) : null;
  const isVariant = JSON.stringify(world) !== JSON.stringify(VESPERA_MISSION.world);
  const decisionsValid = HypothesisSchema.safeParse({
    pressureIds: selectedPressures,
    adaptationIds: selectedAdaptations,
    strategy,
  }).success;
  const revisionValid = MissionRevisionSchema.safeParse({
    conclusion: revisionConclusion,
    evidencePressureIds: revisionEvidence,
  }).success;

  useEffect(() => {
    if (screen !== "boot" || bootStep >= copy.system.bootSteps.length) return;
    const timer = window.setTimeout(() => setBootStep((current) => current + 1), 520);
    return () => window.clearTimeout(timer);
  }, [bootStep, copy.system.bootSteps.length, screen]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = copy.document.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", copy.document.description);
  }, [copy.document.description, copy.document.title, language]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.getElementById("mission-main")?.scrollTo({ top: 0, behavior: "instant" });
  }, [screen, stage]);

  const resetExercise = (nextScreen: SystemScreen = "home") => {
    setScreen(nextScreen);
    setStage("briefing");
    setWorld(createBaselineWorld());
    setLockedWorld(null);
    setSelectedPressures([]);
    setSelectedAdaptations([]);
    setStrategy(null);
    setHypothesis(null);
    setSimulation(null);
    setComparison(null);
    setDebrief(null);
    setDebriefError(false);
    setRevisionEvidence([]);
    setRevisionConclusion(null);
    setProgress(null);
  };

  const updateGas = (field: EditableGas, percent: number) => {
    setWorld((current) => {
      const composition = current.atmosphereComposition;
      const editableFields: EditableGas[] = ["oxygenFraction", "carbonDioxideFraction", "inertGasFraction", "toxicGasFraction"];
      const otherTotal = editableFields.filter((item) => item !== field).reduce((total, item) => total + composition[item], 0);
      const fraction = Math.min(Math.max(percent / 100, 0), Math.max(0, 1 - otherTotal));
      return {
        ...current,
        atmosphereComposition: {
          ...composition,
          [field]: fraction,
          nitrogenFraction: Math.max(0, 1 - otherTotal - fraction),
        },
      };
    });
  };

  const toggleAcceptor = (acceptor: WorldParameters["electronAcceptors"][number]) => {
    setWorld((current) => ({
      ...current,
      electronAcceptors: current.electronAcceptors.includes(acceptor)
        ? current.electronAcceptors.filter((item) => item !== acceptor)
        : [...current.electronAcceptors, acceptor],
    }));
  };

  const togglePressure = (id: PressureId) => setSelectedPressures((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const toggleAdaptation = (id: AdaptationId) => setSelectedAdaptations((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length >= 6 ? current : [...current, id]);
  const toggleRevisionEvidence = (id: PressureId) => setRevisionEvidence((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const lockVariant = () => {
    const parsed = WorldParametersSchema.safeParse(world);
    if (!parsed.success) return;
    setLockedWorld(parsed.data);
    setSimulation(null);
    setComparison(null);
    setHypothesis(null);
    setStage("decisions");
  };

  const commitDecisions = () => {
    if (!lockedWorld) return;
    const parsed = HypothesisSchema.safeParse({ pressureIds: selectedPressures, adaptationIds: selectedAdaptations, strategy });
    if (!parsed.success) return;
    setHypothesis(CommittedHypothesisSchema.parse({ ...parsed.data, missionId: VESPERA_MISSION.id, committedAt: new Date().toISOString(), world: lockedWorld }));
    setStage("simulation");
  };

  const runSimulation = () => {
    if (!hypothesis || isSimulating) return;
    setIsSimulating(true);
    window.setTimeout(() => {
      const result = simulateMission(hypothesis.world);
      setSimulation(result);
      setComparison(compareHypothesis(hypothesis, result));
      setIsSimulating(false);
    }, 620);
  };

  const requestDebrief = async (responseLanguage: Language = language) => {
    if (!hypothesis || !simulation || !comparison) return;
    setStage("debrief");
    setDebrief(null);
    setDebriefError(false);
    setIsLoadingDebrief(true);
    try {
      const response = await fetch("/api/instructor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ language: responseLanguage, hypothesis }) });
      if (!response.ok) throw new Error("Mission Instructor request failed.");
      setDebrief(MissionInstructorResponseSchema.parse(await response.json()));
    } catch {
      setDebriefError(true);
    } finally {
      setIsLoadingDebrief(false);
    }
  };

  const changeLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    if (stage === "debrief" && hypothesis && simulation && comparison) void requestDebrief(nextLanguage);
  };

  const completeMission = () => {
    if (!comparison || !simulation) return;
    const parsed = MissionRevisionSchema.safeParse({ conclusion: revisionConclusion, evidencePressureIds: revisionEvidence });
    if (!parsed.success) return;
    setProgress(calculateCompetencyProgress(comparison, parsed.data, simulation));
    setStage("progress");
  };

  const languageSwitch = (
    <div aria-label={copy.language.label} className="flex rounded-lg border border-white/10 bg-white/[0.035] p-1" role="group">
      {(["en", "pl"] as const).map((option) => (
        <button aria-label={option === "en" ? copy.language.english : copy.language.polish} aria-pressed={language === option} className={`rounded-md px-2.5 py-1 font-mono text-[10px] font-semibold transition focus-visible:outline-2 focus-visible:outline-cyan-300 ${language === option ? "bg-cyan-300/15 text-cyan-100" : "text-slate-500 hover:text-slate-200"}`} key={option} onClick={() => changeLanguage(option)} type="button">{option.toUpperCase()}</button>
      ))}
    </div>
  );

  if (screen === "boot") {
    const complete = bootStep >= copy.system.bootSteps.length;
    return (
      <main className="boot-screen relative grid min-h-dvh place-items-center overflow-hidden bg-[#01040d] px-5 text-slate-100">
        <div aria-hidden="true" className="boot-grid absolute inset-0" />
        <div className="absolute right-5 top-5">{languageSwitch}</div>
        <section aria-labelledby="boot-title" className="relative z-10 w-full max-w-xl text-center">
          <div className="mx-auto mb-7 grid size-24 place-items-center"><span className="boot-orbit absolute size-20 rounded-full border border-cyan-300/30" /><OrbitMark /></div>
          <p className="eyebrow">XL / BOOT SEQUENCE</p>
          <h1 className="mt-3 font-mono text-2xl font-semibold tracking-[0.18em] text-white sm:text-3xl" id="boot-title">{copy.system.bootTitle}</h1>
          <p className="mt-3 text-sm text-cyan-100/70">{copy.system.bootSubtitle}</p>
          <div aria-live="polite" className="mt-8 min-h-32 rounded-xl border border-cyan-300/15 bg-cyan-300/[0.025] p-5 text-left font-mono text-xs">
            {copy.system.bootSteps.map((item, index) => (
              <p className={`mb-2 transition-all duration-300 ${index < bootStep ? "translate-x-0 opacity-100 text-cyan-100" : "translate-x-2 opacity-0"}`} key={item}><span className="mr-3 text-emerald-300">{index < bootStep ? "✓" : "·"}</span>{item}</p>
            ))}
            {complete && <p className="mt-4 animate-pulse text-center tracking-[0.2em] text-emerald-200">{copy.system.bootReady}</p>}
          </div>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-cyan-300 transition-[width] duration-500" style={{ width: `${Math.min(100, (bootStep / copy.system.bootSteps.length) * 100)}%` }} /></div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {!complete && <button className="button-quiet" onClick={() => setBootStep(copy.system.bootSteps.length)} type="button">{copy.system.skip}</button>}
            <button className="button-primary disabled:cursor-wait disabled:opacity-35" disabled={!complete} onClick={() => setScreen("home")} type="button">{copy.system.enter} <span aria-hidden="true">→</span></button>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "home") {
    return (
      <div className="flex min-h-dvh flex-col overflow-hidden bg-[#030817] text-slate-100">
        <header className="border-b border-white/10 bg-[#050b1c]/92 px-5 py-3 backdrop-blur-xl sm:px-8"><div className="mx-auto flex max-w-[1500px] items-center justify-between"><div className="flex items-center gap-3"><OrbitMark /><div><p className="text-sm font-semibold text-white">Xenogenesis Lab</p><p className="font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-200/80">{copy.header.subtitle}</p></div></div>{languageSwitch}</div></header>
        <main className="relative flex flex-1 items-center px-5 py-10 sm:px-8">
          <Image alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-20" fill priority sizes="100vw" src="/XenogenesisLabBanner.png" />
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,#030817_5%,rgba(3,8,23,0.86)_55%,rgba(3,8,23,0.58)_100%)]" />
          <div className="relative mx-auto grid w-full max-w-[1350px] gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <section><p className="eyebrow">{copy.home.eyebrow}</p><h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-white sm:text-6xl">{copy.home.title}</h1><p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">{copy.home.description}</p><div className="mt-7 flex flex-wrap gap-3"><Provenance tone="emerald">{copy.home.available}</Provenance><span className="status-chip border-white/10 bg-white/[0.04] text-slate-300">{copy.home.duration}</span></div></section>
            <section className="glass-panel overflow-hidden"><div className="border-b border-cyan-200/10 bg-cyan-200/[0.04] p-6"><p className="eyebrow">{copy.header.mission}</p><h2 className="mt-3 text-2xl font-semibold text-white">{copy.home.missionTitle}</h2><p className="mt-3 text-sm leading-6 text-slate-300">{copy.home.missionDescription}</p><button className="button-primary mt-6" onClick={() => { setScreen("mission"); setStage("briefing"); }} type="button">{copy.home.begin} <span aria-hidden="true">→</span></button></div><div className="p-6"><h3 className="text-sm font-medium text-white">{copy.home.firstTime}</h3><ol className="mt-4 grid gap-3 sm:grid-cols-2">{copy.home.steps.map((step, index) => <li className="flex gap-3 rounded-xl border border-white/10 bg-slate-950/30 p-3 text-xs leading-5 text-slate-300" key={step}><span className="font-mono text-cyan-200">0{index + 1}</span>{step}</li>)}</ol></div></section>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-[#030817] text-slate-100 selection:bg-cyan-300/30 lg:h-dvh lg:overflow-hidden">
      <header className="shrink-0 border-b border-white/10 bg-[#050b1c]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1700px] items-center justify-between gap-3 px-4 py-3 sm:px-7 lg:px-8">
          <button aria-label={copy.header.home} className="flex items-center gap-3 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300" onClick={() => resetExercise("home")} type="button"><OrbitMark /><span><span className="block text-sm font-semibold tracking-[-0.02em] text-white">Xenogenesis Lab</span><span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-200/80">{copy.header.subtitle}</span></span></button>
          <div className="flex items-center gap-2 sm:gap-3"><span className="status-chip hidden border-white/10 bg-white/[0.04] text-slate-300 sm:inline-flex">{copy.header.mission}</span>{languageSwitch}<button className="button-quiet hidden sm:inline-flex" onClick={() => resetExercise("home")} type="button">{copy.header.reset}</button></div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1700px] flex-1 flex-col lg:min-h-0 lg:flex-row">
        <aside className="shrink-0 border-b border-white/10 bg-[#050b1c]/70 px-4 py-4 sm:px-7 lg:w-60 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
          <nav aria-label={copy.stageNavigation}><ol className="journey-scroll flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">{STAGES.map((item, index) => { const current = item === stage; const complete = index < stageIndex; return <li className="min-w-max lg:min-w-0" key={item}><div aria-current={current ? "step" : undefined} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${current ? "border-cyan-200/35 bg-cyan-300/10 text-white" : complete ? "border-emerald-300/15 bg-emerald-300/[0.05] text-emerald-100" : "border-white/[0.06] bg-white/[0.015] text-slate-500"}`}><span className="grid size-6 place-items-center rounded-full border border-current/20 font-mono text-[9px]">{complete ? "✓" : `0${index + 1}`}</span><span className="text-sm font-medium">{copy.stages[item]}</span></div></li>; })}</ol></nav>
          <div className="mt-6 hidden rounded-xl border border-white/10 bg-white/[0.025] p-4 lg:block"><p className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">{copy.mission.planet}</p><p className="mt-2 text-sm leading-5 text-slate-300">{copy.mission.objective}</p><p className="mt-3 font-mono text-[9px] text-cyan-200/70">{copy.mission.ruleset}</p></div>
        </aside>

        <main className="min-w-0 flex-1 lg:min-h-0 lg:overflow-y-auto" id="mission-main"><div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
          {stage === "briefing" && (
            <section aria-labelledby="briefing-heading" className="animate-[rise_0.4s_ease-out]">
              <div className="relative isolate overflow-hidden rounded-2xl border border-cyan-200/15 bg-[#071126]"><Image alt="" aria-hidden="true" className="absolute inset-0 -z-20 h-full w-full object-cover object-[55%_45%] opacity-45" fill priority sizes="(max-width: 1024px) 100vw, 1200px" src="/XenogenesisLabBanner.png" /><div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,8,23,0.98)_0%,rgba(3,8,23,0.82)_58%,rgba(3,8,23,0.28)_100%)]" /><div className="max-w-3xl px-6 py-9 sm:px-9 sm:py-11"><p className="eyebrow">{copy.mission.eyebrow}</p><h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-white sm:text-5xl" id="briefing-heading">{copy.mission.title}</h1><p className="mt-5 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">{copy.mission.briefing}</p></div></div>
              <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]"><article className="glass-panel p-6"><p className="eyebrow">{copy.mission.objectiveLabel}</p><h2 className="mt-3 text-xl font-semibold text-white">{copy.mission.planet}</h2><p className="mt-3 text-sm leading-6 text-slate-300">{copy.mission.objective}</p><p className="mt-4 rounded-xl border border-amber-200/15 bg-amber-200/[0.04] p-4 text-sm leading-6 text-amber-50/85">{copy.mission.candidateTask}</p><button className="button-primary mt-6" onClick={() => setStage("world")} type="button">{copy.mission.begin} <span aria-hidden="true">→</span></button></article><article className="glass-panel p-6"><div className="flex items-center justify-between gap-3"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-200">{copy.mission.factsTitle}</p><Provenance>{copy.provenance.baseline}</Provenance></div><dl className="mt-4 grid grid-cols-2 gap-3">{[
                [copy.mission.facts.gravity, "1.7 g"], [copy.mission.facts.pressure, "1.2 atm"], [copy.mission.facts.temperature, "18°C ± 24°C"], [copy.mission.facts.radiation, "0.4 mSv/h"], [copy.mission.facts.water, "0.38"], [copy.mission.facts.habitat, copy.world.habitats["open surface"]],
              ].map(([label, value]) => <div className="rounded-xl border border-white/10 bg-slate-950/35 p-3" key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 text-sm text-slate-100">{value}</dd></div>)}</dl></article></div>
              <article className="glass-panel mt-5 p-6"><h2 className="text-sm font-medium text-white">{copy.mission.instructionsTitle}</h2><ol className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{copy.mission.instructions.map((item, index) => <li className="flex gap-3 rounded-xl border border-white/10 bg-slate-950/30 p-3 text-xs leading-5 text-slate-300" key={item}><span className="font-mono text-cyan-200">0{index + 1}</span>{item}</li>)}</ol></article>
            </section>
          )}

          {stage === "world" && normalizedWorld && (
            <section aria-labelledby="world-heading" className="animate-[rise_0.4s_ease-out] space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">{copy.world.eyebrow}</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl" id="world-heading">{copy.world.title}</h1><p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">{copy.world.instruction}</p></div><Provenance tone={isVariant ? "amber" : "cyan"}>{isVariant ? copy.world.variant : copy.world.baseline}</Provenance></div>
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.82fr)]">
                <div className="space-y-5">
                  <article className="glass-panel p-5"><h2 className="font-medium text-white">{copy.world.controlsTitle}</h2><div className="mt-4 grid gap-3 md:grid-cols-2">
                    <RangeControl id="gravity" label={copy.world.parameters.gravity.label} influence={copy.world.parameters.gravity.influence} value={world.gravityG} displayValue={`${formatNumber(world.gravityG, language)} g`} min={0.05} max={5} step={0.05} onChange={(value) => setWorld((current) => ({ ...current, gravityG: value }))} />
                    <RangeControl id="temperature" label={copy.world.parameters.temperature.label} influence={copy.world.parameters.temperature.influence} value={world.averageTemperatureC} displayValue={`${formatNumber(world.averageTemperatureC, language, 1)}°C`} min={-100} max={150} step={1} onChange={(value) => setWorld((current) => ({ ...current, averageTemperatureC: value }))} />
                    <RangeControl id="variation" label={copy.world.parameters.variation.label} influence={copy.world.parameters.variation.influence} value={world.temperatureVariationC} displayValue={`±${formatNumber(world.temperatureVariationC, language, 1)}°C`} min={0} max={100} step={1} onChange={(value) => setWorld((current) => ({ ...current, temperatureVariationC: value }))} />
                    <RangeControl id="radiation" label={copy.world.parameters.radiation.label} influence={copy.world.parameters.radiation.influence} value={world.radiationDoseRate.value} displayValue={`${formatNumber(world.radiationDoseRate.value, language, 3)} mSv/h`} min={0} max={10} step={0.01} onChange={(value) => setWorld((current) => ({ ...current, radiationDoseRate: { value, unit: "mSv/h" } }))} />
                    <RangeControl id="light" label={copy.world.parameters.light.label} influence={copy.world.parameters.light.influence} value={world.lightLevel} displayValue={`${formatNumber(world.lightLevel * 100, language, 0)}%`} min={0} max={1} step={0.01} onChange={(value) => setWorld((current) => ({ ...current, lightLevel: value }))} />
                    <RangeControl id="water" label={copy.world.parameters.water.label} influence={copy.world.parameters.water.influence} value={world.waterAvailability} displayValue={`${formatNumber(world.waterAvailability * 100, language, 0)}%`} min={0} max={1} step={0.01} onChange={(value) => setWorld((current) => ({ ...current, waterAvailability: value }))} />
                    <div className="rounded-xl border border-white/10 bg-slate-950/30 p-4 md:col-span-2"><label className="text-sm font-medium text-slate-100" htmlFor="habitat">{copy.world.parameters.habitat.label}</label><select className="mt-3 w-full rounded-lg border border-white/10 bg-[#071126] p-2.5 text-sm text-slate-100" id="habitat" onChange={(event) => setWorld((current) => ({ ...current, habitat: event.target.value as WorldParameters["habitat"] }))} value={world.habitat}>{HABITATS.map((item) => <option key={item} value={item}>{copy.world.habitats[item]}</option>)}</select><p className="mt-2 text-xs leading-5 text-slate-500">{copy.world.parameters.habitat.influence}</p></div>
                  </div></article>

                  <article className="glass-panel p-5"><h2 className="font-medium text-white">{copy.world.atmosphereTitle}</h2><div className="mt-4 grid gap-3 md:grid-cols-2">
                    <RangeControl id="pressure" label={copy.world.parameters.pressure.label} influence={copy.world.parameters.pressure.influence} value={world.atmosphericPressureAtm} displayValue={`${formatNumber(world.atmosphericPressureAtm, language)} atm`} min={0.05} max={20} step={0.05} onChange={(value) => setWorld((current) => ({ ...current, atmosphericPressureAtm: value }))} />
                    <RangeControl id="oxygen" label={copy.world.parameters.oxygen.label} influence={copy.world.parameters.oxygen.influence} value={world.atmosphereComposition.oxygenFraction * 100} displayValue={`${formatNumber(world.atmosphereComposition.oxygenFraction * 100, language, 2)}%`} min={0} max={60} step={0.1} onChange={(value) => updateGas("oxygenFraction", value)} />
                    <RangeControl id="co2" label={copy.world.parameters.carbonDioxide.label} influence={copy.world.parameters.carbonDioxide.influence} value={world.atmosphereComposition.carbonDioxideFraction * 100} displayValue={`${formatNumber(world.atmosphereComposition.carbonDioxideFraction * 100, language, 2)}%`} min={0} max={30} step={0.01} onChange={(value) => updateGas("carbonDioxideFraction", value)} />
                    <RangeControl id="inert" label={copy.world.parameters.inertGas.label} influence={copy.world.parameters.inertGas.influence} value={world.atmosphereComposition.inertGasFraction * 100} displayValue={`${formatNumber(world.atmosphereComposition.inertGasFraction * 100, language, 2)}%`} min={0} max={30} step={0.1} onChange={(value) => updateGas("inertGasFraction", value)} />
                    <RangeControl id="toxic" label={copy.world.parameters.toxicGas.label} influence={copy.world.parameters.toxicGas.influence} value={world.atmosphereComposition.toxicGasFraction * 100} displayValue={`${formatNumber(world.atmosphereComposition.toxicGasFraction * 100, language, 2)}%`} min={0} max={30} step={0.1} onChange={(value) => updateGas("toxicGasFraction", value)} />
                    <RangeControl id="molar-mass" label={copy.world.parameters.molarMass.label} influence={copy.world.parameters.molarMass.influence} value={(world.atmosphericMeanMolarMassKgPerMol ?? 0.02897) * 1000} displayValue={`${formatNumber((world.atmosphericMeanMolarMassKgPerMol ?? 0.02897) * 1000, language, 2)} g/mol`} min={2} max={200} step={0.01} onChange={(value) => setWorld((current) => ({ ...current, atmosphericMeanMolarMassKgPerMol: value / 1000 }))} />
                    <div className="rounded-xl border border-white/10 bg-slate-950/30 p-4 md:col-span-2"><div className="flex justify-between gap-3"><span className="text-sm text-slate-200">{copy.world.parameters.nitrogen.label}</span><span className="font-mono text-xs text-cyan-100">{formatNumber(world.atmosphereComposition.nitrogenFraction * 100, language, 2)}%</span></div><p className="mt-2 text-xs leading-5 text-slate-500">{copy.world.nitrogenBalance}</p></div>
                  </div></article>

                  <article className="glass-panel p-5"><h2 className="font-medium text-white">{copy.world.energyTitle}</h2><div className="mt-4 grid gap-3 md:grid-cols-2">
                    <RangeControl id="shielding" label={copy.world.parameters.shielding.label} influence={copy.world.parameters.shielding.influence} value={world.shieldingColumnMassKgM2} displayValue={`${formatNumber(world.shieldingColumnMassKgM2, language, 0)} kg/m²`} min={0} max={10000} step={50} onChange={(value) => setWorld((current) => ({ ...current, shieldingColumnMassKgM2: value }))} />
                    <div className="rounded-xl border border-white/10 bg-slate-950/30 p-4"><label className="text-sm font-medium text-slate-100" htmlFor="geochemical">{copy.world.parameters.geochemical.label}</label><select className="mt-3 w-full rounded-lg border border-white/10 bg-[#071126] p-2.5 text-sm text-slate-100" id="geochemical" onChange={(event) => { const value = event.target.value as WorldParameters["geochemicalEnergyAvailability"]; setWorld((current) => ({ ...current, geochemicalEnergyAvailability: value, electronAcceptors: value === "none" ? [] : current.electronAcceptors })); }} value={world.geochemicalEnergyAvailability}>{GEOCHEMICAL_LEVELS.map((item) => <option key={item} value={item}>{copy.world.geochemicalLevels[item]}</option>)}</select><p className="mt-2 text-xs leading-5 text-slate-500">{copy.world.parameters.geochemical.influence}</p></div>
                    <fieldset className="rounded-xl border border-white/10 bg-slate-950/30 p-4 md:col-span-2"><legend className="px-1 text-sm font-medium text-slate-100">{copy.world.parameters.acceptors.label}</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{ELECTRON_ACCEPTORS.map((acceptor) => <label className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${world.geochemicalEnergyAvailability === "none" ? "cursor-not-allowed border-white/5 text-slate-600" : "cursor-pointer border-white/10 text-slate-300"}`} key={acceptor}><input checked={world.electronAcceptors.includes(acceptor)} disabled={world.geochemicalEnergyAvailability === "none"} onChange={() => toggleAcceptor(acceptor)} type="checkbox" />{copy.world.acceptorNames[acceptor]}</label>)}</div><p className="mt-2 text-xs leading-5 text-slate-500">{copy.world.parameters.acceptors.influence}</p></fieldset>
                  </div></article>
                </div>

                <aside className="space-y-4 xl:sticky xl:top-0 xl:self-start"><PlanetVisualization language={language} world={world} /><article className="glass-panel p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-medium text-white">{copy.world.localValues}</h2><button className="button-quiet" disabled={!isVariant} onClick={() => setWorld(createBaselineWorld())} type="button">{copy.world.reset}</button></div><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-xs text-slate-500">{copy.world.temperatureRange}</dt><dd className="mt-1 text-slate-100">{formatNumber(normalizedWorld.temperatureRangeC.minimum, language, 1)}°C → {formatNumber(normalizedWorld.temperatureRangeC.maximum, language, 1)}°C</dd></div><div><dt className="text-xs text-slate-500">{copy.world.oxygenPressure}</dt><dd className="mt-1 text-slate-100">{formatNumber(normalizedWorld.oxygenPartialPressureAtm, language, 3)} atm</dd></div><div><dt className="text-xs text-slate-500">{copy.world.density}</dt><dd className="mt-1 text-slate-100">{normalizedWorld.atmosphericDensityKgM3 === undefined ? copy.world.notAvailable : `${formatNumber(normalizedWorld.atmosphericDensityKgM3, language, 3)} kg/m³`}</dd></div><div><dt className="text-xs text-slate-500">{copy.world.parameters.nitrogen.label}</dt><dd className="mt-1 text-slate-100">{formatNumber(world.atmosphereComposition.nitrogenFraction * 100, language, 2)}%</dd></div></dl><p className="mt-4 rounded-xl border border-violet-200/15 bg-violet-200/[0.04] p-3 text-xs leading-5 text-violet-100/75">{copy.world.previewNotice}</p><button className="button-primary mt-5 w-full justify-center disabled:cursor-not-allowed disabled:opacity-40" disabled={!worldResult.success} onClick={lockVariant} type="button">{copy.world.lock} <span aria-hidden="true">→</span></button></article></aside>
              </div>
            </section>
          )}

          {stage === "decisions" && lockedWorld && (
            <section aria-labelledby="decisions-heading" className="animate-[rise_0.4s_ease-out] space-y-5"><div><p className="eyebrow">{copy.decisions.eyebrow}</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl" id="decisions-heading">{copy.decisions.title}</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{copy.decisions.instruction}</p></div>
              <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]"><div className="space-y-4"><PlanetVisualization compact language={language} world={lockedWorld} /><article className="glass-panel p-4"><div className="flex items-center justify-between gap-3"><div><p className="eyebrow">{copy.decisions.worldSummary}</p><p className="mt-2 text-sm text-slate-200">{formatNumber(lockedWorld.gravityG, language)} g · {formatNumber(lockedWorld.atmosphericPressureAtm, language)} atm · {formatNumber(lockedWorld.averageTemperatureC, language, 1)}°C ± {formatNumber(lockedWorld.temperatureVariationC, language, 1)}°C</p></div><button className="button-quiet" onClick={() => setStage("world")} type="button">{copy.decisions.editWorld}</button></div></article></div>
                <div className="space-y-4"><article className="glass-panel p-5"><h2 className="font-medium text-white">{copy.decisions.pressureTitle}</h2><p className="mt-1 text-xs text-slate-500">{copy.decisions.pressureHint}</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{PRESSURE_OPTIONS.map((id) => { const selected = selectedPressures.includes(id); return <button aria-pressed={selected} className={`selection-card ${selected ? "selection-card-active" : ""}`} key={id} onClick={() => togglePressure(id)} type="button"><span className="selection-check">{selected ? "✓" : ""}</span><span><strong>{copy.pressures[id].title}</strong><small>{copy.pressures[id].description}</small></span></button>; })}</div></article>
                <article className="glass-panel p-5"><h2 className="font-medium text-white">{copy.decisions.adaptationTitle}</h2><p className="mt-1 text-xs text-slate-500">{copy.decisions.adaptationHint}</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{ADAPTATION_OPTIONS.map((id) => { const selected = selectedAdaptations.includes(id); return <button aria-pressed={selected} className={`selection-card ${selected ? "selection-card-active" : ""}`} key={id} onClick={() => toggleAdaptation(id)} type="button"><span className="selection-check">{selected ? "✓" : ""}</span><span><strong>{copy.adaptations[id].title}</strong><small>{copy.adaptations[id].description}</small></span></button>; })}</div></article>
                <article className="glass-panel p-5"><h2 className="font-medium text-white">{copy.decisions.strategyTitle}</h2><p className="mt-1 text-xs text-slate-500">{copy.decisions.strategyHint}</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{STRATEGY_OPTIONS.map((id) => <button aria-pressed={strategy === id} className={`selection-card ${strategy === id ? "selection-card-active" : ""}`} key={id} onClick={() => setStrategy(id)} type="button"><span className="selection-radio">{strategy === id ? "●" : ""}</span><span><strong>{copy.strategies[id].title}</strong><small>{copy.strategies[id].description}</small></span></button>)}</div><div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-slate-500">{decisionsValid ? `${selectedPressures.length} + ${selectedAdaptations.length} + 1` : copy.decisions.validation}</p><button className="button-primary disabled:cursor-not-allowed disabled:opacity-40" disabled={!decisionsValid} onClick={commitDecisions} type="button">{copy.decisions.commit} <span aria-hidden="true">→</span></button></div></article></div></div>
            </section>
          )}

          {stage === "simulation" && hypothesis && (
            <section aria-labelledby="simulation-heading" className="animate-[rise_0.4s_ease-out] space-y-5"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">{copy.simulation.eyebrow}</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl" id="simulation-heading">{copy.simulation.title}</h1></div><Provenance tone="amber">{copy.provenance.hypothesis}</Provenance></div>
              <article className="glass-panel p-5"><p className="text-xs text-amber-100/80">{copy.decisions.committed}</p><div className="mt-3 flex flex-wrap gap-2">{hypothesis.pressureIds.map((id) => <span className="rounded-full border border-amber-300/15 bg-amber-300/[0.05] px-3 py-1 text-xs text-amber-100" key={id}>{copy.pressures[id].title}</span>)}{hypothesis.adaptationIds.map((id) => <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300" key={id}>{copy.adaptations[id].title}</span>)}<span className="rounded-full border border-violet-300/15 bg-violet-300/[0.05] px-3 py-1 text-xs text-violet-100">{copy.strategies[hypothesis.strategy].title}</span></div></article>
              {!simulation ? <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]"><PlanetVisualization compact language={language} world={hypothesis.world} /><div className="glass-panel p-6 sm:p-8"><p className="max-w-3xl text-sm leading-6 text-slate-300">{copy.simulation.ready}</p><button className="button-primary mt-5 disabled:cursor-wait disabled:opacity-50" disabled={isSimulating} onClick={runSimulation} type="button">{isSimulating ? copy.simulation.running : copy.simulation.run} {!isSimulating && <span aria-hidden="true">→</span>}</button></div></div> : comparison && <>
                <div className="glass-panel border-cyan-200/20 p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><Provenance>{copy.provenance.calculated}</Provenance><p className="mt-4 text-xs text-slate-500">{copy.simulation.outcomeLabel}</p><h2 className="mt-1 text-xl font-semibold text-white">{copy.simulation.outcome}</h2></div><div className="text-right"><p className="text-xs text-slate-500">{copy.simulation.rulesetLabel}</p><p className="mt-1 font-mono text-sm text-cyan-100">{simulation.rulesetVersion}</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
                  [copy.world.oxygenPressure, `${formatNumber(simulation.normalizedFacts.oxygenPartialPressureAtm, language, 3)} atm`], [copy.world.temperatureRange, `${formatNumber(simulation.normalizedFacts.minimumTemperatureC, language, 1)}°C → ${formatNumber(simulation.normalizedFacts.maximumTemperatureC, language, 1)}°C`], [copy.world.parameters.radiation.label, `${formatNumber(simulation.normalizedFacts.radiationDoseRateMilliSvPerHour, language, 3)} mSv/h`], [copy.world.parameters.water.label, formatNumber(simulation.normalizedFacts.waterAvailability, language, 2)],
                ].map(([label, value]) => <div className="rounded-xl border border-white/10 bg-slate-950/35 p-3" key={label}><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-sm text-slate-100">{value}</p></div>)}</div></div>
                <div className="grid gap-5 xl:grid-cols-2"><article className="glass-panel p-5"><h2 className="font-medium text-white">{copy.simulation.pressureTitle}</h2><div className="mt-4 space-y-3">{simulation.pressures.length === 0 ? <p className="text-sm text-slate-400">{copy.simulation.none}</p> : simulation.pressures.map((pressure, index) => <div className="rounded-xl border border-white/10 bg-slate-950/30 p-4" key={pressure.id}><div className="flex items-start justify-between gap-3"><div className="flex gap-3"><span className="font-mono text-[10px] text-cyan-200">0{index + 1}</span><div><h3 className="text-sm font-medium text-slate-100">{copy.pressures[pressure.id].title}</h3><p className="mt-1 text-xs leading-5 text-slate-400">{copy.pressures[pressure.id].description}</p></div></div><span className="rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-2 py-1 font-mono text-[9px] uppercase text-amber-100">{copy.severity[pressure.severity]}</span></div></div>)}</div></article>
                <article className="glass-panel p-5"><h2 className="font-medium text-white">{copy.simulation.organismTitle}</h2><p className="mt-2 text-xs leading-5 text-slate-500">{copy.simulation.candidateNotice}</p><div className="mt-4 space-y-3">{simulation.adaptationCandidates.length === 0 ? <p className="text-sm text-slate-400">{copy.simulation.none}</p> : simulation.adaptationCandidates.map(({ id, confidence, pressureIds }) => <div className="rounded-xl border border-white/10 bg-slate-950/30 p-3" key={id}><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm text-slate-100">{copy.adaptations[id].title}</h3><p className="mt-1 text-xs leading-5 text-slate-400">{copy.adaptations[id].description}</p></div><span className={`mt-1 size-2 shrink-0 rounded-full ${confidence === "stronglySupported" ? "bg-emerald-300" : "bg-cyan-300"}`} /></div><p className="mt-2 font-mono text-[9px] uppercase tracking-wider text-slate-600">{pressureIds.map((id) => copy.pressures[id].title).join(" · ")}</p></div>)}</div></article></div>
                <article className="glass-panel p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-medium text-white">{copy.simulation.comparisonTitle}</h2><span className="font-mono text-sm text-cyan-100">{copy.simulation.alignment}: {comparison.alignmentPercent}%</span></div><div className="mt-5 grid gap-5 lg:grid-cols-2"><div><h3 className="text-xs uppercase tracking-wider text-amber-200">{copy.simulation.pressureAccuracy}</h3><div className="mt-3 grid gap-3 sm:grid-cols-3">{[[copy.simulation.supported, comparison.supportedPressurePredictions], [copy.simulation.missed, comparison.missedPressures], [copy.simulation.unsupported, comparison.unsupportedPressurePredictions]].map(([label, ids]) => <div key={label as string}><p className="mb-2 text-xs text-slate-500">{label as string}</p><p className="text-sm leading-6 text-slate-200">{(ids as PressureId[]).length ? (ids as PressureId[]).map((id) => copy.pressures[id].title).join(", ") : copy.simulation.none}</p></div>)}</div></div><div><h3 className="text-xs uppercase tracking-wider text-cyan-200">{copy.simulation.organismTitle}</h3><div className="mt-3 grid gap-3 sm:grid-cols-3">{[[copy.simulation.supported, comparison.supportedPredictions], [copy.simulation.missed, comparison.missedAdaptations], [copy.simulation.unsupported, comparison.unsupportedPredictions]].map(([label, ids]) => <div key={label as string}><p className="mb-2 text-xs text-slate-500">{label as string}</p><p className="text-sm leading-6 text-slate-200">{(ids as AdaptationId[]).length ? (ids as AdaptationId[]).map((id) => copy.adaptations[id].title).join(", ") : copy.simulation.none}</p></div>)}</div></div></div><button className="button-primary mt-6" onClick={() => void requestDebrief()} type="button">{copy.simulation.instructor} <span aria-hidden="true">→</span></button></article>
              </>}
            </section>
          )}

          {stage === "debrief" && simulation && comparison && (
            <section aria-labelledby="debrief-heading" className="animate-[rise_0.4s_ease-out] space-y-5"><div><p className="eyebrow">{copy.debrief.eyebrow}</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl" id="debrief-heading">{copy.debrief.title}</h1></div>
              {isLoadingDebrief && <div aria-live="polite" className="glass-panel grid min-h-48 place-items-center p-8 text-center"><div><span aria-hidden="true" className="mx-auto block size-8 animate-spin rounded-full border-2 border-cyan-200/20 border-t-cyan-200" /><p className="mt-4 text-sm text-slate-300">{copy.debrief.loading}</p></div></div>}
              {debriefError && !isLoadingDebrief && <div className="glass-panel border-rose-300/20 p-6"><p className="text-sm text-rose-100">{copy.debrief.error}</p><button className="button-quiet mt-4" onClick={() => void requestDebrief()} type="button">{copy.debrief.retry}</button></div>}
              {debrief && !isLoadingDebrief && <><article className="glass-panel overflow-hidden"><div className="border-b border-white/10 bg-gradient-to-r from-violet-300/[0.08] to-transparent px-5 py-4 sm:px-6"><div className="flex flex-wrap items-center justify-between gap-3"><Provenance tone={debrief.source === "gpt-5.6" ? "violet" : "slate"}>{debrief.source === "gpt-5.6" ? copy.provenance.ai : copy.provenance.local}</Provenance><span className="font-mono text-[10px] text-slate-500">{debrief.source === "gpt-5.6" ? copy.debrief.liveSource : copy.debrief.fallbackSource}</span></div></div><div className="space-y-6 p-5 sm:p-6">{debrief.source === "local-fallback" && <p className="rounded-xl border border-amber-200/15 bg-amber-200/[0.04] p-4 text-sm leading-6 text-amber-50/85">{copy.debrief.fallbackNotice}</p>}<p className="text-base leading-7 text-slate-100">{debrief.debrief.assessment}</p><div className="grid gap-5 md:grid-cols-2"><div><h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-200">{copy.debrief.evidence}</h2><ul className="mt-3 space-y-2">{debrief.debrief.evidence.map((item) => <li className="flex gap-2 text-sm leading-6 text-slate-300" key={item}><span className="text-cyan-300">•</span>{item}</li>)}</ul></div><div><h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-violet-200">{copy.debrief.tradeOffs}</h2><ul className="mt-3 space-y-2">{debrief.debrief.tradeOffs.map((item) => <li className="flex gap-2 text-sm leading-6 text-slate-300" key={item}><span className="text-violet-300">•</span>{item}</li>)}</ul></div></div><div className="grid gap-3 md:grid-cols-2"><div className="rounded-xl border border-white/10 bg-slate-950/35 p-4"><p className="text-xs text-slate-500">{copy.debrief.question}</p><p className="mt-2 text-sm leading-6 text-slate-200">{debrief.debrief.followUpQuestion}</p></div><div className="rounded-xl border border-white/10 bg-slate-950/35 p-4"><p className="text-xs text-slate-500">{copy.debrief.experiment}</p><p className="mt-2 text-sm leading-6 text-slate-200">{debrief.debrief.recommendedExperiment}</p></div></div></div></article>
                <article className="glass-panel p-5 sm:p-6"><h2 className="text-lg font-semibold text-white">{copy.debrief.revisionTitle}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{copy.debrief.revisionInstruction}</p><fieldset className="mt-5"><legend className="text-sm font-medium text-slate-100">{copy.debrief.evidenceLabel}</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{simulation.pressures.length === 0 ? <p className="text-sm text-slate-500">{copy.simulation.none}</p> : simulation.pressures.map(({ id }) => { const selected = revisionEvidence.includes(id); return <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm ${selected ? "border-cyan-200/35 bg-cyan-300/[0.08] text-cyan-50" : "border-white/10 bg-slate-950/30 text-slate-300"}`} key={id}><input checked={selected} className="accent-cyan-300" onChange={() => toggleRevisionEvidence(id)} type="checkbox" />{copy.pressures[id].title}</label>; })}</div></fieldset><fieldset className="mt-5"><legend className="text-sm font-medium text-slate-100">{copy.debrief.conclusionLabel}</legend><div className="mt-3 grid gap-2 md:grid-cols-3">{REVISION_OPTIONS.map((id) => <button aria-pressed={revisionConclusion === id} className={`selection-card ${revisionConclusion === id ? "selection-card-active" : ""}`} key={id} onClick={() => setRevisionConclusion(id)} type="button"><span className="selection-radio">{revisionConclusion === id ? "●" : ""}</span><span><strong>{copy.revisionConclusions[id].title}</strong><small>{copy.revisionConclusions[id].description}</small></span></button>)}</div></fieldset><div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-slate-500">{revisionValid ? `${revisionEvidence.length}/${simulation.pressures.length}` : copy.debrief.revisionValidation}</p><button className="button-primary disabled:cursor-not-allowed disabled:opacity-40" disabled={!revisionValid} onClick={completeMission} type="button">{copy.debrief.submit} <span aria-hidden="true">→</span></button></div></article>
              </>}
            </section>
          )}

          {stage === "progress" && progress && hypothesis && (
            <section aria-labelledby="progress-heading" className="animate-[rise_0.4s_ease-out] space-y-5"><div><p className="eyebrow">{copy.progress.eyebrow}</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl" id="progress-heading">{copy.progress.title}</h1><p className="mt-3 text-sm text-slate-300">{copy.progress.completed}</p></div><div className="grid gap-5 lg:grid-cols-2"><article className="glass-panel p-6"><p className="eyebrow">{copy.progress.archiveTitle}</p><h2 className="mt-3 text-xl font-semibold text-white">{copy.progress.archiveEntry}</h2><dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between gap-4 border-b border-white/10 pb-3"><dt className="text-slate-500">{copy.mission.planet}</dt><dd className="text-slate-200">Vespera b</dd></div><div className="flex justify-between gap-4 border-b border-white/10 pb-3"><dt className="text-slate-500">{copy.simulation.rulesetLabel}</dt><dd className="font-mono text-cyan-100">0.2.0</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">{copy.progress.certification}</dt><dd className="text-slate-200">{copy.progress.candidate}</dd></div></dl><p className="mt-5 rounded-xl border border-amber-200/15 bg-amber-200/[0.04] p-3 text-xs leading-5 text-amber-50/75">{copy.progress.sessionOnly}</p></article><article className="glass-panel p-6"><p className="eyebrow">{copy.progress.competencyTitle}</p><div className="mt-5 space-y-5"><CompetencyBar label={copy.progress.hypothesisFormation} score={progress.hypothesisFormation} /><CompetencyBar label={copy.progress.adaptationAnalysis} score={progress.adaptationAnalysis} /><CompetencyBar label={copy.progress.evidenceUse} score={progress.evidenceUse} /></div></article></div><article className="glass-panel flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="eyebrow">{copy.progress.nextTitle}</p><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{copy.progress.nextDescription}</p><p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-amber-200">{copy.progress.todo}</p></div><button className="button-primary shrink-0" onClick={() => resetExercise("home")} type="button">{copy.progress.repeat} <span aria-hidden="true">↻</span></button></article></section>
          )}
        </div></main>
      </div>
      <footer className="shrink-0 border-t border-white/10 px-4 py-2 text-center text-[10px] text-slate-600 sm:px-7">{copy.footer}</footer>
    </div>
  );
}

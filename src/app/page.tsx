"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import OrganismPreview from "@/components/life/OrganismPreview";
import type { PlanetVisualizationMode } from "@/components/planet/ProceduralPlanet";
import { GENESIS_MISSION } from "@/domain/simulator/mission";
import {
  LifeConsultantResponseSchema,
  OrganismImageResponseSchema,
  PlanetStateSchema,
} from "@/domain/simulator/schema";
import type {
  LifeConsultantResponse,
  LifeTraitId,
  OrganismImageResponse,
  PlanetState,
  RegionId,
  SimulationMetricId,
  SurvivalSimulationRequest,
  SurvivalSimulationResult,
} from "@/domain/simulator/schema";
import { runSurvivalSimulation } from "@/domain/simulator/simulate";
import {
  calculateTraitCost,
  hasTraitConflict,
  LIFE_ENERGY_BUDGET,
  LIFE_TRAITS,
  type TraitCategory,
} from "@/domain/simulator/traits";
import { normalizeWorldParameters } from "@/domain/world/schema";
import type { WorldParameters } from "@/domain/world/schema";

import { COPY, type LabPhase, type Language, type ParameterId } from "./copy";

const ProceduralPlanet = dynamic(
  () => import("@/components/planet/ProceduralPlanet"),
  {
    ssr: false,
    loading: () => <div className="planet-canvas planet-loading" aria-hidden="true" />,
  },
);

type SystemScreen = "boot" | "lab";
type TraitNotice = "conflict" | "budgetExceeded" | "selectionLimit" | "minimumTraits" | null;

const PHASES: LabPhase[] = ["planet", "life", "results"];
const CATEGORIES: TraitCategory[] = ["body", "physiology", "senses", "reproduction", "intelligence"];
const METRIC_ORDER: SimulationMetricId[] = [
  "advancedLifePotential",
  "ecosystemPotential",
  "populationStability",
  "organismCompatibility",
  "metabolicViability",
  "biologicalEnergy",
  "liquidWater",
  "atmosphere",
  "thermalStability",
  "radiationSafety",
  "reproductionPotential",
];

const DEFAULT_TRAITS: LifeTraitId[] = [
  "compactBody",
  "internalSkeleton",
  "terrestrialMovement",
  "lowOxygenMetabolism",
  "photosynthesis",
  "radiationResistance",
  "protectedEggs",
  "socialCoordination",
];

const PARAMETER_CONFIG: Array<{
  id: ParameterId;
  min: number;
  max: number;
  step: number;
  read: (world: WorldParameters) => number;
}> = [
  { id: "gravity", min: 0.2, max: 3, step: 0.01, read: (world) => world.gravityG },
  { id: "temperature", min: -70, max: 100, step: 1, read: (world) => world.averageTemperatureC },
  { id: "pressure", min: 0, max: 5, step: 0.01, read: (world) => world.atmosphericPressureAtm },
  { id: "oxygen", min: 0, max: 32, step: 0.1, read: (world) => world.atmosphereComposition.oxygenFraction * 100 },
  { id: "carbonDioxide", min: 0, max: 12, step: 0.1, read: (world) => world.atmosphereComposition.carbonDioxideFraction * 100 },
  { id: "water", min: 0, max: 100, step: 1, read: (world) => world.waterAvailability * 100 },
  { id: "radiation", min: 0, max: 3, step: 0.01, read: (world) => world.radiationDoseRate.value },
  { id: "light", min: 0, max: 100, step: 1, read: (world) => world.lightLevel * 100 },
  { id: "humidity", min: 0, max: 100, step: 1, read: (world) => world.humidity * 100 },
  { id: "magneticField", min: 0, max: 3, step: 0.01, read: (world) => world.magneticFieldStrengthEarth },
];

/** Creates a fresh validated copy of the immutable mission baseline. */
function createBaselinePlanet(): PlanetState {
  return PlanetStateSchema.parse(GENESIS_MISSION.planet);
}

/** Formats numbers consistently for the active interface language. */
function formatNumber(value: number, language: Language, digits = 1): string {
  return new Intl.NumberFormat(language === "pl" ? "pl-PL" : "en-US", {
    maximumFractionDigits: digits,
  }).format(value);
}

/** Creates the validated request shared by local simulation and server-only AI routes. */
function createSimulationRequest(
  planet: PlanetState,
  traitIds: LifeTraitId[],
): SurvivalSimulationRequest {
  return {
    missionId: "genesis-01",
    planet,
    traitIds,
    initialPopulation: 120,
  };
}

/** Small branded orbital mark used by boot and laboratory chrome. */
function OrbitMark({ large = false }: { large?: boolean }) {
  return (
    <span aria-hidden="true" className={`orbit-mark ${large ? "orbit-mark-large" : ""}`}>
      <span className="orbit-core" />
      <span className="orbit-ring orbit-ring-one" />
      <span className="orbit-ring orbit-ring-two" />
    </span>
  );
}

/** Displays one live environment slider with localized educational context. */
function ParameterControl({
  id,
  value,
  min,
  max,
  step,
  label,
  unit,
  influence,
  disabled,
  language,
  onChange,
}: {
  id: ParameterId;
  value: number;
  min: number;
  max: number;
  step: number;
  label: string;
  unit: string;
  influence: string;
  disabled: boolean;
  language: Language;
  onChange: (value: number) => void;
}) {
  const digits = step < 0.1 ? 2 : step < 1 ? 1 : 0;
  const display = `${formatNumber(value, language, digits)} ${unit}`;
  const position = ((value - min) / (max - min)) * 100;

  return (
    <div className="parameter-control">
      <div className="parameter-heading">
        <label htmlFor={`parameter-${id}`}>{label}</label>
        <output htmlFor={`parameter-${id}`}>{display}</output>
      </div>
      <input
        aria-valuetext={display}
        className="xl-range"
        disabled={disabled}
        id={`parameter-${id}`}
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        style={{ "--range-position": `${position}%` } as React.CSSProperties}
        type="range"
        value={value}
      />
      <p>{influence}</p>
    </div>
  );
}

/** Draws a compact accessible population trend without a chart dependency. */
function PopulationChart({
  result,
  language,
  label,
}: {
  result: SurvivalSimulationResult;
  language: Language;
  label: string;
}) {
  const gradientId = `population-${useId().replaceAll(":", "")}`;
  const width = 620;
  const height = 190;
  const padding = 18;
  const maximum = Math.max(1, result.peakPopulation, result.carryingCapacity);
  const points = result.populationTimeline.map(({ generation, population }) => ({
    x: padding + (generation / 40) * (width - padding * 2),
    y: height - padding - (population / maximum) * (height - padding * 2),
  }));
  const line = points.map(({ x, y }) => `${x},${y}`).join(" ");
  const area = `M ${padding} ${height - padding} L ${points.map(({ x, y }) => `${x} ${y}`).join(" L ")} L ${width - padding} ${height - padding} Z`;

  return (
    <figure className="population-chart">
      <svg aria-label={label} role="img" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#5eead4" stopOpacity="0.36" />
            <stop offset="1" stopColor="#5eead4" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((fraction) => (
          <line key={fraction} x1={padding} x2={width - padding} y1={height * fraction} y2={height * fraction} />
        ))}
        <path d={area} fill={`url(#${gradientId})`} />
        <polyline fill="none" points={line} stroke="#67e8f9" strokeLinejoin="round" strokeWidth="3" />
        <circle cx={points.at(-1)?.x} cy={points.at(-1)?.y} fill="#ecfeff" r="4" />
      </svg>
      <figcaption>
        <span>0</span>
        <span>{formatNumber(maximum, language, 0)}</span>
        <span>40</span>
      </figcaption>
    </figure>
  );
}

/** Full application surface for one repeatable procedural life-engineering mission. */
export default function Home() {
  const [screen, setScreen] = useState<SystemScreen>("boot");
  const [language, setLanguage] = useState<Language>("en");
  const [phase, setPhase] = useState<LabPhase>("planet");
  const [planet, setPlanet] = useState<PlanetState>(createBaselinePlanet);
  const [traitIds, setTraitIds] = useState<LifeTraitId[]>(DEFAULT_TRAITS);
  const [activeCategory, setActiveCategory] = useState<TraitCategory>("body");
  const [traitNotice, setTraitNotice] = useState<TraitNotice>(null);
  const [visualizationMode, setVisualizationMode] = useState<PlanetVisualizationMode>("realistic");
  const [autoRotate, setAutoRotate] = useState(true);
  const [cameraResetSignal, setCameraResetSignal] = useState(0);
  const [inspectedRegion, setInspectedRegion] = useState<RegionId | null>(null);
  const [result, setResult] = useState<SurvivalSimulationResult | null>(null);
  const [previousResult, setPreviousResult] = useState<SurvivalSimulationResult | null>(null);
  const [resultStale, setResultStale] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [consultant, setConsultant] = useState<LifeConsultantResponse | null>(null);
  const [consultantStatus, setConsultantStatus] = useState<"idle" | "loading" | "error">("idle");
  const [organismImage, setOrganismImage] = useState<OrganismImageResponse | null>(null);
  const [imageStatus, setImageStatus] = useState<"idle" | "loading" | "error" | "fallback">("idle");
  const simulationRunId = useRef(0);
  const stateEpoch = useRef(0);
  const copy = COPY[language];
  const traitCost = calculateTraitCost(traitIds);
  const normalizedWorld = useMemo(() => normalizeWorldParameters(planet.world), [planet.world]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = copy.document.title;
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute("content", copy.document.description);
  }, [copy.document.description, copy.document.title, language]);

  useEffect(() => {
    if (screen !== "boot") return;
    const timeout = window.setTimeout(() => setScreen("lab"), 5_200);
    return () => window.clearTimeout(timeout);
  }, [screen]);

  const invalidateCalculatedState = () => {
    stateEpoch.current += 1;
    simulationRunId.current += 1;
    setIsSimulating(false);
    if (result) setResultStale(true);
    setConsultant(null);
    setConsultantStatus("idle");
    setOrganismImage(null);
    setImageStatus("idle");
  };

  const updateParameter = (id: ParameterId, value: number) => {
    invalidateCalculatedState();
    setPlanet((current) => {
      const world = current.world;
      if (id === "oxygen" || id === "carbonDioxide") {
        const composition = world.atmosphereComposition;
        const oxygenFraction = id === "oxygen" ? value / 100 : composition.oxygenFraction;
        const carbonDioxideFraction = id === "carbonDioxide" ? value / 100 : composition.carbonDioxideFraction;
        const nitrogenFraction =
          1 -
          oxygenFraction -
          carbonDioxideFraction -
          composition.inertGasFraction -
          composition.toxicGasFraction;
        return PlanetStateSchema.parse({
          ...current,
          world: {
            ...world,
            atmosphereComposition: {
              ...composition,
              oxygenFraction,
              carbonDioxideFraction,
              nitrogenFraction,
            },
          },
        });
      }

      const patch: Partial<WorldParameters> =
        id === "gravity"
          ? { gravityG: value }
          : id === "temperature"
            ? { averageTemperatureC: value }
            : id === "pressure"
              ? { atmosphericPressureAtm: value }
              : id === "water"
                ? { waterAvailability: value / 100 }
                : id === "radiation"
                  ? { radiationDoseRate: { value, unit: "mSv/h" } }
                  : id === "light"
                    ? { lightLevel: value / 100 }
                    : id === "humidity"
                      ? { humidity: value / 100 }
                      : { magneticFieldStrengthEarth: value };
      const nextWorld = { ...world, ...patch };
      if (id === "water") {
        nextWorld.humidity = Math.min(nextWorld.humidity, value / 100);
      }
      return PlanetStateSchema.parse({ ...current, world: nextWorld });
    });
  };

  const restoreBaseline = () => {
    setPlanet(createBaselinePlanet());
    invalidateCalculatedState();
    setInspectedRegion(null);
  };

  const resetMission = () => {
    stateEpoch.current += 1;
    simulationRunId.current += 1;
    setPlanet(createBaselinePlanet());
    setTraitIds(DEFAULT_TRAITS);
    setPhase("planet");
    setActiveCategory("body");
    setTraitNotice(null);
    setVisualizationMode("realistic");
    setAutoRotate(true);
    setInspectedRegion(null);
    setResult(null);
    setPreviousResult(null);
    setResultStale(false);
    setConsultant(null);
    setConsultantStatus("idle");
    setOrganismImage(null);
    setImageStatus("idle");
  };

  const changeLanguage = (nextLanguage: Language) => {
    stateEpoch.current += 1;
    setLanguage(nextLanguage);
    setConsultant(null);
    setConsultantStatus("idle");
    setOrganismImage(null);
    setImageStatus("idle");
  };

  const toggleTrait = (traitId: LifeTraitId) => {
    setTraitNotice(null);
    if (traitIds.includes(traitId)) {
      setTraitIds((current) => current.filter((id) => id !== traitId));
      invalidateCalculatedState();
      return;
    }
    if (traitIds.length >= 14) {
      setTraitNotice("selectionLimit");
      return;
    }
    if (hasTraitConflict(traitIds, traitId)) {
      setTraitNotice("conflict");
      return;
    }
    if (calculateTraitCost([...traitIds, traitId]) > LIFE_ENERGY_BUDGET) {
      setTraitNotice("budgetExceeded");
      return;
    }
    setTraitIds((current) => [...current, traitId]);
    invalidateCalculatedState();
  };

  const runSimulation = async () => {
    if (traitIds.length < 3) {
      setTraitNotice("minimumTraits");
      setPhase("life");
      return;
    }
    setTraitNotice(null);
    setIsSimulating(true);
    setPhase("results");
    const currentRunId = simulationRunId.current + 1;
    simulationRunId.current = currentRunId;
    stateEpoch.current += 1;
    const nextResult = runSurvivalSimulation(createSimulationRequest(planet, traitIds));
    await new Promise((resolve) => window.setTimeout(resolve, 1_250));
    if (simulationRunId.current !== currentRunId) return;
    if (result) setPreviousResult(result);
    setResult(nextResult);
    setResultStale(false);
    setConsultant(null);
    setConsultantStatus("idle");
    setOrganismImage(null);
    setImageStatus("idle");
    setIsSimulating(false);
  };

  const requestConsultant = async () => {
    if (!result || resultStale) return;
    const requestEpoch = stateEpoch.current;
    setConsultantStatus("loading");
    try {
      const response = await fetch("/api/consultant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, simulation: createSimulationRequest(planet, traitIds) }),
      });
      const payload: unknown = await response.json();
      if (!response.ok) throw new Error("Consultant request failed.");
      if (stateEpoch.current !== requestEpoch) return;
      setConsultant(LifeConsultantResponseSchema.parse(payload));
      setConsultantStatus("idle");
    } catch {
      if (stateEpoch.current !== requestEpoch) return;
      setConsultantStatus("error");
    }
  };

  const requestOrganismImage = async () => {
    if (!result || resultStale) return;
    const requestEpoch = stateEpoch.current;
    setImageStatus("loading");
    try {
      const response = await fetch("/api/organism-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, simulation: createSimulationRequest(planet, traitIds) }),
      });
      const payload: unknown = await response.json();
      if (!response.ok) throw new Error("Image request failed.");
      if (stateEpoch.current !== requestEpoch) return;
      const parsed = OrganismImageResponseSchema.parse(payload);
      setOrganismImage(parsed);
      setImageStatus(parsed.source === "procedural-fallback" ? "fallback" : "idle");
    } catch {
      if (stateEpoch.current !== requestEpoch) return;
      setImageStatus("error");
    }
  };

  if (screen === "boot") {
    return (
      <main className="boot-screen">
        <div aria-hidden="true" className="boot-nebula" />
        <div aria-hidden="true" className="boot-grid" />
        <div aria-hidden="true" className="boot-horizon" />
        <div aria-hidden="true" className="boot-starfield" />
        <div aria-hidden="true" className="boot-planet boot-planet-far" />
        <div aria-hidden="true" className="boot-planet boot-planet-near"><span /><i /></div>
        <div aria-hidden="true" className="boot-life-orbit"><span /><span /><span /><i /></div>
        <div className="boot-language">
          <span>{copy.language.label}</span>
          <button aria-pressed={language === "en"} onClick={() => changeLanguage("en")} type="button">EN</button>
          <button aria-pressed={language === "pl"} onClick={() => changeLanguage("pl")} type="button">PL</button>
        </div>
        <section className="boot-hero">
          <div className="boot-identity">
            <OrbitMark large />
            <p>{copy.boot.eyebrow}</p>
            <h1>{copy.boot.title}</h1>
            <span>{copy.boot.subtitle}</span>
          </div>
          <p className="boot-scene-label"><span aria-hidden="true" />{copy.boot.sceneLabel}</p>
          <div className="boot-actions">
            <button className="button-primary" onClick={() => setScreen("lab")} type="button">{copy.boot.enter} <span aria-hidden="true">→</span></button>
            <button className="text-button" onClick={() => setScreen("lab")} type="button">{copy.boot.skip}</button>
          </div>
        </section>
      </main>
    );
  }

  const visibleResult = result && !resultStale ? result : null;
  const biosphereLevel = visibleResult?.metrics.ecosystemPotential ?? 0;

  return (
    <main className="lab-shell">
      <header className="lab-header">
        <div className="lab-brand">
          <OrbitMark />
          <Image alt="Xenogenesis Lab" className="lab-banner" height={38} priority src="/XenogenesisLabBanner.png" width={190} />
          <span>{copy.header.system}</span>
        </div>
        <div className="lab-mission-id">
          <strong>{copy.header.mission}</strong>
          <span>{copy.header.seed} · {planet.seed}</span>
        </div>
        <div className="lab-header-actions">
          <div aria-label={copy.language.label} className="language-switch" role="group">
            <button aria-pressed={language === "en"} onClick={() => changeLanguage("en")} type="button">EN</button>
            <button aria-pressed={language === "pl"} onClick={() => changeLanguage("pl")} type="button">PL</button>
          </div>
          <button className="button-quiet compact" onClick={resetMission} type="button">{copy.header.reset}</button>
        </div>
      </header>

      <nav aria-label={copy.mission.loopLabel} className="mobile-phase-navigation">
        {PHASES.map((item, index) => (
          <button aria-current={phase === item ? "step" : undefined} key={item} onClick={() => setPhase(item)} type="button">
            <span>{String(index + 1).padStart(2, "0")}</span>{copy.phases[item].label}
          </button>
        ))}
      </nav>

      <div className={`lab-grid phase-${phase}`}>
        <aside className={`lab-panel environment-panel ${phase !== "planet" ? "mobile-hidden" : ""}`}>
          <section className="mission-card">
            <p className="eyebrow">{copy.mission.eyebrow}</p>
            <h1>{copy.mission.title}</h1>
            <span className="section-label">{copy.mission.objectiveLabel}</span>
            <p className="mission-objective">{copy.mission.objective}</p>
            <p className="mission-context">{copy.mission.description}</p>
            <div className="experiment-loop" aria-label={copy.mission.loopLabel}>
              {copy.mission.loop.map((step, index) => (
                <span key={step}>{step}{index < copy.mission.loop.length - 1 && <b aria-hidden="true">→</b>}</span>
              ))}
            </div>
          </section>

          <section className="panel-section controls-section">
            <div className="panel-section-heading">
              <div><p className="eyebrow">{copy.planet.baseline}</p><h2>{copy.planet.title}</h2></div>
              <button className="text-button" onClick={restoreBaseline} type="button">{copy.planet.resetBaseline}</button>
            </div>
            <p className="panel-intro">{copy.planet.instruction}</p>
            <div className="parameter-list">
              {PARAMETER_CONFIG.map((parameter) => {
                const parameterCopy = copy.parameters[parameter.id];
                return (
                  <ParameterControl
                    disabled={isSimulating}
                    id={parameter.id}
                    influence={parameterCopy.influence}
                    key={parameter.id}
                    label={parameterCopy.label}
                    language={language}
                    max={parameter.id === "humidity" ? planet.world.waterAvailability * 100 : parameter.max}
                    min={parameter.min}
                    onChange={(value) => updateParameter(parameter.id, value)}
                    step={parameter.step}
                    unit={parameterCopy.unit}
                    value={parameter.read(planet.world)}
                  />
                );
              })}
            </div>
          </section>
        </aside>

        <section className={`planet-stage planet-stage-${phase}`}>
          <div className="planet-stage-header">
            <div>
              <p className="eyebrow">{copy.planet.liveView}</p>
              <span>{copy.planet.visualTransition}</span>
            </div>
            <div className="planet-mode-switch" aria-label={copy.planet.viewMode} role="group">
              {(["realistic", "temperature", "radiation"] as PlanetVisualizationMode[]).map((mode) => (
                <button aria-pressed={visualizationMode === mode} key={mode} onClick={() => setVisualizationMode(mode)} type="button">{copy.planet.modes[mode]}</button>
              ))}
            </div>
          </div>

          {phase === "life" ? (
            <div className="lifeform-stage">
              <div className="lifeform-stage-hero">
                <OrganismPreview imageDataUrl={null} label={copy.organism.alt} planet={planet} traitIds={traitIds} />
                <p className="lifeform-stage-caption"><span className="status-dot" />{copy.organism.procedural} · {copy.life.previewHint}</p>
              </div>
              <div className="planet-inset">
                <ProceduralPlanet
                  autoRotate={autoRotate}
                  biosphereLevel={biosphereLevel}
                  cameraResetSignal={cameraResetSignal}
                  label={copy.planet.liveView}
                  onInspect={setInspectedRegion}
                  planet={planet}
                  regionScores={visibleResult?.regionScores}
                  visualizationMode={visualizationMode}
                />
              </div>
            </div>
          ) : phase === "results" ? (
            <div className="analysis-stage">
              <section className={`analysis-stage-hero ${result?.missionSuccess ? "success" : "continue"}`}>
                <p className="eyebrow">{copy.phases.results.label}</p>
                {result ? (
                  <>
                    <span>{result.missionSuccess ? copy.simulation.success : copy.simulation.continue}</span>
                    <h2>{copy.outcomes[result.outcome].title}</h2>
                    <p>{copy.outcomes[result.outcome].description}</p>
                    <div className="objective-score"><div><span>{copy.simulation.objective}</span><strong>{Math.round(result.objectiveScore * 100)}%</strong></div><span><i style={{ width: `${result.objectiveScore * 100}%` }} /></span></div>
                  </>
                ) : (
                  <>
                    <h2>{copy.simulation.emptyTitle}</h2>
                    <p>{copy.simulation.emptyDescription}</p>
                  </>
                )}
              </section>
              <div className="planet-inset">
                <ProceduralPlanet
                  autoRotate={autoRotate}
                  biosphereLevel={biosphereLevel}
                  cameraResetSignal={cameraResetSignal}
                  label={copy.planet.liveView}
                  onInspect={setInspectedRegion}
                  planet={planet}
                  regionScores={visibleResult?.regionScores}
                  visualizationMode={visualizationMode}
                />
              </div>
            </div>
          ) : (
            <ProceduralPlanet
              autoRotate={autoRotate}
              biosphereLevel={biosphereLevel}
              cameraResetSignal={cameraResetSignal}
              label={copy.planet.liveView}
              onInspect={setInspectedRegion}
              planet={planet}
              regionScores={visibleResult?.regionScores}
              visualizationMode={visualizationMode}
            />
          )}

          {visualizationMode !== "realistic" && (
            <aside aria-label={copy.planet.legends[visualizationMode].title} className={`planet-legend ${visualizationMode}`}>
              <strong>{copy.planet.legends[visualizationMode].title}</strong>
              <div className="planet-legend-scale" aria-hidden="true" />
              <div className="planet-legend-labels">
                {visualizationMode === "temperature" ? (
                  <><span>{copy.planet.legends.temperature.cold}</span><span>{copy.planet.legends.temperature.temperate}</span><span>{copy.planet.legends.temperature.hot}</span></>
                ) : (
                  <><span>{copy.planet.legends.radiation.protected}</span><span>{copy.planet.legends.radiation.elevated}</span><span>{copy.planet.legends.radiation.severe}</span></>
                )}
              </div>
            </aside>
          )}

          {isSimulating && (
            <div aria-live="polite" className="simulation-overlay">
              <OrbitMark />
              <strong>{copy.life.running}</strong>
              <span><i /></span>
            </div>
          )}

          <div className="planet-inspection">
            <span className="status-dot" />
            <div>
              <strong>{inspectedRegion ? `${copy.planet.inspecting} · ${copy.regions[inspectedRegion].label}` : copy.planet.noInspection}</strong>
              <small>{inspectedRegion ? copy.regions[inspectedRegion].description : copy.planet.inspectHint}</small>
            </div>
          </div>

          <div className="planet-toolbar">
            <button className="button-quiet compact" onClick={() => setCameraResetSignal((value) => value + 1)} type="button">{copy.header.resetCamera}</button>
            <button className="button-quiet compact" onClick={() => setAutoRotate((value) => !value)} type="button">{autoRotate ? copy.header.rotationOn : copy.header.rotationOff}</button>
            <button className="button-primary" onClick={() => { if (phase === "planet") setPhase("life"); else if (phase === "life") void runSimulation(); else setPhase("planet"); }} type="button">
              {phase === "planet" ? copy.planet.openDesigner : phase === "life" ? copy.life.run : copy.simulation.adaptPlanet}<span aria-hidden="true">→</span>
            </button>
          </div>
        </section>

        <aside className={`lab-panel analysis-panel ${phase === "planet" ? "mobile-hidden" : ""}`}>
          <nav aria-label={copy.mission.loopLabel} className="phase-tabs">
            {PHASES.map((item, index) => (
              <button aria-current={phase === item ? "step" : undefined} key={item} onClick={() => setPhase(item)} type="button">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{copy.phases[item].label}</strong>
                <small>{copy.phases[item].description}</small>
              </button>
            ))}
          </nav>

          {phase === "planet" && (
            <div className="phase-content guidance-content">
              <p className="eyebrow">{copy.mission.guidanceTitle}</p>
              <h2>{copy.planet.title}</h2>
              <p>{copy.mission.guidance}</p>
              <dl className="world-readout">
                <div><dt>{copy.planet.oxygenPartialPressure}</dt><dd>{formatNumber(normalizedWorld.oxygenPartialPressureAtm, language, 3)} atm</dd></div>
                <div><dt>{copy.planet.atmosphericDensity}</dt><dd>{formatNumber(normalizedWorld.atmosphericDensityKgM3 ?? 0, language, 2)} kg/m³</dd></div>
                <div><dt>{copy.planet.temperatureRange}</dt><dd>{formatNumber(normalizedWorld.temperatureRangeC.minimum, language, 0)}–{formatNumber(normalizedWorld.temperatureRangeC.maximum, language, 0)} °C</dd></div>
              </dl>
              <div className="scientific-note">{copy.planet.regionalModel}</div>
              <button className="button-primary wide" onClick={() => setPhase("life")} type="button">{copy.planet.openDesigner}<span aria-hidden="true">→</span></button>
            </div>
          )}

          {phase === "life" && (
            <div className="phase-content life-designer">
              <div className="phase-title-row">
                <div><p className="eyebrow">{copy.phases.life.label}</p><h2>{copy.life.title}</h2></div>
                <span className="status-chip">{traitIds.length}/14 {copy.life.selected}</span>
              </div>
              <p className="panel-intro">{copy.life.instruction}</p>
              <div className="budget-meter">
                <div><span>{copy.life.budget}</span><strong>{traitCost} / {LIFE_ENERGY_BUDGET}</strong></div>
                <span><i style={{ width: `${Math.min(100, traitCost)}%` }} /></span>
                <small>{copy.life.budgetExplanation}</small>
              </div>
              <div className="category-tabs" role="tablist">
                {CATEGORIES.map((category) => (
                  <button aria-selected={activeCategory === category} key={category} onClick={() => setActiveCategory(category)} role="tab" type="button">{copy.categories[category]}</button>
                ))}
              </div>
              <div className="trait-list">
                {(Object.values(LIFE_TRAITS).filter(({ category }) => category === activeCategory)).map((trait) => {
                  const selected = traitIds.includes(trait.id);
                  const traitCopy = copy.traits[trait.id];
                  const unavailable = !selected && (hasTraitConflict(traitIds, trait.id) || calculateTraitCost([...traitIds, trait.id]) > LIFE_ENERGY_BUDGET);
                  return (
                    <button
                      aria-pressed={selected}
                      className={`trait-card ${selected ? "selected" : ""} ${unavailable ? "unavailable" : ""}`}
                      key={trait.id}
                      onClick={() => toggleTrait(trait.id)}
                      type="button"
                    >
                      <span className="trait-check" aria-hidden="true">{selected ? "✓" : "+"}</span>
                      <span className="trait-copy">
                        <span className="trait-title"><strong>{traitCopy.title}</strong><b>{copy.life.cost} {trait.cost}</b></span>
                        <small><em>{copy.life.advantage}</em>{traitCopy.advantage}</small>
                        <small><em>{copy.life.tradeoff}</em>{traitCopy.tradeoff}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
              {traitNotice && <p aria-live="polite" className="form-notice">{copy.life[traitNotice]}</p>}
              <div className="phase-actions">
                <button className="text-button" onClick={() => { setTraitIds([]); invalidateCalculatedState(); }} type="button">{copy.life.clear}</button>
                <button className="button-primary" disabled={isSimulating} onClick={runSimulation} type="button">{isSimulating ? copy.life.running : copy.life.run}<span aria-hidden="true">→</span></button>
              </div>
            </div>
          )}

          {phase === "results" && (
            <div className="phase-content result-content">
              <div className="phase-title-row">
                <div><p className="eyebrow">{copy.phases.results.label}</p><h2>{copy.simulation.title}</h2></div>
                {result && <span className="status-chip">{copy.simulation.deterministic}</span>}
              </div>
              {!result && !isSimulating && (
                <div className="empty-state">
                  <OrbitMark large />
                  <h3>{copy.simulation.emptyTitle}</h3>
                  <p>{copy.simulation.emptyDescription}</p>
                  <button className="button-primary" onClick={() => setPhase("life")} type="button">{copy.phases.life.label}</button>
                </div>
              )}
              {result && (
                <>
                  {resultStale && (
                    <div className="stale-notice"><strong>{copy.simulation.staleTitle}</strong><p>{copy.simulation.staleDescription}</p><button className="button-primary" onClick={runSimulation} type="button">{copy.simulation.rerun}</button></div>
                  )}
                  <section className={`outcome-card ${result.missionSuccess ? "success" : "continue"}`}>
                    <span>{result.missionSuccess ? copy.simulation.success : copy.simulation.continue}</span>
                    <h3>{copy.outcomes[result.outcome].title}</h3>
                    <p>{copy.outcomes[result.outcome].description}</p>
                    <div className="objective-score"><div><span>{copy.simulation.objective}</span><strong>{Math.round(result.objectiveScore * 100)}%</strong></div><span><i style={{ width: `${result.objectiveScore * 100}%` }} /></span></div>
                  </section>

                  <dl className="result-meta">
                    <div><dt>{copy.simulation.stateHash}</dt><dd>{result.stateHash}</dd></div>
                    <div><dt>{copy.simulation.modelVersion}</dt><dd>{result.simulatorVersion}</dd></div>
                  </dl>

                  <section className="result-section">
                    <h3>{copy.simulation.metricsTitle}</h3>
                    <div className="metric-list">
                      {METRIC_ORDER.map((metric) => (
                        <div className="metric-row" key={metric} title={copy.metrics[metric].description}>
                          <span>{copy.metrics[metric].label}</span>
                          <i><b style={{ width: `${result.metrics[metric] * 100}%` }} /></i>
                          <strong>{Math.round(result.metrics[metric] * 100)}</strong>
                        </div>
                      ))}
                    </div>
                    <div className="factor-grid">
                      <div><span>{copy.simulation.strengths}</span>{result.strengths.map((metric) => <b key={metric}>{copy.metrics[metric].label}</b>)}</div>
                      <div><span>{copy.simulation.limits}</span>{result.limitingFactors.map((metric) => <b key={metric}>{copy.metrics[metric].label}</b>)}</div>
                    </div>
                  </section>

                  <section className="result-section">
                    <h3>{copy.simulation.regionsTitle}</h3>
                    <div className="region-list">
                      {(Object.entries(result.regionScores) as Array<[RegionId, number]>).map(([region, score]) => (
                        <button key={region} onClick={() => setInspectedRegion(region)} type="button">
                          <span><strong>{copy.regions[region].label}</strong><small>{score >= 0.5 ? copy.simulation.habitable : copy.regions[region].description}</small></span>
                          <b>{Math.round(score * 100)}</b>
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="result-section">
                    <h3>{copy.simulation.populationTitle}</h3>
                    <PopulationChart label={copy.simulation.populationTitle} language={language} result={result} />
                    <dl className="population-stats">
                      <div><dt>{copy.simulation.initial}</dt><dd>120</dd></div>
                      <div><dt>{copy.simulation.peak}</dt><dd>{formatNumber(result.peakPopulation, language, 0)}</dd></div>
                      <div><dt>{copy.simulation.final}</dt><dd>{formatNumber(result.finalPopulation, language, 0)}</dd></div>
                      <div><dt>{copy.simulation.capacity}</dt><dd>{formatNumber(result.carryingCapacity, language, 0)}</dd></div>
                    </dl>
                    <div className="comparison-note">
                      <span>{copy.simulation.previousScore}</span>
                      {previousResult ? <strong>{result.objectiveScore - previousResult.objectiveScore >= 0 ? "+" : ""}{Math.round((result.objectiveScore - previousResult.objectiveScore) * 100)} pp</strong> : <small>{copy.simulation.noPreviousRun}</small>}
                    </div>
                  </section>

                  <section className="result-section organism-section">
                    <div className="result-section-heading"><h3>{copy.organism.title}</h3><span className="status-chip">{organismImage?.imageDataUrl ? copy.organism.generated : copy.organism.procedural}</span></div>
                    <OrganismPreview imageDataUrl={organismImage?.imageDataUrl ?? null} label={copy.organism.alt} planet={planet} traitIds={traitIds} />
                    {imageStatus === "fallback" && <p className="api-notice">{copy.organism.fallback}</p>}
                    {imageStatus === "error" && <p className="api-notice error">{copy.organism.error}</p>}
                    <button className="button-quiet wide" disabled={resultStale || imageStatus === "loading"} onClick={requestOrganismImage} type="button">{imageStatus === "loading" ? copy.organism.generating : copy.organism.requestImage}</button>
                  </section>

                  <section className="result-section consultant-section">
                    <div className="result-section-heading"><h3>{copy.consultant.title}</h3><span className="status-chip">{copy.status.ai}</span></div>
                    <p>{copy.consultant.description}</p>
                    {!consultant && consultantStatus !== "loading" && <button className="button-quiet wide" disabled={resultStale} onClick={requestConsultant} type="button">{consultantStatus === "error" ? copy.consultant.retry : copy.consultant.request}</button>}
                    {consultantStatus === "loading" && <div className="consultant-loading"><span /><p>{copy.consultant.loading}</p></div>}
                    {consultantStatus === "error" && <p className="api-notice error">{copy.consultant.error}</p>}
                    {consultant && (
                      <div className="consultant-report">
                        <div className="consultant-source"><span className="status-dot" /><strong>{consultant.source === "gpt-5.4-mini" ? copy.consultant.liveSource : copy.consultant.localSource}</strong></div>
                        {consultant.source === "local-fallback" && <p className="api-notice">{copy.consultant.fallbackNotice}</p>}
                        <h4>{consultant.content.organismName}</h4>
                        <p>{consultant.content.scientificDescription}</p>
                        <h5>{copy.consultant.assessment}</h5><p>{consultant.content.planetAssessment}</p>
                        <h5>{copy.consultant.traits}</h5><p>{consultant.content.traitAssessment}</p>
                        <h5>{copy.consultant.insights}</h5><ul>{consultant.content.insights.map((insight) => <li key={insight}>{insight}</li>)}</ul>
                        <h5>{copy.consultant.experiment}</h5><p>{consultant.content.suggestedExperiment}</p>
                      </div>
                    )}
                  </section>

                  <div className="adapt-actions">
                    <button className="button-quiet" onClick={() => setPhase("planet")} type="button">{copy.simulation.adaptPlanet}</button>
                    <button className="button-quiet" onClick={() => setPhase("life")} type="button">{copy.simulation.adaptLife}</button>
                  </div>
                  <p className="educational-notice">{copy.simulation.educationalNotice}</p>
                </>
              )}
            </div>
          )}
        </aside>
      </div>
      <footer className="lab-footer">{copy.footer}</footer>
    </main>
  );
}

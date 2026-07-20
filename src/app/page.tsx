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
  LIFE_ENERGY_BUDGET,
  LIFE_TRAITS,
  type TraitCategory,
} from "@/domain/simulator/traits";
import {
  applyWorldEngineeringControlChange,
  deriveWorldEngineeringControlState,
} from "@/domain/world/engineering";
import {
  deriveGravityPressureLimitAtm,
} from "@/domain/world/schema";
import { deriveWorldContext, type WorldContext } from "@/domain/world/context";
import { deriveWorldInteractionState } from "@/domain/world/interactions";
import type { WorldParameters } from "@/domain/world/schema";
import {
  MAX_AVERAGE_TEMPERATURE_C,
  MIN_AVERAGE_TEMPERATURE_C,
} from "@/domain/world/schema";

import { COPY, type LabCopy, type LabPhase, type Language, type ParameterId } from "./copy";
import {
  deriveParameterSliderPosition,
  deriveParameterValueFromSliderPosition,
} from "./parameter-curves";

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
  captionThresholds: readonly [number, number, number, number, number];
}> = [
  { id: "gravity", min: 0.05, max: 3, step: 0.01, captionThresholds: [0.15, 0.35, 0.7, 1.2, 2] },
  { id: "light", min: 0, max: 100, step: 1, captionThresholds: [5, 20, 45, 75, 90] },
  { id: "pressure", min: 0, max: 5, step: 0.01, captionThresholds: [0.001, 0.05, 0.5, 1.5, 3.5] },
  { id: "carbonDioxide", min: 0, max: 0.6, step: 0.0001, captionThresholds: [0.0001, 0.005, 0.02, 0.08, 0.2] },
  { id: "oxygen", min: 0, max: 1.6, step: 0.001, captionThresholds: [0.001, 0.03, 0.1, 0.25, 0.5] },
  { id: "temperature", min: MIN_AVERAGE_TEMPERATURE_C, max: MAX_AVERAGE_TEMPERATURE_C, step: 1, captionThresholds: [-100, 0, 50, 800, 1_200] },
  { id: "temperatureVariation", min: 0, max: 100, step: 1, captionThresholds: [5, 15, 30, 60, 85] },
  { id: "water", min: 0, max: 100, step: 0.1, captionThresholds: [1, 10, 35, 70, 90] },
  { id: "humidity", min: 0, max: 100, step: 0.1, captionThresholds: [1, 15, 40, 70, 90] },
  { id: "magneticField", min: 0, max: 3, step: 0.01, captionThresholds: [0.05, 0.3, 0.8, 1.8, 2.5] },
  { id: "radiation", min: 0, max: 3, step: 0.00001, captionThresholds: [0.01, 0.1, 0.5, 1.5, 2.5] },
];

/** Creates a fresh validated copy of the immutable laboratory baseline. */
function createBaselinePlanet(): PlanetState {
  return PlanetStateSchema.parse(GENESIS_MISSION.planet);
}

/** Formats numbers consistently for the active interface language. */
function formatNumber(value: number, language: Language, digits = 1): string {
  return new Intl.NumberFormat(language === "pl" ? "pl-PL" : "en-US", {
    maximumFractionDigits: digits,
  }).format(value);
}

/** Derives a value-sensitive explanation and any physical UI constraint for one control. */
function deriveParameterControlState(
  parameter: (typeof PARAMETER_CONFIG)[number],
  world: WorldParameters,
  copy: LabCopy,
): { constraint: string | null; disabled: boolean; influence: string; min: number; max: number; step: number; value: number } {
  const engineeringState = deriveWorldEngineeringControlState(
    world,
    parameter.id,
  );
  const effectivePressureAtm = deriveWorldInteractionState(world)
    .effectiveAtmosphericPressureAtm;
  const value = engineeringState.displayedValue;
  const thresholdIndex = parameter.captionThresholds.findIndex(
    (threshold) => value < threshold,
  );
  const captionIndex = thresholdIndex === -1 ? 5 : thresholdIndex;
  const constraint = engineeringState.constraint
    ? copy.parameterConstraints[engineeringState.constraint]
    : null;
  const min =
    parameter.id === "temperature"
      ? Math.ceil(MIN_AVERAGE_TEMPERATURE_C + world.temperatureVariationC)
      : parameter.min;
  const max =
    parameter.id === "oxygen"
      ? effectivePressureAtm * 0.32
      : parameter.id === "carbonDioxide"
        ? effectivePressureAtm * 0.12
        : parameter.id === "water"
          ? deriveWorldEngineeringControlState(
              { ...world, waterAvailability: 1 },
              "water",
            ).displayedValue
          : parameter.id === "humidity"
            ? deriveWorldEngineeringControlState(
                { ...world, humidity: 1 },
                "humidity",
              ).displayedValue
            : parameter.id === "pressure"
              ? deriveGravityPressureLimitAtm(world.gravityG)
              : parameter.id === "temperatureVariation"
                ? Math.min(
                    parameter.max,
                    world.averageTemperatureC - MIN_AVERAGE_TEMPERATURE_C,
                  )
                : parameter.max;

  return {
    constraint,
    disabled: engineeringState.disabled,
    influence: copy.parameters[parameter.id].captions[captionIndex],
    min,
    max,
    step: parameter.step,
    value,
  };
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
  earthReference,
  influence,
  constraint,
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
  earthReference: string;
  influence: string;
  constraint: string | null;
  disabled: boolean;
  language: Language;
  onChange: (value: number) => void;
}) {
  const digits = step < 0.0001 ? 5 : step < 0.001 ? 4 : step < 0.01 ? 3 : step < 0.1 ? 2 : step < 1 ? 1 : 0;
  const display = `${formatNumber(value, language, digits)} ${unit}`;
  const position = deriveParameterSliderPosition(id, value, min, max);
  const descriptionId = `parameter-${id}-description`;
  const referenceId = `parameter-${id}-earth-reference`;
  const constraintId = `parameter-${id}-constraint`;
  const rangeRef = useRef<HTMLInputElement>(null);
  const pendingValueRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const range = rangeRef.current;
    if (!range) return;
    range.value = String(position);
    range.style.setProperty("--range-position", `${position}%`);
  }, [position]);

  useEffect(
    () => () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    },
    [],
  );

  /** Commits the newest native slider value and discards redundant pointer events. */
  const commitPendingValue = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    const pendingValue = pendingValueRef.current;
    pendingValueRef.current = null;
    if (pendingValue !== null) onChangeRef.current(pendingValue);
  };

  /** Keeps the thumb native and immediate while limiting expensive world updates to one per frame. */
  const queueValueChange = (range: HTMLInputElement) => {
    const rangeValue = Number(range.value);
    const nextValue = deriveParameterValueFromSliderPosition(
      id,
      rangeValue,
      min,
      max,
      step,
    );
    range.style.setProperty("--range-position", `${rangeValue}%`);
    pendingValueRef.current = nextValue;
    if (animationFrameRef.current !== null) return;
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      const pendingValue = pendingValueRef.current;
      pendingValueRef.current = null;
      if (pendingValue !== null) onChangeRef.current(pendingValue);
    });
  };

  return (
    <div className="parameter-control">
      <div className="parameter-heading">
        <label htmlFor={`parameter-${id}`}>{label}</label>
        <output htmlFor={`parameter-${id}`}>{display}</output>
      </div>
      <input
        aria-describedby={`${descriptionId} ${referenceId}${constraint ? ` ${constraintId}` : ""}`}
        aria-valuemax={max}
        aria-valuemin={min}
        aria-valuenow={value}
        aria-valuetext={display}
        className="xl-range"
        defaultValue={position}
        disabled={disabled}
        id={`parameter-${id}`}
        max={100}
        min={0}
        onBlur={commitPendingValue}
        onInput={(event) => queueValueChange(event.currentTarget)}
        onPointerCancel={commitPendingValue}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
          commitPendingValue();
        }}
        ref={rangeRef}
        step={0.01}
        style={{ "--range-position": `${position}%` } as React.CSSProperties}
        type="range"
      />
      <p className="parameter-earth-reference" id={referenceId}>{earthReference}</p>
      <p id={descriptionId}>{influence}</p>
      {constraint && (
        <p className="parameter-constraint" id={constraintId}>
          <span>{constraint}</span>
        </p>
      )}
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

/** Shows deterministic environmental evidence beside planet engineering and life design. */
function WorldEvidence({
  context,
  copy,
  language,
  phase,
}: {
  context: WorldContext;
  copy: LabCopy;
  language: Language;
  phase: "planet" | "design";
}) {
  const percentage = (value: number) => `${formatNumber(value * 100, language, 1)}%`;
  const dose = (value: number) =>
    `${formatNumber(value, language, value < 0.01 ? 4 : 2)} mSv/h`;
  const boilingPoint =
    context.estimatedWaterBoilingPointC === null
      ? copy.environment.noBoilingPoint
      : `${formatNumber(context.estimatedWaterBoilingPointC, language, 1)} °C`;

  return (
    <section className={`world-evidence world-evidence-${phase}`}>
      <div className="world-evidence-heading">
        <h3>{copy.environment.title}</h3>
        <p>{phase === "design" ? copy.environment.designDescription : copy.environment.planetDescription}</p>
      </div>
      <dl className="world-evidence-grid">
        <div>
          <dt>{copy.environment.climate}</dt>
          <dd><span>{copy.environment.mean}</span><strong>{formatNumber(context.meanTemperatureC, language, 0)} °C</strong></dd>
          <dd><span>{copy.environment.variation}</span><strong>±{formatNumber(context.temperatureVariationC, language, 0)} °C</strong></dd>
          <dd><span>{copy.environment.range}</span><strong>{formatNumber(context.temperatureMinimumC, language, 0)}–{formatNumber(context.temperatureMaximumC, language, 0)} °C</strong></dd>
        </div>
        <div>
          <dt>{copy.environment.atmosphere}</dt>
          <dd><span>{copy.environment.gravity}</span><strong>{formatNumber(context.gravityG, language, 2)} g</strong></dd>
          <dd><span>{copy.environment.storedPressure}</span><strong>{formatNumber(context.storedPressureAtm, language, 3)} atm</strong></dd>
          <dd><span>{copy.environment.pressureCapacity}</span><strong>{formatNumber(context.pressureCapacityAtm, language, 3)} atm</strong></dd>
          <dd><span>{copy.environment.effectivePressure}</span><strong>{formatNumber(context.effectivePressureAtm, language, 3)} atm</strong></dd>
          <dd><span>{copy.environment.oxygen}</span><strong>{formatNumber(context.oxygenPartialPressureAtm, language, 3)} atm</strong></dd>
        </div>
        <div>
          <dt>{copy.environment.hydrosphere}</dt>
          <dd><span>{copy.environment.waterInventory}</span><strong>{percentage(context.waterAvailability)}</strong></dd>
          <dd><span>{copy.environment.surfaceWater}</span><strong>{percentage(context.surfaceWaterFraction)}</strong></dd>
          <dd><span>{copy.environment.liquid}</span><strong>{percentage(context.liquidWaterFraction)}</strong></dd>
          <dd><span>{copy.environment.ice}</span><strong>{percentage(context.iceWaterFraction)}</strong></dd>
          <dd><span>{copy.environment.vapor}</span><strong>{percentage(context.vaporWaterFraction)}</strong></dd>
          <dd><span>{copy.environment.boilingPoint}</span><strong>{boilingPoint}</strong></dd>
        </div>
        <div>
          <dt>{copy.environment.humidity}</dt>
          <dd><span>{copy.environment.selected}</span><strong>{percentage(context.configuredHumidity)}</strong></dd>
          <dd><span>{copy.environment.effective}</span><strong>{percentage(context.effectiveHumidity)}</strong></dd>
          <dd><span>{copy.environment.clouds}</span><strong>{percentage(context.cloudPotential)}</strong></dd>
        </div>
        <div>
          <dt>{copy.environment.energyCarbon}</dt>
          <dd><span>{copy.environment.stellarEnergy}</span><strong>{percentage(context.lightLevel)}</strong></dd>
          <dd><span>{copy.environment.carbonDioxide}</span><strong>{formatNumber(context.carbonDioxidePartialPressureAtm, language, 4)} atm</strong></dd>
        </div>
        <div>
          <dt>{copy.environment.radiation}</dt>
          <dd><span>{copy.environment.incident}</span><strong>{dose(context.incidentRadiationMilliSvPerHour)}</strong></dd>
          <dd><span>{copy.environment.protected}</span><strong>{dose(context.protectedRadiationMilliSvPerHour)}</strong></dd>
          <dd><span>{copy.environment.magneticField}</span><strong>{formatNumber(context.magneticFieldStrengthEarth, language, 2)} {copy.environment.earthFieldUnit}</strong></dd>
          <dd><span>{copy.environment.shieldingColumn}</span><strong>{formatNumber(context.shieldingColumnMassKgM2, language, 0)} kg/m²</strong></dd>
        </div>
      </dl>
    </section>
  );
}

/** Full application surface for one repeatable procedural life-engineering workspace. */
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
  const worldContext = useMemo(
    () => deriveWorldContext(planet.world),
    [planet.world],
  );

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = copy.document.title;
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute("content", copy.document.description);
  }, [copy.document.description, copy.document.title, language]);

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
      const world = applyWorldEngineeringControlChange(current.world, id, value);
      return PlanetStateSchema.parse({ ...current, world });
    });
  };

  const restoreBaseline = () => {
    setPlanet(createBaselinePlanet());
    invalidateCalculatedState();
  };

  const resetLab = () => {
    stateEpoch.current += 1;
    simulationRunId.current += 1;
    setPlanet(createBaselinePlanet());
    setTraitIds(DEFAULT_TRAITS);
    setPhase("planet");
    setActiveCategory("body");
    setTraitNotice(null);
    setVisualizationMode("realistic");
    setAutoRotate(true);
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
        <div className="lab-header-actions">
          <div aria-label={copy.language.label} className="language-switch" role="group">
            <button aria-pressed={language === "en"} onClick={() => changeLanguage("en")} type="button">EN</button>
            <button aria-pressed={language === "pl"} onClick={() => changeLanguage("pl")} type="button">PL</button>
          </div>
          <button className="button-quiet compact" onClick={resetLab} type="button">{copy.header.reset}</button>
        </div>
      </header>

      <nav aria-label={copy.header.system} className="mobile-phase-navigation">
        {PHASES.map((item, index) => (
          <button aria-current={phase === item ? "step" : undefined} key={item} onClick={() => setPhase(item)} type="button">
            <span>{String(index + 1).padStart(2, "0")}</span>{copy.phases[item].label}
          </button>
        ))}
      </nav>

      <div className={`lab-grid phase-${phase}`}>
        {phase !== "results" && (
          <aside className="lab-panel world-evidence-panel">
            <WorldEvidence
              context={worldContext}
              copy={copy}
              language={language}
              phase={phase === "planet" ? "planet" : "design"}
            />
          </aside>
        )}
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

          <div className="planet-toolbar">
            <button className="button-quiet compact" onClick={() => setCameraResetSignal((value) => value + 1)} type="button">{copy.header.resetCamera}</button>
            <button className="button-quiet compact" onClick={() => setAutoRotate((value) => !value)} type="button">{autoRotate ? copy.header.rotationOn : copy.header.rotationOff}</button>
          </div>
          <div className="planet-control-hint" aria-live="polite">
            <span className="desktop-control-hint">{copy.planet.controlsDesktop}</span>
            <span className="mobile-control-hint">{copy.planet.controlsMobile}</span>
          </div>
        </section>

        <aside className={`lab-panel analysis-panel ${phase === "planet" ? "mobile-hidden" : ""}`}>
          <nav aria-label={copy.header.system} className="phase-tabs">
            {PHASES.map((item, index) => (
              <button aria-current={phase === item ? "step" : undefined} key={item} onClick={() => setPhase(item)} type="button">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{copy.phases[item].label}</strong>
                <small>{copy.phases[item].description}</small>
              </button>
            ))}
          </nav>

          {phase === "planet" && (
            <div className="phase-content guidance-content planet-controls-content">
              <div className="panel-section-heading">
                <div><p className="eyebrow">{copy.planet.baseline}</p><h2>{copy.planet.title}</h2></div>
                <button className="text-button" onClick={restoreBaseline} type="button">{copy.planet.resetBaseline}</button>
              </div>
              <p className="panel-intro">{copy.planet.instruction}</p>
              <div className="parameter-list">
                {PARAMETER_CONFIG.map((parameter) => {
                  const parameterCopy = copy.parameters[parameter.id];
                  const controlState = deriveParameterControlState(parameter, planet.world, copy);
                  return <ParameterControl constraint={controlState.constraint} disabled={isSimulating || controlState.disabled} earthReference={parameterCopy.earthReference} id={parameter.id} influence={controlState.influence} key={parameter.id} label={parameterCopy.label} language={language} max={controlState.max} min={controlState.min} onChange={(value) => updateParameter(parameter.id, value)} step={controlState.step} unit={parameterCopy.unit} value={controlState.value} />;
                })}
              </div>
              <button className="button-primary wide" onClick={() => setPhase("life")} type="button">{copy.planet.openDesigner}<span aria-hidden="true">→</span></button>
            </div>
          )}

          {phase === "life" && (
            <div className="phase-content life-designer">
              <div className="phase-title-row">
                <div><p className="eyebrow">{copy.phases.life.label}</p><h2>{copy.life.title}</h2></div>
                <span className="status-chip">{traitIds.length} {copy.life.selected}</span>
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
                  const unavailable = false;
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
                        <div key={region}>
                          <span><strong>{copy.regions[region].label}</strong><small>{score >= 0.5 ? copy.simulation.habitable : copy.regions[region].description}</small></span>
                          <b>{Math.round(score * 100)}</b>
                        </div>
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

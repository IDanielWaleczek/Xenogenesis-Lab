"use client";

/* eslint-disable @next/next/no-img-element -- supplied flag CDN assets are intentionally rendered at their exact URLs. */

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import OrganismPreview from "@/components/life/OrganismPreview";
import type { PlanetVisualizationMode } from "@/components/planet/ProceduralPlanet";
import { BASELINE_PLANET } from "@/domain/simulator/baseline";
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
  SurvivalFailureReason,
  SurvivalSimulationRequest,
  SurvivalSimulationResult,
} from "@/domain/simulator/schema";
import { runSurvivalSimulation } from "@/domain/simulator/simulate";
import {
  LIFE_TRAITS,
  TRAIT_CONFLICT_GROUPS,
  type TraitConflictGroup,
  type TraitCategory,
} from "@/domain/simulator/traits";
import {
  deriveAdaptationArchetypes,
  deriveViableAdaptationArchetypes,
} from "@/domain/simulator/archetypes";
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

import {
  COPY,
  type LabCopy,
  type LabPhase,
  type Language,
  type ParameterId,
  type TutorialStepId,
} from "./copy";
import {
  deriveParameterSliderPosition,
  deriveParameterValueFromSliderPosition,
} from "./parameter-curves";
import { deriveExperimentReadiness } from "./experiment-tools";

const ProceduralPlanet = dynamic(
  () => import("@/components/planet/ProceduralPlanet"),
  {
    ssr: false,
    loading: () => <div className="planet-canvas planet-loading" aria-hidden="true" />,
  },
);

const IntroPlanetaryScene = dynamic(
  () => import("@/components/planet/ProceduralPlanet").then((module) => module.IntroPlanetaryScene),
  { ssr: false },
);

type SystemScreen = "boot" | "lab";
type TraitNotice = "conflict" | "minimumTraits" | null;
type TutorialTarget =
  | "planetStage"
  | "planetControls"
  | "planetParameter"
  | "evidencePanel"
  | "worldStory"
  | "worldEvidence"
  | "chooseLife"
  | "lifeDropdown"
  | "hypothesisStory"
  | "lifeFacts"
  | "readiness"
  | "lifeEvidence"
  | "runSimulation"
  | "resultOutcome"
  | "resultMetrics"
  | "resultRegions"
  | "resultPopulation"
  | "organismPortrait"
  | "consultant";

const PHASES: LabPhase[] = ["planet", "life", "results"];
const TUTORIAL_STEPS: Array<{ id: TutorialStepId; phase: LabPhase; target: TutorialTarget }> = [
  { id: "planetScene", phase: "planet", target: "planetStage" },
  { id: "planetControls", phase: "planet", target: "planetControls" },
  { id: "parameter", phase: "planet", target: "planetParameter" },
  { id: "evidencePanel", phase: "planet", target: "evidencePanel" },
  { id: "worldStory", phase: "planet", target: "worldStory" },
  { id: "evidenceDetails", phase: "planet", target: "worldEvidence" },
  { id: "chooseLife", phase: "planet", target: "chooseLife" },
  { id: "lifeTransition", phase: "life", target: "planetStage" },
  { id: "lifeScene", phase: "life", target: "planetStage" },
  { id: "lifeControls", phase: "life", target: "planetControls" },
  { id: "lifeDropdown", phase: "life", target: "lifeDropdown" },
  { id: "hypothesisStory", phase: "life", target: "hypothesisStory" },
  { id: "lifeFacts", phase: "life", target: "lifeFacts" },
  { id: "readiness", phase: "life", target: "readiness" },
  { id: "lifeEvidence", phase: "life", target: "lifeEvidence" },
  { id: "runSimulation", phase: "life", target: "runSimulation" },
  { id: "resultOutcome", phase: "results", target: "resultOutcome" },
  { id: "metrics", phase: "results", target: "resultMetrics" },
  { id: "regions", phase: "results", target: "resultRegions" },
  { id: "population", phase: "results", target: "resultPopulation" },
  { id: "events", phase: "results", target: "resultPopulation" },
  { id: "portrait", phase: "results", target: "organismPortrait" },
  { id: "consultant", phase: "results", target: "consultant" },
];
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

const METRIC_EMOJIS: Record<SimulationMetricId, string> = {
  advancedLifePotential: "🧠",
  ecosystemPotential: "🌿",
  populationStability: "📈",
  organismCompatibility: "🧬",
  metabolicViability: "⚗️",
  biologicalEnergy: "☀️",
  liquidWater: "💧",
  atmosphere: "🌬️",
  thermalStability: "🌡️",
  radiationSafety: "🛡️",
  reproductionPotential: "🥚",
};

const TRAIT_EMOJIS: Record<LifeTraitId, string> = {
  compactBody: "🔹",
  largeBody: "🐘",
  internalSkeleton: "🦴",
  exoskeleton: "🛡️",
  aquaticMovement: "🐟",
  terrestrialMovement: "🐾",
  aerialMovement: "🕊️",
  unicellular: "🦠",
  multicellular: "🧬",
  bilateralSymmetry: "↔️",
  radialSymmetry: "✳️",
  gills: "🐠",
  lungs: "💨",
  graspingLimbs: "🦾",
  opposableDigits: "🤏",
  oxygenRespiration: "💨",
  lowOxygenMetabolism: "⚗️",
  anaerobicMetabolism: "⚗️",
  photosynthesis: "🌿",
  chemosynthesis: "🔬",
  radiationResistance: "☢️",
  thermalInsulation: "❄️",
  heatResistance: "🔥",
  cryoprotectiveChemistry: "🧊",
  heatShockProteins: "🧪",
  mineralShielding: "⛏️",
  biofilmColony: "🧫",
  saltTolerance: "🧂",
  waterConservation: "💧",
  pressureResistance: "🌊",
  regenerativeTissue: "🩹",
  hibernation: "😴",
  dormantCysts: "🥚",
  symbioticMetabolism: "🤝",
  visibleVision: "👁️",
  infraredVision: "🌡️",
  echolocation: "📡",
  chemicalSensing: "👃",
  rapidReproduction: "🐣",
  protectedEggs: "🥚",
  liveBirth: "🤱",
  spores: "🍄",
  parentalInvestment: "❤️",
  simpleNeuralSystem: "🕸️",
  centralizedBrain: "🧠",
  bipedalPosture: "🚶",
  socialCoordination: "🐜",
  toolUsePotential: "🛠️",
  complexCommunication: "🗣️",
  adaptiveLearning: "📚",
  culturalMemory: "📜",
};

const DEFAULT_TRAITS: LifeTraitId[] = [];

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
  return PlanetStateSchema.parse(BASELINE_PLANET);
}

/** Creates a familiar, fully editable world for an immediately runnable experiment. */
function createTemperateExperimentPlanet(): PlanetState {
  const baseline = createBaselinePlanet();
  return PlanetStateSchema.parse({
    ...baseline,
    seed: "VESPERA-TEMPERATE-01",
    world: {
      ...baseline.world,
      atmosphericPressureAtm: 1,
      atmosphereComposition: {
        oxygenFraction: 0.21,
        carbonDioxideFraction: 0.00042,
        nitrogenFraction: 0.78,
        inertGasFraction: 0.00958,
        toxicGasFraction: 0,
      },
      averageTemperatureC: 15,
      temperatureVariationC: 15,
      radiationDoseRate: { value: 0.0003, unit: "mSv/h" },
      lightLevel: 1,
      waterAvailability: 0.71,
      humidity: 0.6,
      magneticFieldStrengthEarth: 1,
    },
  });
}

/** Builds the two explicitly parameter-backed worlds used only as the boot-scene tableau. */
function createBootPlanets(): { frozenPlanet: PlanetState; warmPlanet: PlanetState } {
  const baseline = createBaselinePlanet();
  return {
    frozenPlanet: PlanetStateSchema.parse({
      ...baseline,
      seed: "vespera-boot-frozen",
      world: {
        ...baseline.world,
        averageTemperatureC: -72,
        temperatureVariationC: 16,
        atmosphericPressureAtm: 0.9,
        waterAvailability: 0.5,
        humidity: 0.32,
        lightLevel: 0.55,
      },
    }),
    warmPlanet: PlanetStateSchema.parse({
      ...baseline,
      seed: "vespera-boot-warm",
      world: {
        ...baseline.world,
        averageTemperatureC: 38,
        temperatureVariationC: 12,
        atmosphericPressureAtm: 1.15,
        waterAvailability: 0.36,
        humidity: 0.52,
        lightLevel: 0.9,
      },
    }),
  };
}

/** Formats numbers consistently for the active interface language. */
function formatNumber(value: number, language: Language, digits = 1): string {
  return new Intl.NumberFormat(language === "pl" ? "pl-PL" : "en-US", {
    maximumFractionDigits: digits,
  }).format(value);
}

/** Blocks unsupported narrow viewports while the laboratory remains desktop-only. */
function DesktopOnlyNotice({ copy }: { copy: LabCopy }) {
  return (
    <aside className="desktop-only-notice" role="alert">
      <span>{copy.desktopOnly.eyebrow}</span>
      <h1>{copy.desktopOnly.title}</h1>
      <p>{copy.desktopOnly.description}</p>
    </aside>
  );
}

/** Renders deterministic failure causes with the current world facts. */
function formatFailureExplanation(
  reasons: SurvivalFailureReason[],
  context: WorldContext,
  copy: LabCopy,
  language: Language,
): string {
  return reasons.map((reason) => copy.simulation.failureReasons[reason]
    .replace("{minimum}", formatNumber(context.temperatureMinimumC, language, 0))
    .replace("{maximum}", formatNumber(context.temperatureMaximumC, language, 0))
    .replace("{light}", formatNumber(context.lightLevel * 100, language, 0))
    .replace("{radiation}", formatNumber(context.protectedRadiationMilliSvPerHour, language, 3)))
    .join(" ");
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
  emphasized,
  changed,
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
  emphasized: boolean;
  changed: boolean;
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
  const exactInputRef = useRef<HTMLInputElement>(null);
  const pendingValueRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (exactInputRef.current) exactInputRef.current.value = String(value);
  }, [value]);

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

  /** Commits a precise typed value while retaining the physical control bounds. */
  const commitExactValue = (input: HTMLInputElement) => {
    const nextValue = input.valueAsNumber;
    if (!Number.isFinite(nextValue)) {
      input.value = String(value);
      return;
    }
    onChange(Math.min(max, Math.max(min, nextValue)));
  };

  return (
    <div className={`parameter-control ${emphasized ? "guidance-highlight" : ""} ${changed ? "last-changed" : ""}`}>
      <div className="parameter-heading">
        <label htmlFor={`parameter-${id}`}>{label}</label>
        <span className="parameter-value-input">
          <input
            aria-label={`${label} ${unit}`}
            disabled={disabled}
            inputMode="decimal"
            max={max}
            min={min}
            defaultValue={value}
            onBlur={(event) => commitExactValue(event.currentTarget)}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
            ref={exactInputRef}
            step={step}
            type="number"
          />
          <span>{unit}</span>
        </span>
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
/** Expands a mutually exclusive adaptation choice without hiding its tradeoffs. */
function SingleChoiceTraitDropdown({
  group,
  traitIds,
  copy,
  onSelect,
}: {
  group: TraitConflictGroup;
  traitIds: LifeTraitId[];
  copy: LabCopy;
  onSelect: (group: TraitConflictGroup, traitId: LifeTraitId) => void;
}) {
  const selectedTraitId = group.traitIds.find((traitId) => traitIds.includes(traitId));
  const selectedTrait = selectedTraitId ? copy.traits[selectedTraitId] : null;

  return (
    <details className="trait-choice-dropdown">
      <summary>
        <span>{copy.life.singleChoiceGroups[group.id]}</span>
        <strong>{selectedTraitId && <span aria-hidden="true" className="trait-emoji">{TRAIT_EMOJIS[selectedTraitId]}</span>}{selectedTrait?.title ?? copy.life.chooseOne}</strong>
      </summary>
      {selectedTrait && (
        <div className="selected-trait-summary">
          <small><em>{copy.life.advantage}</em>{selectedTrait.advantage}</small>
          <small><em>{copy.life.tradeoff}</em>{selectedTrait.tradeoff}</small>
        </div>
      )}
      <div aria-label={copy.life.singleChoiceGroups[group.id]} className="trait-choice-options" role="radiogroup">
        {group.traitIds.map((traitId) => {
          const traitCopy = copy.traits[traitId];
          const selected = traitId === selectedTraitId;
          return (
            <button
              aria-checked={selected}
              className={`trait-choice-option ${selected ? "selected" : ""}`}
              key={traitId}
              onClick={() => {
                onSelect(group, traitId);
              }}
              role="radio"
              type="button"
            >
              <span aria-hidden="true" className="trait-choice-indicator">{selected ? "✓" : ""}</span>
              <span className="trait-copy">
                <span className="trait-title"><strong><span aria-hidden="true" className="trait-emoji">{TRAIT_EMOJIS[traitId]}</span>{traitCopy.title}</strong></span>
                <small><em>{copy.life.advantage}</em>{traitCopy.advantage}</small>
                <small><em>{copy.life.tradeoff}</em>{traitCopy.tradeoff}</small>
              </span>
            </button>
          );
        })}
      </div>
    </details>
  );
}

function PopulationChart({
  result,
  language,
  label,
  copy,
}: {
  result: SurvivalSimulationResult;
  language: Language;
  label: string;
  copy: LabCopy;
}) {
  const gradientId = `population-${useId().replaceAll(":", "")}`;
  const [hoveredGeneration, setHoveredGeneration] = useState<number | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null);
  const width = 620;
  const height = 190;
  const padding = 18;
  const finalGeneration = result.populationTimeline.at(-1)?.generation ?? 1;
  const maximum = Math.max(1, result.peakPopulation, result.carryingCapacity);
  const points = result.populationTimeline.map(({ generation, population }) => ({
    generation,
    population,
    x: padding + (generation / finalGeneration) * (width - padding * 2),
    y: height - padding - (population / maximum) * (height - padding * 2),
  }));
  const line = points.map(({ x, y }) => `${x},${y}`).join(" ");
  const area = `M ${padding} ${height - padding} L ${points.map(({ x, y }) => `${x} ${y}`).join(" L ")} L ${width - padding} ${height - padding} Z`;
  const activePoint = hoveredGeneration === null ? null : points[hoveredGeneration];
  const event = hoveredEvent === null ? null : result.populationEvents[hoveredEvent];
  const tooltipAlignsEnd = activePoint !== null && activePoint.x > width * 0.56;
  const tooltipStyle = activePoint ? {
    "--tooltip-x": `${(activePoint.x / width) * 100}%`,
    "--tooltip-y": `${(activePoint.y / height) * 100}%`,
  } as React.CSSProperties : undefined;
  const updateHoveredGeneration = (event: React.PointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const chartX = ((event.clientX - bounds.left) / bounds.width) * width;
    const generation = Math.round(((chartX - padding) / (width - padding * 2)) * finalGeneration);
    setHoveredGeneration(Math.max(0, Math.min(finalGeneration, generation)));
  };
  const activateEvent = (eventIndex: number, generation: number) => {
    setHoveredGeneration(generation);
    setHoveredEvent(eventIndex);
  };

  return (
    <figure className="population-chart">
      <svg
        aria-label={label}
        onPointerLeave={() => {
          setHoveredGeneration(null);
          setHoveredEvent(null);
        }}
        onPointerMove={updateHoveredGeneration}
        role="img"
        viewBox={`0 0 ${width} ${height}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#5eead4" stopOpacity="0.36" />
            <stop offset="1" stopColor="#5eead4" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <rect className="population-chart-hit-area" height={height} width={width} x="0" y="0" />
        {[0.25, 0.5, 0.75].map((fraction) => (
          <line key={fraction} x1={padding} x2={width - padding} y1={height * fraction} y2={height * fraction} />
        ))}
        <path d={area} fill={`url(#${gradientId})`} />
        <polyline fill="none" points={line} stroke="#67e8f9" strokeLinejoin="round" strokeWidth="3" />
        {result.populationEvents.map((event, index) => {
          const point = points[event.generation];
          const accessibleEvent = `${EVENT_EMOJI[event.id]} ${copy.populationEvents[event.id].title}: ${copy.populationEvents[event.id].description}`;
          return point ? <g key={`${event.id}-${event.generation}`}><line className={`population-event-line ${event.kind}`} x1={point.x} x2={point.x} y1={padding} y2={height - padding} /><rect aria-label={accessibleEvent} className="population-event-hit-area" height={height - padding * 2} onBlur={() => setHoveredEvent(null)} onFocus={() => activateEvent(index, event.generation)} onPointerEnter={() => activateEvent(index, event.generation)} onPointerLeave={() => setHoveredEvent(null)} role="img" tabIndex={0} width="30" x={point.x - 15} y={padding} /><circle aria-hidden="true" className={`population-event-dot ${event.kind}`} cx={point.x} cy={point.y} r="7" /><text className="population-event-icon" x={point.x} y={Math.max(14, point.y - 11)}>{EVENT_EMOJI[event.id]}</text></g> : null;
        })}
        <circle cx={points.at(-1)?.x} cy={points.at(-1)?.y} fill="#ecfeff" r="4" />
        {activePoint && <g className="population-chart-cursor" pointerEvents="none"><line x1={activePoint.x} x2={activePoint.x} y1={padding} y2={height - padding} /><circle cx={activePoint.x} cy={activePoint.y} r="4" /></g>}
      </svg>
      {activePoint && <output className={`population-chart-tooltip${tooltipAlignsEnd ? " population-chart-tooltip-end" : ""}`} style={tooltipStyle}><strong>{language === "pl" ? "Rok" : "Year"} {activePoint.generation}</strong><span>{formatNumber(activePoint.population, language, 0)} {language === "pl" ? "organizmów" : "organisms"}</span>{event && <div className="population-chart-event-detail"><b>{EVENT_EMOJI[event.id]} {copy.populationEvents[event.id].title} · {event.impactFraction > 0 ? "+" : ""}{Math.round(event.impactFraction * 100)}%</b><span>{copy.populationEvents[event.id].description}</span><small>{copy.simulation.eventImpactContext}</small></div>}</output>}
      <figcaption>
        <span>0</span>
        <span>{formatNumber(maximum, language, 0)}</span>
        <span>{finalGeneration}</span>
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
          <dd className="world-evidence-boiling-point"><span>{copy.environment.boilingPoint}</span><strong>{boilingPoint}</strong></dd>
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

/** Turns current deterministic evidence into short, explicitly non-predictive teaching copy. */
function worldStory(context: WorldContext, language: Language): string {
  const frozen = context.iceWaterFraction > context.liquidWaterFraction;
  const water = context.liquidWaterFraction > 0.08;
  const airless = context.effectivePressureAtm < 0.01;
  const harshRadiation = context.protectedRadiationMilliSvPerHour > 0.1;
  if (language === "pl") {
    const air = airless ? "Świat ma praktycznie próżnię, więc na powierzchni nie utrzyma chmur ani stabilnej ciekłej wody." : "Atmosfera może przenosić ciepło i tworzyć warunki dla pogody.";
    const hydro = frozen ? "Większość dostępnej wody pozostaje zamarznięta." : water ? "Część wody pozostaje ciekła, tworząc potencjalne nisze przy powierzchni." : "Dostępna ciekła woda jest obecnie zbyt rzadka dla rozległych siedlisk.";
    const radiation = harshRadiation ? "Promieniowanie nadal jest silnym testem dla odsłoniętego życia." : "Ochrona magnetyczna utrzymuje promieniowanie na bardziej sprzyjającym poziomie modelowym.";
    return `${air} ${hydro} ${radiation}`;
  }
  const air = airless ? "This world is close to vacuum, so its surface cannot hold clouds or stable liquid water." : "Its atmosphere can move heat and make weather possible.";
  const hydro = frozen ? "Most available water is locked as ice." : water ? "Some water remains liquid, creating possible surface niches." : "Accessible liquid water is too scarce for broad habitats right now.";
  const radiation = harshRadiation ? "Radiation remains a serious test for exposed life." : "Magnetic protection keeps radiation at a more forgiving model level.";
  return `${air} ${hydro} ${radiation}`;
}

/** Explains the selected organism concept without presenting it as a simulation outcome. */
function lifeStory(context: WorldContext, traitIds: LifeTraitId[], copy: LabCopy, language: Language): string {
  if (traitIds.length === 0) {
    return language === "pl"
      ? "Organizm jest jeszcze pustą hipotezą. Wybierz formę ciała, a następnie cechy, które odpowiadają na warunki tej planety."
      : "The organism is still an empty hypothesis. Choose a body form, then select traits that answer this planet’s conditions.";
  }
  const names = traitIds.slice(0, 3).map((id) => copy.traits[id].title).join(", ");
  const challenge = context.liquidWaterFraction < 0.08
    ? (language === "pl" ? "mało dostępnej ciekłej wody" : "scarce accessible liquid water")
    : context.effectivePressureAtm < 0.1
      ? (language === "pl" ? "cienka atmosfera" : "a thin atmosphere")
      : context.protectedRadiationMilliSvPerHour > 0.1
        ? (language === "pl" ? "silne promieniowanie" : "strong radiation")
        : (language === "pl" ? "zmienne nisze klimatyczne" : "changing climate niches");
  return language === "pl"
    ? `Ta hipoteza łączy ${names}. Jej najważniejszym sprawdzianem będzie ${challenge}; kolejne cechy są eksperymentem, a nie gwarancją przetrwania.`
    : `This hypothesis combines ${names}. Its main test will be ${challenge}; every further trait is an experiment, not a guarantee of survival.`;
}

const EVENT_EMOJI = {
  vacuumExposure: "🪐", oxygenShortfall: "💨", thermalShock: "🌡️", radiationStorm: "☢️", hydrosphereStress: "💧", desiccationFront: "🏜️", lowLightFamine: "🌑", resourceBloom: "🌿", geothermalPulse: "🌋", thawWindow: "🧊", reproductiveBottleneck: "🥚", seasonalRefuge: "🛖", adaptiveBreakthrough: "🧠", nutrientUpwelling: "🌊", photosyntheticSurge: "☀️", nurserySeason: "🐣",
} as const;

/** Renders a region-specific procedural mini-scene from the engineered world state. */
function RegionBiomePreview({ context, region, label }: { context: WorldContext; region: RegionId; label: string }) {
  const hasLiquidWater = context.liquidWaterFraction > 0.08;
  const frozen = context.iceWaterFraction > context.liquidWaterFraction;
  const barren = context.effectivePressureAtm < 0.01;
  const hot = context.temperatureMaximumC > 50;
  const cold = context.temperatureMinimumC < 0;
  const dim = context.lightLevel < 0.28;
  const irradiated = context.protectedRadiationMilliSvPerHour > 0.1;
  const thinAir = context.effectivePressureAtm < 0.2;
  const denseAir = context.effectivePressureAtm > 1.5;
  const className = `region-biome ${region} ${hasLiquidWater ? "has-water" : "dry"} ${frozen ? "frozen" : ""} ${barren ? "airless" : ""} ${hot ? "hot" : ""} ${cold ? "cold" : ""} ${dim ? "dim" : ""} ${irradiated ? "irradiated" : ""} ${thinAir ? "thin-air" : ""} ${denseAir ? "dense-air" : ""}`;
  return (
    <figure aria-label={label} className={className} role="img">
      <i className="region-sky" />
      <i className="region-distant" />
      <i className="region-ground" />
      <i className="region-detail" />
      <i className="region-atmosphere" />
    </figure>
  );
}

/** Full application surface for one repeatable procedural life-engineering workspace. */
export default function Home() {
  const bootPlanets = useMemo(() => createBootPlanets(), []);
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
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStepIndex, setOnboardingStepIndex] = useState(0);
  const [lastParameterId, setLastParameterId] = useState<ParameterId | null>(null);
  const [summaryCopyStatus, setSummaryCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const simulationRunId = useRef(0);
  const stateEpoch = useRef(0);
  const planetStageRef = useRef<HTMLElement>(null);
  const planetControlsRef = useRef<HTMLElement>(null);
  const planetParameterRef = useRef<HTMLDivElement>(null);
  const evidencePanelRef = useRef<HTMLElement>(null);
  const worldStoryRef = useRef<HTMLElement>(null);
  const worldEvidenceRef = useRef<HTMLDivElement>(null);
  const chooseLifeRef = useRef<HTMLButtonElement>(null);
  const lifeDropdownRef = useRef<HTMLDivElement>(null);
  const hypothesisStoryRef = useRef<HTMLElement>(null);
  const lifeFactsRef = useRef<HTMLDivElement>(null);
  const readinessRef = useRef<HTMLElement>(null);
  const lifeEvidenceRef = useRef<HTMLDivElement>(null);
  const runSimulationRef = useRef<HTMLDivElement>(null);
  const resultOutcomeRef = useRef<HTMLElement>(null);
  const resultMetricsRef = useRef<HTMLElement>(null);
  const resultRegionsRef = useRef<HTMLElement>(null);
  const resultPopulationRef = useRef<HTMLElement>(null);
  const organismPortraitRef = useRef<HTMLElement>(null);
  const consultantRef = useRef<HTMLElement>(null);
  const copy = COPY[language];
  const activeTutorialStep = TUTORIAL_STEPS[onboardingStepIndex];
  const tutorialFocus = (target: TutorialTarget) => (
    showOnboarding && activeTutorialStep.target === target ? "tutorial-focus" : ""
  );
  const worldContext = useMemo(
    () => deriveWorldContext(planet.world),
    [planet.world],
  );
  const viableArchetypes = useMemo(() => deriveViableAdaptationArchetypes(planet), [planet]);
  const readiness = useMemo(
    () => deriveExperimentReadiness(
      worldContext,
      deriveAdaptationArchetypes(planet).length > 0,
    ),
    [planet, worldContext],
  );

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = copy.document.title;
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute("content", copy.document.description);
  }, [copy.document.description, copy.document.title, language]);

  useEffect(() => {
    if (!isImagePreviewOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsImagePreviewOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isImagePreviewOpen]);

  const invalidateCalculatedState = () => {
    stateEpoch.current += 1;
    simulationRunId.current += 1;
    setIsSimulating(false);
    if (result) setResultStale(true);
    setConsultant(null);
    setConsultantStatus("idle");
    setOrganismImage(null);
    setImageStatus("idle");
    setIsImagePreviewOpen(false);
    setSummaryCopyStatus("idle");
  };

  const updateParameter = (id: ParameterId, value: number) => {
    invalidateCalculatedState();
    setLastParameterId(id);
    setPlanet((current) => {
      const world = applyWorldEngineeringControlChange(current.world, id, value);
      return PlanetStateSchema.parse({ ...current, world });
    });
  };

  const restoreBaseline = () => {
    setPlanet(createBaselinePlanet());
    setLastParameterId(null);
    invalidateCalculatedState();
  };

  const loadTemperateExperiment = () => {
    setPlanet(createTemperateExperimentPlanet());
    setLastParameterId(null);
    invalidateCalculatedState();
  };

  const loadTutorialLifeform = () => {
    const examplePlanet = createTemperateExperimentPlanet();
    const exampleTraits = deriveAdaptationArchetypes(examplePlanet)[0]?.traitIds ?? DEFAULT_TRAITS;
    setPlanet(examplePlanet);
    setTraitIds(exampleTraits);
    setActiveCategory("body");
    setTraitNotice(null);
    setLastParameterId(null);
    invalidateCalculatedState();
  };

  const resetScrollableSurfaces = () => {
    const reset = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      document.querySelectorAll<HTMLElement>(".lab-panel, .planet-stage").forEach((surface) => {
        surface.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    };
    reset();
    window.requestAnimationFrame(reset);
  };

  const endOnboarding = () => {
    window.localStorage.setItem("xenogenesis-onboarding-seen", "true");
    resetLab();
    resetScrollableSurfaces();
    setShowOnboarding(false);
    setOnboardingStepIndex(0);
  };

  const dismissOnboarding = endOnboarding;

  const reopenOnboarding = () => {
    setOnboardingStepIndex(0);
    setPhase("planet");
    setShowOnboarding(true);
  };

  const retreatOnboarding = () => {
    if (onboardingStepIndex === 0) return;
    const previousIndex = onboardingStepIndex - 1;
    setOnboardingStepIndex(previousIndex);
    setPhase(TUTORIAL_STEPS[previousIndex].phase);
    resetScrollableSurfaces();
  };

  const advanceOnboarding = () => {
    if (onboardingStepIndex === TUTORIAL_STEPS.length - 1) {
      endOnboarding();
      return;
    }
    if (activeTutorialStep.id === "parameter") loadTemperateExperiment();
    if (activeTutorialStep.id === "chooseLife") loadTutorialLifeform();
    const nextIndex = onboardingStepIndex + 1;
    setOnboardingStepIndex(nextIndex);
    setPhase(TUTORIAL_STEPS[nextIndex].phase);
    resetScrollableSurfaces();
  };

  const enterLab = () => {
    if (window.localStorage.getItem("xenogenesis-onboarding-seen") !== "true") {
      setOnboardingStepIndex(0);
      setPhase("planet");
      setShowOnboarding(true);
    }
    setScreen("lab");
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
    setIsImagePreviewOpen(false);
    setLastParameterId(null);
    setSummaryCopyStatus("idle");
  };

  /** Removes only this application's browser keys, then restores the first-run state. */
  const clearLabData = () => {
    if (!window.confirm(copy.header.clearDataConfirm)) return;
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith("xenogenesis-"))
      .forEach((key) => window.localStorage.removeItem(key));
    resetLab();
    setLanguage("en");
    setShowOnboarding(false);
    setScreen("boot");
  };

  const changeLanguage = (nextLanguage: Language) => {
    stateEpoch.current += 1;
    setLanguage(nextLanguage);
    setConsultant(null);
    setConsultantStatus("idle");
    setOrganismImage(null);
    setImageStatus("idle");
  };

  const removeConflictingTraits = (current: LifeTraitId[], traitId: LifeTraitId) => current.filter(
    (selectedId) => selectedId === traitId || (
      !LIFE_TRAITS[traitId].conflicts.includes(selectedId)
      && !LIFE_TRAITS[selectedId].conflicts.includes(traitId)
    ),
  );

  const toggleTrait = (traitId: LifeTraitId) => {
    setTraitNotice(null);
    if (traitIds.includes(traitId)) {
      setTraitIds((current) => current.filter((id) => id !== traitId));
      invalidateCalculatedState();
      return;
    }
    setTraitIds((current) => [...removeConflictingTraits(current, traitId), traitId]);
    invalidateCalculatedState();
  };

  const selectSingleChoiceTrait = (group: TraitConflictGroup, next: LifeTraitId) => {
    setTraitNotice(null);
    invalidateCalculatedState();
    setTraitIds((current) => [
      ...removeConflictingTraits(current.filter((id) => !group.traitIds.includes(id)), next),
      next,
    ]);
  };

  const applyArchetype = (nextTraitIds: LifeTraitId[]) => {
    setTraitNotice(null);
    invalidateCalculatedState();
    setTraitIds(nextTraitIds);
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
    if (showOnboarding && activeTutorialStep.id === "runSimulation") {
      setOnboardingStepIndex((current) => Math.min(current + 1, TUTORIAL_STEPS.length - 1));
    }
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
    setSummaryCopyStatus("idle");
    setIsSimulating(false);
  };

  /** Copies only user choices and calculated evidence for a reproducible follow-up experiment. */
  const copyExperimentSummary = async () => {
    if (!result) return;
    const traitNames = traitIds.map((id) => copy.traits[id].title).join(", ");
    const summary = [
      `${copy.header.system}`,
      `${copy.simulation.stateHash}: ${result.stateHash} · ${copy.simulation.modelVersion}: ${result.simulatorVersion}`,
      `${copy.environment.effectivePressure}: ${formatNumber(worldContext.effectivePressureAtm, language, 3)} atm · ${copy.environment.range}: ${formatNumber(worldContext.temperatureMinimumC, language, 0)}–${formatNumber(worldContext.temperatureMaximumC, language, 0)} °C`,
      `${copy.environment.surfaceWater}: ${formatNumber(worldContext.surfaceWaterFraction * 100, language, 1)}% · ${copy.environment.protected}: ${formatNumber(worldContext.protectedRadiationMilliSvPerHour, language, 5)} mSv/h`,
      `${language === "pl" ? "Cechy" : "Traits"}: ${traitNames || "—"}`,
      `${copy.simulation.outcome}: ${copy.outcomes[result.outcome].title} · ${language === "pl" ? "Przeżywalność" : "Survivability"}: ${Math.round((result.finalPopulation === 0 ? 0 : result.metrics.organismCompatibility) * 100)}%`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(summary);
      setSummaryCopyStatus("copied");
    } catch {
      setSummaryCopyStatus("error");
    }
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
        <IntroPlanetaryScene {...bootPlanets} />
        <section className="boot-hero">
          <div className="boot-identity">
            <Image alt="Xenogenesis Lab" className="boot-banner" height={132} priority src="/XenogenesisLabBanner_Transparent.png" width={660} />
            <p>{copy.boot.eyebrow}</p>
            <h1 className="sr-only">{copy.boot.title}</h1>
            <span>{copy.boot.subtitle}</span>
          </div>
          <p className="boot-scene-label"><span aria-hidden="true" />{copy.boot.sceneLabel}</p>
          <div className="boot-actions">
            <button className="button-primary" onClick={enterLab} type="button">{copy.boot.enter} <span aria-hidden="true">→</span></button>
          </div>
        </section>
        <div className="boot-language">
          <span>{copy.language.label}</span>
          <div className="boot-language-buttons">
            <button aria-label={copy.language.english} aria-pressed={language === "en"} onClick={() => changeLanguage("en")} type="button"><img alt="" height="18" src="https://flagcdn.io/flags/4x3/us.svg" width="24" /><span>EN</span></button>
            <button aria-label={copy.language.polish} aria-pressed={language === "pl"} onClick={() => changeLanguage("pl")} type="button"><img alt="" height="18" src="https://flagcdn.io/flags/4x3/pl.svg" width="24" /><span>PL</span></button>
          </div>
        </div>
        <DesktopOnlyNotice copy={copy} />
      </main>
    );
  }

  const visibleResult = result && !resultStale ? result : null;
  const biosphereLevel = visibleResult?.metrics.ecosystemPotential ?? 0;
  const survivability = result ? (result.finalPopulation === 0 ? 0 : result.metrics.organismCompatibility) : 0;
  const initialPopulation = result?.populationTimeline[0]?.population ?? 0;
  const failureExplanation = result &&
    (result.finalPopulation === 0 || result.finalPopulation < initialPopulation)
    ? formatFailureExplanation(result.failureReasons, worldContext, copy, language)
    : null;
  const lastParameterInfluence = lastParameterId
    ? deriveParameterControlState(
        PARAMETER_CONFIG.find(({ id }) => id === lastParameterId)!,
        planet.world,
        copy,
      ).influence
    : null;

  return (
    <main className="lab-shell">
      <DesktopOnlyNotice copy={copy} />
      <header className="lab-header">
        <div className="lab-brand">
          <Image alt="Xenogenesis Lab" className="lab-banner" height={64} priority src="/XenogenesisLabBanner.png" width={240} />
          <span>{copy.header.system}</span>
        </div>
        <div className="lab-header-actions">
          <div aria-label={copy.language.label} className="language-switch" role="group">
            <button aria-pressed={language === "en"} onClick={() => changeLanguage("en")} type="button">EN</button>
            <button aria-pressed={language === "pl"} onClick={() => changeLanguage("pl")} type="button">PL</button>
          </div>
          <button className="button-quiet compact tutorial-header-action" onClick={reopenOnboarding} type="button">{copy.onboarding.reopen}</button>
          <button aria-label={copy.header.clearData} className="button-quiet compact clear-data-action" onClick={clearLabData} type="button"><span aria-hidden="true">🗑</span><span className="clear-data-label">{copy.header.clearData}</span></button>
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
        {phase === "planet" && (
          <aside className={`lab-panel world-evidence-panel ${tutorialFocus("evidencePanel")}`} ref={evidencePanelRef}>
            <section className={`teaching-brief ${tutorialFocus("worldStory")}`} ref={worldStoryRef}><span>✦ {language === "pl" ? "Historia świata" : "World story"}</span><p>{worldStory(worldContext, language)}</p></section>
            <div className={tutorialFocus("worldEvidence")} ref={worldEvidenceRef}><WorldEvidence context={worldContext} copy={copy} language={language} phase="planet" /></div>
          </aside>
        )}
        {phase === "life" && (
          <aside className="lab-panel life-evidence-panel">
            <section className={`teaching-brief ${tutorialFocus("hypothesisStory")}`} ref={hypothesisStoryRef}><span>✦ {language === "pl" ? "Historia hipotezy" : "Hypothesis story"}</span><p>{lifeStory(worldContext, traitIds, copy, language)}</p></section>
            <div className={`life-facts ${tutorialFocus("lifeFacts")}`} ref={lifeFactsRef}>
              <span>🧬 {language === "pl" ? "Cechy" : "Traits"}<b>{traitIds.length}</b></span>
              <span>⚙️ {language === "pl" ? "Systemy ciała" : "Body systems"}<b>{traitIds.filter((id) => ["body", "physiology"].includes(LIFE_TRAITS[id].category)).length}</b></span>
              <span>👁️ {language === "pl" ? "Zmysły" : "Senses"}<b>{traitIds.filter((id) => LIFE_TRAITS[id].category === "senses").length}</b></span>
            </div>
            <section className={`life-readiness ${tutorialFocus("readiness")}`} ref={readinessRef}>
              <div><span>✦ {copy.life.readiness.title}</span><p>{copy.life.readiness.description}</p></div>
              <dl>
                <div className={readiness.water === "available" ? "ready" : "limited"}><dt>💧 {copy.life.readiness.water}</dt><dd>{copy.life.readiness[readiness.water]}</dd></div>
                <div className={readiness.energy === "available" ? "ready" : "limited"}><dt>⚗️ {copy.life.readiness.energy}</dt><dd>{copy.life.readiness[readiness.energy]}</dd></div>
                <div className={readiness.radiation === "manageable" ? "ready" : "limited"}><dt>🛡️ {copy.life.readiness.radiation}</dt><dd>{copy.life.readiness[readiness.radiation]}</dd></div>
              </dl>
            </section>
            <div className={tutorialFocus("lifeEvidence")} ref={lifeEvidenceRef}><WorldEvidence context={worldContext} copy={copy} language={language} phase="design" /></div>
          </aside>
        )}
        <section className={`planet-stage planet-stage-${phase} ${tutorialFocus("planetStage")}`} ref={planetStageRef}>
          <div className="planet-stage-header">
            <div>
              <p className="eyebrow">{phase === "life" ? copy.life.title : phase === "results" ? copy.simulation.title : copy.planet.liveView}</p>
              <span>{phase === "life" ? copy.life.previewHint : phase === "results" ? copy.simulation.populationTitle : copy.planet.visualTransition}</span>
            </div>
            {phase === "planet" && <div className="planet-visual-controls">
              <div className="planet-mode-switch" aria-label={copy.planet.viewMode} role="group">
                {(["realistic", "temperature", "radiation"] as PlanetVisualizationMode[]).map((mode) => (
                  <button aria-pressed={visualizationMode === mode} key={mode} onClick={() => setVisualizationMode(mode)} type="button">{copy.planet.modes[mode]}</button>
                ))}
              </div>
              <div className="planet-toolbar">
                <button className="button-quiet compact" onClick={() => setCameraResetSignal((value) => value + 1)} type="button">{copy.header.resetCamera}</button>
                <button className="button-quiet compact" onClick={() => setAutoRotate((value) => !value)} type="button">{autoRotate ? copy.header.rotationOn : copy.header.rotationOff}</button>
              </div>
              <div className="planet-control-hint" aria-live="polite">
                <span className="desktop-control-hint">{copy.planet.controlsDesktop}</span>
                <span className="mobile-control-hint">{copy.planet.controlsMobile}</span>
              </div>
            </div>}
          </div>

          {phase === "life" ? (
            <div className="lifeform-stage">
              <div className="lifeform-stage-hero">
                <OrganismPreview imageDataUrl={null} label={copy.organism.alt} planet={planet} traitIds={traitIds} />
                <p className="lifeform-stage-caption"><span className="status-dot" />{copy.organism.procedural} · {copy.life.previewHint}</p>
              </div>
              <div className="planet-inset">
                <ProceduralPlanet
                  autoRotate={false}
                  biosphereLevel={biosphereLevel}
                  cameraResetSignal={cameraResetSignal}
                  interactive={false}
                  label={copy.planet.liveView}
                  planet={planet}
                  regionScores={visibleResult?.regionScores}
                  visualizationMode={visualizationMode}
                />
              </div>
            </div>
          ) : phase === "results" ? (
            <div className="analysis-stage">
              <section className={`analysis-stage-hero ${result?.supportsAdvancedLife ? "success" : "continue"}`}>
                <p className="eyebrow">{copy.phases.results.label}</p>
                {result ? (
                  <>
                    <span>{result.supportsAdvancedLife ? copy.simulation.success : copy.simulation.continue}</span>
                    <h2>{copy.outcomes[result.outcome].title}</h2>
                    <p>{copy.outcomes[result.outcome].description}</p>
                    {failureExplanation && <p className="failure-explanation">⚠️ {failureExplanation}</p>}
                    <div className="objective-score"><div><span>{language === "pl" ? "Przeżywalność" : "Survivability"}</span><strong>{Math.round(survivability * 100)}%</strong></div><span><i style={{ width: `${survivability * 100}%` }} /></span></div>
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
                  autoRotate={false}
                  biosphereLevel={biosphereLevel}
                  cameraResetSignal={cameraResetSignal}
                  interactive={false}
                  label={copy.planet.liveView}
                  planet={planet}
                  regionScores={visibleResult?.regionScores}
                  visualizationMode={visualizationMode}
                />
              </div>
              <div className="analysis-organism-inset"><OrganismPreview imageDataUrl={null} label={copy.organism.alt} planet={planet} traitIds={traitIds} /></div>
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

          {phase === "planet" && visualizationMode !== "realistic" && (
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

        </section>

        <aside className={`lab-panel analysis-panel ${tutorialFocus("planetControls")}`} ref={planetControlsRef}>
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
              <section aria-label={copy.onboarding.progress} className="experiment-workflow">
                <span>{copy.onboarding.progress}</span>
                <ol>
                  {PHASES.map((item, index) => <li className={phase === item ? "active" : ""} key={item}><b>{index + 1}</b>{copy.phases[item].label}</li>)}
                </ol>
              </section>
              <div className="panel-section-heading">
                <div><p className="eyebrow">{copy.planet.baseline}</p><h2>{copy.planet.title}</h2></div>
              </div>
              <p className="panel-intro">{copy.planet.instruction}</p>
              <div className="planet-preset-actions">
                <button className="button-quiet compact preset-button" onClick={loadTemperateExperiment} type="button"><span aria-hidden="true">🌱</span>{copy.planet.loadTemperateExperiment}</button>
                <button className="button-quiet compact preset-button" onClick={restoreBaseline} type="button"><span aria-hidden="true">🌑</span>{copy.planet.resetBaseline}</button>
              </div>
              {lastParameterId && lastParameterInfluence && <section aria-live="polite" className="change-feedback"><strong>{copy.planet.changedEffect} · {copy.parameters[lastParameterId].label}</strong><p>{lastParameterInfluence}</p></section>}
              <div className={`parameter-list ${tutorialFocus("planetParameter")}`} ref={planetParameterRef}>
                {PARAMETER_CONFIG.map((parameter) => {
                  const parameterCopy = copy.parameters[parameter.id];
                  const controlState = deriveParameterControlState(parameter, planet.world, copy);
                  return <ParameterControl changed={lastParameterId === parameter.id} constraint={controlState.constraint} disabled={isSimulating || controlState.disabled} earthReference={parameterCopy.earthReference} emphasized={showOnboarding && ["pressure", "water", "temperature"].includes(parameter.id)} id={parameter.id} influence={controlState.influence} key={parameter.id} label={parameterCopy.label} language={language} max={controlState.max} min={controlState.min} onChange={(value) => updateParameter(parameter.id, value)} step={controlState.step} unit={parameterCopy.unit} value={controlState.value} />;
                })}
              </div>
              <button className={`button-primary wide ${tutorialFocus("chooseLife")}`} onClick={() => setPhase("life")} ref={chooseLifeRef} type="button">{copy.planet.openDesigner}<span aria-hidden="true">→</span></button>
            </div>
          )}

          {phase === "life" && (
            <div className="phase-content life-designer">
              <div className="phase-title-row">
                <div><p className="eyebrow">{copy.phases.life.label}</p><h2>{copy.life.title}</h2></div>
                <span className="status-chip">{traitIds.length} {copy.life.selected}</span>
              </div>
              <p className="panel-intro">{copy.life.instruction}</p>
              <section className="strategy-library">
                <div><span>✦ {copy.life.strategyLibrary}</span><p>{copy.life.strategyHint}</p></div>
                {viableArchetypes.length > 0 ? <div className="strategy-list">{viableArchetypes.map((archetype) => <button key={archetype.id} onClick={() => applyArchetype(archetype.traitIds)} type="button"><strong>{copy.life.strategies[archetype.id]}</strong><small>{archetype.traitIds.length} {copy.life.selected}</small><span>{copy.life.applyStrategy} →</span></button>)}</div> : <p className="strategy-unavailable">{copy.life.noStrategies}</p>}
              </section>
              <div className={tutorialFocus("lifeDropdown")} ref={lifeDropdownRef}>
                {TRAIT_CONFLICT_GROUPS.filter((group) => group.category === activeCategory).map((group) => (
                  <SingleChoiceTraitDropdown copy={copy} group={group} key={group.id} onSelect={selectSingleChoiceTrait} traitIds={traitIds} />
                ))}
              </div>
              <div className="trait-list">
                {(Object.values(LIFE_TRAITS).filter(({ category, id }) => category === activeCategory && !TRAIT_CONFLICT_GROUPS.some((group) => group.traitIds.includes(id)))).map((trait) => {
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
                        <span className="trait-title"><strong><span aria-hidden="true" className="trait-emoji">{TRAIT_EMOJIS[trait.id]}</span>{traitCopy.title}</strong></span>
                        <small><em>{copy.life.advantage}</em>{traitCopy.advantage}</small>
                        <small><em>{copy.life.tradeoff}</em>{traitCopy.tradeoff}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
              {traitNotice && <p aria-live="polite" className="form-notice">{copy.life[traitNotice]}</p>}
              <div className="category-tabs" role="tablist">
                {CATEGORIES.map((category) => (
                  <button aria-selected={activeCategory === category} key={category} onClick={() => setActiveCategory(category)} role="tab" type="button">{copy.categories[category]}</button>
                ))}
              </div>
              <div className={`phase-actions ${tutorialFocus("runSimulation")}`} ref={runSimulationRef}>
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
                  <section className={`outcome-card ${result.supportsAdvancedLife ? "success" : "continue"} ${tutorialFocus("resultOutcome")}`} ref={resultOutcomeRef}>
                    <span>{result.supportsAdvancedLife ? copy.simulation.success : copy.simulation.continue}</span>
                    <h3>{copy.outcomes[result.outcome].title}</h3>
                    <p>{copy.outcomes[result.outcome].description}</p>
                    {failureExplanation && <p className="failure-explanation">⚠️ {failureExplanation}</p>}
                    <div className="objective-score"><div><span>{language === "pl" ? "Przeżywalność" : "Survivability"}</span><strong>{Math.round(survivability * 100)}%</strong></div><span><i style={{ width: `${survivability * 100}%` }} /></span></div>
                  </section>
                  <div className="experiment-summary-action">
                    <button className="button-quiet wide" onClick={copyExperimentSummary} type="button">{copy.simulation.copySummary}</button>
                    {summaryCopyStatus !== "idle" && <p aria-live="polite" className={summaryCopyStatus === "error" ? "api-notice error" : "summary-copy-notice"}>{summaryCopyStatus === "copied" ? copy.simulation.summaryCopied : copy.simulation.summaryCopyFailed}</p>}
                  </div>

                  <section className={`result-section ${tutorialFocus("resultMetrics")}`} ref={resultMetricsRef}>
                    <h3>{copy.simulation.metricsTitle}</h3>
                    <div className="metric-list">
                      {METRIC_ORDER.map((metric) => (
                        <div className="metric-row" key={metric} title={copy.metrics[metric].description}>
                          <span><span aria-hidden="true" className="metric-emoji">{METRIC_EMOJIS[metric]}</span>{copy.metrics[metric].label}</span>
                          <i><b style={{ width: `${result.metrics[metric] * 100}%` }} /></i>
                          <strong>{Math.round(result.metrics[metric] * 100)}</strong>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className={`result-section ${tutorialFocus("resultRegions")}`} ref={resultRegionsRef}>
                    <h3>{copy.simulation.regionsTitle}</h3>
                    <div className="region-list">
                      {(Object.entries(result.regionScores) as Array<[RegionId, number]>).map(([region, score]) => (
                        <div className="region-card" key={region}>
                          <RegionBiomePreview context={worldContext} label={copy.regions[region].label} region={region} />
                          <span className="region-copy"><strong>{copy.regions[region].label}</strong><small>{copy.regions[region].description}</small></span>
                          <b>{Math.round(score * 100)}</b>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className={`result-section ${tutorialFocus("resultPopulation")}`} ref={resultPopulationRef}>
                    <h3>{copy.simulation.populationTitle}</h3>
                    <PopulationChart copy={copy} label={copy.simulation.populationTitle} language={language} result={result} />
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

                  <section className={`result-section organism-section ${tutorialFocus("organismPortrait")}`} ref={organismPortraitRef}>
                    <div className="result-section-heading"><h3>{copy.organism.title}</h3><span className="status-chip">{organismImage?.imageDataUrl ? copy.organism.generated : copy.organism.procedural}</span></div>
                    {organismImage?.imageDataUrl ? (
                      <button aria-label={copy.organism.openPreview} className="organism-image-open" onClick={() => setIsImagePreviewOpen(true)} type="button">
                        <OrganismPreview imageDataUrl={organismImage.imageDataUrl} label={copy.organism.alt} planet={planet} traitIds={traitIds} />
                      </button>
                    ) : <OrganismPreview imageDataUrl={null} label={copy.organism.alt} planet={planet} traitIds={traitIds} />}
                    {imageStatus === "fallback" && <p className="api-notice">{copy.organism.fallback}</p>}
                    {imageStatus === "error" && <p className="api-notice error">{copy.organism.error}</p>}
                    <button className="button-quiet wide" disabled={resultStale || imageStatus === "loading"} onClick={requestOrganismImage} type="button">{imageStatus === "loading" ? copy.organism.generating : copy.organism.requestImage}</button>
                    {organismImage?.imageDataUrl && <a className="button-quiet wide download-image" download={`xenogenesis-${result.stateHash}.jpeg`} href={organismImage.imageDataUrl}>{copy.organism.download}</a>}
                  </section>

                  <section className={`result-section consultant-section ${tutorialFocus("consultant")}`} ref={consultantRef}>
                    <div className="result-section-heading"><h3>{copy.consultant.title}</h3><span className="status-chip">{copy.status.ai}</span></div>
                    <p>{copy.consultant.description}</p>
                    {!consultant && consultantStatus !== "loading" && <button className="button-quiet wide" disabled={resultStale} onClick={requestConsultant} type="button">{consultantStatus === "error" ? copy.consultant.retry : copy.consultant.request}</button>}
                    {consultantStatus === "loading" && <div className="consultant-loading"><span /><p>{copy.consultant.loading}</p></div>}
                    {consultantStatus === "error" && <p className="api-notice error">{copy.consultant.temporaryUnavailable}</p>}
                    {consultant && (
                      <div className="consultant-report">
                        <div className="consultant-source"><span className="status-dot" /><strong>{consultant.source === "gpt-5.6" ? copy.consultant.liveSource : copy.consultant.localSource}</strong></div>
                        {consultant.source === "local-fallback" && <p className="api-notice error">{copy.consultant.temporaryUnavailable}</p>}
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
      {isImagePreviewOpen && organismImage?.imageDataUrl && (
        <div aria-label={copy.organism.openPreview} aria-modal="true" className="image-fullscreen" onMouseDown={() => setIsImagePreviewOpen(false)} role="dialog">
          <div className="image-fullscreen-content" onMouseDown={(event) => event.stopPropagation()}>
            <button aria-label={copy.organism.closePreview} className="image-fullscreen-close" onClick={() => setIsImagePreviewOpen(false)} type="button">×</button>
            <Image alt={copy.organism.alt} height={1024} priority src={organismImage.imageDataUrl} unoptimized width={1536} />
          </div>
        </div>
      )}
      {showOnboarding && screen === "lab" && (() => {
        const stepCopy = copy.onboarding.steps[activeTutorialStep.id];
        return <>
          <div aria-hidden="true" className="tutorial-overlay" />
          <section aria-label={stepCopy.title} aria-live="polite" className="tutorial-card">
            <span>{copy.onboarding.progress} · {onboardingStepIndex + 1}/{TUTORIAL_STEPS.length}</span>
            <h2>{stepCopy.title}</h2>
            <p>{stepCopy.description}</p>
            <div>
              <div className="tutorial-card-actions-secondary">
                <button className="text-button" onClick={dismissOnboarding} type="button">{copy.onboarding.dismiss}</button>
                {onboardingStepIndex > 0 && <button className="text-button" onClick={retreatOnboarding} type="button">← {copy.onboarding.previous}</button>}
              </div>
              <button className="button-primary compact" onClick={activeTutorialStep.id === "runSimulation" ? runSimulation : advanceOnboarding} type="button">{activeTutorialStep.id === "runSimulation" ? copy.life.run : onboardingStepIndex === TUTORIAL_STEPS.length - 1 ? copy.onboarding.finish : copy.onboarding.next}<span aria-hidden="true">→</span></button>
            </div>
          </section>
        </>;
      })()}
      <footer className="lab-footer">{copy.footer}</footer>
    </main>
  );
}

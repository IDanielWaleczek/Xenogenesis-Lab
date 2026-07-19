# Xenogenesis Lab — Architecture

## Current implementation

The repository contains a Next.js 16.2.10 / React 19.2.4 application, Tailwind CSS 4, TypeScript, Zod 4, the official OpenAI JavaScript SDK, and Vitest domain tests. One Vespera baseline supports validated learner variants, deterministic visual-state mapping, four deterministic pressure rules, structured-decision comparison, adaptation candidates, a server-only Mission Instructor route, multiple-choice revision, and session-only competency progress.

`POST /api/instructor` validates the committed world variant and decisions, re-runs that exact deterministic simulation on the server, and validates the response. With `OPENAI_API_KEY`, it requests a structured response from the `gpt-5.6` alias through the Responses API. Without a usable live response, it returns a Zod-validated local fallback with explicit provenance. No credentials are sent to the client.

Image generation, database persistence, accounts, a mission library, and durable certification are not implemented.

## Target mission flow

```text
System boot → Mission Control → mission briefing
→ immutable mission baseline + learner world variant
→ Zod validation
→ deterministic visual-state mapping for the live planet preview
→ committed learner pressure, adaptation, and strategy decisions
→ deterministic rules engine
→ validated SimulationResult
→ pressure and organism inspection
→ GPT-5.6 instructor request
→ validated MissionDebrief
→ multiple-choice evidence revision and competency update
→ research-archive record
```

Image generation is a separate, optional representation flow from validated organism data. It must not modify the simulation result or instructor assessment.

## Module boundaries

### Mission and world input

Owns scenario objectives, immutable baseline telemetry, experimental parameter collection, structured-decision validation, and client-side non-authoritative validation.

### Planet visualisation

`src/domain/mission/visualization.ts` maps every validated world input to deterministic presentation values used by the SVG planet. It owns aesthetic interpolation only. It is not the science engine and cannot emit pressures, adaptations, viability, shielding attenuation, or energy-pathway conclusions.

### Deterministic rules engine

Owns environmental calculations, biological constraints, adaptation scoring, scientific coefficients, ruleset versioning, and reproducible `SimulationResult` output. It must not call model or image services.

### Instructor integration

Receives only validated mission context, the learner’s committed structured decisions, and deterministic output. It builds a versioned structured request for GPT-5.6, validates the response with Zod, and returns instructional—not authoritative scientific—content.

### Illustration integration

Builds a controlled visual prompt from validated organism data. It handles service failures separately and cannot add or change calculated adaptations.

### Progress and archive

Stores completed exercise data, evidence-based revisions, competency measurements, and provenance. It must not award progress for unrelated clicks or decorative activity.

### Presentation

Renders boot, Mission Control home, briefing, World Lab, structured decisions, simulation state, provenance-labelled results, debrief, revision, archive, and accessible recovery states. UI components must not contain scientific calculations or privileged credentials.

## Validation and provenance

Validate every external boundary with Zod: world input, mission definition, hypothesis, simulation request and result, GPT request and response, illustration request, and persisted archive record.

Every displayed claim must retain one of these sources:

- **Learner decisions:** the committed pressure, adaptation, and strategy predictions.
- **Calculated result:** deterministic output with a ruleset version.
- **AI interpretation:** GPT-5.6 instructional content tied to that output.
- **Visual interpretation:** the code-rendered planet mapping derived from world inputs; not scientific evidence.
- **Generated illustration:** a future image grounded in validated organism data.

## Implemented data contracts

```ts
type CommittedHypothesis = {
  missionId: "vespera-01";
  world: WorldParameters;
  pressureIds: PressureId[];
  adaptationIds: AdaptationId[];
  strategy: SurvivalStrategy;
  committedAt: string;
};

type SimulationResult = {
  missionId: "vespera-01";
  rulesetVersion: "0.2.0";
  viability: "conditionallyPlausibleComplexLife";
  normalizedFacts: NormalizedFacts;
  pressures: EnvironmentalPressure[];
  adaptationCandidates: AdaptationCandidate[];
};

type MissionDebrief = {
  assessment: string;
  evidence: string[];
  tradeOffs: string[];
  followUpQuestion?: string;
  recommendedExperiment?: string;
};
```

The exact Zod schemas are exported from `src/domain/mission/schema.ts`. The current viability value is scoped only to Mission 01 and its validated variants; it is not a general viability engine.

## Client and server boundary

The client may collect input, provide non-authoritative validation, show results, and manage local state. It must not define scientific rules, contain API keys, call privileged endpoints directly, or trust raw model output.

The server owns final validation, deterministic recalculation, model calls, output validation, safe fallback behavior, and secret management. Rate limiting, persistent user identity, and production observability are **TODOs** before public scale.

## Failure handling

Keep input after a failure. Distinguish invalid input, unsupported conditions, deterministic simulation failure, GPT failure, malformed model response, image failure, rate limit, and network failure. Explain the failed stage without exposing stack traces, prompts, or secrets, and allow a safe retry only where appropriate.

## Deployment

Vercel and GitHub deployment integration are documented as intended infrastructure, not confirmed current deployment configuration. **TODO:** verify the production target, environment variables, rate limiting, logging, and deployment-to-HEAD status before submission.

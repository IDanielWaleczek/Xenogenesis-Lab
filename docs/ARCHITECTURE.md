# Xenogenesis Lab — Architecture

## Current implementation

The repository currently contains a Next.js 16.2.10 / React 19.2.4 prototype, Tailwind CSS 4, TypeScript, Zod 4 world-parameter validation and normalization, and Vitest domain tests. It does not currently contain a viability engine, route handlers, OpenAI SDK integration, image generation, persistence, or progression.

Planned server-side capabilities must be implemented in the same Next.js App Router application. OpenAI credentials must remain server-side.

## Target mission flow

```text
Mission definition + world parameters
→ Zod validation
→ committed learner hypothesis
→ deterministic rules engine
→ validated SimulationResult
→ pressure and organism inspection
→ GPT-5.6 instructor request
→ validated MissionDebrief
→ evidence-based revision and competency update
→ research-archive record
```

Image generation is a separate, optional representation flow from validated organism data. It must not modify the simulation result or instructor assessment.

## Module boundaries

### Mission and world input

Owns scenario objectives, parameter collection, example worlds, hypothesis validation, and client-side non-authoritative validation.

### Deterministic rules engine

Owns environmental calculations, biological constraints, adaptation scoring, scientific coefficients, ruleset versioning, and reproducible `SimulationResult` output. It must not call model or image services.

### Instructor integration

Receives only validated mission context, the learner’s committed hypothesis, and deterministic output. It builds a versioned structured request for GPT-5.6, validates the response with Zod, and returns instructional—not authoritative scientific—content.

### Illustration integration

Builds a controlled visual prompt from validated organism data. It handles service failures separately and cannot add or change calculated adaptations.

### Progress and archive

Stores completed exercise data, evidence-based revisions, competency measurements, and provenance. It must not award progress for unrelated clicks or decorative activity.

### Presentation

Renders Mission Control, briefing, hypothesis entry, simulation state, provenance-labelled results, debrief, revision, archive, and accessible recovery states. UI components must not contain scientific calculations or privileged credentials.

## Validation and provenance

Validate every external boundary with Zod: world input, mission definition, hypothesis, simulation request and result, GPT request and response, illustration request, and persisted archive record.

Every displayed claim must retain one of these sources:

- **User hypothesis:** the learner’s committed prediction.
- **Calculated result:** deterministic output with a ruleset version.
- **AI interpretation:** GPT-5.6 instructional content tied to that output.
- **Visual representation:** a generated image grounded in validated organism data.

## Target data contracts

```ts
type CommittedHypothesis = {
  missionId: string;
  reasoning: string;
  predictedAdaptations: string[];
  committedAt: string;
};

type SimulationResult = {
  rulesetVersion: string;
  normalizedEnvironment: NormalizedWorldParameters;
  viability: ViabilityAssessment;
  pressures: EnvironmentalPressure[];
  constraints: BiologicalConstraint[];
  adaptationCandidates: AdaptationCandidate[];
  warnings: string[];
};

type MissionDebrief = {
  assessment: string;
  evidence: string[];
  tradeOffs: string[];
  followUpQuestion?: string;
  recommendedExperiment?: string;
};
```

`SimulationResult`, `ViabilityAssessment`, `EnvironmentalPressure`, `BiologicalConstraint`, and `AdaptationCandidate` are target contracts until their implementation exists. Do not present them as exported code.

## Client and server boundary

The client may collect input, provide non-authoritative validation, show results, and manage local state. It must not define scientific rules, contain API keys, call privileged endpoints directly, or trust raw model output.

The server owns final validation, deterministic calculations, model and image calls, output validation, rate limiting, error handling, and secret management. Route handlers must import server-only code.

## Failure handling

Keep input after a failure. Distinguish invalid input, unsupported conditions, deterministic simulation failure, GPT failure, malformed model response, image failure, rate limit, and network failure. Explain the failed stage without exposing stack traces, prompts, or secrets, and allow a safe retry only where appropriate.

## Deployment

Vercel and GitHub deployment integration are documented as intended infrastructure, not confirmed current deployment configuration. **TODO:** verify the production target, environment variables, rate limiting, logging, and deployment-to-HEAD status before submission.

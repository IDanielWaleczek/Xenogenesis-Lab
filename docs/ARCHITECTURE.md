# Xenogenesis Lab — Architecture

## Current implementation

Xenogenesis Lab is one full-stack Next.js 16 App Router application written in TypeScript. React owns the interactive laboratory, React Three Fiber owns the persistent WebGL scene, deterministic domain modules own science and population output, and server-only route handlers own OpenAI calls. Zod validates every external boundary.

The application is designed for Vercel deployment from GitHub. DNS may remain at GreenGeeks or OVH, but GreenGeeks EcoSite Lite is not an application runtime.

## Runtime data flow

```text
Deterministic baseline seed + WorldParameters
        │
        ├── learner changes validated planet state
        │       ├── shader target derivation → interpolated WebGL uniforms
        │       └── life-trait selection → conflict validation + procedural anatomy
        │
        └── Run simulation
                ├── normalize physical inputs
                ├── calculate 11 continuous suitability metrics
                ├── calculate six regional scores
                ├── apply strict viability gate
                ├── run 200-step population + event model (presented as model years in the UI)
                └── validate SurvivalSimulationResult + stable hash
                        │
                        ├── local charts, markers, outcome, organism SVG
                        ├── POST /api/consultant
                        │       ├── validate request
                        │       ├── re-run deterministic model on server
                        │       ├── GPT-5.6 structured interpretation
                        │       └── Zod response or labelled local fallback
                        └── POST /api/organism-image
                                ├── validate and re-run model
                                ├── reuse consultant result
                                ├── construct controlled image prompt
                                └── gpt-image-2 data URL or procedural fallback
```

No AI request occurs during rendering, rotation, parameter editing, or deterministic simulation.

## Module boundaries

### World contract — `src/domain/world/`

Owns authoritative physical inputs, units, atmospheric-fraction validation, radiation normalization, symmetric temperature range, oxygen partial pressure, local ideal-gas density, conservative geochemical pathway detection, preference-preserving control updates, and phase-dependent consequences. `engineering.ts` applies one user change without erasing other preferences. `interactions.ts` derives atmospheric presence, a gravity-limited `0–5 atm` effective pressure, pressure-dependent boiling, continuous ice/liquid/vapor shares, effective humidity including the documented fully-liquid-ocean evaporation floor, and cloud potential. `visualization.ts` converts only those derived facts into renderer targets.

It does not infer radiation shielding, electron acceptors, molar mass, or alternative energy from a habitat label.

### Simulator — `src/domain/simulator/`

- `schema.ts` defines the trait, request, result, consultant, and illustration contracts.
- `mission.ts` contains the immutable baseline seed and barren starting state.
- `traits.ts` centralizes 44 trait definitions, conflicts, tradeoff metadata, and modifiers. Trait costs remain descriptive tuning metadata but no longer impose a selection budget.
- `simulate.ts` calculates continuous metrics, representative regions, population, outcome, success, and stable hash.
- `consultant.ts` builds the local fallback and final controlled image prompt.

The simulator has no React, Three.js, OpenAI, route, or persistence dependency.

### Procedural rendering — `src/components/planet/` and `src/shaders/`

The planet uses one persistent scene and seeded sphere geometry. Custom GLSL implements deterministic value noise and FBM for continents, elevation, ridges, local moisture, phase-derived ice/water masks, dry sand, thermally altered or molten basaltic rock, white-grey clouds or steam, radiation exposure, biosphere patches, polar auroral ovals, a procedurally animated stellar photosphere and corona, and a shared world-space sun direction for day/night shading. The stellar shader is a presentation layer only; it does not change stellar energy or any simulation result. A deterministic Three.js point field places stars on large world-space shells, so camera movement changes their apparent positions instead of pinning them to screen pixels. The cloud sphere clears maximum displaced terrain elevation instead of intersecting the surface. Ice requires nonzero exposed water. The water layer reserves `0–10%` inventory for visible drainage, starts larger inland bodies at `10%`, retains continental land through the slower `25–100%` shoreline curve, and reaches a full shell only at `100%`; terrain depth testing exposes only flooded areas at intermediate inventories. Terrain, water, and rivers use the same curved latitude-plus-local-terrain temperature convention, constrained by the globally available phase inventory. Gravity immediately caps effective atmospheric pressure, which propagates to gas partial pressure, density, water stability, humidity, clouds, and aurora support; the stored pressure preference is preserved. Vacuum immediately removes exposed water, clouds, atmosphere, atmospheric rim light, and auroras; the radiation shell appears only in its labelled scientific mode. The `−273…1800°C` mean-temperature range introduces a documented basaltic melt transition at `780–1050°C`.

React state changes only update target values. `useFrame` interpolates external Three.js shader uniforms and rotation without React state updates. Terrain geometry is not regenerated for slider changes. Native range inputs move immediately and coalesce world-state commits to at most one per animation frame, preventing pointer-event floods from making the thumb lag behind. Water, cloud, and atmosphere are separate coordinated layers. Region markers visualize deterministic result scores.

This layer owns presentation only. It cannot produce habitability or population facts.

### Presentation — `src/app/page.tsx` and `src/components/life/`

The client keeps one laboratory workspace state: language, phase, planet, traits, visualization mode, latest result, previous result, AI states, and fallback image. The cinematic intro uses the same WebGL renderer as the laboratory to display two non-interactive, slowly rotating parameter-backed worlds in a shared star field. Design Life starts with no traits; its central organism renderer always derives terrain, water, ice, atmosphere, light, and heat from the engineered planet. Plain-language world and life summaries consume deterministic context and selected traits only. Planet scientific modes and camera controls appear only in Planet Engineering. Analyze centres survival evidence, a 200-step event timeline labelled as model years for readability, and contextual planet/organism views without exposing irrelevant renderer controls. Generated images retain a 3:2 frame and can be downloaded locally.

`src/app/copy.ts` is a compile-time checked English/Polish dictionary covering visible and accessible text. New UI text must be added and reviewed in both languages.

### Server-only OpenAI services — `src/server/`

`life-consultant.ts` calls the Responses API with the `gpt-5.6` alias, `reasoning.effort: "none"`, and a Zod structured-output format. It receives only validated state and server-recalculated output.

`organism-image.ts` calls the Image API with `gpt-image-2`. GPT output cannot provide a free-form final prompt: it selects a strict `imageDirection` object, and the server combines those enums with deterministic world facts and selected trait IDs.

Both services use process-local `Map` caches keyed by a stable hash. This avoids duplicate calls in one process but is not durable or globally shared on Vercel.

### Route handlers — `src/app/api/`

- `POST /api/consultant`
- `POST /api/organism-image`

Credentials remain server-side. Routes return generic public errors, never prompts, keys, provider stack traces, or internal exception details.

## Implemented data contracts

Simplified shapes; exact Zod schemas are in `src/domain/simulator/schema.ts`.

```ts
type PlanetState = {
  seed: string;
  world: WorldParameters;
};

type SurvivalSimulationRequest = {
  missionId: "genesis-01";
  planet: PlanetState;
  traitIds: LifeTraitId[];
  initialPopulation: number;
};

type SurvivalSimulationResult = {
  simulatorVersion: "1.7.0";
  stateHash: string;
  outcome: SimulationOutcome;
  missionSuccess: boolean;
  objectiveScore: number;
  metrics: Record<SimulationMetricId, number>;
  regionScores: Record<RegionId, number>;
  populationTimeline: Array<{ generation: number; population: number }>;
  populationEvents: Array<{ id: PopulationEventId; generation: number; kind: "pressure" | "opportunity"; impactFraction: number }>;
  carryingCapacity: number;
  peakPopulation: number;
  finalPopulation: number;
};

type ImageDirection = {
  pose: "resting" | "foraging" | "moving" | "social";
  viewpoint: "field-profile" | "three-quarter" | "environment-wide";
  lighting: "diffuse" | "low-angle" | "backlit";
  emphasis: "anatomy" | "adaptation" | "habitat";
};
```

## Trust and provenance

| Source | May own | Must not own |
| --- | --- | --- |
| Learner state | world choices and trait selection | calculated facts |
| Deterministic simulator | scores, population, outcome, success | narrative or art |
| WebGL renderer | interpolated visual interpretation | scientific conclusions |
| GPT-5.6 consultant | explanation, naming, experiment suggestion, constrained art direction | scores or outcome |
| Image model | final pixels | anatomy requirements or simulation facts |
| Local fallback | deterministic templated explanation | claim to be GPT output |

External and model output is untrusted until Zod validation. The server recomputes the simulation instead of accepting client-provided results.

## Failure behavior

- Invalid route input returns HTTP 400.
- Unexpected server failures return HTTP 500 with generic text.
- Missing or failing GPT credentials produce a validated response with `source: "local-fallback"`.
- Missing or failing image generation returns `source: "procedural-fallback"` and no image data.
- A later AI or image failure never removes the deterministic result or procedural organism.
- Changing world or traits marks the displayed calculation stale and requires an explicit re-run.

## Performance choices

- dynamic client import for the WebGL scene;
- one seeded geometry allocation per scene rather than per slider change;
- shader uniform interpolation instead of texture regeneration;
- no React state writes in the frame loop;
- capped device pixel ratio of 1.5;
- local deterministic feedback before optional network requests;
- request caches keyed by stable state;
- no production dependency beyond the libraries needed for this vertical slice.

## Deployment and production TODOs

- verify Vercel production serves repository HEAD;
- configure `OPENAI_API_KEY` only in server environment variables;
- verify live GPT-5.6 and `gpt-image-2` requests;
- add rate limiting, abuse protection, timeout policy, and observability;
- decide whether generated data URLs should move to object storage;
- pin a supported Node.js version;
- monitor the two moderate PostCSS findings currently inherited through Next.js; npm reports no available fix;
- add persistence only if save/share becomes submission-critical.

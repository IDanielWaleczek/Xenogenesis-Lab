# Xenogenesis Lab — Architecture

## Current implementation

Xenogenesis Lab is one full-stack Next.js 16 App Router application written in TypeScript. React owns the interactive laboratory, React Three Fiber owns the persistent WebGL scene, deterministic domain modules own science and population output, and server-only route handlers own OpenAI calls. Zod validates every external boundary.

The application is designed for Vercel deployment from GitHub. DNS may remain at GreenGeeks or OVH, but GreenGeeks EcoSite Lite is not an application runtime.

## Runtime data flow

```text
Genesis mission seed + baseline WorldParameters
        │
        ├── learner changes validated planet state
        │       ├── shader target derivation → interpolated WebGL uniforms
        │       └── life-trait selection → cost/conflict validation
        │
        └── Run simulation
                ├── normalize physical inputs
                ├── calculate 11 continuous suitability metrics
                ├── calculate six regional scores
                ├── run 40-generation population model
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

Owns authoritative physical inputs, units, atmospheric-fraction validation, radiation normalization, symmetric temperature range, oxygen partial pressure, local ideal-gas density, and conservative geochemical pathway detection.

It does not infer radiation shielding, electron acceptors, molar mass, or alternative energy from a habitat label.

### Simulator — `src/domain/simulator/`

- `schema.ts` defines the mission, trait, request, result, consultant, and illustration contracts.
- `mission.ts` contains the immutable Vespera 7A seed and baseline.
- `traits.ts` centralizes 33 trait definitions, costs, conflicts, and modifiers.
- `simulate.ts` calculates continuous metrics, representative regions, population, outcome, success, and stable hash.
- `consultant.ts` builds the local fallback and final controlled image prompt.

The simulator has no React, Three.js, OpenAI, route, or persistence dependency.

### Procedural rendering — `src/components/planet/` and `src/shaders/`

The planet uses one persistent scene and seeded sphere geometry. Custom GLSL implements deterministic value noise and FBM for continents, elevation, ridges, local moisture, biome masks, continuous ice, water masks, lava channels, clouds, radiation heatmaps, biosphere patches, schematic magnetic flux lines, conditional polar auroras, and a shared world-space sun direction for day/night shading. The water layer maps zero available water to no visible surface water and full available water to an aquatic shell. Vacuum removes water, cloud, atmosphere, and aurora layers. Gravity no longer changes terrain geometry because the supplied input alone cannot justify a geology mapping.

React state changes only update target values. `useFrame` interpolates external Three.js shader uniforms and rotation without React state updates. Terrain geometry is not regenerated for slider changes. Water, cloud, and atmosphere are separate coordinated layers. Region markers visualize deterministic result scores.

This layer owns presentation only. It cannot produce habitability or population facts.

### Presentation — `src/app/page.tsx` and `src/components/life/`

The client keeps one mission’s current state: language, phase, planet, traits, visualization mode, inspection, latest result, previous result, AI states, and fallback image. It caps editable humidity by available water and runs the same pure deterministic simulator for immediate results. The phase layout centers the planet, organism, or analysis according to the current task while retaining a contextual planet view.

`src/app/copy.ts` is a compile-time checked English/Polish dictionary covering visible and accessible text. New UI text must be added and reviewed in both languages.

### Server-only OpenAI services — `src/server/`

`life-consultant.ts` calls the Responses API with the `gpt-5.6` alias, low reasoning effort, and a Zod structured-output format. It receives only validated state and server-recalculated output.

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
  simulatorVersion: "1.0.0";
  stateHash: string;
  outcome: SimulationOutcome;
  missionSuccess: boolean;
  objectiveScore: number;
  metrics: Record<SimulationMetricId, number>;
  regionScores: Record<RegionId, number>;
  populationTimeline: Array<{ generation: number; population: number }>;
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

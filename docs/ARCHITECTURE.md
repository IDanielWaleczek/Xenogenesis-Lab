# Xenogenesis Lab — Architecture

## Current stack

- Application: a single full-stack Next.js project using the App Router
- Frontend: Next.js 16.2.10 with React 19.2.4
- Backend: Next.js server-side route handlers in the same application
- Language: TypeScript
- Styling: Tailwind CSS 4
- Validation: Zod 4 at all external boundaries
- Testing: Vitest 4 for deterministic domain and schema tests
- AI: OpenAI API with GPT-5.6, called only from server-side route handlers
- Image generation: OpenAI Image API, called only from server-side route handlers
- Deployment: Vercel
- Source control and automatic deployments: GitHub connected to Vercel
- Domain and DNS: may remain with GreenGeeks or OVH
- Runtime constraint: GreenGeeks EcoSite Lite must never host the Node.js runtime
- Package manager: npm

Update this section whenever a major dependency or platform changes.

## System overview

Xenogenesis Lab separates deterministic scientific logic from AI-generated
interpretation.

Main pipeline:

```text
World parameters
→ input validation
→ deterministic rules engine
→ structured organism constraints
→ GPT-5.6 organism dossier
→ image prompt generation
→ scientific illustration
→ user interface
```

## Main modules

### World configuration

Responsible for:

- collecting environmental parameters
- validating input ranges
- normalizing units
- loading example worlds

### Rules engine

Responsible for:

- calculating environmental pressures
- deriving biological constraints
- scoring plausible adaptations
- producing reproducible structured output

This module must not call GPT or image-generation services.

### Organism schema

Defines the shared structure for:

- environmental analysis
- adaptation constraints
- organism traits
- GPT-generated dossier
- image-generation prompt

### GPT integration

Responsible for:

- receiving validated rules-engine output
- constructing a controlled prompt
- requesting structured output
- validating the response
- returning an educational organism dossier

### Image generation

Responsible for:

- converting validated organism data into a visual prompt
- calling the image-generation API
- returning the generated illustration
- handling refusals and generation errors

### User interface

Responsible for:

- world configuration
- simulation progress
- displaying environmental pressures
- displaying the organism dossier
- displaying the illustration
- presenting clear errors and recovery actions

## Data flow

1. The user configures the world.
2. The client validates basic input.
3. The server validates the request again.
4. The deterministic rules engine processes the environment.
5. The server sends validated constraints to GPT-5.6.
6. GPT-5.6 returns structured organism data.
7. The server validates the model output.
8. A separate request creates the image prompt and illustration.
9. The client displays the complete result.

## Client and server boundaries

### Client

The client may:

- collect user input
- perform non-authoritative validation
- display simulation results
- manage local interface state

The client must not:

- contain OpenAI API keys
- call privileged OpenAI endpoints directly
- define authoritative scientific rules
- trust model output without server validation

### Server

The server owns:

- final request validation
- deterministic calculations
- OpenAI API communication
- structured-output validation
- rate limiting and error handling
- secret management

Server-side capabilities must be implemented as Next.js route handlers in
this project. They must import server-only code and read OpenAI credentials
only from server environment variables. Client components may call these
handlers, but must never import the OpenAI SDK or receive credentials.

## Input schema

The simulation input should include:

```ts
type WorldParameters = {
  gravityG: number;
  atmosphericPressureAtm: number;
  atmosphereComposition: {
    oxygenFraction: number;
    carbonDioxideFraction: number;
    nitrogenFraction: number;
    inertGasFraction: number;
    toxicGasFraction: number;
  };
  averageTemperatureC: number;
  temperatureVariationC: number;
  radiationDoseRate: { value: number; unit: "mSv/h" | "Sv/h" };
  lightLevel: number;
  waterAvailability: number;
  habitat: Habitat;
  shieldingColumnMassKgM2: number;
  geochemicalEnergyAvailability: "none" | "low" | "moderate" | "high";
  electronAcceptors: ElectronAcceptor[];
  atmosphericMeanMolarMassKgPerMol?: number;
};
```

The source radiation value and unit are retained. The server derives
`radiationDoseRateMilliSvPerHour`, the symmetric temperature range, oxygen
partial pressure, and—when a mean molar mass is supplied—local atmospheric
density. Exact ranges and scientific conventions are defined in
`SCIENCE_RULES.md`.

## Output schema

The deterministic engine should return:

```ts
type SimulationResult = {
  rulesetVersion: string;
  normalizedEnvironment: NormalizedWorldParameters;
  viability: ViabilityAssessment;
  pressures: EnvironmentalPressure[];
  constraints: BiologicalConstraint[];
  adaptationCandidates: AdaptationCandidate[];
  warnings: string[];
};
```

The GPT layer should return a validated organism dossier containing:

- name
- overview
- habitat
- morphology
- metabolism
- locomotion
- senses
- reproduction
- adaptations
- limitations
- environmental explanation

## Error handling

Errors should be divided into:

- invalid user input
- unsupported environmental combination
- deterministic simulation failure
- GPT request failure
- malformed GPT response
- image-generation failure
- rate-limit or quota failure
- network failure

The user should receive:

- a clear explanation
- a safe retry action
- preserved input where possible
- no raw stack trace or secret information

## Deployment

Vercel is the production runtime for the Next.js application. GitHub is the
source-control system and the source of automatic deployments. GreenGeeks or
OVH may provide DNS and domain management only; GreenGeeks EcoSite Lite is
not a supported Node.js hosting target for this application.

Deployment must provide:

- secure server-side environment variables
- production build verification
- HTTPS
- request logging without sensitive prompt data
- API rate limiting
- health-check endpoint if supported
- reproducible environment configuration

Current deployment target:

```text
Platform: Vercel
Source control and deployments: GitHub → Vercel
Domain and DNS: GreenGeeks
Production URL: [add URL]
```

# Xenogenesis Lab — Architecture

## Current stack

- Frontend: [framework and version]
- Backend: [framework or API runtime]
- Language: TypeScript
- Styling: [CSS solution]
- Validation: [schema library]
- Testing: [test frameworks]
- AI: OpenAI API with GPT-5.6
- Image generation: OpenAI Image API
- Deployment: [platform]
- Package manager: [npm / pnpm / yarn]

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

## Input schema

The simulation input should include:

```ts
type WorldParameters = {
  gravityG: number;
  atmosphericPressureAtm: number;
  averageTemperatureC: number;
  temperatureVariationC: number;
  radiationLevel: number;
  lightLevel: number;
  waterAvailability: number;
  habitat: string;
  atmosphereComposition: Record<string, number>;
};
```

Exact types and ranges are defined in `SCIENCE_RULES.md`.

## Output schema

The deterministic engine should return:

```ts
type SimulationResult = {
  rulesetVersion: string;
  normalizedEnvironment: WorldParameters;
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

Deployment should provide:

- secure server-side environment variables
- production build verification
- HTTPS
- request logging without sensitive prompt data
- API rate limiting
- health-check endpoint if supported
- reproducible environment configuration

Current deployment target:

```text
Platform: [add platform]
Production URL: [add URL]
```
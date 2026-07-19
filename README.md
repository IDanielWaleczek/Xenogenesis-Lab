# Xenogenesis Lab

> An AI-guided astrobiology mission-training simulator for practising evidence-based reasoning about plausible alien life.

[Live application](https://www.danielwaleczek.com) · [Source repository](https://github.com/IDanielWaleczek/Xenogenesis-Lab) · [MIT License](LICENSE)

## What it does

Xenogenesis Lab places the learner in a fictional xenobiology training programme. The working build boots like a mission computer, opens Mission Control, and guides the learner through one Vespera exercise. The learner creates a resettable planetary variant, watches a smoothly changing code-rendered planet, commits multiple-choice pressure, adaptation, and strategy decisions, runs a deterministic simulation, receives a validated instructor debrief, and completes a session-only competency record.

The interface keeps provenance visibly separate: mission baseline, learner variant, committed decisions, visual interpretation, calculated result, GPT-5.6 interpretation, and deterministic local fallback.

## Working features

- Animated boot sequence and a dedicated Mission Control home screen.
- One complete English/Polish Vespera b training mission with explicit first-use guidance.
- Experimental world variants with controls for gravity, local atmosphere, temperature, radiation, light, water, habitat, shielding, and geochemical inputs.
- Smooth hybrid scientific/cinematic planet visualisation derived deterministically from the current inputs.
- Committed multiple-choice pressure, adaptation, and survival-strategy decisions; no written hypothesis is required.
- Deterministic ruleset 0.2.0 covering high gravity, thermal extremes, elevated radiation, and limited water.
- Reproducible pressure analysis, adaptation candidates, and hypothesis comparison.
- Server-only Mission Instructor route using the OpenAI Responses API and Zod Structured Outputs.
- Clearly labelled deterministic instructor fallback when GPT-5.6 is unavailable.
- Multiple-choice evidence revision and session-only competency scoring.
- Responsive, keyboard-accessible mission-console interface.

The application does not currently include image generation, persistent accounts or archives, a mission library, durable certification, rate limiting, or production observability. The next mission is explicitly marked `TODO` in the interface.

## How the mission works

```text
Animated boot → Mission Control
→ mission briefing
→ experimental world setup and live visual interpretation
→ committed multiple-choice decisions
→ deterministic simulation
→ pressure and adaptation analysis
→ validated Mission Instructor debrief
→ evidence-based multiple-choice revision
→ session competency progress
→ next mission TODO
```

The mission baseline is immutable telemetry; learner changes create a separate locked experiment. The deterministic engine owns environmental facts and adaptation candidates. GPT-5.6 may evaluate and explain the learner’s structured decisions, but it cannot change calculated output. If the API key is absent or the model request fails validation, the route returns a local deterministic review that is never presented as AI output.

The animated planet is a visual interpretation, not a photograph, simulation result, or habitability claim. It changes with the validated inputs but does not add scientific rules.

## Technology

- Next.js 16.2.10 with App Router
- React 19.2.4
- TypeScript
- Tailwind CSS 4
- Zod 4
- OpenAI JavaScript SDK and Responses API
- Vitest
- Intended deployment: Vercel from GitHub

Domain logic lives under `src/domain/`; the client mission flow lives under `src/app/`; the server-only OpenAI integration lives under `src/server/` and is exposed through `src/app/api/instructor/route.ts`.

## Run locally

### Prerequisites

- Node.js — **TODO:** pin and document the supported production version.
- npm.

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Run tests and linting:

```bash
npm test
npm run lint
```

Build and run the production build locally:

```bash
npm run build
npm run start
```

The production server also opens on [http://localhost:3000](http://localhost:3000) unless a different port is supplied externally.

### Optional GPT-5.6 configuration

Set `OPENAI_API_KEY` in the server environment before starting the app. Never expose it through a `NEXT_PUBLIC_` variable or commit it to the repository.

```text
OPENAI_API_KEY=TODO_ADD_YOUR_SERVER_SIDE_KEY
```

The integration uses the `gpt-5.6` alias with low reasoning effort and a strict `MissionDebrief` Zod schema. A live model response was not executed in the current Codex session; **TODO:** verify the configured production route end to end before claiming live GPT-5.6 behavior in submission material.

## Scientific scope

Ruleset 0.2.0 is an educational model convention for one mission and its validated experimental variants, not a universal habitability or evolutionary model. It currently scores only high gravity, thermal extremes, elevated radiation, and limited water. Other inputs remain visible and affect the preview and derived facts but do not silently gain undocumented biological rules. Its thresholds, simplifications, provenance, and sources are documented in [Science Rules](docs/SCIENCE_RULES.md). Identical validated input produces identical deterministic output.

## AI Development Process

Codex accelerated repository analysis, domain-contract design, deterministic-rule implementation, the boot and experimental-world flow, bilingual UI work, focused tests, verification, and documentation alignment. The human selected learner-controlled variants, all parameter groups, a hybrid smoothly animated planet, multiple-choice decisions, and an animated boot sequence, and owns the scientific assumptions and submission claims.

GPT-5.6 has two distinct roles:

1. In development, it supports the Codex engineering workflow.
2. In the application, the server-only Mission Instructor can evaluate a learner’s committed structured decisions against validated deterministic output.

The application role is implemented but remains **TODO: live deployment verification**. The fallback is local deterministic content and is explicitly labelled as such.

## OpenAI Build Week record

Event-specific evidence, unresolved requirements, and claim checks are maintained in [docs/HACKATHON.md](docs/HACKATHON.md).

| Item | Current record |
| --- | --- |
| Production URL | https://www.danielwaleczek.com |
| Repository | https://github.com/IDanielWaleczek/Xenogenesis-Lab |
| Primary Codex `/feedback` session | **TODO:** capture before submission |
| Public demo video | **TODO:** add before submission |
| Deployment matches repository HEAD | **TODO:** verify before submission |
| Official deadline, track, and submission fields | **TODO:** verify before submission |

## License

Distributed under the [MIT License](LICENSE).

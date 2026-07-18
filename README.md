# Xenogenesis Lab

> An interactive astrobiology lab for exploring how environmental conditions can constrain plausible alien life.

[Live application](https://www.danielwaleczek.com) · [Source repository](https://github.com/IDanielWaleczek/Xenogenesis-Lab) · [MIT License](LICENSE)

## Project status

**Current build:** a polished, responsive interface prototype plus a tested world-parameter validation and normalization layer.

The interface supports local control changes and navigation through Configure, Constraints, Dossier, and Illustration screens. It does **not** yet execute a deterministic viability engine, call GPT-5.6, call an image API, or generate a scientific illustration. The constraint cards and organism dossier are clearly labelled preview content.

This distinction is intentional: Xenogenesis Lab must never present static content as a live scientific or AI result.

## What it does

Astrobiology is often communicated as either inaccessible science or unconstrained fiction. Xenogenesis Lab turns environmental inputs—gravity, atmosphere, temperature, radiation, light, water, and habitat—into an educational explanation of the pressures that could shape an organism.

The guiding question is: **How could life adapt to this world?** The project uses the language of plausibility, constraints, and scientific simplification; it does not present speculative organisms as discoveries.

## Current features

- Responsive scientific-instrument-style interface with the Xenogenesis Lab banner artwork.
- Local, keyboard-accessible controls for gravity, atmospheric pressure, temperature, radiation, light, water, and habitat.
- Navigable prototype screens for environmental constraints, organism dossier, and scientific illustration stages.
- Strict Zod world-parameter contract with validated ranges and atmospheric-composition checks.
- Deterministic normalization helpers for radiation units, temperature extremes, oxygen partial pressure, atmospheric density, and conservative alternative-energy eligibility.
- Vitest coverage for the validation and normalization boundary.

## Intended MVP

```text
World parameters
→ validated deterministic rules
→ biological constraints
→ GPT-5.6 organism dossier
→ controlled image prompt
→ scientific illustration
```

The deterministic rules engine is the source of truth for environmental calculations. GPT-5.6 will explain and elaborate only within validated constraints; image generation will represent those facts without changing them.

## How the current prototype works

1. Open the application and adjust the local world controls.
2. Select **Explore preview** or a journey stage.
3. Inspect the presentational Constraints, Dossier, and Illustration screens.
4. Use **Reset world** to restore the default visual scenario.

No account, API key, model call, or scientific computation is required for the current interface prototype.

## Architecture

Xenogenesis Lab is a single full-stack Next.js App Router application. The implemented boundary is deliberately independent of the UI and model providers:

```text
src/app/                 Presentation and local prototype state
src/domain/world/        Zod schema and deterministic normalization helpers
docs/                    Product, science, design, architecture, and decisions
```

The domain contract validates full atmospheric composition, retains the source radiation value and unit, normalizes radiation to `mSv/h`, derives temperature limits and oxygen partial pressure, and derives local atmospheric density only when an explicit mean molar mass is supplied.

Server-side route handlers, the viability engine, GPT-5.6 requests, image generation, and persistence are planned but not implemented. See [Architecture](docs/ARCHITECTURE.md), [Science Rules](docs/SCIENCE_RULES.md), and [Decision Log](docs/DECISIONS.md).

## Technology stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16.2.10, App Router |
| UI | React 19.2.4, Tailwind CSS 4 |
| Language | TypeScript (strict mode) |
| Validation | Zod 4.4.3 |
| Tests | Vitest 4.1.10 |
| Linting | ESLint 9 with `eslint-config-next` |
| Package manager | npm |
| Planned deployment | Vercel with GitHub-driven deployments |
| Planned AI boundary | OpenAI API through server-only Next.js route handlers |

## Run locally

### Prerequisites

- Node.js. The repository does not currently pin an `engines` version. **TODO:** pin the supported Node.js version before submission/deployment.
- npm.

### Install and start the development server

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). `next dev` uses port `3000` by default when that port is available.

### Production build and local production server

```bash
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) after starting the production server.

### Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Create an optimized production build. |
| `npm run start` | Run the production build locally. |
| `npm test` | Run Vitest once. |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run lint` | Run the repository ESLint command. |

### Verification note

The focused checks for the implemented application and domain contract pass: TypeScript, `src/app` linting, Vitest, and the production build. At the time of writing, repository-wide `npm run lint` reports existing lint errors in generated `types/routes.d.ts` and `types/validator.ts`; resolve these before final submission.

## AI development process

### How Codex accelerated development

Codex was used throughout the current Build Week development session to:

- inspect the starter repository and establish the product, science, and architecture documentation;
- translate the scientific input specification into a strict, testable Zod contract and deterministic normalization functions;
- add focused Vitest coverage for validation, unit conversion, temperature ranges, oxygen partial pressure, atmospheric density, and the rule that habitat labels do not silently attenuate radiation;
- design and implement the responsive prototype interface, including local screen switching and accessibility-oriented controls;
- run type checks, focused linting, unit tests, production builds, and local visual checks; and
- review and maintain hackathon-facing documentation, including this README.

### Key technical and product decisions

1. **Deterministic science before AI interpretation.** Environmental analysis, constraints, scores, and coefficients belong to the rules engine, not the model.
2. **No false precision in the input model.** Cave/deep-ocean labels do not reduce radiation exposure; shielding remains a recorded input until a spectrum-aware model exists. Alternative metabolism requires declared geochemical energy and electron acceptors.
3. **A single Next.js application.** Server-only route handlers will protect OpenAI credentials and keep the MVP deployment path simple.
4. **One demonstrable vertical slice first.** The project prioritizes the world-to-illustration journey over accounts, ecosystem simulation, or other non-essential scope.
5. **Controlled image prompts.** Future image prompts will be built from a validated dossier, never directly from raw world inputs.

The full rationale and tradeoffs are recorded in [DECISIONS.md](docs/DECISIONS.md).

### GPT-5.6 status and intended role

GPT-5.6 is **not integrated in the current codebase**. Its intended role is to compose a structured educational organism dossier from validated deterministic constraints: overview, morphology, physiology, behaviour, adaptations, limitations, and trait-to-environment explanations. Its response will be validated before display.

Codex has contributed to the implemented architecture, schema, tests, UI, verification, and documentation. The future GPT-5.6 integration will be clearly demonstrated only once it is live and validated.

## OpenAI Build Week 2026

**Recommended track:** Education. **TODO:** confirm the selected Devpost category before submission.

The official rules require a functioning project built with Codex and GPT-5.6, a clear project description, a public YouTube demo under three minutes with audio explaining Codex and GPT-5.6 usage, a testable code repository, and the primary `/feedback` Codex session ID. They also require the README to explain Codex collaboration and key decisions. See the [official rules](https://openai.devpost.com/rules) and [OpenAI Build Week page](https://openai.com/build-week/).

### Submission record

| Item | Status |
| --- | --- |
| Live application | [https://www.danielwaleczek.com](https://www.danielwaleczek.com) |
| Source repository | [IDanielWaleczek/Xenogenesis-Lab](https://github.com/IDanielWaleczek/Xenogenesis-Lab) |
| License | MIT ([LICENSE](LICENSE)) |
| Project status | Prototype UI and tested world-data foundation; live AI pipeline is not yet implemented. |
| Primary Codex `/feedback` session ID | **TODO:** capture and add before submission. |
| Public YouTube demo URL | **TODO:** add before submission. |
| Demo duration | **TODO:** keep below three minutes. |
| Deployment-to-HEAD confirmation | **TODO:** confirm the live application reflects the submitted commit. |

### Build Week evidence

The repository was initialized during the event period. The project history records the schema and normalization foundation in commit `5b0d71e` and the interactive prototype in commit `4301ae0`. The detailed work record and submission checklist live in [docs/HACKATHON.md](docs/HACKATHON.md).

## License

Distributed under the [MIT License](LICENSE).

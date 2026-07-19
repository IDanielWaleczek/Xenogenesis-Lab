# Xenogenesis Lab

> An AI-guided astrobiology mission-training simulator for practising scientific reasoning about plausible alien life.

[Live application](https://www.danielwaleczek.com) · [Source repository](https://github.com/IDanielWaleczek/Xenogenesis-Lab) · [MIT License](LICENSE)

## Product identity

Xenogenesis Lab is not primarily a planet configurator or organism generator. It places a learner in a fictional xenobiology mission-training programme: they assess an alien world, commit to a hypothesis, inspect a deterministic result, and receive an adaptive scientific debrief.

Its core user fantasy is: **“I am a candidate training to reason like a xenobiology mission specialist.”**

The primary audience is students, educators, and science and space enthusiasts. Astrobiology and planetary habitability are difficult to learn from static material alone: learners need a chance to make a scientific decision, see its consequences, and revise their reasoning with feedback.

## Current build status

**Current build:** a responsive mission-console prototype plus a tested world-parameter validation and normalization layer.

The interface has local, keyboard-accessible environmental controls and preview stages for pressure analysis, an organism dossier, and an illustration. It does **not** yet run a deterministic viability engine, collect or assess a committed hypothesis, call GPT-5.6, call an image API, save a research archive, or calculate competency progress. Preview cards and specimen content are explicitly labelled as non-live samples.

This distinction is intentional: the project must never present placeholder content, a prepared asset, or AI-free UI state as a calculated or generated result.

## The mission-training loop

The intended complete mission is:

```text
Mission briefing
→ environmental analysis
→ committed hypothesis
→ deterministic simulation
→ pressure and organism inspection
→ GPT-5.6 Mission Instructor debrief
→ evidence-based revision
→ competency progress
→ next mission
```

The smallest complete demo must implement that whole loop for at least one mission. Progression is meaningful only when it records learning behaviour—such as completed missions, improved hypotheses, evidence-based revisions, research-archive entries, competency growth, and certification stages. The project will not use unrelated currencies, click rewards, or decorative streaks.

## What is implemented

- Responsive English and Polish mission-console prototype with a desktop and narrow-screen layout.
- Local controls for gravity, atmospheric pressure, temperature, radiation, light, water, and habitat.
- Preview navigation through environment, pressure, organism, and illustration stages.
- Strict Zod world-parameter contract, including atmospheric-composition checks.
- Deterministic normalization for radiation units, temperature extremes, oxygen partial pressure, atmospheric density, and conservative alternative-energy eligibility.
- Vitest coverage for the validation and normalization boundary.

## Planned scientific and AI boundary

The deterministic rules layer will own environmental calculations, causal constraints, adaptation scores, scientific coefficients, and reproducible simulation facts. GPT-5.6 will receive validated structured context to frame missions, evaluate the trainee’s reasoning, explain results and trade-offs, ask targeted follow-up questions, produce a mission debrief, recommend an experiment, and compose constrained dossier content.

GPT-5.6 must not overwrite calculated values or turn unsupported invention into a simulation fact. Zod will validate external input and structured model output. The UI will visibly distinguish the learner’s hypothesis, deterministic result, and AI interpretation. Image generation will only represent validated organism data; it will not determine scientific outcomes.

See [Product](docs/PRODUCT.md), [Architecture](docs/ARCHITECTURE.md), [Science Rules](docs/SCIENCE_RULES.md), [Design](docs/DESIGN.md), and [Decision Log](docs/DECISIONS.md) for the detailed constraints.

## Local development

### Prerequisites

- Node.js. This repository does not currently pin a supported version; **TODO:** define one before deployment or submission.
- npm.

### Try it yourself

https://www.danielwaleczek.com

## Repository layout

```text
src/app/                 Prototype presentation and localisation
src/domain/world/        Zod world-input contract and normalization helpers
docs/                    Product, scientific, design, architecture, and event records
```

Server-side route handlers, the viability engine, GPT-5.6 integration, image generation, persistence, and training progression are planned but are not yet implemented.

## OpenAI Build Week 2026

The project is aimed at the Education track. **TODO:** confirm the final Devpost category and current official requirements before submission.

### Honest contribution record

Codex has assisted with the currently implemented repository structure, scientific-boundary documentation, Zod schema and normalization helpers, focused unit tests, prototype UI, and documentation review. The human retains responsibility for the product direction, scientific assumptions, architecture decisions, design review, and final implementation choices.

GPT-5.6 is not integrated into the current build, so it must not be described as a live application capability. Once connected, the repository should document the exact structured request and response boundary, validation, fallbacks, and a reproducible demo path.

| Item | Current record |
| --- | --- |
| Primary Codex `/feedback` session ID | **TODO:** capture before submission. |
| Public demo video | **TODO:** add before submission. |
| Deployment-to-HEAD confirmation | **TODO:** verify before submission. |
| Event work and evidence | [docs/HACKATHON.md](docs/HACKATHON.md) |

## License

Distributed under the [MIT License](LICENSE).

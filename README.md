# Xenogenesis Lab

> A dynamic procedural astrobiology simulator for engineering a planet, designing alien life, and testing whether that life can survive and become advanced.

[Live application](https://www.danielwaleczek.com) · [Source repository](https://github.com/IDanielWaleczek/Xenogenesis-Lab) · [MIT License](LICENSE)

**Deployment note:** the URL is the intended public application. **TODO:** verify that it serves the current repository HEAD before recording or submitting the demo.

## What it does

Xenogenesis Lab turns planetary habitability into an experiment rather than a quiz. The learner boots an orbital laboratory, changes a seeded procedural planet, sees its terrain and atmosphere transform in real time, designs an organism from biologically consequential traits, and runs a reproducible 40-generation survival model. The result explains continuous environmental scores, regional refuges, population behavior, and advanced-life potential so the learner can change one variable and try again.

```text
Observe → Modify Planet → Design Life → Simulate → Visualize → Adapt
```

There is no single hidden correct configuration. The tested model supports distinct strategies, including a high-energy aerobic surface organism and a geochemically powered aquatic organism.

## Main features

- Cinematic, skippable space-and-life introduction into a single-screen astrobiology laboratory.
- One complete Genesis mission with a broad goal: create stable advanced multicellular life on Vespera 7A.
- Deterministic seeded WebGL planet rendered with Three.js, React Three Fiber, layered FBM/value noise, and custom GLSL shaders.
- Persistent terrain geometry with smoothly interpolated water, global ice, lava, cloud, atmosphere, sun-driven day/night illumination, radiation exposure, magnetic-field, aurora, and biosphere uniforms.
- Interactive orbit camera, zoom, reset, automatic-rotation control, surface inspection, and realistic/temperature/radiation modes with labelled legends.
- Ten live environmental controls; each affects both the visualization and deterministic simulation.
- Lifeform designer with 33 traits in five categories, explicit advantages, tradeoffs, incompatibilities, and a 100-point biological energy budget.
- Deterministic simulator 1.0.0 with 11 continuous suitability metrics, six representative regional scores, a logistic-style population timeline, eight possible outcomes, and a stable state hash.
- Deterministic code-native organism morphology that responds to the seed, environment, movement, body, sensory, and adaptation traits.
- Server-only GPT-5.6 scientific consultant using structured output validated with Zod, plus an explicitly labelled local fallback.
- Optional server-only `gpt-image-2` field illustration. GPT selects only validated art-direction enums; the server constructs the final prompt from calculated facts and selected traits.
- Complete reviewed English and Polish interface copy, including accessible labels and failure states.
- Responsive desktop-first layout; planet engineering, life design, and analysis each center their important visual, while mobile keeps a phase visual visible during scrolling.

## How it works for the learner

1. Let the laboratory boot or skip startup.
2. Read the mission goal and first-use instruction.
3. Change gravity, temperature, local pressure, oxygen, carbon dioxide, water, radiation, stellar energy, humidity, or magnetic-field strength.
4. Rotate the planet and switch scientific overlays to inspect its response.
5. Open the lifeform designer and select compatible traits within the energy budget.
6. Run 40 generations locally. No AI is used for the calculation.
7. Inspect suitability scores, regional survival, population growth, the organism field model, and the mission outcome.
8. Optionally request GPT-5.6 interpretation or a generated field illustration.
9. Return to the planet or organism without reloading and run a controlled comparison.

## Technology stack

- Next.js 16.2.10 with App Router
- React 19.2.4 and TypeScript
- Three.js 0.185, React Three Fiber 9, and `@react-three/drei`
- Custom GLSL planet shaders
- Tailwind CSS 4 plus project CSS
- Zod 4 at world, simulation, AI, and image boundaries
- OpenAI JavaScript SDK 6 with the Responses and Image APIs
- Vitest 4
- Intended hosting: Vercel with GitHub deployments

The domain and DNS may remain at GreenGeeks or OVH, but the application must never depend on GreenGeeks EcoSite Lite for its Node.js runtime.

## Architecture

```text
Browser
├── typed EN/PL presentation copy
├── local simulator state
├── persistent React Three Fiber scene + GLSL uniforms
├── lifeform trait designer
└── deterministic result visualizations
        │
        ├── src/domain/world          validated physical inputs and derivations
        ├── src/domain/simulator      traits, continuous scores, regions, population
        └── src/shaders               visual interpretation only
        │
Next.js server-only route handlers
├── POST /api/consultant       GPT-5.6 structured explanation or local fallback
└── POST /api/organism-image   controlled gpt-image-2 request or procedural fallback
```

The deterministic engine owns every score and outcome. GPT-5.6 can explain the validated result and choose constrained visual direction; it cannot change physics, trait costs, regional scores, population output, or mission success. Image generation represents an organism and never feeds facts back into the model.

In-memory caches use a stable hash of mission, planet, traits, result, and language. They reduce repeated calls inside one server process but are not durable across serverless instances.


## Scientific scope

Simulator 1.0.0 is a scientifically inspired educational model, not a complete climate, radiation-transport, ecosystem, genetics, or evolutionary model. Its formulas are continuous and deterministic, but its weights and success convention are documented model choices. Six representative habitats are scored instead of a spatial climate grid. The shader terrain is a visual interpretation and does not supply scientific facts.

Important conservative boundaries include:

- habitat labels never reduce radiation dose;
- anaerobic and chemosynthetic energy requires explicit geochemical availability and electron acceptors;
- oxygen is evaluated through local partial pressure;
- atmospheric density is derived from local pressure, temperature, and supplied molar mass;
- temperature variation is a symmetric half-range;
- identical validated input and simulator version produce identical output.

See [Science Rules](docs/SCIENCE_RULES.md) for formulas, coefficients, tests, sources, and limitations.

## AI Development Process

Codex accelerated repository inspection, product reframing, deterministic data contracts, scientific-boundary review, test design, React and shader implementation, server-route integration, bilingual copy, browser verification, and documentation reconciliation. The current session replaced the earlier hypothesis/quiz flow with a continuous simulation loop and used type, lint, unit, build, and rendered-browser feedback to iterate on one vertical slice.

Key human decisions were:

- give learners freedom instead of one correct answer;
- make the planet the dominant interactive object;
- expose every major parameter’s world and biological consequence;
- use meaningful biological traits with costs rather than cosmetic customization;
- preserve deterministic science and call AI only for visible explanatory or illustrative value;
- keep English and Polish equally complete;
- prioritize one polished mission before persistence or a campaign.

GPT-5.6 has two distinct roles:

1. It powers the Codex-assisted development workflow used to build and review the project.
2. In the application, it acts as a scientific consultant over validated structured simulation results and selects constrained art direction for an optional organism image.

The application never asks GPT-5.6 to calculate habitability or generate an authoritative outcome.

## Build Week submission alignment

The project targets the **Education** category. As checked on 2026-07-19, the [official OpenAI Build Week page](https://openai.com/build-week/) and [Devpost challenge page](https://openai.devpost.com/) require a working project built with Codex and GPT-5.6, a category, project description, public demo video under three minutes with audio explaining Codex and GPT-5.6 usage, a judge-accessible code repository with licensing and setup instructions, and the primary Codex `/feedback` session ID. The submission deadline shown by Devpost is **2026-07-21 at 5:00 PM PDT**.

| Submission item | Current record |
| --- | --- |
| Category | Education |
| Live URL | https://www.danielwaleczek.com |
| Repository | https://github.com/IDanielWaleczek/Xenogenesis-Lab |
| License | MIT |
| Public `<3 min` YouTube demo | **TODO** |
| Primary Codex `/feedback` session ID | **TODO** |
| Production deployment matches repository HEAD | **TODO** |
| Live GPT-5.6 and `gpt-image-2` verification | **TODO** |

Detailed evidence and the final checklist live in [docs/HACKATHON.md](docs/HACKATHON.md).

## Verified in the current change

- 20 Vitest tests passed.
- TypeScript passed with `npx tsc --noEmit`.
- Full repository lint passed with `npm run lint`.
- The optimized Next.js build passed with `npm run build`.
- A local production smoke test verified the planet, designer, deterministic result, population/hash output, English/Polish switch, explicit consultant/image fallbacks, localized fallback terminology, and stale-response protection during a language change.
- Live OpenAI requests, the deployed URL, and a real narrow/mobile device remain TODOs.

## Current limitations

- One mission and one seeded planet baseline.
- No accounts, save/share flow, database, campaign, or durable AI cache.
- Representative region scores, not a latitude/elevation simulation grid.
- No detailed climate, food-web, radiation-spectrum, genetics, or natural-selection model.
- No creature animation; the procedural organism is a deterministic field-model visualization.
- Rate limiting and production observability are TODOs before public scale.
- Production-to-HEAD and live OpenAI paths still require deployment verification.

## License

Distributed under the [MIT License](LICENSE).

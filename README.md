# Xenogenesis Lab

> A dynamic procedural astrobiology simulator for engineering a planet, designing alien life, and testing whether that life can survive and become advanced.

[Live application](https://www.danielwaleczek.com) · [Source repository](https://github.com/IDanielWaleczek/Xenogenesis-Lab) · [MIT License](LICENSE)

**Deployment note:** the URL is the intended public application. **TODO:** verify that it serves the current repository HEAD before recording or submitting the demo.

## What it does

Xenogenesis Lab turns planetary habitability into the Vespera expedition: create the first biosphere capable of surviving two centuries of planetary change. The learner opens a story-led WebGL research system, reshapes a seeded procedural planet, designs an organism from biologically consequential visible traits, and runs a reproducible 200-step survival and event model presented as model years. The result explains survivability, continuous environmental scores, regional refuges, and population shocks so one variable can be changed and tested again.

```text
Observe → Modify Planet → Design Life → Simulate → Visualize → Adapt
```

There is no single hidden correct configuration. The tested model supports distinct strategies, including a high-energy aerobic surface organism and a geochemically powered aquatic organism.

## Main features

- Story-led cinematic introduction with frozen and warm candidate worlds, Xenogenesis banner branding, background stars, and bottom-centred English/Polish flag controls.
- One complete Genesis mission with a broad goal: create stable advanced multicellular life on Vespera 7A.
- Deterministic seeded WebGL planet rendered with Three.js, React Three Fiber, layered FBM/value noise, and custom GLSL shaders.
- Persistent terrain geometry with smoothly interpolated phase-aware water/ice/vapor, sand, thermally altered rock, clouds, atmosphere, day/night illumination, radiation exposure, aurora, and biosphere uniforms.
- Interactive orbit camera, zoom, day-side reset, automatic-rotation control, and realistic/temperature/radiation modes with labelled legends.
- Eleven live environmental controls with preserved preferences, a gravity-dependent `0–5 atm` atmospheric ceiling, and continuous derived interactions including conditional dense-atmosphere weather.
- Blank-start lifeform designer with 44 traits in five categories, explicit advantages, tradeoffs, and incompatibilities. Every trait changes the code-native organism, and its terrain, water/ice, atmosphere, temperature, and light always come from the engineered planet.
- Deterministic simulator 1.7.0 with strict water, energy, metabolism, thermal, and radiation viability gates; 11 continuous suitability metrics; six representative regions; a 200-step timeline presented as model years; six parameter-driven event types; and eight outcomes.
- Unsupported life can reach exactly zero advanced-life potential and population; diagnostic component scores remain visible so the learner can identify what to revise.
- Server-only GPT-5.6 scientific consultant using structured output validated with Zod, plus an explicitly labelled local fallback.
- Optional server-only `gpt-image-2` field illustration in an uncropped downloadable 3:2 frame. GPT selects only validated art-direction enums; the server constructs the final prompt from calculated facts and selected traits.
- Complete reviewed English and Polish interface copy, including accessible labels and failure states.
- Responsive desktop-first layout; planet engineering, life design, and analysis each center their important visual, while mobile keeps a phase visual visible during scrolling.

## How it works for the learner

1. On the startup screen, choose English or Polish and begin the Vespera experiment; it never advances automatically.
2. Read the expedition objective: create a biosphere that can survive two centuries of change.
3. Change gravity, temperature, local pressure, oxygen, carbon dioxide, water, radiation, stellar energy, humidity, or magnetic-field strength.
4. Rotate the planet and switch scientific overlays to inspect its response.
5. Open the blank lifeform designer, review active world evidence, and combine compatible traits while watching the organism and terrain change.
6. Run 200 model years and deterministic environmental events locally. No AI is used for the calculation.
7. Inspect suitability scores, strict viability, regional survival, event impacts, population growth, the organism field model, and the mission outcome.
8. Optionally request GPT-5.6 interpretation or a downloadable 3:2 field illustration. If the API is unavailable, the app says so and keeps the deterministic experiment usable.
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

## Run locally

Prerequisites: Node.js and npm. **TODO:** the repository does not currently pin a Node.js version.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To build and run the optimized production server locally:

```bash
npm run build
npm run start
```

Repository checks supported by `package.json`:

```bash
npm run lint
npm test
npx tsc --noEmit
```

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

The deterministic engine owns every score, viability gate, event, and outcome. GPT-5.6 can explain the validated result and choose constrained visual direction; it cannot change physics, regional scores, population output, or mission success. Image generation represents an organism and never feeds facts back into the model.

In-memory caches use a stable hash of mission, planet, traits, result, and language. They reduce repeated calls inside one server process but are not durable across serverless instances.


## Scientific scope

Simulator 1.7.0 is a scientifically inspired educational model, not a complete climate, geology, radiation-transport, ecosystem, genetics, or evolutionary model. Its formulas, event schedule, weights, viability gates, and success convention are documented model choices. Six representative habitats are scored instead of a spatial climate grid. The shader terrain consumes shared derived state but remains a visual interpretation.

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
- use meaningful biological traits and incompatibilities rather than cosmetic customization or an arbitrary construction budget;
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

- 77 Vitest tests passed across 10 test files, including strict-zero viability, 200-generation events, gravity-limited atmospheric consequences, and complete visual-trait registration.
- TypeScript passed with `npx tsc --noEmit`.
- Full repository lint passed with `npm run lint`.
- The optimized Next.js build passed with `npm run build`.
- Browser QA at `1280×720` and `390×844` verified the banner intro, bottom flag selector, blank designer, world-derived organism terrain, visible protected eggs, hidden Life/Analyze planet controls, 200-generation chart, deterministic events, exact-zero extinction path, local consultant fallback, and new Polish copy.
- Browser console inspection found no errors; Three.js emits its existing `Clock` deprecation warning.
- Live OpenAI requests and the deployed URL remain TODOs.

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

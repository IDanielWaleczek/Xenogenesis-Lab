# Xenogenesis Lab — Decision Log

This file records decisions that materially affect product scope, architecture, scientific behavior, cost, security, or submission claims.

## 2026-07-19 — Replace the hypothesis quiz with a continuous life-engineering simulator

**Status:** Accepted; replaces the earlier briefing → committed hypothesis → competency flow.

**Decision**

The product is a dynamic procedural astrobiology laboratory built around `Observe → Modify Planet → Design Life → Simulate → Visualize → Adapt`. Missions define broad outcomes and allow multiple viable strategies rather than one hidden answer.

**Rationale**

The prior multi-screen hypothesis flow separated the learner from planet data, added a writing barrier, and made experimentation feel like a test. A continuous laboratory better demonstrates interacting systems, creates immediate delight, and gives the deterministic model and GPT-5.6 visible roles within a sub-three-minute demo.

**Consequences**

- hypothesis, pressure-choice, revision, archive, competency, and certification modules were removed;
- the product now opens after a cinematic boot into one persistent laboratory;
- world and organism remain editable after every run;
- success is a broad evaluated outcome, not a disclosed slider recipe;
- additional missions and persistence remain deferred.

## 2026-07-19 — Use a persistent seeded WebGL planet with custom shaders

**Status:** Accepted.

**Decision**

Three.js, React Three Fiber, Drei, and custom GLSL render one deterministic planet from a stable seed. Terrain geometry remains allocated while shader uniforms interpolate world changes.

**Options considered**

1. Extend the previous animated SVG.
2. Swap pre-rendered planet images.
3. Build a layered persistent WebGL scene.

**Rationale**

The WebGL scene makes the planet the product’s central interactive object and visibly communicates water, ice, cloud, atmosphere, temperature, radiation, and biosphere changes. Uniform updates avoid CPU terrain regeneration and React frame-state churn.

**Consequences**

- Three.js, `@react-three/fiber`, and `@react-three/drei` are production dependencies;
- terrain, water, clouds, and atmosphere are separate shader layers;
- dynamic import and a capped DPR reduce initial and rendering cost;
- the rendering remains a labelled visual interpretation, not a science engine;
- lower-end device performance needs final field testing.

## 2026-07-19 — Adopt continuous simulator 1.0.0 with regions and population

**Status:** Accepted.

**Decision**

Replace four Boolean pressure rules with continuous normalized scores, six representative regional aggregates, and a deterministic 40-generation logistic-style population model. Centralize model conventions in `coefficients.ts` and emit a stable state hash.

**Rationale**

Continuous interactions support several strategies and better explain tradeoffs than a chain of threshold checks. Regional aggregates allow partial survival without pretending to implement a full climate grid. Population output creates an observable consequence beyond a binary verdict.

**Consequences**

- model version changes require coefficient, test, and documentation review;
- outcome and success still use documented conventions for mission evaluation;
- the first model is educational and cannot be described as predictive planetary science;
- spatial climate, food webs, mutation, and natural selection remain out of scope.

## 2026-07-19 — Constrain life design with costs, modifiers, and conflicts

**Status:** Accepted.

**Decision**

The first designer exposes 33 meaningful traits in five categories. Every trait has a cost, modifier set, tradeoff, and conflict list. A 100-point budget and server-side engine validation prevent unlimited positive stacking.

**Rationale**

Cosmetic parts would not demonstrate astrobiological reasoning. Explicit costs make learners choose between survival, reproduction, energy, movement, and complexity while keeping the interface understandable.

**Consequences**

- trait values are simulator conventions rather than measured biological constants;
- incompatible or over-budget input is rejected even if it bypasses the client;
- a deterministic organism SVG provides immediate visual feedback without network cost;
- more anatomy controls are deferred until current traits are educator-reviewed.

## 2026-07-19 — Make GPT-5.6 an on-demand scientific consultant

**Status:** Accepted.

**Decision**

GPT-5.6 explains a completed server-recalculated result only when requested. It does not run on sliders, frames, or deterministic simulation. The route returns a Zod-validated local fallback with explicit provenance when live AI is unavailable.

**Rationale**

This gives AI a visible educational role while controlling latency, cost, and hallucination risk. The complete simulator remains testable without credentials and never impersonates a live model.

**Consequences**

- the server owns `OPENAI_API_KEY`, recalculation, prompt construction, validation, and caching;
- process-local stable-hash caching prevents repeated requests only within one instance;
- live GPT-5.6 behavior remains a deployment-verification TODO;
- rate limiting and observability are required before public scale.

## 2026-07-19 — Build image prompts from facts plus structured art direction

**Status:** Accepted; tightens the earlier controlled-prompt decision.

**Decision**

GPT-5.6 may select only pose, viewpoint, lighting, and emphasis enums. The server constructs the final `gpt-image-2` prompt from validated world values, selected trait IDs, deterministic outcome, and those enums.

**Rationale**

A free-form model-authored prompt is untrusted and could add unsupported anatomy or contradict the result. Structured direction preserves some visual choice without allowing AI to redefine facts.

**Consequences**

- image generation cannot change simulator state;
- missing or failed image calls preserve the procedural organism;
- generated data URLs are cached only in process;
- live `gpt-image-2` output and serverless payload behavior require deployment verification.

## 2026-07-18 — Require explicit physical inputs for shielding and alternative energy

**Status:** Accepted and retained in simulator 1.0.0.

**Decision**

Habitat labels never attenuate radiation. `shieldingColumnMassKgM2` defaults to zero but is not converted to dose reduction without spectrum/material data. Alternative non-aerobic energy requires declared geochemical availability and at least one electron acceptor. Atmospheric density uses local pressure, temperature, and supplied molar mass. Temperature variation is a symmetric half-range.

**Rationale**

These boundaries avoid false precision, invented energy, and inappropriate surface assumptions.

**Consequences**

- cave, deep-ocean, and underground labels cannot create radiation safety;
- low oxygen constrains aerobic metabolism but does not automatically forbid simple life;
- high-atmosphere flight uses derived density;
- simulator thermal fitness evaluates both extremes rather than applying a flat variability penalty.

## 2026-07-18 — Use one full-stack Next.js application on Vercel

**Status:** Accepted.

**Decision**

Use a single TypeScript Next.js App Router project, React UI, Zod validation, and server-only OpenAI route handlers. Deploy through GitHub to Vercel. Domain and DNS may remain at GreenGeeks or OVH, but GreenGeeks EcoSite Lite must not host the Node.js runtime.

**Rationale**

One application is the shortest maintainable path to a secure hackathon vertical slice with protected credentials.

**Consequences**

- one repository and deployment boundary;
- AI requests must fit serverless limits;
- environment configuration, rate limits, and production logs need explicit setup;
- production-to-HEAD status remains a submission TODO.

## 2026-07-18 — Complete one vertical slice before optional systems

**Status:** Accepted.

**Decision**

Prioritize one polished mission through planet engineering, life design, deterministic simulation, optional consultant, and optional image before accounts, campaigns, or detailed ecosystem systems.

**Rationale**

A coherent runnable product is stronger for judging and user testing than many disconnected prototypes.

## 2026-07-18 — Keep English and Polish structurally complete

**Status:** Accepted.

**Decision**

All visible and accessible interface copy lives in one typed dictionary supporting only English and Polish. Every UI change must update and review both languages.

**Consequences**

- TypeScript detects missing structural keys;
- content review remains a human responsibility;
- additional languages are deferred.

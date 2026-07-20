# Xenogenesis Lab — Decision Log

This file records decisions that materially affect product scope, architecture, scientific behavior, cost, security, or submission claims.

## 2026-07-19 — Couple ocean elevation and ice presentation to local terrain and latitude

**Status:** Accepted; renderer and interaction correction with no simulator-version change.

**Decision**

Keep the hydrosphere as a separate masked mesh, but remove its global radial scale. Map exposed-water coverage from the deepest procedural basins to above the theoretical maximum terrain elevation at full inventory, while using the identical elevation field for the mesh and fragment mask. Derive the visible water phase from local latitude temperature while limiting ice by the phase inventory produced by the deterministic interaction layer. Keep range inputs native and coalesce expensive world updates to at most one per animation frame.

**Rationale**

The former water mesh combined a fixed `1.008` scale with as much as `0.115` additional radial displacement, so it could sit above even the highest terrain and read as a levitating shell. Its global ice ratio also tinted warm equatorial water as frozen whenever any polar ice existed. Fully controlled sliders sent every pointer event through schema validation and the whole page state, which could make the thumb lag during a fast drag.

**Consequences**

- `100%` exposed water approaches the highest summits without covering the entire planet from above;
- a `41°C` equator remains liquid while sufficiently cold northern and southern water freezes;
- global phase mass remains deterministic, while the shader's spatial distribution remains explicitly illustrative;
- slider thumbs respond natively, have a larger hit target, and still update the renderer in real time at display-frame cadence.

## 2026-07-20 — Apply an immediate gravity-dependent atmospheric ceiling

**Status:** Accepted; superseded by the 1.6.0 hundred-atmosphere extension below.

**Decision**

Use the effective-pressure convention `P_eff = min(P_stored, 5 × g²) atm`, capped at `5 atm` for the current control range. Apply it immediately to the engineering readout, deterministic normalization, gas partial pressures, density, exposed water, humidity, clouds, aurora support, and simulation. Preserve the stored pressure and gas preferences so increasing gravity restores them, while keeping the pressure control active so the learner can deliberately lower the stored pressure under the ceiling.

**Rationale**

Surface gravity raises escape velocity and therefore sets the correct direction for atmospheric retention, but a complete escape-rate model would require planetary radius, mass distribution, gas composition, thermal history, stellar XUV, magnetic field, and geology. The learner asked for a direct physical constraint rather than a fictional annual loss rate. The quadratic hundred-atmosphere convention is therefore labelled as an educational ceiling, not a quantitative atmospheric-escape prediction.

**Consequences**

- at `0.2 g`, a stored `5 atm` atmosphere immediately presents as `0.2 atm` effective pressure;
- oxygen and carbon-dioxide partial pressures use the capped pressure while their stored fractions remain unchanged;
- water, humidity, density, clouds, aurora, and simulation receive the capped pressure through one shared interaction layer;
- the pressure slider remains active while capped, exposes the gravity-derived maximum, and lets the learner lower the stored preference;
- the deterministic simulator receives the same effective constraint as the UI.

## 2026-07-19 — Upgrade to simulator 1.5.0 with effective controls and molten-surface range

**Status:** Accepted; extends the 1.4.0 preference-preservation and phase-rendering decision.

**Decision**

Keep source preferences immutable across temporarily unsupported states, but make dependent controls display their physically expressed values. Gas controls use partial pressure, the water control uses the exposed ice-plus-liquid share, and humidity uses effective atmospheric humidity. Lock a dependent control when its support reaches zero and restore it from the stored preference when support returns. Expand mean temperature to `−273…1800°C`, reject configured minima below absolute zero, and introduce an explicitly basaltic renderer transition from solid rock to molten surface across `780–1050°C`. Use the full configured hot and cold extrema for equatorial and polar presentation and region scoring.

**Rationale**

Leaving an enabled oxygen percentage at zero pressure hid the fact that usable oxygen partial pressure was zero. Erasing the percentage would destroy user intent. The stored/effective split preserves both facts. The former `150°C` maximum could not demonstrate molten rock; the expanded range can do so without falsely showing lava at ordinary environmental temperatures. The former latitude multiplier used only `78%` of the configured thermal variation and made poles and equator too similar.

**Consequences**

- simulator results and reproducibility hashes identify version `1.5.0`;
- vacuum immediately removes atmosphere-like rim light and the realistic-mode radiation shell;
- oxygen and carbon-dioxide readouts change continuously with total pressure while stored composition remains unchanged;
- water and humidity remain editable under partial support through an inverse mapping, but lock at zero support;
- desktop and mobile receive separate visible orbit-control instructions;
- molten rock is a temperature-driven basaltic presentation convention, not evidence of volcanism, tectonics, or a supplied geological energy source.

## 2026-07-19 — Upgrade to simulator 1.4.0 with preserved inputs and phase-aware rendering

**Status:** Accepted; supersedes the 1.3.0 gravity/thermal dependency limits and the 1.1.0 volatile-retention convention.

**Decision**

Keep all eleven planet controls as independent user preferences. Never erase water, humidity, atmospheric composition, pressure, or temperature variation merely because another setting makes its current physical effect unavailable. Derive continuous atmosphere presence, pressure support, effective humidity, clouds, and ice/liquid/vapor water shares from the stored inputs. Use those same phase results in simulation and rendering. Remove lava from the editable `−100…150°C` renderer range, calculate local shader temperature in degrees Celsius, begin the camera on the day side, and keep the night side readable.

**Rationale**

The earlier implementation mixed normalized display values with physical thresholds. That created snow at `36±4°C`, incomplete freezing at `−40±4°C`, green plant-like terrain around `87–95°C`, clouds without water or humidity, and lava around `105°C`. The gravity pressure cap and mandatory pressure-derived temperature variation also claimed information unavailable from the current inputs and destructively reset downstream choices.

**Consequences**

- simulator results and reproducibility hashes now identify version `1.4.0`;
- `engineering.ts` preserves every slider preference, including in vacuum or above the current boiling point;
- `interactions.ts` samples `mean ± variation` deterministically and partitions exposed water continuously among ice, liquid, and vapor;
- liquid-water, hydration, aquatic-region, cloud, and renderer logic consume the same phase-aware state;
- zero water or zero humidity guarantees zero clouds, while intermediate inputs produce intermediate effects;
- physical pressure fitness and oxygen-dependent pathways now approach zero continuously and cannot remain near ideal when their required medium is absent;
- simulation and rendering consume one shared magnetic-protection calculation, while aurora presentation retains incident radiation as its particle-supply input;
- gravity remains a body-support and movement input until a defensible escape model receives mass, radius, composition, temperature history, and stellar context;
- the full UI temperature range produces sand, dry rock, ice, liquid water, vapor, or thermally altered terrain, but never molten rock.

## 2026-07-19 — Upgrade to simulator 1.3.0 with ordered dependency limits

**Status:** Accepted.

**Decision**

Order planet engineering from upstream physical conditions to downstream consequences. Use a documented gravity-dependent cap for the five-atmosphere UI range and a pressure-dependent minimum temperature half-range. Reapply both limits inside the deterministic simulator. Present six value bands per control in reviewed English and Polish. Remove direct surface-region selection, while retaining regional evidence in simulation analysis.

**Rationale**

A learner could previously configure a thick atmosphere at the minimum gravity or an isothermal exposed vacuum. Both states contradicted the intended causal model. Three caption bands also compressed materially different conditions such as vacuum, trace atmosphere, thin air, and dense air into the same explanation.

**Consequences**

- simulator results and reproducibility hashes now identify version `1.3.0`;
- reducing gravity can clamp atmosphere, which can force greater temperature variation and remove unstable surface water and humidity;
- direct server simulation receives the same effective constraints as the UI;
- caption thresholds are parameter-specific rather than equal percentages of every slider;
- polar ice requires actual water, and the white-grey cloud shell is rendered above maximum terrain elevation;
- these are explicit educational conventions because rotation, thermal inertia, composition-specific escape, stellar XUV history, and geology remain unavailable.

## 2026-07-19 — Upgrade to simulator 1.2.0 with coupled planetary controls

**Status:** Accepted.

**Decision**

Treat atmosphere, exposed surface water, humidity, temperature, gas fractions, gravity, radiation, stellar energy, and magnetic field as an explicit dependency network. Zero pressure hard-gates atmospheric suitability; zero supplied water hard-gates liquid-water support. The right-panel controls derive value-specific English/Polish captions and state why a dependent parameter is disabled or limited. Expose the already-modeled temperature half-range as the eleventh independent control.

**Rationale**

The previous additive liquid-water score could report nonzero liquid-water support when supply was zero, and atmospheric composition could contribute a nonzero score at zero pressure. Both broke the simulator's causal interpretation. Hiding temperature variation also made a real simulator input impossible to inspect or change.

**Consequences**

- simulator results and reproducibility hashes now identify version `1.2.0`;
- water and atmosphere are hard prerequisites in their respective suitability scores;
- gas fractions, stable exposed surface water, and humidity cannot be configured without their physical prerequisites;
- the surface-water UI phase boundary uses a documented pressure-dependent approximation;
- stars are seeded Three.js points in world space rather than screen-pinned CSS decoration;
- albedo, orbital distance, stellar spectrum, planetary mass/radius, volatile composition, and escape history remain deferred because adding one without a coupled climate/escape model would imply false precision.

## 2026-07-19 — Upgrade to simulator 1.1.0 with explicit low-gravity volatile retention

**Status:** Accepted.

**Decision**

Simulator 1.1.0 applies a documented, coarse long-term retention convention below `0.8 g`: it scales retained water, humidity, and atmospheric suitability, while retaining a small atmosphere floor for a supplied instantaneous pressure. The same convention drives only air/water/humidity presentation; it does not infer continent shape, radius, density, or geology.

**Rationale**

Low surface gravity materially constrains the long-term retention of volatiles, so treating it only as a body-support slider hid the most important planetary effect. A complete escape model would require additional inputs such as mass, radius, temperature history, composition, and stellar-wind data, which this vertical slice does not have.

**Consequences**

- the barren mission start remains a valid concrete world state rather than an unset payload;
- the model version and reproducibility hash change to `1.1.0` for affected input;
- a very low-gravity world visibly loses retained atmosphere, water, and humidity;
- this remains an educational convention, not a prediction of atmospheric escape.

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

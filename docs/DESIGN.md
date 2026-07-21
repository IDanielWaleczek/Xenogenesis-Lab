# Xenogenesis Lab — Design

## Direction

Xenogenesis Lab should feel like a focused orbital astrobiology workstation: restrained, precise, atmospheric, readable, and credible. The experience is playful through experimentation, not through cartoon decoration, points, or a hidden quiz answer.

Avoid excessive neon, generic cyberpunk ornament, oversized mobile cards, long onboarding prose, imitation of established science-fiction franchises, and visual effects that obscure scientific evidence.

## Information hierarchy

```text
Cinematic WebGL boot
└── Single-screen laboratory
    ├── Center: planet while engineering; organism while designing; analysis while interpreting
    ├── Right: phase controls; Planet engineering always owns world parameters here
    └── Planet phase only: camera, rotation, and scientific views
```

The important object changes with the phase. Planet engineering centers the procedural planet. Design life centers the organism while retaining a smaller live planet inset. Analyze centers calculated evidence while keeping the planet as a smaller contextual view. The interface does not navigate through briefing, hypothesis, quiz, debrief, archive, and competency screens.

## Startup

The application begins on a real startup state, not directly inside the laboratory. The Xenogenesis banner sits between a frozen candidate world and a warmer world in a projection-like star field. Short Vespera expedition copy establishes the objective before one explicit entry action. English and Polish flag controls remain bottom-centred. There is no central orbital/loading animation. Reduced-motion preferences collapse ambient planet and star movement without blocking entry.

Do not imply a remote service is contacted during local shader or rules initialization.

## Desktop behavior

At widths of `1080px` or more, use a full-screen `100svh` shell without global page scrolling:

- the right panel scrolls independently;
- the phase's primary visual stays centered;
- the current phase and next action stay visible;
- scientific overlays appear above the same persistent scene;
- the simulation animation overlays the planet without rebuilding it.

In Planet Engineering only, the central globe supports drag rotation, wheel zoom, camera reset, paused/resumed automatic rotation, and scientific views. Design Life and Analyze are static inspection stages and do not show these controls or input hints.

## Narrow-screen behavior

The laboratory is temporarily desktop-only. At widths below `1080px`, a translated full-screen notice blocks the boot and laboratory interfaces and asks the learner to open the experiment in a browser at least `1080px` wide. Do not expose a partial mobile or tablet workflow until it has been implemented and verified.

## Visual system

- Near-black and deep navy form the base.
- Cyan and teal indicate active scientific systems and calculated support.
- Amber marks viable-but-incomplete or stale states.
- Rose marks request errors.
- Green/teal habitat markers and amber low-score markers also include text and numeric scores.
- Geist Sans is the interface face; Geist Mono marks telemetry, versions, and state hashes.

Panels use square-to-small-radius hard-science-fiction geometry, subtle borders, restrained transparency, and minimal glow. Typography and evidence must remain more prominent than decoration.

## Procedural planet

The planet is not a static image or pre-rendered texture. It is a deterministic multi-layer WebGL scene:

1. a seeded world-space star field outside the planet group;
2. displaced seeded terrain;
3. separate masked water sphere;
4. independent animated cloud sphere;
5. Fresnel/scattering-style atmosphere shell;
6. procedural ice, dry-sand, thermally altered terrain, and biosphere masks;
7. optional temperature and animated radiation views, with a readable radiation trace also in realistic view;
8. conditional, broken polar auroral ovals without magnetic field-line geometry;
9. result-driven representative region markers.

All environment controls update shader targets. Uniforms ease toward those targets, so ice, water, cloud, atmosphere, illumination, relief, and biome changes appear as a process rather than a texture swap. Geometry remains allocated across changes. Range thumbs retain native immediate movement, use a larger hit area, and coalesce derived-world updates to one per rendered frame during a drag. The temperature slider maps its left half from the configured minimum to `90°C`, then maps its right half to the positive maximum so the broad high-temperature range remains practical to reach. The water slider reserves its left half for `0–25%`, then maps its right half from `25–100%` so learners can inspect dry and continental worlds. The radiation slider reserves its left half for the low-dose `0–0.52 mSv/h` range with `0.00001 mSv/h` precision, then maps the remaining range to `3 mSv/h`.

Water coverage maps `0%` to no visible surface water. Rivers strengthen through `10%` liquid inventory, larger inland water bodies appear from `10–25%`, and the slower continental shoreline curve thereafter keeps substantial land visible at `70%`; only `100%` rises above the tallest procedural summit. The same elevation field determines the visible water mask and shoreline, so intermediate inventory values cannot produce detached visual islands from a mismatched cutoff. Freezing requires supplied water and phase support: `36±4°C` cannot create snow, while `−40±4°C` freezes the complete exposed inventory. Terrain, rivers, and water bodies use one curved latitude-plus-local-terrain temperature field, so frozen zones receive frozen rivers rather than liquid blue lines. Clouds require effective humidity, exposed water, and atmosphere. A zero-water world produces zero humidity and clouds; a fully liquid ocean under an atmosphere has a small evaporation-driven humidity floor even if the learner's humidity preference is zero. Dry terrain becomes sandy under mild conditions because aridity, not a `60°C` switch, is the primary visual control. Temperate, humid, pressure-supported terrain receives an olive ground-colour convention before the user has simulated a biosphere; it communicates an Earth-like surface appearance, not confirmed vegetation or life. Plant-like green biosphere coverage still depends on the deterministic simulation and fades from `45°C` and is absent by `60°C`. The expanded `−273…1800°C` mean range uses a basaltic visual convention: melting blends in across `780–1050°C`, and glowing channels become visible without claiming active volcanism. At zero local pressure, exposed water, clouds, atmosphere, atmospheric rim light, and auroras disappear immediately; the radiation overlay remains available only after explicitly selecting its scientific view. The radiation slider reserves its left half for `0–0.52 mSv/h` with `0.00001 mSv/h` precision, then maps linearly to its maximum; the carbon-dioxide partial-pressure slider applies the same two-stage treatment with a `0–0.001 atm` low range. A distant, enlarged sun supplies one world-space lighting direction; reset starts on its day side and the darker hemisphere remains readable. Its white-orange surface uses slowly animated multi-scale noise for convection-like cells, darker filaments, a bright limb, and a restrained corona. It rotates at a deliberately much slower rate than the planet, so it reads as a stellar body rather than a second planet. This is visual storytelling, not a stellar-physics calculation. Deep-space stars are Three.js points on seeded three-dimensional shells outside the rotating planet group. Temperature and radiation overlays have labelled three-point legends and remain communication overlays, not physical sensor products.

Gravity does not reshape continents or recolor snow. It immediately caps effective surface pressure with the documented educational ceiling `min(stored pressure, 5 × gravity²) atm`, capped at `5 atm`; the stored pressure preference remains available when gravity increases. This limit propagates to gas partial pressure, density, water stability, humidity, clouds, and aurora support. A complete escape model would still require radius, mass distribution, composition, temperature history, stellar wind, and high-energy stellar output. Magnetic field is communicated through radiation exposure and an atmospheric aurora rather than field lines. Auroras strengthen smoothly only when atmosphere, magnetic field, and incident radiation are all present; they are not a magnetosphere or particle-transport calculation.

The terrain presentation uses one seeded field for mountain ranges, canyon cuts, and the waterline. Its high-resolution terrain and water meshes use a separate ridged mountain field and smaller alpine breakup to avoid a faceted, single-noise appearance. A low nonzero liquid-water inventory can show lakes or drainage lines through a documented visual shoreline curve; this improves legibility but does not model real erosion, river networks, or exact surface-area coverage. At high temperatures, sparse procedural lava channels appear from `450°C` and intensify continuously to `1800°C`; a restrained animated heat-shimmer treatment supports the hot-surface reading without changing deterministic simulation facts.

## Environment controls

Each slider shows a localized label, current value/unit, a compact Earth-reference value, and one of six ordered captions selected by parameter-specific thresholds. Earth references orient learners but never modify their chosen world; values that cannot be represented by one universal terrestrial measurement are visibly identified as a model convention or proxy. Controls follow the causal order from gravity and stellar energy through atmosphere, composition, temperature, water, humidity, magnetic protection, and radiation. Sliders preserve independent user choices even while a prerequisite makes their physical effect zero; a concise English/Polish notice explains only the immediate physical effect. Derived effects transition continuously instead of rewriting another slider. Planet Engineering and Life Design show a static left panel sourced from the same deterministic world context: climate range, gravity/effective pressure, gas partial pressures, hydrosphere phases, configured/effective humidity, energy/carbon, and radiation protection. Analyze intentionally omits this panel so the outcome evidence remains dominant. Controls must never exist only to change a displayed number.

The first laboratory entry may add one dismissible three-step walkthrough. It dims the laboratory and sequentially highlights the central planet scene, the right engineering controls, and the left deterministic-evidence panel. Each step uses one brief contextual card; it must remain local to the browser, never force phase navigation, and remain available again from the header guide control. The right panel may show the compact three-step experiment path, a short last-change consequence, and an optional temperate starting experiment alongside the barren baseline reset. Every slider also has a compact exact-number input; typed values are clamped to the same physical bounds as the slider. The Design Life preflight is advisory and displays only already-derived facts: liquid-water availability, the presence of a supported metabolic pathway, and a radiation-exposure band. It cannot block the learner, calculate a new score, or present itself as the final survival result.

Changing a parameter after a simulation marks the old calculation stale. Results may remain visible for comparison, but markers, biosphere, AI requests, and generated image are withheld until a re-run.

## Lifeform designer

Traits are grouped into Body, Physiology, Senses, Reproduction, and Complexity. Every card shows:

- name;
- advantage;
- tradeoff;
- selection state.

Design Life starts with an empty trait set. There is no budget meter or trait-count ceiling. Every complete mutually exclusive alternative set uses a single description-first dropdown, including organism form, body size and support, movement, symmetry, respiratory organ, metabolism, energy capture, thermal strategy, reproductive mode, and reproductive investment. Cross-constraints that are not alternative sets — such as a unicellular form with complex anatomy — reconcile automatically by replacing the incompatible prior selection. The procedural field model always uses the engineered planet's terrain, surface water or ice, atmosphere, temperature, and light. Every selectable trait produces a visible anatomical or life-cycle response, including eggs for protected reproduction, gills and fins for aquatic plans, grasping hands and neural structures for advanced plans, and cell-scale morphology for unicellular plans. The central heading reads Lifeform Designer. Planet scientific-mode buttons, camera reset, rotation pause, and input hints remain hidden in this static inspection phase.

## Results

The Analyze panel presents evidence in this order:

1. provenance and summarized outcome;
2. advanced-life objective score;
3. 11 metric bars with descriptions;
4. six regional scores linked to planet markers;
5. 200-step population trend labelled as model years, with a cursor-following year/population readout and deterministic pressure/opportunity event details shown only while their chart markers are hovered or focused, plus summary values;
6. comparison against the previous run;
7. organism field model and optional generated illustration;
8. optional consultant interpretation;
9. Adapt planet / Adapt lifeform actions and educational limitation.

If essential water, energy, metabolic, thermal, or radiation support is absent, survivability and population are zero. Analyze centres this evidence, explains the limiting deterministic conditions in the failure state, and hides planet scientific-mode and camera controls. On desktop, its contextual visual column stacks a square `1:1` planet preview above the organism preview rather than overlaying either one, preserving space for the Life Sciences Consultant in the evidence panel. Its larger regional cards use distinct parameter-driven mini-scenes: shoreline, equatorial surface, polar ice, deep water, cave strata, and cloud-level peaks respond to water phase, temperature extrema, atmospheric pressure, light, and radiation. They are explanatory visual interpretations of the current planet, not a spatial climate model. Optional AI field images use an uncropped 3:2 frame and expose a download control.

Do not reduce the model to success/failure or hide scores behind prose.

## Provenance and failures

Keep these sources visibly distinct:

- local deterministic calculation;
- procedural visual interpretation;
- GPT-5.6 server-side interpretation;
- local scientific fallback;
- GPT-guided generated illustration;
- procedural organism fallback.

A network or provider failure must preserve the planet, selected traits, calculation, chart, and procedural organism. Error copy identifies the failed optional stage and provides a safe retry. Raw prompts, keys, provider errors, and stack traces are never displayed.

## Illustration rules

Generated images should resemble neutral astrobiology field documentation or restrained scientific concept art. GPT-5.6 Luna-low provides a Zod-validated English composition brief and constrained visual direction from the supplied deterministic experiment. The server then appends every normalized planet parameter, every selected trait configuration, calculated survivability, the highest-scoring regional context, and non-negotiable prohibitions. It must render the organism in that regional environment and may depict only selected traits and supplied world conditions. An airless barren world must show exposed rock, regolith, dust, and stellar light against black space; it must not show atmosphere, haze, clouds, auroras, fog, snow, frost, ice, liquid water, or another water phase. If calculated survivability is `≤25%` (including zero), it must instead show an intact dead specimen matching those traits—never a thriving organism, gore, or unsupported anatomy. This is an illustration convention tied to deterministic output, not additional biological evidence. The UI may show only provider-emitted partial images and real request stages; it must not show a simulated percentage or invented progress.

Do not imitate named artists or protected franchises. Do not present generated pixels as evidence. The deterministic organism SVG remains the honest no-network fallback.

## Accessibility and localization

- All visible and accessible text goes through `src/app/copy.ts`.
- English and Polish must remain structurally complete and reviewed together.
- Language changes update `<html lang>`, title, and description.
- Use semantic headings, navigation, labels, outputs, figures, pressed/selected state, and live notices.
- Maintain visible keyboard focus and meaningful image alternatives.
- Do not rely on color alone.
- Honor `prefers-reduced-motion`.

## Guided walkthrough

The first-run walkthrough is a compact, dimmed desktop overlay with a single highlighted target and one fixed bottom guide card. Every guide transition resets the laboratory scroll positions to the top. It follows the actual working sequence: Planet Designer (scene, right controls, a slider, left evidence and World story), Design Life (preview, controls, dropdowns, left Hypothesis story, trait evidence/readiness), then Analyze (survivability, forces, regional refuge, population/event chart, illustration, consultant). After the parameter explanation it loads the temperate starting experiment; before analysis it loads a compatible example lifeform and runs the real deterministic simulation. Ending or dismissing the guide fully resets the lab and returns the learner to Planet Designer.

## Current verification note

The cinematic boot, desktop laboratory, WebGL globe, life designer, deterministic result, consultant fallback, organism-image fallback, and English/Polish switching were inspected in the local browser on 2026-07-19. Narrow/mobile layouts are intentionally blocked until a separate responsive implementation and device verification are completed.

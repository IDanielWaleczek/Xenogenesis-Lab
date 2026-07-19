# Xenogenesis Lab — Design

## Direction

Xenogenesis Lab should feel like a focused orbital astrobiology workstation: restrained, precise, atmospheric, readable, and credible. The experience is playful through experimentation, not through cartoon decoration, points, or a hidden quiz answer.

Avoid excessive neon, generic cyberpunk ornament, oversized mobile cards, long onboarding prose, imitation of established science-fiction franchises, and visual effects that obscure scientific evidence.

## Information hierarchy

```text
Cinematic boot
└── Single-screen laboratory
    ├── Left: mission guidance + live physical readouts
    ├── Center: planet while engineering; organism while designing; analysis while interpreting
    ├── Right: phase controls; Planet engineering always owns world parameters here
    └── Floating actions: camera and rotation
```

The important object changes with the phase. Planet engineering centers the procedural planet. Design life centers the organism while retaining a smaller live planet inset. Analyze centers calculated evidence while keeping the planet as a smaller contextual view. The interface does not navigate through briefing, hypothesis, quiz, debrief, archive, and competency screens.

## Startup

The application begins on a real startup state, not directly inside a mission. The animation presents the Xenogenesis mark in a field of stars, orbiting planets, and a small life-like orbital signal. It does not enter the laboratory automatically and offers one explicit Begin training action. It is an atmospheric introduction, not a fake loading or remote-system diagnostic. Reduced-motion preferences collapse its motion without blocking entry.

Do not imply a remote service is contacted during local shader or rules initialization.

## Desktop behavior

At widths above `1080px`, use a full-screen `100svh` shell without global page scrolling:

- the left and right panels scroll independently;
- the phase's primary visual stays centered;
- the current phase and next action stay visible;
- scientific overlays appear above the same persistent scene;
- the simulation animation overlays the planet without rebuilding it.

The central globe supports drag rotation, wheel zoom, camera reset, and paused/resumed automatic rotation. A compact desktop hint explicitly names left-button drag and mouse-wheel zoom.

## Responsive behavior

At narrower widths, phase navigation becomes a sticky three-tab control and the visual stage remains sticky below it. The planet therefore remains visible while the learner scrolls controls or results; during Design life, the organism is the persistent central visual and a smaller planet remains visible beside it. A separate mobile hint names one-finger rotation and two-finger pinch zoom. Environment controls may use two columns on tablet and one on phone. Do not horizontally compress all three desktop columns.

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

All environment controls update shader targets. Uniforms ease toward those targets, so ice, water, cloud, atmosphere, illumination, relief, and biome changes appear as a process rather than a texture swap. Geometry remains allocated across changes. Range thumbs retain native immediate movement, use a larger hit area, and coalesce derived-world updates to one per rendered frame during a drag.

Water coverage maps `0%` to no visible surface water and raises the ocean from the deepest basins toward the highest summit as it approaches `100%`; the water mesh is not globally enlarged above the terrain. Freezing requires supplied water and phase support: `36±4°C` cannot create snow, while `−40±4°C` freezes the complete exposed inventory. Mixed climates render phase locally: for example, an equator at `41°C` remains liquid while sub-zero polar water freezes. Mean temperature and variation produce local thermal zones in degrees Celsius; the equator reaches the configured hot extreme and the poles reach the cold extreme. Clouds require effective humidity, exposed water, and atmosphere; zero water or zero humidity produces exactly zero cloud cover. Dry terrain becomes sandy under mild conditions because aridity, not a `60°C` switch, is the primary visual control. Plant-like green coverage fades from `45°C` and is absent by `60°C`. The expanded `−273…1800°C` mean range uses a basaltic visual convention: melting blends in across `780–1050°C`, and glowing channels become visible without claiming active volcanism. At zero local pressure, exposed water, clouds, atmosphere, atmospheric rim light, and auroras disappear immediately; the radiation overlay remains available only after explicitly selecting its scientific view. A distant, enlarged sun supplies one world-space lighting direction; reset starts on its day side and the darker hemisphere remains readable. Its white-orange surface uses slowly animated multi-scale noise for convection-like cells, darker filaments, a bright limb, and a restrained corona. It rotates at a deliberately much slower rate than the planet, so it reads as a stellar body rather than a second planet. This is visual storytelling, not a stellar-physics calculation. Deep-space stars are Three.js points on seeded three-dimensional shells outside the rotating planet group. Temperature and radiation overlays have labelled three-point legends and remain communication overlays, not physical sensor products.

Gravity does not reshape continents, recolor snow, or overwrite supplied atmosphere and water. It remains a deterministic biological and movement input; inferring volatile retention without mass, radius, composition, temperature history, stellar wind, and geology would be false precision. Magnetic field is communicated through radiation exposure and an atmospheric aurora rather than field lines. Auroras strengthen smoothly only when atmosphere, magnetic field, and incident radiation are all present; they are not a magnetosphere or particle-transport calculation.

## Environment controls

Each slider shows a localized label, current value/unit, and one of six ordered captions selected by parameter-specific thresholds. Controls follow the causal order from gravity and stellar energy through atmosphere, composition, temperature, water, magnetic protection, and radiation. Sliders preserve independent user choices even while a prerequisite makes their physical effect zero; an English/Polish notice explains when the stored value will become effective again. Derived effects transition continuously instead of rewriting another slider. Controls must never exist only to change a displayed number.

Changing a parameter after a simulation marks the old calculation stale. Results may remain visible for comparison, but markers, biosphere, AI requests, and generated image are withheld until a re-run.

## Lifeform designer

Traits are grouped into Body, Physiology, Senses, Reproduction, and Complexity. Every card shows:

- name;
- integer cost;
- advantage;
- tradeoff;
- selection state.

Conflicting or over-budget traits remain inspectable but cannot be added. The budget meter and selected count remain visible. The procedural field model updates from seed, world, and traits and should resemble neutral scientific documentation rather than a mascot.

## Results

The Analyze panel presents evidence in this order:

1. provenance and summarized outcome;
2. advanced-life objective score;
3. reproducible state hash and simulator version;
4. 11 metric bars with descriptions;
5. strongest and limiting systems;
6. six regional scores linked to planet markers;
7. 40-generation population trend and summary values;
8. comparison against the previous run;
9. organism field model and optional generated illustration;
10. optional consultant interpretation;
11. Adapt planet / Adapt lifeform actions and educational limitation.

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

Generated images should resemble neutral astrobiology field documentation or restrained scientific concept art. The server prompt may depict only selected traits and supplied world conditions. GPT chooses validated pose, viewpoint, lighting, and emphasis enums; it cannot add free-form anatomy.

Do not imitate named artists or protected franchises. Do not present generated pixels as evidence. The deterministic organism SVG remains the honest no-network fallback.

## Accessibility and localization

- All visible and accessible text goes through `src/app/copy.ts`.
- English and Polish must remain structurally complete and reviewed together.
- Language changes update `<html lang>`, title, and description.
- Use semantic headings, navigation, labels, outputs, figures, pressed/selected state, and live notices.
- Maintain visible keyboard focus and meaningful image alternatives.
- Do not rely on color alone.
- Honor `prefers-reduced-motion`.

## Current verification note

The cinematic boot, desktop laboratory, WebGL globe, life designer, deterministic result, consultant fallback, organism-image fallback, and English/Polish switching were inspected in the local browser on 2026-07-19. A narrow in-app-browser viewport was not available in that pass; responsive CSS and production rendering still require final device verification before submission.

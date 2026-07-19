# Xenogenesis Lab — Design

## Direction

Xenogenesis Lab should feel like a focused orbital astrobiology workstation: restrained, precise, atmospheric, readable, and credible. The experience is playful through experimentation, not through cartoon decoration, points, or a hidden quiz answer.

Avoid excessive neon, generic cyberpunk ornament, oversized mobile cards, long onboarding prose, imitation of established science-fiction franchises, and visual effects that obscure scientific evidence.

## Information hierarchy

```text
Cinematic boot
└── Single-screen laboratory
    ├── Left: mission objective + environmental engineering
    ├── Center: dominant interactive procedural planet
    ├── Right: Engineer planet / Design life / Analyze
    └── Floating actions: camera, rotation, simulate, adapt
```

The planet remains the dominant visual object. The interface does not navigate through briefing, hypothesis, quiz, debrief, archive, and competency screens. It keeps one continuous experiment visible and lets the learner repeat the core loop.

## Startup

The application begins on a real startup state, not directly inside a mission. The skippable animation shows five truthful initialization steps, progress, system identity, and a final online state. It may transition automatically after completion. Reduced-motion preferences collapse its motion without blocking entry.

Do not imply a remote service is contacted during local shader or rules initialization.

## Desktop behavior

At widths above `1080px`, use a full-screen `100svh` shell without global page scrolling:

- the left and right panels scroll independently;
- the center planet stays visible;
- the current phase and next action stay visible;
- scientific overlays appear above the same persistent scene;
- the simulation animation overlays the planet without rebuilding it.

The central globe supports drag rotation, wheel zoom, camera reset, and paused/resumed automatic rotation.

## Responsive behavior

At narrower widths, phase navigation becomes a sticky three-tab control. The planet remains first and visible; the relevant control or analysis panel follows with natural page scrolling. Environment controls may use two columns on tablet and one on phone. Do not horizontally compress all three desktop columns.

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

1. displaced seeded terrain;
2. separate masked water sphere;
3. independent animated cloud sphere;
4. Fresnel/scattering-style atmosphere shell;
5. procedural ice and biosphere masks;
6. optional temperature or radiation view;
7. result-driven representative region markers.

All environment controls update shader targets. Uniforms ease toward those targets, so ice, water, cloud, atmosphere, illumination, relief, and biome changes appear as a process rather than a texture swap. Geometry remains allocated across changes.

The realistic view is an orbital visual interpretation. Temperature and radiation views are scientific communication overlays, not physical sensor products.

## Environment controls

Each slider shows a localized label, current value/unit, and one sentence connecting the parameter to world appearance and biological pressure. Controls must never exist only to change a displayed number. The first-use instruction tells the learner to change one or two inputs, observe, then design life.

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

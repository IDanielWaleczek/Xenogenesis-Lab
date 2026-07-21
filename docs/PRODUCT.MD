# Xenogenesis Lab — Product Definition

## Product statement

Xenogenesis Lab is an AI-guided procedural astrobiology simulator. A learner engineers a planet, designs a form of alien life, and tests whether the coupled world-organism system can survive, reproduce, form a stable ecosystem, and support advanced life.

It is an exploratory scientific laboratory, not a quiz, chatbot, parameter dashboard, or unconstrained creature generator.

## Problem

Planetary habitability is usually taught as static facts. Learners rarely get to manipulate interacting planetary systems, make a biological design, see population consequences, and revise one variable from evidence. The subject becomes easier to understand when water, atmosphere, energy, radiation, metabolism, reproduction, and complexity visibly compete.

## Product promise

The user receives immediate visual feedback, reproducible calculations, multiple viable strategies, and short contextual AI guidance inside one repeatable laboratory loop:

```text
Observe → Modify Planet → Design Life → Simulate → Visualize → Adapt
```

No hidden exact configuration is presented as the answer. The outcome is evaluated from continuous interacting scores.

## Baseline workspace

The cinematic Vespera expedition screen frames the story before the laboratory opens. The deterministic workspace starts from a barren world: no atmosphere, accessible water, humidity, or magnetic protection. Users may change gravity, mean temperature, symmetric temperature variation, local atmospheric pressure, oxygen, carbon dioxide, surface water, radiation, stellar energy, humidity, and magnetic-field strength. They then build a lifeform from a blank trait selection and simulate 200 generations with deterministic environmental events.

The simulation may produce extinction, temporary survival, a regional refuge, a stable simple population, expansion, unstable dominance, a stable multicellular ecosystem, or advanced adaptable life. The user can revise the same experiment without reloading.

## Required experience loop

1. Boot the laboratory computer.
2. Inspect the seeded baseline world.
3. Rotate and observe the seeded planet.
4. Change world parameters and see layered WebGL transitions immediately.
5. Use realistic, temperature, and radiation views to form a strategy.
6. Select compatible body, physiology, sensory, reproduction, and complexity traits.
7. Read the active parameter-backed climate, atmosphere, water-phase, humidity, energy, and radiation evidence while designing and reviewing the organism.
8. Run the deterministic suitability, region, and 200-generation event model.
9. Inspect the organism visualization, scores, regional evidence, event timeline, and strict extinction result when essential support is absent.
10. Optionally request GPT-5.6 scientific interpretation and a downloadable 3:2 field illustration.
11. Change the planet or organism and compare the next run.

The initial submission completes this loop for one polished laboratory workspace before adding persistence or a library of saved worlds.

## Product language

## 2026-07-21 interface refinement

The boot screen is part of the story, not a loading state: two parameter-backed WebGL worlds rotate slowly in a shared star field behind the Xenogenesis banner. English and Polish remain the only supported languages and use the supplied flag images.

Planet Engineering and Design Life now begin with short plain-language teaching summaries derived from active deterministic world evidence. The life summary also references only the learner's selected traits; it is not an AI result or a hidden simulation rule. Design Life presents mutually exclusive unicellular and multicellular forms as one dropdown choice. Its supporting facts describe the current design while Analyze retains survival evidence.

Analyze reports organism survivability rather than advanced-life potential as the prominent percentage. Its 200 deterministic steps are presented as **model years** solely to make the trend easier to read; they are not an asserted evolutionary chronology. Event icons show their population value and reveal their contextual detail on interaction. Regional mini-scenes are explanatory visual interpretations of the current planet and must not be treated as spatial climate predictions.

Prefer: Engineer planet, Design life, Survival analysis, Advanced-life potential, Regional survival, Population stability, Life Sciences Consultant, Field illustration, Adapt planet, and Adapt lifeform.

Avoid hypothesis, correct answer, hidden ruleset, competency score, certification, and chatbot framing. The learner is conducting an experiment, not answering a test.

## Scientific and AI boundary

The deterministic layer owns physical derivations, trait modifiers and conflicts, viability gates, all suitability scores, region scores, population events and output, outcome, success evaluation, and reproducibility hash.

GPT-5.6 may:

- explain the validated planet and completed result;
- identify visible risks and tradeoffs;
- name and describe the configured organism;
- recommend one controlled follow-up experiment;
- choose constrained pose, viewpoint, lighting, and emphasis values for an illustration.

GPT-5.6 may not calculate or overwrite model values, add unsupported anatomy, reveal a hidden answer, call continuously during parameter editing, or present speculation as measured fact. Zod validates all external data. The server constructs the final image prompt from deterministic facts and selected traits.

## Current implementation status

The working local build implements a story-led Vespera boot with frozen and warm worlds, banner branding, bottom-centred flag language controls, eleven environment controls, a deterministic seeded 3D planet, custom terrain/water/ice/vapor/atmosphere/radiation/molten-rock shaders, a distant flared sun/day-night treatment, radiation and aurora presentation, labelled scientific overlays, and regional analysis. The blank-start lifeform designer exposes 44 traits with conflicts and visible anatomical responses. Simulator 1.7.0 evaluates 200 generations, six parameter-driven event types, strict viability gates, comparison state, server-only GPT-5.6 and image routes, honest fallbacks, downloadable 3:2 images, and complete English/Polish copy.

The local deterministic loop and fallback paths were browser-verified. Live GPT-5.6 and `gpt-image-2` responses remain **TODO: verify with deployed server credentials**. Accounts, persistence, sharing, a campaign, and durable caching are not implemented.

Surface-water inventory and humidity remain distinct user inputs. Water sets the available hydrosphere; humidity is the preferred atmospheric moisture state. The model expresses humidity only when there is both atmosphere and phase-supported exposed water, so adding water does not silently force a particular humidity.

## Experience requirements

Desktop uses a full-screen laboratory with independently scrolling side panels. Planet engineering centers the planet, Design life centers the organism with a smaller planet inset, and Analyze centers the evidence with a smaller contextual planet. Mobile keeps the phase visual sticky: the planet remains visible in every phase and the organism remains central during life design.

Prioritize immediate comprehension, keyboard access, touch-safe controls, readable contrast, visible provenance, reduced-motion support, graceful failure, and reviewed English/Polish text.

## Out of scope for the vertical slice

- evolutionary trees or hundreds of species;
- creature animation or ground exploration;
- full spatial climate, geology, fluid, or atmospheric chemistry simulation;
- a simulated food web or genetic inheritance;
- accounts, multiplayer, or a large campaign;
- presenting shader output as measured science;
- calling AI for deterministic feedback or every slider change.

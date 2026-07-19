# Xenogenesis Lab — Product Definition

## Product statement

Xenogenesis Lab is an AI-guided procedural astrobiology simulator. A learner engineers a planet, designs a form of alien life, and tests whether the coupled world-organism system can survive, reproduce, form a stable ecosystem, and support advanced life.

It is an exploratory scientific laboratory, not a quiz, chatbot, parameter dashboard, or unconstrained creature generator.

## Problem

Planetary habitability is usually taught as static facts. Learners rarely get to manipulate interacting planetary systems, make a biological design, see population consequences, and revise one variable from evidence. The subject becomes easier to understand when water, atmosphere, energy, radiation, metabolism, reproduction, and complexity visibly compete.

## Product promise

The learner receives immediate visual feedback, reproducible calculations, multiple viable strategies, and short contextual AI guidance inside one repeatable loop:

```text
Observe → Modify Planet → Design Life → Simulate → Visualize → Adapt
```

No hidden exact configuration is presented as the answer. Mission success is a broad outcome evaluated from continuous interacting scores.

## First mission

**Genesis 01 · Vespera 7A**

> Engineer the planet and design a stable, advanced multicellular lifeform capable of persisting there.

The mission supplies a deterministic seed and baseline world. Learners may change gravity, mean temperature, local atmospheric pressure, oxygen, carbon dioxide, water, radiation, stellar energy, humidity, and magnetic-field strength. They then select biologically meaningful traits within an explicit energy budget and simulate 40 generations.

The mission may produce extinction, temporary survival, a regional refuge, a stable simple population, expansion, unstable dominance, a stable multicellular ecosystem, or advanced adaptable life. The user can revise the same experiment without reloading.

## Required experience loop

1. Boot the laboratory computer.
2. Read the broad mission objective and concrete first-use instruction.
3. Rotate and inspect the seeded planet.
4. Change world parameters and see layered WebGL transitions immediately.
5. Use realistic, temperature, and radiation views to form a strategy.
6. Select compatible body, physiology, sensory, reproduction, and complexity traits.
7. Keep the design within the 100-point biological energy budget.
8. Run the deterministic suitability, region, and population model.
9. Inspect the organism visualization, scores, habitat markers, and timeline.
10. Optionally request GPT-5.6 scientific interpretation and a controlled field illustration.
11. Change the planet or organism and compare the next run.

The initial submission completes this loop for one polished mission before adding persistence or a mission library.

## Product language

Prefer: Engineer planet, Design life, Survival analysis, Advanced-life potential, Regional survival, Population stability, Life Sciences Consultant, Field illustration, Adapt planet, and Adapt lifeform.

Avoid hypothesis, correct answer, hidden ruleset, competency score, certification, and chatbot framing. The learner is conducting an experiment, not answering a test.

## Scientific and AI boundary

The deterministic layer owns physical derivations, trait costs and conflicts, all suitability scores, region scores, population output, outcome, success evaluation, and reproducibility hash.

GPT-5.6 may:

- explain the validated planet and completed result;
- identify visible risks and tradeoffs;
- name and describe the configured organism;
- recommend one controlled follow-up experiment;
- choose constrained pose, viewpoint, lighting, and emphasis values for an illustration.

GPT-5.6 may not calculate or overwrite model values, add unsupported anatomy, reveal a hidden answer, call continuously during parameter editing, or present speculation as measured fact. Zod validates all external data. The server constructs the final image prompt from deterministic facts and selected traits.

## Current implementation status

The working local build implements the boot, one Vespera mission, ten environment controls, a deterministic seeded 3D planet, custom terrain/water/cloud/atmosphere shaders, scientific overlays, region inspection, 33 life traits with costs and conflicts, procedural organism morphology, simulator 1.0.0, population timeline, comparison state, server-only consultant and image routes, honest fallbacks, and complete English/Polish copy.

The local deterministic loop and fallback paths were browser-verified. Live GPT-5.6 and `gpt-image-2` responses remain **TODO: verify with deployed server credentials**. Accounts, persistence, sharing, a campaign, and durable caching are not implemented.

## Experience requirements

Desktop uses a full-screen laboratory with independently scrolling side panels and a dominant planet. The learner’s next action remains visible. Mobile keeps the planet visible and exposes the three phases as tabs with natural page scrolling.

Prioritize immediate comprehension, keyboard access, touch-safe controls, readable contrast, visible provenance, reduced-motion support, graceful failure, and reviewed English/Polish text.

## Out of scope for the vertical slice

- evolutionary trees or hundreds of species;
- creature animation or ground exploration;
- full spatial climate, geology, fluid, or atmospheric chemistry simulation;
- a simulated food web or genetic inheritance;
- accounts, multiplayer, or a large campaign;
- presenting shader output as measured science;
- calling AI for deterministic feedback or every slider change.

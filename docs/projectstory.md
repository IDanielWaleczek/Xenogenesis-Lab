# Xenogenesis Lab

## Inspiration

Xenogenesis Lab began with a simple question: if we could change a planet’s gravity, atmosphere, water, temperature, radiation, and available energy, what kinds of life could survive there?

Astrobiology is often presented through articles, lectures, and diagrams. They explain the science, but they rarely let people experiment with it. I wanted to create an experience where you can change a world, design an organism for it, observe the consequences, and learn through iteration rather than by looking for one correct answer.

## What it does

Xenogenesis Lab is an AI-guided astrobiology simulator set during the first biosphere experiment on the fictional world Vespera. You enter a continuous laboratory where you engineer a planet, design a lifeform, and explore whether that lineage can endure.

```text
Observe → Modify Planet → Design Life → Simulate → Visualize → Adapt
```

You can adjust eleven connected planetary conditions, including gravity, temperature, atmospheric pressure and composition, water, humidity, radiation, stellar energy, and magnetic protection. A responsive 3D planet changes with these decisions: terrain, oceans, ice, clouds or vapor, atmosphere and radiation.

Then you design a lifeform from compatible traits spanning body structure, physiology, senses, reproduction, and complexity. Every trait has a benefit and a tradeoff, and changes the procedural organism preview. There is no single correct creature: an aerobic surface organism and a geochemically powered aquatic organism can each succeed under different conditions.

When you run the simulation, Xenogenesis Lab evaluates life support, eleven suitability metrics, six representative regions, and a population across 200 model years. Environmental pressure and recovery events make losses and rebounds visible. You can inspect survivability, regional refuges, population stability, trait tradeoffs, and the final outcome, then change a condition and run the next experiment.

## How I built it

Xenogenesis Lab is a full-stack TypeScript application built with Next.js, React, React Three Fiber, Three.js, custom GLSL shaders, Zod, Vitest, and the OpenAI JavaScript SDK.

The project keeps three responsibilities separate:

- A deterministic simulation engine calculates world conditions, viability, trait effects, regional survival, population events, and outcomes.
- A persistent WebGL renderer turns those calculated conditions into an explorable visual planet and organism.
- GPT-5.6 acts as a Life Sciences Consultant, explaining the result, identifying tradeoffs, and suggesting one focused next experiment.

The optional organism field illustration uses `gpt-image-2`. Its visual direction is grounded in the chosen traits and simulated world, so the imagery supports the experiment instead of replacing it with an unrelated creature prompt.

Codex with GPT-5.6 accelerated the implementation across interface design, simulation logic, shader work, structured AI integration, tests, bilingual copy, and documentation. I directed the key product choices: make the planet central, let learners experiment freely, keep the science understandable, and use AI for explanation and visualization rather than as a black-box answer generator.

## Challenges I ran into

The main challenge was balancing generative AI with scientific coherence. Letting a model invent the simulation would make the result difficult to understand and reproduce. Using only a calculator, on the other hand, would make a complex world less approachable. The solution was to let the deterministic simulator calculate the experiment, while GPT-5.6 explains its implications in clear language and helps visualize the designed organism.

Keeping the visual result consistent was another challenge. A striking alien organism is not useful if it contradicts the planet it lives on. The illustration workflow is therefore built around the actual world conditions, selected traits, survivability, and habitat context.

The interface also had to communicate a dense model without turning into a spreadsheet. The result is a focused laboratory experience: the planet is central while engineering, the organism is central while designing, and survival evidence is central during analysis. The experience is available in English and Polish.

## Accomplishments that I'm proud of

I am proud that Xenogenesis Lab is more than a parameter form or an AI creature generator. It is a connected experiment where your planetary decisions, organism design, and survival evidence remain linked.

- A seeded 3D planet with responsive custom GLSL layers.
- Eleven interconnected world controls with visible consequences.
- A lifeform designer with meaningful anatomy, benefits, tradeoffs, and compatible traits.
- A deterministic 200-year survival model with regional context and population events.
- A GPT-5.6 Sciences Consultant and optional AI-guided field illustration.
- English and Polish interface support.
- One focused loop built around curiosity, experimentation, and revision.

## What I learned

The most useful role for AI in education is not necessarily generating more information. It can help people interpret evidence after they have made a decision. In Xenogenesis Lab, you can change one environmental factor, see how it changes the experiment, inspect why a lineage succeeded or failed, and decide what to test next.

I also learned that AI becomes more valuable when it has a clear role. Keeping calculation, explanation, and visualization distinct makes the experience creative without losing the scientific thread that gives experimentation meaning.

## What's next for Xenogenesis Lab

Xenogenesis Lab can grow with new worlds, additional scientifically reviewed rules, comparative experiments, more organism strategies, evolving ecosystems, educator-authored scenarios, and collaborative exploration.

The long-term goal is to make astrobiology feel less like a distant theory and more like a world you can investigate with your own hands.

# Xenogenesis Lab — Project Story Draft

## Submission-integrity note

This story describes the current repository unless a limitation is explicitly marked. The deterministic simulator, WebGL planet, life designer, population analysis, procedural organism, server routes, and local fallbacks are implemented. Live GPT-5.6 and `gpt-image-2` responses remain **TODO: verify with deployed credentials**. The public URL remains **TODO: verify against repository HEAD**.

Do not submit fallback output as live AI or shader output as measured planetary science.

## The problem

Astrobiology is full of coupled tradeoffs, but it is often experienced as a list of facts. Gravity shapes support structures. Pressure and gas composition change respiration and movement. Water, temperature, radiation, and energy determine where metabolism can persist. Reading those relationships is useful; changing them and watching a designed organism succeed in one region but fail globally makes them understandable.

The early Xenogenesis concept became too much like a quiz. It asked learners to commit a hypothesis before they could comfortably see and manipulate the planet. That created a writing barrier and implied there might be one expected answer.

## The solution

Xenogenesis Lab is the story of Vespera's first biosphere. Between a frozen world and a warm world, the learner enters a continuous laboratory with one personal role: give a silent planet conditions in which a chosen lineage may endure two centuries of change. A seeded 3D planet dominates the workspace. Environmental controls reshape it smoothly and plain-language evidence shows what each decision means for the life about to arrive. A blank-start lifeform designer supports bacteria-like, aquatic, primate-like, and humanlike plans through visible traits and incompatibilities; organism form is one explicit unicellular-or-multicellular choice. The local rules engine follows whether that lineage can find energy, tolerate the world, reproduce, occupy regional refuges, and endure 200 parameter-driven steps presented as model years.

The loop is deliberately experimental:

```text
Observe → Modify Planet → Design Life → Simulate → Visualize → Adapt
```

There is no single planet recipe. A high-energy aerobic surface strategy and a low-light geochemical ocean strategy can both be viable for different reasons.

## What the learner sees

The planet is not a static asset. Custom shaders use a deterministic seed and layered noise to generate orbital-scale terrain, ridges, phase-aware oceans and ice, dry sand, thermally altered or molten basaltic rock, moisture, clouds or steam, atmosphere, and biosphere patches. A distant flared sun gives the world a readable day and night side; zero pressure removes the exposed hydrosphere and every atmosphere-like glow, `−40±4°C` freezes the hydrosphere completely, and hot water becomes vapor when its pressure-dependent boiling point is crossed. The expanded range reaches a documented `780–1050°C` basaltic melt transition without implying volcanism. The radiation view combines a labelled surface map with an animated exposure shell visible only in that scientific mode. Polar auroral ovals make the atmosphere–field–radiation relationship visible without presenting it as measured magnetospheric science.

The organism is not a paragraph. Its immediate procedural field model responds to the current seed and selected body, movement, support, sensory, thermal, radiation, and energy traits. During Design life it becomes the central visual while a smaller live planet remains in view. When deterministic hard life support exists, the designer offers four distinct, checked extreme-life starting strategies; their cold, heat, shielding, biofilm, brine, dormancy, and symbiotic traits remain bound to the same water and metabolism gates. A static left panel, also present during Planet Engineering, shows the exact active climate, atmosphere, water phases, effective humidity, energy/carbon, and radiation protection behind the biological choices. Analyze reserves that space for deterministic outcome evidence. An optional AI-generated field illustration can replace it only after the server grounds the prompt in validated facts.

The survival result is not just success or failure. It includes a prominent survivability measure, 11 interacting scores, six representative habitat regions with parameter-driven visual cues, a population curve, carrying capacity, up to five selected-trait strengths and tradeoffs, and one of eight outcomes. Event icons reveal the affected population and context. The learner can change one variable and compare the next run without restarting.

## Scientific integrity

The simulation is intentionally educational, but deterministic and inspectable. It derives oxygen partial pressure and local atmospheric density, evaluates both configured temperature extremes, requires explicit geochemical energy and electron acceptors, and never reduces radiation because a habitat is labelled cave or deep ocean.

All coefficients live in a versioned convention module. Trait costs and advanced-life qualification thresholds are disclosed as model choices rather than universal biology. A stable input hash makes repeated experiments reproducible.

The shader scene explains state visually but never becomes the source of scientific truth.

## Where GPT-5.6 adds value

GPT-5.6 is a scientific consultant, not the simulator. On request, the server validates the current state, reruns the deterministic model, and asks GPT-5.6 to explain the evidence, tradeoffs, unexpected result, and one controlled next experiment. Zod validates the structured response.

For organism art, GPT-5.6 may choose only a pose, viewpoint, lighting setup, and emphasis. The server constructs the final prompt from selected traits and calculated world facts before calling `gpt-image-2`. This lets AI add interpretation and presentation without inventing a new organism or changing the outcome.

If either service is unavailable, the deterministic experiment remains complete and the interface labels its local or procedural fallback honestly.

## Why the architecture matters

The project is one full-stack Next.js application, but it preserves strict boundaries:

- world validation and scientific derivations are independent of React;
- continuous biology and population calculations are independent of GPT;
- WebGL shaders consume presentation targets, not hidden science;
- server-only routes protect credentials and recompute client state;
- every model response is untrusted until validation;
- English and Polish are compile-time parallel copy structures.

This makes the demo visually ambitious without turning its core into an untestable prompt.

## Codex and human collaboration

Codex accelerated the work that benefited from fast iteration across many layers: repository audit, product reframing, Zod contracts, continuous simulation, coefficient centralization, custom shaders, React implementation, trait data, population tests, server routes, bilingual copy, browser QA, and documentation reconciliation.

The human made the important product choices: replace the quiz with learner freedom, expose all major world systems, make the planet respond smoothly, use multiple biological strategies, keep an animated boot, preserve English and Polish, and prioritize one convincing simulator workspace before optional infrastructure.

The result demonstrates a useful division of labor: human direction and scientific boundaries, Codex-accelerated implementation and verification, deterministic local computation, and GPT-5.6 only where explanation and controlled creative interpretation are valuable.

## Current limitations

The first build contains one baseline seed, six representative regions rather than a spatial climate grid, and one dominant organism rather than a food web. It has no accounts, persistence, campaign, detailed evolution, creature animation, or production rate limiting. Live model behavior and the public deployment must be verified before final submission claims.

## Submission TODOs

- add the primary Codex `/feedback` session ID;
- link the public sub-three-minute YouTube demo;
- verify production equals repository HEAD;
- run live GPT-5.6 and `gpt-image-2` paths;
- update the final verification record and Devpost submission text together.

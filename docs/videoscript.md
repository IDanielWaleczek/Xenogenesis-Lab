# Xenogenesis Lab — 2:45 Working-Build Demo Script

## 0:00–0:16 — Cinematic boot

Show startup from a fresh reload, then select **Begin training** to enter the lab.

> Xenogenesis Lab is a procedural astrobiology simulator. This is a cinematic introduction to a world, its orbit, and the life we might engineer there. Then the lab gives the learner one broad goal: design stable, advanced life.

## 0:16–0:34 — Experimental loop

Pause on the objective and point to the five-step loop.

> This is not a quiz with one hidden answer. The loop is observe, modify, design, simulate, and adapt. The first instruction tells a new learner exactly what to do without asking them to write a hypothesis.

## 0:34–1:02 — Procedural planet

Rotate and zoom the planet. Change temperature, water, atmospheric pressure, and magnetic field. Switch briefly to Temperature and Radiation, then return to Realistic.

> Vespera is generated from a deterministic seed using Three.js, React Three Fiber, layered procedural noise, and custom GLSL. The model preserves every selected preference while dependent controls show effective gas pressure, surface water, and humidity. A dry world has no clouds, `−40±4°C` freezes its exposed ocean, and the expanded range reaches a documented basaltic melt transition only above `780°C`. Vacuum has no atmospheric glow. The reset camera starts on the day side while the night side stays readable, and the full configured temperature variation makes the equator hotter and poles colder. Radiation has a labelled animated exposure layer, while polar auroral ovals explain how atmosphere, field, and radiation interact.

## 1:02–1:28 — Design life

Open Design life. Show the blank organism against the same engineered terrain, the active world-evidence panel, one selected trait, one incompatibility, and two categories. Add protected eggs so eggs appear, then add a structural or sensory trait and show the anatomy update.

> The blank-start organism designer offers 44 biological traits with advantages, vulnerabilities, and conflicts but no arbitrary construction budget. The same deterministic climate, effective atmosphere, water phases, humidity, energy, carbon, and radiation values shown here shape both the run and the organism's visible terrain. Every trait changes the field model: protected eggs add eggs, aquatic anatomy adds fins or gills, and advanced neural and grasping traits support primate-like or humanlike forms.

## 1:28–1:55 — Deterministic simulation

Run the simulation. Keep the animation and then show the outcome, survivability score, scores, regional mini-scenes, and population graph.

> Simulator 2.1.0 runs locally and reproducibly across 200 deterministic model steps, presented as model years for readability. It combines 11 continuous suitability scores with strict minimum life support and sixteen condition-backed event types selected by seeded probability: up to three chart-visible pressures or recovery opportunities can occur from years 10–190, with at least 33 years between them. Where hard life support exists, the designer offers four checked extreme-life starting strategies; unsupported biology still reaches zero survival instead of receiving a polite score. The same world and lifeform always produce the same event draw, impacts, and outcome.

## 1:55–2:13 — Adapt and compare

Return to the planet or life designer, change one variable, rerun, and show the comparison delta.

> The evidence identifies the strongest and limiting systems, so the learner can run a controlled experiment. Multiple strategies work: an aerobic surface organism and a geochemically powered aquatic organism can survive for different reasons.

## 2:13–2:32 — GPT-5.6 consultant and illustration

Request the consultant and keep its provenance label visible.

If the label says **GPT-5.6 analysis**:

> GPT-5.6 receives only validated state and a server-recalculated result. It explains tradeoffs and suggests one experiment; it cannot change a score. Its image direction is restricted to four enums, and the server builds the final organism prompt from deterministic facts.

If the label says **Local scientific fallback**:

> This environment did not return a verified live GPT-5.6 response, so the app clearly labels its deterministic local fallback. I would not submit this recording as proof of the required live model path.

If a live generated image appears:

> `gpt-image-2` now visualizes the validated organism. The image is representation, never simulation evidence.

If the procedural fallback remains:

> Image generation was unavailable, so the deterministic field model remains intact and honestly labelled.

## 2:32–2:45 — Codex development story

Return to a strong three-panel view.

> Codex accelerated the repository refactor, deterministic contracts, continuous population model, custom shaders, bilingual interface, tests, browser QA, and documentation. I directed the product shift, scientific boundaries, learner freedom, and final design decisions. Together they produced one complete educational experiment instead of disconnected AI features.

## Capture checklist

- [ ] Total duration is below three minutes.
- [ ] Audio mentions Codex and GPT-5.6.
- [ ] A real world-control change visibly affects the planet.
- [ ] Trait cost and tradeoff are readable.
- [ ] Deterministic score, state hash, regions, and population appear.
- [ ] Consultant provenance is visible and narration matches it.
- [ ] Generated image is shown only if created live.
- [ ] No local dev tools, keys, prompts, console errors, or TODO UI appears.

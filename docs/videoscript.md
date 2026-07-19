# Xenogenesis Lab — 2:45 Working-Build Demo Script

## Recording rule

Record only the deployed build that matches repository HEAD. Keep the video public on YouTube and under three minutes. Audio must explain both Codex and GPT-5.6 usage.

Before recording:

- verify the live URL, desktop layout, and both OpenAI routes;
- decide whether the consultant label is **GPT-5.6 analysis** or **Local scientific fallback** and read only the matching narration;
- show a generated field illustration only if `gpt-image-2` succeeds live during the recording;
- do not call shader visuals scientific measurements or fallbacks live AI.

## 0:00–0:16 — Cinematic boot

Show startup from a fresh reload and let the system enter the lab.

> Xenogenesis Lab is a procedural astrobiology simulator. It begins like a real research computer, then gives the learner one broad goal: engineer a planet and design stable, advanced life.

## 0:16–0:34 — Mission and experimental loop

Pause on the objective and point to the five-step loop.

> This is not a quiz with one hidden answer. The loop is observe, modify, design, simulate, and adapt. The first instruction tells a new learner exactly what to do without asking them to write a hypothesis.

## 0:34–1:02 — Procedural planet

Rotate and zoom the planet. Change temperature, water, atmospheric pressure, and magnetic field. Switch briefly to Temperature and Radiation, then return to Realistic.

> Vespera is generated from a deterministic seed using Three.js, React Three Fiber, layered procedural noise, and custom GLSL. The scene keeps one terrain mesh while water, ice, clouds, atmosphere, light, radiation, and biome uniforms move smoothly toward every parameter change. Each control also feeds the local science model; none is decorative.

## 1:02–1:28 — Design life

Open Design life. Show the organism, budget, one selected trait, one incompatibility, and two categories. Add or remove one affordable trait.

> The organism designer offers 33 biological traits with costs, advantages, vulnerabilities, and conflicts. High complexity improves adaptation but consumes energy. Radiation repair can slow reproduction. Flight depends on atmosphere and gravity. The procedural field model changes immediately from the seed, planet, and anatomy.

## 1:28–1:55 — Deterministic simulation

Run the simulation. Keep the animation and then show the outcome, state hash, scores, region markers, and population graph.

> Simulator 1.0.0 runs locally and reproducibly for 40 generations. It combines 11 continuous suitability scores rather than checking one correct threshold. It can produce extinction, a regional refuge, simple stability, ecological dominance, a multicellular ecosystem, or advanced adaptable life. Here the same result is tied to a stable state hash.

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

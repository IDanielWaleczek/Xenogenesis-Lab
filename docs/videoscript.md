# Xenogenesis Lab — 2:30 Working-Build Demo

## Recording rule

Record only the deployed build that matches repository HEAD. Before recording, verify the production route and note whether the debrief provenance label says **GPT-5.6 interpretation** or **Local training review**. Use the matching narration below. Do not show image generation, persistent accounts, a mission library, or durable certification; those features are not implemented.

## 0:00–0:15 — Mission Control

Show the opening Vespera briefing and language switch.

> Xenogenesis Lab is an astrobiology mission-training simulator. Instead of generating a creature first, it asks the learner to make a scientific prediction before seeing the model result.

## 0:15–0:40 — Mission briefing

Show the mission objective and verified telemetry.

> This first working mission targets Vespera b: 1.7 g gravity, a wide temperature range, elevated radiation, and limited accessible water. The mission asks which adaptations could support a complex surface organism under this educational model.

## 0:40–1:02 — Commit a hypothesis

Select several adaptations, include at least one intentionally unsupported option, enter reasoning, and select **Commit Hypothesis**.

> The learner must commit a hypothesis before the result is revealed. The important output is the causal reasoning between environmental pressure and biological adaptation.

## 1:02–1:28 — Deterministic simulation

Select **Run Simulation**. Show normalized facts, the four pressure cards, adaptation candidates, and hypothesis comparison.

> Ruleset 0.2.0 calculates the same result for the same validated input. It derives temperature extremes and oxygen partial pressure, then applies four named model conventions for gravity, temperature, radiation, and water. These are model conventions, not universal biological limits.

## 1:28–1:52 — Mission Instructor

Select **Request Mission Instructor debrief** and keep the provenance label visible.

If the label says **GPT-5.6 interpretation**:

> The server re-runs the deterministic simulation, sends only validated mission context and the committed hypothesis to GPT-5.6, and validates the structured debrief with Zod. The model explains the result; it cannot change the calculated facts.

If the label says **Local training review**:

> This environment has no verified live GPT-5.6 response, so the application shows its validated deterministic fallback. The provenance label makes clear that this text is not AI-generated.

## 1:52–2:12 — Revision and progress

Select calculated evidence, enter a revision, and complete the mission. Show the session archive and competency bars.

> The learner revises the hypothesis using calculated evidence. Progress reflects hypothesis alignment, adaptation recall, and evidence coverage. The archive is session-only and resets on reload.

## 2:12–2:25 — Engineering boundary

Show a short code or test view without secrets.

> The application uses Next.js, React, TypeScript, Zod, Vitest, and the OpenAI Responses API. Codex accelerated the domain contracts, deterministic engine, bilingual interface, tests, and documentation. The human directed the product, scientific, architecture, and design decisions.

## 2:25–2:30 — Close

Show the progress screen and the explicit next-mission TODO.

> One mission is complete. The next mission remains clearly marked as future work.

# Xenogenesis Lab — Product Definition

## Product statement

Xenogenesis Lab is an AI-guided astrobiology mission-training simulator. The learner is a candidate preparing for fictional future xenobiology missions, not a visitor to a generic parameter dashboard.

## Problem

Planetary habitability is usually taught through static explanations. Learners can read that gravity, pressure, temperature, radiation, light, and water influence life, but they rarely make a prediction, commit to it, observe a consequence, and receive feedback on their reasoning.

## Product promise

The application trains scientific decision-making through a complete loop of system boot, Mission Control, briefing, world experimentation, committed decisions, deterministic simulation, evidence-based debrief, revision, and progression.

The guiding question is: **What adaptations would be plausible under this model, and why?**

## Required mission loop

1. Boot the training system and enter Mission Control.
2. Receive a Mission Briefing with an objective and target world.
3. Create a resettable experimental variant from immutable mission telemetry.
4. Observe a smoothly changing visual interpretation and explanations of how each input could shape world and life.
5. Commit multiple-choice pressure, adaptation, and survival-strategy decisions before the result is shown.
6. Run the deterministic plausibility simulation.
7. Inspect calculated environmental pressures and organism adaptations.
8. Receive a GPT-5.6 Mission Instructor debrief.
9. Improve or defend the decisions with multiple-choice evidence revision.
10. Record the completed exercise in the Research Archive.
11. Progress a Competency Profile toward the next Certification stage.

The initial submission should complete this loop for one polished training exercise before adding a wider mission library.

## Product language

Prefer: Begin Training, Mission Control, Mission Briefing, World Lab, Training Exercise, Commit Decisions, Run Simulation, Mission Instructor, Mission Debrief, Research Archive, Competency Profile, Certification, and Mission Ready.

Use generic language only when it is clearer for accessibility. Avoid framing the experience as a dashboard, chatbot, generator, daily challenge, or decorative game layer.

## Scientific and AI boundary

The deterministic layer is the source of truth for environmental pressures, causal constraints, adaptation scores, coefficients, and reproducible simulation facts.

GPT-5.6 may frame a mission, evaluate a learner’s reasoning against validated structured output, explain trade-offs, ask targeted questions, provide a debrief, recommend an experiment, and compose constrained organism-dossier text. It must not silently replace calculated values or present invention as a simulation fact.

Zod validates inputs and structured outputs. The interface must make the mission baseline, learner variant, learner decisions, visual interpretation, calculated result, and AI interpretation visibly distinct. Image generation only represents validated organism data and cannot change the result.

## Current implementation status

The current build implements one complete, session-only training exercise for Vespera b: animated boot, Mission Control home, explicit briefing instructions, an editable experimental world, a smooth code-rendered planet interpretation, committed multiple-choice decisions, deterministic ruleset 0.2.0, pressure and adaptation inspection, a validated Mission Instructor route, multiple-choice revision, a session Research Archive entry, and competency scores.

When `OPENAI_API_KEY` is available server-side, the instructor route requests a structured GPT-5.6 debrief. When credentials are absent or the request fails, the same route returns a visibly labelled deterministic local review. The fallback must never be described as AI output. Live GPT-5.6 behavior has not been verified in the current Codex session.

The mission library, persistent archive, accounts, certification progression, next mission, and AI image generation are not implemented. The current planet is code-rendered and must not be described as a generated scientific illustration.

## Experience requirements

Desktop uses a full-screen `100dvh` mission-console shell without global page scrolling. Panels may scroll locally where needed. Mobile becomes a readable, touch-friendly single-column flow with natural page scrolling; it is not a scaled desktop dashboard.

Prioritize immediate comprehension, accessible controls, readable contrast, clear provenance, useful progress and failure states, and a polished default exercise.

## Meaningful progression

Progress may reflect completed missions, decision alignment, evidence-based revision, competencies, archive records, and certification. Do not add arbitrary currencies, unrelated streaks, badges for meaningless clicks, or stat systems that distract from reasoning.

## Out of scope for the initial submission

Unless the complete loop is reliable and polished, defer accounts, multiplayer, complex world maps, ecosystem simulation, long evolutionary timelines, genetic simulation, large content libraries, native mobile apps, and unrelated administration.

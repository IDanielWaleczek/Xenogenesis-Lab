# Xenogenesis Lab — Product Definition

## Product statement

Xenogenesis Lab is an AI-guided astrobiology mission-training simulator. The learner is a candidate preparing for fictional future xenobiology missions, not a visitor to a generic parameter dashboard.

## Problem

Planetary habitability is usually taught through static explanations. Learners can read that gravity, pressure, temperature, radiation, light, and water influence life, but they rarely make a prediction, commit to it, observe a consequence, and receive feedback on their reasoning.

## Product promise

The application trains scientific decision-making through a complete loop of mission briefing, hypothesis, deterministic simulation, evidence-based debrief, revision, and progression.

The guiding question is: **What adaptations would be plausible under this model, and why?**

## Required mission loop

1. Receive a Mission Briefing with an objective and target world.
2. Inspect and configure relevant environmental parameters.
3. Commit a hypothesis before the result is shown.
4. Run the deterministic plausibility simulation.
5. Inspect calculated environmental pressures and organism adaptations.
6. Receive a GPT-5.6 Mission Instructor debrief.
7. Improve or defend the hypothesis with evidence.
8. Record the completed exercise in the Research Archive.
9. Progress a Competency Profile toward the next Certification stage.

The initial submission should complete this loop for one polished training exercise before adding a wider mission library.

## Product language

Prefer: Begin Training, Mission Control, Mission Briefing, Training Exercise, Commit Hypothesis, Run Simulation, Mission Instructor, Mission Debrief, Research Archive, Competency Profile, Certification, and Mission Ready.

Use generic language only when it is clearer for accessibility. Avoid framing the experience as a dashboard, chatbot, generator, daily challenge, or decorative game layer.

## Scientific and AI boundary

The deterministic layer is the source of truth for environmental pressures, causal constraints, adaptation scores, coefficients, and reproducible simulation facts.

GPT-5.6 may frame a mission, evaluate a learner’s reasoning against validated structured output, explain trade-offs, ask targeted questions, provide a debrief, recommend an experiment, and compose constrained organism-dossier text. It must not silently replace calculated values or present invention as a simulation fact.

Zod validates inputs and structured outputs. The interface must make the calculated result, user hypothesis, and AI interpretation visibly distinct. Image generation only represents validated organism data and cannot change the result.

## Current implementation status

The current build is a mission-console **prototype** with local world controls and preview stages. Its Zod world-parameter contract and normalization helpers are implemented and tested. The viability engine, committed hypothesis, GPT-5.6 debrief, image generation, archive, competency scoring, and certification are not yet implemented. Product and demo copy must retain that distinction.

## Experience requirements

Desktop uses a full-screen `100dvh` mission-console shell without global page scrolling. Panels may scroll locally where needed. Mobile becomes a readable, touch-friendly single-column flow with natural page scrolling; it is not a scaled desktop dashboard.

Prioritize immediate comprehension, accessible controls, readable contrast, clear provenance, useful progress and failure states, and a polished default exercise.

## Meaningful progression

Progress may reflect completed missions, hypothesis quality, evidence-based revision, competencies, archive records, and certification. Do not add arbitrary currencies, unrelated streaks, badges for meaningless clicks, or stat systems that distract from reasoning.

## Out of scope for the initial submission

Unless the complete loop is reliable and polished, defer accounts, multiplayer, complex world maps, ecosystem simulation, long evolutionary timelines, genetic simulation, large content libraries, native mobile apps, and unrelated administration.

# Xenogenesis Lab — Design

## Design direction

Xenogenesis Lab should feel like focused scientific mission-training software: precise, atmospheric, readable, and quietly futuristic. It is not a fantasy creature generator, generic dashboard, or cluttered spaceship interface.

Avoid excessive neon, game-like stat overload, imitation of established science-fiction franchises, and decorative gamification.

## Mission-console hierarchy

The UI should make the learner’s place in the training loop obvious:

```text
Mission Control
├── Mission Briefing and objective
├── Environmental analysis and hypothesis entry
├── Run Simulation and calculated pressures
├── Organism / adaptation inspection
├── Mission Instructor debrief and revision
└── Research Archive and Competency Profile
```

Always label provenance in the result area: **Your hypothesis**, **Calculated result**, and **Mission Instructor interpretation**. Never style generated prose or a prepared illustration as a measured fact.

## Responsive behaviour

Desktop uses a full-screen `100dvh` application shell. Avoid global page scrolling; permit local scrolling only in panels that need it, such as a long debrief, archive, or parameter form. Maintain a clear mission-control hierarchy with the primary next action visible.

Mobile reflows to a readable single-column training workflow with natural page scrolling. Do not merely scale down desktop panels. Controls, dialogs, charts, and debriefs must remain touch-friendly and readable.

Accessibility and clarity take priority over immersion.

## Core states

Before a mission begins, show a clear briefing and a polished default exercise. Before simulation, make the hypothesis commitment explicit. During work, use truthful progress states:

```text
Validating mission input
Analyzing environment
Deriving biological constraints
Preparing Mission Instructor debrief
Creating validated visual representation
```

Do not show a stage that is not actually running. Preserve the configured world, hypothesis, and completed deterministic output when a later request fails. Each error should identify the failed stage, avoid jargon, and offer a safe recovery action.

## Progression

The archive and competency interface must show meaningful scientific learning: mission completion, quality of evidence-based revision, and relevant competencies. Do not introduce coins, unrelated streaks, arbitrary badges, or rewards for meaningless clicks.

## Visual system

Use a deep navy or near-black background, cyan or teal scientific accents, cool-white text, and muted blue-gray secondary text. Green, amber, red, and blue must carry a textual or iconographic meaning in addition to colour.

Use a readable interface typeface, restrained display typography, short line lengths for scientific explanations, visible focus states, semantic labels, descriptive image alternatives, reduced-motion support, and reviewed English and Polish strings for every visible UI addition.

## Illustration rules

Illustrations should resemble neutral astrobiology field documentation or scientific concept art. A generated illustration may depict only validated habitat, posture, atmosphere, thermal and radiation adaptations, locomotion, scale, and sensory traits. It must not contradict the dossier, add unsupported anatomy, imitate protected franchises or artists, or present speculative details as measured facts.

## Current implementation note

The current interface implements one responsive mission loop. Hypothesis content, deterministic results, GPT-5.6 interpretation, and the local instructor fallback have visibly different provenance labels. The Research Archive and competency profile are session-only and reset on reload.

Do not describe the adaptation analysis as a generated organism, the session record as persistent, the fallback as AI-generated, or the disabled next-mission state as a mission library. Image generation is not implemented.

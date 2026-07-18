# Xenogenesis Lab — Decision Log

This file records decisions that materially affect architecture, scientific
behavior, cost, security, product scope, or maintainability.

Do not record routine implementation details.

## Decision template

### YYYY-MM-DD — Decision title

**Status:** Proposed / Accepted / Replaced / Rejected

**Decision**

Describe the selected approach in one or two sentences.

**Context**

Explain:

- what problem needed to be solved
- what constraints applied
- why the decision mattered

**Options considered**

1. Option A
2. Option B
3. Option C

**Rationale**

Explain why the selected option was preferred.

Consider:

- complexity
- development time
- scientific credibility
- maintainability
- cost
- security
- hackathon value

**Consequences**

Positive consequences:

- [result]

Negative consequences or tradeoffs:

- [result]

Follow-up work:

- [task]

---

## Initial decisions

### 2026-07-18 — Separate simulation from AI interpretation

**Status:** Accepted

**Decision**

Environmental analysis and biological constraints will be calculated by a
deterministic rules engine. GPT-5.6 will explain and elaborate on validated
structured results.

**Context**

Allowing the model to invent physical calculations would reduce
reproducibility, testability, and scientific credibility.

**Options considered**

1. Let GPT-5.6 generate the complete organism directly from user parameters.
2. Use only a deterministic engine without GPT.
3. Use a deterministic engine followed by GPT interpretation.

**Rationale**

The hybrid approach demonstrates meaningful AI usage while preserving
testable scientific logic.

**Consequences**

Positive consequences:

- reproducible simulations
- clearer architecture
- easier testing
- stronger hackathon story
- lower risk of unsupported model claims

Tradeoffs:

- more schemas and validation
- additional implementation work
- deterministic rules must be designed manually

Follow-up work:

- define simulation input schema
- define deterministic output schema
- define validated GPT output schema

---

### 2026-07-18 — Generate illustrations from validated organism data

**Status:** Accepted

**Decision**

Image prompts will be built from validated organism data rather than directly
from raw user parameters or unrestricted model prose.

**Context**

The illustration should represent the simulation result and must not
contradict important adaptations.

**Options considered**

1. Generate images directly from raw world parameters.
2. Let GPT create an unrestricted artistic prompt.
3. Construct a controlled prompt from validated organism data.

**Rationale**

A controlled prompt provides better visual consistency and keeps the image
aligned with the scientific dossier.

**Consequences**

Positive consequences:

- fewer contradictions
- more consistent results
- easier debugging
- clearer separation of responsibilities

Tradeoffs:

- prompt construction requires its own module
- some artistic variety may be reduced

Follow-up work:

- define illustration input schema
- define prompt-template versioning
- add fallback behavior for image-generation failures

---

### 2026-07-18 — Complete one vertical slice before optional features

**Status:** Accepted

**Decision**

Development will prioritize one complete path from world configuration to
generated organism and illustration.

**Context**

The hackathon requires a working and demonstrable project under a limited
deadline.

**Options considered**

1. Build many independent features.
2. Focus first on infrastructure.
3. Complete one polished end-to-end flow.

**Rationale**

A complete vertical slice provides the strongest demo and reduces the risk of
submitting disconnected prototypes.

**Consequences**

Positive consequences:

- working demo earlier
- clearer priorities
- easier testing
- reduced submission risk

Tradeoffs:

- fewer secondary features
- some architecture may initially support only the MVP scope

Follow-up work:

- define the minimum end-to-end scenario
- select the default demo world
- postpone optional features until the vertical slice is stable
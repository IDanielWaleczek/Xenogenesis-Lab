# Xenogenesis Lab — Agent Instructions

## Xenogenesis Lab Product North Star

Xenogenesis Lab is an AI-guided astrobiology mission training simulator.

The core user fantasy is: "I am a candidate training to reason like a
xenobiology mission specialist."

Do not reduce the product to a generic dashboard, chatbot, parameter
playground, organism generator, or decorative gamification layer.

The product must prioritize:

1. scientific coherence
2. clear educational communication
3. one reliable mission-training loop
4. an engaging, accessible visual experience
5. a strong sub-three-minute demo
6. maintainable implementation without unnecessary complexity

## Required Core Loop

Every meaningful implementation should support or strengthen this loop:

```text
mission briefing
→ environmental analysis
→ committed hypothesis
→ deterministic simulation
→ organism / pressure inspection
→ GPT-5.6 instructor debrief
→ evidence-based revision
→ competency progress
→ next mission
```

Prioritize one complete, reliable mission loop over many disconnected
features.

## Sources of truth

Read the relevant documents before changing related behavior:

* Product scope and UX: `docs/PRODUCT.md`
* System boundaries and data flow: `docs/ARCHITECTURE.md`
* Scientific assumptions and rules: `docs/SCIENCE_RULES.md`
* Visual and interaction rules: `docs/DESIGN.md`
* Submission requirements: `docs/HACKATHON.md`
* Accepted technical decisions: `docs/DECISIONS.md`

When documentation and implementation disagree, identify the conflict. Do not silently choose one.

## Core architecture boundary

The deterministic rules engine owns:

* environmental calculations
* constraint derivation
* adaptation scoring
* scientific coefficients and thresholds
* reproducible simulation output

GPT-5.6 owns:

* mission framing and educational narration
* evaluation of reasoning against structured deterministic output
* targeted questions, debriefs, and recommended experiments
* organism dossier composition and controlled creative elaboration inside supplied constraints
* construction of image-generation prompts

GPT-5.6 must not be the source of truth for physical calculations or environmental constraints.

Image generation owns only visual representation. It must not change simulation facts.

Validate structured inputs and outputs with Zod. Preserve provenance in the
UI: calculated result, user hypothesis, and AI interpretation must remain
distinguishable.

## Engineering principles

* Prefer simple, explicit code over clever abstractions.
* Avoid premature generalization.
* Keep domain logic independent from UI components and model-provider code.
* Use strict types for domain data.
* Validate data at every external boundary.
* Treat model output as untrusted.
* Use structured outputs where supported.
* Keep scientific constants centralized and versioned.
* Do not scatter unexplained numeric thresholds through the code.
* Ensure identical input and ruleset versions produce identical deterministic results.
* Keep OpenAI credentials and privileged requests server-side.
* Never commit secrets or real API keys.
* Avoid adding production dependencies without a clear need.
* Preserve existing conventions unless there is a documented reason to change them.
* Do not perform unrelated refactors while implementing a focused task.

## Expected domain separation

Keep these concerns separate, regardless of the final folder names:

* world parameter input and validation
* mission briefing and hypothesis input
* deterministic environmental analysis
* biological adaptation rules
* organism data schema
* GPT request construction
* GPT response validation
* image-prompt construction
* image generation
* persistence or sharing
* presentation and UI

UI components must not contain scientific calculations.

Prompt text must not contain hidden replacements for missing deterministic rules.

## Scientific integrity

When changing scientific behavior:

1. state the assumption
2. document its purpose
3. use defensible ranges
4. distinguish simplification from established science
5. add tests for boundaries and representative cases
6. update `docs/SCIENCE_RULES.md`

Never describe speculative output as confirmed scientific fact.

Use language such as “plausible,” “predicted,” or “under this model” where appropriate.

## AI integration

* Send the minimum necessary context.
* Prefer stable, versioned prompt templates.
* Ask for structured output rather than parsing prose.
* Validate all returned fields before use.
* Define fallbacks for malformed, refused, empty, or timed-out responses.
* Do not display raw internal prompts, secrets, or stack traces to users.
* Keep model choice configurable where practical.
* Do not represent pre-generated assets as live generation.
* Clearly separate deterministic facts from model-written interpretation.

## Product language

Prefer mission-training terminology:

* Begin Training
* Mission Control
* Mission Briefing
* Training Exercise
* Commit Hypothesis
* Run Simulation
* Mission Instructor
* Mission Debrief
* Research Archive
* Competency Profile
* Certification
* Mission Ready

Use generic labels only when they are clearer for accessibility.

## Gamification rule

Progression must measure meaningful learning behavior. Good measures include
mission completion, competency growth, improved hypothesis quality,
evidence-based revision, research-archive entries, and certification stages.

Avoid arbitrary coins, unrelated streaks, decorative badges, rewards for
meaningless clicks, and systems that distract from scientific reasoning.

## User experience

The mission loop should remain obvious: briefing, hypothesis, simulation,
inspection, instructor debrief, revision, and progression.

Prioritize:

* immediate comprehension
* strong visual hierarchy
* responsive layout
* keyboard accessibility
* readable contrast
* useful progress states
* graceful failures
* a polished default example suitable for the demo

Do not add interface elements that do not strengthen this journey.

Desktop uses a full-screen `100dvh` application shell without global page
scrolling; panels may scroll locally when necessary. Mobile must reflow into a
readable single-column workflow with natural page scrolling and touch-friendly
controls. Accessibility and clarity take priority over visual immersion.

## Implementation and documentation integrity

Inspect the current codebase, active Codex session, documentation, package
scripts, tests, and configuration before editing. Do not invent implemented
features, commands, environment variables, scientific rules, Codex
contributions, GPT-5.6 integration, test results, or deployment behavior.

Use `TODO` markers when a required fact cannot be verified. Keep README, demo
copy, and submission copy aligned with the working build.

## Tests and verification

Before considering a task complete:

* add or update relevant tests
* run the narrowest relevant checks first
* run the broader project checks when practical
* review the final diff
* verify that no secret or generated junk file was added

Use the actual commands defined by the repository. Do not invent commands.

At minimum, verify applicable:

* formatting
* linting
* static type checking
* unit tests
* production build

Never state that a command passed unless it was executed successfully.

If a check cannot run, report the exact reason.

## Work process

For non-trivial tasks:

1. inspect the relevant implementation and documentation
2. summarize the intended change
3. identify important risks
4. implement a coherent solution
5. test and review it
6. update documentation when behavior or architecture changed

Do not repeatedly ask for confirmation about routine implementation details.

Request user input only when a decision would materially affect:

* product scope
* scientific assumptions
* architecture
* security
* cost
* irreversible data changes
* submission eligibility

## Completion report

Finish meaningful tasks with:

* Summary
* Files changed
* Verification performed
* Remaining risks or limitations
* Recommended next step

Keep the report factual and concise.

## Hackathon constraints

Optimize for a complete, demonstrable vertical slice before optional features.

The demo must visibly prove:

* meaningful deterministic simulation
* meaningful GPT-5.6 usage
* meaningful Codex-assisted development
* polished interaction
* clear real-world educational value

Track event-specific work and evidence in `docs/HACKATHON.md`.

Preserve concrete Codex evidence: the primary `/feedback` session ID, dated
commits, meaningful diffs, tests and refactors, key implementation or
debugging moments, and human-made product, engineering, scientific-boundary,
and design decisions. The final repository must explain where Codex
accelerated the workflow and how Codex and GPT-5.6 contributed to the final
result.

Do not claim incomplete, mocked, or manually prepared functionality is live.

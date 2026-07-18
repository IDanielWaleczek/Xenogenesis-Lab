# Xenogenesis Lab — Agent Instructions

## Purpose

Xenogenesis Lab is an interactive astrobiology application that demonstrates how environmental conditions can constrain and shape plausible alien organisms.

The product must prioritize:

1. scientific coherence
2. clear educational communication
3. an engaging visual experience
4. a strong sub-three-minute demo
5. maintainable implementation without unnecessary complexity

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

* explanation
* educational narration
* organism dossier composition
* controlled creative elaboration inside supplied constraints
* construction of image-generation prompts

GPT-5.6 must not be the source of truth for physical calculations or environmental constraints.

Image generation owns only visual representation. It must not change simulation facts.

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

## User experience

The primary journey should remain obvious:

1. configure a world
2. run the simulation
3. understand environmental pressures
4. inspect the resulting organism
5. generate or view its illustration

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

Do not claim incomplete, mocked, or manually prepared functionality is live.

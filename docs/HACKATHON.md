# Xenogenesis Lab — OpenAI Build Week Record

## Current event requirements

Checked on **2026-07-19** against the [OpenAI Build Week page](https://openai.com/build-week/) and [Devpost challenge page](https://openai.devpost.com/).

| Item | Official requirement or judging signal |
| --- | --- |
| Deadline | 2026-07-21 at 5:00 PM PDT |
| Selected category | Education |
| Project | Working project built with Codex using GPT-5.6 |
| Description | Explain what was created and how it works |
| Demo | Public YouTube video under three minutes |
| Demo audio | Explain how Codex and GPT-5.6 were used |
| Repository | URL available to judges; public with relevant license or private shared with required judging addresses |
| README | Setup, sample data if needed, and clear run instructions |
| Development evidence | Highlight Codex acceleration, key decisions, and GPT-5.6/Codex use |
| Codex record | Primary `/feedback` session ID for the majority of core functionality |
| Judging | Technical implementation, design/coherent experience, potential impact, and quality/novelty of idea |

Always re-check Devpost before final submission because challenge text may change.

## Honest project baseline

Before Build Week, no complete production application, procedural WebGL planet, continuous simulation engine, integrated GPT-5.6 workflow, or live image pipeline existed. Early concept notes, branding, and general astrobiology inspiration may be pre-existing. Only eligible work and verifiable session evidence should be represented as event work.

## Current working build

The repository currently implements:

- a cinematic boot with explicit entry;
- one continuous Genesis 01 mission;
- a deterministic seeded planet with layered custom GLSL terrain, water, ice, clouds, atmosphere, scientific overlays, and result-driven biosphere/region markers;
- eleven reactive planet parameters with preserved preferences and continuous phase-aware consequences;
- 33 biological traits with costs, conflicts, modifiers, advantages, and tradeoffs;
- simulator 1.5.0 with phase-aware water/humidity coupling, effective dependent controls, 11 continuous metrics, six representative regions, eight outcomes, stable hashing, and a 40-generation population model;
- deterministic organism morphology;
- a server-only GPT-5.6 consultant route with Zod structured output and honest local fallback;
- a server-only `gpt-image-2` route with controlled server-built prompt and procedural fallback;
- reviewed English and Polish UI;
- one repeatable no-reload `Observe → Modify → Design → Simulate → Adapt` loop.

The local deterministic workflow and both fallback routes work without external credentials. Live GPT-5.6 and `gpt-image-2` calls have not been executed in this Codex session and must not be shown or claimed as verified until tested in deployment.

## Evidence record

### 2026-07-18 — Deterministic world foundations

- **Area:** scientific data contract.
- **Work:** validated world schema, units, radiation normalization, oxygen partial pressure, ideal-gas density, symmetric temperature range, explicit shielding column mass, and conservative geochemical pathway detection.
- **Human decisions:** habitat does not attenuate radiation; alternative energy needs a supplied redox pathway; local atmospheric values are authoritative; English/Polish translation review is required.
- **Evidence:** repository tests and current Codex task history.

### 2026-07-19 — Procedural life simulator transformation

- **Area:** product, rendering, deterministic biology, AI boundaries, and documentation.
- **Work:** replaced the hypothesis/quiz architecture with the continuous life-engineering loop; added Three.js/R3F/Drei and custom planet shaders; added environment controls, trait designer, centralized simulator coefficients, regional and population analysis, procedural organism, consultant and image routes, cinematic boot, responsive laboratory, and aligned documentation.
- **Human decisions:** learner freedom, broad mission outcomes, real-time smooth planet changes, meaningful traits with tradeoffs, an animation-led boot, on-demand AI, and one polished mission.
- **Codex evidence:** current Codex task; **TODO:** capture the final `/feedback` session ID.
- **Relevant commit or pull request:** **TODO:** current transformation is uncommitted.
- **Verification:** 20 Vitest tests passed; `npx tsc --noEmit`, full `npm run lint`, and `npm run build` passed. The production build was smoke-tested locally: planet and designer loaded without dev tools, the deterministic outcome/population/hash rendered, consultant and image fallbacks rendered with correct provenance, Polish fallback copy exposed no internal enum IDs, `html[lang="pl"]` updated, and a language change discarded an in-flight response from the previous language. Cinematic boot and full desktop interaction were also inspected. A real narrow/mobile device and deployed OpenAI calls remain TODOs.
- **Dependency audit:** `npm audit --omit=dev` reports two moderate findings in Next.js's bundled PostCSS dependency (`GHSA-qx2v-qp2m-jg93`) and reports no fix available. Monitor upstream; do not claim a clean audit.

## Codex and GPT-5.6 roles

Codex accelerated repository analysis, architecture refactoring, deterministic modeling, shader and UI implementation, bilingual content, test design, browser QA, science-boundary corrections, and documentation. The human selected the product direction and owns the scientific conventions, educational goal, design review, deployment, and submitted claims.

In the app, GPT-5.6 is an optional scientific consultant. It receives validated planet state, selected traits, and server-recalculated deterministic output. It explains tradeoffs and suggests one controlled experiment. It also selects four constrained art-direction enums. The server—not GPT—constructs the final image prompt. GPT-5.6 never calculates the result.

The fallback is local deterministic text and is visibly labelled. It is not evidence of a live GPT call.

## Demo target: under three minutes

The demo should visibly prove:

1. cinematic boot and clear objective;
2. a real seeded WebGL planet that changes as inputs change;
3. temperature/radiation overlays and planet interaction;
4. meaningful life traits, budget, and tradeoffs;
5. a deterministic run with regional scores and population chart;
6. a second controlled change or comparison;
7. a live GPT-5.6 consultant result with provenance;
8. a live generated organism image only if the route is verified;
9. where Codex accelerated the build and where the human made key decisions.

Never show mocked, manually prepared, local-fallback, or pre-generated output as a live model response.

## Submission record

| Item | Current value |
| --- | --- |
| Category | Education |
| Production URL | https://www.danielwaleczek.com |
| Repository URL | https://github.com/IDanielWaleczek/Xenogenesis-Lab |
| License | MIT |
| Primary Codex `/feedback` session ID | **TODO** |
| Public YouTube demo under three minutes | **TODO** |
| Deployment matches repository HEAD | **TODO** |
| Live GPT-5.6 consultant verified | **TODO** |
| Live `gpt-image-2` illustration verified | **TODO** |

## Final checklist

- [x] One complete deterministic mission loop works without AI credentials.
- [x] The planet is procedural, seeded, interactive, and controlled by live inputs.
- [x] Life traits have costs, conflicts, and visible tradeoffs.
- [x] Results include continuous metrics, regional survival, population, and multiple outcomes.
- [x] Deterministic facts, visual interpretation, AI interpretation, and fallbacks have distinct provenance.
- [x] README includes exact repository commands and architecture.
- [x] English and Polish interface structures match.
- [x] Run and record final tests, type check, repository lint, and production build.
- [ ] Verify desktop and real narrow/mobile device behavior in the production build.
- [ ] Configure and verify live GPT-5.6 and `gpt-image-2` routes.
- [ ] Add rate limiting or document the controlled judging environment.
- [ ] Verify production deploy equals repository HEAD.
- [ ] Capture primary `/feedback` session ID.
- [ ] Record and publish the narrated sub-three-minute YouTube demo.
- [ ] Re-check official rules, eligibility, repository access, and final Devpost fields.
- [ ] Confirm no secrets or generated junk are committed.

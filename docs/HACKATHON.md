# Xenogenesis Lab — Hackathon Record

## Event

```text
OpenAI Build Week
```

**TODO:** verify the current official deadline, track, and submission requirements before submitting.

## Honest project baseline

Before the event, no production application, complete simulation engine, integrated GPT-5.6 workflow, or live image-generation pipeline existed. Early concept notes, branding experiments, and general astrobiology inspiration may be pre-existing material; only eligible work should be represented as hackathon work.

The current repository contains one complete session-only Vespera training mission, tested world normalization, deterministic pressure and adaptation rules, a committed hypothesis, a validated server-only GPT-5.6 instructor path with an honest local fallback, evidence-based revision, and competency scoring. Image generation, persistent archive storage, accounts, certification progression, and additional missions are not implemented.

## Evidence record

Add a dated entry for meaningful work. Do not invent evidence.

```text
Date:
Area:
Work completed:
Relevant commit or pull request:
Codex session or evidence:
Human decision or review:
Verification:
```

Preserve the primary `/feedback` session ID, dated commits, meaningful diffs, tests, refactors, implementation or debugging moments, and human product, engineering, scientific-boundary, and design decisions.

### 2026-07-19 — Single-mission vertical slice

- **Area:** deterministic training loop and Mission Instructor boundary
- **Work completed:** fixed Vespera briefing, committed hypothesis, ruleset 0.2.0, pressure/adaptation inspection, validated GPT-5.6 route with local fallback, evidence-based revision, session competency progress, English/Polish interface, and aligned documentation
- **Relevant commit or pull request:** **TODO:** changes are uncommitted in the current workspace
- **Codex session or evidence:** current Codex task; primary `/feedback` session remains **TODO**
- **Human decision or review:** the user defined the product as an AI-guided mission-training simulator and requested the smallest complete mission
- **Verification:** 14 Vitest tests passed; TypeScript, scoped and repository lint, production build, English/Polish browser flow, fallback API path, and mobile layout checked on 2026-07-19

## Codex and GPT-5.6 roles

Codex has assisted with repository analysis, architecture and documentation, schema and test work, prototype implementation, verification, and review. The human owns the final product direction, scientific assumptions, architecture decisions, design review, and submitted implementation.

The Mission Instructor route is implemented with the Responses API, the `gpt-5.6` alias, Zod Structured Outputs, server-side credentials, and a deterministic fallback. A live GPT-5.6 request was not executed in the current Codex session because no API credential was available. Submission material must claim live GPT behavior only after deployment-to-HEAD and an end-to-end response are verified.

## Demo target

The eventual demo should show, in under three minutes: a Mission Briefing, a committed hypothesis, a deterministic simulation whose output changes with environmental input, visible provenance, a live GPT-5.6 Mission Instructor debrief, evidence-based revision, and a grounded organism visualisation if that feature is complete.

Do not show or claim mocked, manually prepared, or pre-generated content as live output.

## Submission record

| Item | Value |
| --- | --- |
| Production URL | https://www.danielwaleczek.com |
| Repository URL | https://github.com/IDanielWaleczek/Xenogenesis-Lab |
| Primary Codex `/feedback` session | **TODO:** capture before submission. |
| Public video | **TODO:** add before submission. |
| Deployment-to-HEAD check | **TODO:** verify before submission. |

## Completion checklist

- [x] One complete mission loop works with the local validated fallback.
- [x] Deterministic rules visibly produce calculated pressures and adaptations.
- [x] Hypothesis, calculated facts, AI interpretation, and fallback review have distinct provenance.
- [ ] GPT-5.6 integration is live, validated, and has safe error handling.
- [ ] Image generation is live only if shown in the demo.
- [ ] Mobile and desktop layouts are verified.
- [ ] README setup and claims match the submitted build.
- [ ] Relevant tests and production build have run successfully.
- [ ] No secrets or generated junk files are committed.
- [ ] Primary `/feedback` ID and meaningful Codex evidence are recorded.
- [ ] Demo video, licence, repository, and official submission metadata are complete.

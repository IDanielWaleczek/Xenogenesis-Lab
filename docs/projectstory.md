# Xenogenesis Lab — Project Story Draft

## Submission-integrity note

This is a product-story draft, not evidence that every described capability is
live. The current repository implements one mission with an immutable baseline,
learner-controlled experimental variants, a smooth code-rendered planet,
committed multiple-choice decisions, deterministic pressure analysis, an
instructor route with a clearly labelled local fallback, multiple-choice
revision, and session-only progress.
Live GPT-5.6 behavior remains **TODO: verify end to end with server credentials**.
AI-generated illustration, persistence, certification progression, and a
mission library are not implemented. The current SVG planet is a visual
interpretation of inputs, not a scientific image or simulation result.

Update this document, the README, and the demo script together as features
become testable. Do not submit future-tense product intent as a live feature.

## Problem

Astrobiology and planetary habitability are complex, abstract subjects often
taught through static content. Learners can read about gravity, atmospheric
pressure, temperature, radiation, light, and water, but rarely practise making
a scientific decision, committing to a hypothesis, observing consequences, and
receiving personal feedback.

## Solution

Xenogenesis Lab is an AI-guided astrobiology mission-training simulator. It
places the learner inside a fictional future xenobiology programme and trains
scientific reasoning through a complete loop of briefing, hypothesis,
deterministic simulation, evidence-based debrief, revision, and progression.

It is not a generic chatbot, planet configurator, or unconstrained creature
generator. The learner’s role is: “I am a candidate training to reason like a
xenobiology mission specialist.”

## Intended training exercise

1. Boot the training system and enter Mission Control.
2. Receive a Mission Briefing with a target world and scientific objective.
3. Create an experimental variant while observing a live planet interpretation.
4. Commit multiple-choice pressure, adaptation, and strategy decisions.
5. Run the deterministic plausibility simulation.
6. Inspect calculated pressures and organism adaptations.
7. Receive a structured GPT-5.6 Mission Instructor debrief.
8. Revise the original decision using calculated evidence.
9. Record the exercise in the Research Archive.
10. Progress a Competency Profile toward Mission Ready certification.

## Scientific integrity and AI roles

The deterministic rules engine owns the environmental pressures, causal
constraints, adaptation scores, coefficients, and repeatable simulation facts.
GPT-5.6 receives only validated structured inputs. It may frame exercises,
evaluate the learner’s reasoning, explain trade-offs, ask follow-up questions,
create debriefs, and recommend experiments. It cannot replace calculated
values or represent unsupported invention as a simulation fact.

Zod validates external data at each boundary. The interface will distinguish
the user hypothesis, deterministic result, AI interpretation, and generated
visual representation. An image, if generated, is a representation of
validated organism data rather than a source of scientific facts.

## Why this structure matters

A static article can explain that high gravity favours stronger support
structures. A mission exercise asks the learner to predict that relationship,
compares their reasoning with a reproducible model, then gives focused feedback
and a next experiment. The educational value comes from that adaptive feedback
loop, not from generating more text or a decorative reward.

## Codex and human roles

Codex has accelerated repository analysis, implementation, testing,
refactoring, debugging, and documentation in this project. The human made and
reviewed the product vision, scientific boundaries, training structure,
architecture decisions, design direction, and final implementation choices.

**TODO:** before submission, link this story to the primary `/feedback` session,
dated commits, meaningful diffs, tests, and verified live GPT-5.6 behaviour.

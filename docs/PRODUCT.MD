# Xenogenesis Lab — Product Definition

## Product statement

Xenogenesis Lab is an interactive astrobiology laboratory where users configure an alien environment and observe how its conditions constrain the evolution of plausible life.

## Core question

How could life adapt to this world?

## Target experience

A user should be able to:

1. configure environmental parameters
2. understand the pressures created by those parameters
3. run a deterministic biological analysis
4. receive a plausible organism based on the resulting constraints
5. read an accessible scientific dossier
6. view a generated scientific illustration

## MVP journey

### Configure

The user adjusts a limited set of high-impact parameters:

* surface gravity
* atmospheric pressure
* atmospheric composition
* average temperature
* temperature variation
* radiation
* stellar light
* liquid-water availability
* dominant habitat

### Simulate

The application calculates:

* survivability constraints
* structural pressures
* metabolic pressures
* respiratory or chemical-energy options
* thermal adaptations
* radiation defenses
* sensory pressures
* locomotion pressures

### Interpret

GPT-5.6 receives validated simulation output and produces:

* organism name
* concise overview
* habitat
* morphology
* metabolism
* locomotion
* sensory system
* reproduction
* key adaptations
* limitations
* explanation connecting each major adaptation to the environment

### Visualize

The application produces a controlled image-generation prompt from the same organism data and displays the resulting scientific illustration.

## MVP success criteria

The project is successful when:

* the main flow works from input through final organism
* the deterministic layer visibly affects results
* different environments produce meaningfully different adaptations
* GPT output remains within calculated constraints
* the user can understand why the organism looks and behaves as described
* the complete experience can be demonstrated clearly in under three minutes

## Out of scope for the initial submission

Unless the core vertical slice is already polished:

* accounts
* multiplayer
* complex world maps
* ecosystem simulation with many interacting species
* long-term evolutionary timelines
* genetic simulation
* scientific publication-level accuracy
* large content libraries
* native mobile applications
* unnecessary administrative panels

## Product language

Prefer:

* plausible
* predicted by this model
* environmental pressure
* adaptation
* constraint
* hypothesis
* scientific simplification

Avoid presenting speculative organisms as factual discoveries.

## Demo priority

The default demo scenario must create a visually distinctive organism and clearly connect at least four environmental conditions to four observable adaptations.

# Xenogenesis Lab — Science Rules

## Model scope

The model explores plausible biological adaptations caused by environmental
pressure.

It is an educational simulation, not a complete evolutionary, genetic,
ecological, or planetary model.

The model focuses on relationships such as:

- gravity and body structure
- atmosphere and respiration
- temperature and thermal regulation
- radiation and biological protection
- light and sensory systems
- water availability and metabolism
- terrain and locomotion

## Units

Use consistent internal units:

- gravity: multiples of Earth gravity, `g`
- pressure: atmospheres, `atm`
- temperature: degrees Celsius, `°C`
- temperature variation: degrees Celsius, `°C`
- radiation: normalized project scale or documented physical unit
- light: normalized relative intensity
- water availability: normalized range from `0` to `1`
- gas composition: fractions summing to `1`

All conversions must happen before rules are evaluated.

## Input parameters

### Gravity

Suggested range:

```text
0.05 g to 5.0 g
```

Influences:

- body height
- skeletal strength
- limb thickness
- locomotion
- circulation
- balance

### Atmospheric pressure

Suggested range:

```text
0.05 atm to 20 atm
```

Influences:

- respiratory structures
- body sealing
- gas exchange
- flight feasibility
- sound propagation

### Temperature

Suggested range:

```text
-100°C to 150°C
```

Influences:

- metabolism
- insulation
- cooling systems
- activity patterns
- biochemistry

### Radiation

Influences:

- pigmentation
- shielding
- cellular repair
- underground or nocturnal behavior
- reproductive strategy

### Light

Influences:

- vision
- photosynthesis
- pigmentation
- circadian behavior
- alternative sensory systems

### Water availability

Influences:

- body-water retention
- skin permeability
- reproduction
- metabolism
- dormancy

### Habitat

Initial values may include:

- open surface
- desert
- shallow water
- deep ocean
- cave
- forest-like biome
- ice surface
- high atmosphere

## Rule structure

Each rule should contain:

```ts
type ScienceRule = {
  id: string;
  version: string;
  description: string;
  inputConditions: RuleCondition[];
  effects: RuleEffect[];
  confidence: "high" | "medium" | "speculative";
  sourceNotes?: string[];
};
```

## Example rules

### High gravity

When gravity increases:

- body height tends to decrease
- support structures become stronger
- limbs become thicker
- jumping and flight become less plausible
- circulation requires stronger pressure regulation

### Low gravity

When gravity decreases:

- taller and more delicate structures become possible
- jumping and gliding become easier
- balance and anchoring become more important
- fragile elongated limbs become more plausible

### High radiation

When radiation increases:

- protective pigmentation becomes more likely
- biological repair mechanisms become more important
- shielding structures become more plausible
- underground, aquatic, or nocturnal behavior gains value

### Low water availability

When available water decreases:

- sealed skin becomes more likely
- water recycling improves
- reproduction may use protected eggs or internal development
- dormancy becomes more plausible

## Coefficients

All coefficients must be:

- centralized
- named
- documented
- covered by tests
- assigned to a ruleset version

Avoid unexplained values such as:

```ts
score += 0.37;
```

Prefer:

```ts
score += HIGH_GRAVITY_COMPACT_BODY_WEIGHT;
```

## Simplifications

Current simplifications may include:

- one dominant organism rather than a complete ecosystem
- fixed environmental values rather than long-term climate cycles
- broad atmospheric chemistry categories
- no full genetic simulation
- no detailed fluid dynamics
- no population model
- no natural-selection timeline
- simplified metabolism categories

Each simplification should be visible in the application or documentation
where relevant.

## Edge cases

The model must handle:

- vacuum or near-vacuum
- extreme heat
- extreme cold
- very high gravity
- very low gravity
- no accessible water
- no visible light
- extreme radiation
- contradictory inputs
- environments where complex surface life is implausible

The system may return:

- extremophile life
- microbial-only plausibility
- protected subterranean life
- suspended or dormant life
- no plausible complex organism under the current model

It should not force a complex creature into every environment.

## Ruleset version

Current version:

```text
Ruleset: 0.1.0
```

Versioning rules:

- patch version for coefficient corrections
- minor version for new compatible rules
- major version for changed interpretation or incompatible output

Each simulation result must include the ruleset version.
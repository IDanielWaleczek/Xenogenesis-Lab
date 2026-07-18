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
- temperature variation: symmetric half-range in degrees Celsius, `°C`
- radiation input: `mSv/h` or `Sv/h`; deterministic evaluation: `mSv/h`
- light: normalized relative intensity
- water availability: normalized range from `0` to `1`
- gas composition: fractions summing to `1`
- shielding column mass: kilograms per square metre, `kg/m²`
- atmospheric mean molar mass: kilograms per mole, `kg/mol`

All conversions must happen before rules are evaluated.

The input retains the original radiation value and unit for display and
traceability. `1 Sv/h` is normalized to `1,000 mSv/h`; the model evaluates
only the normalized dose rate.

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

Pressure and temperature are **local values at the organism's altitude**, not
planetary surface values. This is particularly important for high-atmosphere
habitats.

### Atmospheric composition and density

Atmospheric composition must provide oxygen, carbon dioxide, nitrogen, inert
gas, and toxic-gas fractions. All five fractions must be finite, non-negative,
and sum to one within a documented numerical tolerance.

The model derives oxygen partial pressure as:

```text
oxygenPartialPressureAtm = atmosphericPressureAtm × oxygenFraction
```

When atmospheric density is needed, especially for high-atmosphere life, the
world input must supply `atmosphericMeanMolarMassKgPerMol`. The model derives
local density using the ideal-gas relationship:

```text
ρ = pM / RT
```

where `p` is local pressure in pascals, `M` is supplied mean molar mass,
`R` is the universal gas constant, and `T` is local absolute temperature.
Fraction categories such as `inertGas` and `toxicGas` are too broad to infer
a defensible mean molar mass, so the model never silently substitutes one.

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

`temperatureVariationC` is a symmetric half-range, not a generic fitness
penalty. The engine evaluates both extremes:

```text
minimumTemperatureC = averageTemperatureC − temperatureVariationC
maximumTemperatureC = averageTemperatureC + temperatureVariationC
```

Variability may add adaptation pressure for dormancy, insulation, thermal
buffering, migration, or broad tolerance. It does not impose a flat penalty;
its effect depends on whether either derived extreme crosses a modelled limit.

### Radiation

Influences:

- pigmentation
- shielding
- cellular repair
- underground or nocturnal behavior
- reproductive strategy

The field `shieldingColumnMassKgM2` defaults to `0` when absent or unknown.
The initial ruleset records this physical input but does **not** reduce the
normalized radiation dose from cave or deep-ocean habitat labels, nor does it
calculate attenuation from column mass. Radiation spectra and shielding
materials require scenario-specific modelling; applying a universal depth or
mass factor would imply false precision. Cave and deep-ocean habitats may
still favour shelter-seeking adaptations.

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

For `high atmosphere`, density—not the habitat label alone—will constrain
active flight, buoyancy, and passive or aerosol life. Proposed density
thresholds must be explicitly named, versioned model conventions; they are not
universal biological limits.

### Geochemical energy and electron acceptors

`geochemicalEnergyAvailability` is one of `none`, `low`, `moderate`, or
`high`. `electronAcceptors` can contain `nitrate`, `sulfate`, `ferricIron`,
or `carbonDioxide` without duplicates.

The model may propose anaerobic, anoxygenic, or chemosynthetic candidates only
when both a non-`none` geochemical energy availability and at least one listed
electron acceptor are present. Missing or incomplete geochemical inputs do not
justify invented metabolism: at low oxygen, the engine must conservatively
return microbial-only or no plausible complex organism when no modelled
alternative energy pathway exists.

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

### Low oxygen

Low oxygen is evaluated from oxygen partial pressure, not oxygen fraction
alone. The aerobic-metabolism threshold has not yet been assigned; before the
viability engine uses it, it must be introduced as a named, documented,
versioned coefficient with boundary tests. Falling below that threshold will
constrain aerobic metabolism rather than automatically making all life
impossible.

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
- no radiation-spectrum, material, or depth attenuation calculation
- no inferred molar mass for broad inert- or toxic-gas categories
- no universal flight-density threshold

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

## Sources for model conventions

- [NASA radiation analysis and shielding design](https://ddtrb.larc.nasa.gov/radiation/)
  describes multiple space-radiation sources and material-dependent shielding,
  supporting the decision not to apply a universal cave or water attenuation
  factor.
- [USGS terminal electron acceptor table](https://pubs.usgs.gov/wri/wri994285/datatab/table1.html)
  lists oxygen, nitrate, manganese, iron, sulfate, and carbon dioxide pathways
  with differing energy efficiency; the MVP represents only the documented
  acceptor categories above.
- [NASA ideal-gas derivation](https://www.grc.nasa.gov/WWW/K-12/Numbers/Math/Mathematical_Thinking/ideal_gases_under_constant.htm)
  supports the ideal-gas density relationship used as a deterministic local
  atmosphere calculation.
- [Thermal-fluctuation meta-analysis](https://pubmed.ncbi.nlm.nih.gov/36750193/)
  reports context-dependent effects of thermal variability, supporting the
  model's extreme-based evaluation rather than a flat variability penalty.

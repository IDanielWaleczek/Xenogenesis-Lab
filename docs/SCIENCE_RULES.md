# Xenogenesis Lab — Science Rules

## Model scope

Simulator 1.0.0 is a deterministic, scientifically inspired educational model for exploring interactions among a planet, a designed organism, representative habitats, and population stability. It is not a complete climate, atmospheric-chemistry, radiation-transport, ecosystem, genetics, or evolutionary model.

All coefficients are versioned model conventions. They express consistent tradeoffs for this experience and must not be presented as universal biological limits.

## Sources of truth

- Physical input validation and derivation: `src/domain/world/schema.ts`
- Simulator coefficients: `src/domain/simulator/coefficients.ts`
- Trait costs, conflicts, and modifiers: `src/domain/simulator/traits.ts`
- Continuous calculations and population loop: `src/domain/simulator/simulate.ts`
- Boundary and representative tests: `src/domain/world/schema.test.ts` and `src/domain/simulator/simulate.test.ts`

Identical validated input and simulator version must produce identical output and the same stable state hash.

## Units and validated inputs

| Input | Unit or range |
| --- | --- |
| Gravity | Earth gravity, `g`; schema range `0.05–5` |
| Local atmospheric pressure | `atm`; schema range `0–20` |
| Atmospheric gases | fractions in `[0,1]` summing to `1` |
| Mean temperature | `°C`; schema range `−100–150` |
| Temperature variation | symmetric half-range, `°C`; `0–100` |
| Radiation dose rate | `mSv/h` or `Sv/h`, normalized to `mSv/h` |
| Stellar energy/light | normalized `[0,1]` |
| Available water | normalized `[0,1]` |
| Humidity | normalized `[0,1]` |
| Magnetic-field strength | Earth-relative `[0,5]` |
| Shielding column mass | `kg/m²`, default `0` |
| Mean atmospheric molar mass | `kg/mol`, explicitly supplied |
| Geochemical availability | `none`, `low`, `moderate`, or `high` |
| Electron acceptors | nitrate, sulfate, ferric iron, carbon dioxide |

The UI exposes a narrower demonstration range for some values while the domain schema remains wider.

## Deterministic physical derivations

### Radiation normalization

```text
1 Sv/h = 1,000 mSv/h
```

The original value and unit remain in validated state for display and traceability.

### Temperature extremes

`temperatureVariationC` is a symmetric half-range:

```text
Tmin = Taverage − variation
Tmax = Taverage + variation
```

Thermal suitability evaluates the mean and both extremes:

```text
thermalBase = 0.50 × bell(Taverage, 18, 58)
            + 0.25 × bell(Tmin, 18, 58)
            + 0.25 × bell(Tmax, 18, 58)
```

Cold and heat traits respond to `Tmin` and `Tmax`. Variation is not applied as a flat penalty to mean fitness; it can harm or help depending on where the full range falls relative to the performance curve.

### Oxygen partial pressure

```text
oxygenPartialPressureAtm = localPressureAtm × oxygenFraction
```

Respiration uses partial pressure, not oxygen fraction alone.

### Local atmospheric density

When mean molar mass is supplied:

```text
ρ = pM / RT
```

`p` is local pressure in pascals, `M` is supplied mean molar mass, `R` is the universal gas constant, and `T` is local absolute temperature. High-atmosphere movement uses this derived local density; a habitat label never substitutes for it.

### Explicit alternative energy

An anaerobic or chemosynthetic pathway receives geochemical energy only when:

```text
geochemicalEnergyAvailability != "none"
AND electronAcceptors.length > 0
```

The availability mapping is `none=0`, `low=0.28`, `moderate=0.60`, and `high=0.90`. Missing input never creates a redox gradient.

## Continuous global scores

All public metrics are clamped to `[0,1]`. `bell(value, ideal, width)` is:

```text
exp(-((value − ideal) / width)²)
```

### Liquid-water support

Combines supplied water (`0.55`), temperature suitability around `14°C` (`0.30`), and pressure support relative to `1.1 atm` (`0.15`). It is an educational stability proxy, not a phase-equilibrium calculation.

### Atmospheric suitability

Combines pressure suitability around `1.05 atm` (`0.42`), oxygen partial-pressure suitability around `0.19 atm` (`0.45`), and the non-toxic fraction (`0.13`). Carbon dioxide above `5%` adds a gradually increasing model penalty.

### Thermal stability

Uses the weighted mean/minimum/maximum calculation above and selected cold/heat modifiers. The configured Vespera half-range remains part of every result even though the current UI edits only the mean.

### Radiation safety

Simulator 1.0.0 uses the explicit magnetic field as a simplified incident-radiation protection convention:

```text
effectiveDose = normalizedDose / (1 + 1.6 × EarthRelativeMagneticField)
radiationSafety = exp(-effectiveDose / 0.55) + radiationTraitModifiers
```

This is not spectrum-specific magnetosphere or material transport. It is a named game-model convention.

`shieldingColumnMassKgM2` is retained but does not attenuate dose because spectrum and material are not supplied. Cave, deep-ocean, and underground labels never reduce radiation. The underground regional score uses the same global radiation-safety input and therefore cannot invent protection.

### Biological energy

Combines stellar energy (`0.30`), explicit geochemical energy (`0.23`), liquid-water support (`0.18`), humidity (`0.09`), and a saturating carbon-availability proxy (`0.10`), then applies selected photosynthetic/chemosynthetic modifiers and high-carbon-dioxide cost.

Carbon dioxide therefore affects both the model and atmosphere visualization; it is not a display-only slider.

### Metabolic viability

The selected respiration pathway is scored continuously:

- oxygen respiration: bell curve centered at `0.20 atm` oxygen partial pressure;
- low-oxygen metabolism: bell curve centered at `0.075 atm`;
- anaerobic metabolism: `0.82 × explicit geochemical energy`;
- a low `0.18` background score represents simple low-yield metabolism, not an invented anaerobic pathway.

The strongest available pathway contributes `0.72`; biological energy contributes `0.28`; compatible trait modifiers add bounded support. Low oxygen constrains aerobic complexity but does not automatically make all life impossible.

### Physical, hydration, and movement fitness

Gravity and pressure use broad bell curves plus selected tolerance modifiers. Hydration combines liquid-water support, humidity, and water-conservation modifiers. Aquatic, terrestrial, and aerial movement have different benefits. Aerial movement specifically gains from derived density and loses value as gravity rises.

## Trait system

The life designer currently defines 33 traits in five categories. Every trait has:

- an integer biological energy cost;
- one or more continuous modifiers;
- documented advantages and tradeoffs;
- explicit conflicts where combinations are incompatible.

The budget is `100`. Simulator input above the budget or containing a conflict is rejected, including server-side recalculation. Trait costs and modifiers are model conventions, not measured universal energy values.

Complex traits increase adaptability or complexity but may reduce oxygen efficiency, reproduction, or both. Rapid reproduction trades against complexity; large bodies trade against oxygen demand; flight trades against gravity and density; insulation trades against heat tolerance.

## Representative regional variation

The first model evaluates six representative habitat aggregates rather than treating the entire planet uniformly:

| Region | Main inputs |
| --- | --- |
| Coastal | water, thermal stability, biological energy, hydration |
| Equatorial | shifted temperature, light, atmosphere, radiation safety |
| Polar | cold-shifted temperature, water, radiation safety, insulation |
| Deep ocean | water, aquatic movement, pressure, geochemistry, global radiation safety |
| Underground | global radiation safety, geochemistry, pressure, hydration, chemosynthesis |
| High altitude | atmosphere, global radiation safety, gravity, movement, flight, oxygen efficiency |

A regional score of `0.50` or above is labelled habitable under the model. This is not a procedural latitude/elevation climate grid. Planet markers map these aggregate scores to representative locations for communication only.

## Combined biological scores

Organism compatibility combines gravity, pressure, thermal, radiation, hydration, metabolism, movement, and the best regional refuge. Reproduction potential combines compatibility, biological energy, hydration, reproduction traits, and complexity cost. Population stability then combines compatibility, reproduction, best-region support, and adaptability.

Ecosystem potential combines population stability, energy, water, atmosphere, and thermal stability. Advanced-life potential combines ecosystem potential (`0.33`), metabolic viability (`0.17`), adaptability (`0.22`), and trait-derived complexity (`0.28`).

## Population model

The model runs generations `0–40` from an initial population of `120` in the current mission.

```text
K = 80,000 × ecosystemPotential
    × max(0.02, bestRegion)^1.35
    × (0.45 + 0.55 × biologicalEnergy)

r = 0.04 + 0.38 × reproductionPotential + 0.08 × adaptability
m = 0.22 × (1 − organismCompatibility)

N(t+1) = max(0, N(t) + rN(t)(1 − N(t)/K) − mN(t))
```

Very low organism compatibility adds a documented collapse multiplier. The chart represents a population trend, not simulated individuals or evolutionary generations with mutation.

## Mission evaluation and outcomes

Genesis mission success requires all three visible model conventions:

```text
advancedLifePotential >= 0.67
ecosystemPotential >= 0.55
finalPopulation >= 1,000
```

The ordered outcome evaluation can return:

1. immediate extinction;
2. temporary survival;
3. regional refuge;
4. advanced adaptable life;
5. stable multicellular ecosystem;
6. unstable ecological dominance;
7. expanding population;
8. stable simple population.

These labels summarize continuous evidence. The interface exposes scores and population data instead of presenting a binary answer or a checklist of exact target slider values.

## Procedural visual interpretation

The WebGL planet is deterministic for the same seed and shader code. Layered value noise and FBM generate orbital-scale continents, ridges, elevation, local moisture, biomes, ice, ocean masks, clouds, and biosphere patches. Shader uniforms interpolate toward world inputs.

Most exposed sliders have a visual consequence; gravity intentionally remains model-only because gravity alone does not establish planetary radius, density, composition, or geology:

- gravity changes deterministic organism support, movement, and flight costs without changing the seeded continents;
- temperature changes biome, ice, water stability, and heat regions; the UI endpoints deliberately communicate a globally frozen supplied-water shell at `−70°C` and evaporated surface water plus lava channels at `100°C`;
- pressure changes water stability, atmosphere thickness, clouds, and aurora support; zero pressure removes all four visual layers;
- oxygen and carbon dioxide change atmosphere color;
- water changes ocean masks and clouds; `0%` renders no surface water and `100%` renders an aquatic shell across the planet;
- radiation changes a labelled surface exposure map and an animated additive exposure shell; the `0–3 mSv/h` UI demonstration range maps linearly to the overlay only;
- magnetic field adds schematic flux lines and reduces the radiation-overlay exposure convention;
- light changes world-space illumination; a visible scene sun establishes the shared direction and the night side remains substantially darker;
- humidity changes moisture, fertile terrain, and clouds, and is capped by supplied water in the UI;
- pressure controls atmosphere density; zero pressure removes the visual atmosphere shell.

Temperature and radiation views include labelled low/mid/high legends so their colors are never the only interpretation aid.

Polar aurora intensity is a presentation-only product of three smooth gates: nonzero atmospheric density, nonzero Earth-relative magnetic field, and nonzero incident radiation. It is intended to explain their interaction, not predict an auroral oval, spectrum, latitude, or particle flux.

These mappings are aesthetic explanations, not additional scientific calculations. The temperature and radiation views are overlays. Biosphere patches appear only from the latest non-stale deterministic ecosystem score.

## Known simplifications

- one designed organism rather than a food web;
- six representative regions rather than a spatial climate grid;
- fixed environmental inputs rather than long climate cycles;
- broad gas categories and a supplied mean molar mass;
- no radiation spectrum or material attenuation;
- simplified magnetic protection;
- no detailed ocean, fluid, geological, genetic, or evolutionary simulation;
- no mutation, inheritance, predation, or ecological collapse dynamics beyond aggregate outcome conventions;
- no universal oxygen, flight, or pressure biological limit.

## Sources supporting conservative boundaries

- [NASA radiation analysis and shielding design](https://ddtrb.larc.nasa.gov/radiation/) supports spectrum- and material-dependent shielding and the decision not to infer cave/water attenuation.
- [USGS terminal electron acceptor table](https://pubs.usgs.gov/wri/wri994285/datatab/table1.html) supports explicit alternative electron acceptors with differing energy yields.
- [NASA ideal-gas relationship](https://www.grc.nasa.gov/WWW/K-12/Numbers/Math/Mathematical_Thinking/ideal_gases_under_constant.htm) supports the local atmospheric-density calculation.
- [Thermal-fluctuation meta-analysis](https://pubmed.ncbi.nlm.nih.gov/36750193/) supports context-dependent variability instead of a universal flat penalty.

## Versioning

Current version: `1.0.0`.

- Patch: coefficient correction that preserves contract shape.
- Minor: compatible new metrics, regions, or traits.
- Major: changed meaning, output contract, or incompatible scoring.

Changing a coefficient requires tests, this document, and a simulator-version decision.

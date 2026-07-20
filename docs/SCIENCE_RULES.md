# Xenogenesis Lab — Science Rules

## Model scope

Simulator 1.5.0 is a deterministic, scientifically inspired educational model for exploring interactions among a planet, a designed organism, representative habitats, and population stability. It is not a complete climate, atmospheric-chemistry, geology, radiation-transport, ecosystem, genetics, or evolutionary model.

All coefficients are versioned model conventions. They express consistent tradeoffs for this experience and must not be presented as universal biological limits.

## Sources of truth

- Physical input validation and derivation: `src/domain/world/schema.ts`
- Cross-parameter phase consequences: `src/domain/world/interactions.ts`
- Preference-preserving control updates: `src/domain/world/engineering.ts`
- Pure renderer state: `src/domain/world/visualization.ts`
- Simulator coefficients: `src/domain/simulator/coefficients.ts`
- Trait costs, conflicts, and modifiers: `src/domain/simulator/traits.ts`
- Continuous calculations and population loop: `src/domain/simulator/simulate.ts`
- Boundary and representative tests: `src/domain/world/*.test.ts` and `src/domain/simulator/simulate.test.ts`

Identical validated input and simulator version must produce identical output and the same stable state hash.

## Units and validated inputs

| Input | Unit or range |
| --- | --- |
| Gravity | Earth gravity, `g`; schema range `0.05–5` |
| Local atmospheric pressure | `atm`; schema range `0–5` |
| Atmospheric gases | fractions in `[0,1]` summing to `1` |
| Mean temperature | `°C`; schema range `−273–1800` |
| Temperature variation | symmetric half-range, `°C`; `0–100` |
| Radiation dose rate | `mSv/h` or `Sv/h`, normalized to `mSv/h` |
| Stellar energy/light | normalized `[0,1]` |
| Stable exposed surface-water inventory | normalized `[0,1]` |
| Humidity | normalized `[0,1]` |
| Magnetic-field strength | Earth-relative `[0,5]` |
| Shielding column mass | `kg/m²`, default `0` |
| Mean atmospheric molar mass | `kg/mol`, explicitly supplied |
| Geochemical availability | `none`, `low`, `moderate`, or `high` |
| Electron acceptors | nitrate, sulfate, ferric iron, carbon dioxide |

The UI exposes a narrower demonstration range for some values while the domain schema remains wider. Its water control represents a stable, exposed, climate-coupled hydrosphere. It does not represent transient frost, permanently shadowed deposits, bound minerals, or subsurface reservoirs on an otherwise airless body.

## Parameter audit and coupling

All eleven editable controls are retained because each supplies an independent input that cannot be honestly reconstructed from the others. Their current downstream effects are explicit:

| Control | Independent value | Direct downstream effects |
| --- | --- | --- |
| Gravity | surface acceleration | body support, terrestrial movement, circulation, and flight cost; it does not overwrite supplied pressure or water |
| Mean temperature | thermal mean | water phase support, thermal fitness, biomes, ice, steam, clouds, and extreme-heat terrain |
| Temperature variation | thermal half-range | minimum/maximum exposure, regional temperature, insulation and heat-resistance value |
| Atmosphere | local surface pressure | gas partial pressures, density, exposed water stability, clouds, humidity, aurora, respiration, and aerial movement |
| Oxygen | stored atmospheric fraction; UI displays `pO₂` | oxygen partial pressure, aerobic pathways, and atmospheric colour |
| Carbon dioxide | stored atmospheric fraction; UI displays `pCO₂` | atmospheric suitability, carbon availability, energy cost, and atmospheric colour |
| Surface water | preferred exposed inventory | pressure- and temperature-dependent ice/liquid/vapor shares, hydration, clouds, aquatic regions, and terrain moisture |
| Radiation | incident dose rate | effective dose, organism repair pressure, exposure overlay, and auroral presentation |
| Stellar energy | normalized usable light | illumination, photosynthetic input, and biological energy; it does not secretly replace an orbital climate model |
| Humidity | preferred atmospheric water-vapour proxy | effective humidity, hydration, clouds, and terrain moisture; its expression scales with atmosphere and exposed-water supply |
| Magnetic field | Earth-relative strength | the documented incident-radiation convention and auroral presentation; it cannot create an atmosphere or water |

The interface derives one of six ordered, parameter-specific captions from the current value. Inputs remain independent preferences; dependent controls display their physically expressed values instead of erasing user choices:

- the editable order follows the dependency chain: gravity, stellar energy, atmosphere, gas composition, mean temperature, temperature variation, water, humidity, magnetic field, and radiation;
- gravity remains editable, but its immediate effective-pressure ceiling is `min(stored pressure, 5 × gravity²) atm`, capped at `5 atm`; the stored pressure preference is preserved and becomes effective again when gravity supports it;
- below the water triple-point pressure (`0.006036 atm` in the model), the exposed-water effect smoothly approaches zero while the chosen inventory remains stored;
- across `mean ± variation`, water is partitioned continuously among ice, liquid, and vapor around `0°C` and the pressure-dependent boiling point;
- gas composition remains stored in vacuum, where its partial pressures correctly become zero;
- effective humidity is the chosen humidity multiplied by continuous atmosphere and exposed-water-supply factors;
- cloud potential is exactly zero when water or humidity is zero and otherwise changes continuously with humidity, pressure, and the thermal range;
- gas, surface-water, and humidity controls lock only when their physical support is zero; partial support remains editable through an inverse mapping to the stored preference;
- restoring compatible pressure or temperature automatically reapplies stored water, humidity, and composition preferences.

The boiling boundary uses a constant-enthalpy Clausius-Clapeyron estimate anchored at water's normal boiling point. It is a pure-water educational approximation, not a saline-water phase diagram or climate calculation.

### Independent-input boundary

The first mission lacks radius, mass, gas molecular-velocity distributions, rotation period, thermal inertia, albedo, stellar spectrum, XUV history, and geologic replenishment. Simulator 1.5.0 therefore uses an explicit educational pressure ceiling rather than claiming a complete escape-rate prediction: `P_eff = min(P_stored, 5 × g²) atm`, capped at `5 atm`. This is an immediate constraint, not annual atmospheric-loss simulation. The quadratic curve intentionally makes a `0.2 g` world support at most `0.2 atm`, while an Earth-gravity world can express the full `5 atm` slider range. NASA describes the physical direction correctly — stronger gravity raises escape velocity and generally improves atmospheric retention — while also noting that composition, stellar energy, magnetic field, temperature, and history matter. Gravity still affects biological body support and movement; effective pressure affects gas partial pressure, density, water stability, humidity, clouds, respiration, and aerial movement.

## Deterministic physical derivations

### Radiation normalization

```text
1 Sv/h = 1,000 mSv/h
```

The original value and unit remain in validated state for display and traceability.

### Temperature extremes

The configured `temperatureVariationC` is an independent symmetric half-range:

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

Supplied water is a hard prerequisite. Across the full configured temperature range, 33 deterministic samples receive smooth ice/liquid/vapor weights around freezing and the estimated boiling point. Pressure support changes smoothly from the triple-point boundary to `0.03 atm`. The public liquid-water score is the resulting stable liquid share, so a `−40±4°C` pure-water ocean at `1 atm` is fully frozen, while a wide range that crosses `0°C` can retain mixed phases. Temperature and pressure cannot invent water.

### Atmospheric suitability

Combines supplied pressure suitability around `1.05 atm` (`0.42`), oxygen partial-pressure suitability around `0.19 atm` (`0.45`), and the non-toxic fraction (`0.13`). Carbon dioxide above `5%` adds a gradually increasing model penalty. A smooth zero-pressure presence factor guarantees that zero pressure produces zero atmospheric suitability. No atmospheric-escape calculation is implied; composition, temperature, stellar history, radius, mass, and geology would be needed for that.

### Thermal stability

Uses the weighted mean/minimum/maximum calculation above and selected cold/heat modifiers. The UI exposes the symmetric temperature half-range independently from the mean.

### Radiation safety

Simulator 1.5.0 uses the explicit magnetic field as a simplified incident-radiation protection convention:

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

Both oxygen-dependent bell curves and their trait modifiers are multiplied by the continuous availability factor `1 − exp(−pO₂ / 0.02)`. They therefore approach zero smoothly and are exactly zero at zero oxygen partial pressure. The strongest available pathway contributes `0.72`; biological energy contributes `0.28`; compatible trait modifiers add bounded support. Low oxygen constrains aerobic complexity but does not automatically make all life impossible.

### Physical, hydration, and movement fitness

Gravity and pressure use broad bell curves plus selected tolerance modifiers. Pressure fitness is multiplied by the same continuous atmosphere-presence factor used by the physical interaction layer, so it cannot remain near ideal in a vacuum. Hydration combines phase-derived liquid-water support, effective humidity, and water-conservation modifiers. Aquatic, terrestrial, and aerial movement have different benefits. Aquatic movement requires the liquid share rather than treating ice as an ocean; aerial movement gains from derived density and loses value as gravity rises.

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
| Equatorial | configured maximum temperature, light, atmosphere, radiation safety |
| Polar | configured minimum temperature, water, radiation safety, insulation |
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

Most exposed sliders have a visual consequence. Independent inputs are converted once into a pure renderer state, and the GPU interpolates toward those targets:

- gravity changes deterministic organism support, movement, and flight costs without redrawing continents or overwriting pressure, water, or humidity;
- local shader temperature is calculated in degrees Celsius inside `mean ± variation`; `36±4°C` cannot create snow, while `−40±4°C` freezes the complete supplied exposed hydrosphere;
- ice, liquid water, and vapor use the same available phase inventory as the deterministic layer; the renderer distributes visible liquid and ice locally from latitude temperature, so a warm equator and frozen poles can coexist;
- pressure changes water stability, atmosphere thickness, effective humidity, clouds, density, and aurora support;
- oxygen and carbon dioxide change atmosphere color;
- water changes phase-aware ocean/ice masks and cloud supply; `0%` renders no surface water and `100%` renders an aquatic or icy shell when pressure supports exposed water;
- radiation changes a labelled surface exposure map and a subtler animated exposure shell in the realistic view; the `0–3 mSv/h` UI demonstration range is normalized linearly before the documented `1 + 1.6 × field` magnetic-protection convention is applied;
- magnetic field reduces the radiation-overlay exposure convention and, with atmosphere plus incident radiation, permits an auroral presentation; it has no distracting field-line geometry;
- light changes world-space illumination; the reset camera begins on the day side and the night side remains darker but readable;
- humidity changes moisture and clouds through a continuous water-supply factor; a dry zero-water world produces exactly zero clouds;
- pressure controls atmosphere density; zero pressure removes the visual atmosphere shell.

Dry terrain becomes sandy from mild temperatures because sand is controlled primarily by aridity, not a `60°C` heat switch. Green macroscopic-biosphere coloring fades above `45°C` and is absent by `60°C`; this is a visualization boundary for plant-like coverage, not a universal limit on microbial life. The editable mean-temperature range is `−273…1800°C`. Assuming exposed basaltic surface rock for presentation, a smooth molten-rock fraction begins at `780°C` and reaches one at `1050°C`; procedural glowing channels indicate a magma-ocean surface, not an inferred volcanic eruption or geological heat source.

Local shader temperature stays inside `mean ± variation`. The equator reaches the hot extreme and the poles reach the cold extreme, with small terrain noise only perturbing intermediate terrain latitudes. The water layer uses the same latitude extremes without the terrain perturbation: local water below the `−2…2°C` transition renders as ice when the shared phase inventory contains ice, while warm water remains liquid. Thus a `41°C` equator is never frozen merely because the planet also has sub-zero poles. The deterministic equatorial and polar region scores consume the same configured maximum and minimum temperatures.

Ocean height is illustrative rather than a fluid-volume calculation because the mission does not provide planetary radius, basin hypsometry, or ocean depth. The renderer maps exposed surface-water coverage from a level just above the deepest possible procedural basin to a level just below the tallest possible procedural summit. It does not enlarge the entire water mesh beyond the terrain.

Temperature and radiation views include labelled low/mid/high legends so their colors are never the only interpretation aid.

Polar aurora intensity is a presentation-only product of three smooth gates: nonzero atmospheric density, nonzero Earth-relative magnetic field, and nonzero incident radiation. The renderer uses animated, broken polar ovals rather than field lines. It is intended to explain their interaction, not predict an auroral oval, spectrum, latitude, or particle flux. At zero pressure, atmosphere, clouds, aurora, water shells, and atmospheric rim light snap to zero; the radiation shell is restricted to the explicitly selected radiation view.

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
- [NIST water phase-change data](https://webbook.nist.gov/cgi/cbook.cgi?ID=C7732185&Type=ANTOINE) supports pressure-dependent water vapour-pressure treatment.
- [NASA Astrobiology on water's triple point](https://astrobiology.nasa.gov/news/chlorate-rich-soil-may-help-us-find-liquid-water-on-mars/) supports the exposed-liquid-water pressure boundary.
- [NOAA on relative humidity](https://www.nesdis.noaa.gov/about/k-12-education/atmosphere/what-humidity) supports tying humidity to atmospheric water vapour, temperature, and a water source.
- [NASA on rocky-world atmosphere retention](https://science.nasa.gov/mission/webb/science-overview/science-explainers/can-rocky-worlds-orbiting-red-dwarf-stars-maintain-atmospheres/) supports retaining composition, stellar energy, and history as relevant factors instead of using gravity as a complete escape model.
- [NASA on lunar weather](https://science.nasa.gov/moon/weather-on-the-moon/) supports the direction that an almost airless exposed surface undergoes extreme day-night temperature swings and forms no clouds.
- [NOAA cloud overview](https://www.nesdis.noaa.gov/our-environment/clouds) supports representing clouds as suspended water droplets or ice crystals above the surface.
- [USGS lava-cooling report](https://pubs.usgs.gov/of/1997/of97-724/lavacool.html) reports basaltic lava as mobile around `1,000–1,200°C` and solidifying near `800°C`, supporting the renderer's `780–1050°C` smooth visual transition.

## Versioning

Current version: `1.5.0`.

- Patch: coefficient correction that preserves contract shape.
- Minor: compatible new metrics, regions, or traits.
- Major: changed meaning, output contract, or incompatible scoring.

Changing a coefficient requires tests, this document, and a simulator-version decision.

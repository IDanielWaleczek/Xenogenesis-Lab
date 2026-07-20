import type {
  LifeTraitId,
  RegionId,
  SimulationMetricId,
  SurvivalSimulationResult,
} from "@/domain/simulator/schema";
import type { TraitCategory } from "@/domain/simulator/traits";

/** Languages supported by the reviewed interface copy. */
export type Language = "en" | "pl";

/** User-facing phases in the repeatable simulation loop. */
export type LabPhase = "planet" | "life" | "results";

/** Editable inputs exposed by the procedural laboratory. */
export type ParameterId =
  | "gravity"
  | "temperature"
  | "temperatureVariation"
  | "pressure"
  | "oxygen"
  | "carbonDioxide"
  | "water"
  | "radiation"
  | "light"
  | "humidity"
  | "magneticField";

type ParameterCopy = {
  label: string;
  unit: string;
  earthReference: string;
  captions: readonly [string, string, string, string, string, string];
};

type TraitCopy = {
  title: string;
  advantage: string;
  tradeoff: string;
};

export type LabCopy = {
  document: { title: string; description: string };
  language: { label: string; english: string; polish: string };
  boot: {
    eyebrow: string;
    title: string;
    subtitle: string;
    sceneLabel: string;
    enter: string;
  };
  header: {
    system: string;
    reset: string;
    resetCamera: string;
    rotationOn: string;
    rotationOff: string;
  };
  phases: Record<LabPhase, { label: string; description: string }>;
  planet: {
    title: string;
    instruction: string;
    parameterGroup: string;
    baseline: string;
    resetBaseline: string;
    liveView: string;
    viewMode: string;
    modes: { realistic: string; temperature: string; radiation: string };
    visualTransition: string;
    controlsDesktop: string;
    controlsMobile: string;
    openDesigner: string;
    legends: {
      temperature: { title: string; cold: string; temperate: string; hot: string };
      radiation: { title: string; protected: string; elevated: string; severe: string };
    };
  };
  parameters: Record<ParameterId, ParameterCopy>;
  parameterConstraints: {
    requiresAtmosphere: string;
    gravityLimited: string;
    requiresWaterPressure: string;
    surfaceWaterBoils: string;
    surfaceWaterLimited: string;
    requiresSurfaceWater: string;
    humidityLimitedByWater: string;
  };
  environment: {
    title: string;
    planetDescription: string;
    designDescription: string;
    climate: string;
    atmosphere: string;
    hydrosphere: string;
    humidity: string;
    energyCarbon: string;
    radiation: string;
    mean: string;
    variation: string;
    range: string;
    gravity: string;
    storedPressure: string;
    pressureCapacity: string;
    effectivePressure: string;
    oxygen: string;
    waterInventory: string;
    liquid: string;
    ice: string;
    vapor: string;
    surfaceWater: string;
    boilingPoint: string;
    noBoilingPoint: string;
    selected: string;
    effective: string;
    clouds: string;
    stellarEnergy: string;
    carbonDioxide: string;
    incident: string;
    protected: string;
    magneticField: string;
    earthFieldUnit: string;
    shieldingColumn: string;
  };
  life: {
    title: string;
    instruction: string;
    selected: string;
    budget: string;
    budgetExplanation: string;
    cost: string;
    advantage: string;
    tradeoff: string;
    conflict: string;
    budgetExceeded: string;
    selectionLimit: string;
    minimumTraits: string;
    clear: string;
    run: string;
    running: string;
    previewHint: string;
  };
  categories: Record<TraitCategory, string>;
  traits: Record<LifeTraitId, TraitCopy>;
  simulation: {
    title: string;
    emptyTitle: string;
    emptyDescription: string;
    staleTitle: string;
    staleDescription: string;
    deterministic: string;
    success: string;
    continue: string;
    objective: string;
    outcome: string;
    stateHash: string;
    modelVersion: string;
    metricsTitle: string;
    strengths: string;
    limits: string;
    regionsTitle: string;
    habitable: string;
    populationTitle: string;
    generation: string;
    population: string;
    initial: string;
    peak: string;
    final: string;
    capacity: string;
    previousScore: string;
    noPreviousRun: string;
    adaptPlanet: string;
    adaptLife: string;
    rerun: string;
    educationalNotice: string;
  };
  metrics: Record<SimulationMetricId, { label: string; description: string }>;
  regions: Record<RegionId, { label: string; description: string }>;
  outcomes: Record<SurvivalSimulationResult["outcome"], { title: string; description: string }>;
  organism: {
    title: string;
    procedural: string;
    generated: string;
    requestImage: string;
    generating: string;
    fallback: string;
    error: string;
    alt: string;
  };
  consultant: {
    title: string;
    description: string;
    request: string;
    loading: string;
    liveSource: string;
    localSource: string;
    fallbackNotice: string;
    assessment: string;
    traits: string;
    insights: string;
    experiment: string;
    error: string;
    retry: string;
  };
  status: {
    local: string;
    ai: string;
    visual: string;
    calculated: string;
  };
  footer: string;
};

const english: LabCopy = {
  document: {
    title: "Xenogenesis Lab | Procedural Life Simulator",
    description: "Engineer a procedural planet, design alien life, and test it with a deterministic astrobiology simulation.",
  },
  language: { label: "Language", english: "English", polish: "Polski" },
  boot: {
    eyebrow: "Xenogenesis research platform · remote node 07",
    title: "XENOGENESIS LAB",
    subtitle: "Procedural astrobiology simulation environment",
    sceneLabel: "From orbit to organism",
    enter: "Open laboratory",
  },
  header: {
    system: "Dynamic life engineering system",
    reset: "Reset laboratory",
    resetCamera: "Reset camera",
    rotationOn: "Pause rotation",
    rotationOff: "Resume rotation",
  },
  phases: {
    planet: { label: "Engineer planet", description: "Build a coherent chain of planetary conditions." },
    life: { label: "Design life", description: "Build a biological strategy with real tradeoffs." },
    results: { label: "Analyze", description: "Read the outcome and decide what to change." },
  },
  planet: {
    title: "Planet engineering",
    instruction: "Every control affects the deterministic model; the visual planet responds only where the supplied physical inputs justify it.",
    parameterGroup: "Environmental systems",
    baseline: "Barren starting world",
    resetBaseline: "Reset barren world",
    liveView: "Live procedural planet",
    viewMode: "Scientific view",
    modes: { realistic: "Realistic", temperature: "Temperature", radiation: "Radiation" },
    visualTransition: "Terraforming visualization is interpolating toward the current parameters.",
    controlsDesktop: "PC: drag with the left mouse button to rotate · use the wheel to zoom",
    controlsMobile: "Mobile: drag with one finger to rotate · pinch with two fingers to zoom",
    openDesigner: "Continue to life designer",
    legends: {
      temperature: { title: "Temperature", cold: "Frozen", temperate: "Temperate", hot: "Molten" },
      radiation: { title: "Radiation exposure", protected: "Protected", elevated: "Elevated", severe: "Severe" },
    },
  },
  parameters: {
    gravity: { label: "🪐 Gravity", unit: "g", earthReference: "Earth reference: 1 g", captions: [
      "Near-zero gravity provides almost no body support and makes controlled surface movement difficult.",
      "Very low gravity reduces weight but complicates traction, circulation, and stable locomotion.",
      "Low gravity favors light structures while reducing traction and changing flight costs.",
      "Moderate gravity supports familiar body plans and manageable surface movement.",
      "High gravity raises structural, circulation, and locomotion costs for large bodies.",
      "Extreme gravity imposes severe body-support, circulation, and movement costs.",
    ] },
    light: { label: "☀️ Stellar energy", unit: "%", earthReference: "Earth reference: 100% (model scale)", captions: [
      "Negligible stellar input leaves the surface dark and removes practical photosynthetic energy.",
      "Very weak light supports little phototrophic energy and weak day-side illumination.",
      "Low light can support specialized photosynthesis but not high biological productivity.",
      "Moderate light provides useful illumination and a reliable photosynthetic pathway.",
      "Strong light supplies abundant phototrophic energy and pronounced day-night forcing.",
      "Extreme light maximizes illumination; mean temperature remains explicit because spectrum and orbit are unknown.",
    ] },
    pressure: { label: "🌫️ Atmosphere", unit: "atm", earthReference: "Earth reference: 1 atm", captions: [
      "Vacuum cannot transport heat, sustain clouds, or support an exposed surface hydrosphere.",
      "A trace atmosphere barely redistributes heat and leaves temperature swings close to airless conditions.",
      "A thin atmosphere provides limited heat transport, gas density, and water stability.",
      "A light atmosphere moderates extremes and begins supporting clouds, respiration, and flight.",
      "A substantial atmosphere redistributes heat and supports stable water, weather, and buoyancy.",
      "Atmospheric pressure continuously affects water stability, humidity, clouds, density, and aurora support without erasing the stored user preference.",
    ] },
    carbonDioxide: { label: "🧪 Carbon dioxide partial pressure", unit: "atm", earthReference: "Earth reference: ≈0.00042 atm", captions: [
      "No carbon dioxide removes this modeled inorganic-carbon source and its greenhouse contribution.",
      "Trace carbon dioxide supplies little carbon but already participates in atmospheric heat retention.",
      "Low carbon dioxide supports carbon fixation with a modest greenhouse contribution.",
      "Elevated carbon dioxide increases available carbon and heat retention while adding physiological stress.",
      "High carbon dioxide strongly alters atmospheric chemistry and penalizes many respiratory strategies.",
      "Extreme carbon dioxide is toxic to many modeled organisms despite abundant inorganic carbon.",
    ] },
    oxygen: { label: "💨 Oxygen partial pressure", unit: "atm", earthReference: "Earth reference: ≈0.21 atm", captions: [
      "No oxygen disables aerobic respiration; only explicitly supported alternative pathways remain.",
      "Very low oxygen partial pressure supports only low-oxygen or non-aerobic strategies.",
      "Low oxygen constrains sustained aerobic metabolism and energetic complexity.",
      "Moderate oxygen supports efficient aerobic metabolism when total pressure is sufficient.",
      "High oxygen exceeds the preferred respiratory range and increases oxidative pressure.",
      "Extreme oxygen strongly favors combustion and oxidative stress despite high aerobic availability.",
    ] },
    temperature: { label: "🌡️ Mean temperature", unit: "°C", earthReference: "Earth reference: ≈15 °C global mean", captions: [
      "Near-absolute-zero conditions freeze exposed volatiles and suppress active chemistry.",
      "Deep cold leaves available surface water as ice and strongly limits metabolism.",
      "Cool-to-temperate conditions can support liquid water when pressure and local extremes allow it.",
      "Hot conditions vaporize exposed water and impose severe heat pressure without yet melting basaltic terrain.",
      "Basaltic surface rock begins transitioning from solid crust toward visibly molten material under the renderer convention.",
      "Magma-ocean temperatures produce a predominantly molten rocky surface; this does not imply active volcanism.",
    ] },
    temperatureVariation: { label: "🌡️↕️ Temperature variation", unit: "°C", earthReference: "Earth reference: ±15 °C (model convention)", captions: [
      "Minimal variation creates a thermally uniform world with few climate-driven niches.",
      "Small variation reduces thermal stress while preserving mild regional differences.",
      "Moderate variation creates useful hot and cold niches and adaptation tradeoffs.",
      "Large variation produces regular freezing and overheating across exposed regions.",
      "Severe variation demands insulation, dormancy, migration, or heat resistance.",
      "Extreme variation is characteristic of weakly moderated exposed surfaces and dominates survival.",
    ] },
    water: { label: "🌊 Surface water", unit: "%", earthReference: "Earth reference: ≈71%", captions: [
      "No exposed water means no oceans, water-fed humidity, or aquatic habitats.",
      "Trace water supports isolated deposits but little humidity or ecosystem capacity.",
      "Sparse water creates limited coasts, hydration sources, and local cloud formation.",
      "Regional water supports coasts, humidity, clouds, and mixed aquatic-terrestrial strategies.",
      "Abundant water strengthens aquatic habitats and atmospheric moisture while reducing dry land.",
      "A water-dominated surface maximizes aquatic area and humidity supply but leaves little exposed terrain.",
    ] },
    humidity: { label: "💧 Humidity", unit: "%", earthReference: "Earth reference: 60% (model proxy)", captions: [
      "No atmospheric water vapor suppresses clouds and strongly favors water conservation.",
      "Very dry air permits only sparse clouds and rapidly removes moisture from exposed organisms.",
      "Low humidity limits cloud cover and favors protected or water-conserving biology.",
      "Moderate humidity supports hydration, clouds, and productive surface terrain.",
      "High humidity produces extensive cloud potential and reduces evaporative water loss.",
      "Near-saturated air strongly supports clouds when an exposed water supply and atmosphere are present.",
    ] },
    magneticField: { label: "🧲 Magnetic field", unit: "Earth", earthReference: "Earth reference: 1 Earth field", captions: [
      "No global field provides no magnetic reduction of the modeled incident radiation.",
      "A trace field offers negligible protection and only weak auroral organization.",
      "A weak field reduces part of the effective dose when incident radiation is present.",
      "A moderate field materially lowers modeled exposure and supports organized auroras.",
      "A strong field further lowers exposure, although it cannot create atmosphere or water.",
      "An extreme field maximizes the simplified protection convention with diminishing added value.",
    ] },
    radiation: { label: "☢️ Radiation dose rate", unit: "mSv/h", earthReference: "Earth reference: ≈0.0003 mSv/h natural background", captions: [
      "Negligible incident radiation creates little repair pressure or auroral activity.",
      "Low radiation is manageable for many strategies without specialized protection.",
      "Elevated radiation rewards repair systems and benefits from magnetic protection.",
      "High radiation substantially reduces surface safety and increases biological repair cost.",
      "Severe radiation dominates adaptation and leaves few unprotected surface strategies viable.",
      "Extreme radiation overwhelms most exposed biology without strong combined protection.",
    ] },
  },
  parameterConstraints: {
    requiresAtmosphere: "This value needs an atmosphere to have an effect.",
    gravityLimited: "Gravity currently limits the effective atmospheric pressure.",
    requiresWaterPressure: "Exposed surface water needs more pressure here.",
    surfaceWaterBoils: "At this temperature, exposed water is vapor.",
    surfaceWaterLimited: "Pressure and phase balance currently reduce exposed surface water.",
    requiresSurfaceWater: "Effective humidity needs atmosphere and phase-supported surface water.",
    humidityLimitedByWater: "Atmosphere and exposed water currently limit effective humidity.",
  },
  environment: {
    title: "Active world evidence",
    planetDescription: "These are the active deterministic consequences of the current planetary parameters.",
    designDescription: "These deterministic conditions shape the tradeoffs of every trait. Traits remain selectable so you can test a risky hypothesis.",
    climate: "Climate",
    atmosphere: "Atmosphere and gravity",
    hydrosphere: "Hydrosphere",
    humidity: "Atmospheric moisture",
    energyCarbon: "Energy and carbon",
    radiation: "Radiation protection",
    mean: "Mean",
    variation: "Variation",
    range: "Range",
    gravity: "Gravity",
    storedPressure: "Selected pressure",
    pressureCapacity: "Gravity pressure limit",
    effectivePressure: "Effective pressure",
    oxygen: "Oxygen pO₂",
    waterInventory: "Water inventory",
    liquid: "Liquid",
    ice: "Ice",
    vapor: "Vapor",
    surfaceWater: "Surface water",
    boilingPoint: "Water boiling point",
    noBoilingPoint: "No liquid-water pressure support",
    selected: "Selected",
    effective: "Effective",
    clouds: "Cloud potential",
    stellarEnergy: "Stellar energy",
    carbonDioxide: "Carbon dioxide pCO₂",
    incident: "Incident",
    protected: "After magnetic protection",
    magneticField: "Magnetic field",
    earthFieldUnit: "× Earth",
    shieldingColumn: "Shielding column",
  },
  life: {
    title: "Lifeform designer",
    instruction: "Choose compatible adaptations. Advantages consume a shared biological energy budget and always carry costs.",
    selected: "traits selected",
    budget: "Biological energy budget",
    budgetExplanation: "The budget prevents unlimited trait stacking. Costs are simulator conventions, not universal biological constants.",
    cost: "Cost",
    advantage: "Advantage",
    tradeoff: "Tradeoff",
    conflict: "That trait conflicts with one of your current selections.",
    budgetExceeded: "That trait would exceed the biological energy budget.",
    selectionLimit: "The first model supports at most 14 selected traits.",
    minimumTraits: "Select at least three traits before running the simulation.",
    clear: "Clear traits",
    run: "Run survival simulation",
    running: "Simulating 40 generations…",
    previewHint: "The procedural morphology updates from the seed, world, and selected traits.",
  },
  categories: {
    body: "Body",
    physiology: "Physiology",
    senses: "Senses",
    reproduction: "Reproduction",
    intelligence: "Complexity",
  },
  traits: {
    compactBody: { title: "Compact body", advantage: "Handles high gravity and conserves water.", tradeoff: "Offers less room for specialized organs." },
    largeBody: { title: "Large body", advantage: "Buffers cold and supports greater complexity.", tradeoff: "Needs more oxygen and biological energy." },
    internalSkeleton: { title: "Internal skeleton", advantage: "Supports efficient movement under gravity.", tradeoff: "Consumes construction resources." },
    exoskeleton: { title: "Exoskeleton", advantage: "Limits water loss and adds physical shielding.", tradeoff: "Becomes costly under high gravity." },
    aquaticMovement: { title: "Aquatic movement", advantage: "Moves efficiently through water and pressure gradients.", tradeoff: "Conflicts with specialized land or aerial movement." },
    terrestrialMovement: { title: "Terrestrial movement", advantage: "Traverses exposed surface habitats efficiently.", tradeoff: "Performs poorly in deep water and extreme terrain." },
    aerialMovement: { title: "Aerial movement", advantage: "Provides dispersal and habitat access in dense air.", tradeoff: "Very costly in high gravity or thin atmospheres." },
    oxygenRespiration: { title: "Oxygen respiration", advantage: "Supports high-energy, complex activity near Earth-like oxygen levels.", tradeoff: "Fails as oxygen partial pressure falls." },
    lowOxygenMetabolism: { title: "Low-oxygen metabolism", advantage: "Extracts energy from oxygen-poor atmospheres.", tradeoff: "Delivers less power for complex tissues." },
    anaerobicMetabolism: { title: "Anaerobic metabolism", advantage: "Uses explicit geochemical redox energy without oxygen.", tradeoff: "Requires a usable gradient and limits complexity." },
    photosynthesis: { title: "Photosynthesis", advantage: "Captures stellar energy directly.", tradeoff: "Needs light and reduces mobility." },
    chemosynthesis: { title: "Chemosynthesis", advantage: "Uses supplied geochemical energy in dark habitats.", tradeoff: "Depends on explicit electron acceptors and has lower yield." },
    radiationResistance: { title: "Radiation resistance", advantage: "Reduces damage under strong exposure.", tradeoff: "Consumes repair energy and slows reproduction." },
    thermalInsulation: { title: "Thermal insulation", advantage: "Improves cold survival.", tradeoff: "Creates heat stress in warm regions." },
    heatResistance: { title: "Heat resistance", advantage: "Protects proteins and membranes at high temperature.", tradeoff: "Raises water demand and conflicts with thick insulation." },
    waterConservation: { title: "Water conservation", advantage: "Extends survival in dry regions.", tradeoff: "Slows exchange and reproduction." },
    pressureResistance: { title: "Pressure resistance", advantage: "Supports deep-ocean and unusual-pressure habitats.", tradeoff: "Reduces movement efficiency." },
    regenerativeTissue: { title: "Regenerative tissue", advantage: "Repairs radiation and environmental damage.", tradeoff: "High metabolic and reproductive cost." },
    hibernation: { title: "Hibernation", advantage: "Survives cold, dry, or seasonal stress.", tradeoff: "Sacrifices active growth time." },
    visibleVision: { title: "Visible-light vision", advantage: "Low-cost navigation under useful starlight.", tradeoff: "Weak in darkness, dust, or deep water." },
    infraredVision: { title: "Infrared vision", advantage: "Finds heat contrasts in darkness or haze.", tradeoff: "Costs more neural and sensory energy." },
    echolocation: { title: "Echolocation", advantage: "Maps dark or obscured environments.", tradeoff: "Requires active energy and suitable atmospheric density." },
    chemicalSensing: { title: "Chemical sensing", advantage: "Finds nutrients and redox gradients without light.", tradeoff: "Provides slow, local information." },
    rapidReproduction: { title: "Rapid reproduction", advantage: "Recovers quickly from mortality shocks.", tradeoff: "Reduces individual complexity and parental care." },
    protectedEggs: { title: "Protected eggs", advantage: "Buffers embryos against dryness and temperature swings.", tradeoff: "Costs material and conflicts with other development modes." },
    liveBirth: { title: "Live birth", advantage: "Protects developing offspring internally.", tradeoff: "Slows reproduction and raises adult energy needs." },
    spores: { title: "Spores", advantage: "Disperses widely and survives harsh intervals.", tradeoff: "Supports simpler development and low individual survival." },
    parentalInvestment: { title: "Parental investment", advantage: "Improves learning and offspring survival.", tradeoff: "Produces fewer offspring and conflicts with rapid reproduction." },
    simpleNeuralSystem: { title: "Simple neural system", advantage: "Adds basic behavioral adaptation at low cost.", tradeoff: "Cannot support sophisticated tools." },
    socialCoordination: { title: "Social coordination", advantage: "Improves collective survival and resource use.", tradeoff: "Requires communication and group stability." },
    toolUsePotential: { title: "Tool-use potential", advantage: "Allows flexible environmental modification.", tradeoff: "Demands exceptional energy and oxygen supply." },
    complexCommunication: { title: "Complex communication", advantage: "Coordinates learning and social adaptation.", tradeoff: "Requires costly neural processing and development." },
    adaptiveLearning: { title: "Adaptive learning", advantage: "Responds flexibly to changing conditions.", tradeoff: "Consumes energy and delays reproduction." },
  },
  simulation: {
    title: "Survival analysis",
    emptyTitle: "No simulation yet",
    emptyDescription: "Engineer the planet, select at least three compatible traits, and simulate 40 generations.",
    staleTitle: "Configuration changed",
    staleDescription: "These results belong to the previous configuration. Run again to evaluate the current world and organism.",
    deterministic: "Locally calculated",
    success: "Stable outcome reached",
    continue: "Viable experiment — continue adapting",
    objective: "Advanced-life potential",
    outcome: "Model outcome",
    stateHash: "Reproducible state",
    modelVersion: "Simulator",
    metricsTitle: "Interacting suitability scores",
    strengths: "Strongest systems",
    limits: "Limiting systems",
    regionsTitle: "Regional survival",
    habitable: "habitable under this model",
    populationTitle: "Population across 40 generations",
    generation: "Generation",
    population: "Population",
    initial: "Initial",
    peak: "Peak",
    final: "Final",
    capacity: "Carrying capacity",
    previousScore: "Change from previous run",
    noPreviousRun: "Run another configuration to compare advanced-life potential.",
    adaptPlanet: "Adapt planet",
    adaptLife: "Adapt lifeform",
    rerun: "Run current configuration",
    educationalNotice: "Scientifically inspired educational model, not a complete climate or evolutionary prediction.",
  },
  metrics: {
    liquidWater: { label: "Liquid water", description: "Surface water supported by supply, pressure, and temperature." },
    atmosphere: { label: "Atmosphere", description: "Pressure, oxygen partial pressure, and non-toxic composition." },
    thermalStability: { label: "Thermal stability", description: "Compatibility across the configured mean and variation." },
    radiationSafety: { label: "Radiation safety", description: "Exposure after explicit magnetic and biological protection." },
    biologicalEnergy: { label: "Biological energy", description: "Light, geochemical, water, and carbon energy opportunity." },
    metabolicViability: { label: "Metabolic viability", description: "How well selected energy pathways fit the supplied world." },
    organismCompatibility: { label: "Organism compatibility", description: "Combined body, movement, hydration, pressure, and stress fit." },
    reproductionPotential: { label: "Reproduction", description: "Capacity to replace losses without overspending energy." },
    populationStability: { label: "Population stability", description: "Long-term balance of compatibility, reproduction, and adaptation." },
    ecosystemPotential: { label: "Ecosystem potential", description: "Capacity for a durable biosphere under available energy." },
    advancedLifePotential: { label: "Advanced life", description: "Combined ecosystem, metabolism, adaptability, and complexity potential." },
  },
  regions: {
    coastal: { label: "Coastal zones", description: "Mixed land-water habitats with access to moisture and energy." },
    equatorial: { label: "Equatorial zones", description: "High-light regions sensitive to heat and radiation." },
    polar: { label: "Polar zones", description: "Cold regions that reward insulation and dormancy." },
    deepOcean: { label: "Deep ocean", description: "Dark, high-pressure habitat dependent on water and geochemistry." },
    underground: { label: "Underground", description: "Sheltered habitat; radiation is not reduced without explicit shielding input." },
    highAltitude: { label: "High atmosphere", description: "Thin-air region governed by local density, gravity, and flight costs." },
  },
  outcomes: {
    immediateExtinction: { title: "Immediate extinction", description: "Basic environmental stress overwhelms the selected organism." },
    temporarySurvival: { title: "Temporary survival", description: "A small population persists briefly but cannot replace its losses." },
    regionalRefuge: { title: "Regional refuge", description: "The organism survives only inside a limited set of favorable regions." },
    stableSimplePopulation: { title: "Stable simple population", description: "The population persists, but energy or complexity remains constrained." },
    expandingPopulation: { title: "Expanding population", description: "The organism grows across compatible habitats without advanced stability yet." },
    unstableDominance: { title: "Unstable ecological dominance", description: "Rapid growth approaches capacity while ecosystem stability lags." },
    stableMulticellularEcosystem: { title: "Stable multicellular ecosystem", description: "Population and ecosystem scores support durable complex life." },
    advancedAdaptiveLife: { title: "Advanced adaptable life", description: "The configured world supports high complexity, adaptation, and long-term stability." },
  },
  organism: {
    title: "Organism field model",
    procedural: "Deterministic procedural morphology",
    generated: "GPT-guided generated field illustration",
    requestImage: "Generate field illustration",
    generating: "Generating controlled illustration…",
    fallback: "The procedural field model remains available; no generated image was returned.",
    error: "Image generation is unavailable. The deterministic field model is unchanged.",
    alt: "Procedural alien organism adapted to the current Vespera experiment",
  },
  consultant: {
    title: "Life Sciences Consultant",
    description: "Ask GPT-5.4-mini to interpret the completed deterministic result. It cannot alter the scores.",
    request: "Request consultant analysis",
    loading: "Consultant is reviewing the evidence…",
    liveSource: "GPT-5.4-mini analysis",
    localSource: "Local scientific fallback",
    fallbackNotice: "GPT-5.4-mini was unavailable, so this clearly labelled local interpretation was used.",
    assessment: "Planet assessment",
    traits: "Trait assessment",
    insights: "Key observations",
    experiment: "Suggested experiment",
    error: "Consultant analysis could not be loaded.",
    retry: "Try consultant again",
  },
  status: {
    local: "Local deterministic model",
    ai: "Server-side AI",
    visual: "Visual interpretation",
    calculated: "Calculated evidence",
  },
  footer: "Xenogenesis Lab · OpenAI Build Week · educational astrobiology simulator",
};

const polish: LabCopy = {
  document: {
    title: "Xenogenesis Lab | Proceduralny symulator życia",
    description: "Zaprojektuj proceduralną planetę i obce życie, a następnie przetestuj je w deterministycznej symulacji astrobiologicznej.",
  },
  language: { label: "Język", english: "English", polish: "Polski" },
  boot: {
    eyebrow: "Platforma badawcza Xenogenesis · zdalny węzeł 07",
    title: "XENOGENESIS LAB",
    subtitle: "Środowisko proceduralnych symulacji astrobiologicznych",
    sceneLabel: "Od orbity do organizmu",
    enter: "Otwórz laboratorium",
  },
  header: {
    system: "Dynamiczny system projektowania życia",
    reset: "Resetuj laboratorium",
    resetCamera: "Resetuj kamerę",
    rotationOn: "Wstrzymaj obrót",
    rotationOff: "Wznów obrót",
  },
  phases: {
    planet: { label: "Modyfikuj planetę", description: "Zbuduj spójny łańcuch warunków planetarnych." },
    life: { label: "Projektuj życie", description: "Zbuduj strategię biologiczną z realnymi kompromisami." },
    results: { label: "Analizuj", description: "Odczytaj wynik i zdecyduj, co zmienić." },
  },
  planet: {
    title: "Inżynieria planetarna",
    instruction: "Każdy parametr wpływa na model deterministyczny; widok planety reaguje wyłącznie tam, gdzie uzasadniają to podane dane fizyczne.",
    parameterGroup: "Systemy środowiskowe",
    baseline: "Jałowy świat początkowy",
    resetBaseline: "Przywróć jałowy świat",
    liveView: "Proceduralna planeta na żywo",
    viewMode: "Widok naukowy",
    modes: { realistic: "Realistyczny", temperature: "Temperatura", radiation: "Promieniowanie" },
    visualTransition: "Wizualizacja terraformowania płynnie zmierza do bieżących parametrów.",
    controlsDesktop: "PC: przeciągnij lewym przyciskiem myszy, aby obracać · użyj kółka, aby przybliżać",
    controlsMobile: "Mobile: przeciągnij jednym palcem, aby obracać · zsuń lub rozsuń dwa palce, aby przybliżać",
    openDesigner: "Przejdź do projektanta życia",
    legends: {
      temperature: { title: "Temperatura", cold: "Zamarznięte", temperate: "Umiarkowane", hot: "Stopione" },
      radiation: { title: "Ekspozycja na promieniowanie", protected: "Chronione", elevated: "Podwyższone", severe: "Silne" },
    },
  },
  parameters: {
    gravity: { label: "🪐 Grawitacja", unit: "g", earthReference: "Wartość Ziemi: 1 g", captions: [
      "Niemal zerowa grawitacja prawie nie podtrzymuje ciała i utrudnia kontrolowany ruch po powierzchni.",
      "Bardzo niska grawitacja zmniejsza ciężar, ale utrudnia przyczepność, krążenie i stabilny ruch.",
      "Niska grawitacja sprzyja lekkim strukturom, zmniejsza przyczepność i zmienia koszt lotu.",
      "Umiarkowana grawitacja wspiera znajome plany budowy i rozsądny koszt ruchu.",
      "Wysoka grawitacja zwiększa koszt konstrukcji ciała, krążenia i lokomocji dużych organizmów.",
      "Ekstremalna grawitacja narzuca poważne koszty podparcia ciała, krążenia i ruchu.",
    ] },
    light: { label: "☀️ Energia gwiazdy", unit: "%", earthReference: "Wartość Ziemi: 100% (skala modelu)", captions: [
      "Pomijalna energia gwiazdy pozostawia powierzchnię ciemną i usuwa praktyczną energię fotosyntezy.",
      "Bardzo słabe światło zapewnia niewiele energii fototroficznej i słabe oświetlenie strony dziennej.",
      "Niskie światło może wspierać wyspecjalizowaną fotosyntezę, ale nie wysoką produktywność.",
      "Umiarkowane światło daje użyteczne oświetlenie i stabilną ścieżkę fotosyntetyczną.",
      "Silne światło zapewnia dużo energii fototroficznej i wyraźne wymuszanie dnia oraz nocy.",
      "Ekstremalne światło maksymalizuje oświetlenie; temperatura pozostaje jawna, bo nie znamy widma ani orbity.",
    ] },
    pressure: { label: "🌫️ Atmosfera", unit: "atm", earthReference: "Wartość Ziemi: 1 atm", captions: [
      "Próżnia nie transportuje ciepła, nie tworzy chmur ani nie utrzymuje odsłoniętej hydrosfery.",
      "Śladowa atmosfera prawie nie rozprowadza ciepła i pozostawia amplitudę zbliżoną do świata bez powietrza.",
      "Cienka atmosfera zapewnia ograniczony transport ciepła, gęstość gazu i stabilność wody.",
      "Lekka atmosfera łagodzi ekstrema i zaczyna wspierać chmury, oddychanie oraz lot.",
      "Znacząca atmosfera rozprowadza ciepło i wspiera stabilną wodę, pogodę oraz wyporność.",
      "Ciśnienie atmosferyczne płynnie wpływa na stabilność wody, wilgotność, chmury, gęstość i zorzę, bez kasowania zapisanej preferencji użytkownika.",
    ] },
    carbonDioxide: { label: "🧪 Ciśnienie parcjalne CO₂", unit: "atm", earthReference: "Wartość Ziemi: ≈0,00042 atm", captions: [
      "Brak CO₂ usuwa modelowane źródło węgla nieorganicznego i jego wkład cieplarniany.",
      "Śladowy CO₂ dostarcza mało węgla, ale uczestniczy już w zatrzymywaniu ciepła.",
      "Niski CO₂ wspiera wiązanie węgla i wnosi umiarkowany efekt cieplarniany.",
      "Podwyższony CO₂ zwiększa dostępność węgla i retencję ciepła, dodając stres fizjologiczny.",
      "Wysoki CO₂ silnie zmienia chemię atmosfery i obciąża wiele strategii oddechowych.",
      "Ekstremalny CO₂ jest toksyczny dla wielu modelowanych organizmów mimo dużej ilości węgla.",
    ] },
    oxygen: { label: "💨 Ciśnienie parcjalne tlenu", unit: "atm", earthReference: "Wartość Ziemi: ≈0,21 atm", captions: [
      "Brak tlenu wyłącza oddychanie tlenowe; pozostają tylko jawnie wspierane ścieżki alternatywne.",
      "Bardzo niskie ciśnienie parcjalne tlenu wspiera wyłącznie strategie niskotlenowe lub beztlenowe.",
      "Niski tlen ogranicza trwały metabolizm tlenowy i złożoność energetyczną.",
      "Umiarkowany tlen wspiera wydajny metabolizm tlenowy przy wystarczającym ciśnieniu całkowitym.",
      "Wysoki tlen przekracza preferowany zakres oddechowy i zwiększa presję oksydacyjną.",
      "Ekstremalny tlen sprzyja spalaniu i stresowi oksydacyjnemu mimo dużej dostępności aerobowej.",
    ] },
    temperature: { label: "🌡️ Średnia temperatura", unit: "°C", earthReference: "Wartość Ziemi: ≈15 °C średnio globalnie", captions: [
      "Warunki bliskie zeru absolutnemu zamrażają odsłonięte substancje lotne i ograniczają aktywną chemię.",
      "Głęboki mróz pozostawia dostępną wodę powierzchniową jako lód i silnie ogranicza metabolizm.",
      "Warunki chłodne i umiarkowane mogą wspierać ciekłą wodę, gdy pozwalają na to ciśnienie i lokalne ekstrema.",
      "Wysokie temperatury odparowują odsłoniętą wodę i tworzą silną presję cieplną, ale jeszcze nie topią bazaltowego terenu.",
      "Bazaltowa skała powierzchniowa zaczyna przechodzić od stałej skorupy do widocznie stopionego materiału zgodnie z konwencją renderera.",
      "Temperatury oceanu magmy tworzą przeważnie stopioną powierzchnię skalną; nie oznacza to aktywnego wulkanizmu.",
    ] },
    temperatureVariation: { label: "🌡️↕️ Wahanie temperatury", unit: "°C", earthReference: "Wartość Ziemi: ±15 °C (konwencja modelu)", captions: [
      "Minimalne wahania tworzą termicznie jednolity świat z niewielką liczbą nisz klimatycznych.",
      "Małe wahania ograniczają stres cieplny, zachowując łagodne różnice regionalne.",
      "Umiarkowane wahania tworzą użyteczne nisze ciepła i zimna oraz kompromisy adaptacyjne.",
      "Duże wahania regularnie powodują zamarzanie i przegrzewanie odsłoniętych regionów.",
      "Silne wahania wymagają izolacji, uśpienia, migracji albo odporności na ciepło.",
      "Ekstremalne wahania cechują słabo moderowane powierzchnie i dominują warunki przetrwania.",
    ] },
    water: { label: "🌊 Woda powierzchniowa", unit: "%", earthReference: "Wartość Ziemi: ≈71%", captions: [
      "Brak odsłoniętej wody oznacza brak oceanów, wilgotności zasilanej wodą i siedlisk wodnych.",
      "Śladowa woda wspiera izolowane osady, ale daje mało wilgotności i pojemności ekosystemu.",
      "Niewielka ilość wody tworzy ograniczone wybrzeża, źródła nawodnienia i lokalne chmury.",
      "Regionalna woda wspiera wybrzeża, wilgotność, chmury i strategie wodno-lądowe.",
      "Obfita woda wzmacnia siedliska wodne i wilgoć atmosferyczną, ograniczając suchy ląd.",
      "Powierzchnia zdominowana przez wodę maksymalizuje akweny i wilgotność, ale zostawia mało lądu.",
    ] },
    humidity: { label: "💧 Wilgotność", unit: "%", earthReference: "Wartość Ziemi: 60% (proksy modelu)", captions: [
      "Brak pary wodnej ogranicza chmury i silnie premiuje oszczędzanie wody.",
      "Bardzo suche powietrze pozwala tylko na rzadkie chmury i szybko odbiera wilgoć organizmom.",
      "Niska wilgotność ogranicza zachmurzenie i wspiera chronioną lub oszczędną gospodarkę wodną.",
      "Umiarkowana wilgotność wspiera nawodnienie, chmury i produktywny teren.",
      "Wysoka wilgotność daje duży potencjał chmur i ogranicza parowanie z organizmów.",
      "Powietrze bliskie nasycenia silnie wspiera chmury, gdy istnieją atmosfera i odsłonięty zasób wody.",
    ] },
    magneticField: { label: "🧲 Pole magnetyczne", unit: "Ziemi", earthReference: "Wartość Ziemi: 1 pole Ziemi", captions: [
      "Brak globalnego pola nie zmniejsza modelowanej dawki promieniowania padającego.",
      "Śladowe pole daje pomijalną ochronę i jedynie słabą organizację zorzy.",
      "Słabe pole zmniejsza część efektywnej dawki, gdy promieniowanie rzeczywiście występuje.",
      "Umiarkowane pole zauważalnie ogranicza ekspozycję i wspiera uporządkowaną zorzę.",
      "Silne pole dalej obniża ekspozycję, choć nie może stworzyć atmosfery ani wody.",
      "Ekstremalne pole maksymalizuje uproszczoną ochronę przy malejącej wartości kolejnych wzrostów.",
    ] },
    radiation: { label: "☢️ Dawka promieniowania", unit: "mSv/h", earthReference: "Wartość Ziemi: ≈0,0003 mSv/h naturalnego tła", captions: [
      "Pomijalne promieniowanie tworzy niewielką presję naprawczą i aktywność zorzową.",
      "Niskie promieniowanie jest możliwe do zniesienia bez specjalistycznej ochrony.",
      "Podwyższona dawka premiuje mechanizmy naprawcze i korzysta z ochrony magnetycznej.",
      "Wysokie promieniowanie mocno obniża bezpieczeństwo powierzchni i zwiększa koszt napraw.",
      "Silne promieniowanie dominuje adaptację i pozostawia niewiele niechronionych strategii.",
      "Ekstremalne promieniowanie przeciąża większość odsłoniętego życia bez łączonej ochrony.",
    ] },
  },
  parameterConstraints: {
    requiresAtmosphere: "Ta wartość wymaga atmosfery, aby zadziałać.",
    gravityLimited: "Grawitacja obecnie ogranicza efektywne ciśnienie atmosferyczne.",
    requiresWaterPressure: "Odsłonięta woda powierzchniowa wymaga tu wyższego ciśnienia.",
    surfaceWaterBoils: "W tej temperaturze odsłonięta woda jest parą.",
    surfaceWaterLimited: "Ciśnienie i bilans fazowy obecnie ograniczają odsłoniętą wodę powierzchniową.",
    requiresSurfaceWater: "Efektywna wilgotność wymaga atmosfery i wspieranej fazowo wody powierzchniowej.",
    humidityLimitedByWater: "Atmosfera i odsłonięta woda obecnie ograniczają efektywną wilgotność.",
  },
  environment: {
    title: "Aktywne dane środowiskowe",
    planetDescription: "To aktywne deterministyczne konsekwencje bieżących parametrów planety.",
    designDescription: "Te deterministyczne warunki kształtują kompromisy każdej cechy. Cechy pozostają dostępne, aby można było przetestować ryzykowną hipotezę.",
    climate: "Klimat",
    atmosphere: "Atmosfera i grawitacja",
    hydrosphere: "Hydrosfera",
    humidity: "Wilgoć atmosferyczna",
    energyCarbon: "Energia i węgiel",
    radiation: "Ochrona przed promieniowaniem",
    mean: "Średnia",
    variation: "Zmienność",
    range: "Zakres",
    gravity: "Grawitacja",
    storedPressure: "Wybrane ciśnienie",
    pressureCapacity: "Limit ciśnienia grawitacyjnego",
    effectivePressure: "Ciśnienie efektywne",
    oxygen: "Tlen pO₂",
    waterInventory: "Zasób wody",
    liquid: "Ciecz",
    ice: "Lód",
    vapor: "Para",
    surfaceWater: "Woda powierzchniowa",
    boilingPoint: "Temperatura wrzenia wody",
    noBoilingPoint: "Brak ciśnienia dla ciekłej wody",
    selected: "Wybrane",
    effective: "Efektywne",
    clouds: "Potencjał chmur",
    stellarEnergy: "Energia gwiazdowa",
    carbonDioxide: "Dwutlenek węgla pCO₂",
    incident: "Docierające",
    protected: "Po ochronie magnetycznej",
    magneticField: "Pole magnetyczne",
    earthFieldUnit: "× Ziemia",
    shieldingColumn: "Kolumna osłonowa",
  },
  life: {
    title: "Projektant formy życia",
    instruction: "Wybierz zgodne adaptacje. Zalety zużywają wspólny budżet energii biologicznej i zawsze wiążą się z kosztami.",
    selected: "wybranych cech",
    budget: "Budżet energii biologicznej",
    budgetExplanation: "Budżet zapobiega łączeniu nieograniczonej liczby cech. Koszty są konwencjami symulatora, a nie uniwersalnymi stałymi biologicznymi.",
    cost: "Koszt",
    advantage: "Zaleta",
    tradeoff: "Kompromis",
    conflict: "Ta cecha jest sprzeczna z jedną z obecnie wybranych.",
    budgetExceeded: "Ta cecha przekroczyłaby budżet energii biologicznej.",
    selectionLimit: "Pierwsza wersja modelu obsługuje najwyżej 14 wybranych cech.",
    minimumTraits: "Przed uruchomieniem symulacji wybierz co najmniej trzy cechy.",
    clear: "Wyczyść cechy",
    run: "Uruchom symulację przetrwania",
    running: "Symulowanie 40 pokoleń…",
    previewHint: "Proceduralna morfologia zmienia się zgodnie z ziarnem, światem i wybranymi cechami.",
  },
  categories: {
    body: "Budowa ciała",
    physiology: "Fizjologia",
    senses: "Zmysły",
    reproduction: "Rozmnażanie",
    intelligence: "Złożoność",
  },
  traits: {
    compactBody: { title: "Zwarte ciało", advantage: "Radzi sobie z dużą grawitacją i oszczędza wodę.", tradeoff: "Zapewnia mniej miejsca na wyspecjalizowane narządy." },
    largeBody: { title: "Duże ciało", advantage: "Buforuje zimno i wspiera większą złożoność.", tradeoff: "Wymaga więcej tlenu i energii biologicznej." },
    internalSkeleton: { title: "Szkielet wewnętrzny", advantage: "Wspiera sprawny ruch w polu grawitacyjnym.", tradeoff: "Zużywa zasoby budulcowe." },
    exoskeleton: { title: "Egzoszkielet", advantage: "Ogranicza utratę wody i zapewnia fizyczną osłonę.", tradeoff: "Staje się kosztowny przy dużej grawitacji." },
    aquaticMovement: { title: "Ruch wodny", advantage: "Umożliwia sprawny ruch w wodzie i gradientach ciśnienia.", tradeoff: "Wyklucza wyspecjalizowany ruch lądowy lub powietrzny." },
    terrestrialMovement: { title: "Ruch lądowy", advantage: "Pozwala sprawnie przemierzać odsłonięte siedliska powierzchniowe.", tradeoff: "Działa słabo w głębokiej wodzie i skrajnym terenie." },
    aerialMovement: { title: "Ruch powietrzny", advantage: "Umożliwia rozprzestrzenianie i dostęp do siedlisk w gęstym powietrzu.", tradeoff: "Jest bardzo kosztowny przy dużej grawitacji lub rzadkiej atmosferze." },
    oxygenRespiration: { title: "Oddychanie tlenowe", advantage: "Wspiera wysokoenergetyczną, złożoną aktywność przy ziemskim poziomie tlenu.", tradeoff: "Zawodzi przy spadku ciśnienia parcjalnego tlenu." },
    lowOxygenMetabolism: { title: "Metabolizm niskotlenowy", advantage: "Pozyskuje energię z atmosfer ubogich w tlen.", tradeoff: "Dostarcza mniej energii złożonym tkankom." },
    anaerobicMetabolism: { title: "Metabolizm beztlenowy", advantage: "Korzysta z jawnie podanej energii reakcji redoks bez tlenu.", tradeoff: "Wymaga użytecznego gradientu i ogranicza złożoność." },
    photosynthesis: { title: "Fotosynteza", advantage: "Bezpośrednio przechwytuje energię gwiazdy.", tradeoff: "Wymaga światła i ogranicza ruchliwość." },
    chemosynthesis: { title: "Chemosynteza", advantage: "Korzysta z podanej energii geochemicznej w ciemnych siedliskach.", tradeoff: "Zależy od jawnych akceptorów elektronów i ma mniejszą wydajność." },
    radiationResistance: { title: "Odporność na promieniowanie", advantage: "Zmniejsza uszkodzenia przy silnej ekspozycji.", tradeoff: "Zużywa energię naprawczą i spowalnia rozmnażanie." },
    thermalInsulation: { title: "Izolacja termiczna", advantage: "Poprawia przetrwanie w zimnie.", tradeoff: "Powoduje stres cieplny w ciepłych regionach." },
    heatResistance: { title: "Odporność na gorąco", advantage: "Chroni białka i błony w wysokiej temperaturze.", tradeoff: "Zwiększa zapotrzebowanie na wodę i wyklucza grubą izolację." },
    waterConservation: { title: "Oszczędzanie wody", advantage: "Wydłuża przetrwanie w suchych regionach.", tradeoff: "Spowalnia wymianę substancji i rozmnażanie." },
    pressureResistance: { title: "Odporność na ciśnienie", advantage: "Wspiera życie w głębokim oceanie i nietypowym ciśnieniu.", tradeoff: "Zmniejsza sprawność ruchu." },
    regenerativeTissue: { title: "Tkanka regeneracyjna", advantage: "Naprawia szkody radiacyjne i środowiskowe.", tradeoff: "Ma wysoki koszt metaboliczny i reprodukcyjny." },
    hibernation: { title: "Hibernacja", advantage: "Pozwala przetrwać zimno, suszę lub okresowy stres.", tradeoff: "Ogranicza czas aktywnego wzrostu." },
    visibleVision: { title: "Wzrok w świetle widzialnym", advantage: "Zapewnia tanią orientację przy użytecznym świetle gwiazdy.", tradeoff: "Działa słabo w ciemności, pyle lub głębokiej wodzie." },
    infraredVision: { title: "Widzenie w podczerwieni", advantage: "Wykrywa kontrasty cieplne w ciemności lub mgle.", tradeoff: "Zużywa więcej energii nerwowej i sensorycznej." },
    echolocation: { title: "Echolokacja", advantage: "Odwzorowuje ciemne lub nieprzejrzyste środowiska.", tradeoff: "Wymaga aktywnej energii i odpowiedniej gęstości atmosfery." },
    chemicalSensing: { title: "Zmysł chemiczny", advantage: "Odnajduje składniki odżywcze i gradienty redoks bez światła.", tradeoff: "Dostarcza powolnych, lokalnych informacji." },
    rapidReproduction: { title: "Szybkie rozmnażanie", advantage: "Szybko odbudowuje populację po wzroście śmiertelności.", tradeoff: "Zmniejsza złożoność osobnika i opiekę rodzicielską." },
    protectedEggs: { title: "Chronione jaja", advantage: "Osłania zarodki przed suszą i wahaniami temperatury.", tradeoff: "Zużywa materiał i wyklucza inne sposoby rozwoju." },
    liveBirth: { title: "Żyworodność", advantage: "Chroni rozwijające się potomstwo wewnątrz organizmu.", tradeoff: "Spowalnia rozmnażanie i zwiększa potrzeby energetyczne dorosłych." },
    spores: { title: "Zarodniki", advantage: "Rozprzestrzeniają się daleko i przetrzymują trudne okresy.", tradeoff: "Wspierają prostszy rozwój i niskie przeżycie osobnika." },
    parentalInvestment: { title: "Opieka rodzicielska", advantage: "Poprawia uczenie i przeżycie potomstwa.", tradeoff: "Zmniejsza liczbę potomstwa i wyklucza szybkie rozmnażanie." },
    simpleNeuralSystem: { title: "Prosty układ nerwowy", advantage: "Dodaje podstawową adaptację behawioralną niewielkim kosztem.", tradeoff: "Nie wspiera zaawansowanego używania narzędzi." },
    socialCoordination: { title: "Koordynacja społeczna", advantage: "Poprawia wspólne przetrwanie i wykorzystanie zasobów.", tradeoff: "Wymaga komunikacji i stabilności grupy." },
    toolUsePotential: { title: "Potencjał używania narzędzi", advantage: "Umożliwia elastyczne modyfikowanie środowiska.", tradeoff: "Wymaga wyjątkowej podaży energii i tlenu." },
    complexCommunication: { title: "Złożona komunikacja", advantage: "Koordynuje uczenie i adaptację społeczną.", tradeoff: "Wymaga kosztownego przetwarzania nerwowego i rozwoju." },
    adaptiveLearning: { title: "Uczenie adaptacyjne", advantage: "Pozwala elastycznie reagować na zmienne warunki.", tradeoff: "Zużywa energię i opóźnia rozmnażanie." },
  },
  simulation: {
    title: "Analiza przetrwania",
    emptyTitle: "Brak symulacji",
    emptyDescription: "Przekształć planetę, wybierz co najmniej trzy zgodne cechy i zasymuluj 40 pokoleń.",
    staleTitle: "Konfiguracja została zmieniona",
    staleDescription: "Te wyniki dotyczą poprzedniej konfiguracji. Uruchom model ponownie, aby ocenić bieżący świat i organizm.",
    deterministic: "Obliczone lokalnie",
    success: "Osiągnięto stabilny rezultat",
    continue: "Eksperyment możliwy — kontynuuj adaptację",
    objective: "Potencjał zaawansowanego życia",
    outcome: "Wynik modelu",
    stateHash: "Odtwarzalny stan",
    modelVersion: "Symulator",
    metricsTitle: "Współdziałające wskaźniki przydatności",
    strengths: "Najsilniejsze systemy",
    limits: "Systemy ograniczające",
    regionsTitle: "Przetrwanie regionalne",
    habitable: "nadaje się do życia w tym modelu",
    populationTitle: "Populacja przez 40 pokoleń",
    generation: "Pokolenie",
    population: "Populacja",
    initial: "Początkowa",
    peak: "Szczytowa",
    final: "Końcowa",
    capacity: "Pojemność środowiska",
    previousScore: "Zmiana względem poprzedniej próby",
    noPreviousRun: "Uruchom inną konfigurację, aby porównać potencjał zaawansowanego życia.",
    adaptPlanet: "Dostosuj planetę",
    adaptLife: "Dostosuj formę życia",
    rerun: "Uruchom bieżącą konfigurację",
    educationalNotice: "Inspirowany nauką model edukacyjny, a nie pełna prognoza klimatu lub ewolucji.",
  },
  metrics: {
    liquidWater: { label: "Woda w stanie ciekłym", description: "Woda powierzchniowa wspierana przez zasoby, ciśnienie i temperaturę." },
    atmosphere: { label: "Atmosfera", description: "Ciśnienie, ciśnienie parcjalne tlenu i nietoksyczny skład." },
    thermalStability: { label: "Stabilność termiczna", description: "Zgodność z ustawioną średnią temperaturą i jej wahaniami." },
    radiationSafety: { label: "Bezpieczeństwo radiacyjne", description: "Ekspozycja po uwzględnieniu jawnej ochrony magnetycznej i biologicznej." },
    biologicalEnergy: { label: "Energia biologiczna", description: "Możliwości energetyczne światła, geochemii, wody i węgla." },
    metabolicViability: { label: "Żywotność metaboliczna", description: "Zgodność wybranych szlaków energetycznych z podanym światem." },
    organismCompatibility: { label: "Zgodność organizmu", description: "Łączne dopasowanie ciała, ruchu, nawodnienia, ciśnienia i odporności." },
    reproductionPotential: { label: "Rozmnażanie", description: "Zdolność odtwarzania strat bez przekraczania dostępnej energii." },
    populationStability: { label: "Stabilność populacji", description: "Długotrwała równowaga zgodności, rozmnażania i adaptacji." },
    ecosystemPotential: { label: "Potencjał ekosystemu", description: "Zdolność do utrzymania trwałej biosfery przy dostępnej energii." },
    advancedLifePotential: { label: "Zaawansowane życie", description: "Łączny potencjał ekosystemu, metabolizmu, adaptacji i złożoności." },
  },
  regions: {
    coastal: { label: "Strefy przybrzeżne", description: "Siedliska lądowo-wodne z dostępem do wilgoci i energii." },
    equatorial: { label: "Strefy równikowe", description: "Silnie oświetlone obszary wrażliwe na gorąco i promieniowanie." },
    polar: { label: "Strefy polarne", description: "Zimne obszary sprzyjające izolacji i stanom uśpienia." },
    deepOcean: { label: "Głęboki ocean", description: "Ciemne siedlisko pod wysokim ciśnieniem, zależne od wody i geochemii." },
    underground: { label: "Podziemie", description: "Schronienie; bez jawnego parametru osłony dawka promieniowania nie spada." },
    highAltitude: { label: "Wysoka atmosfera", description: "Region rzadkiego powietrza zależny od lokalnej gęstości, grawitacji i kosztu lotu." },
  },
  outcomes: {
    immediateExtinction: { title: "Natychmiastowe wymarcie", description: "Podstawowy stres środowiskowy przewyższa możliwości wybranego organizmu." },
    temporarySurvival: { title: "Tymczasowe przetrwanie", description: "Niewielka populacja utrzymuje się krótko, ale nie odtwarza strat." },
    regionalRefuge: { title: "Regionalne schronienie", description: "Organizm przeżywa wyłącznie w ograniczonej liczbie sprzyjających regionów." },
    stableSimplePopulation: { title: "Stabilna prosta populacja", description: "Populacja trwa, lecz energia lub złożoność pozostają ograniczone." },
    expandingPopulation: { title: "Rosnąca populacja", description: "Organizm rozprzestrzenia się w zgodnych siedliskach, ale nie osiąga zaawansowanej stabilności." },
    unstableDominance: { title: "Niestabilna dominacja ekologiczna", description: "Szybki wzrost zbliża się do pojemności środowiska, gdy stabilność ekosystemu pozostaje niska." },
    stableMulticellularEcosystem: { title: "Stabilny ekosystem wielokomórkowy", description: "Wyniki populacji i ekosystemu wspierają trwałe złożone życie." },
    advancedAdaptiveLife: { title: "Zaawansowane życie adaptacyjne", description: "Skonfigurowany świat wspiera wysoką złożoność, adaptację i długotrwałą stabilność." },
  },
  organism: {
    title: "Model terenowy organizmu",
    procedural: "Deterministyczna morfologia proceduralna",
    generated: "Ilustracja terenowa wygenerowana pod kontrolą GPT",
    requestImage: "Wygeneruj ilustrację terenową",
    generating: "Generowanie kontrolowanej ilustracji…",
    fallback: "Proceduralny model terenowy pozostaje dostępny; nie zwrócono wygenerowanego obrazu.",
    error: "Generowanie obrazu jest niedostępne. Deterministyczny model terenowy nie uległ zmianie.",
    alt: "Proceduralny obcy organizm dostosowany do bieżącego eksperymentu Vespera",
  },
  consultant: {
    title: "Konsultant nauk biologicznych",
    description: "Poproś GPT-5.4-mini o interpretację ukończonego wyniku deterministycznego. Model nie może zmienić punktacji.",
    request: "Poproś o analizę konsultanta",
    loading: "Konsultant analizuje dane…",
    liveSource: "Analiza GPT-5.4-mini",
    localSource: "Lokalna analiza zapasowa",
    fallbackNotice: "GPT-5.4-mini był niedostępny, dlatego użyto wyraźnie oznaczonej lokalnej interpretacji.",
    assessment: "Ocena planety",
    traits: "Ocena cech",
    insights: "Kluczowe obserwacje",
    experiment: "Sugerowany eksperyment",
    error: "Nie udało się pobrać analizy konsultanta.",
    retry: "Spróbuj ponownie",
  },
  status: {
    local: "Lokalny model deterministyczny",
    ai: "AI po stronie serwera",
    visual: "Interpretacja wizualna",
    calculated: "Obliczone dane",
  },
  footer: "Xenogenesis Lab · OpenAI Build Week · edukacyjny symulator astrobiologiczny",
};

/** Complete compile-time checked bilingual interface copy. */
export const COPY: Record<Language, LabCopy> = { en: english, pl: polish };

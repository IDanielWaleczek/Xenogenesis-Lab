import type {
  LifeTraitId,
  PopulationEventId,
  RegionId,
  SimulationMetricId,
  SurvivalFailureReason,
  SurvivalSimulationResult,
} from "@/domain/simulator/schema";
import type { TraitCategory } from "@/domain/simulator/traits";
import type { AdaptationArchetypeId } from "@/domain/simulator/archetypes";

/** Languages supported by the reviewed interface copy. */
export type Language = "en" | "pl";

/** User-facing phases in the repeatable simulation loop. */
export type LabPhase = "planet" | "life" | "results";

/** Ordered walkthrough cards used by the laboratory onboarding. */
export type TutorialStepId =
  | "planetScene"
  | "planetControls"
  | "parameter"
  | "evidencePanel"
  | "worldStory"
  | "evidenceDetails"
  | "chooseLife"
  | "lifeTransition"
  | "lifeScene"
  | "lifeControls"
  | "lifeDropdown"
  | "hypothesisStory"
  | "lifeFacts"
  | "readiness"
  | "lifeEvidence"
  | "runSimulation"
  | "resultOutcome"
  | "metrics"
  | "regions"
  | "population"
  | "events"
  | "portrait"
  | "consultant";

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
  desktopOnly: {
    eyebrow: string;
    title: string;
    description: string;
  };
  header: {
    system: string;
    reset: string;
    resetCamera: string;
    rotationOn: string;
    rotationOff: string;
    clearData: string;
    clearDataConfirm: string;
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
    loadTemperateExperiment: string;
    changedEffect: string;
    exactValue: string;
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
    advantage: string;
    tradeoff: string;
    conflict: string;
    minimumTraits: string;
    clear: string;
    run: string;
    running: string;
    previewHint: string;
    strategyLibrary: string;
    strategyHint: string;
    applyStrategy: string;
    noStrategies: string;
    readiness: {
      title: string;
      description: string;
      water: string;
      energy: string;
      radiation: string;
      available: string;
      unavailable: string;
      manageable: string;
      elevated: string;
    };
    strategies: Record<AdaptationArchetypeId, string>;
    chooseOne: string;
    singleChoiceGroups: {
      organismForm: string;
      bodySize: string;
      bodySupport: string;
      movement: string;
      symmetry: string;
      respiration: string;
      metabolism: string;
      energyCapture: string;
      thermalStrategy: string;
      reproductiveMode: string;
      reproductiveInvestment: string;
    };
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
    populationTitle: string;
    eventImpactContext: string;
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
    copySummary: string;
    summaryCopied: string;
    summaryCopyFailed: string;
    educationalNotice: string;
    failureReasons: Record<SurvivalFailureReason, string>;
  };
  metrics: Record<SimulationMetricId, { label: string; description: string }>;
  regions: Record<RegionId, { label: string; description: string }>;
  outcomes: Record<SurvivalSimulationResult["outcome"], { title: string; description: string }>;
  populationEvents: Record<PopulationEventId, { title: string; description: string }>;
  organism: {
    title: string;
    procedural: string;
    generated: string;
    requestImage: string;
    generating: string;
    preparing: string;
    rendering: string;
    partial: string;
    fallback: string;
    error: string;
    download: string;
    alt: string;
    openPreview: string;
    closePreview: string;
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
    temporaryUnavailable: string;
  };
  status: {
    local: string;
    ai: string;
    visual: string;
    calculated: string;
  };
  footer: string;
  onboarding: {
    title: string;
    description: string;
    focus: string;
    dismiss: string;
    previous: string;
    reopen: string;
    progress: string;
    next: string;
    finish: string;
    steps: Record<TutorialStepId, { title: string; description: string }>;
  };
};

const english: LabCopy = {
  document: {
    title: "Xenogenesis Lab | The Vespera Experiment",
    description: "Give a silent world its first living foothold, then follow the fate of the life you designed.",
  },
  language: { label: "Language", english: "English", polish: "Polski" },
  boot: {
    eyebrow: "Vespera expedition · research node 07",
    title: "XENOGENESIS LAB",
    subtitle: "A silent world is waiting. Rebuild its climate, engineer a living strategy, and discover whether your biosphere survives two centuries of change.",
    sceneLabel: "Your expedition begins before the first cell exists",
    enter: "Begin the Vespera experiment",
  },
  desktopOnly: {
    eyebrow: "Desktop workspace",
    title: "Xenogenesis Lab currently works on computers only",
    description: "Open this experiment in a desktop browser at least 1080 pixels wide. Mobile and tablet layouts are temporarily unavailable.",
  },
  header: {
    system: "Vespera · first-biosphere experiment",
    reset: "Reset laboratory",
    resetCamera: "Reset camera",
    rotationOn: "Pause rotation",
    rotationOff: "Resume rotation",
    clearData: "Clear data",
    clearDataConfirm: "Delete all Xenogenesis Lab data stored in this browser? This resets the current experiment and shows the guide again.",
  },
  phases: {
    planet: { label: "Give Vespera a beginning", description: "Shape the conditions in which life will first appear." },
    life: { label: "Seed its first life", description: "Choose what your organism can risk, endure, and become." },
    results: { label: "Read its story", description: "Follow the population's fate and decide its next chapter." },
  },
  planet: {
    title: "Give Vespera a beginning",
    instruction: "Set the stage for its first habitat. Each choice changes what the world can offer the life you will place here.",
    parameterGroup: "The world before life",
    baseline: "A world before life",
    resetBaseline: "Return to the silent world",
    liveView: "Vespera, before its first organism",
    viewMode: "Scientific view",
    modes: { realistic: "Realistic", temperature: "Temperature", radiation: "Radiation" },
    visualTransition: "Vespera is settling into the conditions you chose.",
    controlsDesktop: "PC: drag with the left mouse button to rotate · use the wheel to zoom",
    controlsMobile: "Mobile: drag with one finger to rotate · pinch with two fingers to zoom",
    openDesigner: "Choose the first organism",
    loadTemperateExperiment: "Load a temperate starting experiment",
    changedEffect: "What changed",
    exactValue: "Exact value",
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
    title: "What this world will ask of life",
    planetDescription: "This is the environment waiting for its first organism: where water holds, energy arrives, and exposure becomes dangerous.",
    designDescription: "These conditions define the risks your organism will meet. You may still test a daring design and see whether it earns a foothold.",
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
    title: "Seed Vespera's first life",
    instruction: "Decide what arrives first. Every adaptation leaves a visible mark on the organism and changes how its lineage meets this world.",
    selected: "traits selected",
    advantage: "Advantage",
    tradeoff: "Tradeoff",
    conflict: "That trait conflicts with one of your current selections.",
    minimumTraits: "Give the first organism at least three adaptations before following its fate.",
    clear: "Start the organism again",
    run: "Begin its 200-year story",
    running: "Following this lineage through 200 years of change…",
    previewHint: "Its form is taking shape from this world and the adaptations you selected.",
    strategyLibrary: "Possible first footholds",
    strategyHint: "Each is a viable starting lineage built from what this particular world provides. If none appears, the world has not yet opened a metabolic path.",
    applyStrategy: "Seed this lineage",
    noStrategies: "Vespera cannot yet feed a first lineage. Restore oxygen or a declared geochemical energy source, then try again.",
    readiness: {
      title: "Readiness for first life",
      description: "A quick preflight from the current world. It guides the next choice but never replaces the survival simulation.",
      water: "Liquid water",
      energy: "Metabolic path",
      radiation: "Radiation exposure",
      available: "Available",
      unavailable: "Not yet available",
      manageable: "Manageable",
      elevated: "Elevated",
    },
    strategies: { littoralGeneralist: "Shielded littoral generalist", pressureSwimmer: "Pressure-adapted swimmer", endolithicColony: "Endolithic repair colony", aerialDisperser: "Resilient colony disperser" },
    chooseOne: "Choose one",
    singleChoiceGroups: {
      organismForm: "Organism form",
      bodySize: "Body size",
      bodySupport: "Body support",
      movement: "Primary movement",
      symmetry: "Body symmetry",
      respiration: "Respiratory organ",
      metabolism: "Primary metabolism",
      energyCapture: "Energy capture",
      thermalStrategy: "Thermal strategy",
      reproductiveMode: "Reproductive mode",
      reproductiveInvestment: "Reproductive investment",
    },
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
    cryoprotectiveChemistry: { title: "Cryoprotective chemistry", advantage: "Limits ice-crystal damage in cold liquid-water niches.", tradeoff: "Costs energy and does not create liquid water." },
    heatShockProteins: { title: "Heat-shock proteins", advantage: "Stabilizes cellular machinery during intense but water-supported heat.", tradeoff: "Costs repair energy and cannot survive a molten surface." },
    mineralShielding: { title: "Mineral shielding", advantage: "Adds a protective mineral layer against radiation and heat pulses.", tradeoff: "Reduces movement and does not replace physical shelter." },
    biofilmColony: { title: "Biofilm colony", advantage: "Shares moisture, chemistry, and repair across a surface colony.", tradeoff: "Keeps the organism locally anchored." },
    saltTolerance: { title: "Salt tolerance", advantage: "Maintains water balance in concentrated brines.", tradeoff: "Does not make dry or water-free worlds habitable." },
    waterConservation: { title: "Water conservation", advantage: "Extends survival in dry regions.", tradeoff: "Slows exchange and reproduction." },
    pressureResistance: { title: "Pressure resistance", advantage: "Supports deep-ocean and unusual-pressure habitats.", tradeoff: "Reduces movement efficiency." },
    regenerativeTissue: { title: "Regenerative tissue", advantage: "Repairs radiation and environmental damage.", tradeoff: "High metabolic and reproductive cost." },
    hibernation: { title: "Hibernation", advantage: "Survives cold, dry, or seasonal stress.", tradeoff: "Sacrifices active growth time." },
    dormantCysts: { title: "Dormant cysts", advantage: "Protects a resting stage through short radiation, dry, and thermal stress.", tradeoff: "Cannot replace active metabolism or liquid water." },
    symbioticMetabolism: { title: "Symbiotic metabolism", advantage: "Shares oxygen and chemical pathways across cooperating cells.", tradeoff: "Requires compatible environmental energy for the partnership." },
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
    unicellular: { title: "Unicellular form", advantage: "Supports bacteria-like simplicity and rapid replication.", tradeoff: "Cannot support limbs, organs, or advanced cognition." },
    multicellular: { title: "Multicellular tissues", advantage: "Enables specialized organs and complex body plans.", tradeoff: "Raises coordination and energy demands." },
    bilateralSymmetry: { title: "Bilateral symmetry", advantage: "Supports directed movement and a defined head-to-tail axis.", tradeoff: "Makes injury to paired structures more consequential." },
    radialSymmetry: { title: "Radial symmetry", advantage: "Senses and reacts in every direction.", tradeoff: "Limits fast directional movement and bipedal posture." },
    gills: { title: "Gills", advantage: "Extracts dissolved oxygen in aquatic habitats.", tradeoff: "Performs poorly outside water and conflicts with lungs." },
    lungs: { title: "Lungs", advantage: "Supports sustained air breathing and active terrestrial life.", tradeoff: "Needs atmospheric oxygen and conflicts with gills." },
    graspingLimbs: { title: "Grasping limbs", advantage: "Manipulates branches, terrain, prey, and tools.", tradeoff: "Requires nervous control and structural investment." },
    opposableDigits: { title: "Opposable digits", advantage: "Adds precise grip and fine object manipulation.", tradeoff: "Specialized extremities are slower to grow and repair." },
    centralizedBrain: { title: "Centralized brain", advantage: "Coordinates senses, learning, and complex movement.", tradeoff: "Demands reliable oxygen and continuous energy." },
    bipedalPosture: { title: "Bipedal posture", advantage: "Frees grasping limbs and raises the visual field.", tradeoff: "Reduces stability and increases balance demands." },
    culturalMemory: { title: "Cultural memory", advantage: "Preserves successful behavior across generations.", tradeoff: "Requires social learning and prolonged development." },
  },
  simulation: {
    title: "The first 200 years",
    emptyTitle: "The story has not begun",
    emptyDescription: "Shape Vespera, give its first organism at least three adaptations, then begin the first 200 years.",
    staleTitle: "A new chapter is waiting",
    staleDescription: "You changed the world or its organism. Begin the story again to see how this version unfolds.",
    deterministic: "Calculated from this experiment",
    success: "The lineage finds a lasting foothold",
    continue: "This lineage falters — change its next chapter",
    objective: "Potential for a lasting civilization",
    outcome: "This chapter ends with",
    stateHash: "Experiment record",
    modelVersion: "Ruleset version",
    metricsTitle: "Forces shaping this lineage",
    strengths: "What carries it forward",
    limits: "What holds it back",
    regionsTitle: "Where it can hold on",
    populationTitle: "The population's first 200 years",
    eventImpactContext: "Applied after this year's usual change: − means fewer organisms; + means more.",
    generation: "Year",
    population: "Population",
    initial: "Initial",
    peak: "Peak",
    final: "Final",
    capacity: "Carrying capacity",
    previousScore: "Change since the previous chapter",
    noPreviousRun: "Change one thing and begin another chapter to compare their futures.",
    adaptPlanet: "Rewrite the world",
    adaptLife: "Rewrite the organism",
    rerun: "Begin this chapter",
    copySummary: "Copy experiment summary",
    summaryCopied: "Experiment summary copied.",
    summaryCopyFailed: "Could not copy the summary. Your browser may block clipboard access.",
    educationalNotice: "A science-informed story model: useful for exploring tradeoffs, not a complete forecast of climate or evolution.",
    failureReasons: {
      noLiquidWater: "No liquid water remains across the configured {minimum} to {maximum} °C range, so this lifeform has no hydrated habitat.",
      insufficientEnergy: "Available biological energy is too low for the selected metabolism at {light}% stellar light.",
      thermalMismatch: "The configured {minimum} to {maximum} °C range exceeds the selected lifeform's thermal adaptations.",
      unsafeRadiation: "Radiation remains {radiation} mSv/h after magnetic protection, beyond the selected lifeform's radiation tolerance.",
      unsupportedMetabolism: "The selected metabolic pathways cannot use this world's available oxygen, light, or geochemical resources.",
      organismMismatch: "The selected body and adaptations cannot offset the combined gravity, pressure, hydration, and environmental stress.",
      populationDecline: "The selected organism persists, but its adaptations cannot replace losses under these conditions.",
    },
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
    coastal: { label: "Coastal zones", description: "A land-water edge scored from liquid water, thermal stability, biological energy, and the organism's hydration fit." },
    equatorial: { label: "Equatorial zones", description: "Bright surface habitats scored from peak temperature, available light, atmospheric support, and radiation protection." },
    polar: { label: "Polar zones", description: "Cold seasonal habitats scored from minimum temperature, liquid water, radiation protection, and cold-tolerance adaptations." },
    deepOcean: { label: "Deep ocean", description: "Dark, high-pressure water habitats scored from water availability, pressure fit, geochemical energy, aquatic movement, and protection." },
    underground: { label: "Underground", description: "Subsurface habitats scored from geochemical energy, pressure and hydration fit, radiation safety, and chemosynthesis. They do not reduce radiation without explicit shielding." },
    highAltitude: { label: "High atmosphere", description: "Thin-air habitats scored from atmospheric support, radiation safety, gravity and movement fit, plus aerial and oxygen-efficiency adaptations." },
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
  populationEvents: {
    vacuumExposure: { title: "Vacuum exposure", description: "The air is so thin that it provides almost no protection or support. Surface life loses its stable atmospheric buffer." },
    oxygenShortfall: { title: "Oxygen shortfall", description: "There is not enough usable oxygen for this organism's normal energy needs. A compatible chemical energy pathway could reduce this pressure." },
    thermalShock: { title: "Thermal shock", description: "An unusually hot or cold period pushes the organism beyond its comfortable range. Insulation, heat tolerance, or dormancy can help it endure the shock." },
    radiationStorm: { title: "Radiation storm", description: "Radiation exposure rises for a short period and can damage an unprotected population. Magnetic protection and radiation-resistant traits help reduce the loss." },
    hydrosphereStress: { title: "Hydrosphere stress", description: "Accessible water becomes scarce or changes phase, so living processes have less usable water. Organisms that rely on wet habitats are affected most." },
    desiccationFront: { title: "Desiccation front", description: "The air becomes drier, making it easier for organisms to lose water. This is especially difficult for forms without strong water-retention adaptations." },
    lowLightFamine: { title: "Low-light famine", description: "Weak starlight leaves too little energy for light-based life. Organisms need a supplied chemical energy source to avoid this shortage." },
    resourceBloom: { title: "Resource bloom", description: "Light, water, and useful chemistry line up for a short time. The population gains a temporary opportunity to grow." },
    geothermalPulse: { title: "Geothermal pulse", description: "A supplied geochemical energy source becomes temporarily more available. Organisms with a compatible chemical metabolism can use the extra energy." },
    thawWindow: { title: "Thaw window", description: "Ice and liquid water are both present for a short time, opening more active wet habitats. This gives water-dependent organisms a brief advantage." },
    adaptiveBreakthrough: { title: "Adaptive breakthrough", description: "Flexible behavior and learning help the organism use resources more effectively. The benefit represents a better response to the current conditions, not a new trait being added." },
    reproductiveBottleneck: { title: "Reproductive bottleneck", description: "Too few offspring survive to replace normal losses. Even a population that survives today can shrink quickly if this continues." },
    seasonalRefuge: { title: "Seasonal refuge", description: "A period of changing temperatures favors organisms that can rest through the harsh part. Dormancy or hibernation helps the population keep more survivors." },
    nutrientUpwelling: { title: "Nutrient upwelling", description: "Moving water brings useful dissolved material into a wet habitat. Aquatic or colony-forming organisms can briefly expand into the enriched zone." },
    photosyntheticSurge: { title: "Photosynthetic surge", description: "Strong light and accessible water briefly increase energy capture for an organism that already has photosynthesis." },
    nurserySeason: { title: "Nursery season", description: "A favorable interval improves survival of protected young, spores, or live-born offspring. It amplifies an existing reproductive strategy rather than creating one." },
  },
  organism: {
    title: "A portrait of the first organism",
    procedural: "Calculated organism portrait",
    generated: "GPT-guided field portrait",
    requestImage: "Create a field portrait",
    generating: "Preparing its field portrait…",
    preparing: "Preparing the validated illustration brief…",
    rendering: "GPT Image is rendering the field portrait… This can take up to 2 minutes.",
    partial: "A live intermediate render has arrived; GPT Image is refining it…",
    fallback: "The procedural field model remains available; no generated image was returned.",
    error: "Image generation is unavailable. The deterministic field model is unchanged.",
    download: "Download 3:2 illustration",
    alt: "Procedural alien organism adapted to the current Vespera experiment",
    openPreview: "Open image full screen",
    closePreview: "Close full-screen image",
  },
  consultant: {
    title: "Life Sciences Consultant",
    description: "Invite GPT-5.6 to read this lineage's evidence: what helped it endure, what threatens it, and what single change is worth trying next.",
    request: "Ask for a scientific reading",
    loading: "The consultant is reading this lineage's evidence…",
    liveSource: "GPT-5.6 analysis",
    localSource: "Local scientific fallback",
    fallbackNotice: "GPT-5.6 was unavailable, so this clearly labelled local interpretation was used.",
    assessment: "Planet assessment",
    traits: "Trait assessment",
    insights: "Key observations",
    experiment: "Suggested experiment",
    error: "Consultant analysis could not be loaded.",
    retry: "Try consultant again",
    temporaryUnavailable: "The Life Sciences Consultant cannot currently reach the OpenAI API. You can keep experimenting; deterministic results remain available.",
  },
  status: {
    local: "Local deterministic model",
    ai: "Server-side AI",
    visual: "Visual interpretation",
    calculated: "Calculated evidence",
  },
  footer: "Xenogenesis Lab · OpenAI Build Week · the Vespera life experiment",
  onboarding: {
    title: "Start with the habitat",
    description: "Adjust atmosphere, surface water, and mean temperature first. The planet and evidence panels update immediately.",
    focus: "Suggested first controls",
    dismiss: "Explore on my own",
    previous: "Back",
    reopen: "🧭 Guide",
    progress: "Experiment path",
    next: "Next",
    finish: "Start exploring",
    steps: {
      planetScene: { title: "Observe the world", description: "The central planet responds as you engineer Vespera. Use the scientific views and camera controls to inspect the change." },
      planetControls: { title: "Shape the habitat", description: "This right panel contains every planetary control. Your choices remain explicit and affect the deterministic model." },
      parameter: { title: "Change one condition", description: "Start with atmosphere, surface water, or mean temperature. Each control explains its current physical consequence." },
      evidencePanel: { title: "Read the world evidence", description: "The left panel summarizes the deterministic state that the organism will have to face." },
      worldStory: { title: "Follow the world story", description: "This short description updates dynamically as the planet changes; it is not AI narration." },
      evidenceDetails: { title: "Inspect the calculations", description: "Climate, atmosphere, water, humidity, energy, and radiation are derived here from the current world." },
      chooseLife: { title: "Continue when ready", description: "When the world is ready to test, choose the first organism. You can always return and adapt the planet later." },
      lifeTransition: { title: "Step 2: design life", description: "Now the organism becomes the central object. The engineered planet remains visible as its context." },
      lifeScene: { title: "Inspect the first organism", description: "Its procedural form responds to the current planet and every adaptation you select." },
      lifeControls: { title: "Build a strategy", description: "The right panel contains compatible body, physiology, senses, reproduction, and complexity choices." },
      lifeDropdown: { title: "Use choice groups", description: "A dropdown groups alternatives that cannot coexist, so you can compare their advantage and tradeoff before selecting one." },
      hypothesisStory: { title: "Keep a dynamic hypothesis", description: "This hypothesis story changes with the engineered world and the traits currently selected." },
      lifeFacts: { title: "Track the design", description: "Traits, body systems, and senses are live counters for the organism you are building." },
      readiness: { title: "Check readiness", description: "Liquid water, a metabolic path, and radiation exposure are an advisory preflight—not a survival result." },
      lifeEvidence: { title: "Match life to its world", description: "These world facts stay visible while you design so the organism remains grounded in the engineered conditions." },
      runSimulation: { title: "Begin the 200-year story", description: "When ready, run the deterministic model to follow this lineage through changing conditions." },
      resultOutcome: { title: "Read this lineage", description: "The central outcome explains what happens to the lineage and shows its calculated survivability." },
      metrics: { title: "Inspect the forces", description: "These metrics show the forces shaping this lineage. They are calculated evidence, not AI opinion." },
      regions: { title: "Find possible refuges", description: "Regional survival shows where the organism can hold on under the configured conditions." },
      population: { title: "Follow the population", description: "This chart tracks the population over 200 model years." },
      events: { title: "Watch for events", description: "Deterministic environmental pressures and opportunities can appear during these years; inspect their markers on the chart." },
      portrait: { title: "Create a field illustration", description: "You can request a planet- and organism-grounded visual portrait. Image generation can take one or two minutes." },
      consultant: { title: "Ask the Life Sciences Consultant", description: "GPT-5.6 explains the validated result, risks, and one controlled next experiment; it never calculates the outcome." },
    },
  },
};

const polish: LabCopy = {
  document: {
    title: "Xenogenesis Lab | Eksperyment Vespera",
    description: "Daj cichej planecie pierwszą szansę na życie i zobacz, jaki los spotka zaprojektowaną przez Ciebie linię życia.",
  },
  language: { label: "Język", english: "English", polish: "Polski" },
  boot: {
    eyebrow: "Ekspedycja Vespera · węzeł badawczy 07",
    title: "XENOGENESIS LAB",
    subtitle: "Cichy świat czeka. Odbuduj jego klimat, zaprojektuj strategię życia i sprawdź, czy biosfera przetrwa dwa stulecia zmian.",
    sceneLabel: "Twoja ekspedycja zaczyna się, zanim powstanie pierwsza komórka",
    enter: "Rozpocznij eksperyment Vespera",
  },
  desktopOnly: {
    eyebrow: "Stanowisko desktopowe",
    title: "Xenogenesis Lab działa obecnie tylko na komputerze",
    description: "Otwórz eksperyment w przeglądarce na komputerze o szerokości co najmniej 1080 pikseli. Widok mobilny i tabletowy są tymczasowo niedostępne.",
  },
  header: {
    system: "Vespera · eksperyment pierwszej biosfery",
    reset: "Resetuj laboratorium",
    resetCamera: "Resetuj kamerę",
    rotationOn: "Wstrzymaj obrót",
    rotationOff: "Wznów obrót",
    clearData: "Usuń dane",
    clearDataConfirm: "Usunąć wszystkie dane Xenogenesis Lab zapisane w tej przeglądarce? Bieżący eksperyment zostanie zresetowany, a przewodnik pokaże się ponownie.",
  },
  phases: {
    planet: { label: "Daj Vesperze początek", description: "Ukształtuj warunki, w których życie pojawi się po raz pierwszy." },
    life: { label: "Zasiej pierwsze życie", description: "Wybierz, co Twój organizm zaryzykuje, zniesie i czym może się stać." },
    results: { label: "Odczytaj jego historię", description: "Prześledź los populacji i zdecyduj o kolejnym rozdziale." },
  },
  planet: {
    title: "Daj Vesperze początek",
    instruction: "Przygotuj scenę dla pierwszego siedliska. Każda decyzja zmienia to, co świat może zaoferować życiu, które tu umieścisz.",
    parameterGroup: "Świat przed życiem",
    baseline: "Świat przed życiem",
    resetBaseline: "Wróć do cichego świata",
    liveView: "Vespera przed pierwszym organizmem",
    viewMode: "Widok naukowy",
    modes: { realistic: "Realistyczny", temperature: "Temperatura", radiation: "Promieniowanie" },
    visualTransition: "Vespera układa się zgodnie z wybranymi przez Ciebie warunkami.",
    controlsDesktop: "PC: przeciągnij lewym przyciskiem myszy, aby obracać · użyj kółka, aby przybliżać",
    controlsMobile: "Mobile: przeciągnij jednym palcem, aby obracać · zsuń lub rozsuń dwa palce, aby przybliżać",
    openDesigner: "Wybierz pierwszy organizm",
    loadTemperateExperiment: "Wczytaj umiarkowany eksperyment startowy",
    changedEffect: "Co się zmieniło",
    exactValue: "Dokładna wartość",
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
    title: "Czego ten świat zażąda od życia",
    planetDescription: "To środowisko czekające na pierwszy organizm: gdzie utrzyma się woda, skąd nadejdzie energia i gdzie ekspozycja stanie się zagrożeniem.",
    designDescription: "Te warunki wyznaczają ryzyko, z którym spotka się Twój organizm. Możesz jednak sprawdzić śmiały projekt i zobaczyć, czy zdoła zdobyć przyczółek.",
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
    title: "Zasiej pierwsze życie Vespery",
    instruction: "Zdecyduj, co przybywa jako pierwsze. Każda adaptacja zostawia ślad w anatomii i zmienia sposób, w jaki ta linia życia spotka się ze światem.",
    selected: "wybranych cech",
    advantage: "Zaleta",
    tradeoff: "Kompromis",
    conflict: "Ta cecha jest sprzeczna z jedną z obecnie wybranych.",
    minimumTraits: "Daj pierwszemu organizmowi przynajmniej trzy adaptacje, zanim poznasz jego los.",
    clear: "Zacznij organizm od nowa",
    run: "Rozpocznij jego 200-letnią historię",
    running: "Śledzimy tę linię życia przez 200 lat zmian…",
    previewHint: "Jego forma powstaje z tego świata i wybranych przez Ciebie adaptacji.",
    strategyLibrary: "Możliwe pierwsze przyczółki",
    strategyHint: "Każda karta to możliwa linia startowa zbudowana z tego, co oferuje konkretnie ten świat. Jeśli żadnej nie ma, świat nie otworzył jeszcze drogi metabolicznej.",
    applyStrategy: "Zasiej tę linię",
    noStrategies: "Vespera nie potrafi jeszcze wyżywić pierwszej linii życia. Przywróć tlen lub jawne źródło energii geochemicznej i spróbuj ponownie.",
    readiness: {
      title: "Gotowość na pierwsze życie",
      description: "Krótka kontrola warunków na podstawie bieżącego świata. Pomaga wybrać następny krok, ale nie zastępuje symulacji przeżywalności.",
      water: "Ciekła woda",
      energy: "Ścieżka metaboliczna",
      radiation: "Ekspozycja na promieniowanie",
      available: "Dostępna",
      unavailable: "Jeszcze niedostępna",
      manageable: "Możliwa do opanowania",
      elevated: "Podwyższona",
    },
    strategies: { littoralGeneralist: "Osłonięty generalista przybrzeżny", pressureSwimmer: "Pływak przystosowany do ciśnienia", endolithicColony: "Endolityczna kolonia naprawcza", aerialDisperser: "Odporna kolonia rozprzestrzeniająca się" },
    chooseOne: "Wybierz jedną",
    singleChoiceGroups: {
      organismForm: "Forma organizmu",
      bodySize: "Wielkość ciała",
      bodySupport: "Podpora ciała",
      movement: "Podstawowy ruch",
      symmetry: "Symetria ciała",
      respiration: "Narząd oddechowy",
      metabolism: "Podstawowy metabolizm",
      energyCapture: "Pozyskiwanie energii",
      thermalStrategy: "Strategia termiczna",
      reproductiveMode: "Tryb rozmnażania",
      reproductiveInvestment: "Inwestycja reprodukcyjna",
    },
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
    cryoprotectiveChemistry: { title: "Chemia krioprotekcyjna", advantage: "Ogranicza uszkodzenia kryształami lodu w zimnych niszach z ciekłą wodą.", tradeoff: "Zużywa energię i nie tworzy ciekłej wody." },
    heatShockProteins: { title: "Białka szoku cieplnego", advantage: "Stabilizują aparat komórkowy podczas silnego, lecz wspieranego przez wodę gorąca.", tradeoff: "Zużywają energię naprawczą i nie pozwalają przetrwać stopionej powierzchni." },
    mineralShielding: { title: "Osłona mineralna", advantage: "Dodaje warstwę minerałów chroniącą przed promieniowaniem i impulsami ciepła.", tradeoff: "Ogranicza ruch i nie zastępuje fizycznego schronienia." },
    biofilmColony: { title: "Kolonia biofilmu", advantage: "Dzieli wilgoć, chemię i naprawę w kolonii powierzchniowej.", tradeoff: "Utrzymuje organizm w lokalnym miejscu." },
    saltTolerance: { title: "Tolerancja soli", advantage: "Utrzymuje równowagę wodną w stężonych solankach.", tradeoff: "Nie czyni suchych ani bezwodnych światów zdatnymi do życia." },
    waterConservation: { title: "Oszczędzanie wody", advantage: "Wydłuża przetrwanie w suchych regionach.", tradeoff: "Spowalnia wymianę substancji i rozmnażanie." },
    pressureResistance: { title: "Odporność na ciśnienie", advantage: "Wspiera życie w głębokim oceanie i nietypowym ciśnieniu.", tradeoff: "Zmniejsza sprawność ruchu." },
    regenerativeTissue: { title: "Tkanka regeneracyjna", advantage: "Naprawia szkody radiacyjne i środowiskowe.", tradeoff: "Ma wysoki koszt metaboliczny i reprodukcyjny." },
    hibernation: { title: "Hibernacja", advantage: "Pozwala przetrwać zimno, suszę lub okresowy stres.", tradeoff: "Ogranicza czas aktywnego wzrostu." },
    dormantCysts: { title: "Uśpione cysty", advantage: "Chronią etap spoczynkowy podczas krótkiego promieniowania, suszy i stresu termicznego.", tradeoff: "Nie zastępują aktywnego metabolizmu ani ciekłej wody." },
    symbioticMetabolism: { title: "Metabolizm symbiotyczny", advantage: "Dzieli ścieżki tlenowe i chemiczne między współpracującymi komórkami.", tradeoff: "Wymaga zgodnej energii środowiskowej dla partnerstwa." },
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
    unicellular: { title: "Forma jednokomórkowa", advantage: "Umożliwia bakteryjną prostotę i szybkie namnażanie.", tradeoff: "Nie może tworzyć kończyn, narządów ani zaawansowanego poznania." },
    multicellular: { title: "Tkanki wielokomórkowe", advantage: "Umożliwiają wyspecjalizowane narządy i złożone plany ciała.", tradeoff: "Zwiększają zapotrzebowanie na koordynację i energię." },
    bilateralSymmetry: { title: "Symetria dwuboczna", advantage: "Wspiera ruch kierunkowy i wyraźną oś głowa–ogon.", tradeoff: "Urazy sparowanych struktur mają większe znaczenie." },
    radialSymmetry: { title: "Symetria promienista", advantage: "Pozwala wyczuwać i reagować we wszystkich kierunkach.", tradeoff: "Ogranicza szybki ruch kierunkowy i postawę dwunożną." },
    gills: { title: "Skrzela", advantage: "Pobierają rozpuszczony tlen w siedliskach wodnych.", tradeoff: "Działają słabo poza wodą i wykluczają płuca." },
    lungs: { title: "Płuca", advantage: "Wspierają wydajne oddychanie powietrzem i aktywne życie lądowe.", tradeoff: "Wymagają tlenu w atmosferze i wykluczają skrzela." },
    graspingLimbs: { title: "Kończyny chwytne", advantage: "Manipulują gałęziami, terenem, zdobyczą i narzędziami.", tradeoff: "Wymagają kontroli nerwowej i inwestycji strukturalnej." },
    opposableDigits: { title: "Przeciwstawne palce", advantage: "Zapewniają precyzyjny chwyt i dokładną manipulację.", tradeoff: "Wyspecjalizowane końce kończyn wolniej rosną i się regenerują." },
    centralizedBrain: { title: "Scentralizowany mózg", advantage: "Koordynuje zmysły, uczenie i złożony ruch.", tradeoff: "Wymaga niezawodnego tlenu i stałego dopływu energii." },
    bipedalPosture: { title: "Postawa dwunożna", advantage: "Uwalnia kończyny chwytne i podnosi pole widzenia.", tradeoff: "Zmniejsza stabilność i zwiększa wymagania równowagi." },
    culturalMemory: { title: "Pamięć kulturowa", advantage: "Zachowuje skuteczne zachowania między pokoleniami.", tradeoff: "Wymaga uczenia społecznego i długiego rozwoju." },
  },
  simulation: {
    title: "Pierwsze 200 lat",
    emptyTitle: "Historia jeszcze się nie zaczęła",
    emptyDescription: "Ukształtuj Vesperę, daj pierwszemu organizmowi co najmniej trzy adaptacje, a potem rozpocznij pierwsze 200 lat.",
    staleTitle: "Czeka nowy rozdział",
    staleDescription: "Zmieniłeś świat lub organizm. Rozpocznij historię ponownie, aby zobaczyć, jak potoczy się ta wersja.",
    deterministic: "Obliczone dla tego eksperymentu",
    success: "Ta linia życia znajduje trwały przyczółek",
    continue: "Ta linia życia słabnie — zmień jej kolejny rozdział",
    objective: "Potencjał trwałej cywilizacji",
    outcome: "Ten rozdział kończy się",
    stateHash: "Zapis eksperymentu",
    modelVersion: "Wersja zasad",
    metricsTitle: "Siły kształtujące tę linię życia",
    strengths: "Co pozwala jej trwać",
    limits: "Co ją powstrzymuje",
    regionsTitle: "Gdzie może się utrzymać",
    populationTitle: "Pierwsze 200 lat populacji",
    eventImpactContext: "Stosowane po zwykłej zmianie w tym roku: − to mniej organizmów, + to więcej.",
    generation: "Rok",
    population: "Populacja",
    initial: "Początkowa",
    peak: "Szczytowa",
    final: "Końcowa",
    capacity: "Pojemność środowiska",
    previousScore: "Zmiana od poprzedniego rozdziału",
    noPreviousRun: "Zmień jedną rzecz i rozpocznij kolejny rozdział, aby porównać ich przyszłość.",
    adaptPlanet: "Napisz świat od nowa",
    adaptLife: "Napisz organizm od nowa",
    rerun: "Rozpocznij ten rozdział",
    copySummary: "Kopiuj podsumowanie eksperymentu",
    summaryCopied: "Podsumowanie eksperymentu zostało skopiowane.",
    summaryCopyFailed: "Nie udało się skopiować podsumowania. Przeglądarka może blokować dostęp do schowka.",
    educationalNotice: "Oparta na nauce opowieść modelowa: służy do badania kompromisów, nie jest pełną prognozą klimatu ani ewolucji.",
    failureReasons: {
      noLiquidWater: "W zakresie {minimum}–{maximum} °C nie pozostaje ciekła woda, więc ta forma życia nie ma nawodnionego siedliska.",
      insufficientEnergy: "Dostępna energia biologiczna jest zbyt mała dla wybranego metabolizmu przy świetle gwiazdowym {light}%.",
      thermalMismatch: "Zakres {minimum}–{maximum} °C przekracza adaptacje termiczne wybranej formy życia.",
      unsafeRadiation: "Po ochronie magnetycznej promieniowanie nadal wynosi {radiation} mSv/h, więcej niż toleruje wybrana forma życia.",
      unsupportedMetabolism: "Wybrane szlaki metaboliczne nie mogą wykorzystać dostępnego w tym świecie tlenu, światła ani zasobów geochemicznych.",
      organismMismatch: "Wybrane ciało i adaptacje nie równoważą łącznego wpływu grawitacji, ciśnienia, nawodnienia i stresu środowiskowego.",
      populationDecline: "Wybrany organizm utrzymuje się, lecz jego adaptacje nie pozwalają odtwarzać strat w tych warunkach.",
    },
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
    coastal: { label: "Strefy przybrzeżne", description: "Granica lądu i wody oceniana przez ilość ciekłej wody, stabilność termiczną, energię biologiczną i dopasowanie nawodnienia organizmu." },
    equatorial: { label: "Strefy równikowe", description: "Jasno oświetlone siedliska powierzchniowe oceniane przez temperaturę maksymalną, dostępne światło, wsparcie atmosfery i ochronę przed promieniowaniem." },
    polar: { label: "Strefy polarne", description: "Zimne siedliska sezonowe oceniane przez temperaturę minimalną, ciekłą wodę, ochronę radiacyjną i adaptacje do chłodu." },
    deepOcean: { label: "Głęboki ocean", description: "Ciemne, wysokociśnieniowe siedliska wodne oceniane przez dostępność wody, tolerancję ciśnienia, energię geochemiczną, ruch wodny i ochronę." },
    underground: { label: "Podziemie", description: "Siedliska podpowierzchniowe oceniane przez energię geochemiczną, dopasowanie ciśnienia i nawodnienia, bezpieczeństwo radiacyjne oraz chemosyntezę. Bez jawnej osłony nie obniżają promieniowania." },
    highAltitude: { label: "Wysoka atmosfera", description: "Siedliska rzadkiego powietrza oceniane przez wsparcie atmosferyczne, bezpieczeństwo radiacyjne, dopasowanie grawitacji i ruchu oraz adaptacje lotne i tlenowe." },
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
  populationEvents: {
    vacuumExposure: { title: "Ekspozycja na próżnię", description: "Powietrze jest tak rzadkie, że prawie nie daje ochrony ani oparcia. Życie na powierzchni traci stabilizującą osłonę atmosfery." },
    oxygenShortfall: { title: "Niedobór tlenu", description: "Jest za mało dostępnego tlenu na zwykłe potrzeby energetyczne tego organizmu. Zgodna chemiczna ścieżka energii może zmniejszyć ten problem." },
    thermalShock: { title: "Szok termiczny", description: "Nietypowo gorący lub zimny okres wykracza poza komfortowy zakres organizmu. Izolacja, odporność na gorąco lub uśpienie pomagają przetrwać taki szok." },
    radiationStorm: { title: "Burza radiacyjna", description: "Ekspozycja na promieniowanie na krótko rośnie i może uszkodzić niechronioną populację. Ochrona magnetyczna oraz cechy odpornościowe ograniczają straty." },
    hydrosphereStress: { title: "Stres hydrosfery", description: "Dostępnej wody jest mniej albo zmienia ona stan skupienia, więc procesy życiowe mają mniej wody do wykorzystania. Najbardziej cierpią organizmy zależne od wilgotnych siedlisk." },
    desiccationFront: { title: "Front wysychania", description: "Powietrze staje się bardziej suche, więc organizmy łatwiej tracą wodę. To szczególnie trudne dla form bez dobrych przystosowań do jej zatrzymywania." },
    lowLightFamine: { title: "Głód przy słabym świetle", description: "Słabe światło gwiazdy dostarcza za mało energii dla życia opartego na świetle. Organizmy potrzebują dostarczonego chemicznego źródła energii, aby uniknąć niedoboru." },
    resourceBloom: { title: "Rozkwit zasobów", description: "Światło, woda i użyteczna chemia na krótko układają się korzystnie. Populacja dostaje tymczasową okazję do wzrostu." },
    geothermalPulse: { title: "Impuls geotermalny", description: "Dostarczone źródło energii geochemicznej staje się chwilowo bardziej dostępne. Organizmy ze zgodnym metabolizmem chemicznym mogą wykorzystać dodatkową energię." },
    thawWindow: { title: "Okno odwilży", description: "Lód i ciekła woda występują jednocześnie przez krótki czas, otwierając więcej aktywnych mokrych siedlisk. Organizmy zależne od wody zyskują wtedy chwilową przewagę." },
    adaptiveBreakthrough: { title: "Przełom adaptacyjny", description: "Elastyczne zachowanie i uczenie pomagają organizmowi lepiej wykorzystywać zasoby. Korzyść oznacza lepszą reakcję na warunki, a nie dodanie nowej cechy." },
    reproductiveBottleneck: { title: "Wąskie gardło rozrodcze", description: "Zbyt mało potomstwa przeżywa, by wyrównać zwykłe straty. Nawet populacja, która przetrwa dziś, może szybko maleć, jeśli ten stan się utrzyma." },
    seasonalRefuge: { title: "Sezonowe schronienie", description: "Okres zmiennej temperatury sprzyja organizmom, które potrafią przeczekać trudniejszą część cyklu. Uśpienie lub hibernacja pozwalają zachować więcej osobników." },
    nutrientUpwelling: { title: "Wyniesienie składników odżywczych", description: "Ruch wody wnosi użyteczny rozpuszczony materiał do mokrego siedliska. Organizmy wodne lub tworzące kolonie mogą chwilowo rozszerzyć zasięg w wzbogaconej strefie." },
    photosyntheticSurge: { title: "Impuls fotosyntezy", description: "Silne światło i dostępna woda chwilowo zwiększają pozyskiwanie energii przez organizm, który już wykorzystuje fotosyntezę." },
    nurserySeason: { title: "Sezon lęgowy", description: "Korzystny okres poprawia przeżycie chronionego młodego stadium, zarodników lub potomstwa żyworodnego. Wzmacnia istniejącą strategię rozrodu, a nie tworzy jej." },
  },
  organism: {
    title: "Portret pierwszego organizmu",
    procedural: "Obliczony portret organizmu",
    generated: "Portret terenowy pod kierunkiem GPT",
    requestImage: "Stwórz portret terenowy",
    generating: "Przygotowujemy jego portret terenowy…",
    preparing: "Przygotowywany jest zweryfikowany opis ilustracji…",
    rendering: "GPT Image renderuje portret terenowy… Może to potrwać do 2 minut.",
    partial: "Dotarł rzeczywisty podgląd pośredni; GPT Image dopracowuje ilustrację…",
    fallback: "Proceduralny model terenowy pozostaje dostępny; nie zwrócono wygenerowanego obrazu.",
    error: "Generowanie obrazu jest niedostępne. Deterministyczny model terenowy nie uległ zmianie.",
    download: "Pobierz ilustrację 3:2",
    alt: "Proceduralny obcy organizm dostosowany do bieżącego eksperymentu Vespera",
    openPreview: "Otwórz obraz na pełnym ekranie",
    closePreview: "Zamknij obraz pełnoekranowy",
  },
  consultant: {
    title: "Konsultant nauk biologicznych",
    description: "Zaproś GPT-5.6 do odczytania śladów tej linii życia: co pozwoliło jej przetrwać, co jej zagraża i którą jedną zmianę warto sprawdzić dalej.",
    request: "Poproś o naukowy odczyt",
    loading: "Konsultant odczytuje ślady tej linii życia…",
    liveSource: "Analiza GPT-5.6",
    localSource: "Lokalna analiza zapasowa",
    fallbackNotice: "GPT-5.6 był niedostępny, dlatego użyto wyraźnie oznaczonej lokalnej interpretacji.",
    assessment: "Ocena planety",
    traits: "Ocena cech",
    insights: "Kluczowe obserwacje",
    experiment: "Sugerowany eksperyment",
    error: "Nie udało się pobrać analizy konsultanta.",
    retry: "Spróbuj ponownie",
    temporaryUnavailable: "Konsultant nauk o życiu nie może obecnie połączyć się z API OpenAI. Możesz kontynuować eksperymenty; wyniki deterministyczne pozostają dostępne.",
  },
  status: {
    local: "Lokalny model deterministyczny",
    ai: "AI po stronie serwera",
    visual: "Interpretacja wizualna",
    calculated: "Obliczone dane",
  },
  footer: "Xenogenesis Lab · OpenAI Build Week · eksperyment życia Vespery",
  onboarding: {
    title: "Zacznij od siedliska",
    description: "Najpierw zmień atmosferę, wodę powierzchniową i średnią temperaturę. Planeta oraz panele dowodów od razu się zaktualizują.",
    focus: "Sugerowane pierwsze kontrolki",
    dismiss: "Chcę eksplorować samodzielnie",
    previous: "Wstecz",
    reopen: "🧭 Przewodnik",
    progress: "Ścieżka eksperymentu",
    next: "Dalej",
    finish: "Zacznij eksplorację",
    steps: {
      planetScene: { title: "Obserwuj świat", description: "Centralna planeta reaguje na sposób, w jaki kształtujesz Vesperę. Użyj widoków naukowych i sterowania kamerą, aby zobaczyć zmianę." },
      planetControls: { title: "Ukształtuj siedlisko", description: "Ten prawy panel zawiera wszystkie kontrolki planety. Twoje wybory są jawne i wpływają na model deterministyczny." },
      parameter: { title: "Zmień jeden warunek", description: "Zacznij od atmosfery, wody powierzchniowej albo średniej temperatury. Każda kontrolka opisuje bieżący efekt fizyczny." },
      evidencePanel: { title: "Odczytaj dane świata", description: "Lewy panel podsumowuje deterministyczny stan, z którym będzie musiał zmierzyć się organizm." },
      worldStory: { title: "Śledź historię świata", description: "Ten krótki opis zmienia się dynamicznie wraz z planetą; nie jest narracją AI." },
      evidenceDetails: { title: "Sprawdź obliczenia", description: "Klimat, atmosfera, woda, wilgotność, energia i promieniowanie są tu wyprowadzane z bieżącego świata." },
      chooseLife: { title: "Przejdź dalej, gdy jesteś gotowy", description: "Gdy świat jest gotowy do testu, wybierz pierwszy organizm. Zawsze możesz wrócić i dostosować planetę." },
      lifeTransition: { title: "Krok 2: zaprojektuj życie", description: "Teraz organizm staje się centralnym obiektem. Zaprojektowana planeta nadal pozostaje jego kontekstem." },
      lifeScene: { title: "Obejrzyj pierwszy organizm", description: "Jego proceduralna forma reaguje na bieżącą planetę i każdą wybraną adaptację." },
      lifeControls: { title: "Zbuduj strategię", description: "Prawy panel zawiera zgodne wybory budowy, fizjologii, zmysłów, rozmnażania i złożoności." },
      lifeDropdown: { title: "Używaj grup wyboru", description: "Dropdown grupuje alternatywy, które nie mogą współistnieć. Porównaj zaletę i kompromis przed wyborem." },
      hypothesisStory: { title: "Prowadź dynamiczną hipotezę", description: "Ta historia hipotezy zmienia się wraz z zaprojektowanym światem i aktualnie wybranymi cechami." },
      lifeFacts: { title: "Śledź projekt", description: "Cechy, systemy ciała i zmysły to liczniki na żywo dla budowanego organizmu." },
      readiness: { title: "Sprawdź gotowość", description: "Ciekła woda, ścieżka metaboliczna i ekspozycja na promieniowanie są kontrolą wstępną, a nie wynikiem przeżywalności." },
      lifeEvidence: { title: "Dopasuj życie do świata", description: "Te fakty o świecie pozostają widoczne podczas projektowania, aby organizm był osadzony w wybranych warunkach." },
      runSimulation: { title: "Rozpocznij 200-letnią historię", description: "Gdy jesteś gotowy, uruchom model deterministyczny i prześledź tę linię życia w zmiennych warunkach." },
      resultOutcome: { title: "Odczytaj los linii życia", description: "Centralny wynik wyjaśnia, co dzieje się z linią życia, i pokazuje jej obliczoną przeżywalność." },
      metrics: { title: "Sprawdź siły", description: "Te metryki pokazują czynniki kształtujące linię życia. To obliczone dane, a nie opinia AI." },
      regions: { title: "Znajdź możliwe schronienia", description: "Przeżywalność regionalna pokazuje, gdzie organizm może się utrzymać w skonfigurowanych warunkach." },
      population: { title: "Śledź populację", description: "Wykres pokazuje populację przez 200 lat modelowych." },
      events: { title: "Wypatruj zdarzeń", description: "W tych latach mogą pojawić się deterministyczne presje i okazje środowiskowe. Sprawdzaj ich znaczniki na wykresie." },
      portrait: { title: "Stwórz ilustrację terenową", description: "Możesz poprosić o wizualny portret oparty na planecie i organizmie. Generowanie obrazu może potrwać minutę lub dwie." },
      consultant: { title: "Zapytaj Konsultanta nauk o życiu", description: "GPT-5.6 wyjaśnia zweryfikowany wynik, ryzyka i jeden kontrolowany eksperyment. Nie oblicza wyniku." },
    },
  },
};

/** Complete compile-time checked bilingual interface copy. */
export const COPY: Record<Language, LabCopy> = { en: english, pl: polish };

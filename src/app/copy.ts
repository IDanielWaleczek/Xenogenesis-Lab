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

/** Editable inputs exposed by the first complete simulator mission. */
export type ParameterId =
  | "gravity"
  | "temperature"
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
  influence: string;
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
    skip: string;
    enter: string;
  };
  header: {
    system: string;
    mission: string;
    seed: string;
    reset: string;
    resetCamera: string;
    rotationOn: string;
    rotationOff: string;
  };
  mission: {
    eyebrow: string;
    title: string;
    objectiveLabel: string;
    objective: string;
    description: string;
    loopLabel: string;
    loop: string[];
    convention: string;
    guidanceTitle: string;
    guidance: string;
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
    inspectHint: string;
    inspecting: string;
    noInspection: string;
    regionalModel: string;
    visualTransition: string;
    openDesigner: string;
    oxygenPartialPressure: string;
    atmosphericDensity: string;
    temperatureRange: string;
    legends: {
      temperature: { title: string; cold: string; temperate: string; hot: string };
      radiation: { title: string; protected: string; elevated: string; severe: string };
    };
  };
  parameters: Record<ParameterId, ParameterCopy>;
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
    skip: "Skip animation",
    enter: "Enter laboratory",
  },
  header: {
    system: "Dynamic life engineering system",
    mission: "Genesis mission 01",
    seed: "Planet seed",
    reset: "Reset mission",
    resetCamera: "Reset camera",
    rotationOn: "Pause rotation",
    rotationOff: "Resume rotation",
  },
  mission: {
    eyebrow: "Mission objective · Vespera 7A",
    title: "Create stable advanced life",
    objectiveLabel: "Target outcome",
    objective: "Engineer the planet and design a stable, advanced multicellular lifeform capable of persisting there.",
    description: "There is no predefined correct world. Change the environment, build a biological strategy, run the model, then adapt from evidence.",
    loopLabel: "Experimental loop",
    loop: ["Observe", "Modify", "Design", "Simulate", "Adapt"],
    convention: "Broad outcome, visible evidence, multiple viable strategies.",
    guidanceTitle: "Start here",
    guidance: "Move one or two environmental controls and watch the planet transform. Then open Design life, choose traits within the energy budget, and run the simulation.",
  },
  phases: {
    planet: { label: "Engineer planet", description: "Change the world and inspect its regions." },
    life: { label: "Design life", description: "Build a biological strategy with real tradeoffs." },
    results: { label: "Analyze", description: "Read the outcome and decide what to change." },
  },
  planet: {
    title: "Planet engineering",
    instruction: "Every control affects the deterministic model; physically justified changes also transform the planet.",
    parameterGroup: "Environmental systems",
    baseline: "Mission baseline",
    resetBaseline: "Restore baseline",
    liveView: "Live procedural planet",
    viewMode: "Scientific view",
    modes: { realistic: "Realistic", temperature: "Temperature", radiation: "Radiation" },
    inspectHint: "Drag to rotate · scroll to zoom · select the surface to inspect a representative region",
    inspecting: "Selected region",
    noInspection: "Select a point on the planet to inspect its model region.",
    regionalModel: "Six representative habitat regions are evaluated; this is not a full climate grid.",
    visualTransition: "Terraforming visualization is interpolating toward the current parameters.",
    openDesigner: "Continue to life designer",
    oxygenPartialPressure: "Oxygen partial pressure",
    atmosphericDensity: "Atmospheric density",
    temperatureRange: "Configured temperature range",
    legends: {
      temperature: { title: "Temperature", cold: "Frozen", temperate: "Temperate", hot: "Extreme heat" },
      radiation: { title: "Radiation exposure", protected: "Protected", elevated: "Elevated", severe: "Severe" },
    },
  },
  parameters: {
    gravity: { label: "Gravity", unit: "g", influence: "Higher gravity favors compact, strongly supported bodies and makes flight more expensive." },
    temperature: { label: "Mean temperature", unit: "°C", influence: "Controls ice, stable surface water, thermal stress, and biome color." },
    pressure: { label: "Local pressure", unit: "atm", influence: "Changes atmospheric density, water stability, cloud formation, and movement options." },
    oxygen: { label: "Atmospheric oxygen", unit: "%", influence: "Sets oxygen partial pressure and the energy available to aerobic organisms." },
    carbonDioxide: { label: "Atmospheric carbon dioxide", unit: "%", influence: "Changes atmospheric color and supplies carbon while high levels impose a model cost." },
    water: { label: "Available water", unit: "%", influence: "0% removes surface water; 100% creates an aquatic world. It also caps possible humidity." },
    radiation: { label: "Radiation dose rate", unit: "mSv/h", influence: "Raises biological damage unless explicit defenses or magnetic protection compensate." },
    light: { label: "Stellar energy", unit: "%", influence: "Changes illumination and the energy available to photosynthetic strategies." },
    humidity: { label: "Humidity", unit: "%", influence: "Requires available water, so its maximum follows the water setting. It shapes clouds, moisture, and fertile terrain." },
    magneticField: { label: "Magnetic field", unit: "Earth", influence: "Reduces the modeled incoming radiation exposure and changes the radiation overlay." },
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
    success: "Mission objective reached",
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
    description: "Ask GPT-5.6 to interpret the completed deterministic result. It cannot alter the scores.",
    request: "Request consultant analysis",
    loading: "Consultant is reviewing the evidence…",
    liveSource: "GPT-5.6 analysis",
    localSource: "Local scientific fallback",
    fallbackNotice: "GPT-5.6 was unavailable, so this clearly labelled local interpretation was used.",
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
    skip: "Pomiń animację",
    enter: "Wejdź do laboratorium",
  },
  header: {
    system: "Dynamiczny system projektowania życia",
    mission: "Misja Genesis 01",
    seed: "Ziarno planety",
    reset: "Resetuj misję",
    resetCamera: "Resetuj kamerę",
    rotationOn: "Wstrzymaj obrót",
    rotationOff: "Wznów obrót",
  },
  mission: {
    eyebrow: "Cel misji · Vespera 7A",
    title: "Stwórz stabilne zaawansowane życie",
    objectiveLabel: "Docelowy rezultat",
    objective: "Przekształć planetę i zaprojektuj stabilną, zaawansowaną wielokomórkową formę życia zdolną na niej przetrwać.",
    description: "Nie istnieje jedna poprawna konfiguracja świata. Zmieniaj środowisko, buduj strategię biologiczną, uruchamiaj model i adaptuj projekt na podstawie wyników.",
    loopLabel: "Pętla eksperymentu",
    loop: ["Obserwuj", "Modyfikuj", "Projektuj", "Symuluj", "Adaptuj"],
    convention: "Szeroki cel, jawne dane, wiele możliwych strategii.",
    guidanceTitle: "Zacznij tutaj",
    guidance: "Przesuń jeden lub dwa parametry środowiska i obserwuj przemianę planety. Następnie otwórz projektant życia, wybierz cechy w granicach budżetu energetycznego i uruchom symulację.",
  },
  phases: {
    planet: { label: "Modyfikuj planetę", description: "Zmieniaj świat i badaj jego regiony." },
    life: { label: "Projektuj życie", description: "Zbuduj strategię biologiczną z realnymi kompromisami." },
    results: { label: "Analizuj", description: "Odczytaj wynik i zdecyduj, co zmienić." },
  },
  planet: {
    title: "Inżynieria planetarna",
    instruction: "Każdy parametr wpływa na model deterministyczny; fizycznie uzasadnione zmiany przekształcają też planetę.",
    parameterGroup: "Systemy środowiskowe",
    baseline: "Wartości początkowe misji",
    resetBaseline: "Przywróć wartości początkowe",
    liveView: "Proceduralna planeta na żywo",
    viewMode: "Widok naukowy",
    modes: { realistic: "Realistyczny", temperature: "Temperatura", radiation: "Promieniowanie" },
    inspectHint: "Przeciągnij, aby obrócić · przewiń, aby przybliżyć · wybierz powierzchnię, aby zbadać reprezentatywny region",
    inspecting: "Wybrany region",
    noInspection: "Wybierz punkt na planecie, aby zbadać jego region modelowy.",
    regionalModel: "Model ocenia sześć reprezentatywnych siedlisk; nie jest to pełna siatka klimatyczna.",
    visualTransition: "Wizualizacja terraformowania płynnie zmierza do bieżących parametrów.",
    openDesigner: "Przejdź do projektanta życia",
    oxygenPartialPressure: "Ciśnienie parcjalne tlenu",
    atmosphericDensity: "Gęstość atmosfery",
    temperatureRange: "Ustawiony zakres temperatury",
    legends: {
      temperature: { title: "Temperatura", cold: "Zamarznięte", temperate: "Umiarkowane", hot: "Skrajne gorąco" },
      radiation: { title: "Ekspozycja na promieniowanie", protected: "Chronione", elevated: "Podwyższone", severe: "Silne" },
    },
  },
  parameters: {
    gravity: { label: "Grawitacja", unit: "g", influence: "Większa grawitacja sprzyja zwartym, silnie podpartym ciałom i podnosi koszt lotu." },
    temperature: { label: "Średnia temperatura", unit: "°C", influence: "Steruje lodem, stabilnością wody powierzchniowej, stresem cieplnym i barwą biomów." },
    pressure: { label: "Ciśnienie lokalne", unit: "atm", influence: "Zmienia gęstość atmosfery, stabilność wody, powstawanie chmur i możliwości ruchu." },
    oxygen: { label: "Tlen w atmosferze", unit: "%", influence: "Określa ciśnienie parcjalne tlenu i energię dostępną dla organizmów tlenowych." },
    carbonDioxide: { label: "Dwutlenek węgla w atmosferze", unit: "%", influence: "Zmienia kolor atmosfery i dostarcza węgla, lecz wysokie stężenie generuje koszt modelowy." },
    water: { label: "Dostępna woda", unit: "%", influence: "0% usuwa wodę powierzchniową, a 100% tworzy świat wodny. Ustawienie ogranicza też możliwą wilgotność." },
    radiation: { label: "Dawka promieniowania", unit: "mSv/h", influence: "Zwiększa uszkodzenia biologiczne, jeśli nie równoważą ich jawne mechanizmy ochronne lub pole magnetyczne." },
    light: { label: "Energia gwiazdy", unit: "%", influence: "Zmienia oświetlenie i energię dostępną dla strategii fotosyntetycznych." },
    humidity: { label: "Wilgotność", unit: "%", influence: "Wymaga dostępnej wody, więc jej maksimum zależy od ustawienia wody. Kształtuje chmury, wilgoć i żyzne obszary." },
    magneticField: { label: "Pole magnetyczne", unit: "Ziemi", influence: "Zmniejsza modelowaną ekspozycję na promieniowanie i zmienia nakładkę radiacyjną." },
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
    success: "Cel misji osiągnięty",
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
    description: "Poproś GPT-5.6 o interpretację ukończonego wyniku deterministycznego. Model nie może zmienić punktacji.",
    request: "Poproś o analizę konsultanta",
    loading: "Konsultant analizuje dane…",
    liveSource: "Analiza GPT-5.6",
    localSource: "Lokalna analiza zapasowa",
    fallbackNotice: "GPT-5.6 był niedostępny, dlatego użyto wyraźnie oznaczonej lokalnej interpretacji.",
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

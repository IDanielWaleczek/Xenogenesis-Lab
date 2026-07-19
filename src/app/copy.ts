import type {
  AdaptationId,
  PressureId,
  RevisionConclusion,
  SurvivalStrategy,
} from "@/domain/mission/schema";
import type { WorldParameters } from "@/domain/world/schema";

/** Supported interface languages. */
export type Language = "en" | "pl";

/** Stable stages in the single-mission training loop. */
export type MissionStage =
  | "briefing"
  | "world"
  | "decisions"
  | "simulation"
  | "debrief"
  | "progress";

type ParameterKey =
  | "gravity"
  | "pressure"
  | "oxygen"
  | "carbonDioxide"
  | "inertGas"
  | "toxicGas"
  | "nitrogen"
  | "molarMass"
  | "temperature"
  | "variation"
  | "radiation"
  | "light"
  | "water"
  | "habitat"
  | "shielding"
  | "geochemical"
  | "acceptors";

type ParameterCopy = { label: string; influence: string };

type Copy = {
  document: { title: string; description: string };
  language: { label: string; english: string; polish: string };
  system: {
    bootTitle: string;
    bootSubtitle: string;
    bootSteps: string[];
    bootReady: string;
    skip: string;
    enter: string;
  };
  header: { subtitle: string; mission: string; home: string; reset: string };
  stages: Record<MissionStage, string>;
  stageNavigation: string;
  provenance: {
    baseline: string;
    variant: string;
    hypothesis: string;
    calculated: string;
    ai: string;
    local: string;
    visual: string;
  };
  home: {
    eyebrow: string;
    title: string;
    description: string;
    available: string;
    missionTitle: string;
    missionDescription: string;
    duration: string;
    begin: string;
    firstTime: string;
    steps: string[];
  };
  mission: {
    eyebrow: string;
    title: string;
    planet: string;
    objectiveLabel: string;
    objective: string;
    briefing: string;
    candidateTask: string;
    factsTitle: string;
    facts: {
      gravity: string;
      pressure: string;
      temperature: string;
      radiation: string;
      water: string;
      habitat: string;
    };
    instructionsTitle: string;
    instructions: string[];
    ruleset: string;
    begin: string;
  };
  world: {
    eyebrow: string;
    title: string;
    instruction: string;
    controlsTitle: string;
    atmosphereTitle: string;
    energyTitle: string;
    previewTitle: string;
    previewNotice: string;
    baseline: string;
    variant: string;
    reset: string;
    lock: string;
    invalid: string;
    localValues: string;
    temperatureRange: string;
    oxygenPressure: string;
    density: string;
    notAvailable: string;
    nitrogenBalance: string;
    parameters: Record<ParameterKey, ParameterCopy>;
    habitats: Record<WorldParameters["habitat"], string>;
    geochemicalLevels: Record<WorldParameters["geochemicalEnergyAvailability"], string>;
    acceptorNames: Record<WorldParameters["electronAcceptors"][number], string>;
  };
  decisions: {
    eyebrow: string;
    title: string;
    instruction: string;
    worldSummary: string;
    editWorld: string;
    pressureTitle: string;
    pressureHint: string;
    adaptationTitle: string;
    adaptationHint: string;
    strategyTitle: string;
    strategyHint: string;
    validation: string;
    commit: string;
    committed: string;
  };
  strategies: Record<SurvivalStrategy, { title: string; description: string }>;
  simulation: {
    eyebrow: string;
    title: string;
    ready: string;
    run: string;
    running: string;
    outcomeLabel: string;
    outcome: string;
    rulesetLabel: string;
    normalizedFacts: string;
    pressureTitle: string;
    organismTitle: string;
    candidateNotice: string;
    comparisonTitle: string;
    alignment: string;
    pressureAccuracy: string;
    supported: string;
    missed: string;
    unsupported: string;
    none: string;
    instructor: string;
  };
  debrief: {
    eyebrow: string;
    title: string;
    loading: string;
    liveSource: string;
    fallbackSource: string;
    fallbackNotice: string;
    evidence: string;
    tradeOffs: string;
    question: string;
    experiment: string;
    revisionTitle: string;
    revisionInstruction: string;
    evidenceLabel: string;
    conclusionLabel: string;
    revisionValidation: string;
    submit: string;
    error: string;
    retry: string;
  };
  revisionConclusions: Record<RevisionConclusion, { title: string; description: string }>;
  progress: {
    eyebrow: string;
    title: string;
    completed: string;
    archiveTitle: string;
    archiveEntry: string;
    sessionOnly: string;
    competencyTitle: string;
    hypothesisFormation: string;
    adaptationAnalysis: string;
    evidenceUse: string;
    certification: string;
    candidate: string;
    nextTitle: string;
    nextDescription: string;
    todo: string;
    repeat: string;
  };
  adaptations: Record<AdaptationId, { title: string; description: string }>;
  pressures: Record<PressureId, { title: string; description: string }>;
  severity: { moderate: string; high: string };
  footer: string;
};

const english: Copy = {
  document: {
    title: "Xenogenesis Lab | Mission Control",
    description: "Explore a planet, commit mission decisions, and test them with a deterministic astrobiology model.",
  },
  language: { label: "Language", english: "English", polish: "Polish" },
  system: {
    bootTitle: "XENOGENESIS LAB",
    bootSubtitle: "Astrobiology mission training system",
    bootSteps: ["Power core online", "Loading ruleset 0.2.0", "Validating mission archive", "Opening Mission Control"],
    bootReady: "SYSTEM READY",
    skip: "Skip boot",
    enter: "Enter Mission Control",
  },
  header: { subtitle: "Mission Control", mission: "Training mission 01", home: "Mission Control home", reset: "Reset exercise" },
  stages: { briefing: "Briefing", world: "World Lab", decisions: "Decisions", simulation: "Simulation", debrief: "Debrief", progress: "Progress" },
  stageNavigation: "Mission training stages",
  provenance: { baseline: "Mission baseline", variant: "Experimental variant", hypothesis: "Your decisions", calculated: "Calculated result", ai: "GPT-5.6 interpretation", local: "Local training review", visual: "Visual interpretation" },
  home: {
    eyebrow: "Mission Control · Candidate programme",
    title: "Train for worlds no biologist has seen.",
    description: "Change a target planet, observe how it responds, predict survival pressures, and compare your decisions with a reproducible model.",
    available: "1 mission available",
    missionTitle: "Mission 01 · Vespera b",
    missionDescription: "Create an experimental Vespera variant and design a plausible survival strategy before the simulation reveals its constraints.",
    duration: "Estimated training time · 3 minutes",
    begin: "Open mission briefing",
    firstTime: "Your mission in four moves",
    steps: ["Read the objective", "Build and observe a world variant", "Commit multiple-choice decisions", "Run, review, and revise"],
  },
  mission: {
    eyebrow: "Incoming mission · Vespera-01",
    title: "First, understand the target. Then make it your experiment.",
    planet: "Target: Vespera b",
    objectiveLabel: "Mission objective",
    objective: "Create a controlled planetary variant, predict the pressures it will produce, and select adaptations for a plausible complex organism under ruleset 0.2.0.",
    briefing: "The values below are the verified mission baseline. In the World Lab you may change every supplied environmental input. Your changes create a separate experiment and never overwrite mission telemetry.",
    candidateTask: "You do not need to write scientific prose. The interface will guide you through pressure, adaptation, and strategy choices.",
    factsTitle: "Verified baseline telemetry",
    facts: { gravity: "Gravity", pressure: "Local pressure", temperature: "Temperature", radiation: "Radiation", water: "Water access", habitat: "Habitat" },
    instructionsTitle: "What to do",
    instructions: ["Review the baseline", "Open the World Lab and change any inputs", "Watch the planet respond, then lock your variant", "Choose predicted pressures, adaptations, and one strategy", "Run the model and revise from evidence"],
    ruleset: "Ruleset 0.2.0 · educational model conventions",
    begin: "Open World Lab",
  },
  world: {
    eyebrow: "World Lab · Experimental variant",
    title: "Shape the planet before you predict its life.",
    instruction: "Every control updates the visual interpretation immediately. The transition is continuous; scientific conclusions remain hidden until you run the deterministic simulation.",
    controlsTitle: "Environment controls",
    atmosphereTitle: "Atmosphere and local conditions",
    energyTitle: "Energy and advanced inputs",
    previewTitle: "Live planet preview",
    previewNotice: "This hybrid scientific/cinematic view is a deterministic visual mapping, not a measured image or habitability result.",
    baseline: "Using mission baseline",
    variant: "Experimental variant active",
    reset: "Restore baseline",
    lock: "Lock variant and make decisions",
    invalid: "Adjust the highlighted input before continuing.",
    localValues: "Derived local values",
    temperatureRange: "Temperature range",
    oxygenPressure: "O₂ partial pressure",
    density: "Atmospheric density",
    notAvailable: "Not supplied",
    nitrogenBalance: "Nitrogen is automatically used as the balance gas.",
    parameters: {
      gravity: { label: "Gravity", influence: "Can shape support tissues, height, circulation, and locomotion." },
      pressure: { label: "Local pressure", influence: "Can shape gas exchange, body sealing, buoyancy, and sound." },
      oxygen: { label: "Oxygen", influence: "Together with pressure, determines oxygen partial pressure available for aerobic metabolism." },
      carbonDioxide: { label: "Carbon dioxide", influence: "Can shape atmospheric chemistry and potential carbon sources; this ruleset does not infer climate from it." },
      inertGas: { label: "Inert gases", influence: "Change composition but do not define a gas species or biological effect by themselves." },
      toxicGas: { label: "Broad toxic gases", influence: "Signals a possible chemical hazard without inventing a specific compound." },
      nitrogen: { label: "Nitrogen balance", influence: "Automatically fills the unassigned fraction so the composition stays valid." },
      molarMass: { label: "Mean molar mass", influence: "Combines with local pressure and temperature to derive atmospheric density." },
      temperature: { label: "Average temperature", influence: "Can shape metabolism, biochemistry, insulation, and cooling." },
      variation: { label: "Temperature half-range", influence: "Creates symmetric minimum and maximum temperatures that may cross tolerance limits." },
      radiation: { label: "Radiation dose rate", influence: "Can favour protection and cellular repair. Habitat labels do not reduce this value." },
      light: { label: "Light level", influence: "Can shape photosynthesis, pigmentation, sensing, and activity cycles." },
      water: { label: "Accessible water", influence: "Can shape water retention, skin, reproduction, metabolism, and dormancy." },
      habitat: { label: "Habitat", influence: "Changes the setting and possible behaviours, but never substitutes for physical inputs." },
      shielding: { label: "Shielding column mass", influence: "Records possible material shielding; ruleset 0.2.0 does not invent a universal attenuation factor." },
      geochemical: { label: "Geochemical energy", influence: "May support an alternative energy pathway only when electron acceptors are also supplied." },
      acceptors: { label: "Electron acceptors", influence: "Explicit chemistry prevents the model from inventing unsupported metabolism." },
    },
    habitats: { "open surface": "Open surface", desert: "Desert", "shallow water": "Shallow water", "deep ocean": "Deep ocean", cave: "Cave", "forest-like biome": "Forest-like biome", "ice surface": "Ice surface", "high atmosphere": "High atmosphere" },
    geochemicalLevels: { none: "None", low: "Low", moderate: "Moderate", high: "High" },
    acceptorNames: { nitrate: "Nitrate", sulfate: "Sulfate", ferricIron: "Ferric iron", carbonDioxide: "Carbon dioxide" },
  },
  decisions: {
    eyebrow: "Commit before reveal",
    title: "Make your mission decisions.",
    instruction: "Your locked planet remains visible. Select what you predict—no written answer is required.",
    worldSummary: "Locked world variant",
    editWorld: "Edit variant",
    pressureTitle: "1 · Which pressures will the model detect?",
    pressureHint: "Choose one or more. These are predictions, not revealed results.",
    adaptationTitle: "2 · Which adaptations could help?",
    adaptationHint: "Choose up to six. Some options are intentionally unsupported.",
    strategyTitle: "3 · Which overall strategy would you investigate?",
    strategyHint: "Choose one. The strategy is interpretive and is not scored by ruleset 0.2.0.",
    validation: "Choose at least one pressure, one adaptation, and one strategy.",
    commit: "Commit decisions",
    committed: "Decisions committed before simulation results were revealed",
  },
  strategies: {
    surfaceConservation: { title: "Conserve on the surface", description: "Prioritise compact form, protected reproduction, and low resource loss." },
    shelterSeeking: { title: "Seek environmental shelter", description: "Use behavioural shelter without assuming that habitat alone reduces radiation dose." },
    mobileForaging: { title: "Mobile resource foraging", description: "Trade higher energy demand for access to scattered water or nutrients." },
    aerialDispersal: { title: "Aerial dispersal", description: "Investigate lift or passive dispersal using local density, gravity, and body cost." },
  },
  simulation: {
    eyebrow: "Deterministic simulation",
    title: "Test the locked experiment.",
    ready: "Ruleset 0.2.0 will validate the locked world, derive local facts, and evaluate four named conventions. Identical input produces identical output.",
    run: "Run simulation",
    running: "Calculating environmental pressures",
    outcomeLabel: "Model outcome",
    outcome: "Conditionally plausible complex life",
    rulesetLabel: "Ruleset",
    normalizedFacts: "Normalized facts",
    pressureTitle: "Environmental pressures",
    organismTitle: "Adaptation candidates",
    candidateNotice: "Structured model output—not a generated species or illustration.",
    comparisonTitle: "Decision comparison",
    alignment: "Combined alignment",
    pressureAccuracy: "Pressure predictions",
    supported: "Supported",
    missed: "Missed",
    unsupported: "Unsupported",
    none: "None under the four implemented rules",
    instructor: "Request Mission Instructor debrief",
  },
  debrief: {
    eyebrow: "Mission Instructor",
    title: "Review the evidence, then choose your revision.",
    loading: "Preparing a validated debrief…",
    liveSource: "Live structured response from GPT-5.6",
    fallbackSource: "Deterministic local fallback",
    fallbackNotice: "GPT-5.6 was not available for this run. This validated local review is not AI-generated.",
    evidence: "Evidence",
    tradeOffs: "Biological trade-offs",
    question: "Instructor question",
    experiment: "Recommended experiment",
    revisionTitle: "Evidence-based revision",
    revisionInstruction: "Select calculated pressures you relied on, then choose how the evidence changes your decision. No written response is required.",
    evidenceLabel: "Evidence used",
    conclusionLabel: "My conclusion",
    revisionValidation: "Choose one conclusion to complete the mission.",
    submit: "Complete mission",
    error: "The debrief could not be loaded. Your experiment and decisions are preserved.",
    retry: "Retry debrief",
  },
  revisionConclusions: {
    strengthenHypothesis: { title: "Strengthen my original hypothesis", description: "The calculated pressures largely support my choices." },
    changeAdaptations: { title: "Change the adaptations", description: "The evidence shows that different biological features need priority." },
    changeStrategy: { title: "Change the overall strategy", description: "The world suggests a different way of occupying the habitat." },
  },
  progress: {
    eyebrow: "Competency progress",
    title: "Mission 01 complete.",
    completed: "A training record was created for this browser session.",
    archiveTitle: "Research Archive",
    archiveEntry: "Vespera b experimental-variant assessment",
    sessionOnly: "Session only · this record resets when the page reloads.",
    competencyTitle: "Competency Profile",
    hypothesisFormation: "Decision alignment",
    adaptationAnalysis: "Adaptation analysis",
    evidenceUse: "Evidence use",
    certification: "Certification stage",
    candidate: "Candidate",
    nextTitle: "Next mission",
    nextDescription: "A mission library and persistent certification path are outside this vertical slice.",
    todo: "TODO · Next mission not implemented",
    repeat: "Return to Mission Control",
  },
  adaptations: {
    compactBody: { title: "Compact body plan", description: "Reduces leverage and structural load under higher gravity." },
    reinforcedSupport: { title: "Reinforced support tissues", description: "Increases resistance to sustained gravitational loading." },
    thermalBuffering: { title: "Thermal buffering", description: "Moderates exposure to calculated temperature extremes." },
    radiationProtection: { title: "Radiation-protective outer layer", description: "May reduce biological damage from elevated exposure." },
    cellularRepair: { title: "Enhanced cellular repair", description: "Supports recovery from radiation-related molecular damage." },
    waterConservation: { title: "Closed-loop water conservation", description: "Limits water loss in a constrained environment." },
    protectedReproduction: { title: "Protected reproduction", description: "Shields water-dependent early development." },
    aerialFlight: { title: "Sustained aerial flight", description: "A potentially costly locomotion strategy under higher gravity." },
    permeableSkin: { title: "Highly permeable skin", description: "Improves exchange but increases water-loss risk." },
  },
  pressures: {
    highGravity: { title: "High-gravity loading", description: "Triggered at or above the 1.5 g model convention." },
    thermalRange: { title: "Thermal extremes", description: "Triggered when the symmetric range reaches 0°C or 40°C." },
    radiationExposure: { title: "Elevated radiation", description: "Triggered at or above 0.1 mSv/h without habitat-based attenuation." },
    limitedWater: { title: "Limited accessible water", description: "Triggered at or below 0.40 relative availability." },
  },
  severity: { moderate: "Moderate", high: "High" },
  footer: "Educational plausibility model · Calculated facts, learner decisions, visual interpretation, and AI explanation remain separate",
};

const polish: Copy = {
  document: {
    title: "Xenogenesis Lab | Centrum Misji",
    description: "Eksploruj planetę, zatwierdzaj decyzje misyjne i sprawdzaj je deterministycznym modelem astrobiologicznym.",
  },
  language: { label: "Język", english: "Angielski", polish: "Polski" },
  system: {
    bootTitle: "XENOGENESIS LAB",
    bootSubtitle: "System szkolenia misji astrobiologicznych",
    bootSteps: ["Rdzeń zasilania aktywny", "Wczytywanie zestawu reguł 0.2.0", "Weryfikacja archiwum misji", "Uruchamianie Centrum Misji"],
    bootReady: "SYSTEM GOTOWY",
    skip: "Pomiń uruchamianie",
    enter: "Wejdź do Centrum Misji",
  },
  header: { subtitle: "Centrum Misji", mission: "Misja treningowa 01", home: "Strona główna Centrum Misji", reset: "Resetuj ćwiczenie" },
  stages: { briefing: "Odprawa", world: "Laboratorium Świata", decisions: "Decyzje", simulation: "Symulacja", debrief: "Omówienie", progress: "Postęp" },
  stageNavigation: "Etapy treningu misyjnego",
  provenance: { baseline: "Dane bazowe misji", variant: "Wariant eksperymentalny", hypothesis: "Twoje decyzje", calculated: "Wynik obliczeń", ai: "Interpretacja GPT-5.6", local: "Lokalna analiza treningowa", visual: "Interpretacja wizualna" },
  home: {
    eyebrow: "Centrum Misji · Program kandydacki",
    title: "Trenuj przed wyprawą do światów, których nie widział żaden biolog.",
    description: "Zmieniaj planetę docelową, obserwuj jej reakcję, przewiduj presje środowiska i porównuj decyzje z powtarzalnym modelem.",
    available: "Dostępna 1 misja",
    missionTitle: "Misja 01 · Vespera b",
    missionDescription: "Utwórz eksperymentalny wariant Vespery i zaprojektuj wiarygodną strategię przetrwania przed ujawnieniem ograniczeń przez symulację.",
    duration: "Szacowany czas treningu · 3 minuty",
    begin: "Otwórz odprawę misyjną",
    firstTime: "Twoja misja w czterech ruchach",
    steps: ["Przeczytaj cel", "Zbuduj i obserwuj wariant świata", "Zatwierdź decyzje wielokrotnego wyboru", "Uruchom, przeanalizuj i popraw"],
  },
  mission: {
    eyebrow: "Nadchodząca misja · Vespera-01",
    title: "Najpierw poznaj cel. Potem przekształć go w swój eksperyment.",
    planet: "Cel: Vespera b",
    objectiveLabel: "Cel misji",
    objective: "Utwórz kontrolowany wariant planety, przewidź wynikające z niego presje i wybierz adaptacje wiarygodnego złożonego organizmu w zestawie reguł 0.2.0.",
    briefing: "Poniższe wartości to zweryfikowane dane bazowe misji. W Laboratorium Świata możesz zmienić każdy dostarczony parametr środowiska. Zmiany tworzą osobny eksperyment i nigdy nie nadpisują telemetrii misji.",
    candidateTask: "Nie musisz pisać tekstu naukowego. Interfejs poprowadzi cię przez wybór presji, adaptacji i strategii.",
    factsTitle: "Zweryfikowana telemetria bazowa",
    facts: { gravity: "Grawitacja", pressure: "Ciśnienie lokalne", temperature: "Temperatura", radiation: "Promieniowanie", water: "Dostęp do wody", habitat: "Siedlisko" },
    instructionsTitle: "Co masz zrobić",
    instructions: ["Przejrzyj dane bazowe", "Otwórz Laboratorium Świata i zmień dowolne dane", "Obserwuj planetę, a następnie zablokuj wariant", "Wybierz przewidywane presje, adaptacje i jedną strategię", "Uruchom model i popraw decyzję na podstawie dowodów"],
    ruleset: "Zestaw reguł 0.2.0 · edukacyjne konwencje modelu",
    begin: "Otwórz Laboratorium Świata",
  },
  world: {
    eyebrow: "Laboratorium Świata · Wariant eksperymentalny",
    title: "Ukształtuj planetę, zanim przewidzisz jej życie.",
    instruction: "Każde sterowanie natychmiast aktualizuje interpretację wizualną. Przejście jest płynne; wnioski naukowe pozostają ukryte do uruchomienia symulacji deterministycznej.",
    controlsTitle: "Sterowanie środowiskiem",
    atmosphereTitle: "Atmosfera i warunki lokalne",
    energyTitle: "Energia i dane zaawansowane",
    previewTitle: "Podgląd planety na żywo",
    previewNotice: "Ten hybrydowy widok naukowo-filmowy jest deterministycznym odwzorowaniem wizualnym, a nie zmierzonym obrazem ani wynikiem zdatności do życia.",
    baseline: "Używasz danych bazowych misji",
    variant: "Wariant eksperymentalny aktywny",
    reset: "Przywróć dane bazowe",
    lock: "Zablokuj wariant i podejmij decyzje",
    invalid: "Popraw zaznaczone dane przed kontynuacją.",
    localValues: "Wyprowadzone wartości lokalne",
    temperatureRange: "Zakres temperatury",
    oxygenPressure: "Ciśnienie cząstkowe O₂",
    density: "Gęstość atmosfery",
    notAvailable: "Nie podano",
    nitrogenBalance: "Azot automatycznie wypełnia pozostałą część składu.",
    parameters: {
      gravity: { label: "Grawitacja", influence: "Może kształtować tkanki podporowe, wysokość, krążenie i lokomocję." },
      pressure: { label: "Ciśnienie lokalne", influence: "Może kształtować wymianę gazową, szczelność ciała, wyporność i dźwięk." },
      oxygen: { label: "Tlen", influence: "Wraz z ciśnieniem określa ciśnienie cząstkowe tlenu dostępnego dla metabolizmu tlenowego." },
      carbonDioxide: { label: "Dwutlenek węgla", influence: "Może kształtować chemię atmosfery i źródła węgla; ten zestaw reguł nie wyprowadza z niego klimatu." },
      inertGas: { label: "Gazy obojętne", influence: "Zmieniają skład, ale same nie określają gatunku gazu ani efektu biologicznego." },
      toxicGas: { label: "Ogólne gazy toksyczne", influence: "Sygnalizują możliwe zagrożenie chemiczne bez wymyślania konkretnego związku." },
      nitrogen: { label: "Bilans azotu", influence: "Automatycznie wypełnia nieprzypisaną część, aby skład pozostał prawidłowy." },
      molarMass: { label: "Średnia masa molowa", influence: "Wraz z lokalnym ciśnieniem i temperaturą wyznacza gęstość atmosfery." },
      temperature: { label: "Średnia temperatura", influence: "Może kształtować metabolizm, biochemię, izolację i chłodzenie." },
      variation: { label: "Połowa zakresu temperatury", influence: "Tworzy symetryczne minimum i maksimum, które mogą przekraczać granice tolerancji." },
      radiation: { label: "Moc dawki promieniowania", influence: "Może sprzyjać ochronie i naprawie komórkowej. Etykieta siedliska nie zmniejsza tej wartości." },
      light: { label: "Poziom światła", influence: "Może kształtować fotosyntezę, pigmentację, zmysły i cykle aktywności." },
      water: { label: "Dostępna woda", influence: "Może kształtować retencję wody, skórę, rozmnażanie, metabolizm i uśpienie." },
      habitat: { label: "Siedlisko", influence: "Zmienia otoczenie i możliwe zachowania, ale nigdy nie zastępuje danych fizycznych." },
      shielding: { label: "Masa kolumnowa osłony", influence: "Rejestruje możliwą osłonę materiałową; zestaw 0.2.0 nie wymyśla uniwersalnego tłumienia." },
      geochemical: { label: "Energia geochemiczna", influence: "Może wspierać alternatywną ścieżkę energii tylko przy podanych akceptorach elektronów." },
      acceptors: { label: "Akceptory elektronów", influence: "Jawna chemia zapobiega wymyślaniu przez model nieuzasadnionego metabolizmu." },
    },
    habitats: { "open surface": "Otwarta powierzchnia", desert: "Pustynia", "shallow water": "Płytka woda", "deep ocean": "Głęboki ocean", cave: "Jaskinia", "forest-like biome": "Biom przypominający las", "ice surface": "Powierzchnia lodowa", "high atmosphere": "Wysoka atmosfera" },
    geochemicalLevels: { none: "Brak", low: "Niska", moderate: "Umiarkowana", high: "Wysoka" },
    acceptorNames: { nitrate: "Azotany", sulfate: "Siarczany", ferricIron: "Żelazo(III)", carbonDioxide: "Dwutlenek węgla" },
  },
  decisions: {
    eyebrow: "Zatwierdź przed ujawnieniem",
    title: "Podejmij decyzje misyjne.",
    instruction: "Zablokowana planeta pozostaje widoczna. Wybierz przewidywania — nie musisz niczego pisać.",
    worldSummary: "Zablokowany wariant świata",
    editWorld: "Edytuj wariant",
    pressureTitle: "1 · Jakie presje wykryje model?",
    pressureHint: "Wybierz co najmniej jedną. To przewidywania, a nie ujawnione wyniki.",
    adaptationTitle: "2 · Które adaptacje mogą pomóc?",
    adaptationHint: "Wybierz do sześciu. Niektóre opcje celowo nie mają poparcia.",
    strategyTitle: "3 · Którą ogólną strategię zbadasz?",
    strategyHint: "Wybierz jedną. Strategia jest interpretacją i nie jest punktowana przez zestaw 0.2.0.",
    validation: "Wybierz co najmniej jedną presję, jedną adaptację i jedną strategię.",
    commit: "Zatwierdź decyzje",
    committed: "Decyzje zatwierdzono przed ujawnieniem wyników symulacji",
  },
  strategies: {
    surfaceConservation: { title: "Oszczędzanie na powierzchni", description: "Priorytet dla zwartej budowy, chronionego rozmnażania i małych strat zasobów." },
    shelterSeeking: { title: "Poszukiwanie schronienia", description: "Wykorzystanie schronienia behawioralnego bez założenia, że samo siedlisko zmniejsza dawkę promieniowania." },
    mobileForaging: { title: "Mobilne poszukiwanie zasobów", description: "Wyższy koszt energii w zamian za dostęp do rozproszonej wody lub składników." },
    aerialDispersal: { title: "Rozprzestrzenianie w powietrzu", description: "Badanie siły nośnej lub biernego unoszenia z uwzględnieniem gęstości, grawitacji i kosztu ciała." },
  },
  simulation: {
    eyebrow: "Symulacja deterministyczna",
    title: "Sprawdź zablokowany eksperyment.",
    ready: "Zestaw 0.2.0 zweryfikuje zablokowany świat, wyprowadzi wartości lokalne i oceni cztery nazwane konwencje. Identyczne dane dają identyczny wynik.",
    run: "Uruchom symulację",
    running: "Obliczanie presji środowiskowych",
    outcomeLabel: "Wynik modelu",
    outcome: "Warunkowo prawdopodobne złożone życie",
    rulesetLabel: "Zestaw reguł",
    normalizedFacts: "Dane znormalizowane",
    pressureTitle: "Presje środowiskowe",
    organismTitle: "Kandydaci na adaptacje",
    candidateNotice: "Ustrukturyzowany wynik modelu — nie wygenerowany gatunek ani ilustracja.",
    comparisonTitle: "Porównanie decyzji",
    alignment: "Łączna zgodność",
    pressureAccuracy: "Przewidywania presji",
    supported: "Z poparciem",
    missed: "Pominięte",
    unsupported: "Bez poparcia",
    none: "Brak w czterech zaimplementowanych regułach",
    instructor: "Poproś Instruktora Misji o omówienie",
  },
  debrief: {
    eyebrow: "Instruktor Misji",
    title: "Przeanalizuj dowody, a następnie wybierz poprawkę.",
    loading: "Przygotowywanie zweryfikowanego omówienia…",
    liveSource: "Ustrukturyzowana odpowiedź na żywo z GPT-5.6",
    fallbackSource: "Deterministyczny lokalny tryb zastępczy",
    fallbackNotice: "GPT-5.6 nie był dostępny w tej próbie. Ta zweryfikowana lokalna analiza nie została wygenerowana przez AI.",
    evidence: "Dowody",
    tradeOffs: "Kompromisy biologiczne",
    question: "Pytanie instruktora",
    experiment: "Zalecany eksperyment",
    revisionTitle: "Poprawka oparta na dowodach",
    revisionInstruction: "Wybierz obliczone presje, z których korzystasz, a następnie określ, jak dowody zmieniają decyzję. Nie musisz niczego pisać.",
    evidenceLabel: "Wykorzystane dowody",
    conclusionLabel: "Mój wniosek",
    revisionValidation: "Wybierz jeden wniosek, aby ukończyć misję.",
    submit: "Ukończ misję",
    error: "Nie udało się wczytać omówienia. Eksperyment i decyzje zostały zachowane.",
    retry: "Ponów omówienie",
  },
  revisionConclusions: {
    strengthenHypothesis: { title: "Wzmocnię pierwotną hipotezę", description: "Obliczone presje w dużym stopniu wspierają moje wybory." },
    changeAdaptations: { title: "Zmienię adaptacje", description: "Dowody wskazują, że inne cechy biologiczne powinny mieć pierwszeństwo." },
    changeStrategy: { title: "Zmienię ogólną strategię", description: "Świat sugeruje inny sposób zajęcia siedliska." },
  },
  progress: {
    eyebrow: "Postęp kompetencji",
    title: "Misja 01 ukończona.",
    completed: "Utworzono zapis treningu dla tej sesji przeglądarki.",
    archiveTitle: "Archiwum Badawcze",
    archiveEntry: "Ocena eksperymentalnego wariantu Vespery b",
    sessionOnly: "Tylko ta sesja · zapis znika po ponownym wczytaniu strony.",
    competencyTitle: "Profil Kompetencji",
    hypothesisFormation: "Zgodność decyzji",
    adaptationAnalysis: "Analiza adaptacji",
    evidenceUse: "Wykorzystanie dowodów",
    certification: "Etap certyfikacji",
    candidate: "Kandydat",
    nextTitle: "Następna misja",
    nextDescription: "Biblioteka misji i trwała ścieżka certyfikacji nie należą do tego wycinka pionowego.",
    todo: "TODO · Następna misja nie jest zaimplementowana",
    repeat: "Wróć do Centrum Misji",
  },
  adaptations: {
    compactBody: { title: "Zwarta budowa ciała", description: "Zmniejsza dźwignię i obciążenia konstrukcyjne przy wyższej grawitacji." },
    reinforcedSupport: { title: "Wzmocnione tkanki podporowe", description: "Zwiększają odporność na stałe obciążenia grawitacyjne." },
    thermalBuffering: { title: "Buforowanie cieplne", description: "Ogranicza ekspozycję na obliczone ekstrema temperatury." },
    radiationProtection: { title: "Warstwa chroniąca przed promieniowaniem", description: "Może zmniejszać szkody biologiczne przy podwyższonej ekspozycji." },
    cellularRepair: { title: "Wzmocniona naprawa komórkowa", description: "Wspiera usuwanie uszkodzeń molekularnych związanych z promieniowaniem." },
    waterConservation: { title: "Zamknięty obieg wody", description: "Ogranicza utratę wody w środowisku z jej niedoborem." },
    protectedReproduction: { title: "Chronione rozmnażanie", description: "Zabezpiecza zależne od wody wczesne etapy rozwoju." },
    aerialFlight: { title: "Długotrwały lot aktywny", description: "Potencjalnie kosztowna forma lokomocji przy wyższej grawitacji." },
    permeableSkin: { title: "Wysoce przepuszczalna skóra", description: "Ułatwia wymianę, ale zwiększa ryzyko utraty wody." },
  },
  pressures: {
    highGravity: { title: "Obciążenie wysoką grawitacją", description: "Uruchamiane od konwencji modelu 1,5 g." },
    thermalRange: { title: "Ekstrema temperatury", description: "Uruchamiane, gdy symetryczny zakres sięga 0°C lub 40°C." },
    radiationExposure: { title: "Podwyższone promieniowanie", description: "Uruchamiane od 0,1 mSv/h bez tłumienia wynikającego z etykiety siedliska." },
    limitedWater: { title: "Ograniczona dostępność wody", description: "Uruchamiane przy względnej dostępności 0,40 lub mniejszej." },
  },
  severity: { moderate: "Umiarkowana", high: "Wysoka" },
  footer: "Edukacyjny model prawdopodobieństwa · Obliczenia, decyzje ucznia, interpretacja wizualna i wyjaśnienie AI pozostają rozdzielone",
};

/** Complete, compile-time-checked translations for every supported language. */
export const COPY: Record<Language, Copy> = { en: english, pl: polish };

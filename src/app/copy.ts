import type { AdaptationId, PressureId } from "@/domain/mission/schema";

/** Supported interface languages. */
export type Language = "en" | "pl";

/** Stable stages in the single-mission training loop. */
export type MissionStage =
  | "briefing"
  | "hypothesis"
  | "simulation"
  | "debrief"
  | "progress";

type Copy = {
  document: { title: string; description: string };
  language: { label: string; english: string; polish: string };
  header: { subtitle: string; mission: string; reset: string };
  stages: Record<MissionStage, string>;
  stageNavigation: string;
  provenance: {
    hypothesis: string;
    calculated: string;
    ai: string;
    local: string;
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
    facts: Array<{ label: string; value: string }>;
    ruleset: string;
    begin: string;
  };
  hypothesis: {
    eyebrow: string;
    title: string;
    instruction: string;
    selectionTitle: string;
    selectionHint: string;
    reasoningLabel: string;
    reasoningPlaceholder: string;
    validation: string;
    commit: string;
    committed: string;
  };
  simulation: {
    eyebrow: string;
    title: string;
    ready: string;
    run: string;
    running: string;
    viabilityLabel: string;
    viability: string;
    rulesetLabel: string;
    normalizedFacts: string;
    facts: Array<{ key: "oxygen" | "temperature" | "radiation"; label: string }>;
    pressuresTitle: string;
    organismTitle: string;
    organismName: string;
    candidateNotice: string;
    comparisonTitle: string;
    alignment: string;
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
    revisionLabel: string;
    revisionPlaceholder: string;
    revisionValidation: string;
    submit: string;
    error: string;
    retry: string;
  };
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
    title: "Xenogenesis Lab | Mission 01",
    description: "Complete one evidence-based astrobiology training mission.",
  },
  language: { label: "Language", english: "English", polish: "Polish" },
  header: {
    subtitle: "Mission Control",
    mission: "Training mission 01",
    reset: "Reset mission",
  },
  stages: {
    briefing: "Briefing",
    hypothesis: "Hypothesis",
    simulation: "Simulation",
    debrief: "Debrief",
    progress: "Progress",
  },
  stageNavigation: "Mission training stages",
  provenance: {
    hypothesis: "Your hypothesis",
    calculated: "Calculated result",
    ai: "GPT-5.6 interpretation",
    local: "Local training review",
  },
  mission: {
    eyebrow: "Incoming mission · Vespera-01",
    title: "Design for survival before you see the model.",
    planet: "Target: Vespera b",
    objectiveLabel: "Mission objective",
    objective:
      "Predict which adaptations could support a complex surface organism under high gravity, thermal variation, elevated radiation, and limited water.",
    briefing:
      "Your survey team has one landing window. Review the measured environment, commit a biological hypothesis, then compare it with ruleset 0.2.0.",
    candidateTask:
      "You are evaluated on the causal link between environmental pressure and adaptation—not on inventing the most dramatic organism.",
    factsTitle: "Verified mission telemetry",
    facts: [
      { label: "Gravity", value: "1.7 g" },
      { label: "Local pressure", value: "1.2 atm" },
      { label: "Temperature", value: "18°C ± 24°C" },
      { label: "Radiation", value: "0.4 mSv/h" },
      { label: "Water access", value: "0.38 relative" },
      { label: "Habitat", value: "Open basalt surface" },
    ],
    ruleset: "Ruleset 0.2.0 · educational model conventions",
    begin: "Begin analysis",
  },
  hypothesis: {
    eyebrow: "Commit before reveal",
    title: "Form your survival hypothesis.",
    instruction:
      "Select up to six predicted adaptations and explain the environmental evidence behind your choices.",
    selectionTitle: "Predicted adaptations",
    selectionHint: "Choose at least one. Unsupported options are intentional.",
    reasoningLabel: "Scientific reasoning",
    reasoningPlaceholder:
      "Example: Because gravity is 1.7 g, I expect a low body profile that reduces structural load...",
    validation: "Select an adaptation and enter at least 20 characters of reasoning.",
    commit: "Commit hypothesis",
    committed: "Hypothesis committed · results were hidden at submission",
  },
  simulation: {
    eyebrow: "Deterministic simulation",
    title: "Test the committed hypothesis.",
    ready:
      "Ruleset 0.2.0 will normalize the mission telemetry and evaluate four named model conventions. Identical input produces identical output.",
    run: "Run simulation",
    running: "Calculating pressures",
    viabilityLabel: "Model outcome",
    viability: "Conditionally plausible complex life",
    rulesetLabel: "Ruleset",
    normalizedFacts: "Normalized facts",
    facts: [
      { key: "oxygen", label: "O₂ partial pressure" },
      { key: "temperature", label: "Temperature extremes" },
      { key: "radiation", label: "Radiation dose" },
    ],
    pressuresTitle: "Environmental pressures",
    organismTitle: "Organism pressure analysis",
    organismName: "Vespera surface candidate",
    candidateNotice:
      "This is structured adaptation analysis, not a generated species or image.",
    comparisonTitle: "Hypothesis comparison",
    alignment: "Alignment",
    supported: "Supported predictions",
    missed: "Missed adaptations",
    unsupported: "Unsupported predictions",
    none: "None",
    instructor: "Request Mission Instructor debrief",
  },
  debrief: {
    eyebrow: "Mission Instructor",
    title: "Review the evidence, then revise.",
    loading: "Preparing a validated debrief…",
    liveSource: "Live structured response from GPT-5.6",
    fallbackSource: "Deterministic local fallback",
    fallbackNotice:
      "GPT-5.6 was not available for this run. The debrief below is a validated local training review and is not AI-generated.",
    evidence: "Evidence",
    tradeOffs: "Biological trade-offs",
    question: "Instructor question",
    experiment: "Recommended experiment",
    revisionTitle: "Evidence-based revision",
    revisionInstruction:
      "Select at least one calculated pressure and explain how it changes or strengthens your original hypothesis.",
    evidenceLabel: "Evidence used",
    revisionLabel: "Revised reasoning",
    revisionPlaceholder:
      "The calculated thermal extremes change my original proposal because...",
    revisionValidation: "Select evidence and enter at least 20 characters.",
    submit: "Complete mission",
    error: "The debrief could not be loaded. Your simulation and hypothesis are preserved.",
    retry: "Retry debrief",
  },
  progress: {
    eyebrow: "Competency progress",
    title: "Mission 01 complete.",
    completed: "Training record created for this browser session.",
    archiveTitle: "Research Archive",
    archiveEntry: "Vespera b surface-survival assessment",
    sessionOnly: "Session only · this record resets when the page reloads.",
    competencyTitle: "Competency Profile",
    hypothesisFormation: "Hypothesis formation",
    adaptationAnalysis: "Adaptation analysis",
    evidenceUse: "Evidence use",
    certification: "Certification stage",
    candidate: "Candidate",
    nextTitle: "Next mission",
    nextDescription:
      "A mission library and persistent certification path are outside this vertical slice.",
    todo: "TODO · Next mission not implemented",
    repeat: "Repeat mission",
  },
  adaptations: {
    compactBody: {
      title: "Compact body plan",
      description: "Reduces leverage and structural load under higher gravity.",
    },
    reinforcedSupport: {
      title: "Reinforced support tissues",
      description: "Increases resistance to sustained gravitational loading.",
    },
    thermalBuffering: {
      title: "Thermal buffering",
      description: "Moderates exposure to the calculated temperature extremes.",
    },
    radiationProtection: {
      title: "Radiation-protective outer layer",
      description: "Reduces biological damage from elevated exposure.",
    },
    cellularRepair: {
      title: "Enhanced cellular repair",
      description: "Supports recovery from radiation-related molecular damage.",
    },
    waterConservation: {
      title: "Closed-loop water conservation",
      description: "Limits water loss in a water-constrained environment.",
    },
    protectedReproduction: {
      title: "Protected reproduction",
      description: "Shields water-dependent early development.",
    },
    aerialFlight: {
      title: "Sustained aerial flight",
      description: "A costly locomotion strategy under the supplied gravity.",
    },
    permeableSkin: {
      title: "Highly permeable skin",
      description: "Improves exchange but increases water-loss risk.",
    },
  },
  pressures: {
    highGravity: {
      title: "High-gravity loading",
      description: "1.7 g exceeds the 1.5 g ruleset convention.",
    },
    thermalRange: {
      title: "Thermal extremes",
      description: "The symmetric range reaches −6°C and 42°C.",
    },
    radiationExposure: {
      title: "Elevated radiation",
      description: "0.4 mSv/h exceeds the 0.1 mSv/h ruleset convention.",
    },
    limitedWater: {
      title: "Limited accessible water",
      description: "0.38 is below the 0.40 relative-water convention.",
    },
  },
  severity: { moderate: "Moderate", high: "High" },
  footer:
    "Educational plausibility model · Deterministic facts, learner reasoning, and AI interpretation remain separate",
};

const polish: Copy = {
  document: {
    title: "Xenogenesis Lab | Misja 01",
    description: "Ukończ jedną astrobiologiczną misję treningową opartą na dowodach.",
  },
  language: { label: "Język", english: "Angielski", polish: "Polski" },
  header: {
    subtitle: "Centrum Misji",
    mission: "Misja treningowa 01",
    reset: "Resetuj misję",
  },
  stages: {
    briefing: "Odprawa",
    hypothesis: "Hipoteza",
    simulation: "Symulacja",
    debrief: "Omówienie",
    progress: "Postęp",
  },
  stageNavigation: "Etapy treningu misyjnego",
  provenance: {
    hypothesis: "Twoja hipoteza",
    calculated: "Wynik obliczeń",
    ai: "Interpretacja GPT-5.6",
    local: "Lokalna analiza treningowa",
  },
  mission: {
    eyebrow: "Nadchodząca misja · Vespera-01",
    title: "Zaprojektuj przetrwanie, zanim poznasz wynik modelu.",
    planet: "Cel: Vespera b",
    objectiveLabel: "Cel misji",
    objective:
      "Przewidź adaptacje, które mogą wspierać złożony organizm powierzchniowy przy wysokiej grawitacji, wahaniach temperatury, podwyższonym promieniowaniu i ograniczonej wodzie.",
    briefing:
      "Zespół badawczy ma jedno okno lądowania. Przeanalizuj zmierzone środowisko, zatwierdź hipotezę biologiczną, a następnie porównaj ją z zestawem reguł 0.2.0.",
    candidateTask:
      "Oceniany jest związek przyczynowy między presją środowiska a adaptacją — nie najbardziej efektowny organizm.",
    factsTitle: "Zweryfikowana telemetria misji",
    facts: [
      { label: "Grawitacja", value: "1,7 g" },
      { label: "Ciśnienie lokalne", value: "1,2 atm" },
      { label: "Temperatura", value: "18°C ± 24°C" },
      { label: "Promieniowanie", value: "0,4 mSv/h" },
      { label: "Dostęp do wody", value: "0,38 względnie" },
      { label: "Siedlisko", value: "Otwarta powierzchnia bazaltowa" },
    ],
    ruleset: "Zestaw reguł 0.2.0 · edukacyjne konwencje modelu",
    begin: "Rozpocznij analizę",
  },
  hypothesis: {
    eyebrow: "Zatwierdź przed ujawnieniem",
    title: "Sformułuj hipotezę przetrwania.",
    instruction:
      "Wybierz do sześciu przewidywanych adaptacji i wyjaśnij, jakie dane środowiskowe uzasadniają wybór.",
    selectionTitle: "Przewidywane adaptacje",
    selectionHint: "Wybierz co najmniej jedną. Celowo dodano opcje bez poparcia.",
    reasoningLabel: "Rozumowanie naukowe",
    reasoningPlaceholder:
      "Przykład: Ponieważ grawitacja wynosi 1,7 g, oczekuję niskiej sylwetki zmniejszającej obciążenia...",
    validation: "Wybierz adaptację i wpisz co najmniej 20 znaków uzasadnienia.",
    commit: "Zatwierdź hipotezę",
    committed: "Hipoteza zatwierdzona · wyniki były ukryte podczas wysyłania",
  },
  simulation: {
    eyebrow: "Symulacja deterministyczna",
    title: "Sprawdź zatwierdzoną hipotezę.",
    ready:
      "Zestaw reguł 0.2.0 znormalizuje telemetrię i oceni cztery nazwane konwencje modelu. Identyczne dane dają identyczny wynik.",
    run: "Uruchom symulację",
    running: "Obliczanie presji",
    viabilityLabel: "Wynik modelu",
    viability: "Warunkowo prawdopodobne złożone życie",
    rulesetLabel: "Zestaw reguł",
    normalizedFacts: "Dane znormalizowane",
    facts: [
      { key: "oxygen", label: "Ciśnienie cząstkowe O₂" },
      { key: "temperature", label: "Ekstrema temperatury" },
      { key: "radiation", label: "Dawka promieniowania" },
    ],
    pressuresTitle: "Presje środowiskowe",
    organismTitle: "Analiza presji na organizm",
    organismName: "Kandydat powierzchniowy Vespery",
    candidateNotice:
      "To ustrukturyzowana analiza adaptacji, a nie wygenerowany gatunek ani obraz.",
    comparisonTitle: "Porównanie hipotezy",
    alignment: "Zgodność",
    supported: "Przewidywania z poparciem",
    missed: "Pominięte adaptacje",
    unsupported: "Przewidywania bez poparcia",
    none: "Brak",
    instructor: "Poproś Instruktora Misji o omówienie",
  },
  debrief: {
    eyebrow: "Instruktor Misji",
    title: "Przeanalizuj dowody, a następnie popraw hipotezę.",
    loading: "Przygotowywanie zweryfikowanego omówienia…",
    liveSource: "Ustrukturyzowana odpowiedź na żywo z GPT-5.6",
    fallbackSource: "Deterministyczny lokalny tryb zastępczy",
    fallbackNotice:
      "GPT-5.6 nie był dostępny w tej próbie. Poniżej znajduje się zweryfikowana lokalna analiza treningowa, która nie została wygenerowana przez AI.",
    evidence: "Dowody",
    tradeOffs: "Kompromisy biologiczne",
    question: "Pytanie instruktora",
    experiment: "Zalecany eksperyment",
    revisionTitle: "Poprawa oparta na dowodach",
    revisionInstruction:
      "Wybierz co najmniej jedną obliczoną presję i wyjaśnij, jak zmienia lub wzmacnia pierwotną hipotezę.",
    evidenceLabel: "Wykorzystane dowody",
    revisionLabel: "Poprawione rozumowanie",
    revisionPlaceholder:
      "Obliczone ekstrema temperatury zmieniają moją pierwotną propozycję, ponieważ...",
    revisionValidation: "Wybierz dowód i wpisz co najmniej 20 znaków.",
    submit: "Ukończ misję",
    error: "Nie udało się wczytać omówienia. Symulacja i hipoteza zostały zachowane.",
    retry: "Ponów omówienie",
  },
  progress: {
    eyebrow: "Postęp kompetencji",
    title: "Misja 01 ukończona.",
    completed: "Utworzono zapis treningu dla tej sesji przeglądarki.",
    archiveTitle: "Archiwum Badawcze",
    archiveEntry: "Ocena przetrwania na powierzchni Vespery b",
    sessionOnly: "Tylko ta sesja · zapis znika po ponownym wczytaniu strony.",
    competencyTitle: "Profil Kompetencji",
    hypothesisFormation: "Formułowanie hipotezy",
    adaptationAnalysis: "Analiza adaptacji",
    evidenceUse: "Wykorzystanie dowodów",
    certification: "Etap certyfikacji",
    candidate: "Kandydat",
    nextTitle: "Następna misja",
    nextDescription:
      "Biblioteka misji i trwała ścieżka certyfikacji nie należą do tego wycinka pionowego.",
    todo: "TODO · Następna misja nie jest zaimplementowana",
    repeat: "Powtórz misję",
  },
  adaptations: {
    compactBody: {
      title: "Zwarta budowa ciała",
      description: "Zmniejsza dźwignię i obciążenia konstrukcyjne przy wyższej grawitacji.",
    },
    reinforcedSupport: {
      title: "Wzmocnione tkanki podporowe",
      description: "Zwiększają odporność na stałe obciążenia grawitacyjne.",
    },
    thermalBuffering: {
      title: "Buforowanie cieplne",
      description: "Ogranicza ekspozycję na obliczone ekstrema temperatury.",
    },
    radiationProtection: {
      title: "Warstwa chroniąca przed promieniowaniem",
      description: "Zmniejsza szkody biologiczne wynikające z podwyższonej ekspozycji.",
    },
    cellularRepair: {
      title: "Wzmocniona naprawa komórkowa",
      description: "Wspiera usuwanie uszkodzeń molekularnych związanych z promieniowaniem.",
    },
    waterConservation: {
      title: "Zamknięty obieg wody",
      description: "Ogranicza utratę wody w środowisku z jej niedoborem.",
    },
    protectedReproduction: {
      title: "Chronione rozmnażanie",
      description: "Zabezpiecza zależne od wody wczesne etapy rozwoju.",
    },
    aerialFlight: {
      title: "Długotrwały lot aktywny",
      description: "Kosztowna forma lokomocji przy podanej grawitacji.",
    },
    permeableSkin: {
      title: "Wysoce przepuszczalna skóra",
      description: "Ułatwia wymianę, ale zwiększa ryzyko utraty wody.",
    },
  },
  pressures: {
    highGravity: {
      title: "Obciążenie wysoką grawitacją",
      description: "1,7 g przekracza konwencję zestawu reguł wynoszącą 1,5 g.",
    },
    thermalRange: {
      title: "Ekstrema temperatury",
      description: "Symetryczny zakres sięga od −6°C do 42°C.",
    },
    radiationExposure: {
      title: "Podwyższone promieniowanie",
      description: "0,4 mSv/h przekracza konwencję zestawu reguł 0,1 mSv/h.",
    },
    limitedWater: {
      title: "Ograniczona dostępność wody",
      description: "0,38 jest poniżej względnej konwencji dostępności wody 0,40.",
    },
  },
  severity: { moderate: "Umiarkowana", high: "Wysoka" },
  footer:
    "Edukacyjny model prawdopodobieństwa · Fakty obliczone, rozumowanie użytkownika i interpretacja AI pozostają rozdzielone",
};

/** Complete, compile-time-checked translations for every supported language. */
export const COPY: Record<Language, Copy> = { en: english, pl: polish };

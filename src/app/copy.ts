/** Supported interface languages for the initial localization pass. */
export type Language = "en" | "pl";

/** Stable identifiers for the selectable prototype habitats. */
export type HabitatId =
  | "basaltPlains"
  | "caveNetwork"
  | "oceanShelf"
  | "cloudLayer";

/** Stable identifiers for the four stages of the prototype journey. */
export type Screen = "configure" | "constraints" | "dossier" | "illustration";

type Copy = {
  document: {
    title: string;
    description: string;
  };
  language: {
    label: string;
    switchToEnglish: string;
    switchToPolish: string;
  };
  header: {
    subtitle: string;
    prototypeMode: string;
    resetWorld: string;
  };
  hero: {
    imageAlt: string;
    eyebrow: string;
    titleStart: string;
    titleHighlight: string;
    description: string;
  };
  screens: Record<Screen, string>;
  controls: {
    title: string;
    subtitle: string;
    gravity: string;
    pressure: string;
    averageTemperature: string;
    temperatureRange: string;
    radiationDose: string;
    stellarLight: string;
    waterAccess: string;
    habitat: string;
    visualOnly: string;
    explorePreview: string;
  };
  units: {
    relative: string;
  };
  habitats: Record<HabitatId, string>;
  configure: {
    eyebrow: string;
    heading: string;
    status: string;
    selectedWorld: string;
    canvasDescription: string;
    gravityAbbreviation: string;
    temperatureAbbreviation: string;
    waterAbbreviation: string;
    journeyMap: string;
    journey: Array<{ title: string; description: string }>;
    previewFlow: string;
    integrityTitle: string;
    integrityDescription: string;
    continue: string;
  };
  constraints: {
    eyebrow: string;
    heading: string;
    status: string;
    description: string;
    pressures: Array<{ title: string; detail: string; tone: string }>;
    readyTitle: string;
    readyDescription: string;
    dossierPreview: string;
  };
  dossier: {
    eyebrow: string;
    previewSuffix: string;
    status: string;
    plausibilityLabel: string;
    plausibilityStatement: string;
    description: string;
    habitatLabel: string;
    habitatValue: string;
    activityLabel: string;
    activityValue: string;
    adaptationLinks: string;
    adaptations: Array<{ title: string; category: string }>;
    imagePromptDescription: string;
    illustrationPreview: string;
  };
  illustration: {
    eyebrow: string;
    heading: string;
    status: string;
    queueLabel: string;
    title: string;
    description: string;
    stages: string[];
  };
  navigationLabel: string;
  footer: string;
};

/** Complete English copy used by the visual prototype. */
const english: Copy = {
  document: {
    title: "Xenogenesis Lab | Astrobiology Mission Training",
    description: "Train scientific reasoning for fictional xenobiology missions.",
  },
  language: {
    label: "Language",
    switchToEnglish: "Switch to English",
    switchToPolish: "Switch to Polish",
  },
  header: {
    subtitle: "Mission Control",
    prototypeMode: "Training prototype",
    resetWorld: "Reset exercise",
  },
  hero: {
    imageAlt: "Xenogenesis Lab: a planet with an orbital DNA motif against a star field",
    eyebrow: "AI-guided astrobiology mission training",
    titleStart: "Begin training.",
    titleHighlight: "Analyse a world.",
    description:
      "Train for fictional xenobiology missions by forming and testing scientific reasoning. This visual prototype previews the training flow before live simulation and AI instruction are connected.",
  },
  screens: {
    configure: "Briefing",
    constraints: "Pressure preview",
    dossier: "Organism preview",
    illustration: "Visual preview",
  },
  controls: {
    title: "Exercise parameters",
    subtitle: "Local prototype controls · no run yet",
    gravity: "Gravity",
    pressure: "Atmospheric pressure",
    averageTemperature: "Average temperature",
    temperatureRange: "Temperature range",
    radiationDose: "Radiation dose",
    stellarLight: "Stellar light",
    waterAccess: "Water access",
    habitat: "Dominant habitat",
    visualOnly:
      "Controls are visual only. No deterministic calculation or external request is performed.",
    explorePreview: "Preview exercise",
  },
  units: { relative: "rel." },
  habitats: {
    basaltPlains: "Storm-worn basalt plains",
    caveNetwork: "Subsurface cave network",
    oceanShelf: "Deep ocean shelf",
    cloudLayer: "High-atmosphere cloud layer",
  },
  configure: {
    eyebrow: "Mission briefing preview",
    heading: "Assess the target world.",
    status: "Briefing view",
    selectedWorld: "Target world",
    canvasDescription:
      "A preview canvas for the mission environment. Parameters on the left change this display only.",
    gravityAbbreviation: "GRAV",
    temperatureAbbreviation: "TEMP",
    waterAbbreviation: "WATER",
    journeyMap: "Training loop",
    journey: [
      { title: "Commit hypothesis", description: "Predict plausible survival adaptations." },
      { title: "Run simulation", description: "Reveal deterministic pressures and constraints." },
      { title: "Mission debrief", description: "Review evidence with the Mission Instructor." },
    ],
    previewFlow: "Preview pressure analysis",
    integrityTitle: "Prototype integrity",
    integrityDescription:
      "The target experience includes a committed hypothesis and Mission Instructor debrief. This prototype contains deliberate presentation samples until the rules engine and API routes are connected.",
    continue: "Continue preview",
  },
  constraints: {
    eyebrow: "Calculated pressure preview",
    heading: "A world of useful constraints.",
    status: "Preview only",
    description:
      "These cards demonstrate how deterministic findings will be presented after a run. They are not calculated from the controls yet.",
    pressures: [
      {
        title: "High gravity",
        detail: "1.7 g favours a lower centre of mass and reinforced support structures.",
        tone: "cyan",
      },
      {
        title: "Thermal range",
        detail: "Wide swings suggest thermal buffering, shelter use, or flexible activity cycles.",
        tone: "amber",
      },
      {
        title: "Surface radiation",
        detail: "The selected dose calls for protective pigmentation and reduced exposure.",
        tone: "violet",
      },
      {
        title: "Limited water",
        detail: "Water conservation and protected reproduction become important pressures.",
        tone: "blue",
      },
    ],
    readyTitle: "Ready to inspect the predicted organism?",
    readyDescription: "The next screen previews the organism-inspection stage.",
    dossierPreview: "View organism preview",
  },
  dossier: {
    eyebrow: "Organism inspection preview",
    previewSuffix: "preview",
    status: "No model call made",
    plausibilityLabel: "Plausibility statement",
    plausibilityStatement:
      "A compact, crepuscular organism plausible under this future model.",
    description:
      "A dossier will connect validated environmental constraints to every major trait. This specimen is placeholder content for the product flow.",
    habitatLabel: "Habitat",
    habitatValue: "Basalt shelf refuges",
    activityLabel: "Activity",
    activityValue: "Dawn / dusk",
    adaptationLinks: "Adaptation links",
    adaptations: [
      { title: "Armoured outer layer", category: "Water balance · Radiation defence" },
      { title: "Four-limbed low stance", category: "Structure · Locomotion" },
      { title: "Light-scattering crown", category: "Sensory system · Radiation defence" },
      { title: "Dawn-and-dusk activity", category: "Thermal regulation · Behaviour" },
    ],
    imagePromptDescription:
      "A controlled visual request will use validated dossier fields, never raw form values.",
    illustrationPreview: "Preview visual stage",
  },
  illustration: {
    eyebrow: "Visual representation preview",
    heading: "The visual specimen stage.",
    status: "Awaiting generation",
    queueLabel: "Illustration queue",
    title: "A verified organism will appear here.",
    description:
      "This frame establishes the specimen presentation and loading space. Image generation is intentionally not connected yet.",
    stages: ["Validated dossier", "Controlled prompt", "Scientific composition"],
  },
  navigationLabel: "Training exercise preview",
  footer: "Xenogenesis Lab · Astrobiology mission-training prototype",
};

/** Complete Polish translation of every visible prototype string. */
const polish: Copy = {
  document: {
    title: "Xenogenesis Lab | Trening misji astrobiologicznych",
    description: "Ćwicz rozumowanie naukowe dla fikcyjnych misji ksenobiologicznych.",
  },
  language: {
    label: "Język",
    switchToEnglish: "Przełącz na język angielski",
    switchToPolish: "Przełącz na język polski",
  },
  header: {
    subtitle: "Centrum misji",
    prototypeMode: "Prototyp treningu",
    resetWorld: "Resetuj ćwiczenie",
  },
  hero: {
    imageAlt: "Xenogenesis Lab: planeta z orbitalnym motywem DNA na tle gwiazd",
    eyebrow: "Astrobiologiczny trening misji wspierany przez AI",
    titleStart: "Rozpocznij trening.",
    titleHighlight: "Przeanalizuj świat.",
    description:
      "Ćwicz rozumowanie dla fikcyjnych misji ksenobiologicznych przez tworzenie i sprawdzanie hipotez. Ten prototyp wizualny pokazuje ścieżkę przed podłączeniem symulacji i instruktażu AI.",
  },
  screens: {
    configure: "Odprawa",
    constraints: "Podgląd presji",
    dossier: "Podgląd organizmu",
    illustration: "Podgląd wizualny",
  },
  controls: {
    title: "Parametry ćwiczenia",
    subtitle: "Lokalne sterowanie prototypem · bez uruchamiania analizy",
    gravity: "Grawitacja",
    pressure: "Ciśnienie atmosferyczne",
    averageTemperature: "Średnia temperatura",
    temperatureRange: "Zakres temperatur",
    radiationDose: "Dawka promieniowania",
    stellarLight: "Światło gwiazdy",
    waterAccess: "Dostęp do wody",
    habitat: "Dominujące siedlisko",
    visualOnly:
      "Elementy sterujące są wyłącznie wizualne. Nie wykonano obliczeń deterministycznych ani zewnętrznego żądania.",
    explorePreview: "Zobacz ćwiczenie",
  },
  units: { relative: "wzgl." },
  habitats: {
    basaltPlains: "Wietrzne bazaltowe równiny",
    caveNetwork: "Sieć podziemnych jaskiń",
    oceanShelf: "Szelf głębokiego oceanu",
    cloudLayer: "Warstwa chmur wysokiej atmosfery",
  },
  configure: {
    eyebrow: "Podgląd odprawy misyjnej",
    heading: "Oceń docelowy świat.",
    status: "Widok odprawy",
    selectedWorld: "Docelowy świat",
    canvasDescription:
      "Podglądowa przestrzeń dla środowiska misji. Parametry po lewej zmieniają tylko ten widok.",
    gravityAbbreviation: "GRAW",
    temperatureAbbreviation: "TEMP",
    waterAbbreviation: "WODA",
    journeyMap: "Pętla treningowa",
    journey: [
      { title: "Zatwierdź hipotezę", description: "Przewidź prawdopodobne adaptacje przetrwania." },
      { title: "Uruchom symulację", description: "Pokaż deterministyczne presje i ograniczenia." },
      { title: "Odprawa misyjna", description: "Omów dowody z Instruktorem Misji." },
    ],
    previewFlow: "Zobacz analizę presji",
    integrityTitle: "Rzetelność prototypu",
    integrityDescription:
      "Docelowa ścieżka obejmuje zatwierdzoną hipotezę i odprawę z Instruktorem Misji. Ten prototyp zawiera celowo przykładowe treści do czasu podłączenia silnika reguł i tras API.",
    continue: "Kontynuuj podgląd",
  },
  constraints: {
    eyebrow: "Podgląd obliczonych presji",
    heading: "Świat pełen istotnych ograniczeń.",
    status: "Tylko podgląd",
    description:
      "Te karty pokazują, jak będą prezentowane wyniki deterministyczne po uruchomieniu analizy. Nie są jeszcze obliczane na podstawie elementów sterujących.",
    pressures: [
      {
        title: "Wysoka grawitacja",
        detail: "1,7 g sprzyja niżej położonemu środkowi masy i wzmocnionym strukturom podporowym.",
        tone: "cyan",
      },
      {
        title: "Zakres temperatur",
        detail: "Duże wahania sugerują buforowanie cieplne, korzystanie ze schronienia lub elastyczne cykle aktywności.",
        tone: "amber",
      },
      {
        title: "Promieniowanie na powierzchni",
        detail: "Wybrana dawka wymaga ochronnej pigmentacji i ograniczonej ekspozycji.",
        tone: "violet",
      },
      {
        title: "Ograniczona dostępność wody",
        detail: "Oszczędzanie wody i chronione rozmnażanie stają się ważnymi presjami.",
        tone: "blue",
      },
    ],
    readyTitle: "Gotowy, aby zbadać przewidywany organizm?",
    readyDescription: "Kolejny ekran pokazuje podgląd etapu badania organizmu.",
    dossierPreview: "Zobacz podgląd organizmu",
  },
  dossier: {
    eyebrow: "Podgląd badania organizmu",
    previewSuffix: "podgląd",
    status: "Nie wykonano wywołania modelu",
    plausibilityLabel: "Ocena prawdopodobieństwa",
    plausibilityStatement:
      "Zwarty organizm aktywny o świcie i zmierzchu, możliwy zgodnie z przyszłą wersją modelu.",
    description:
      "Profil połączy zweryfikowane ograniczenia środowiskowe z każdą ważną cechą. Ten okaz jest treścią zastępczą dla przepływu produktu.",
    habitatLabel: "Siedlisko",
    habitatValue: "Schronienia na bazaltowym szelfie",
    activityLabel: "Aktywność",
    activityValue: "Świt / zmierzch",
    adaptationLinks: "Powiązania adaptacji",
    adaptations: [
      { title: "Opancerzona warstwa zewnętrzna", category: "Gospodarka wodna · Ochrona przed promieniowaniem" },
      { title: "Niska postawa na czterech kończynach", category: "Budowa · Lokomocja" },
      { title: "Korona rozpraszająca światło", category: "System sensoryczny · Ochrona przed promieniowaniem" },
      { title: "Aktywność o świcie i zmierzchu", category: "Termoregulacja · Zachowanie" },
    ],
    imagePromptDescription:
      "Kontrolowane żądanie wizualne użyje zweryfikowanych pól profilu, nigdy surowych wartości formularza.",
    illustrationPreview: "Zobacz etap wizualny",
  },
  illustration: {
    eyebrow: "Podgląd reprezentacji wizualnej",
    heading: "Etap wizualnego okazu.",
    status: "Oczekuje na generowanie",
    queueLabel: "Kolejka ilustracji",
    title: "Zweryfikowany organizm pojawi się tutaj.",
    description:
      "Ta ramka wyznacza prezentację okazu i miejsce na ładowanie. Generowanie obrazu nie jest jeszcze podłączone.",
    stages: ["Zweryfikowany profil", "Kontrolowany prompt", "Kompozycja naukowa"],
  },
  navigationLabel: "Podgląd ćwiczenia treningowego",
  footer: "Xenogenesis Lab · Prototyp treningu misji astrobiologicznych",
};

/** Maps each supported language to a complete, compile-time-checked copy set. */
export const COPY: Record<Language, Copy> = {
  en: english,
  pl: polish,
};

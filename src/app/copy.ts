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
    title: "Xenogenesis Lab | Interactive Astrobiology",
    description: "Explore how planetary conditions shape plausible alien life.",
  },
  language: {
    label: "Language",
    switchToEnglish: "Switch to English",
    switchToPolish: "Switch to Polish",
  },
  header: {
    subtitle: "Astrobiology console",
    prototypeMode: "Prototype mode",
    resetWorld: "Reset world",
  },
  hero: {
    imageAlt: "Xenogenesis Lab: a planet with an orbital DNA motif against a star field",
    eyebrow: "Interactive astrobiology laboratory",
    titleStart: "Configure a world.",
    titleHighlight: "Discover its pressures.",
    description:
      "Explore how planetary conditions can shape a plausible organism. This visual prototype demonstrates the journey before live simulation and AI generation are connected.",
  },
  screens: {
    configure: "Configure",
    constraints: "Constraints",
    dossier: "Dossier",
    illustration: "Illustration",
  },
  controls: {
    title: "World parameters",
    subtitle: "Local UI controls · no run yet",
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
    explorePreview: "Explore preview",
  },
  units: { relative: "rel." },
  habitats: {
    basaltPlains: "Storm-worn basalt plains",
    caveNetwork: "Subsurface cave network",
    oceanShelf: "Deep ocean shelf",
    cloudLayer: "High-atmosphere cloud layer",
  },
  configure: {
    eyebrow: "World briefing",
    heading: "Build the environment.",
    status: "Configuration view",
    selectedWorld: "Selected world",
    canvasDescription:
      "A preview canvas for the environmental story. Parameters on the left change this display only.",
    gravityAbbreviation: "GRAV",
    temperatureAbbreviation: "TEMP",
    waterAbbreviation: "WATER",
    journeyMap: "Journey map",
    journey: [
      { title: "Set conditions", description: "Choose a plausible planetary environment." },
      { title: "Read pressures", description: "Reveal deterministic constraints." },
      { title: "Inspect organism", description: "Connect traits to the model." },
    ],
    previewFlow: "See the preview flow",
    integrityTitle: "Prototype integrity",
    integrityDescription:
      "The interface is ready for the complete demo journey, but its readings and organism are deliberate presentation samples until the rules engine and API routes are connected.",
    continue: "Continue",
  },
  constraints: {
    eyebrow: "Environmental readout",
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
    readyTitle: "Ready to interpret the constraints?",
    readyDescription: "The next screen previews the validated organism dossier.",
    dossierPreview: "View dossier preview",
  },
  dossier: {
    eyebrow: "Organism dossier",
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
      "A controlled image prompt will use validated dossier fields, never raw form values.",
    illustrationPreview: "Preview illustration stage",
  },
  illustration: {
    eyebrow: "Scientific illustration",
    heading: "The visual specimen stage.",
    status: "Awaiting generation",
    queueLabel: "Illustration queue",
    title: "A verified organism will appear here.",
    description:
      "This frame establishes the specimen presentation and loading space. Image generation is intentionally not connected yet.",
    stages: ["Validated dossier", "Controlled prompt", "Scientific composition"],
  },
  navigationLabel: "Simulation journey",
  footer: "Xenogenesis Lab · Educational plausibility model · Interface prototype",
};

/** Complete Polish translation of every visible prototype string. */
const polish: Copy = {
  document: {
    title: "Xenogenesis Lab | Interaktywna astrobiologia",
    description: "Odkrywaj, jak warunki planetarne kształtują prawdopodobne formy obcego życia.",
  },
  language: {
    label: "Język",
    switchToEnglish: "Przełącz na język angielski",
    switchToPolish: "Przełącz na język polski",
  },
  header: {
    subtitle: "Konsola astrobiologiczna",
    prototypeMode: "Tryb prototypu",
    resetWorld: "Resetuj świat",
  },
  hero: {
    imageAlt: "Xenogenesis Lab: planeta z orbitalnym motywem DNA na tle gwiazd",
    eyebrow: "Interaktywne laboratorium astrobiologiczne",
    titleStart: "Skonfiguruj świat.",
    titleHighlight: "Poznaj jego presje środowiskowe.",
    description:
      "Sprawdź, jak warunki planetarne mogą kształtować prawdopodobny organizm. Ten prototyp wizualny pokazuje ścieżkę przed podłączeniem symulacji i generowania przez AI.",
  },
  screens: {
    configure: "Konfiguracja",
    constraints: "Ograniczenia",
    dossier: "Profil",
    illustration: "Ilustracja",
  },
  controls: {
    title: "Parametry świata",
    subtitle: "Lokalne sterowanie interfejsem · bez uruchamiania analizy",
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
    explorePreview: "Zobacz podgląd",
  },
  units: { relative: "wzgl." },
  habitats: {
    basaltPlains: "Wietrzne bazaltowe równiny",
    caveNetwork: "Sieć podziemnych jaskiń",
    oceanShelf: "Szelf głębokiego oceanu",
    cloudLayer: "Warstwa chmur wysokiej atmosfery",
  },
  configure: {
    eyebrow: "Opis świata",
    heading: "Zbuduj środowisko.",
    status: "Widok konfiguracji",
    selectedWorld: "Wybrany świat",
    canvasDescription:
      "Podglądowa przestrzeń dla historii środowiska. Parametry po lewej zmieniają tylko ten widok.",
    gravityAbbreviation: "GRAW",
    temperatureAbbreviation: "TEMP",
    waterAbbreviation: "WODA",
    journeyMap: "Mapa ścieżki",
    journey: [
      { title: "Ustaw warunki", description: "Wybierz prawdopodobne środowisko planetarne." },
      { title: "Odczytaj presje", description: "Pokaż deterministyczne ograniczenia." },
      { title: "Poznaj organizm", description: "Połącz cechy z modelem." },
    ],
    previewFlow: "Zobacz ścieżkę podglądu",
    integrityTitle: "Rzetelność prototypu",
    integrityDescription:
      "Interfejs jest gotowy na pełną ścieżkę demonstracyjną, ale jego odczyty i organizm są celowo przykładowe do czasu podłączenia silnika reguł i tras API.",
    continue: "Dalej",
  },
  constraints: {
    eyebrow: "Odczyt środowiska",
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
    readyTitle: "Gotowy, aby zinterpretować ograniczenia?",
    readyDescription: "Kolejny ekran pokazuje podgląd zweryfikowanego profilu organizmu.",
    dossierPreview: "Zobacz podgląd profilu",
  },
  dossier: {
    eyebrow: "Profil organizmu",
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
      "Kontrolowany prompt obrazu użyje zweryfikowanych pól profilu, nigdy surowych wartości formularza.",
    illustrationPreview: "Zobacz etap ilustracji",
  },
  illustration: {
    eyebrow: "Ilustracja naukowa",
    heading: "Etap wizualnego okazu.",
    status: "Oczekuje na generowanie",
    queueLabel: "Kolejka ilustracji",
    title: "Zweryfikowany organizm pojawi się tutaj.",
    description:
      "Ta ramka wyznacza prezentację okazu i miejsce na ładowanie. Generowanie obrazu nie jest jeszcze podłączone.",
    stages: ["Zweryfikowany profil", "Kontrolowany prompt", "Kompozycja naukowa"],
  },
  navigationLabel: "Ścieżka symulacji",
  footer: "Xenogenesis Lab · Edukacyjny model prawdopodobieństwa · Prototyp interfejsu",
};

/** Maps each supported language to a complete, compile-time-checked copy set. */
export const COPY: Record<Language, Copy> = {
  en: english,
  pl: polish,
};

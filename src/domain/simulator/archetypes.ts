import type { LifeTraitId, PlanetState } from "./schema";
import { runSurvivalSimulation } from "./simulate";

export type AdaptationArchetypeId =
  | "littoralGeneralist"
  | "pressureSwimmer"
  | "endolithicColony"
  | "aerialDisperser";

export type AdaptationArchetype = {
  id: AdaptationArchetypeId;
  traitIds: LifeTraitId[];
};

const SHARED_EXTREMOPHILE_TRAITS: LifeTraitId[] = [
  "cryoprotectiveChemistry",
  "heatShockProteins",
  "mineralShielding",
  "biofilmColony",
  "saltTolerance",
  "dormantCysts",
  "symbioticMetabolism",
  "regenerativeTissue",
  "waterConservation",
];

/** Chooses the one explicitly supported metabolic core available from the supplied world. */
function metabolicCore(planet: PlanetState): LifeTraitId[] {
  const world = planet.world;
  const oxygenPartialPressure =
    world.atmosphericPressureAtm * world.atmosphereComposition.oxygenFraction;
  if (oxygenPartialPressure >= 0.12) return ["oxygenRespiration", "photosynthesis"];
  if (oxygenPartialPressure >= 0.012) return ["lowOxygenMetabolism", "photosynthesis"];
  if (world.geochemicalEnergyAvailability !== "none" && world.electronAcceptors.length > 0) {
    return ["anaerobicMetabolism", "chemosynthesis"];
  }
  return [];
}

/** Returns four selectable, distinct stress-tolerant strategies when the planet supplies a metabolism. */
export function deriveAdaptationArchetypes(planet: PlanetState): AdaptationArchetype[] {
  const core = metabolicCore(planet);
  if (core.length === 0) return [];
  const shared = [...core, ...SHARED_EXTREMOPHILE_TRAITS];
  return [
    { id: "littoralGeneralist", traitIds: [...shared, "unicellular", "visibleVision", "rapidReproduction"] },
    { id: "pressureSwimmer", traitIds: [...shared, "unicellular", "aquaticMovement", "gills", "pressureResistance"] },
    { id: "endolithicColony", traitIds: [...shared, "unicellular", "spores", "chemicalSensing", "pressureResistance"] },
    { id: "aerialDisperser", traitIds: [...shared, "unicellular", "radialSymmetry", "simpleNeuralSystem", "socialCoordination"] },
  ];
}

/** Filters candidate strategies by the same deterministic survival result shown to learners. */
export function deriveViableAdaptationArchetypes(
  planet: PlanetState,
  initialPopulation = 120,
): AdaptationArchetype[] {
  return deriveAdaptationArchetypes(planet).filter(({ traitIds }) =>
    runSurvivalSimulation({ planet, traitIds, initialPopulation }).finalPopulation > 0,
  );
}

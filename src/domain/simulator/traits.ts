import type { LifeTraitId } from "./schema";

export type TraitCategory =
  | "body"
  | "physiology"
  | "senses"
  | "reproduction"
  | "intelligence";

export type TraitModifiers = Partial<{
  gravityTolerance: number;
  thermalCold: number;
  thermalHeat: number;
  radiationTolerance: number;
  hydration: number;
  pressureTolerance: number;
  oxygenEfficiency: number;
  alternativeMetabolism: number;
  lightEnergy: number;
  chemicalEnergy: number;
  movement: number;
  reproduction: number;
  adaptability: number;
  complexity: number;
}>;

export type TraitDefinition = {
  id: LifeTraitId;
  category: TraitCategory;
  cost: number;
  conflicts: LifeTraitId[];
  modifiers: TraitModifiers;
};

/** Versioned trait tradeoffs and modifiers used by simulator 1.7.0. */
export const LIFE_TRAITS: Record<LifeTraitId, TraitDefinition> = {
  compactBody: { id: "compactBody", category: "body", cost: 7, conflicts: ["largeBody"], modifiers: { gravityTolerance: 0.2, hydration: 0.04 } },
  largeBody: { id: "largeBody", category: "body", cost: 16, conflicts: ["compactBody"], modifiers: { thermalCold: 0.16, complexity: 0.09, oxygenEfficiency: -0.12 } },
  internalSkeleton: { id: "internalSkeleton", category: "body", cost: 11, conflicts: ["exoskeleton"], modifiers: { gravityTolerance: 0.13, movement: 0.08 } },
  exoskeleton: { id: "exoskeleton", category: "body", cost: 10, conflicts: ["internalSkeleton"], modifiers: { radiationTolerance: 0.08, hydration: 0.08, gravityTolerance: -0.06 } },
  aquaticMovement: { id: "aquaticMovement", category: "body", cost: 8, conflicts: ["terrestrialMovement", "aerialMovement"], modifiers: { movement: 0.18, pressureTolerance: 0.08 } },
  terrestrialMovement: { id: "terrestrialMovement", category: "body", cost: 8, conflicts: ["aquaticMovement", "aerialMovement"], modifiers: { movement: 0.14, gravityTolerance: 0.06 } },
  aerialMovement: { id: "aerialMovement", category: "body", cost: 18, conflicts: ["aquaticMovement", "terrestrialMovement"], modifiers: { movement: 0.24, gravityTolerance: -0.18, oxygenEfficiency: -0.08 } },
  unicellular: { id: "unicellular", category: "body", cost: 2, conflicts: ["multicellular", "graspingLimbs", "bipedalPosture"], modifiers: { complexity: -0.2, reproduction: 0.18, adaptability: 0.04 } },
  multicellular: { id: "multicellular", category: "body", cost: 10, conflicts: ["unicellular"], modifiers: { complexity: 0.16, reproduction: -0.04 } },
  bilateralSymmetry: { id: "bilateralSymmetry", category: "body", cost: 5, conflicts: ["radialSymmetry"], modifiers: { movement: 0.09, complexity: 0.04 } },
  radialSymmetry: { id: "radialSymmetry", category: "body", cost: 5, conflicts: ["bilateralSymmetry", "bipedalPosture"], modifiers: { adaptability: 0.06, movement: 0.03 } },
  gills: { id: "gills", category: "body", cost: 7, conflicts: ["lungs"], modifiers: { oxygenEfficiency: 0.12, movement: 0.05 } },
  lungs: { id: "lungs", category: "body", cost: 8, conflicts: ["gills"], modifiers: { oxygenEfficiency: 0.15, complexity: 0.04 } },
  graspingLimbs: { id: "graspingLimbs", category: "body", cost: 11, conflicts: ["unicellular"], modifiers: { movement: 0.08, adaptability: 0.1, complexity: 0.08 } },
  opposableDigits: { id: "opposableDigits", category: "body", cost: 9, conflicts: ["unicellular"], modifiers: { adaptability: 0.12, complexity: 0.09 } },
  oxygenRespiration: { id: "oxygenRespiration", category: "physiology", cost: 8, conflicts: ["lowOxygenMetabolism", "anaerobicMetabolism"], modifiers: { oxygenEfficiency: 0.16, complexity: 0.08 } },
  lowOxygenMetabolism: { id: "lowOxygenMetabolism", category: "physiology", cost: 13, conflicts: ["oxygenRespiration", "anaerobicMetabolism"], modifiers: { oxygenEfficiency: 0.25, complexity: -0.03 } },
  anaerobicMetabolism: { id: "anaerobicMetabolism", category: "physiology", cost: 15, conflicts: ["oxygenRespiration", "lowOxygenMetabolism"], modifiers: { alternativeMetabolism: 0.3, complexity: -0.12 } },
  photosynthesis: { id: "photosynthesis", category: "physiology", cost: 13, conflicts: ["chemosynthesis"], modifiers: { lightEnergy: 0.28, movement: -0.06 } },
  chemosynthesis: { id: "chemosynthesis", category: "physiology", cost: 15, conflicts: ["photosynthesis"], modifiers: { chemicalEnergy: 0.32, complexity: -0.04 } },
  radiationResistance: { id: "radiationResistance", category: "physiology", cost: 15, conflicts: [], modifiers: { radiationTolerance: 0.34, reproduction: -0.05 } },
  thermalInsulation: { id: "thermalInsulation", category: "physiology", cost: 11, conflicts: ["heatResistance"], modifiers: { thermalCold: 0.3, thermalHeat: -0.08 } },
  heatResistance: { id: "heatResistance", category: "physiology", cost: 11, conflicts: ["thermalInsulation"], modifiers: { thermalHeat: 0.3, hydration: -0.06 } },
  waterConservation: { id: "waterConservation", category: "physiology", cost: 11, conflicts: [], modifiers: { hydration: 0.3, reproduction: -0.03 } },
  pressureResistance: { id: "pressureResistance", category: "physiology", cost: 10, conflicts: [], modifiers: { pressureTolerance: 0.28, movement: -0.04 } },
  regenerativeTissue: { id: "regenerativeTissue", category: "physiology", cost: 15, conflicts: [], modifiers: { radiationTolerance: 0.12, adaptability: 0.12, reproduction: -0.05 } },
  hibernation: { id: "hibernation", category: "physiology", cost: 8, conflicts: [], modifiers: { thermalCold: 0.14, hydration: 0.1, adaptability: 0.08 } },
  visibleVision: { id: "visibleVision", category: "senses", cost: 4, conflicts: [], modifiers: { adaptability: 0.03 } },
  infraredVision: { id: "infraredVision", category: "senses", cost: 7, conflicts: [], modifiers: { adaptability: 0.08 } },
  echolocation: { id: "echolocation", category: "senses", cost: 9, conflicts: [], modifiers: { adaptability: 0.1, oxygenEfficiency: -0.03 } },
  chemicalSensing: { id: "chemicalSensing", category: "senses", cost: 6, conflicts: [], modifiers: { adaptability: 0.08, chemicalEnergy: 0.04 } },
  rapidReproduction: { id: "rapidReproduction", category: "reproduction", cost: 10, conflicts: ["parentalInvestment"], modifiers: { reproduction: 0.28, complexity: -0.12 } },
  protectedEggs: { id: "protectedEggs", category: "reproduction", cost: 7, conflicts: ["liveBirth", "spores"], modifiers: { reproduction: 0.09, hydration: 0.08 } },
  liveBirth: { id: "liveBirth", category: "reproduction", cost: 10, conflicts: ["protectedEggs", "spores"], modifiers: { reproduction: 0.06, complexity: 0.06 } },
  spores: { id: "spores", category: "reproduction", cost: 8, conflicts: ["protectedEggs", "liveBirth"], modifiers: { reproduction: 0.2, radiationTolerance: 0.06, complexity: -0.08 } },
  parentalInvestment: { id: "parentalInvestment", category: "reproduction", cost: 12, conflicts: ["rapidReproduction"], modifiers: { reproduction: -0.05, adaptability: 0.08, complexity: 0.12 } },
  simpleNeuralSystem: { id: "simpleNeuralSystem", category: "intelligence", cost: 5, conflicts: ["toolUsePotential"], modifiers: { adaptability: 0.05, complexity: 0.04 } },
  centralizedBrain: { id: "centralizedBrain", category: "intelligence", cost: 14, conflicts: ["simpleNeuralSystem", "unicellular"], modifiers: { adaptability: 0.17, complexity: 0.2, oxygenEfficiency: -0.05 } },
  bipedalPosture: { id: "bipedalPosture", category: "intelligence", cost: 10, conflicts: ["unicellular", "radialSymmetry", "aquaticMovement"], modifiers: { movement: 0.05, adaptability: 0.08, complexity: 0.08 } },
  socialCoordination: { id: "socialCoordination", category: "intelligence", cost: 11, conflicts: [], modifiers: { adaptability: 0.13, complexity: 0.1 } },
  toolUsePotential: { id: "toolUsePotential", category: "intelligence", cost: 19, conflicts: ["simpleNeuralSystem"], modifiers: { adaptability: 0.2, complexity: 0.22, oxygenEfficiency: -0.08 } },
  complexCommunication: { id: "complexCommunication", category: "intelligence", cost: 16, conflicts: [], modifiers: { adaptability: 0.18, complexity: 0.18, oxygenEfficiency: -0.05 } },
  adaptiveLearning: { id: "adaptiveLearning", category: "intelligence", cost: 17, conflicts: [], modifiers: { adaptability: 0.24, complexity: 0.18, oxygenEfficiency: -0.06 } },
  culturalMemory: { id: "culturalMemory", category: "intelligence", cost: 18, conflicts: ["unicellular", "simpleNeuralSystem"], modifiers: { adaptability: 0.28, complexity: 0.24, reproduction: -0.04 } },
};

/** Calculates the biological construction cost of selected traits. */
export function calculateTraitCost(traitIds: LifeTraitId[]): number {
  return traitIds.reduce((total, id) => total + LIFE_TRAITS[id].cost, 0);
}

/** Returns true when a candidate conflicts with an already selected trait. */
export function hasTraitConflict(selected: LifeTraitId[], candidate: LifeTraitId): boolean {
  return selected.some(
    (selectedId) =>
      LIFE_TRAITS[selectedId].conflicts.includes(candidate) ||
      LIFE_TRAITS[candidate].conflicts.includes(selectedId),
  );
}

/** Sums selected deterministic trait modifiers. */
export function sumTraitModifiers(traitIds: LifeTraitId[]): TraitModifiers {
  const result: TraitModifiers = {};
  for (const traitId of traitIds) {
    for (const [key, value] of Object.entries(LIFE_TRAITS[traitId].modifiers)) {
      const modifierKey = key as keyof TraitModifiers;
      result[modifierKey] = (result[modifierKey] ?? 0) + (value ?? 0);
    }
  }
  return result;
}

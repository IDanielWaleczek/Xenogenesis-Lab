import type { LifeTraitId } from "../../domain/simulator/schema";

/** Compile-time inventory proving that every selectable trait has a visual response. */
export const ORGANISM_VISUALIZED_TRAITS: Record<LifeTraitId, true> = {
  compactBody: true, largeBody: true, internalSkeleton: true, exoskeleton: true,
  aquaticMovement: true, terrestrialMovement: true, aerialMovement: true,
  unicellular: true, multicellular: true, bilateralSymmetry: true, radialSymmetry: true,
  gills: true, lungs: true, graspingLimbs: true, opposableDigits: true,
  oxygenRespiration: true, lowOxygenMetabolism: true, anaerobicMetabolism: true,
  photosynthesis: true, chemosynthesis: true, radiationResistance: true,
  thermalInsulation: true, heatResistance: true, waterConservation: true,
  pressureResistance: true, regenerativeTissue: true, hibernation: true,
  visibleVision: true, infraredVision: true, echolocation: true, chemicalSensing: true,
  rapidReproduction: true, protectedEggs: true, liveBirth: true, spores: true,
  parentalInvestment: true, simpleNeuralSystem: true, centralizedBrain: true,
  bipedalPosture: true, socialCoordination: true, toolUsePotential: true,
  complexCommunication: true, adaptiveLearning: true, culturalMemory: true,
};

import { describe, expect, it } from "vitest";

import { LIFE_TRAITS, TRAIT_CONFLICT_GROUPS } from "./traits";

const EXPECTED_CONFLICT_EDGES = [
  "aerialMovement:aquaticMovement",
  "aerialMovement:terrestrialMovement",
  "aquaticMovement:bipedalPosture",
  "aquaticMovement:terrestrialMovement",
  "bilateralSymmetry:radialSymmetry",
  "bipedalPosture:radialSymmetry",
  "centralizedBrain:simpleNeuralSystem",
  "centralizedBrain:unicellular",
  "chemosynthesis:photosynthesis",
  "compactBody:largeBody",
  "culturalMemory:simpleNeuralSystem",
  "culturalMemory:unicellular",
  "dormantCysts:liveBirth",
  "exoskeleton:internalSkeleton",
  "gills:lungs",
  "graspingLimbs:unicellular",
  "heatResistance:thermalInsulation",
  "liveBirth:protectedEggs",
  "liveBirth:spores",
  "lowOxygenMetabolism:oxygenRespiration",
  "anaerobicMetabolism:lowOxygenMetabolism",
  "anaerobicMetabolism:oxygenRespiration",
  "opposableDigits:unicellular",
  "parentalInvestment:rapidReproduction",
  "protectedEggs:spores",
  "simpleNeuralSystem:toolUsePotential",
  "multicellular:unicellular",
  "bipedalPosture:unicellular",
].sort();

const edgeKey = (first: string, second: string) => [first, second].sort().join(":");

describe("trait conflict catalogue", () => {
  it("keeps every declared conflict symmetric and audits the complete conflict graph", () => {
    const actualEdges = new Set<string>();

    for (const trait of Object.values(LIFE_TRAITS)) {
      expect(new Set(trait.conflicts).size).toBe(trait.conflicts.length);
      for (const conflictingId of trait.conflicts) {
        expect(LIFE_TRAITS[conflictingId].conflicts).toContain(trait.id);
        actualEdges.add(edgeKey(trait.id, conflictingId));
      }
    }

    expect([...actualEdges].sort()).toEqual(EXPECTED_CONFLICT_EDGES);
  });

  it("renders every independent alternative set as one selectable group", () => {
    expect(TRAIT_CONFLICT_GROUPS.map(({ id, traitIds }) => [id, traitIds])).toEqual([
      ["organismForm", ["unicellular", "multicellular"]],
      ["bodySize", ["compactBody", "largeBody"]],
      ["bodySupport", ["internalSkeleton", "exoskeleton"]],
      ["movement", ["aquaticMovement", "terrestrialMovement", "aerialMovement"]],
      ["symmetry", ["bilateralSymmetry", "radialSymmetry"]],
      ["respiration", ["gills", "lungs"]],
      ["metabolism", ["oxygenRespiration", "lowOxygenMetabolism", "anaerobicMetabolism"]],
      ["energyCapture", ["photosynthesis", "chemosynthesis"]],
      ["thermalStrategy", ["thermalInsulation", "heatResistance"]],
      ["reproductiveMode", ["protectedEggs", "liveBirth", "spores"]],
      ["reproductiveInvestment", ["rapidReproduction", "parentalInvestment"]],
    ]);
  });
});

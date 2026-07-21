import { describe, expect, it } from "vitest";

import { LifeTraitIdSchema } from "../../domain/simulator/schema";

import { ORGANISM_VISUALIZED_TRAITS } from "./organism-visual-traits";

describe("organism visual trait coverage", () => {
  it("keeps a visual response registered for every selectable trait", () => {
    expect(Object.keys(ORGANISM_VISUALIZED_TRAITS).sort()).toEqual(
      [...LifeTraitIdSchema.options].sort(),
    );
  });
});

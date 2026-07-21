import type { WorldContext } from "@/domain/world/context";

/** Advisory readiness facts shown before the learner starts life design. */
export type ExperimentReadiness = {
  water: "available" | "unavailable";
  energy: "available" | "unavailable";
  radiation: "manageable" | "elevated";
};

/**
 * Summarizes the current world without adding a second viability model.
 * The simulator remains the authority for the final survival calculation.
 */
export function deriveExperimentReadiness(
  context: WorldContext,
  hasMetabolicPathway: boolean,
): ExperimentReadiness {
  return {
    water: context.liquidWaterFraction > 0 ? "available" : "unavailable",
    energy: hasMetabolicPathway ? "available" : "unavailable",
    radiation: context.protectedRadiationMilliSvPerHour < 0.1
      ? "manageable"
      : "elevated",
  };
}

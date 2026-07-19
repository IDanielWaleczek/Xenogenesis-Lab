import { describe, expect, it } from "vitest";

import { GENESIS_MISSION } from "../simulator/mission";
import { deriveWorldInteractionState } from "./interactions";
import {
  applyWorldEngineeringControlChange,
  applyWorldParameterChange,
  deriveWorldEngineeringControlState,
} from "./engineering";

describe("world engineering preferences", () => {
  it("restores selected water after a temporarily incompatible temperature", () => {
    const withPressure = applyWorldParameterChange(
      GENESIS_MISSION.planet.world,
      "pressure",
      1,
    );
    const stableRange = applyWorldParameterChange(
      withPressure,
      "temperatureVariation",
      4,
    );
    const withWater = applyWorldParameterChange(stableRange, "water", 72);
    const hot = applyWorldParameterChange(withWater, "temperature", 120);

    expect(hot.waterAvailability).toBe(0.72);
    expect(deriveWorldInteractionState(hot).surfaceWaterFraction).toBe(0);
    expect(deriveWorldEngineeringControlState(hot, "water")).toMatchObject({
      disabled: true,
      displayedValue: 0,
      constraint: "surfaceWaterBoils",
    });

    const cooled = applyWorldParameterChange(hot, "temperature", 24);
    expect(cooled.waterAvailability).toBe(0.72);
    expect(deriveWorldInteractionState(cooled).liquidWaterFraction).toBeCloseTo(
      0.72,
      6,
    );
  });

  it("preserves humidity and gas preferences while pressure is zero", () => {
    let world = applyWorldParameterChange(
      GENESIS_MISSION.planet.world,
      "humidity",
      65,
    );
    world = applyWorldParameterChange(world, "oxygen", 21);
    world = applyWorldParameterChange(world, "water", 80);

    expect(world.atmosphericPressureAtm).toBe(0);
    expect(world.humidity).toBe(0.65);
    expect(world.atmosphereComposition.oxygenFraction).toBe(0.21);
    expect(world.waterAvailability).toBe(0.8);
    expect(deriveWorldInteractionState(world).effectiveHumidity).toBe(0);
    expect(deriveWorldEngineeringControlState(world, "oxygen")).toMatchObject({
      disabled: true,
      displayedValue: 0,
      constraint: "requiresAtmosphere",
    });
    expect(deriveWorldEngineeringControlState(world, "water").disabled).toBe(true);
    expect(deriveWorldEngineeringControlState(world, "humidity").disabled).toBe(true);

    world = applyWorldParameterChange(world, "pressure", 1);
    expect(world.humidity).toBe(0.65);
    expect(world.atmosphereComposition.oxygenFraction).toBe(0.21);
    expect(deriveWorldInteractionState(world).effectiveHumidity).toBeGreaterThan(0);
    expect(deriveWorldEngineeringControlState(world, "oxygen")).toMatchObject({
      disabled: false,
      displayedValue: 0.21,
    });
  });

  it("shows gas partial pressure while retaining the selected composition", () => {
    let world = applyWorldParameterChange(
      GENESIS_MISSION.planet.world,
      "pressure",
      1,
    );
    world = applyWorldParameterChange(world, "oxygen", 21);

    expect(deriveWorldEngineeringControlState(world, "oxygen").displayedValue)
      .toBeCloseTo(0.21, 8);

    world = applyWorldParameterChange(world, "pressure", 0.5);
    expect(world.atmosphereComposition.oxygenFraction).toBe(0.21);
    expect(deriveWorldEngineeringControlState(world, "oxygen").displayedValue)
      .toBeCloseTo(0.105, 8);

    world = applyWorldEngineeringControlChange(world, "oxygen", 0.08);
    expect(world.atmosphereComposition.oxygenFraction).toBeCloseTo(0.16, 8);

    world = applyWorldParameterChange(world, "pressure", 0);
    expect(world.atmosphereComposition.oxygenFraction).toBeCloseTo(0.16, 8);
    expect(deriveWorldEngineeringControlState(world, "oxygen")).toMatchObject({
      disabled: true,
      displayedValue: 0,
    });

    world = applyWorldParameterChange(world, "pressure", 1);
    expect(deriveWorldEngineeringControlState(world, "oxygen").displayedValue)
      .toBeCloseTo(0.16, 8);
  });

  it("edits partially expressed water and humidity without losing preferences", () => {
    let world = applyWorldParameterChange(
      GENESIS_MISSION.planet.world,
      "pressure",
      0.015,
    );
    world = applyWorldParameterChange(world, "temperatureVariation", 0);
    world = applyWorldParameterChange(world, "temperature", -10);
    world = applyWorldParameterChange(world, "water", 80);

    const waterControl = deriveWorldEngineeringControlState(world, "water");
    expect(waterControl.disabled).toBe(false);
    expect(waterControl.displayedValue).toBeGreaterThan(0);
    expect(waterControl.displayedValue).toBeLessThan(80);

    world = applyWorldEngineeringControlChange(
      world,
      "water",
      waterControl.displayedValue / 2,
    );
    expect(world.waterAvailability).toBeCloseTo(0.4, 6);

    world = applyWorldParameterChange(world, "humidity", 80);
    const humidityControl = deriveWorldEngineeringControlState(world, "humidity");
    expect(humidityControl.disabled).toBe(false);
    expect(humidityControl.displayedValue).toBeLessThan(80);

    world = applyWorldEngineeringControlChange(
      world,
      "humidity",
      humidityControl.displayedValue / 2,
    );
    expect(world.humidity).toBeCloseTo(0.4, 6);
  });

  it("does not rewrite pressure or temperature variation from gravity", () => {
    let world = applyWorldParameterChange(
      GENESIS_MISSION.planet.world,
      "pressure",
      5,
    );
    world = applyWorldParameterChange(world, "temperatureVariation", 4);
    world = applyWorldParameterChange(world, "gravity", 0.05);

    expect(world.atmosphericPressureAtm).toBe(5);
    expect(world.temperatureVariationC).toBe(4);
  });
});

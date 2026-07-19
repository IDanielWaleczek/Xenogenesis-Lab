import { describe, expect, it } from "vitest";

import { GENESIS_MISSION } from "../simulator/mission";
import {
  derivePlanetVisualizationState,
  deriveLatitudinalTemperatureC,
  deriveLocalWaterIceFraction,
  deriveMoltenRockFraction,
  deriveResetCameraLightAlignment,
  deriveSandClimateSuitability,
  deriveVegetationClimateSuitability,
} from "./visualization";

describe("planet visualization state", () => {
  it("shows no cloud or water layer for a dry world at any pressure", () => {
    const visual = derivePlanetVisualizationState(
      {
        ...GENESIS_MISSION.planet.world,
        atmosphericPressureAtm: 5,
        averageTemperatureC: 24,
        temperatureVariationC: 4,
        waterAvailability: 0,
        humidity: 0,
      },
      1,
    );

    expect(visual.surfaceWater).toBe(0);
    expect(visual.cloudCover).toBe(0);
  });

  it("keeps a narrow warm range free of ice", () => {
    const visual = derivePlanetVisualizationState(
      {
        ...GENESIS_MISSION.planet.world,
        atmosphericPressureAtm: 1,
        averageTemperatureC: 36,
        temperatureVariationC: 4,
        waterAvailability: 1,
      },
      1,
    );

    expect(visual.iceWater).toBe(0);
    expect(visual.liquidWater).toBeGreaterThan(0.99);
  });

  it("uses ice for the complete cold hydrosphere", () => {
    const visual = derivePlanetVisualizationState(
      {
        ...GENESIS_MISSION.planet.world,
        atmosphericPressureAtm: 1,
        averageTemperatureC: -40,
        temperatureVariationC: 4,
        waterAvailability: 1,
      },
      1,
    );

    expect(visual.iceWater).toBeGreaterThan(0.99);
    expect(visual.liquidWater).toBe(0);
  });

  it("does not show a green macroscopic biosphere at 87 to 95 degrees", () => {
    expect(deriveVegetationClimateSuitability(91, 4)).toBe(0);

    const visual = derivePlanetVisualizationState(
      {
        ...GENESIS_MISSION.planet.world,
        atmosphericPressureAtm: 5,
        averageTemperatureC: 91,
        temperatureVariationC: 4,
        waterAvailability: 1,
        humidity: 1,
      },
      1,
    );
    expect(visual.biosphere).toBe(0);
  });

  it("allows dry sand well before 60 degrees without treating frozen terrain as sand", () => {
    expect(deriveSandClimateSuitability(20, 4)).toBeGreaterThan(0.99);
    expect(deriveSandClimateSuitability(-40, 4)).toBe(0);
  });

  it("starts the reset camera on the illuminated hemisphere", () => {
    expect(deriveResetCameraLightAlignment()).toBeGreaterThan(0.6);
  });

  it("uses the full configured variation for a hotter equator and colder poles", () => {
    expect(deriveLatitudinalTemperatureC(20, 50, 0)).toBe(70);
    expect(deriveLatitudinalTemperatureC(20, 50, 0.5)).toBe(20);
    expect(deriveLatitudinalTemperatureC(20, 50, 1)).toBe(-30);
  });

  it("keeps a 41 degree equatorial ocean liquid while freezing cold polar water", () => {
    expect(deriveLatitudinalTemperatureC(1, 40, 0)).toBe(41);
    expect(deriveLatitudinalTemperatureC(1, 40, 1)).toBe(-39);
    expect(deriveLocalWaterIceFraction(1, 40, 0, 0.5)).toBe(0);
    expect(deriveLocalWaterIceFraction(1, 40, 1, 0.5)).toBe(1);
  });

  it("introduces molten basalt only at geologically extreme temperatures", () => {
    expect(deriveMoltenRockFraction(700, 0)).toBe(0);
    expect(deriveMoltenRockFraction(900, 0)).toBeGreaterThan(0);
    expect(deriveMoltenRockFraction(900, 0)).toBeLessThan(1);
    expect(deriveMoltenRockFraction(1_200, 0)).toBe(1);
  });

  it("changes clouds continuously with humidity", () => {
    const createVisual = (humidity: number) =>
      derivePlanetVisualizationState(
        {
          ...GENESIS_MISSION.planet.world,
          atmosphericPressureAtm: 1,
          averageTemperatureC: 24,
          temperatureVariationC: 4,
          waterAvailability: 1,
          humidity,
        },
        0,
      );

    expect(createVisual(0).cloudCover).toBe(0);
    expect(createVisual(0.5).cloudCover).toBeGreaterThan(0);
    expect(createVisual(1).cloudCover).toBeGreaterThan(
      createVisual(0.5).cloudCover,
    );
  });

  it("passes gradually protected radiation exposure to the renderer", () => {
    const createVisual = (magneticFieldStrengthEarth: number) =>
      derivePlanetVisualizationState(
        {
          ...GENESIS_MISSION.planet.world,
          radiationDoseRate: { value: 3, unit: "mSv/h" },
          magneticFieldStrengthEarth,
        },
        0,
      );

    expect(createVisual(0).radiation).toBe(1);
    expect(createVisual(0.5).radiation).toBeLessThan(1);
    expect(createVisual(1).radiation).toBeLessThan(createVisual(0.5).radiation);
  });

  it("uses incident radiation for aurora while magnetic protection lowers surface exposure", () => {
    const createVisual = (magneticFieldStrengthEarth: number) =>
      derivePlanetVisualizationState(
        {
          ...GENESIS_MISSION.planet.world,
          atmosphericPressureAtm: 1,
          radiationDoseRate: { value: 0.4, unit: "mSv/h" },
          magneticFieldStrengthEarth,
        },
        0,
      );
    const unmagnetized = createVisual(0);
    const magnetized = createVisual(1);

    expect(unmagnetized.aurora).toBe(0);
    expect(magnetized.aurora).toBeGreaterThan(0);
    expect(magnetized.radiation).toBeLessThan(unmagnetized.radiation);
  });
});

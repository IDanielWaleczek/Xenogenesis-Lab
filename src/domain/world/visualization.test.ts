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

  it("uses the full configured variation with a curved latitudinal climate gradient", () => {
    expect(deriveLatitudinalTemperatureC(20, 50, 0)).toBe(70);
    expect(deriveLatitudinalTemperatureC(20, 50, 0.5)).toBeGreaterThan(20);
    expect(deriveLatitudinalTemperatureC(20, 50, 0.5)).toBeLessThan(70);
    expect(deriveLatitudinalTemperatureC(20, 50, 1)).toBe(-30);
  });

  it("allows terrain variation to locally perturb intermediate latitudes", () => {
    const baseline = deriveLatitudinalTemperatureC(20, 50, 0.5);
    expect(deriveLatitudinalTemperatureC(20, 50, 0.5, -0.4)).toBeLessThan(baseline);
    expect(deriveLatitudinalTemperatureC(20, 50, 0.5, 0.4)).toBeGreaterThan(baseline);
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

    expect(createVisual(0).cloudCover).toBeGreaterThan(0.1);
    expect(createVisual(0.5).cloudCover).toBeGreaterThan(createVisual(0).cloudCover);
    expect(createVisual(1).cloudCover).toBeGreaterThan(
      createVisual(0.5).cloudCover,
    );
  });

  it("preserves substantial liquid water and cloud support for an Earth-like visual state", () => {
    const visual = derivePlanetVisualizationState(
      {
        ...GENESIS_MISSION.planet.world,
        gravityG: 1,
        atmosphericPressureAtm: 1,
        averageTemperatureC: 15,
        temperatureVariationC: 15,
        waterAvailability: 0.71,
        humidity: 0.6,
        magneticFieldStrengthEarth: 1,
        radiationDoseRate: { value: 0.0003, unit: "mSv/h" },
      },
      0,
    );

    expect(visual.surfaceWater).toBeGreaterThan(0.68);
    expect(visual.liquidWater).toBeGreaterThan(0.65);
    expect(visual.cloudCover).toBeGreaterThan(0.4);
    expect(visual.atmosphereDensity).toBeGreaterThan(0.5);
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

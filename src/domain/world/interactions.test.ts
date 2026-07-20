import { describe, expect, it } from "vitest";

import { GENESIS_MISSION } from "../simulator/mission";

import {
  deriveEffectiveRadiationDose,
  deriveWaterPhaseFractions,
  deriveWorldInteractionState,
  estimateWaterBoilingPointC,
  WATER_TRIPLE_POINT_PRESSURE_ATM,
} from "./interactions";

describe("world parameter interactions", () => {
  it("removes exposed water and clouds below the water triple-point pressure", () => {
    const state = deriveWorldInteractionState({
      ...GENESIS_MISSION.planet.world,
      atmosphericPressureAtm: 0,
      waterAvailability: 1,
      humidity: 1,
    });

    expect(state.hasAtmosphere).toBe(false);
    expect(state.supportsSurfaceWater).toBe(false);
    expect(state.surfaceWaterFraction).toBe(0);
    expect(state.effectiveHumidity).toBe(0);
    expect(state.cloudPotential).toBe(0);
    expect(state.unavailableWaterFraction).toBe(1);
  });

  it("approximates familiar pressure-dependent boiling points", () => {
    expect(estimateWaterBoilingPointC(1)).toBeCloseTo(100, 0);
    expect(estimateWaterBoilingPointC(5)).toBeCloseTo(152, 0);
    expect(
      estimateWaterBoilingPointC(WATER_TRIPLE_POINT_PRESSURE_ATM / 2),
    ).toBeNull();
  });

  it("blends water phases continuously at freezing and boiling boundaries", () => {
    const freezing = deriveWaterPhaseFractions(0, 0, 100);
    const belowFreezing = deriveWaterPhaseFractions(-1, 0, 100);
    const aboveFreezing = deriveWaterPhaseFractions(1, 0, 100);
    const boiling = deriveWaterPhaseFractions(100, 0, 100);

    expect(belowFreezing.ice).toBeGreaterThan(freezing.ice);
    expect(freezing.ice).toBeGreaterThan(aboveFreezing.ice);
    expect(freezing.ice + freezing.liquid + freezing.vapor).toBeCloseTo(1, 8);
    expect(boiling.vapor).toBeCloseTo(0.5, 8);
  });

  it("does not create ice anywhere for a 36 plus-or-minus 4 degree world", () => {
    const state = deriveWorldInteractionState({
      ...GENESIS_MISSION.planet.world,
      atmosphericPressureAtm: 1,
      averageTemperatureC: 36,
      temperatureVariationC: 4,
      waterAvailability: 1,
      humidity: 0.6,
    });

    expect(state.iceWaterFraction).toBe(0);
    expect(state.liquidWaterFraction).toBeGreaterThan(0.99);
  });

  it("freezes the complete exposed hydrosphere at minus 40 plus-or-minus 4 degrees", () => {
    const state = deriveWorldInteractionState({
      ...GENESIS_MISSION.planet.world,
      atmosphericPressureAtm: 1,
      averageTemperatureC: -40,
      temperatureVariationC: 4,
      waterAvailability: 0.8,
      humidity: 0.5,
    });

    expect(state.iceWaterFraction).toBeCloseTo(0.8, 6);
    expect(state.liquidWaterFraction).toBe(0);
    expect(state.vaporWaterFraction).toBe(0);
  });

  it("retains mixed phases when a large variation crosses the freezing point", () => {
    const state = deriveWorldInteractionState({
      ...GENESIS_MISSION.planet.world,
      atmosphericPressureAtm: 1,
      averageTemperatureC: -40,
      temperatureVariationC: 100,
      waterAvailability: 1,
    });

    expect(state.iceWaterFraction).toBeGreaterThan(0.5);
    expect(state.iceWaterFraction).toBeLessThan(0.8);
    expect(state.liquidWaterFraction).toBeGreaterThan(0.1);
  });

  it("moves one-atmosphere water into vapor well above its boiling point", () => {
    const state = deriveWorldInteractionState({
      ...GENESIS_MISSION.planet.world,
      atmosphericPressureAtm: 1,
      averageTemperatureC: 120,
      temperatureVariationC: 4,
      waterAvailability: 0.75,
      humidity: 0.8,
    });

    expect(state.surfaceWaterFraction).toBe(0);
    expect(state.vaporWaterFraction).toBeCloseTo(0.75, 6);
    expect(state.effectiveHumidity).toBeGreaterThan(0);
  });

  it("never renders clouds from pressure alone", () => {
    const dry = deriveWorldInteractionState({
      ...GENESIS_MISSION.planet.world,
      atmosphericPressureAtm: 5,
      averageTemperatureC: 24,
      temperatureVariationC: 4,
      waterAvailability: 0,
      humidity: 0,
    });
    const humid = deriveWorldInteractionState({
      ...GENESIS_MISSION.planet.world,
      atmosphericPressureAtm: 1,
      averageTemperatureC: 24,
      temperatureVariationC: 4,
      waterAvailability: 0.8,
      humidity: 0.8,
    });

    expect(dry.cloudPotential).toBe(0);
    expect(humid.cloudPotential).toBeGreaterThan(0.5);
  });

  it("changes pressure support gradually instead of as an on-off gate", () => {
    const createState = (atmosphericPressureAtm: number) =>
      deriveWorldInteractionState({
        ...GENESIS_MISSION.planet.world,
        atmosphericPressureAtm,
        averageTemperatureC: -10,
        temperatureVariationC: 0,
        waterAvailability: 1,
        humidity: 1,
      });
    const low = createState(0.007);
    const medium = createState(0.015);
    const high = createState(0.03);

    expect(low.surfaceWaterFraction).toBeGreaterThan(0);
    expect(medium.surfaceWaterFraction).toBeGreaterThan(low.surfaceWaterFraction);
    expect(high.surfaceWaterFraction).toBeGreaterThan(medium.surfaceWaterFraction);
  });

  it("uses the gravity-limited pressure for all atmospheric and water consequences", () => {
    const state = deriveWorldInteractionState({
      ...GENESIS_MISSION.planet.world,
      gravityG: 0.2,
      atmosphericPressureAtm: 5,
      averageTemperatureC: 20,
      temperatureVariationC: 0,
      waterAvailability: 1,
      humidity: 1,
    });

    expect(state.effectiveAtmosphericPressureAtm).toBe(4);
    expect(state.exposedWaterPressureSupport).toBe(1);
    expect(state.effectiveHumidity).toBeGreaterThan(0);
  });

  it("reduces radiation continuously with the explicit magnetic field", () => {
    const unprotected = deriveEffectiveRadiationDose(3, 0);
    const partiallyProtected = deriveEffectiveRadiationDose(3, 0.5);
    const earthField = deriveEffectiveRadiationDose(3, 1);

    expect(unprotected).toBe(3);
    expect(partiallyProtected).toBeLessThan(unprotected);
    expect(earthField).toBeLessThan(partiallyProtected);
    expect(earthField).toBeCloseTo(3 / 2.6, 8);
  });

  it("keeps phase outputs finite, bounded, and mass-conserving across edge cases", () => {
    const pressures = [0, 0.006, 0.007, 0.015, 0.03, 1, 5];
    const temperatures = [-273, -100, -40, 0, 36, 95, 150, 900, 1_800];
    const variations = [0, 4, 100];
    const inventories = [0, 0.5, 1];
    const humidities = [0, 0.5, 1];

    for (const atmosphericPressureAtm of pressures) {
      for (const averageTemperatureC of temperatures) {
        for (const temperatureVariationC of variations) {
          for (const waterAvailability of inventories) {
            for (const humidity of humidities) {
              const state = deriveWorldInteractionState({
                ...GENESIS_MISSION.planet.world,
                atmosphericPressureAtm,
                averageTemperatureC,
                temperatureVariationC,
                waterAvailability,
                humidity,
              });
              const outputs = [
                state.atmospherePresence,
                state.exposedWaterPressureSupport,
                state.surfaceWaterFraction,
                state.liquidWaterFraction,
                state.iceWaterFraction,
                state.vaporWaterFraction,
                state.unavailableWaterFraction,
                state.effectiveHumidity,
                state.cloudPotential,
              ];

              for (const output of outputs) {
                expect(Number.isFinite(output)).toBe(true);
                expect(output).toBeGreaterThanOrEqual(0);
                expect(output).toBeLessThanOrEqual(1);
              }
              expect(
                state.iceWaterFraction +
                  state.liquidWaterFraction +
                  state.vaporWaterFraction +
                  state.unavailableWaterFraction,
              ).toBeCloseTo(waterAvailability, 8);
              expect(state.surfaceWaterFraction).toBeCloseTo(
                state.iceWaterFraction + state.liquidWaterFraction,
                8,
              );
              if (waterAvailability === 0 || humidity === 0) {
                expect(state.cloudPotential).toBe(0);
              }
            }
          }
        }
      }
    }
  });
});

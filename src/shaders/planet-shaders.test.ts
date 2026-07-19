import { describe, expect, it } from "vitest";

import {
  PLANET_CLOUD_FRAGMENT_SHADER,
  PLANET_ICE_SURFACE_EXPANSION,
  PLANET_TERRAIN_FRAGMENT_SHADER,
  PLANET_TERRAIN_MAX_ELEVATION,
  PLANET_TERRAIN_MIN_ELEVATION,
  PLANET_WATER_FRAGMENT_SHADER,
  PLANET_WATER_MAX_ELEVATION,
  PLANET_WATER_MIN_ELEVATION,
  PLANET_WATER_VERTEX_SHADER,
  RADIATION_FRAGMENT_SHADER,
} from "./planet-shaders";

describe("planet shader scientific boundaries", () => {
  it("creates molten rock only beyond the basaltic high-temperature boundary", () => {
    expect(PLANET_TERRAIN_FRAGMENT_SHADER).toContain(
      "smoothstep(780.0, 1050.0, localTemperatureC)",
    );
    expect(PLANET_TERRAIN_FRAGMENT_SHADER).toContain("lavaEmission");
    expect(PLANET_TERRAIN_FRAGMENT_SHADER).not.toMatch(/volcanic/i);
  });

  it("uses absolute Celsius boundaries for ice and plant-like coverage", () => {
    expect(PLANET_TERRAIN_FRAGMENT_SHADER).toContain(
      "smoothstep(-2.0, 2.0, localTemperatureC)",
    );
    expect(PLANET_TERRAIN_FRAGMENT_SHADER).toContain(
      "smoothstep(45.0, 60.0, localTemperatureC)",
    );
  });

  it("cannot create clouds from pressure without the derived cloud target", () => {
    expect(PLANET_CLOUD_FRAGMENT_SHADER).toContain(
      "float cloudPresence = uClouds * uPressurePresence;",
    );
    expect(PLANET_CLOUD_FRAGMENT_SHADER).not.toMatch(/uPressurePresence\s*\+/);
  });

  it("consumes the already-derived radiation exposure without a second magnetic formula", () => {
    expect(PLANET_TERRAIN_FRAGMENT_SHADER).toContain(
      "float exposure = clamp(uRadiation",
    );
    expect(PLANET_TERRAIN_FRAGMENT_SHADER).not.toContain("uMagnetic");
  });

  it("does not render an atmosphere-like rim or radiation shell in realistic vacuum view", () => {
    expect(PLANET_TERRAIN_FRAGMENT_SHADER).toContain(
      "viewRim * uPressurePresence",
    );
    expect(RADIATION_FRAGMENT_SHADER).toContain(
      "float modeVisibility = uMode > 1.45 ? 1.0 : 0.0;",
    );
  });

  it("uses the full thermal variation between equator and poles", () => {
    expect(PLANET_TERRAIN_FRAGMENT_SHADER).toContain(
      "latitudeSignal * 1.12 + terrainSignal * 0.45",
    );
  });

  it("raises the ocean through terrain basins without floating above the tallest summit", () => {
    expect(PLANET_WATER_MIN_ELEVATION).toBeGreaterThan(PLANET_TERRAIN_MIN_ELEVATION);
    expect(PLANET_WATER_MAX_ELEVATION).toBeLessThan(PLANET_TERRAIN_MAX_ELEVATION);
    expect(PLANET_WATER_MAX_ELEVATION + PLANET_ICE_SURFACE_EXPANSION).toBeLessThan(
      PLANET_TERRAIN_MAX_ELEVATION,
    );
    expect(PLANET_WATER_VERTEX_SHADER).toContain(
      PLANET_WATER_MIN_ELEVATION.toFixed(4),
    );
    expect(PLANET_WATER_VERTEX_SHADER).toContain(
      PLANET_WATER_MAX_ELEVATION.toFixed(4),
    );
  });

  it("freezes visible water from local latitude temperature instead of a global tint", () => {
    expect(PLANET_WATER_FRAGMENT_SHADER).toContain(
      "float localTemperatureC = uMeanTemperatureC + uTemperatureVariationC * thermalPosition;",
    );
    expect(PLANET_WATER_FRAGMENT_SHADER).toContain(
      "float freeze = localFreeze * iceSupply;",
    );
    expect(PLANET_WATER_FRAGMENT_SHADER).not.toContain(
      "uIceWater / phaseTotal",
    );
  });
});

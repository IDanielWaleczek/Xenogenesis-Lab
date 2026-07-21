import { describe, expect, it } from "vitest";

import {
  LAVA_CHANNEL_END_C,
  LAVA_CHANNEL_START_C,
  PLANET_CLOUD_FRAGMENT_SHADER,
  PLANET_ICE_SURFACE_EXPANSION,
  PLANET_TERRAIN_FRAGMENT_SHADER,
  PLANET_TERRAIN_MAX_ELEVATION,
  PLANET_TERRAIN_MIN_ELEVATION,
  PLANET_TERRAIN_VERTEX_SHADER,
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

  it("adds lava channels gradually from 450°C through the configured heat ceiling", () => {
    expect(LAVA_CHANNEL_START_C).toBe(450);
    expect(LAVA_CHANNEL_END_C).toBe(1800);
    expect(PLANET_TERRAIN_FRAGMENT_SHADER).toContain(
      `smoothstep(${LAVA_CHANNEL_START_C.toFixed(1)}, ${LAVA_CHANNEL_END_C.toFixed(1)}, localTemperatureC)`,
    );
    expect(PLANET_TERRAIN_FRAGMENT_SHADER).toContain("float heatHaze = smoothstep(330.0, 650.0, localTemperatureC)");
    expect(PLANET_TERRAIN_FRAGMENT_SHADER).toContain("uTime * 0.12");
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

  it("uses a curved latitude response with bounded local terrain variation", () => {
    expect(PLANET_TERRAIN_FRAGMENT_SHADER).toContain(
      "float thermalPosition = localThermalPosition(vObjectPosition, vElevation, uSeed);",
    );
    expect(PLANET_TERRAIN_FRAGMENT_SHADER).toContain(
      "2.0 * sqrt(max(0.0, 1.0 - latitude * latitude)) - 1.0",
    );
  });

  it("raises the ocean from terrain basins to a complete aquatic world", () => {
    expect(PLANET_WATER_MIN_ELEVATION).toBeGreaterThan(PLANET_TERRAIN_MIN_ELEVATION);
    expect(PLANET_WATER_MAX_ELEVATION).toBeGreaterThan(PLANET_TERRAIN_MAX_ELEVATION);
    expect(PLANET_WATER_MAX_ELEVATION + PLANET_ICE_SURFACE_EXPANSION).toBeGreaterThan(
      PLANET_TERRAIN_MAX_ELEVATION,
    );
    expect(PLANET_WATER_VERTEX_SHADER).toContain(
      PLANET_WATER_MIN_ELEVATION.toFixed(4),
    );
    expect(PLANET_WATER_VERTEX_SHADER).toContain(
      PLANET_WATER_MAX_ELEVATION.toFixed(4),
    );
    expect(PLANET_WATER_VERTEX_SHADER).toContain("waterSeaProgress(uSurfaceWater)");
    expect(PLANET_WATER_FRAGMENT_SHADER).toContain("waterSeaProgress(uSurfaceWater)");
    expect(PLANET_WATER_VERTEX_SHADER).toContain("if (surfaceWater <= 0.10) return 0.0;");
    expect(PLANET_WATER_VERTEX_SHADER).toContain("smoothstep(0.10, 0.25, surfaceWater)");
  });

  it("uses one terrain field for prominent mountains, canyon cuts, and water masking", () => {
    expect(PLANET_TERRAIN_VERTEX_SHADER).toContain(
      "float elevation = terrainElevation(samplePoint);",
    );
    expect(PLANET_TERRAIN_VERTEX_SHADER).toContain("vCanyon = terrainCanyon(samplePoint);");
    expect(PLANET_TERRAIN_VERTEX_SHADER).toContain("float terrainRidges(vec3 p)");
    expect(PLANET_TERRAIN_FRAGMENT_SHADER).toContain("varying float vCanyon;");
    expect(PLANET_TERRAIN_FRAGMENT_SHADER).toContain("float river = riverLines");
    expect(PLANET_TERRAIN_FRAGMENT_SHADER).toContain("float riverFreeze = localFreeze");
    expect(PLANET_TERRAIN_FRAGMENT_SHADER).toContain("float thermalPosition = localThermalPosition");
    expect(PLANET_WATER_FRAGMENT_SHADER).toContain(
      "float localTerrainElevation = terrainElevation(samplePoint);",
    );
    expect(PLANET_WATER_FRAGMENT_SHADER).toContain(
      "float thermalPosition = localThermalPosition(vObjectPosition, localTerrainElevation, uSeed);",
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

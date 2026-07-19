"use client";

/* eslint-disable react-hooks/immutability -- Three.js shader materials are external mutable resources intentionally updated inside the React Three Fiber frame loop. */

import { OrbitControls, Stars } from "@react-three/drei";
import { Canvas, type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BackSide,
  Color,
  DoubleSide,
  Group,
  MathUtils,
  Mesh,
  ShaderMaterial,
  Vector3,
} from "three";
import type { OrbitControls as OrbitControlsType } from "three-stdlib";

import type { PlanetState, RegionId } from "@/domain/simulator/schema";
import {
  ATMOSPHERE_FRAGMENT_SHADER,
  ATMOSPHERE_VERTEX_SHADER,
  PLANET_CLOUD_FRAGMENT_SHADER,
  PLANET_CLOUD_VERTEX_SHADER,
  PLANET_TERRAIN_FRAGMENT_SHADER,
  PLANET_TERRAIN_VERTEX_SHADER,
  PLANET_WATER_FRAGMENT_SHADER,
  PLANET_WATER_VERTEX_SHADER,
} from "@/shaders/planet-shaders";

export type PlanetVisualizationMode = "realistic" | "temperature" | "radiation";

type ProceduralPlanetProps = {
  planet: PlanetState;
  biosphereLevel: number;
  visualizationMode: PlanetVisualizationMode;
  autoRotate: boolean;
  cameraResetSignal: number;
  regionScores?: Partial<Record<RegionId, number>>;
  onInspect: (region: RegionId) => void;
  label: string;
};

type VisualTargets = {
  water: number;
  temperature: number;
  humidity: number;
  pressure: number;
  radiation: number;
  magnetic: number;
  biosphere: number;
  mode: number;
  clouds: number;
  atmosphereDensity: number;
  atmosphereColor: Color;
  daylight: number;
  terrainScale: number;
  lightLevel: number;
};

const REGION_MARKERS: Record<RegionId, [number, number, number]> = {
  coastal: [0.72, 0.18, 0.7],
  equatorial: [-0.75, 0.02, 0.67],
  polar: [0.08, 1.01, 0.1],
  deepOcean: [0.45, -0.34, -0.86],
  underground: [-0.43, -0.47, 0.79],
  highAltitude: [-0.6, 0.57, -0.58],
};

/** Maps a stable text seed to a shader-friendly number. */
function seedToFloat(seed: string): number {
  let hash = 2_166_136_261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return (hash >>> 0) / 65_535;
}

/** Converts world inputs into smooth visual targets without changing simulation facts. */
function deriveVisualTargets(
  planet: PlanetState,
  biosphereLevel: number,
  mode: PlanetVisualizationMode,
): VisualTargets {
  const world = planet.world;
  const temperature = MathUtils.clamp((world.averageTemperatureC + 100) / 250, 0, 1);
  const pressure = MathUtils.clamp(world.atmosphericPressureAtm / 5, 0, 1);
  const radiation = MathUtils.clamp(
    Math.log10(1 + world.radiationDoseRate.value * (world.radiationDoseRate.unit === "Sv/h" ? 1_000 : 1)) / 2.2,
    0,
    1,
  );
  const oxygen = world.atmosphereComposition.oxygenFraction;
  const carbonDioxide = world.atmosphereComposition.carbonDioxideFraction;
  const dust = MathUtils.clamp(carbonDioxide * 4 + Math.max(0, temperature - 0.68), 0, 1);
  const atmosphereColor = new Color().setRGB(
    0.18 + dust * 0.48,
    0.48 + oxygen * 0.9 - dust * 0.18,
    0.82 - dust * 0.42,
  );
  const clouds = MathUtils.clamp(
    world.waterAvailability * 0.38 +
      world.humidity * 0.48 +
      pressure * 0.22 -
      Math.abs(temperature - 0.46) * 0.18,
    0,
    1,
  );

  return {
    water: world.waterAvailability,
    temperature,
    humidity: world.humidity,
    pressure,
    radiation,
    magnetic: MathUtils.clamp(world.magneticFieldStrengthEarth / 2.5, 0, 1),
    biosphere: MathUtils.clamp(biosphereLevel, 0, 1),
    mode: mode === "realistic" ? 0 : mode === "temperature" ? 1 : 2,
    clouds,
    atmosphereDensity: pressure,
    atmosphereColor,
    daylight: MathUtils.clamp(world.lightLevel, 0.15, 1),
    terrainScale: MathUtils.clamp(1.28 - world.gravityG * 0.22, 0.48, 1.22),
    lightLevel: world.lightLevel,
  };
}

/** Classifies an inspected globe point into one of the model's representative regions. */
function classifyRegion(point: Vector3): RegionId {
  const normal = point.clone().normalize();
  if (Math.abs(normal.y) > 0.72) return "polar";
  if (point.length() > 1.035 && normal.y > 0.24) return "highAltitude";
  if (normal.z < -0.48) return "deepOcean";
  if (normal.y < -0.34) return "underground";
  if (Math.abs(normal.y) < 0.2) return "equatorial";
  return "coastal";
}

/** Keeps camera reset behavior inside the persistent WebGL scene. */
function CameraController({
  resetSignal,
  controlsRef,
}: {
  resetSignal: number;
  controlsRef: React.RefObject<OrbitControlsType | null>;
}) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0.15, 3.15);
    camera.lookAt(0, 0, 0);
    controlsRef.current?.target.set(0, 0, 0);
    controlsRef.current?.update();
  }, [camera, controlsRef, resetSignal]);

  return null;
}

/** Renders the persistent, layered procedural planet and interpolates every visual input. */
function PlanetScene({
  planet,
  biosphereLevel,
  visualizationMode,
  autoRotate,
  cameraResetSignal,
  regionScores,
  onInspect,
}: Omit<ProceduralPlanetProps, "label">) {
  const planetGroup = useRef<Group>(null);
  const cloudMesh = useRef<Mesh>(null);
  const controlsRef = useRef<OrbitControlsType>(null);
  const seed = useMemo(() => seedToFloat(planet.seed), [planet.seed]);
  const targets = useRef(deriveVisualTargets(planet, biosphereLevel, visualizationMode));

  useEffect(() => {
    targets.current = deriveVisualTargets(planet, biosphereLevel, visualizationMode);
  }, [biosphereLevel, planet, visualizationMode]);

  const terrainMaterial = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uSeed: { value: seed },
          uTerrainScale: { value: 1 },
          uWater: { value: 0.45 },
          uTemperature: { value: 0.45 },
          uHumidity: { value: 0.45 },
          uPressure: { value: 0.2 },
          uRadiation: { value: 0.1 },
          uMagnetic: { value: 0.25 },
          uBiosphere: { value: 0 },
          uMode: { value: 0 },
          uLightLevel: { value: 0.7 },
          uLightDirection: { value: new Vector3(0.7, 0.35, 1) },
        },
        vertexShader: PLANET_TERRAIN_VERTEX_SHADER,
        fragmentShader: PLANET_TERRAIN_FRAGMENT_SHADER,
      }),
    [seed],
  );
  const waterMaterial = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uSeed: { value: seed },
          uWater: { value: 0.45 },
          uTemperature: { value: 0.45 },
          uPressure: { value: 0.2 },
          uBiosphere: { value: 0 },
          uTime: { value: 0 },
        },
        vertexShader: PLANET_WATER_VERTEX_SHADER,
        fragmentShader: PLANET_WATER_FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
      }),
    [seed],
  );
  const cloudMaterial = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uSeed: { value: seed },
          uClouds: { value: 0.4 },
          uTime: { value: 0 },
        },
        vertexShader: PLANET_CLOUD_VERTEX_SHADER,
        fragmentShader: PLANET_CLOUD_FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
      }),
    [seed],
  );
  const atmosphereMaterial = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uAtmosphereColor: { value: new Color("#45bce2") },
          uDensity: { value: 0.2 },
          uDaylight: { value: 0.7 },
        },
        vertexShader: ATMOSPHERE_VERTEX_SHADER,
        fragmentShader: ATMOSPHERE_FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        side: BackSide,
        blending: AdditiveBlending,
      }),
    [],
  );

  useEffect(
    () => () => {
      terrainMaterial.dispose();
      waterMaterial.dispose();
      cloudMaterial.dispose();
      atmosphereMaterial.dispose();
    }, [atmosphereMaterial, cloudMaterial, terrainMaterial, waterMaterial],
  );

  useFrame(({ clock }, delta) => {
    const target = targets.current;
    const ease = 1 - Math.exp(-delta * 2.25);
    const lerpUniform = (material: ShaderMaterial, name: string, value: number) => {
      material.uniforms[name].value = MathUtils.lerp(material.uniforms[name].value as number, value, ease);
    };

    lerpUniform(terrainMaterial, "uWater", target.water);
    lerpUniform(terrainMaterial, "uTemperature", target.temperature);
    lerpUniform(terrainMaterial, "uHumidity", target.humidity);
    lerpUniform(terrainMaterial, "uPressure", target.pressure);
    lerpUniform(terrainMaterial, "uRadiation", target.radiation);
    lerpUniform(terrainMaterial, "uMagnetic", target.magnetic);
    lerpUniform(terrainMaterial, "uBiosphere", target.biosphere);
    lerpUniform(terrainMaterial, "uMode", target.mode);
    lerpUniform(terrainMaterial, "uTerrainScale", target.terrainScale);
    lerpUniform(terrainMaterial, "uLightLevel", target.lightLevel);
    lerpUniform(waterMaterial, "uWater", target.water);
    lerpUniform(waterMaterial, "uTemperature", target.temperature);
    lerpUniform(waterMaterial, "uPressure", target.pressure);
    lerpUniform(waterMaterial, "uBiosphere", target.biosphere);
    lerpUniform(cloudMaterial, "uClouds", target.clouds);
    lerpUniform(atmosphereMaterial, "uDensity", target.atmosphereDensity);
    lerpUniform(atmosphereMaterial, "uDaylight", target.daylight);
    (atmosphereMaterial.uniforms.uAtmosphereColor.value as Color).lerp(target.atmosphereColor, ease);
    waterMaterial.uniforms.uTime.value = clock.elapsedTime;
    cloudMaterial.uniforms.uTime.value = clock.elapsedTime;

    if (autoRotate && planetGroup.current) planetGroup.current.rotation.y += delta * 0.055;
    if (cloudMesh.current) cloudMesh.current.rotation.y += delta * 0.018;
  });

  const inspect = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onInspect(classifyRegion(event.point));
  };

  return (
    <>
      <ambientLight intensity={0.32} />
      <directionalLight intensity={1.8} position={[3.5, 2.4, 4.5]} />
      <Stars count={1_200} depth={45} factor={2.4} fade radius={38} speed={0.12} />
      <group ref={planetGroup} rotation={[0.08, -0.5, 0.03]}>
        <mesh material={terrainMaterial} onClick={inspect}>
          <icosahedronGeometry args={[1, 7]} />
        </mesh>
        <mesh material={waterMaterial} scale={1.008}>
          <icosahedronGeometry args={[1, 6]} />
        </mesh>
        <mesh material={cloudMaterial} ref={cloudMesh} scale={1.025}>
          <icosahedronGeometry args={[1, 6]} />
        </mesh>
        <mesh material={atmosphereMaterial} scale={1.14}>
          <icosahedronGeometry args={[1, 5]} />
        </mesh>
        {regionScores &&
          (Object.entries(regionScores) as Array<[RegionId, number]>).map(([region, score]) => (
            <mesh key={region} position={REGION_MARKERS[region]} scale={0.014 + score * 0.018}>
              <sphereGeometry args={[1, 12, 12]} />
              <meshBasicMaterial
                color={score >= 0.5 ? "#67f5b5" : "#ffb45f"}
                opacity={0.25 + score * 0.7}
                transparent
              />
            </mesh>
          ))}
      </group>
      <OrbitControls
        enableDamping
        enablePan={false}
        maxDistance={5.2}
        minDistance={1.75}
        ref={controlsRef}
        rotateSpeed={0.55}
        zoomSpeed={0.7}
      />
      <CameraController controlsRef={controlsRef} resetSignal={cameraResetSignal} />
    </>
  );
}

/** Client-only canvas wrapper for the procedural planet. */
export default function ProceduralPlanet({ label, ...props }: ProceduralPlanetProps) {
  return (
    <div aria-label={label} className="planet-canvas" role="img">
      <Canvas
        camera={{ fov: 44, near: 0.1, far: 100, position: [0, 0.15, 3.15] }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <PlanetScene {...props} />
      </Canvas>
    </div>
  );
}

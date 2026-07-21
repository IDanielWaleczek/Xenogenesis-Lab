"use client";

/* eslint-disable react-hooks/immutability -- Three.js shader materials are external mutable resources intentionally updated inside the React Three Fiber frame loop. */

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  Group,
  MathUtils,
  Mesh,
  Float32BufferAttribute,
  PointsMaterial,
  ShaderMaterial,
  SpriteMaterial,
  Vector3,
} from "three";
import type { OrbitControls as OrbitControlsType } from "three-stdlib";

import type { PlanetState, RegionId } from "@/domain/simulator/schema";
import {
  AURORA_FRAGMENT_SHADER,
  AURORA_VERTEX_SHADER,
  ATMOSPHERE_FRAGMENT_SHADER,
  ATMOSPHERE_VERTEX_SHADER,
  PLANET_CLOUD_FRAGMENT_SHADER,
  PLANET_CLOUD_VERTEX_SHADER,
  PLANET_TERRAIN_FRAGMENT_SHADER,
  PLANET_TERRAIN_VERTEX_SHADER,
  PLANET_WATER_FRAGMENT_SHADER,
  PLANET_WATER_VERTEX_SHADER,
  RADIATION_FRAGMENT_SHADER,
  RADIATION_VERTEX_SHADER,
  SUN_CORONA_FRAGMENT_SHADER,
  SUN_CORONA_VERTEX_SHADER,
  SUN_FRAGMENT_SHADER,
  SUN_VERTEX_SHADER,
} from "@/shaders/planet-shaders";
import {
  derivePlanetVisualizationState,
  PLANET_INITIAL_CAMERA_POSITION,
  PLANET_SUN_POSITION,
} from "@/domain/world/visualization";

export type PlanetVisualizationMode = "realistic" | "temperature" | "radiation";

type ProceduralPlanetProps = {
  planet: PlanetState;
  biosphereLevel: number;
  visualizationMode: PlanetVisualizationMode;
  autoRotate: boolean;
  cameraResetSignal: number;
  /** Disables direct camera controls for static life-design and analysis insets. */
  interactive?: boolean;
  regionScores?: Partial<Record<RegionId, number>>;
  label: string;
};

type PlanetSceneOptions = {
  position?: [number, number, number];
  scale?: number;
  showStars?: boolean;
  showSun?: boolean;
  sunPosition?: [number, number, number];
  interactive?: boolean;
  rotationSpeed?: number;
};

type VisualTargets = {
  surfaceWater: number;
  liquidWater: number;
  iceWater: number;
  vaporWater: number;
  meanTemperatureC: number;
  temperatureVariation: number;
  humidity: number;
  pressurePresence: number;
  radiation: number;
  biosphere: number;
  mode: number;
  clouds: number;
  atmosphereDensity: number;
  atmosphereColor: Color;
  daylight: number;
  lightLevel: number;
  aurora: number;
  sandClimate: number;
};

const REGION_MARKERS: Record<RegionId, [number, number, number]> = {
  coastal: [0.72, 0.18, 0.7],
  equatorial: [-0.75, 0.02, 0.67],
  polar: [0.08, 1.01, 0.1],
  deepOcean: [0.45, -0.34, -0.86],
  underground: [-0.43, -0.47, 0.79],
  highAltitude: [-0.6, 0.57, -0.58],
};

const SUN_POSITION: [number, number, number] = [...PLANET_SUN_POSITION];
const INITIAL_CAMERA_POSITION: [number, number, number] = [
  ...PLANET_INITIAL_CAMERA_POSITION,
];
const BOOT_SUN_POSITION: [number, number, number] = [6, 5, 10];

/** Builds a deterministic three-dimensional star field anchored in world space. */
function createStarGeometry(seed: number, count: number): BufferGeometry {
  let state = Math.max(1, Math.floor(seed * 2_147_483_647));
  const random = () => {
    state = (state * 48_271) % 2_147_483_647;
    return state / 2_147_483_647;
  };
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const radius = 16 + random() * 58;
    const longitude = random() * Math.PI * 2;
    const latitude = Math.acos(2 * random() - 1);
    positions[index * 3] = radius * Math.sin(latitude) * Math.cos(longitude);
    positions[index * 3 + 1] = radius * Math.cos(latitude);
    positions[index * 3 + 2] = radius * Math.sin(latitude) * Math.sin(longitude);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  return geometry;
}

/** Draws a broad halo behind the shader-driven stellar surface. */
function createSunFlareTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) return new CanvasTexture(canvas);
  const center = 256;
  const corona = context.createRadialGradient(center, center, 42, center, center, 256);
  corona.addColorStop(0, "rgba(255, 226, 154, 0)");
  corona.addColorStop(0.1, "rgba(255, 226, 154, 0)");
  corona.addColorStop(0.18, "rgba(255, 199, 92, .42)");
  corona.addColorStop(0.43, "rgba(255, 142, 35, .14)");
  corona.addColorStop(1, "rgba(255, 118, 20, 0)");
  context.fillStyle = corona;
  context.fillRect(0, 0, 512, 512);
  context.globalCompositeOperation = "lighter";
  context.strokeStyle = "rgba(255, 205, 113, .20)";
  context.lineWidth = 2;
  for (let ray = 0; ray < 10; ray += 1) {
    const angle = (ray / 10) * Math.PI * 2;
    context.beginPath();
    context.moveTo(center + Math.cos(angle) * 36, center + Math.sin(angle) * 36);
    context.lineTo(center + Math.cos(angle) * (ray % 2 === 0 ? 214 : 144), center + Math.sin(angle) * (ray % 2 === 0 ? 214 : 144));
    context.stroke();
  }
  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

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
  const visual = derivePlanetVisualizationState(planet.world, biosphereLevel);

  return {
    surfaceWater: visual.surfaceWater,
    liquidWater: visual.liquidWater,
    iceWater: visual.iceWater,
    vaporWater: visual.vaporWater,
    meanTemperatureC: visual.meanTemperatureC,
    temperatureVariation: visual.temperatureVariationC,
    humidity: visual.effectiveHumidity,
    pressurePresence: visual.pressurePresence,
    radiation: visual.radiation,
    biosphere: visual.biosphere,
    mode: mode === "realistic" ? 0 : mode === "temperature" ? 1 : 2,
    clouds: visual.cloudCover,
    atmosphereDensity: visual.atmosphereDensity,
    atmosphereColor: new Color().setRGB(...visual.atmosphereColor),
    daylight: visual.daylight,
    lightLevel: visual.lightLevel,
    aurora: visual.aurora,
    sandClimate: visual.sandClimateSuitability,
  };
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
    camera.position.set(...INITIAL_CAMERA_POSITION);
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
  position = [0, 0, 0],
  scale = 1,
  showStars = true,
  showSun = true,
  sunPosition = SUN_POSITION,
  interactive = true,
  rotationSpeed = 0.055,
}: Omit<ProceduralPlanetProps, "label"> & PlanetSceneOptions) {
  const planetGroup = useRef<Group>(null);
  const sunGroup = useRef<Group>(null);
  const cloudMesh = useRef<Mesh>(null);
  const controlsRef = useRef<OrbitControlsType>(null);
  const seed = useMemo(() => seedToFloat(planet.seed), [planet.seed]);
  const sunDirection = useMemo(() => new Vector3(...sunPosition).normalize(), [sunPosition]);
  const [initialTargets] = useState(() =>
    deriveVisualTargets(planet, biosphereLevel, visualizationMode),
  );
  const targets = useRef(initialTargets);
  const starGeometry = useMemo(() => createStarGeometry(seed, 2_800), [seed]);
  const starMaterial = useMemo(
    () =>
      new PointsMaterial({
        color: "#dff7ff",
        depthWrite: false,
        opacity: 0.92,
        size: 0.065,
        sizeAttenuation: true,
        toneMapped: false,
        transparent: true,
      }),
    [],
  );

  useEffect(() => {
    targets.current = deriveVisualTargets(planet, biosphereLevel, visualizationMode);
  }, [biosphereLevel, planet, visualizationMode]);

  const terrainMaterial = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uSeed: { value: seed },
          uSurfaceWater: { value: initialTargets.surfaceWater },
          uLiquidWater: { value: initialTargets.liquidWater },
          uIceWater: { value: initialTargets.iceWater },
          uMeanTemperatureC: { value: initialTargets.meanTemperatureC },
          uTemperatureVariationC: { value: initialTargets.temperatureVariation },
          uTime: { value: 0 },
          uEffectiveHumidity: { value: initialTargets.humidity },
          uPressurePresence: { value: initialTargets.pressurePresence },
          uSandClimate: { value: initialTargets.sandClimate },
          uRadiation: { value: initialTargets.radiation },
          uBiosphere: { value: initialTargets.biosphere },
          uMode: { value: initialTargets.mode },
          uLightLevel: { value: initialTargets.lightLevel },
          uLightDirection: { value: sunDirection },
        },
        vertexShader: PLANET_TERRAIN_VERTEX_SHADER,
        fragmentShader: PLANET_TERRAIN_FRAGMENT_SHADER,
      }),
    [initialTargets, seed, sunDirection],
  );
  const waterMaterial = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uSeed: { value: seed },
          uSurfaceWater: { value: initialTargets.surfaceWater },
          uIceWater: { value: initialTargets.iceWater },
          uMeanTemperatureC: { value: initialTargets.meanTemperatureC },
          uTemperatureVariationC: { value: initialTargets.temperatureVariation },
          uBiosphere: { value: initialTargets.biosphere },
          uTime: { value: 0 },
          uLightDirection: { value: sunDirection },
        },
        vertexShader: PLANET_WATER_VERTEX_SHADER,
        fragmentShader: PLANET_WATER_FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
      }),
    [initialTargets, seed, sunDirection],
  );
  const cloudMaterial = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uSeed: { value: seed },
          uClouds: { value: initialTargets.clouds },
          uPressurePresence: { value: initialTargets.pressurePresence },
          uVaporWater: { value: initialTargets.vaporWater },
          uTime: { value: 0 },
          uLightDirection: { value: sunDirection },
        },
        vertexShader: PLANET_CLOUD_VERTEX_SHADER,
        fragmentShader: PLANET_CLOUD_FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
      }),
    [initialTargets, seed, sunDirection],
  );
  const atmosphereMaterial = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uAtmosphereColor: { value: initialTargets.atmosphereColor.clone() },
          uDensity: { value: initialTargets.atmosphereDensity },
          uDaylight: { value: initialTargets.daylight },
          uLightDirection: { value: sunDirection },
        },
        vertexShader: ATMOSPHERE_VERTEX_SHADER,
        fragmentShader: ATMOSPHERE_FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        side: BackSide,
        blending: AdditiveBlending,
      }),
    [initialTargets, sunDirection],
  );
  const radiationMaterial = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uRadiation: { value: initialTargets.radiation },
          uMode: { value: initialTargets.mode },
          uTime: { value: 0 },
        },
        vertexShader: RADIATION_VERTEX_SHADER,
        fragmentShader: RADIATION_FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        blending: AdditiveBlending,
      }),
    [initialTargets],
  );
  const sunFlareTexture = useMemo(() => createSunFlareTexture(), []);
  const sunFlareMaterial = useMemo(
    () => new SpriteMaterial({ map: sunFlareTexture, blending: AdditiveBlending, depthWrite: false, transparent: true }),
    [sunFlareTexture],
  );
  const sunSurfaceMaterial = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: SUN_VERTEX_SHADER,
        fragmentShader: SUN_FRAGMENT_SHADER,
        toneMapped: false,
      }),
    [],
  );
  const sunCoronaMaterial = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: SUN_CORONA_VERTEX_SHADER,
        fragmentShader: SUN_CORONA_FRAGMENT_SHADER,
        blending: AdditiveBlending,
        depthWrite: false,
        side: DoubleSide,
        toneMapped: false,
        transparent: true,
      }),
    [],
  );
  const auroraMaterial = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uIntensity: { value: 0 },
          uTime: { value: 0 },
        },
        vertexShader: AURORA_VERTEX_SHADER,
        fragmentShader: AURORA_FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
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
      radiationMaterial.dispose();
      auroraMaterial.dispose();
      sunFlareMaterial.dispose();
      sunFlareTexture.dispose();
      sunSurfaceMaterial.dispose();
      sunCoronaMaterial.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
    }, [
      atmosphereMaterial,
      auroraMaterial,
      cloudMaterial,
      radiationMaterial,
      sunFlareMaterial,
      sunFlareTexture,
      sunSurfaceMaterial,
      sunCoronaMaterial,
      starGeometry,
      starMaterial,
      terrainMaterial,
      waterMaterial,
    ],
  );

  useFrame(({ clock }, delta) => {
    const target = targets.current;
    const ease = 1 - Math.exp(-delta * 2.25);
    const lerpUniform = (
      material: ShaderMaterial,
      name: string,
      value: number,
      snapToZero = false,
    ) => {
      material.uniforms[name].value =
        snapToZero && value === 0
          ? 0
          : MathUtils.lerp(
              material.uniforms[name].value as number,
              value,
              ease,
            );
    };

    lerpUniform(terrainMaterial, "uSurfaceWater", target.surfaceWater);
    lerpUniform(terrainMaterial, "uLiquidWater", target.liquidWater);
    lerpUniform(terrainMaterial, "uIceWater", target.iceWater);
    lerpUniform(terrainMaterial, "uMeanTemperatureC", target.meanTemperatureC);
    lerpUniform(terrainMaterial, "uTemperatureVariationC", target.temperatureVariation);
    lerpUniform(terrainMaterial, "uEffectiveHumidity", target.humidity);
    lerpUniform(terrainMaterial, "uPressurePresence", target.pressurePresence, true);
    lerpUniform(terrainMaterial, "uSandClimate", target.sandClimate);
    lerpUniform(terrainMaterial, "uRadiation", target.radiation);
    lerpUniform(terrainMaterial, "uBiosphere", target.biosphere);
    lerpUniform(terrainMaterial, "uMode", target.mode, true);
    lerpUniform(terrainMaterial, "uLightLevel", target.lightLevel);
    lerpUniform(waterMaterial, "uSurfaceWater", target.surfaceWater, true);
    lerpUniform(waterMaterial, "uIceWater", target.iceWater, true);
    lerpUniform(waterMaterial, "uMeanTemperatureC", target.meanTemperatureC);
    lerpUniform(waterMaterial, "uTemperatureVariationC", target.temperatureVariation);
    lerpUniform(waterMaterial, "uBiosphere", target.biosphere);
    lerpUniform(cloudMaterial, "uClouds", target.clouds, true);
    lerpUniform(cloudMaterial, "uPressurePresence", target.pressurePresence, true);
    lerpUniform(cloudMaterial, "uVaporWater", target.vaporWater, true);
    lerpUniform(atmosphereMaterial, "uDensity", target.atmosphereDensity, true);
    lerpUniform(atmosphereMaterial, "uDaylight", target.daylight);
    lerpUniform(radiationMaterial, "uRadiation", target.radiation);
    lerpUniform(radiationMaterial, "uMode", target.mode, true);
    lerpUniform(auroraMaterial, "uIntensity", target.aurora, true);
    (atmosphereMaterial.uniforms.uAtmosphereColor.value as Color).lerp(target.atmosphereColor, ease);
    waterMaterial.uniforms.uTime.value = clock.elapsedTime;
    terrainMaterial.uniforms.uTime.value = clock.elapsedTime;
    cloudMaterial.uniforms.uTime.value = clock.elapsedTime;
    radiationMaterial.uniforms.uTime.value = clock.elapsedTime;
    auroraMaterial.uniforms.uTime.value = clock.elapsedTime;
    sunSurfaceMaterial.uniforms.uTime.value = clock.elapsedTime;
    sunCoronaMaterial.uniforms.uTime.value = clock.elapsedTime;

    if (autoRotate && planetGroup.current) planetGroup.current.rotation.y += delta * rotationSpeed;
    if (autoRotate && sunGroup.current) sunGroup.current.rotation.y += delta * 0.006;
    if (cloudMesh.current) cloudMesh.current.rotation.y += delta * 0.018;
  });

  return (
    <>
      <ambientLight intensity={0.035} />
      <directionalLight intensity={2.4} position={sunPosition} />
      <pointLight color="#ffe4a3" distance={0} intensity={9} position={sunPosition} />
      {showSun && <group ref={sunGroup} position={sunPosition}>
        <mesh material={sunSurfaceMaterial} renderOrder={2}>
          <sphereGeometry args={[4.5, 64, 48]} />
        </mesh>
        <mesh material={sunCoronaMaterial} renderOrder={1} scale={1.2}>
          <sphereGeometry args={[4.5, 64, 48]} />
        </mesh>
        <sprite material={sunFlareMaterial} renderOrder={0} scale={[14, 14, 1]} />
      </group>}
      {showStars && <points frustumCulled={false} geometry={starGeometry} material={starMaterial} />}
      <group ref={planetGroup} position={position} rotation={[0.08, -0.5, 0.03]} scale={scale}>
        <mesh material={terrainMaterial}>
          <icosahedronGeometry args={[1, 8]} />
        </mesh>
        <mesh material={waterMaterial}>
          <icosahedronGeometry args={[1, 7]} />
        </mesh>
        <mesh material={cloudMaterial} ref={cloudMesh} renderOrder={2} scale={1.105}>
          <icosahedronGeometry args={[1, 6]} />
        </mesh>
        <mesh material={atmosphereMaterial} scale={1.14}>
          <icosahedronGeometry args={[1, 5]} />
        </mesh>
        <mesh material={radiationMaterial} scale={1.16}>
          <sphereGeometry args={[1, 64, 48]} />
        </mesh>
        <mesh material={auroraMaterial} scale={1.19}>
          <sphereGeometry args={[1, 80, 56]} />
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
      {interactive && <OrbitControls
        enableDamping
        enablePan={false}
        maxDistance={5.2}
        minDistance={1.75}
        ref={controlsRef}
        rotateSpeed={0.55}
        zoomSpeed={0.7}
      />}
      {interactive && <CameraController controlsRef={controlsRef} resetSignal={cameraResetSignal} />}
    </>
  );
}

/** Client-only canvas wrapper for the procedural planet. */
export default function ProceduralPlanet({ label, ...props }: ProceduralPlanetProps) {
  return (
    <div aria-label={label} className="planet-canvas" role="img">
      <Canvas
        camera={{ fov: 58, near: 0.1, far: 100, position: INITIAL_CAMERA_POSITION }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <PlanetScene {...props} />
      </Canvas>
    </div>
  );
}

/** A non-interactive shared WebGL tableau used by the laboratory boot sequence. */
export function IntroPlanetaryScene({
  frozenPlanet,
  warmPlanet,
}: {
  frozenPlanet: PlanetState;
  warmPlanet: PlanetState;
}) {
  return (
    <div aria-hidden="true" className="boot-webgl-scene">
      <Canvas
        camera={{ fov: 48, near: 0.1, far: 100, position: [0, 0, 8] }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <PlanetScene
          autoRotate
          biosphereLevel={0}
          cameraResetSignal={0}
          interactive={false}
          planet={frozenPlanet}
          position={[-4.15, 1.65, 0]}
          rotationSpeed={0.018}
          scale={1.55}
          showSun={false}
          sunPosition={BOOT_SUN_POSITION}
          visualizationMode="realistic"
        />
        <PlanetScene
          autoRotate
          biosphereLevel={0}
          cameraResetSignal={0}
          interactive={false}
          planet={warmPlanet}
          position={[4.15, -1.65, -0.45]}
          rotationSpeed={0.014}
          scale={1.75}
          showStars={false}
          showSun={false}
          sunPosition={BOOT_SUN_POSITION}
          visualizationMode="realistic"
        />
      </Canvas>
    </div>
  );
}

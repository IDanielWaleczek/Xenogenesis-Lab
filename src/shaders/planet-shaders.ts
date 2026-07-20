/** Shared deterministic value-noise helpers used by the planet shaders. */
const GLSL_NOISE = `
float hash31(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

float valueNoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash31(i), hash31(i + vec3(1,0,0)), f.x),
        mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x),
        mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x), f.y),
    f.z
  );
}

float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.52;
  for (int octave = 0; octave < 5; octave++) {
    value += valueNoise(p) * amplitude;
    p = p * 2.03 + vec3(17.1, 9.2, 13.7);
    amplitude *= 0.5;
  }
  return value;
}

float terrainRidges(vec3 p) {
  float value = 0.0;
  float amplitude = 0.54;
  for (int octave = 0; octave < 6; octave++) {
    float ridge = 1.0 - abs(valueNoise(p) * 2.0 - 1.0);
    value += ridge * amplitude;
    p = p * 2.07 + vec3(11.8, 19.3, 7.4);
    amplitude *= 0.5;
  }
  return value;
}

float terrainCanyon(vec3 samplePoint) {
  float canyonLines = 1.0 - abs(fbm(samplePoint * 13.0 + vec3(3.1, 11.7, 6.4)) * 2.0 - 1.0);
  return smoothstep(0.86, 0.97, canyonLines);
}

float terrainElevation(vec3 samplePoint) {
  float warped = fbm(samplePoint * 0.75 + fbm(samplePoint * 1.8));
  float continents = fbm(samplePoint + vec3(warped * 1.4));
  float mountainProvince = smoothstep(0.44, 0.70, continents);
  float mountainSpine = smoothstep(0.59, 0.84, terrainRidges(samplePoint * 4.8 + vec3(8.3, 2.1, 5.7)));
  float alpineBreakup = smoothstep(0.67, 0.88, terrainRidges(samplePoint * 15.0 + vec3(2.4, 9.7, 14.2)));
  float mountains = mountainProvince * (mountainSpine * 0.075 + alpineBreakup * 0.022);
  return (continents - 0.5) * 0.080 + mountains - terrainCanyon(samplePoint) * 0.022;
}

float waterSeaProgress(float surfaceWater) {
  if (surfaceWater <= 0.10) return 0.0;
  if (surfaceWater <= 0.25) {
    float inlandProgress = smoothstep(0.10, 0.25, surfaceWater);
    return inlandProgress * 0.18;
  }
  float continentalProgress = (surfaceWater - 0.25) / 0.75;
  return 0.18 + pow(continentalProgress, 1.85) * 0.82;
}

float localThermalPosition(vec3 objectPosition, float elevation, float seed) {
  float latitude = abs(objectPosition.y);
  float latitudeClimate = 2.0 * sqrt(max(0.0, 1.0 - latitude * latitude)) - 1.0;
  float regionalNoise = fbm(objectPosition * 8.0 + vec3(seed * 0.01));
  float terrainSignal = (regionalNoise - 0.5) * 0.34 - smoothstep(0.02, 0.10, elevation) * 0.26;
  return clamp(latitudeClimate + terrainSignal * 0.55, -1.0, 1.0);
}
`;

/** Lowest possible radial displacement produced by the terrain convention. */
export const PLANET_TERRAIN_MIN_ELEVATION = -0.062;

/** Highest possible radial displacement produced by the terrain convention. */
export const PLANET_TERRAIN_MAX_ELEVATION = 0.14;

/** Lowest rendered ocean level, kept just above the deepest terrain basin. */
export const PLANET_WATER_MIN_ELEVATION = -0.06;

/** Highest liquid-ocean level, sufficient to cover the tallest terrain summit. */
export const PLANET_WATER_MAX_ELEVATION = 0.145;

/** Small radial expansion used for a completely frozen hydrosphere. */
export const PLANET_ICE_SURFACE_EXPANSION = 0.001;

export const PLANET_TERRAIN_VERTEX_SHADER = `
uniform float uSeed;
varying float vElevation;
varying float vCanyon;
varying vec3 vObjectPosition;
varying vec3 vNormalDirection;
varying vec3 vViewNormal;
varying vec3 vViewDirection;
${GLSL_NOISE}

void main() {
  vec3 samplePoint = normalize(position) * 2.7 + vec3(uSeed * 0.017);
  float elevation = terrainElevation(samplePoint);
  vec3 displaced = position * (1.0 + elevation);
  vec4 viewPosition = modelViewMatrix * vec4(displaced, 1.0);
  vElevation = elevation;
  vCanyon = terrainCanyon(samplePoint);
  vObjectPosition = normalize(position);
  vNormalDirection = normalize(mat3(modelMatrix) * normal);
  vViewNormal = normalize(normalMatrix * normal);
  vViewDirection = normalize(-viewPosition.xyz);
  gl_Position = projectionMatrix * viewPosition;
}
`;

export const PLANET_TERRAIN_FRAGMENT_SHADER = `
uniform float uSeed;
uniform float uSurfaceWater;
uniform float uLiquidWater;
uniform float uIceWater;
uniform float uMeanTemperatureC;
uniform float uTemperatureVariationC;
uniform float uEffectiveHumidity;
uniform float uPressurePresence;
uniform float uSandClimate;
uniform float uRadiation;
uniform float uBiosphere;
uniform float uMode;
uniform float uLightLevel;
uniform vec3 uLightDirection;
varying float vElevation;
varying float vCanyon;
varying vec3 vObjectPosition;
varying vec3 vNormalDirection;
varying vec3 vViewNormal;
varying vec3 vViewDirection;
${GLSL_NOISE}

vec3 temperatureRamp(float temperatureC) {
  vec3 cold = vec3(0.32, 0.72, 0.95);
  vec3 temperate = vec3(0.26, 0.78, 0.42);
  vec3 hot = vec3(0.96, 0.58, 0.18);
  vec3 molten = vec3(1.0, 0.09, 0.01);
  vec3 color = mix(cold, temperate, smoothstep(-80.0, 25.0, temperatureC));
  color = mix(color, hot, smoothstep(25.0, 700.0, temperatureC));
  return mix(color, molten, smoothstep(780.0, 1050.0, temperatureC));
}

void main() {
  float localNoise = fbm(vObjectPosition * 8.0 + vec3(uSeed * 0.01));
  float moistureSupply = clamp(uEffectiveHumidity * 0.72 + uLiquidWater * 0.55 + uSurfaceWater * 0.08, 0.0, 1.0);
  float moisture = moistureSupply * (0.72 + localNoise * 0.42);
  float thermalPosition = localThermalPosition(vObjectPosition, vElevation, uSeed);
  float localTemperatureC = uMeanTemperatureC + uTemperatureVariationC * thermalPosition;
  float localFreeze = 1.0 - smoothstep(-2.0, 2.0, localTemperatureC);
  float iceSupply = smoothstep(0.001, 0.65, uIceWater);
  float ice = localFreeze * iceSupply * (0.34 + uIceWater * 0.66);
  float dry = 1.0 - smoothstep(0.08, 0.48, moisture);
  float unfrozenGround = smoothstep(-12.0, 5.0, localTemperatureC);
  float sandWeathering = 0.58 + smoothstep(8.0, 45.0, localTemperatureC) * 0.42;
  float desert = dry * unfrozenGround * sandWeathering * uSandClimate * (1.0 - ice);
  float temperateMoisture = smoothstep(0.16, 0.68, moisture);
  float vegetationThermal = smoothstep(-8.0, 8.0, localTemperatureC) * (1.0 - smoothstep(45.0, 60.0, localTemperatureC));
  float mountain = smoothstep(0.035, 0.105, vElevation);
  float riverLines = 1.0 - smoothstep(0.018, 0.052, abs(fbm(vObjectPosition * 16.0 + vec3(uSeed * 0.043)) - 0.5));
  float riverSupply = smoothstep(0.001, 0.10, uLiquidWater);
  float largerWaterBodies = smoothstep(0.10, 0.25, uSurfaceWater);
  float river = riverLines * riverSupply * (1.0 - largerWaterBodies * 0.72) * (1.0 - smoothstep(0.025, 0.105, vElevation));
  float riverFreeze = localFreeze * smoothstep(0.0001, 0.02, uIceWater);
  float bioCoverage = smoothstep(0.24, 0.72, uBiosphere);
  float bioMask = smoothstep(0.42, 0.64, fbm(vObjectPosition * 11.0 + vec3(uSeed * 0.031))) * temperateMoisture * vegetationThermal * bioCoverage;
  float heatStress = smoothstep(65.0, 115.0, localTemperatureC);
  float moltenRock = smoothstep(780.0, 1050.0, localTemperatureC);
  float lavaChannels = smoothstep(0.48, 0.78, 1.0 - abs(fbm(vObjectPosition * 14.0 + vec3(uSeed * 0.071)) * 2.0 - 1.0));

  vec3 rock = mix(vec3(0.19, 0.16, 0.15), vec3(0.38, 0.31, 0.25), localNoise);
  vec3 desertColor = vec3(0.64, 0.43, 0.22);
  vec3 dampSoilColor = vec3(0.24, 0.20, 0.17);
  vec3 temperateGroundColor = vec3(0.12, 0.32, 0.18);
  vec3 biosphereColor = vec3(0.08, 0.47, 0.24);
  float temperateGround = temperateMoisture * vegetationThermal * smoothstep(0.18, 0.7, uSurfaceWater) * uPressurePresence;
  vec3 color = rock;
  color = mix(color, desertColor, desert * 0.82);
  color = mix(color, mix(dampSoilColor, temperateGroundColor, temperateGround), temperateMoisture * (1.0 - desert) * 0.68);
  color = mix(color, vec3(0.075, 0.052, 0.035), vCanyon * (1.0 - ice) * 0.58);
  color = mix(color, vec3(0.52, 0.49, 0.46), mountain * 0.75);
  color = mix(color, mix(vec3(0.13, 0.08, 0.06), vec3(0.32, 0.16, 0.08), localNoise), heatStress * 0.86);
  vec3 lavaColor = mix(vec3(0.24, 0.018, 0.004), vec3(1.0, 0.24, 0.008), lavaChannels);
  color = mix(color, lavaColor, moltenRock * (0.46 + lavaChannels * 0.54));
  color = mix(color, biosphereColor, bioMask * 0.98);
  color = mix(color, vec3(0.82, 0.91, 0.98), ice);
  vec3 riverColor = mix(vec3(0.025, 0.19, 0.25), vec3(0.74, 0.88, 0.93), riverFreeze);
  color = mix(color, riverColor, river * (0.82 - ice * 0.22));

  if (uMode > 0.5 && uMode < 1.5) {
    color = temperatureRamp(localTemperatureC);
  }
  if (uMode > 1.5) {
    float exposure = clamp(uRadiation + (localNoise - 0.5) * 0.18, 0.0, 1.0);
    color = exposure < 0.5
      ? mix(vec3(0.035, 0.16, 0.44), vec3(0.86, 0.58, 0.12), exposure * 2.0)
      : mix(vec3(0.86, 0.58, 0.12), vec3(1.0, 0.055, 0.018), (exposure - 0.5) * 2.0);
  }

  float sunFacing = dot(normalize(vNormalDirection), normalize(uLightDirection));
  float directLight = smoothstep(-0.08, 0.28, sunFacing);
  float nightLight = 0.075 + uLightLevel * 0.035;
  float diffuse = nightLight + directLight * (0.24 + uLightLevel * 0.94);
  float viewRim = pow(1.0 - max(dot(normalize(vViewNormal), normalize(vViewDirection)), 0.0), 2.0);
  vec3 lavaEmission = moltenRock * lavaChannels * vec3(0.88, 0.11, 0.004);
  vec3 litColor = color * diffuse + viewRim * uPressurePresence * vec3(0.014, 0.032, 0.045) + lavaEmission;
  gl_FragColor = vec4(litColor, 1.0);
}
`;

export const PLANET_WATER_VERTEX_SHADER = `
uniform float uSurfaceWater;
uniform float uIceWater;
varying vec3 vObjectPosition;
varying vec3 vNormalDirection;
varying vec3 vViewNormal;
varying vec3 vViewDirection;
${GLSL_NOISE}
void main() {
  float seaLevel = mix(
    ${PLANET_WATER_MIN_ELEVATION.toFixed(4)},
    ${PLANET_WATER_MAX_ELEVATION.toFixed(4)},
    waterSeaProgress(uSurfaceWater)
  );
  seaLevel += smoothstep(0.0, 1.0, uIceWater) * ${PLANET_ICE_SURFACE_EXPANSION.toFixed(4)};
  vec3 displaced = position * (1.0 + seaLevel);
  vec4 viewPosition = modelViewMatrix * vec4(displaced, 1.0);
  vObjectPosition = normalize(position);
  vNormalDirection = normalize(mat3(modelMatrix) * normal);
  vViewNormal = normalize(normalMatrix * normal);
  vViewDirection = normalize(-viewPosition.xyz);
  gl_Position = projectionMatrix * viewPosition;
}
`;

export const PLANET_WATER_FRAGMENT_SHADER = `
uniform float uSeed;
uniform float uSurfaceWater;
uniform float uIceWater;
uniform float uMeanTemperatureC;
uniform float uTemperatureVariationC;
uniform float uBiosphere;
uniform float uTime;
uniform vec3 uLightDirection;
varying vec3 vObjectPosition;
varying vec3 vNormalDirection;
varying vec3 vViewNormal;
varying vec3 vViewDirection;
${GLSL_NOISE}
void main() {
  if (uSurfaceWater < 0.002) discard;
  vec3 samplePoint = vObjectPosition * 2.7 + vec3(uSeed * 0.017);
  float localTerrainElevation = terrainElevation(samplePoint);
  float seaLevel = mix(
    ${PLANET_WATER_MIN_ELEVATION.toFixed(4)},
    ${PLANET_WATER_MAX_ELEVATION.toFixed(4)},
    waterSeaProgress(uSurfaceWater)
  );
  float oceanMask = 1.0 - smoothstep(seaLevel - 0.0035, seaLevel + 0.0035, localTerrainElevation);
  if (oceanMask < 0.02) discard;
  float wave = fbm(vObjectPosition * 18.0 + vec3(uTime * 0.025, 0.0, 0.0));
  float fresnel = pow(1.0 - max(dot(normalize(vViewNormal), normalize(vViewDirection)), 0.0), 2.2);
  float thermalPosition = localThermalPosition(vObjectPosition, localTerrainElevation, uSeed);
  float localTemperatureC = uMeanTemperatureC + uTemperatureVariationC * thermalPosition;
  float localFreeze = 1.0 - smoothstep(-2.0, 2.0, localTemperatureC);
  float iceSupply = smoothstep(0.0001, 0.02, uIceWater);
  float freeze = localFreeze * iceSupply;
  float bloom = smoothstep(0.62, 0.79, fbm(vObjectPosition * 13.0 + vec3(uSeed * 0.037))) * uBiosphere * (1.0 - freeze);
  vec3 deep = vec3(0.015, 0.12, 0.23);
  vec3 shallow = vec3(0.03, 0.42, 0.52);
  vec3 color = mix(deep, shallow, wave * 0.58 + fresnel * 0.42);
  color = mix(color, vec3(0.06, 0.42, 0.31), bloom * 0.68);
  color = mix(color, vec3(0.74, 0.88, 0.93), freeze * (0.72 + wave * 0.18));
  float sunFacing = dot(normalize(vNormalDirection), normalize(uLightDirection));
  float directLight = smoothstep(-0.08, 0.28, sunFacing);
  color *= 0.08 + directLight * 0.92;
  gl_FragColor = vec4(color, mix(oceanMask * 0.9, 1.0, freeze));
}
`;

export const PLANET_CLOUD_VERTEX_SHADER = `
varying vec3 vObjectPosition;
varying vec3 vNormalDirection;
void main() {
  vObjectPosition = normalize(position);
  vNormalDirection = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const PLANET_CLOUD_FRAGMENT_SHADER = `
uniform float uSeed;
uniform float uClouds;
uniform float uPressurePresence;
uniform float uVaporWater;
uniform float uTime;
uniform vec3 uLightDirection;
varying vec3 vObjectPosition;
varying vec3 vNormalDirection;
${GLSL_NOISE}
void main() {
  float cloudPresence = uClouds * uPressurePresence;
  if (cloudPresence < 0.01) discard;
  vec3 moving = vObjectPosition * 7.5 + vec3(uSeed * 0.023, uTime * 0.018, 0.0);
  float cloud = fbm(moving);
  float mask = smoothstep(0.68 - cloudPresence * 0.23, 0.78 - cloudPresence * 0.12, cloud);
  if (mask < 0.015) discard;
  float directLight = smoothstep(-0.08, 0.28, dot(normalize(vNormalDirection), normalize(uLightDirection)));
  float shadowShade = 0.28 + directLight * 0.64;
  vec3 coldCloud = vec3(shadowShade * 0.9, shadowShade * 0.94, shadowShade);
  vec3 vaporCloud = vec3(shadowShade * 1.02, shadowShade, shadowShade * 0.96);
  float vapor = smoothstep(0.02, 0.6, uVaporWater);
  gl_FragColor = vec4(mix(coldCloud, vaporCloud, vapor), mask * (0.14 + cloudPresence * (0.58 + vapor * 0.22)));
}
`;

export const ATMOSPHERE_VERTEX_SHADER = `
varying vec3 vNormalDirection;
varying vec3 vViewNormal;
varying vec3 vViewDirection;
void main() {
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  vNormalDirection = normalize(mat3(modelMatrix) * normal);
  vViewNormal = normalize(normalMatrix * normal);
  vViewDirection = normalize(-viewPosition.xyz);
  gl_Position = projectionMatrix * viewPosition;
}
`;

export const ATMOSPHERE_FRAGMENT_SHADER = `
uniform vec3 uAtmosphereColor;
uniform float uDensity;
uniform float uDaylight;
uniform vec3 uLightDirection;
varying vec3 vNormalDirection;
varying vec3 vViewNormal;
varying vec3 vViewDirection;
void main() {
  if (uDensity < 0.004) discard;
  float fresnel = pow(1.0 - max(dot(normalize(vViewNormal), vViewDirection), 0.0), 2.7);
  float sunlight = max(dot(normalize(vNormalDirection), normalize(uLightDirection)), 0.0);
  float daySide = 0.16 + sunlight * (0.18 + uDaylight * 0.66);
  float alpha = fresnel * (0.08 + uDensity * 0.82) * (0.45 + sunlight * 0.55);
  vec3 color = uAtmosphereColor * daySide + vec3(0.03, 0.06, 0.14) * (1.0 - daySide);
  gl_FragColor = vec4(color, alpha);
}
`;

export const RADIATION_VERTEX_SHADER = `
varying vec3 vObjectPosition;
varying vec3 vViewNormal;
varying vec3 vViewDirection;
void main() {
  vObjectPosition = normalize(position);
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  vViewNormal = normalize(normalMatrix * normal);
  vViewDirection = normalize(-viewPosition.xyz);
  gl_Position = projectionMatrix * viewPosition;
}
`;

export const RADIATION_FRAGMENT_SHADER = `
uniform float uRadiation;
uniform float uMode;
uniform float uTime;
varying vec3 vObjectPosition;
varying vec3 vViewNormal;
varying vec3 vViewDirection;
${GLSL_NOISE}
void main() {
  float modeVisibility = uMode > 1.45 ? 1.0 : 0.0;
  if (modeVisibility < 0.01 || uRadiation < 0.002) discard;
  float effectiveExposure = clamp(uRadiation, 0.0, 1.0);
  float movingNoise = fbm(vObjectPosition * 10.0 + vec3(0.0, uTime * 0.18, 0.0));
  float pulses = smoothstep(0.64, 0.86, movingNoise);
  float rim = pow(1.0 - max(dot(normalize(vViewNormal), normalize(vViewDirection)), 0.0), 2.2);
  vec3 color = mix(vec3(0.08, 0.32, 1.0), vec3(1.0, 0.06, 0.015), effectiveExposure);
  float alpha = modeVisibility * (0.025 + rim * 0.18 + pulses * 0.16) * (0.25 + effectiveExposure * 0.75);
  gl_FragColor = vec4(color, alpha);
}
`;

export const MAGNETIC_FIELD_VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const MAGNETIC_FIELD_FRAGMENT_SHADER = `
uniform float uIntensity;
uniform float uTime;
varying vec2 vUv;
void main() {
  if (uIntensity < 0.005) discard;
  float flow = 0.55 + 0.45 * sin(vUv.x * 34.0 - uTime * 1.8);
  float visibility = smoothstep(0.015, 0.22, uIntensity);
  vec3 color = mix(vec3(0.08, 0.45, 0.76), vec3(0.2, 0.95, 0.88), flow);
  gl_FragColor = vec4(color, visibility * (0.09 + flow * 0.28));
}
`;

export const AURORA_VERTEX_SHADER = `
varying vec3 vObjectPosition;
void main() {
  vObjectPosition = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const AURORA_FRAGMENT_SHADER = `
uniform float uIntensity;
uniform float uTime;
varying vec3 vObjectPosition;
${GLSL_NOISE}
void main() {
  if (uIntensity < 0.01) discard;
  float latitude = abs(vObjectPosition.y);
  float oval = smoothstep(0.42, 0.62, latitude) * (1.0 - smoothstep(0.88, 0.98, latitude));
  float arc = fbm(vObjectPosition * 8.0 + vec3(0.0, uTime * 0.08, 0.0));
  float curtain = smoothstep(0.43, 0.7, arc) * oval;
  float folds = 0.6 + 0.4 * sin(atan(vObjectPosition.z, vObjectPosition.x) * 19.0 + uTime * 1.4 + arc * 6.0);
  vec3 color = mix(vec3(0.06, 0.95, 0.44), vec3(0.42, 0.22, 1.0), arc);
  gl_FragColor = vec4(color, uIntensity * curtain * folds * 0.56);
}
`;

export const SUN_VERTEX_SHADER = `
varying vec3 vObjectPosition;
varying vec3 vViewNormal;
varying vec3 vViewDirection;
void main() {
  vObjectPosition = normalize(position);
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  vViewNormal = normalize(normalMatrix * normal);
  vViewDirection = normalize(-viewPosition.xyz);
  gl_Position = projectionMatrix * viewPosition;
}
`;

export const SUN_FRAGMENT_SHADER = `
uniform float uTime;
varying vec3 vObjectPosition;
varying vec3 vViewNormal;
varying vec3 vViewDirection;
${GLSL_NOISE}
void main() {
  vec3 direction = normalize(vObjectPosition);
  float slowTime = uTime * 0.028;
  float broadFlow = fbm(direction * 3.2 + vec3(slowTime, -slowTime * 0.7, slowTime * 0.35));
  vec3 warped = direction * 7.5 + vec3(broadFlow * 2.4, -broadFlow * 1.6, broadFlow * 1.1);
  float cells = fbm(warped + vec3(-slowTime * 1.2, slowTime * 0.9, slowTime * 0.55));
  float fineCells = fbm(direction * 22.0 + vec3(slowTime * 2.1, 0.0, -slowTime * 1.3));
  float filaments = 1.0 - abs(cells * 2.0 - 1.0);
  filaments = smoothstep(0.43, 0.82, filaments + fineCells * 0.18);
  float hotCells = smoothstep(0.48, 0.88, broadFlow * 0.55 + fineCells * 0.7);
  float limb = pow(1.0 - max(dot(normalize(vViewNormal), normalize(vViewDirection)), 0.0), 2.3);

  vec3 ember = vec3(0.72, 0.105, 0.018);
  vec3 orange = vec3(1.0, 0.31, 0.055);
  vec3 whiteHot = vec3(1.0, 0.94, 0.69);
  vec3 color = mix(orange, whiteHot, hotCells * 0.84 + fineCells * 0.14);
  color = mix(color, ember, filaments * (0.34 + (1.0 - hotCells) * 0.34));
  color += whiteHot * (0.16 + limb * 0.72);
  gl_FragColor = vec4(color, 1.0);
}
`;

export const SUN_CORONA_VERTEX_SHADER = `
varying vec3 vObjectPosition;
varying vec3 vViewNormal;
varying vec3 vViewDirection;
void main() {
  vObjectPosition = normalize(position);
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  vViewNormal = normalize(normalMatrix * normal);
  vViewDirection = normalize(-viewPosition.xyz);
  gl_Position = projectionMatrix * viewPosition;
}
`;

export const SUN_CORONA_FRAGMENT_SHADER = `
uniform float uTime;
varying vec3 vObjectPosition;
varying vec3 vViewNormal;
varying vec3 vViewDirection;
${GLSL_NOISE}
void main() {
  float viewFacing = max(dot(normalize(vViewNormal), normalize(vViewDirection)), 0.0);
  float rim = pow(1.0 - viewFacing, 2.9);
  float turbulence = fbm(vObjectPosition * 6.5 + vec3(uTime * 0.018, -uTime * 0.012, 0.0));
  float prominence = smoothstep(0.62, 0.86, turbulence) * pow(1.0 - viewFacing, 1.35);
  vec3 color = mix(vec3(1.0, 0.22, 0.025), vec3(1.0, 0.82, 0.38), turbulence);
  float alpha = rim * (0.14 + turbulence * 0.2) + prominence * 0.2;
  gl_FragColor = vec4(color, alpha);
}
`;

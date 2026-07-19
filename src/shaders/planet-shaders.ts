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
`;

export const PLANET_TERRAIN_VERTEX_SHADER = `
uniform float uSeed;
varying float vElevation;
varying float vContinental;
varying vec3 vObjectPosition;
varying vec3 vNormalDirection;
${GLSL_NOISE}

void main() {
  vec3 samplePoint = normalize(position) * 2.7 + vec3(uSeed * 0.017);
  float warped = fbm(samplePoint * 0.75 + fbm(samplePoint * 1.8));
  float continents = fbm(samplePoint + vec3(warped * 1.4));
  float ridges = 1.0 - abs(fbm(samplePoint * 3.4) * 2.0 - 1.0);
  float elevation = (continents - 0.5) * 0.095 + pow(ridges, 3.0) * 0.035;
  vec3 displaced = position * (1.0 + elevation);
  vElevation = elevation;
  vContinental = continents;
  vObjectPosition = normalize(position);
  vNormalDirection = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

export const PLANET_TERRAIN_FRAGMENT_SHADER = `
uniform float uSeed;
uniform float uWater;
uniform float uTemperature;
uniform float uHumidity;
uniform float uPressure;
uniform float uRadiation;
uniform float uMagnetic;
uniform float uBiosphere;
uniform float uMode;
uniform float uLightLevel;
uniform vec3 uLightDirection;
varying float vElevation;
varying float vContinental;
varying vec3 vObjectPosition;
varying vec3 vNormalDirection;
${GLSL_NOISE}

vec3 temperatureRamp(float value) {
  vec3 cold = vec3(0.32, 0.72, 0.95);
  vec3 temperate = vec3(0.26, 0.78, 0.42);
  vec3 hot = vec3(0.96, 0.58, 0.18);
  return value < 0.5 ? mix(cold, temperate, value * 2.0) : mix(temperate, hot, (value - 0.5) * 2.0);
}

void main() {
  float latitude = abs(vObjectPosition.y);
  float localNoise = fbm(vObjectPosition * 8.0 + vec3(uSeed * 0.01));
  float moisture = clamp(uHumidity * 0.7 + uWater * 0.42 + (localNoise - 0.5) * 0.35, 0.0, 1.0);
  float normalizedTemperature = clamp(uTemperature - latitude * 0.52 - max(vElevation, 0.0) * 3.8, 0.0, 1.0);
  float pressurePresence = smoothstep(0.01, 0.08, uPressure);
  float globalIce = (1.0 - smoothstep(0.12, 0.28, uTemperature)) * step(0.01, uWater) * pressurePresence;
  float polarIce = smoothstep(0.42, 0.72, latitude + (0.42 - uTemperature) * 0.72) * (0.35 + uWater * 0.65) * pressurePresence;
  float ice = max(globalIce, polarIce * (1.0 - globalIce));
  float desert = (1.0 - smoothstep(0.05, 0.28, moisture)) * smoothstep(0.38, 0.72, normalizedTemperature);
  float fertile = smoothstep(0.28, 0.72, moisture) * smoothstep(0.18, 0.5, normalizedTemperature) * (1.0 - smoothstep(0.72, 0.9, normalizedTemperature));
  float mountain = smoothstep(0.035, 0.075, vElevation);
  float bioMask = smoothstep(0.48, 0.7, fbm(vObjectPosition * 11.0 + vec3(uSeed * 0.031))) * fertile * uBiosphere;
  float extremeHeat = smoothstep(0.70, 0.80, uTemperature);
  float lavaChannels = smoothstep(0.42, 0.68, localNoise + mountain * 0.24);
  float volcanic = extremeHeat * lavaChannels;

  vec3 rock = mix(vec3(0.19, 0.16, 0.15), vec3(0.38, 0.31, 0.25), localNoise);
  vec3 desertColor = vec3(0.56, 0.36, 0.17);
  vec3 fertileColor = vec3(0.12, 0.29, 0.18);
  vec3 biosphereColor = vec3(0.08, 0.47, 0.24);
  vec3 color = rock;
  color = mix(color, desertColor, desert * 0.82);
  color = mix(color, fertileColor, fertile * 0.72);
  color = mix(color, vec3(0.52, 0.49, 0.46), mountain * 0.75);
  color = mix(color, mix(vec3(0.08, 0.025, 0.012), vec3(1.0, 0.19, 0.018), smoothstep(0.42, 0.74, localNoise)), volcanic * 0.96);
  color = mix(color, biosphereColor, bioMask * 0.9);
  color = mix(color, vec3(0.82, 0.91, 0.98), ice);

  if (uMode > 0.5 && uMode < 1.5) {
    color = temperatureRamp(normalizedTemperature);
  }
  if (uMode > 1.5) {
    float exposure = clamp(uRadiation / (0.08 + uMagnetic * 0.82) + (localNoise - 0.5) * 0.18, 0.0, 1.0);
    color = exposure < 0.5
      ? mix(vec3(0.035, 0.16, 0.44), vec3(0.86, 0.58, 0.12), exposure * 2.0)
      : mix(vec3(0.86, 0.58, 0.12), vec3(1.0, 0.055, 0.018), (exposure - 0.5) * 2.0);
  }

  float sunFacing = dot(normalize(vNormalDirection), normalize(uLightDirection));
  float directLight = smoothstep(-0.08, 0.28, sunFacing);
  float nightLight = 0.025 + uLightLevel * 0.035;
  float diffuse = nightLight + directLight * (0.34 + uLightLevel * 0.92);
  float viewRim = pow(1.0 - max(dot(normalize(vObjectPosition), vec3(0.0, 0.0, 1.0)), 0.0), 2.0);
  vec3 litColor = color * diffuse + viewRim * vec3(0.012, 0.028, 0.04);
  litColor += vec3(1.0, 0.12, 0.01) * volcanic * (0.28 + localNoise * 0.32);
  gl_FragColor = vec4(litColor, 1.0);
}
`;

export const PLANET_WATER_VERTEX_SHADER = `
uniform float uWater;
uniform float uTemperature;
varying vec3 vObjectPosition;
varying vec3 vNormalDirection;
void main() {
  vObjectPosition = normalize(position);
  vNormalDirection = normalize(mat3(modelMatrix) * normal);
  float seaLevel = mix(0.002, 0.115, smoothstep(0.0, 1.0, uWater));
  float globalIce = 1.0 - smoothstep(0.12, 0.28, uTemperature);
  seaLevel = mix(seaLevel, 0.12, globalIce * step(0.01, uWater));
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position * (1.0 + seaLevel), 1.0);
}
`;

export const PLANET_WATER_FRAGMENT_SHADER = `
uniform float uSeed;
uniform float uWater;
uniform float uTemperature;
uniform float uPressure;
uniform float uBiosphere;
uniform float uTime;
uniform vec3 uLightDirection;
varying vec3 vObjectPosition;
varying vec3 vNormalDirection;
${GLSL_NOISE}
void main() {
  if (uWater < 0.002) discard;
  float pressureStability = smoothstep(0.01, 0.08, uPressure);
  if (pressureStability < 0.01) discard;
  vec3 samplePoint = vObjectPosition * 2.7 + vec3(uSeed * 0.017);
  float warped = fbm(samplePoint * 0.75 + fbm(samplePoint * 1.8));
  float terrain = fbm(samplePoint + vec3(warped * 1.4));
  float threshold = mix(-0.05, 1.05, uWater);
  float globalIce = 1.0 - smoothstep(0.12, 0.28, uTemperature);
  float extremeHeat = smoothstep(0.70, 0.80, uTemperature);
  float stableWater = pressureStability * (1.0 - extremeHeat);
  float oceanMask = (1.0 - smoothstep(threshold - 0.045, threshold + 0.045, terrain)) * stableWater;
  oceanMask = max(oceanMask, globalIce * pressureStability * step(0.01, uWater));
  if (oceanMask < 0.02) discard;
  float wave = fbm(vObjectPosition * 18.0 + vec3(uTime * 0.025, 0.0, 0.0));
  float fresnel = pow(1.0 - abs(dot(normalize(vNormalDirection), vec3(0.0, 0.0, 1.0))), 2.2);
  float polarFreeze = smoothstep(0.48, 0.82, abs(vObjectPosition.y) + (0.42 - uTemperature) * 0.9);
  float freeze = max(globalIce, polarFreeze);
  float bloom = smoothstep(0.62, 0.79, fbm(vObjectPosition * 13.0 + vec3(uSeed * 0.037))) * uBiosphere * (1.0 - freeze);
  vec3 deep = vec3(0.015, 0.12, 0.23);
  vec3 shallow = vec3(0.03, 0.42, 0.52);
  vec3 color = mix(deep, shallow, wave * 0.58 + fresnel * 0.42);
  color = mix(color, vec3(0.06, 0.42, 0.31), bloom * 0.68);
  color = mix(color, vec3(0.74, 0.88, 0.93), freeze * (0.72 + wave * 0.18));
  float sunFacing = dot(normalize(vNormalDirection), normalize(uLightDirection));
  float directLight = smoothstep(-0.08, 0.28, sunFacing);
  color *= 0.035 + directLight * 0.965;
  gl_FragColor = vec4(color, mix(oceanMask * 0.9, 1.0, globalIce));
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
uniform float uPressure;
uniform float uTemperature;
uniform float uTime;
uniform vec3 uLightDirection;
varying vec3 vObjectPosition;
varying vec3 vNormalDirection;
${GLSL_NOISE}
void main() {
  float atmospherePresence = smoothstep(0.01, 0.08, uPressure);
  float heatClearing = 1.0 - smoothstep(0.70, 0.82, uTemperature);
  float cloudPresence = uClouds * atmospherePresence * heatClearing;
  if (cloudPresence < 0.01) discard;
  vec3 moving = vObjectPosition * 7.5 + vec3(uSeed * 0.023, uTime * 0.018, 0.0);
  float cloud = fbm(moving);
  float mask = smoothstep(0.68 - cloudPresence * 0.23, 0.78 - cloudPresence * 0.12, cloud);
  if (mask < 0.015) discard;
  float directLight = smoothstep(-0.08, 0.28, dot(normalize(vNormalDirection), normalize(uLightDirection)));
  gl_FragColor = vec4(vec3(0.18 + directLight * 0.72, 0.24 + directLight * 0.68, 0.31 + directLight * 0.62), mask * (0.14 + cloudPresence * 0.58));
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
  float daySide = 0.1 + sunlight * (0.25 + uDaylight * 0.75);
  float alpha = fresnel * (0.08 + uDensity * 0.82) * (0.45 + sunlight * 0.55);
  vec3 color = uAtmosphereColor * daySide + vec3(0.03, 0.06, 0.14) * (1.0 - daySide);
  gl_FragColor = vec4(color, alpha);
}
`;

export const RADIATION_VERTEX_SHADER = `
varying vec3 vObjectPosition;
varying vec3 vWorldNormal;
varying vec3 vViewDirection;
void main() {
  vObjectPosition = normalize(position);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  vViewDirection = normalize(-viewPosition.xyz);
  gl_Position = projectionMatrix * viewPosition;
}
`;

export const RADIATION_FRAGMENT_SHADER = `
uniform float uRadiation;
uniform float uMagnetic;
uniform float uMode;
uniform float uTime;
varying vec3 vObjectPosition;
varying vec3 vWorldNormal;
varying vec3 vViewDirection;
${GLSL_NOISE}
void main() {
  float modeVisibility = smoothstep(1.45, 1.9, uMode);
  if (modeVisibility < 0.01 || uRadiation < 0.002) discard;
  float effectiveExposure = clamp(uRadiation / (0.08 + uMagnetic * 0.82), 0.0, 1.0);
  float movingNoise = fbm(vObjectPosition * 10.0 + vec3(0.0, uTime * 0.18, 0.0));
  float pulses = smoothstep(0.64, 0.86, movingNoise);
  float rim = pow(1.0 - max(dot(normalize(vWorldNormal), normalize(vViewDirection)), 0.0), 2.2);
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
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const AURORA_FRAGMENT_SHADER = `
uniform float uIntensity;
uniform float uTime;
varying vec2 vUv;
void main() {
  if (uIntensity < 0.01) discard;
  float curtain = 0.48 + 0.52 * sin(vUv.x * 52.0 + sin(vUv.x * 9.0 - uTime * 0.7) * 2.4 - uTime * 1.9);
  float edge = sin(vUv.y * 3.14159265);
  vec3 color = mix(vec3(0.12, 1.0, 0.58), vec3(0.18, 0.54, 1.0), curtain);
  gl_FragColor = vec4(color, uIntensity * curtain * edge * 0.72);
}
`;

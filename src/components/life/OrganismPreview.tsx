"use client";

import Image from "next/image";
import { useId, useMemo } from "react";

import type { LifeTraitId, PlanetState } from "@/domain/simulator/schema";
import { deriveWorldInteractionState } from "@/domain/world/interactions";

import { ORGANISM_VISUALIZED_TRAITS } from "./organism-visual-traits";

type OrganismPreviewProps = {
  planet: PlanetState;
  traitIds: LifeTraitId[];
  imageDataUrl: string | null;
  label: string;
};

/** Produces a stable positive integer for procedural organism features. */
function stableHash(value: string): number {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

/** Renders planet-backed terrain and a deterministic anatomical response for selected traits. */
export default function OrganismPreview({ planet, traitIds, imageDataUrl, label }: OrganismPreviewProps) {
  const localId = useId().replaceAll(":", "");
  const has = (trait: LifeTraitId) => traitIds.includes(trait);
  const interactions = useMemo(() => deriveWorldInteractionState(planet.world), [planet.world]);
  const hash = useMemo(() => stableHash(`${planet.seed}:${[...traitIds].sort().join(":")}`), [planet.seed, traitIds]);
  const temperature = planet.world.averageTemperatureC;
  const hue = (hash % 4) * 52 + 36;
  const bodyRadius = has("unicellular") ? 25 : has("largeBody") ? 64 : has("compactBody") ? 42 : 52;
  const bodyScaleY = has("aquaticMovement") ? 0.66 : has("aerialMovement") ? 0.75 : has("bipedalPosture") ? 1.18 : 0.92;
  const waterY = 278 - interactions.surfaceWaterFraction * 92;
  const cold = temperature <= 0;
  const hot = temperature >= 70;
  const sky = interactions.atmospherePresence < 0.02 ? "#01040a" : cold ? "#10283c" : hot ? "#3b1714" : "#12342f";
  const terrain = cold ? "#b8d9e5" : hot ? "#542216" : interactions.effectiveHumidity > 0.35 ? "#194334" : "#5a3c29";
  const bodyGradient = `body-${localId}`;
  const glow = `glow-${localId}`;

  if (imageDataUrl) {
    return (
      <div aria-label={label} className="organism-preview organism-preview-generated" role="img">
        <Image alt={label} className="object-contain" fill sizes="(max-width: 1100px) 100vw, 540px" src={imageDataUrl} unoptimized />
        <div className="organism-image-vignette" />
      </div>
    );
  }

  return (
    <div aria-label={label} className="organism-preview" role="img">
      <svg aria-hidden="true" viewBox="0 0 360 300">
        <defs>
          <radialGradient id={bodyGradient} cx="36%" cy="26%" r="82%">
            <stop offset="0" stopColor={`hsl(${has("photosynthesis") ? 126 : hue} 48% 57%)`} />
            <stop offset="0.62" stopColor={`hsl(${hue} 38% 30%)`} />
            <stop offset="1" stopColor={`hsl(${(hue + 330) % 360} 36% 12%)`} />
          </radialGradient>
          <filter id={glow} x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="4" /></filter>
          <linearGradient id={`sky-${localId}`} x1="0" y1="0" x2="0" y2="1"><stop stopColor={sky} /><stop offset="1" stopColor="#050912" /></linearGradient>
        </defs>

        <rect fill={`url(#sky-${localId})`} height="300" width="360" />
        {interactions.atmospherePresence < 0.02 && Array.from({ length: 18 }).map((_, index) => <circle cx={(index * 67 + hash) % 350} cy={(index * 37 + 13) % 150} fill="#dff8ff" key={index} opacity=".55" r={index % 4 === 0 ? 1.2 : .6} />)}
        <circle cx="290" cy="46" fill={hot ? "#ffbd78" : "#dff7ff"} opacity={0.12 + planet.world.lightLevel * 0.28} r="24" />
        <path d="M0 218 Q55 185 108 215 T218 207 T360 214 V300 H0 Z" fill={terrain} />
        <path d="M0 241 Q70 220 142 244 T280 231 T360 239 V300 H0 Z" fill={cold ? "#d9edf4" : hot ? "#32100d" : "#0b1b18"} opacity=".72" />
        {interactions.surfaceWaterFraction > 0.002 && <path d={`M0 ${waterY} Q90 ${waterY - 4} 180 ${waterY} T360 ${waterY} V300 H0 Z`} fill={cold ? "#cfeaf2" : "#15566e"} opacity={cold ? .84 : .62} />}
        {hot && <path d="M0 268 Q64 255 118 273 T240 265 T360 270" fill="none" stroke="#ff6b24" strokeWidth="5" opacity=".7" />}
        <ellipse cx="180" cy="249" fill="#00050a" opacity=".55" rx={bodyRadius + 48} ry="11" />

        {has("radialSymmetry") && Array.from({ length: 8 }).map((_, index) => {
          const angle = (index / 8) * Math.PI * 2;
          const x = 180 + Math.cos(angle) * (bodyRadius + 25);
          const y = 158 + Math.sin(angle) * (bodyRadius * bodyScaleY + 18);
          return <path d={`M180 158 Q${180 + Math.cos(angle) * bodyRadius} ${158 + Math.sin(angle) * bodyRadius} ${x} ${y}`} key={index} fill="none" stroke={`hsl(${hue} 34% 30%)`} strokeWidth="7" strokeLinecap="round" />;
        })}
        {has("aerialMovement") && <g fill={`hsl(${hue + 35} 38% 38%)`} opacity=".74" stroke="#d9fbff" strokeOpacity=".25"><path d="M149 146 C100 76 53 91 35 130 C80 119 111 145 151 174Z" /><path d="M211 146 C260 76 307 91 325 130 C280 119 249 145 209 174Z" /></g>}
        {has("aquaticMovement") && <><path d="M224 158 C273 115 322 129 340 161 C304 175 272 190 225 174Z" fill={`hsl(${hue + 34} 40% 34%)`} /><path d="M181 115 Q205 88 224 116" fill={`hsl(${hue + 28} 38% 39%)`} /></>}
        {has("terrestrialMovement") && !has("bipedalPosture") && <g fill="none" stroke={`hsl(${hue} 34% 25%)`} strokeWidth="8" strokeLinecap="round"><path d="M151 184 L126 218 L105 244" /><path d="M209 184 L234 218 L255 244" /><path d="M162 190 L151 231" /><path d="M198 190 L209 231" /></g>}
        {has("bipedalPosture") && <g fill="none" stroke={`hsl(${hue} 36% 25%)`} strokeWidth="12" strokeLinecap="round"><path d="M165 191 L158 240 L142 249" /><path d="M195 191 L202 240 L218 249" /></g>}
        {has("graspingLimbs") && <g fill="none" stroke={`hsl(${hue} 38% 28%)`} strokeWidth="8" strokeLinecap="round"><path d="M145 152 Q110 175 99 211" /><path d="M215 152 Q250 175 261 211" />{has("opposableDigits") && <><path d="M99 211 l-10 8 m10-8 l2 13 m-2-13 l10 8" strokeWidth="3" /><path d="M261 211 l-10 8 m10-8 l-2 13 m2-13 l10 8" strokeWidth="3" /></>}</g>}
        {has("opposableDigits") && !has("graspingLimbs") && <g fill="none" stroke="#e6d2b8" strokeWidth="3"><path d="M135 172 l-15 9 m15-9 l-12 16 m12-16 l-4 19" /><path d="M225 172 l15 9 m-15-9 l12 16 m-12-16 l4 19" /></g>}

        {has("unicellular") && <g opacity=".48" fill={`hsl(${hue} 45% 45%)`}><circle cx="138" cy="179" r="14" /><circle cx="222" cy="181" r="11" /><circle cx="205" cy="122" r="8" /></g>}
        <ellipse cx="180" cy="158" fill={`url(#${bodyGradient})`} rx={bodyRadius} ry={bodyRadius * bodyScaleY} stroke={has("exoskeleton") ? "#e6fbf3" : "#7dd3fc"} strokeOpacity={has("exoskeleton") ? .66 : .24} strokeWidth={has("exoskeleton") ? 4 : 2} />
        {has("multicellular") && <g fill="none" stroke="#b9f2e7" strokeOpacity=".2">{Array.from({ length: 5 }).map((_, i) => <ellipse cx={156 + i * 12} cy={145 + (i % 2) * 22} key={i} rx="17" ry="14" />)}</g>}
        {has("bilateralSymmetry") && <path d={`M180 ${158 - bodyRadius * bodyScaleY + 7} V${158 + bodyRadius * bodyScaleY - 7}`} stroke="#d9fbff" strokeOpacity=".24" strokeDasharray="3 5" />}
        {has("exoskeleton") && Array.from({ length: 5 }).map((_, i) => <path d={`M${151 + i * 14} 119 Q${145 + i * 17} 158 ${151 + i * 14} 197`} fill="none" key={i} stroke="#effffa" strokeOpacity=".34" />)}
        {has("internalSkeleton") && <g fill="none" stroke="#effcff" strokeOpacity=".36"><path d="M180 116 V201" strokeWidth="3" /><path d="M150 139 Q180 151 210 139 M148 160 Q180 174 212 160 M154 183 Q180 193 206 183" /></g>}
        {has("thermalInsulation") && <ellipse cx="180" cy="158" fill="none" rx={bodyRadius + 5} ry={bodyRadius * bodyScaleY + 5} stroke="#e6f7ff" strokeDasharray="2 5" strokeWidth="9" opacity=".72" />}
        {has("cryoprotectiveChemistry") && <g fill="#b9efff" opacity=".7"><path d="M145 132 l8 -8 l8 8 l-8 8Z" /><path d="M199 132 l8 -8 l8 8 l-8 8Z" /><path d="M171 187 l9 -9 l9 9 l-9 9Z" /></g>}
        {has("pressureResistance") && <g fill="none" stroke="#9ed9e1" strokeWidth="4" opacity=".48"><path d="M143 133 Q180 145 217 133" /><path d="M139 168 Q180 181 221 168" /><path d="M149 191 Q180 201 211 191" /></g>}
        {has("waterConservation") && <path d="M143 129 L158 120 L171 130 L185 119 L199 131 L215 123" fill="none" stroke="#f2d7a1" strokeWidth="5" opacity=".7" />}
        {has("radiationResistance") && <ellipse cx="180" cy="158" fill="none" filter={`url(#${glow})`} rx={bodyRadius + 14} ry={bodyRadius * bodyScaleY + 14} stroke="#7cf4ea" strokeWidth="4" opacity=".5" />}
        {has("mineralShielding") && <g fill="#8b8a9e" stroke="#d8d6e6" strokeOpacity=".4"><path d="M138 146 l10 -13 l12 10 l-6 15Z" /><path d="M206 146 l10 -13 l12 10 l-6 15Z" /><path d="M174 113 l10 -10 l10 12 l-8 12Z" /></g>}
        {has("heatResistance") && <g stroke="#ff824d" strokeWidth="3" opacity=".8"><path d="M149 174 l-10 13" /><path d="M165 185 l-5 16" /><path d="M211 176 l11 13" /></g>}
        {has("heatShockProteins") && <g fill="none" stroke="#ffb25b" strokeWidth="3" opacity=".75"><path d="M145 151 q10 -13 20 0 q10 13 20 0 q10 -13 20 0" /><path d="M150 178 q10 -12 20 0 q10 12 20 0 q10 -12 20 0" /></g>}
        {has("biofilmColony") && <g fill="#96e7b8" opacity=".55"><circle cx="130" cy="190" r="7" /><circle cx="119" cy="202" r="5" /><circle cx="230" cy="193" r="8" /><circle cx="243" cy="204" r="5" /></g>}
        {has("saltTolerance") && <g fill="#f5e4a5" opacity=".75"><circle cx="146" cy="163" r="2.5" /><circle cx="158" cy="182" r="2.5" /><circle cx="204" cy="162" r="2.5" /><circle cx="214" cy="183" r="2.5" /></g>}
        {has("regenerativeTissue") && <g fill="#73f0b4"><circle cx="137" cy="153" r="5" /><circle cx="222" cy="174" r="4" /><path d="M137 153 l-12-12 m97 33 l13-10" stroke="#73f0b4" strokeWidth="3" /></g>}
        {has("oxygenRespiration") && <g fill="#77d9f2" opacity=".62"><ellipse cx="164" cy="169" rx="11" ry="18" /><ellipse cx="196" cy="169" rx="11" ry="18" /></g>}
        {has("lowOxygenMetabolism") && <path d="M153 178 Q180 151 207 178 Q180 199 153 178" fill="#7558a6" opacity=".65" />}
        {has("anaerobicMetabolism") && <g fill="#f5b942" opacity=".7"><circle cx="160" cy="178" r="5" /><circle cx="180" cy="187" r="5" /><circle cx="200" cy="178" r="5" /></g>}
        {has("photosynthesis") && <g fill="#77d85c"><circle cx="151" cy="155" r="4" /><circle cx="169" cy="181" r="4" /><circle cx="194" cy="184" r="4" /><circle cx="211" cy="155" r="4" /></g>}
        {has("chemosynthesis") && <path d="M151 181 Q161 165 171 181 T191 181 T211 181" fill="none" stroke="#f0dd75" strokeWidth="4" />}
        {has("gills") && <g stroke="#9be6ee" strokeWidth="3"><path d="M142 146 l14 5" /><path d="M140 154 l15 4" /><path d="M142 162 l14 3" /></g>}
        {has("lungs") && <g fill="#cf8f9f" opacity=".58"><ellipse cx="163" cy="164" rx="12" ry="20" /><ellipse cx="197" cy="164" rx="12" ry="20" /></g>}
        {has("visibleVision") && <g><circle cx="161" cy="141" fill="#05101a" r="8" stroke="#efffff" strokeWidth="3" /><circle cx="199" cy="141" fill="#05101a" r="8" stroke="#efffff" strokeWidth="3" /></g>}
        {has("infraredVision") && <g fill="#ff623f" filter={`url(#${glow})`}><circle cx="155" cy="141" r="7" /><circle cx="205" cy="141" r="7" /></g>}
        {has("hibernation") && <g stroke="#dff7ff" strokeWidth="3"><path d="M151 143 q10 8 20 0" /><path d="M189 143 q10 8 20 0" /></g>}
        {has("symbioticMetabolism") && <g fill="#c7a9ff" opacity=".8"><circle cx="166" cy="158" r="4" /><circle cx="180" cy="171" r="4" /><circle cx="196" cy="157" r="4" /></g>}
        {has("chemicalSensing") && <g fill="none" stroke="#a7f3d0" strokeWidth="3"><path d="M163 121 Q151 90 133 80" /><path d="M197 121 Q209 90 227 80" /><circle cx="132" cy="79" fill="#a7f3d0" r="4" /><circle cx="228" cy="79" fill="#a7f3d0" r="4" /></g>}
        {has("echolocation") && <g fill="none" stroke="#67e8f9" opacity=".7"><path d="M223 135 Q254 158 223 181" /><path d="M232 123 Q280 158 232 193" /></g>}
        {has("simpleNeuralSystem") && <path d="M148 171 Q180 145 212 171" fill="none" stroke="#d2a8ff" strokeDasharray="2 4" strokeWidth="3" />}
        {has("centralizedBrain") && <path d="M157 128 Q180 108 203 128 Q200 145 180 148 Q160 145 157 128" fill="#d09cff" opacity=".72" />}
        {has("adaptiveLearning") && <g fill="#e8c8ff"><circle cx="170" cy="126" r="3" /><circle cx="180" cy="119" r="3" /><circle cx="190" cy="126" r="3" /></g>}
        {has("complexCommunication") && <g fill="none" stroke="#c4f2ff"><path d="M155 116 Q180 94 205 116" /><path d="M145 108 Q180 77 215 108" /></g>}
        {has("culturalMemory") && <g stroke="#ffd98e" fill="#ffd98e"><path d="M150 100 L180 84 L210 100" fill="none" /><circle cx="150" cy="100" r="3" /><circle cx="180" cy="84" r="3" /><circle cx="210" cy="100" r="3" /></g>}
        {has("toolUsePotential") && <g stroke="#c9a56a" strokeWidth="4"><path d="M266 208 L290 159" /><path d="M279 181 l17 8" /></g>}
        {has("socialCoordination") && <g fill={`hsl(${hue} 36% 40%)`} opacity=".62"><circle cx="82" cy="227" r="10" /><circle cx="278" cy="227" r="10" /></g>}
        {has("protectedEggs") && <g fill="#e8d7b0" stroke="#9a7952"><ellipse cx="128" cy="246" rx="9" ry="12" /><ellipse cx="147" cy="248" rx="8" ry="11" /><ellipse cx="231" cy="247" rx="9" ry="12" /></g>}
        {has("liveBirth") && <path d="M169 177 Q180 164 191 177 Q190 192 180 197 Q170 192 169 177" fill="#f0a7b1" opacity=".72" />}
        {has("spores") && <g fill="#e6df93">{Array.from({ length: 10 }).map((_, i) => <circle cx={115 + (i * 29) % 155} cy={82 + (i * 41) % 105} key={i} r={2 + i % 2} opacity=".7" />)}</g>}
        {has("dormantCysts") && <g fill="#c9a66a" stroke="#f6d99c"><circle cx="117" cy="229" r="7" /><circle cx="244" cy="228" r="7" /><circle cx="130" cy="216" r="5" /></g>}
        {has("rapidReproduction") && <g fill="#b7e7d4"><circle cx="115" cy="238" r="6" /><circle cx="130" cy="231" r="5" /><circle cx="245" cy="238" r="6" /></g>}
        {has("parentalInvestment") && <path d="M180 205 Q160 223 142 238 M180 205 Q200 223 218 238" fill="none" stroke="#d7f0dd" strokeWidth="3" />}

        <g className="organism-trait-signatures">{traitIds.filter((trait) => ORGANISM_VISUALIZED_TRAITS[trait]).map((trait, index) => <circle data-trait={trait} cx={12 + (index % 22) * 15.4} cy={289 - Math.floor(index / 22) * 8} fill={`hsl(${(stableHash(trait) % 330) + 15} 72% 63%)`} key={trait} r="2.3" />)}</g>
      </svg>
    </div>
  );
}

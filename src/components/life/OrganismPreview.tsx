"use client";

import Image from "next/image";
import { useId, useMemo } from "react";

import type { LifeTraitId, PlanetState } from "@/domain/simulator/schema";

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

/** Renders a deterministic code-native organism while an optional AI field image is absent. */
export default function OrganismPreview({
  planet,
  traitIds,
  imageDataUrl,
  label,
}: OrganismPreviewProps) {
  const localId = useId().replaceAll(":", "");
  const has = (trait: LifeTraitId) => traitIds.includes(trait);
  const hash = useMemo(
    () => stableHash(`${planet.seed}:${[...traitIds].sort().join(":")}`),
    [planet.seed, traitIds],
  );
  const paletteHues = [32, 112, 176, 208];
  const hue = paletteHues[hash % paletteHues.length] + (hash % 11);
  const accentHue = has("photosynthesis") ? 132 : (hue + 58) % 360;
  const bodyRadius = has("largeBody") ? 66 : has("compactBody") ? 43 : 54;
  const bodyScaleY = has("aquaticMovement") ? 0.68 : has("aerialMovement") ? 0.74 : 1;
  const segments = has("exoskeleton") ? 6 : 3;
  const limbPairs = has("terrestrialMovement") ? 3 : has("aerialMovement") ? 1 : 0;
  const coldWorld = planet.world.averageTemperatureC < 2;
  const dryWorld = planet.world.waterAvailability < 0.35;
  const gradientId = `organism-gradient-${localId}`;
  const glowId = `organism-glow-${localId}`;
  const clipId = `organism-clip-${localId}`;

  if (imageDataUrl) {
    return (
      <div aria-label={label} className="organism-preview" role="img">
        <Image
          alt={label}
          className="object-cover"
          fill
          priority={false}
          sizes="(max-width: 1100px) 100vw, 360px"
          src={imageDataUrl}
          unoptimized
        />
        <div className="organism-image-vignette" />
      </div>
    );
  }

  return (
    <div aria-label={label} className="organism-preview" role="img">
      <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 360 300">
        <defs>
          <radialGradient id={gradientId} cx="38%" cy="28%" r="78%">
            <stop offset="0" stopColor={`hsl(${hue} 38% 54%)`} />
            <stop offset="0.58" stopColor={`hsl(${hue} 34% 31%)`} />
            <stop offset="1" stopColor={`hsl(${(hue + 335) % 360} 32% 13%)`} />
          </radialGradient>
          <filter id={glowId} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <clipPath id={clipId}>
            <ellipse cx="180" cy="156" rx={bodyRadius} ry={bodyRadius * bodyScaleY} />
          </clipPath>
          <linearGradient id={`ground-${localId}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={coldWorld ? "#1a3852" : dryWorld ? "#4b3026" : "#173d35"} />
            <stop offset="1" stopColor="#060b17" />
          </linearGradient>
        </defs>

        <rect fill={`url(#ground-${localId})`} height="300" width="360" />
        <circle cx="286" cy="52" fill="#d9f7ff" opacity={0.09 + planet.world.lightLevel * 0.17} r="22" />
        <path d="M0 230 Q78 190 158 224 T360 210 V300 H0 Z" fill="#07121a" opacity="0.84" />
        <ellipse cx="180" cy="238" fill="#00050b" opacity="0.62" rx={bodyRadius + 50} ry="12" />
        {has("photosynthesis") && (
          <g fill={`hsl(${accentHue} 35% 28%)`} opacity="0.32">
            <path d="M31 228 Q48 188 73 211 Q91 177 110 224 Z" />
            <path d="M265 225 Q286 184 302 213 Q325 181 342 229 Z" />
          </g>
        )}

        {has("radiationResistance") && (
          <ellipse
            cx="180"
            cy="154"
            fill="none"
            filter={`url(#${glowId})`}
            opacity="0.18"
            rx={bodyRadius + 15}
            ry={bodyRadius * bodyScaleY + 15}
            stroke="#9ed7d5"
            strokeWidth="2"
          />
        )}

        {has("aerialMovement") && (
          <g fill={`hsl(${accentHue} 30% 34%)`} opacity="0.72" stroke="#b6dadd" strokeOpacity="0.25">
            <path d="M145 145 C96 82 53 90 35 128 C73 121 105 143 148 170 Z" />
            <path d="M215 145 C264 82 307 90 325 128 C287 121 255 143 212 170 Z" />
          </g>
        )}

        {has("aquaticMovement") && (
          <path
            d="M225 161 C277 119 320 127 339 162 C312 174 283 191 227 173 Z"
            fill={`hsl(${accentHue} 32% 31%)`}
            opacity="0.78"
            stroke="#b6eff4"
            strokeOpacity="0.22"
          />
        )}

        {Array.from({ length: limbPairs }).map((_, index) => {
          const offset = (index - (limbPairs - 1) / 2) * 25;
          return (
            <g key={offset} fill="none" stroke={`hsl(${hue} 30% 27%)`} strokeLinecap="square" strokeLinejoin="round" strokeWidth="7">
              <path d={`M${157 + offset * 0.3} 181 L${136 + offset} 211 L${112 + offset} 244 L${102 + offset} 244`} />
              <path d={`M${203 - offset * 0.3} 181 L${224 - offset} 211 L${248 - offset} 244 L${258 - offset} 244`} />
            </g>
          );
        })}

        <ellipse
          cx="180"
          cy="156"
          fill={`url(#${gradientId})`}
          rx={bodyRadius}
          ry={bodyRadius * bodyScaleY}
          stroke={has("exoskeleton") ? "#d8f6f2" : "#7dd3fc"}
          strokeOpacity={has("exoskeleton") ? 0.52 : 0.2}
          strokeWidth={has("exoskeleton") ? 3 : 1.5}
        />

        {has("exoskeleton") &&
          Array.from({ length: segments }).map((_, index) => {
            const x = 180 - bodyRadius + ((index + 1) * bodyRadius * 2) / (segments + 1);
            return (
              <path
                d={`M${x} ${116 + Math.abs(x - 180) * 0.35} Q${x - 5} 156 ${x} ${196 - Math.abs(x - 180) * 0.35}`}
                fill="none"
                key={x}
                opacity="0.34"
                stroke="#d9fffb"
                strokeWidth="2"
              />
            );
          })}

        {has("internalSkeleton") && (
          <g clipPath={`url(#${clipId})`} fill="none" opacity="0.25" stroke="#e8fbff" strokeWidth="3">
            <path d="M180 116 V199" strokeWidth="1.5" />
            <path d="M148 137 Q180 150 212 137 M145 160 Q180 174 215 160 M151 182 Q180 192 209 182" opacity="0.7" strokeWidth="1.5" />
          </g>
        )}

        {has("thermalInsulation") && (
          <ellipse
            cx="180"
            cy="156"
            fill="none"
            opacity="0.55"
            rx={bodyRadius + 5}
            ry={bodyRadius * bodyScaleY + 5}
            stroke="#d8f3ff"
            strokeDasharray="2 5"
            strokeWidth="8"
          />
        )}

        {has("visibleVision") && (
          <g>
            <circle cx="160" cy="143" fill="#06131e" r="8" stroke="#ecfeff" strokeWidth="3" />
            <circle cx="200" cy="143" fill="#06131e" r="8" stroke="#ecfeff" strokeWidth="3" />
          </g>
        )}
        {has("infraredVision") && (
          <g fill="#ff7849" filter={`url(#${glowId})`}>
            <circle cx="155" cy="142" r="7" />
            <circle cx="205" cy="142" r="7" />
          </g>
        )}
        {has("chemicalSensing") && (
          <g fill="none" stroke="#a7f3d0" strokeLinecap="round" strokeWidth="3">
            <path d="M164 121 Q150 89 132 79" />
            <path d="M196 121 Q210 89 228 79" />
            <circle cx="130" cy="77" fill="#a7f3d0" r="4" />
            <circle cx="230" cy="77" fill="#a7f3d0" r="4" />
          </g>
        )}
        {has("echolocation") && (
          <g fill="none" opacity="0.65" stroke="#67e8f9" strokeWidth="2">
            <path d="M221 135 Q253 156 221 177" />
            <path d="M230 123 Q278 156 230 189" />
          </g>
        )}
        {has("photosynthesis") && (
          <g fill={`hsl(${accentHue} 46% 48%)`} opacity="0.42">
            <circle cx="153" cy="168" r="3" />
            <circle cx="165" cy="183" r="2.5" />
            <circle cx="187" cy="190" r="3.5" />
            <circle cx="207" cy="177" r="2" />
            <circle cx="215" cy="154" r="2.5" />
          </g>
        )}
      </svg>
    </div>
  );
}

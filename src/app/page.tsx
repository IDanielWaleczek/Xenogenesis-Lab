"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { COPY, type HabitatId, type Language, type Screen } from "./copy";

type WorldDraft = {
  gravity: number;
  pressure: number;
  temperature: number;
  variation: number;
  radiation: number;
  light: number;
  water: number;
  habitat: HabitatId;
};

const DEFAULT_WORLD: WorldDraft = {
  gravity: 1.7,
  pressure: 1.2,
  temperature: 18,
  variation: 24,
  radiation: 0.4,
  light: 0.62,
  water: 0.38,
  habitat: "basaltPlains",
};

/** Renders the small orbital identity mark used in the application shell. */
function OrbitMark() {
  return (
    <span aria-hidden="true" className="relative grid size-9 place-items-center">
      <span className="absolute size-7 rounded-full border border-cyan-300/60" />
      <span className="absolute h-3.5 w-9 rotate-[-28deg] rounded-[100%] border border-cyan-200/70" />
      <span className="size-1.5 rounded-full bg-cyan-100 shadow-[0_0_14px_4px_rgba(103,232,249,0.4)]" />
    </span>
  );
}

/** Renders a labelled range control that changes only the local visual prototype state. */
function RangeField({
  id,
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  const inputId = `control-${id}`;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-4">
        <label className="text-sm font-medium text-slate-100" htmlFor={inputId}>
          {label}
        </label>
        <output className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-xs text-cyan-200">
          {value} {unit}
        </output>
      </div>
      <input
        className="xl-range block h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-cyan-300"
        id={inputId}
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        type="range"
        value={value}
      />
      <div className="flex justify-between text-[10px] tracking-wide text-slate-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

/** Renders a small visual indicator used to identify preview pressure categories. */
function PressureGlyph({ tone }: { tone: string }) {
  const color =
    tone === "amber"
      ? "bg-amber-300"
      : tone === "violet"
        ? "bg-violet-300"
        : tone === "blue"
          ? "bg-blue-300"
          : "bg-cyan-300";

  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-slate-950/70">
      <span className={`size-2 rounded-full shadow-[0_0_12px_currentColor] ${color}`} />
    </span>
  );
}

/** Renders the current static product screen while the live simulation is not yet connected. */
function PrototypeScreen({
  screen,
  onNavigate,
  copy,
}: {
  screen: Exclude<Screen, "configure">;
  onNavigate: (screen: Screen) => void;
  copy: (typeof COPY)[Language];
}) {
  if (screen === "constraints") {
    return (
      <section aria-labelledby="constraints-heading" className="animate-[rise_0.45s_ease-out] space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{copy.constraints.eyebrow}</p>
            <h2 id="constraints-heading" className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
              {copy.constraints.heading}
            </h2>
          </div>
          <span className="status-chip border-amber-300/30 bg-amber-300/10 text-amber-100">{copy.constraints.status}</span>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-slate-300">
          {copy.constraints.description}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {copy.constraints.pressures.map((pressure, index) => (
            <article key={pressure.title} className="glass-panel group p-5 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-200/25">
              <div className="flex items-start gap-4">
                <PressureGlyph tone={pressure.tone} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-500">0{index + 1}</span>
                    <h3 className="font-medium text-white">{pressure.title}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-5 text-slate-300">{pressure.detail}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="glass-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white">{copy.constraints.readyTitle}</p>
            <p className="mt-1 text-sm text-slate-400">{copy.constraints.readyDescription}</p>
          </div>
          <button className="button-primary" onClick={() => onNavigate("dossier")} type="button">
            {copy.constraints.dossierPreview} <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>
    );
  }

  if (screen === "dossier") {
    return (
      <section aria-labelledby="dossier-heading" className="animate-[rise_0.45s_ease-out] space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{copy.dossier.eyebrow}</p>
            <h2 id="dossier-heading" className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
              Vespera lithovora <span className="text-cyan-200">/ {copy.dossier.previewSuffix}</span>
            </h2>
          </div>
          <span className="status-chip border-cyan-300/25 bg-cyan-300/10 text-cyan-100">{copy.dossier.status}</span>
        </div>
        <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
          <article className="glass-panel overflow-hidden">
            <div className="border-b border-white/10 bg-gradient-to-r from-cyan-300/[0.08] to-transparent px-5 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-200">{copy.dossier.plausibilityLabel}</p>
              <p className="mt-2 text-lg leading-7 text-white">{copy.dossier.plausibilityStatement}</p>
            </div>
            <div className="space-y-4 p-5 text-sm leading-6 text-slate-300">
              <p>
                {copy.dossier.description}
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                  <p className="text-slate-500">{copy.dossier.habitatLabel}</p>
                  <p className="mt-1 text-slate-100">{copy.dossier.habitatValue}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                  <p className="text-slate-500">{copy.dossier.activityLabel}</p>
                  <p className="mt-1 text-slate-100">{copy.dossier.activityValue}</p>
                </div>
              </div>
            </div>
          </article>
          <aside className="glass-panel p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">{copy.dossier.adaptationLinks}</p>
            <div className="mt-4 space-y-3">
              {copy.dossier.adaptations.map(({ title, category }, index) => (
                <div className="flex items-center gap-3" key={title}>
                  <span className="grid size-6 shrink-0 place-items-center rounded-full border border-cyan-200/20 bg-cyan-300/10 font-mono text-[10px] text-cyan-200">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm text-slate-100">{title}</p>
                    <p className="text-xs text-slate-500">{category}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
        <div className="glass-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-300">{copy.dossier.imagePromptDescription}</p>
          <button className="button-primary" onClick={() => onNavigate("illustration")} type="button">
            {copy.dossier.illustrationPreview} <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="illustration-heading" className="animate-[rise_0.45s_ease-out] space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{copy.illustration.eyebrow}</p>
          <h2 id="illustration-heading" className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
            {copy.illustration.heading}
          </h2>
        </div>
        <span className="status-chip border-violet-300/30 bg-violet-300/10 text-violet-100">{copy.illustration.status}</span>
      </div>
      <div className="glass-panel relative isolate min-h-[370px] overflow-hidden p-6 sm:p-9">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_35%_78%,rgba(139,92,246,0.13),transparent_27%)]" />
        <div className="absolute right-[17%] top-[19%] size-32 rounded-full border border-cyan-200/30 shadow-[inset_-15px_-15px_40px_rgba(34,211,238,0.1),0_0_65px_rgba(34,211,238,0.14)] sm:size-44" />
        <div className="absolute right-[26%] top-[34%] h-16 w-48 rotate-[-22deg] rounded-[100%] border border-cyan-200/25 sm:w-60" />
        <div className="absolute right-[25%] top-[36%] h-12 w-36 rotate-[22deg] rounded-[100%] border border-violet-200/25 sm:w-48" />
        <div className="relative flex min-h-[310px] max-w-md flex-col justify-end">
          <span className="mb-auto grid size-11 place-items-center rounded-xl border border-white/10 bg-slate-950/70 text-cyan-100">✦</span>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-200">{copy.illustration.queueLabel}</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">{copy.illustration.title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {copy.illustration.description}
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {copy.illustration.stages.map((item, index) => (
          <div className="glass-panel flex items-center gap-3 px-4 py-3" key={item}>
            <span className="font-mono text-xs text-cyan-200">0{index + 1}</span>
            <span className="text-sm text-slate-200">{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Renders the first interactive visual prototype of the Xenogenesis Lab journey. */
export default function Home() {
  const [screen, setScreen] = useState<Screen>("configure");
  const [language, setLanguage] = useState<Language>("en");
  const [world, setWorld] = useState<WorldDraft>(DEFAULT_WORLD);
  const copy = COPY[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = copy.document.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", copy.document.description);
  }, [copy.document.description, copy.document.title, language]);

  const updateWorld = <Key extends keyof WorldDraft>(key: Key, value: WorldDraft[Key]) => {
    setWorld((current) => ({ ...current, [key]: value }));
  };

  const resetPrototype = () => {
    setWorld(DEFAULT_WORLD);
    setScreen("configure");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#030817] text-slate-100 selection:bg-cyan-300/30">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 opacity-80 [background-image:radial-gradient(rgba(148,163,184,0.13)_0.8px,transparent_0.8px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <header className="border-b border-white/10 bg-[#050b1c]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-3 sm:px-7 lg:px-10">
          <button className="group flex items-center gap-3 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300" onClick={resetPrototype} type="button">
            <OrbitMark />
            <span>
              <span className="block text-sm font-semibold tracking-[-0.02em] text-white">Xenogenesis Lab</span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-200/80">{copy.header.subtitle}</span>
            </span>
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <div aria-label={copy.language.label} className="flex rounded-lg border border-white/10 bg-white/[0.035] p-1" role="group">
              {(["en", "pl"] as const).map((option) => (
                <button
                  aria-label={option === "en" ? copy.language.switchToEnglish : copy.language.switchToPolish}
                  aria-pressed={language === option}
                  className={`rounded-md px-2 py-1 font-mono text-[10px] font-semibold transition focus-visible:outline-2 focus-visible:outline-cyan-300 ${
                    language === option ? "bg-cyan-300/15 text-cyan-100" : "text-slate-500 hover:text-slate-200"
                  }`}
                  key={option}
                  onClick={() => setLanguage(option)}
                  type="button"
                >
                  {option.toUpperCase()}
                </button>
              ))}
            </div>
            <span className="status-chip hidden border-emerald-300/25 bg-emerald-300/10 text-emerald-100 sm:inline-flex">{copy.header.prototypeMode}</span>
            <button className="button-quiet hidden sm:inline-flex" onClick={resetPrototype} type="button">{copy.header.resetWorld}</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-5 pb-14 pt-6 sm:px-7 sm:pt-8 lg:px-10">
        <section className="relative isolate overflow-hidden rounded-2xl border border-cyan-200/15 bg-[#071126] shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
          <Image
            alt={copy.hero.imageAlt}
            className="absolute inset-0 -z-20 h-full w-full object-cover object-[50%_45%] opacity-45"
            fill
            priority
            sizes="(max-width: 1440px) 100vw, 1440px"
            src="/XenogenesisLabBanner.png"
          />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,8,23,0.96)_0%,rgba(3,8,23,0.82)_46%,rgba(3,8,23,0.32)_100%)]" />
          <div className="relative max-w-3xl px-6 py-10 sm:px-10 sm:py-12 lg:py-14">
            <p className="eyebrow">{copy.hero.eyebrow}</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-5xl lg:text-6xl">
              {copy.hero.titleStart} <span className="text-cyan-200">{copy.hero.titleHighlight}</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-slate-200 sm:text-base">
              {copy.hero.description}
            </p>
          </div>
        </section>

        <nav aria-label={copy.navigationLabel} className="journey-scroll mt-5 overflow-x-auto pb-1">
          <ol className="flex min-w-max gap-2">
            {(["configure", "constraints", "dossier", "illustration"] as const).map((id, index) => {
              const isCurrent = id === screen;
              return (
                <li key={id}>
                  <button
                    aria-current={isCurrent ? "step" : undefined}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
                      isCurrent
                        ? "border-cyan-200/40 bg-cyan-300/10 text-white"
                        : "border-white/10 bg-white/[0.025] text-slate-400 hover:border-white/20 hover:text-slate-200"
                    }`}
                    onClick={() => setScreen(id)}
                    type="button"
                  >
                    <span className={`font-mono text-[10px] ${isCurrent ? "text-cyan-200" : "text-slate-600"}`}>0{index + 1}</span>
                    <span className="text-sm font-medium">{copy.screens[id]}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="mt-5 grid gap-5 xl:grid-cols-[355px_minmax(0,1fr)]">
          <aside className="glass-panel h-fit overflow-hidden xl:sticky xl:top-5">
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-200">{copy.controls.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{copy.controls.subtitle}</p>
                </div>
                <span className="rounded-full border border-white/10 px-2 py-1 font-mono text-[10px] text-slate-400">0.1.0</span>
              </div>
            </div>
            <div className="space-y-5 p-5">
              <RangeField id="gravity" label={copy.controls.gravity} value={world.gravity} min={0.1} max={4} step={0.1} unit="g" onChange={(value) => updateWorld("gravity", value)} />
              <RangeField id="pressure" label={copy.controls.pressure} value={world.pressure} min={0.1} max={4} step={0.1} unit="atm" onChange={(value) => updateWorld("pressure", value)} />
              <RangeField id="temperature" label={copy.controls.averageTemperature} value={world.temperature} min={-80} max={100} step={1} unit="°C" onChange={(value) => updateWorld("temperature", value)} />
              <RangeField id="variation" label={copy.controls.temperatureRange} value={world.variation} min={0} max={60} step={1} unit="± °C" onChange={(value) => updateWorld("variation", value)} />
              <RangeField id="radiation" label={copy.controls.radiationDose} value={world.radiation} min={0} max={10} step={0.1} unit="mSv/h" onChange={(value) => updateWorld("radiation", value)} />
              <div className="grid grid-cols-2 gap-4">
                <RangeField id="light" label={copy.controls.stellarLight} value={world.light} min={0} max={1} step={0.01} unit={copy.units.relative} onChange={(value) => updateWorld("light", value)} />
                <RangeField id="water" label={copy.controls.waterAccess} value={world.water} min={0} max={1} step={0.01} unit={copy.units.relative} onChange={(value) => updateWorld("water", value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-100" htmlFor="habitat">{copy.controls.habitat}</label>
                <select className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-200/50" id="habitat" onChange={(event) => updateWorld("habitat", event.target.value as HabitatId)} value={world.habitat}>
                  {(Object.keys(copy.habitats) as HabitatId[]).map((habitat) => (
                    <option key={habitat} value={habitat}>{copy.habitats[habitat]}</option>
                  ))}
                </select>
              </div>
              <button className="button-primary w-full justify-center" onClick={() => setScreen("constraints")} type="button">
                {copy.controls.explorePreview} <span aria-hidden="true">→</span>
              </button>
              <p className="rounded-lg border border-amber-200/15 bg-amber-100/[0.04] px-3 py-2 text-xs leading-5 text-amber-100/80">
                {copy.controls.visualOnly}
              </p>
            </div>
          </aside>

          <div className="min-w-0">
            {screen === "configure" ? (
              <section aria-labelledby="configure-heading" className="animate-[rise_0.45s_ease-out] space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="eyebrow">{copy.configure.eyebrow}</p>
                    <h2 id="configure-heading" className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">{copy.configure.heading}</h2>
                  </div>
                  <span className="status-chip border-slate-400/25 bg-slate-400/10 text-slate-200">{copy.configure.status}</span>
                </div>
                <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
                  <article className="glass-panel relative min-h-[310px] overflow-hidden p-6">
                    <div aria-hidden="true" className="absolute -right-20 -top-24 size-72 rounded-full border border-cyan-300/15 bg-cyan-300/[0.03]" />
                    <div aria-hidden="true" className="absolute bottom-[-55%] left-[18%] size-72 rounded-full border border-violet-300/15 bg-violet-300/[0.04]" />
                    <div className="relative flex h-full flex-col justify-between">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-200">{copy.configure.selectedWorld}</p>
                        <h3 className="mt-3 max-w-md text-2xl font-semibold tracking-[-0.035em] text-white">{copy.habitats[world.habitat]}</h3>
                        <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">{copy.configure.canvasDescription}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-8 sm:max-w-sm">
                        {[
                          [copy.configure.gravityAbbreviation, `${world.gravity} g`],
                          [copy.configure.temperatureAbbreviation, `${world.temperature}°`],
                          [copy.configure.waterAbbreviation, `${Math.round(world.water * 100)}%`],
                        ].map(([label, value]) => (
                          <div className="rounded-lg border border-white/10 bg-slate-950/40 p-3" key={label}>
                            <p className="font-mono text-[9px] tracking-wider text-slate-500">{label}</p>
                            <p className="mt-1 text-sm text-cyan-100">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                  <article className="glass-panel flex flex-col p-6">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">{copy.configure.journeyMap}</p>
                    <ol className="mt-5 space-y-4">
                      {copy.configure.journey.map(({ title, description }, index) => (
                        <li className="flex gap-3" key={title}>
                          <span className="grid size-6 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] font-mono text-[10px] text-cyan-200">{index + 1}</span>
                          <div>
                            <p className="text-sm text-slate-100">{title}</p>
                            <p className="mt-0.5 text-xs leading-5 text-slate-400">{description}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                    <button className="button-quiet mt-auto self-start" onClick={() => setScreen("constraints")} type="button">{copy.configure.previewFlow} <span aria-hidden="true">→</span></button>
                  </article>
                </div>
                <div className="glass-panel p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{copy.configure.integrityTitle}</p>
                      <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">{copy.configure.integrityDescription}</p>
                    </div>
                    <button className="button-primary shrink-0" onClick={() => setScreen("constraints")} type="button">{copy.configure.continue} <span aria-hidden="true">→</span></button>
                  </div>
                </div>
              </section>
            ) : (
              <PrototypeScreen copy={copy} onNavigate={setScreen} screen={screen} />
            )}
          </div>
        </div>
      </main>
      <footer className="border-t border-white/10 px-5 py-6 text-center text-xs text-slate-500 sm:px-7 lg:px-10">
        {copy.footer}
      </footer>
    </div>
  );
}

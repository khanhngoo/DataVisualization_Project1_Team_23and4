"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { PenguinData } from "@/hooks/usePenguinData";
import { SPECIES_COLORS } from "@/lib/colors";

type SpeciesName = PenguinData["species"];
type FeatureKey = "body_mass_g" | "flipper_length_mm" | "bill_length_mm" | "bill_depth_mm";

const SPECIES_ORDER: SpeciesName[] = ["Adelie", "Chinstrap", "Gentoo"];

const SPECIES_META: Record<
  SpeciesName,
  {
    title: string;
    role: string;
    islandsLabel: string;
    summary: string;
    analysis: string;
    imageUrl?: string;
  }
> = {
  Adelie: {
    title: "The Hardy Pioneer",
    role: "All-terrain generalist",
    islandsLabel: "Torgersen, Biscoe, Dream",
    summary: "Compact and resilient. Adelies trade brute size for adaptability and are the only tribe spread across all three islands.",
    analysis: "Their smaller frame and moderate flipper profile suit a species that survives across the widest environmental range. They are not extreme in any one metric, which is exactly why they travel well across the archipelago.",
  },
  Chinstrap: {
    title: "The Agile Specialist",
    role: "Speed-first niche hunter",
    islandsLabel: "Dream",
    summary: "Lean and precise. Chinstraps occupy a narrower niche and cluster around lighter body mass with efficient flipper mechanics.",
    analysis: "Compared with Gentoo, the Chinstrap profile stays lighter while keeping long, effective flippers. The result is a specialist build that emphasizes agility instead of brute force.",
  },
  Gentoo: {
    title: "The Heavyweight Champion",
    role: "Power swimmer",
    islandsLabel: "Biscoe",
    summary: "The largest tribe. Gentoos pair the longest flippers with the highest body mass, producing the clearest 'engine' profile in the dataset.",
    analysis: "Their high body mass is not random bulk. It scales with the largest flipper system in the dataset, which supports stronger propulsion and makes Gentoo the most physically distinct penguin in the archipelago.",
  },
};

const FEATURE_LABELS: Record<FeatureKey, { label: string; unit: string }> = {
  body_mass_g: { label: "Body Mass", unit: "g" },
  flipper_length_mm: { label: "Flipper Length", unit: "mm" },
  bill_length_mm: { label: "Bill Length", unit: "mm" },
  bill_depth_mm: { label: "Bill Depth", unit: "mm" },
};

function PenguinSilhouette({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10 20c0-1.5 2-4 2-5s-1-4-1-6 2-5 2-5 2 3 2 5-1 5-1 6 2 3 2 5v2H8v-2" />
    </svg>
  );
}

function StatBar({
  label,
  value,
  unit,
  widthPct,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  widthPct: number;
  color: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-4 text-xs">
        <span className="dashboard-text-soft uppercase tracking-[0.18em]">{label}</span>
        <span className="dashboard-text-strong font-semibold">
          {value.toLocaleString(undefined, { maximumFractionDigits: 1 })}{unit}
        </span>
      </div>
      <div
        className="h-3 overflow-hidden rounded-full border"
        style={{ backgroundColor: "var(--dashboard-surface)", borderColor: "var(--dashboard-border)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.max(12, widthPct)}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            boxShadow: `0 0 18px ${color}44`,
          }}
        />
      </div>
    </div>
  );
}

export function SpeciesShowcase({ data }: { data: PenguinData[] }) {
  const [focused, setFocused] = useState<SpeciesName>("Adelie");

  const speciesStats = useMemo(() => {
    const globalExtents = {
      body_mass_g: [Infinity, -Infinity] as [number, number],
      flipper_length_mm: [Infinity, -Infinity] as [number, number],
      bill_length_mm: [Infinity, -Infinity] as [number, number],
      bill_depth_mm: [Infinity, -Infinity] as [number, number],
    };

    for (const row of data) {
      (Object.keys(globalExtents) as FeatureKey[]).forEach((key) => {
        globalExtents[key][0] = Math.min(globalExtents[key][0], row[key]);
        globalExtents[key][1] = Math.max(globalExtents[key][1], row[key]);
      });
    }

    const stats = Object.fromEntries(
      SPECIES_ORDER.map((species) => {
        const subset = data.filter((row) => row.species === species);
        const featureAverages = Object.fromEntries(
          (Object.keys(FEATURE_LABELS) as FeatureKey[]).map((feature) => [
            feature,
            subset.reduce((sum, row) => sum + row[feature], 0) / subset.length,
          ])
        ) as Record<FeatureKey, number>;

        const islands = [...new Set(subset.map((row) => row.island))].sort();

        return [
          species,
          {
            population: subset.length,
            islands,
            featureAverages,
          },
        ];
      })
    ) as Record<
      SpeciesName,
      {
        population: number;
        islands: string[];
        featureAverages: Record<FeatureKey, number>;
      }
    >;

    return { globalExtents, stats };
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="dashboard-text-strong text-lg font-medium">The Findings: Athlete Profiles</h3>
        <p className="dashboard-text-soft text-xs uppercase tracking-[0.18em]">Click any tribe to focus it</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {SPECIES_ORDER.map((species) => {
          const isFocused = focused === species;
          const meta = SPECIES_META[species];
          const color = (SPECIES_COLORS as Record<string, string>)[species];
          const stats = speciesStats.stats[species];

          return (
            <button
              key={species}
              type="button"
              onClick={() => setFocused(species)}
              className={`group relative overflow-hidden rounded-[28px] border text-left transition-all duration-300 ${
                isFocused ? "dashboard-panel lg:col-span-1" : "dashboard-surface"
              }`}
              style={{
                borderColor: isFocused ? `${color}66` : "var(--dashboard-border)",
                transform: isFocused ? "translateY(-4px)" : "none",
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-40 opacity-80"
                style={{
                  background: `radial-gradient(circle at top, ${color}33 0%, transparent 72%)`,
                }}
              />

              <div className="relative flex h-full flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="dashboard-text-soft text-[11px] uppercase tracking-[0.22em]">{meta.role}</div>
                    <h4 className="mt-1 text-lg font-semibold" style={{ color }}>
                      {species}
                    </h4>
                    <p className="dashboard-text-muted mt-1 text-sm">{meta.title}</p>
                  </div>
                  <div
                    className="rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
                    style={{
                      color,
                      backgroundColor: `${color}14`,
                      borderColor: `${color}2d`,
                    }}
                  >
                    {isFocused ? "Focused" : "Standby"}
                  </div>
                </div>

                <div
                  className={`flex min-h-[220px] items-center justify-center rounded-[24px] border transition-all ${
                    isFocused ? "px-6 py-5" : "px-4 py-8"
                  }`}
                  style={{
                    backgroundColor: isFocused ? "var(--dashboard-surface-strong)" : "var(--dashboard-surface)",
                    borderColor: "var(--dashboard-border)",
                  }}
                >
                  {meta.imageUrl ? (
                    // Future slot for real penguin art or photography.
                    <Image
                      src={meta.imageUrl}
                      alt={`${species} penguin`}
                      width={320}
                      height={320}
                      className={`object-contain transition-all ${isFocused ? "h-56 w-full" : "h-20 w-20 opacity-65"}`}
                    />
                  ) : (
                    <div className="relative flex h-full w-full items-center justify-center">
                      <div
                        className={`absolute rounded-full blur-3xl transition-all ${isFocused ? "h-44 w-44 opacity-70" : "h-24 w-24 opacity-40"}`}
                        style={{ backgroundColor: `${color}40` }}
                      />
                      <PenguinSilhouette
                        className={`${isFocused ? "h-52 w-40" : "h-20 w-20 opacity-65"} transition-all`}
                      />
                    </div>
                  )}
                </div>

                {isFocused ? (
                  <div className="space-y-5">
                    <div className="grid gap-2 sm:grid-cols-3">
                      <div className="dashboard-surface rounded-2xl border p-3">
                        <div className="dashboard-text-soft text-[10px] uppercase tracking-[0.18em]">Population</div>
                        <div className="dashboard-text-strong mt-1 text-2xl font-semibold">{stats.population}</div>
                      </div>
                      <div className="dashboard-surface rounded-2xl border p-3 sm:col-span-2">
                        <div className="dashboard-text-soft text-[10px] uppercase tracking-[0.18em]">Islands</div>
                        <div className="dashboard-text-strong mt-1 text-sm font-medium">{meta.islandsLabel}</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {(Object.keys(FEATURE_LABELS) as FeatureKey[]).map((feature) => {
                        const { label, unit } = FEATURE_LABELS[feature];
                        const value = stats.featureAverages[feature];
                        const [min, max] = speciesStats.globalExtents[feature];
                        const widthPct = ((value - min) / (max - min || 1)) * 100;

                        return (
                          <StatBar
                            key={feature}
                            label={label}
                            value={value}
                            unit={unit}
                            widthPct={widthPct}
                            color={color}
                          />
                        );
                      })}
                    </div>

                    <div className="space-y-2">
                      <p className="dashboard-text-muted text-sm leading-relaxed">{meta.summary}</p>
                      <p className="dashboard-text-soft text-sm leading-relaxed">{meta.analysis}</p>
                    </div>
                  </div>
                ) : (
                  <div className="dashboard-text-soft flex items-center justify-between text-xs uppercase tracking-[0.18em]">
                    <span>{meta.title}</span>
                    <span>Click to inspect</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

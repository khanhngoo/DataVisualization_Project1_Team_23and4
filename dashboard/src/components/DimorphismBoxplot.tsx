"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { SEX_COLORS, FONT_FAMILY } from "@/lib/colors";
import { PenguinData } from "@/hooks/usePenguinData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SPECIES_ORDER = ["Adelie", "Chinstrap", "Gentoo"] as const;

type FeatureOption = "bill_length_mm" | "bill_depth_mm" | "flipper_length_mm" | "body_mass_g";

const FEATURE_OPTIONS: { value: FeatureOption; label: string }[] = [
  { value: "body_mass_g", label: "Body Mass (g)" },
  { value: "flipper_length_mm", label: "Flipper Length (mm)" },
  { value: "bill_length_mm", label: "Bill Length (mm)" },
  { value: "bill_depth_mm", label: "Bill Depth (mm)" },
];

function featureLabel(opt: FeatureOption): string {
  return FEATURE_OPTIONS.find((option) => option.value === opt)?.label || opt;
}

function quantiles(values: number[]) {
  const sorted = [...values].sort(d3.ascending);
  const q1 = d3.quantile(sorted, 0.25) || 0;
  const median = d3.quantile(sorted, 0.5) || 0;
  const q3 = d3.quantile(sorted, 0.75) || 0;
  const iqr = q3 - q1;
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const min = d3.min(sorted.filter((value) => value >= lowerFence)) ?? sorted[0];
  const max = d3.max(sorted.filter((value) => value <= upperFence)) ?? sorted[sorted.length - 1];
  const outliers = sorted.filter((value) => value < lowerFence || value > upperFence);

  return { q1, median, q3, min, max, outliers };
}

export function DimorphismBoxplot({ data }: { data: PenguinData[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [feature, setFeature] = useState<FeatureOption>("body_mass_g");

  useEffect(() => {
    if (!data.length || !svgRef.current || !containerRef.current) return;

    const raf = requestAnimationFrame(() => {
      if (!svgRef.current || !containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      if (containerWidth === 0) return;

      d3.select(svgRef.current).selectAll("*").remove();

      const width = containerWidth;
      const height = 460;
      const margin = { top: 36, right: 20, bottom: 80, left: 72 };
      const innerW = width - margin.left - margin.right;
      const innerH = height - margin.top - margin.bottom;

      const svg = d3
        .select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const featureValues = data.map((row) => row[feature] as number);
      const min = d3.min(featureValues) ?? 0;
      const max = d3.max(featureValues) ?? 0;
      const pad = (max - min) * 0.08;

      const x = d3.scaleBand().domain(SPECIES_ORDER).range([0, innerW]).padding(0.28);
      const sexOffset = d3.scaleBand<"Female" | "Male">().domain(["Female", "Male"]).range([0, x.bandwidth()]).padding(0.26);
      const y = d3.scaleLinear().domain([min - pad, max + pad]).nice().range([innerH, 0]);

      svg
        .append("g")
        .attr("transform", `translate(0,${innerH})`)
        .call(d3.axisBottom(x).tickSize(0))
        .call((axis) => axis.select(".domain").attr("stroke", "var(--dashboard-axis)"))
        .selectAll("text")
        .style("font-family", FONT_FAMILY)
        .style("font-size", "13px")
        .style("fill", "var(--dashboard-axis-text)")
        .style("font-weight", "600");

      svg
        .append("g")
        .call(d3.axisLeft(y).ticks(6))
        .call((axis) => axis.select(".domain").attr("stroke", "var(--dashboard-axis)"))
        .selectAll("text")
        .style("font-family", FONT_FAMILY)
        .style("fill", "var(--dashboard-axis-text)");

      svg
        .append("g")
        .call(d3.axisLeft(y).ticks(6).tickSize(-innerW).tickFormat(() => ""))
        .style("color", "var(--dashboard-grid-strong)")
        .style("stroke-dasharray", "4,4")
        .call((axis) => axis.select(".domain").remove());

      svg
        .append("text")
        .attr("x", innerW / 2)
        .attr("y", innerH + 56)
        .style("text-anchor", "middle")
        .style("fill", "var(--dashboard-text-soft)")
        .style("font-family", FONT_FAMILY)
        .style("font-size", "12px")
        .text("Species");

      svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerH / 2)
        .attr("y", -50)
        .style("text-anchor", "middle")
        .style("fill", "var(--dashboard-text-soft)")
        .style("font-family", FONT_FAMILY)
        .style("font-size", "12px")
        .text(featureLabel(feature));

      const drawBoxplot = (species: (typeof SPECIES_ORDER)[number], sex: "Female" | "Male", color: string) => {
        const values = data
          .filter((row) => row.species === species && row.sex === sex)
          .map((row) => row[feature] as number);

        if (!values.length) return;

        const stats = quantiles(values);
        const groupX = x(species) ?? 0;
        const boxX = groupX + (sexOffset(sex) ?? 0);
        const boxWidth = sexOffset.bandwidth();
        const centerX = boxX + boxWidth / 2;

        svg
          .append("line")
          .attr("x1", centerX)
          .attr("x2", centerX)
          .attr("y1", y(stats.min))
          .attr("y2", y(stats.max))
          .attr("stroke", color)
          .attr("stroke-width", 2)
          .style("opacity", 0.9);

        svg
          .append("line")
          .attr("x1", centerX - boxWidth * 0.28)
          .attr("x2", centerX + boxWidth * 0.28)
          .attr("y1", y(stats.min))
          .attr("y2", y(stats.min))
          .attr("stroke", color)
          .attr("stroke-width", 2);

        svg
          .append("line")
          .attr("x1", centerX - boxWidth * 0.28)
          .attr("x2", centerX + boxWidth * 0.28)
          .attr("y1", y(stats.max))
          .attr("y2", y(stats.max))
          .attr("stroke", color)
          .attr("stroke-width", 2);

        svg
          .append("rect")
          .attr("x", boxX)
          .attr("y", y(stats.q3))
          .attr("width", boxWidth)
          .attr("height", Math.max(2, y(stats.q1) - y(stats.q3)))
          .attr("rx", 10)
          .attr("fill", `${color}2b`)
          .attr("stroke", color)
          .attr("stroke-width", 2.2);

        svg
          .append("line")
          .attr("x1", boxX)
          .attr("x2", boxX + boxWidth)
          .attr("y1", y(stats.median))
          .attr("y2", y(stats.median))
          .attr("stroke", "var(--dashboard-point-stroke)")
          .attr("stroke-width", 2.6);

        svg
          .append("text")
          .attr("x", centerX)
          .attr("y", y(stats.q3) - 10)
          .attr("text-anchor", "middle")
          .style("fill", color)
          .style("font-family", FONT_FAMILY)
          .style("font-size", "10px")
          .style("font-weight", "700")
          .text(sex === "Female" ? "F" : "M");

        stats.outliers.forEach((outlier) => {
          svg
            .append("circle")
            .attr("cx", centerX)
            .attr("cy", y(outlier))
            .attr("r", 3)
            .attr("fill", color)
            .attr("stroke", "var(--dashboard-point-stroke)")
            .attr("stroke-width", 1);
        });
      };

      SPECIES_ORDER.forEach((species) => {
        drawBoxplot(species, "Female", SEX_COLORS.Female);
        drawBoxplot(species, "Male", SEX_COLORS.Male);
      });

      const legend = svg.append("g").attr("transform", `translate(${innerW - 150}, -14)`);

      [
        { label: "Female", color: SEX_COLORS.Female },
        { label: "Male", color: SEX_COLORS.Male },
      ].forEach((entry, index) => {
        const item = legend.append("g").attr("transform", `translate(${index * 74}, 0)`);
        item.append("circle").attr("r", 5).attr("cx", 0).attr("cy", 0).attr("fill", entry.color);
        item
          .append("text")
          .attr("x", 10)
          .attr("y", 4)
          .text(entry.label)
          .style("fill", "var(--dashboard-text)")
          .style("font-size", "11px")
          .style("font-family", FONT_FAMILY);
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [data, feature]);

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="dashboard-text-strong text-sm font-medium">Dimorphism Boxplots</h3>
          <p className="dashboard-text-soft text-xs">Vertical alignment makes the male/female distributions easier to compare.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="dashboard-text-soft text-xs">Trait:</span>
          <Select value={feature} onValueChange={(value: string | null) => value && setFeature(value as FeatureOption)}>
            <SelectTrigger className="dashboard-control w-[180px] border text-xs h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="text-sm">
              {FEATURE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div ref={containerRef} className="w-full">
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
}

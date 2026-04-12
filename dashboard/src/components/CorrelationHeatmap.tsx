"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { FONT_FAMILY } from "@/lib/colors";
import { PenguinData } from "@/hooks/usePenguinData";

interface CorrelationHeatmapProps {
  data: PenguinData[];
  title?: string;
  filterSpecies?: string;
  compact?: boolean;
}

export function CorrelationHeatmap({
  data,
  title,
  filterSpecies,
  compact = false,
}: CorrelationHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const filtered = filterSpecies ? data.filter((row) => row.species === filterSpecies) : data;
    const features = ["bill_length_mm", "bill_depth_mm", "flipper_length_mm", "body_mass_g"] as const;
    const labels = ["Bill Length", "Bill Depth", "Flipper L.", "Body Mass"];
    const n = features.length;

    const means = features.map((feature) => d3.mean(filtered, (row) => row[feature]) || 0);
    const stds = features.map((feature, index) => {
      const mean = means[index];
      return Math.sqrt(d3.mean(filtered, (row) => (row[feature] - mean) ** 2) || 0);
    });

    const corr: number[][] = [];
    for (let i = 0; i < n; i += 1) {
      corr[i] = [];
      for (let j = 0; j < n; j += 1) {
        const covariance =
          d3.mean(filtered, (row) => (row[features[i]] - means[i]) * (row[features[j]] - means[j])) || 0;
        corr[i][j] = covariance / (stds[i] * stds[j] || 1);
      }
    }

    const cellSize = compact ? 70 : 85;
    const margin = compact ? { top: 20, right: 10, bottom: 50, left: 75 } : { top: 25, right: 15, bottom: 60, left: 85 };
    const size = cellSize * n;
    const width = size + margin.left + margin.right;
    const height = size + margin.top + margin.bottom;
    const legendId = `heatmap-legend-${filterSpecies ?? "all"}-${compact ? "compact" : "full"}`;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().domain(labels).range([0, size]).padding(0.04);
    const y = d3.scaleBand().domain(labels).range([0, size]).padding(0.04);
    const colorScale = d3.scaleSequential(d3.interpolateRdBu).domain([1, -1]);

    for (let rowIndex = 0; rowIndex < n; rowIndex += 1) {
      for (let colIndex = 0; colIndex < n; colIndex += 1) {
        const value = corr[rowIndex][colIndex];
        const cellColor = d3.color(colorScale(value)) as d3.RGBColor;
        const luminance = (0.2126 * cellColor.r + 0.7152 * cellColor.g + 0.0722 * cellColor.b) / 255;
        const useDarkText = luminance > 0.64;
        const textFill = useDarkText ? "#132033" : "#ffffff";
        const textStroke = useDarkText ? "rgba(255,255,255,0.84)" : "rgba(0,0,0,0.58)";
        const cellX = x(labels[colIndex]) || 0;
        const cellY = y(labels[rowIndex]) || 0;
        const isNegative = value < 0 && rowIndex !== colIndex;
        const fontSize = compact ? 13 : 15;
        const weak = Math.abs(value) < 0.4;

        svg
          .append("rect")
          .attr("x", cellX)
          .attr("y", cellY)
          .attr("width", x.bandwidth())
          .attr("height", y.bandwidth())
          .attr("fill", colorScale(value))
          .attr("stroke", isNegative ? "rgba(255, 196, 87, 0.88)" : "var(--dashboard-border)")
          .attr("stroke-width", isNegative ? 2.2 : 1)
          .style("opacity", 0)
          .transition()
          .duration(400)
          .delay((rowIndex * n + colIndex) * 25)
          .style("opacity", 1);

        svg
          .append("rect")
          .attr("x", cellX + x.bandwidth() * 0.2)
          .attr("y", cellY + y.bandwidth() * 0.31)
          .attr("width", x.bandwidth() * 0.6)
          .attr("height", y.bandwidth() * 0.38)
          .attr("rx", compact ? 8 : 10)
          .attr("fill", useDarkText ? "rgba(255,255,255,0.26)" : "rgba(0,0,0,0.18)")
          .style("opacity", 0)
          .transition()
          .duration(400)
          .delay((rowIndex * n + colIndex) * 25 + 110)
          .style("opacity", weak ? 0.72 : 1);

        svg
          .append("text")
          .attr("x", cellX + x.bandwidth() / 2)
          .attr("y", cellY + y.bandwidth() / 2)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "central")
          .style("font-family", FONT_FAMILY)
          .style("font-size", `${fontSize}px`)
          .style("font-weight", weak ? "500" : "700")
          .style("fill", textFill)
          .style("paint-order", "stroke fill")
          .style("stroke", textStroke)
          .style("stroke-width", useDarkText ? 2.3 : 2)
          .text(value.toFixed(2))
          .style("opacity", 0)
          .transition()
          .duration(400)
          .delay((rowIndex * n + colIndex) * 25 + 150)
          .style("opacity", weak ? 0.82 : 1);
      }
    }

    const legendW = compact ? 80 : 100;
    const legendH = 6;
    const legendX = size - legendW;
    const legendY = size + 35;

    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", legendId)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    gradient.append("stop").attr("offset", "0%").attr("stop-color", colorScale(-1));
    gradient.append("stop").attr("offset", "50%").attr("stop-color", colorScale(0));
    gradient.append("stop").attr("offset", "100%").attr("stop-color", colorScale(1));

    svg.append("rect").attr("x", legendX).attr("y", legendY).attr("width", legendW).attr("height", legendH).style("fill", `url(#${legendId})`);

    svg
      .append("text")
      .attr("x", legendX)
      .attr("y", legendY + legendH + 12)
      .style("font-size", "9px")
      .style("fill", "var(--dashboard-text-soft)")
      .style("font-family", FONT_FAMILY)
      .text("-1.0 (Neg)");

    svg
      .append("text")
      .attr("x", legendX + legendW)
      .attr("y", legendY + legendH + 12)
      .attr("text-anchor", "end")
      .style("font-size", "9px")
      .style("fill", "var(--dashboard-text-soft)")
      .style("font-family", FONT_FAMILY)
      .text("+1.0 (Pos)");

    svg.append("g").attr("transform", `translate(0,${size})`).call(d3.axisBottom(x).tickSize(0)).select(".domain").remove();
    svg.append("g").call(d3.axisLeft(y).tickSize(0)).select(".domain").remove();

    svg
      .selectAll(".tick text")
      .style("fill", "var(--dashboard-text)")
      .style("font-family", FONT_FAMILY)
      .style("font-size", compact ? "10px" : "12px")
      .style("font-weight", "500");

    if (title) {
      svg
        .append("text")
        .attr("x", size / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("fill", "var(--dashboard-text-strong)")
        .style("font-family", FONT_FAMILY)
        .style("font-size", compact ? "12px" : "14px")
        .style("font-weight", "600")
        .text(title);
    }
  }, [data, filterSpecies, title, compact]);

  return <svg ref={svgRef}></svg>;
}

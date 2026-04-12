"use client";

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { SPECIES_COLORS, FONT_FAMILY } from '@/lib/colors';
import { PenguinData } from '@/hooks/usePenguinData';
import { Eye, EyeOff } from 'lucide-react';

const SPECIES_ORDER = ['Adelie', 'Chinstrap', 'Gentoo'] as const;
const GREY = '#8C8C91';
const RED_TREND = '#dc3545';

function linearRegression(points: [number, number][]): { slope: number; intercept: number } {
    const n = points.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (const [x, y] of points) {
        sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x;
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return { slope, intercept };
}

export function SimpsonParadox({ data }: { data: PenguinData[] }) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [revealed, setRevealed] = useState(false);
    const scalesRef = useRef<{ x: d3.ScaleLinear<number, number>; y: d3.ScaleLinear<number, number> } | null>(null);
    const drawnRef = useRef(false);

    // Draw chart
    useEffect(() => {
        if (!data.length || !svgRef.current || !containerRef.current) return;

        // Wait for layout to settle
        const raf = requestAnimationFrame(() => {
            if (!svgRef.current || !containerRef.current) return;

            const containerWidth = containerRef.current.clientWidth;
            if (containerWidth === 0) return; // Not mounted yet

            const margin = { top: 20, right: 30, bottom: 55, left: 55 };
            const width = Math.min(containerWidth - 10, 850);
            const height = 460;
            const innerW = width - margin.left - margin.right;
            const innerH = height - margin.top - margin.bottom;

            // Full clear
            const svg = d3.select(svgRef.current);
            svg.selectAll('*').remove();
            svg.attr('width', width).attr('height', height);
            d3.selectAll('.simpson-tip').remove();

            const g = svg.append('g')
                .attr('class', 'plot-group')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            const x = d3.scaleLinear()
                .domain(d3.extent(data, d => d.bill_length_mm) as [number, number]).nice()
                .range([0, innerW]);
            const y = d3.scaleLinear()
                .domain(d3.extent(data, d => d.bill_depth_mm) as [number, number]).nice()
                .range([innerH, 0]);

            scalesRef.current = { x, y };

            // Grid
            g.append('g')
                .attr('transform', `translate(0,${innerH})`)
                .call(d3.axisBottom(x).ticks(8).tickSize(-innerH).tickFormat(() => ''))
                .style('stroke-dasharray', '4,4')
                .style('color', 'var(--dashboard-grid-strong)');
            g.append('g')
                .call(d3.axisLeft(y).ticks(8).tickSize(-innerW).tickFormat(() => ''))
                .style('stroke-dasharray', '4,4')
                .style('color', 'var(--dashboard-grid-strong)');

            // Axes
            g.append('g')
                .attr('transform', `translate(0,${innerH})`)
                .call(d3.axisBottom(x).ticks(8))
                .attr('color', 'var(--dashboard-axis)')
                .selectAll('text').style('font-family', FONT_FAMILY).style('fill', 'var(--dashboard-axis-text)');
            g.append('g')
                .call(d3.axisLeft(y).ticks(8))
                .attr('color', 'var(--dashboard-axis)')
                .selectAll('text').style('font-family', FONT_FAMILY).style('fill', 'var(--dashboard-axis-text)');

            // Labels
            g.append('text')
                .attr('x', innerW / 2).attr('y', innerH + 42)
                .style('text-anchor', 'middle').style('fill', 'var(--dashboard-text-soft)')
                .style('font-family', FONT_FAMILY).style('font-size', '13px')
                .text('Bill Length (mm)');
            g.append('text')
                .attr('x', -20)
                .attr('y', -10)
                .style('text-anchor', 'start').style('fill', 'var(--dashboard-text-soft)')
                .style('font-family', FONT_FAMILY).style('font-size', '13px')
                .text('Bill Depth (mm)');

            // Trendline group (below dots)
            g.append('g').attr('class', 'trendlines');

            // Tooltip
            const tooltip = d3.select('body').append('div')
                .attr('class', 'simpson-tip')
                .style('position', 'absolute')
                .style('display', 'none')
                .style('background', 'var(--dashboard-tooltip-bg)')
                .style('color', 'var(--dashboard-tooltip-text)')
                .style('padding', '8px 12px')
                .style('border-radius', '8px')
                .style('font-size', '12px')
                .style('font-family', FONT_FAMILY)
                .style('border', '1px solid var(--dashboard-tooltip-border)')
                .style('pointer-events', 'none')
                .style('z-index', '9999')
                .style('box-shadow', 'var(--dashboard-shadow)');

            // Determine initial colors
            const getColor = (d: PenguinData) =>
                revealed ? (SPECIES_COLORS as Record<string, string>)[d.species] || GREY : GREY;
            const getOpacity = revealed ? 0.85 : 0.55;

            // Dots
            g.append('g')
                .attr('class', 'dots')
                .selectAll('circle')
                .data(data)
                .join('circle')
                .attr('cx', d => x(d.bill_length_mm))
                .attr('cy', d => y(d.bill_depth_mm))
                .attr('r', 0)
                .attr('fill', d => getColor(d))
                .attr('stroke', 'var(--dashboard-point-stroke)')
                .attr('stroke-width', 0.5)
                .style('opacity', getOpacity)
                .style('cursor', 'pointer')
                .on('mouseover', function (event: MouseEvent, d: unknown) {
                    const pd = d as PenguinData;
                    d3.select(this).transition().duration(150).attr('r', 9).attr('stroke-width', 2).attr('stroke', 'white');

                    // Prevent Data Narrative Spoilers!
                    const speciesHeader = revealed
                        ? `<b style="color: ${(SPECIES_COLORS as Record<string, string>)[pd.species]}">${pd.species}</b><br>`
                        : `<b style="color: ${GREY}">Hidden Species</b><br>`;

                    tooltip.style('display', 'block')
                        .html(`${speciesHeader}Bill Length: ${pd.bill_length_mm}mm<br>Bill Depth: ${pd.bill_depth_mm}mm`);
                })
                .on('mousemove', function (event: MouseEvent) {
                    tooltip.style('left', (event.pageX + 12) + 'px').style('top', (event.pageY - 15) + 'px');
                })
                .on('mouseout', function () {
                    d3.select(this).transition().duration(150).attr('r', 6).attr('stroke-width', 0.5).attr('stroke', 'var(--dashboard-point-stroke)');
                    tooltip.style('display', 'none');
                })
                .transition().duration(800).delay((_, i) => i * 1.5)
                .attr('r', 6);

            // Draw trendlines based on current state
            const trendGroup = g.select('.trendlines');
            const xDom = x.domain();

            if (!revealed) {
                // Overall negative trendline
                const allPts: [number, number][] = data.map(d => [d.bill_length_mm, d.bill_depth_mm]);
                const overall = linearRegression(allPts);

                trendGroup.append('line')
                    .attr('class', 'overall-trend')
                    .attr('x1', x(xDom[0])).attr('y1', y(overall.intercept + overall.slope * xDom[0]))
                    .attr('x2', x(xDom[0])).attr('y2', y(overall.intercept + overall.slope * xDom[0]))
                    .attr('stroke', RED_TREND).attr('stroke-width', 2.5)
                    .attr('stroke-dasharray', '8,4')
                    .style('opacity', 0.9)
                    .transition().duration(1000).delay(600)
                    .attr('x2', x(xDom[1])).attr('y2', y(overall.intercept + overall.slope * xDom[1]));

                trendGroup.append('text')
                    .attr('class', 'overall-label')
                    .attr('x', x(xDom[1]) - 5)
                    .attr('y', y(overall.intercept + overall.slope * xDom[1]) - 10)
                    .style('fill', RED_TREND).style('font-family', FONT_FAMILY)
                    .style('font-size', '11px').style('font-weight', 'bold')
                    .style('text-anchor', 'end').style('opacity', 0)
                    .text(`Overall slope = ${overall.slope.toFixed(3)}`)
                    .transition().delay(1400).duration(400).style('opacity', 1);
            } else {
                // Per-species trendlines
                for (const sp of SPECIES_ORDER) {
                    const spData = data.filter(d => d.species === sp);
                    const pts: [number, number][] = spData.map(d => [d.bill_length_mm, d.bill_depth_mm]);
                    const reg = linearRegression(pts);
                    const color = (SPECIES_COLORS as Record<string, string>)[sp];
                    const xMin = d3.min(spData, d => d.bill_length_mm)!;
                    const xMax = d3.max(spData, d => d.bill_length_mm)!;

                    trendGroup.append('line')
                        .attr('x1', x(xMin)).attr('y1', y(reg.intercept + reg.slope * xMin))
                        .attr('x2', x(xMin)).attr('y2', y(reg.intercept + reg.slope * xMin))
                        .attr('stroke', color).attr('stroke-width', 2.5)
                        .style('opacity', 0)
                        .transition().duration(800).delay(400)
                        .attr('x2', x(xMax)).attr('y2', y(reg.intercept + reg.slope * xMax))
                        .style('opacity', 0.9);

                    trendGroup.append('text')
                        .attr('x', x(xMax) + 4)
                        .attr('y', y(reg.intercept + reg.slope * xMax) + 4)
                        .style('fill', color).style('font-family', FONT_FAMILY)
                        .style('font-size', '10px').style('font-weight', '600')
                        .text(`${sp} (+${reg.slope.toFixed(3)})`)
                        .style('opacity', 0)
                        .transition().delay(1000).duration(400).style('opacity', 1);
                }
            }

            drawnRef.current = true;
        });

        return () => {
            cancelAnimationFrame(raf);
            d3.selectAll('.simpson-tip').remove();
        };
    }, [data, revealed]);

    return (
        <div className="w-full">
            {/* Dynamic title */}
            <div className="flex items-center justify-between mb-4 px-1 flex-wrap gap-3">
                <div>
                    <h4 className="dashboard-text-strong text-base font-semibold">
                        {revealed
                            ? 'EACH SPECIES ACTUALLY SHOWS A POSITIVE CORRELATION'
                            : 'OVERALL DATA SUGGESTS A NEGATIVE CORRELATION'}
                    </h4>
                    <p className="dashboard-text-soft mt-0.5 text-xs">
                        {revealed
                            ? "Within every tribe, greater bill length means deeper bill depth — Simpson's Paradox revealed."
                            : 'With no groups, greater bill length appears to have shallower depth — but is this real?'}
                    </p>
                </div>
                <button
                    onClick={() => setRevealed(r => !r)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer shrink-0 ${revealed
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-pulse'
                        }`}
                >
                    {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {revealed ? 'Hide Tribes' : 'Reveal the Tribes!'}
                </button>
            </div>

            {/* Chart */}
            <div ref={containerRef} className="w-full flex justify-center" style={{ minHeight: 460 }}>
                <svg ref={svgRef}></svg>
            </div>

            {/* Legend (only when revealed) */}
            {revealed && (
                <div className="flex justify-center gap-6 mt-3 animate-in fade-in duration-500">
                    {SPECIES_ORDER.map(sp => (
                        <div key={sp} className="dashboard-text-muted flex items-center gap-2 text-xs">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: (SPECIES_COLORS as Record<string, string>)[sp] }}></div>
                            {sp}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

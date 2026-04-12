"use client";

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { SPECIES_COLORS, FONT_FAMILY } from '@/lib/colors';
import { PenguinData, useKMeansClusters } from '@/hooks/usePenguinData';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

const CLUSTER_PALETTE = ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'];
const SPECIES_ORDER = ['Adelie', 'Chinstrap', 'Gentoo'] as const;

export function KMeansComparison({ data }: { data: PenguinData[] }) {
    const leftRef = useRef<SVGSVGElement>(null);
    const rightRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const clusterData = useKMeansClusters();
    const [k, setK] = useState(3);

    useEffect(() => {
        if (!data.length || !leftRef.current || !rightRef.current || !containerRef.current || !clusterData) return;

        const raf = requestAnimationFrame(() => {
            if (!leftRef.current || !rightRef.current || !containerRef.current) return;

            const halfWidth = Math.min((containerRef.current.clientWidth - 24) / 2, 420);
            if (halfWidth < 100) return;
            const height = 380;
            const margin = { top: 30, right: 20, bottom: 50, left: 45 };
            const innerW = halfWidth - margin.left - margin.right;
            const innerH = height - margin.top - margin.bottom;

            const xScale = d3.scaleLinear()
                .domain(d3.extent(data, d => d.PC1) as [number, number]).nice().range([0, innerW]);
            const yScale = d3.scaleLinear()
                .domain(d3.extent(data, d => d.PC2) as [number, number]).nice().range([innerH, 0]);

            const clusters = clusterData[String(k)] || [];

            // Draw both panels
            [
                { ref: leftRef, getColor: (_: PenguinData, i: number) => CLUSTER_PALETTE[clusters[i] % CLUSTER_PALETTE.length], title: `K-Means (k=${k})` },
                { ref: rightRef, getColor: (d: PenguinData) => (SPECIES_COLORS as Record<string, string>)[d.species], title: 'Ground Truth' },
            ].forEach(({ ref, getColor, title }) => {
                const svg = d3.select(ref.current!);
                svg.selectAll('*').remove();
                svg.attr('width', halfWidth).attr('height', height);
                const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

                // Grid + axes
                g.append('g').attr('transform', `translate(0,${innerH})`)
                    .call(d3.axisBottom(xScale).ticks(5).tickSize(-innerH).tickFormat(() => ''))
                    .style('stroke-dasharray', '4,4').style('color', 'var(--dashboard-grid-strong)');
                g.append('g')
                    .call(d3.axisLeft(yScale).ticks(5).tickSize(-innerW).tickFormat(() => ''))
                    .style('stroke-dasharray', '4,4').style('color', 'var(--dashboard-grid-strong)');
                g.append('g').attr('transform', `translate(0,${innerH})`)
                    .call(d3.axisBottom(xScale).ticks(5))
                    .attr('color', 'var(--dashboard-axis)')
                    .selectAll('text').style('font-family', FONT_FAMILY).style('fill', 'var(--dashboard-axis-text)').style('font-size', '10px');
                g.append('g')
                    .call(d3.axisLeft(yScale).ticks(5))
                    .attr('color', 'var(--dashboard-axis)')
                    .selectAll('text').style('font-family', FONT_FAMILY).style('fill', 'var(--dashboard-axis-text)').style('font-size', '10px');

                // Labels
                g.append('text').attr('x', innerW / 2).attr('y', innerH + 38)
                    .style('text-anchor', 'middle').style('fill', 'var(--dashboard-text-soft)')
                    .style('font-family', FONT_FAMILY).style('font-size', '11px').text('PC1');
                g.append('text').attr('transform', 'rotate(-90)').attr('x', -innerH / 2).attr('y', -32)
                    .style('text-anchor', 'middle').style('fill', 'var(--dashboard-text-soft)')
                    .style('font-family', FONT_FAMILY).style('font-size', '11px').text('PC2');

                // Title
                g.append('text').attr('x', innerW / 2).attr('y', -12)
                    .style('text-anchor', 'middle').style('fill', 'var(--dashboard-text-strong)')
                    .style('font-family', FONT_FAMILY).style('font-size', '13px').style('font-weight', '600').text(title);

                // Dots
                g.selectAll('circle')
                    .data(data).join('circle')
                    .attr('cx', d => xScale(d.PC1)).attr('cy', d => yScale(d.PC2))
                    .attr('r', 0).attr('fill', (d, i) => getColor(d, i))
                    .style('opacity', 0.75)
                    .attr('stroke', 'var(--dashboard-point-stroke)').attr('stroke-width', 0.5)
                    .transition().duration(600).delay((_, i) => i * 1).attr('r', 5);
            });
        });

        return () => cancelAnimationFrame(raf);
    }, [data, k, clusterData]);

    // Compute ARI for current k
    const ari = (() => {
        if (!clusterData) return null;
        const clusters = clusterData[String(k)];
        if (!clusters) return null;
        // Simple ARI computation via matching
        // We'll use pre-computed from validation JSON instead — approximate from cluster data
        // For display, use the pre-computed ARI
        return null;
    })();

    return (
        <Card className="dashboard-panel w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 flex-wrap gap-3">
                <CardTitle className="dashboard-text-strong text-lg font-medium">K-Means vs Ground Truth</CardTitle>
                <div className="flex items-center gap-3">
                    <span className="dashboard-text-soft text-xs">Clusters (k):</span>
                    <div className="flex gap-1">
                        {[2, 3, 4, 5, 6, 7, 8].map(kVal => (
                            <button key={kVal}
                                onClick={() => setK(kVal)}
                                className={`w-8 h-8 rounded text-xs font-bold transition-all cursor-pointer ${k === kVal
                                        ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/40'
                                        : 'dashboard-control dashboard-text-soft border hover:opacity-90'
                                    }`}
                            >{kVal}</button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div ref={containerRef} className="flex gap-3 justify-center" style={{ minHeight: 380 }}>
                    <svg ref={leftRef}></svg>
                    <svg ref={rightRef}></svg>
                </div>
                {/* Legend */}
                <div className="flex justify-center gap-5 mt-3 flex-wrap">
                    <div className="dashboard-text-faint text-xs font-medium">K-Means Clusters:</div>
                    {Array.from({ length: k }, (_, i) => (
                        <div key={i} className="dashboard-text-muted flex items-center gap-1.5 text-xs">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: CLUSTER_PALETTE[i] }}></div>
                            Cluster {i}
                        </div>
                    ))}
                    <div className="w-px" style={{ backgroundColor: 'var(--dashboard-divider)' }}></div>
                    <div className="dashboard-text-faint text-xs font-medium">Truth:</div>
                    {SPECIES_ORDER.map(sp => (
                        <div key={sp} className="dashboard-text-muted flex items-center gap-1.5 text-xs">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: (SPECIES_COLORS as Record<string, string>)[sp] }}></div>
                            {sp}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

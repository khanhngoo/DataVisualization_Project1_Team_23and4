"use client";

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { SEX_COLORS, FONT_FAMILY } from '@/lib/colors';
import { PenguinData } from '@/hooks/usePenguinData';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SPECIES_ORDER = ['Adelie', 'Chinstrap', 'Gentoo'];

type FeatureOption = 'bill_length_mm' | 'bill_depth_mm' | 'flipper_length_mm' | 'body_mass_g';

const FEATURE_OPTIONS: { value: FeatureOption; label: string }[] = [
    { value: 'body_mass_g', label: 'Body Mass (g)' },
    { value: 'flipper_length_mm', label: 'Flipper Length (mm)' },
    { value: 'bill_length_mm', label: 'Bill Length (mm)' },
    { value: 'bill_depth_mm', label: 'Bill Depth (mm)' },
];

function featureLabel(opt: FeatureOption): string {
    return FEATURE_OPTIONS.find(o => o.value === opt)?.label || opt;
}

export function DumbbellPlot({ data }: { data: PenguinData[] }) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [feature, setFeature] = useState<FeatureOption>('body_mass_g');

    useEffect(() => {
        if (!data.length || !svgRef.current || !containerRef.current) return;

        const raf = requestAnimationFrame(() => {
            if (!svgRef.current || !containerRef.current) return;
            const containerWidth = containerRef.current.clientWidth;
            if (containerWidth === 0) return;

            d3.select(svgRef.current).selectAll('*').remove();

            const stats: Record<string, { Male: number; Female: number }> = {};
            const counts: Record<string, { Male: number; Female: number }> = {};
            SPECIES_ORDER.forEach(sp => {
                stats[sp] = { Male: 0, Female: 0 };
                counts[sp] = { Male: 0, Female: 0 };
            });
            data.forEach(d => {
                const val = d[feature] as number;
                stats[d.species][d.sex] += val;
                counts[d.species][d.sex]++;
            });
            const avgStats = SPECIES_ORDER.map(sp => ({
                species: sp,
                Male: stats[sp].Male / counts[sp].Male,
                Female: stats[sp].Female / counts[sp].Female,
            }));

            const height = 220;
            const margin = { top: 40, right: 40, bottom: 50, left: 100 };
            const innerW = containerWidth - margin.left - margin.right;
            const innerH = height - margin.top - margin.bottom;

            const svg = d3.select(svgRef.current)
                .attr('width', containerWidth)
                .attr('height', height)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            const allVals = avgStats.flatMap(d => [d.Male, d.Female]);
            const marginPad = (d3.max(allVals)! - d3.min(allVals)!) * 0.15;
            const x = d3.scaleLinear().domain([d3.min(allVals)! - marginPad, d3.max(allVals)! + marginPad]).range([0, innerW]);
            const y = d3.scaleBand().domain(SPECIES_ORDER.slice().reverse()).range([0, innerH]).padding(0.5);

            svg.append('g')
                .call(d3.axisBottom(x).ticks(5).tickSize(-innerH).tickFormat(() => ''))
                .attr('transform', `translate(0,${innerH})`)
                .style('stroke', 'var(--dashboard-grid-strong)')
                .style('stroke-dasharray', '4,4');

            svg.append('g')
                .attr('transform', `translate(0,${innerH})`)
                .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(".1f")))
                .attr('color', 'var(--dashboard-axis)')
                .selectAll('text').style('font-family', FONT_FAMILY);

            svg.append('g')
                .call(d3.axisLeft(y).tickSize(0))
                .attr('color', 'var(--dashboard-axis)')
                .select('.domain').remove();
            svg.selectAll('.tick text').style('font-family', FONT_FAMILY).style('font-size', '13px');

            svg.append('text')
                .attr('x', innerW / 2).attr('y', innerH + 40)
                .style('text-anchor', 'middle').style('fill', 'var(--dashboard-text-soft)')
                .style('font-family', FONT_FAMILY).style('font-size', '12px')
                .text(featureLabel(feature));

            avgStats.forEach(d => {
                const yPos = y(d.species)! + y.bandwidth() / 2;

                svg.append('line')
                    .attr('x1', x(d.Female)).attr('x2', x(d.Female))
                    .attr('y1', yPos).attr('y2', yPos)
                    .attr('stroke', 'var(--dashboard-axis)')
                    .attr('stroke-width', 3)
                    .transition().duration(800)
                    .attr('x2', x(d.Male));

                svg.append('circle')
                    .attr('cx', x(d.Female)).attr('cy', yPos)
                    .attr('r', 0).attr('fill', SEX_COLORS.Female)
                    .transition().duration(600).delay(200)
                    .attr('r', 8);

                svg.append('circle')
                    .attr('cx', x(d.Male)).attr('cy', yPos)
                    .attr('r', 0).attr('fill', SEX_COLORS.Male)
                    .transition().duration(600).delay(400)
                    .attr('r', 8);

                const gap = ((d.Male - d.Female) / d.Female * 100).toFixed(1);
                svg.append('text')
                    .attr('x', x(d.Male) + 14).attr('y', yPos + 4)
                    .style('fill', 'var(--dashboard-text-soft)')
                    .style('font-family', FONT_FAMILY).style('font-size', '11px')
                    .text(`+${gap}%`)
                    .style('opacity', 0)
                    .transition().delay(800).duration(400)
                    .style('opacity', 1);
            });

            const legend = svg.append('g').attr('transform', `translate(${innerW - 120}, -20)`);
            legend.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 6).attr('fill', SEX_COLORS.Female);
            legend.append('text').attr('x', 10).attr('y', 4).text('Female Avg').style('fill', 'var(--dashboard-text)').style('font-size', '11px').style('font-family', FONT_FAMILY);
            legend.append('circle').attr('cx', 85).attr('cy', 0).attr('r', 6).attr('fill', SEX_COLORS.Male);
            legend.append('text').attr('x', 95).attr('y', 4).text('Male Avg').style('fill', 'var(--dashboard-text)').style('font-size', '11px').style('font-family', FONT_FAMILY);

        });

        return () => cancelAnimationFrame(raf);
    }, [data, feature]);

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-2">
                <h3 className="dashboard-text-muted pl-4 text-sm font-medium">Mean Averages</h3>
                <div className="flex items-center gap-2">
                    <span className="dashboard-text-soft text-xs">Trait:</span>
                    <Select value={feature} onValueChange={(v: string | null) => v && setFeature(v as FeatureOption)}>
                        <SelectTrigger className="dashboard-control w-[180px] border text-xs h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {FEATURE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
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

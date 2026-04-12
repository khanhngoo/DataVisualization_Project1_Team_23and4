"use client";

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { SPECIES_COLORS, FONT_FAMILY } from '@/lib/colors';
import { PenguinData } from '@/hooks/usePenguinData';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

export function EngineScatter({ data }: { data: PenguinData[] }) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [xAxis, setXAxis] = useState<FeatureOption>('flipper_length_mm');
    const [yAxis, setYAxis] = useState<FeatureOption>('body_mass_g');

    useEffect(() => {
        if (!data.length || !svgRef.current || !containerRef.current) return;

        const raf = requestAnimationFrame(() => {
            if (!svgRef.current || !containerRef.current) return;
            const containerWidth = containerRef.current.clientWidth;
            if (containerWidth === 0) return;

            d3.select(svgRef.current).selectAll('*').remove();
            d3.selectAll('.engine-tooltip').remove();

            const width = Math.min(containerWidth - 10, 800);
            const height = 450;
            const margin = { top: 30, right: 30, bottom: 50, left: 60 };
            const innerW = width - margin.left - margin.right;
            const innerH = height - margin.top - margin.bottom;

            const svg = d3.select(svgRef.current)
                .attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            const getX = (d: PenguinData) => d[xAxis] as number;
            const getY = (d: PenguinData) => d[yAxis] as number;

            const x = d3.scaleLinear()
                .domain(d3.extent(data, getX) as [number, number]).nice()
                .range([0, innerW]);

            const y = d3.scaleLinear()
                .domain(d3.extent(data, getY) as [number, number]).nice()
                .range([innerH, 0]);

            // Grid
            svg.append('g').attr('transform', `translate(0,${innerH})`)
                .call(d3.axisBottom(x).ticks(8).tickSize(-innerH).tickFormat(() => ''))
                .style('stroke-dasharray', '4,4').style('color', 'var(--dashboard-grid-strong)');
            svg.append('g')
                .call(d3.axisLeft(y).ticks(8).tickSize(-innerW).tickFormat(() => ''))
                .style('stroke-dasharray', '4,4').style('color', 'var(--dashboard-grid-strong)');

            // Axes
            svg.append('g').attr('transform', `translate(0,${innerH})`)
                .call(d3.axisBottom(x).ticks(8))
                .attr('color', 'var(--dashboard-axis)')
                .selectAll('text').style('font-family', FONT_FAMILY).style('fill', 'var(--dashboard-axis-text)');
            svg.append('g')
                .call(d3.axisLeft(y).ticks(8))
                .attr('color', 'var(--dashboard-axis)')
                .selectAll('text').style('font-family', FONT_FAMILY).style('fill', 'var(--dashboard-axis-text)');

            // Axis labels
            svg.append('text').attr('x', innerW / 2).attr('y', innerH + 40).style('fill', 'var(--dashboard-text-soft)').style('text-anchor', 'middle').style('font-family', FONT_FAMILY).style('font-size', '12px').text(featureLabel(xAxis));
            svg.append('text').attr('x', -20).attr('y', -10).style('fill', 'var(--dashboard-text-soft)').style('text-anchor', 'start').style('font-family', FONT_FAMILY).style('font-size', '12px').text(featureLabel(yAxis));

            const tooltip = d3.select('body').append('div')
                .attr('class', 'engine-tooltip absolute hidden px-3 py-2 rounded text-xs pointer-events-none z-50')
                .style('background', 'var(--dashboard-tooltip-bg)')
                .style('color', 'var(--dashboard-tooltip-text)')
                .style('border', '1px solid var(--dashboard-tooltip-border)')
                .style('box-shadow', 'var(--dashboard-shadow)')
                .style('font-family', FONT_FAMILY);

            // Points
            svg.append('g')
                .selectAll('circle')
                .data(data)
                .join('circle')
                .attr('cx', d => x(getX(d)))
                .attr('cy', d => y(getY(d)))
                .attr('r', 0)
                .attr('fill', d => (SPECIES_COLORS as Record<string, string>)[d.species])
                .style('opacity', 0.8)
                .attr('stroke', 'var(--dashboard-point-stroke)')
                .attr('stroke-width', 0.8)
                .on('mouseover', function (event: MouseEvent, d: unknown) {
                    const pd = d as PenguinData;
                    d3.select(this).transition().duration(150).attr('r', 8).attr('stroke', 'white').attr('stroke-width', 2);
                    tooltip.classed('hidden', false).html(`
                        <b style="color:${(SPECIES_COLORS as Record<string, string>)[pd.species]}">${pd.species}</b><br>
                        ${featureLabel(xAxis)}: ${getX(pd)}<br>
                        ${featureLabel(yAxis)}: ${getY(pd)}<br>
                        Island: ${pd.island} | Sex: ${pd.sex}
                    `);
                })
                .on('mousemove', function (event: MouseEvent) {
                    tooltip.style('left', (event.pageX + 10) + 'px').style('top', (event.pageY - 10) + 'px');
                })
                .on('mouseout', function () {
                    d3.select(this).transition().duration(150).attr('r', 5).attr('stroke', 'var(--dashboard-point-stroke)').attr('stroke-width', 0.8);
                    tooltip.classed('hidden', true);
                })
                .transition()
                .duration(800)
                .delay((_, i) => i * 1.5)
                .attr('r', 5)
                .ease(d3.easeElastic);


        });

        return () => { cancelAnimationFrame(raf); d3.selectAll('.engine-tooltip').remove(); };
    }, [data, xAxis, yAxis]);

    return (
        <Card className="dashboard-panel w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 flex-wrap gap-3">
                <CardTitle className="dashboard-text-strong flex items-center gap-2 text-lg font-medium">
                    Feature Explorer
                    <span className="dashboard-text-soft ml-2 mt-0.5 text-xs font-normal">(<strong style={{ color: "#15478A" }}>Adelie</strong>, <strong style={{ color: "#5BB5D5" }}>Chinstrap</strong>, <strong style={{ color: "#876EC4" }}>Gentoo</strong>)</span>
                </CardTitle>
                <div className="flex gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                        <span className="dashboard-text-soft text-xs">X:</span>
                        <Select value={xAxis} onValueChange={(v: string | null) => v && setXAxis(v as FeatureOption)}>
                            <SelectTrigger className="dashboard-control w-[160px] border text-xs h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {FEATURE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="dashboard-text-soft text-xs">Y:</span>
                        <Select value={yAxis} onValueChange={(v: string | null) => v && setYAxis(v as FeatureOption)}>
                            <SelectTrigger className="dashboard-control w-[160px] border text-xs h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {FEATURE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div ref={containerRef} className="w-full flex justify-center" style={{ minHeight: 450 }}>
                    <svg ref={svgRef}></svg>
                </div>
            </CardContent>
        </Card>
    );
}

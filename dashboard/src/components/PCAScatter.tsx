"use client";

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { SPECIES_COLORS, FONT_FAMILY } from '@/lib/colors';
import { PenguinData } from '@/hooks/usePenguinData';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type AxisOption = 'PC1' | 'PC2' | 'PC3' | 'bill_length_mm' | 'bill_depth_mm' | 'flipper_length_mm' | 'body_mass_g';

const AXIS_OPTIONS: { value: AxisOption; label: string }[] = [
    { value: 'PC1', label: 'PC1 (68.8% var)' },
    { value: 'PC2', label: 'PC2 (19.3% var)' },
    { value: 'PC3', label: 'PC3 (9.2% var)' },
    { value: 'bill_length_mm', label: 'Bill Length (mm)' },
    { value: 'bill_depth_mm', label: 'Bill Depth (mm)' },
    { value: 'flipper_length_mm', label: 'Flipper Length (mm)' },
    { value: 'body_mass_g', label: 'Body Mass (g)' },
];

function axisLabel(opt: AxisOption): string {
    return AXIS_OPTIONS.find(o => o.value === opt)?.label || opt;
}

export function PCAScatter({ data }: { data: PenguinData[] }) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [xAxis, setXAxis] = useState<AxisOption>('PC1');
    const [yAxis, setYAxis] = useState<AxisOption>('PC2');

    useEffect(() => {
        if (!data.length || !svgRef.current || !containerRef.current) return;

        const raf = requestAnimationFrame(() => {
            if (!svgRef.current || !containerRef.current) return;
            const containerWidth = containerRef.current.clientWidth;
            if (containerWidth === 0) return;

            d3.select(svgRef.current).selectAll('*').remove();
            d3.selectAll('.pca-tip').remove();

            const width = Math.min(containerWidth - 10, 900);
            const height = 500;
            const margin = { top: 30, right: 40, bottom: 55, left: 60 };
            const innerW = width - margin.left - margin.right;
            const innerH = height - margin.top - margin.bottom;

            const svg = d3.select(svgRef.current)
                .attr('width', width).attr('height', height)
                .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

            const getX = (d: PenguinData) => d[xAxis] as number;
            const getY = (d: PenguinData) => d[yAxis] as number;

            const xScale = d3.scaleLinear()
                .domain(d3.extent(data, getX) as [number, number]).nice()
                .range([0, innerW]);
            const yScale = d3.scaleLinear()
                .domain(d3.extent(data, getY) as [number, number]).nice()
                .range([innerH, 0]);

            // Grid
            svg.append('g').attr('transform', `translate(0,${innerH})`)
                .call(d3.axisBottom(xScale).ticks(8).tickSize(-innerH).tickFormat(() => ''))
                .style('stroke-dasharray', '4,4').style('color', 'var(--dashboard-grid-strong)');
            svg.append('g')
                .call(d3.axisLeft(yScale).ticks(8).tickSize(-innerW).tickFormat(() => ''))
                .style('stroke-dasharray', '4,4').style('color', 'var(--dashboard-grid-strong)');

            // Axes
            svg.append('g').attr('transform', `translate(0,${innerH})`)
                .call(d3.axisBottom(xScale).ticks(8))
                .attr('color', 'var(--dashboard-axis)')
                .selectAll('text').style('font-family', FONT_FAMILY).style('fill', 'var(--dashboard-axis-text)');
            svg.append('g')
                .call(d3.axisLeft(yScale).ticks(8))
                .attr('color', 'var(--dashboard-axis)')
                .selectAll('text').style('font-family', FONT_FAMILY).style('fill', 'var(--dashboard-axis-text)');

            // Axis labels
            svg.append('text').attr('x', innerW / 2).attr('y', innerH + 42)
                .style('text-anchor', 'middle').style('fill', 'var(--dashboard-text-soft)')
                .style('font-family', FONT_FAMILY).style('font-size', '12px').text(axisLabel(xAxis));
            svg.append('text').attr('transform', 'rotate(-90)').attr('x', -innerH / 2).attr('y', -42)
                .style('text-anchor', 'middle').style('fill', 'var(--dashboard-text-soft)')
                .style('font-family', FONT_FAMILY).style('font-size', '12px').text(axisLabel(yAxis));

            // Tooltip
            const tooltip = d3.select('body').append('div').attr('class', 'pca-tip')
                .style('position', 'absolute').style('display', 'none')
                .style('background', 'var(--dashboard-tooltip-bg)').style('color', 'var(--dashboard-tooltip-text)')
                .style('padding', '8px 12px').style('border-radius', '8px')
                .style('font-size', '12px').style('font-family', FONT_FAMILY)
                .style('border', '1px solid var(--dashboard-tooltip-border)')
                .style('pointer-events', 'none').style('z-index', '9999');

            // Points
            svg.append('g').selectAll('circle')
                .data(data).join('circle')
                .attr('cx', d => xScale(getX(d)))
                .attr('cy', d => yScale(getY(d)))
                .attr('r', 0)
                .attr('fill', d => (SPECIES_COLORS as Record<string, string>)[d.species])
                .style('opacity', 0.8)
                .attr('stroke', 'var(--dashboard-point-stroke)')
                .attr('stroke-width', 0.8)
                .style('cursor', 'pointer')
                .on('mouseover', function (event: MouseEvent, d: unknown) {
                    const pd = d as PenguinData;
                    d3.select(this).transition().duration(150).attr('r', 9).attr('stroke', 'white').attr('stroke-width', 2);
                    tooltip.style('display', 'block').html(
                        `<b style="color:${(SPECIES_COLORS as Record<string, string>)[pd.species]}">${pd.species}</b><br>` +
                        `${axisLabel(xAxis)}: ${getX(pd).toFixed(2)}<br>${axisLabel(yAxis)}: ${getY(pd).toFixed(2)}<br>` +
                        `Island: ${pd.island} | Sex: ${pd.sex}`
                    );
                })
                .on('mousemove', function (event: MouseEvent) {
                    tooltip.style('left', (event.pageX + 12) + 'px').style('top', (event.pageY - 15) + 'px');
                })
                .on('mouseout', function () {
                    d3.select(this).transition().duration(150).attr('r', 6).attr('stroke', 'var(--dashboard-point-stroke)').attr('stroke-width', 0.8);
                    tooltip.style('display', 'none');
                })
                .transition().duration(800).delay((_, i) => i * 1.5).attr('r', 6).ease(d3.easeElastic);

            // Legend
            const legend = svg.append('g').attr('transform', `translate(${innerW - 180}, 5)`);
            (['Adelie', 'Chinstrap', 'Gentoo'] as const).forEach((sp, i) => {
                const g = legend.append('g').attr('transform', `translate(${i * 65}, 0)`);
                g.append('circle').attr('r', 5).attr('fill', (SPECIES_COLORS as Record<string, string>)[sp]);
                g.append('text').attr('x', 8).attr('y', 4).text(sp)
                    .style('fill', 'var(--dashboard-text-muted)').style('font-size', '10px').style('font-family', FONT_FAMILY);
            });
        });

        return () => { cancelAnimationFrame(raf); d3.selectAll('.pca-tip').remove(); };
    }, [data, xAxis, yAxis]);

    return (
        <Card className="dashboard-panel w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 flex-wrap gap-3">
                <CardTitle className="dashboard-text-strong text-lg font-medium">Dimensionality Scaling</CardTitle>
                <div className="flex gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                        <span className="dashboard-text-soft text-xs">X:</span>
                        <Select value={xAxis} onValueChange={(v: string | null) => v && setXAxis(v as AxisOption)}>
                            <SelectTrigger className="dashboard-control w-[160px] border text-xs h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {AXIS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="dashboard-text-soft text-xs">Y:</span>
                        <Select value={yAxis} onValueChange={(v: string | null) => v && setYAxis(v as AxisOption)}>
                            <SelectTrigger className="dashboard-control w-[160px] border text-xs h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {AXIS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div ref={containerRef} className="w-full flex justify-center" style={{ minHeight: 500 }}>
                    <svg ref={svgRef}></svg>
                </div>
            </CardContent>
        </Card>
    );
}

"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { SPECIES_COLORS, SEX_COLORS, FONT_FAMILY } from '@/lib/colors';
import { PenguinData } from '@/hooks/usePenguinData';

type VariableType = 'species' | 'sex';

interface DistributionDonutProps {
    data: PenguinData[];
    variable: VariableType;
    title: string;
}

export function DistributionDonut({ data, variable, title }: DistributionDonutProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!data.length || !svgRef.current) return;

        // Clear previous
        d3.select(svgRef.current).selectAll('*').remove();

        const width = 300;
        const height = 300;
        const margin = 20;
        const radius = Math.min(width, height) / 2 - margin;

        const svg = d3
            .select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2},${height / 2})`);

        // Prepare data counts
        const counts: Record<string, number> = {};
        data.forEach(d => {
            const key = d[variable] as string;
            counts[key] = (counts[key] || 0) + 1;
        });

        const pieData = Object.entries(counts).map(([key, value]) => ({ key, value }));

        const colorMap = variable === 'species' ? SPECIES_COLORS : SEX_COLORS;
        const colorScale = d3.scaleOrdinal()
            .domain(Object.keys(colorMap))
            .range(Object.values(colorMap));

        const pie = d3.pie<any>().value(d => d.value).sort(null);
        const dataReady = pie(pieData);

        const arcGenerator = d3.arc<any>()
            .innerRadius(radius * 0.55) // Donut hole
            .outerRadius(radius)
            .cornerRadius(4);

        const arcHover = d3.arc<any>()
            .innerRadius(radius * 0.55)
            .outerRadius(radius + 8)
            .cornerRadius(4);

        const tooltip = d3.select('body').append('div')
            .attr('class', 'absolute hidden px-3 py-2 rounded text-sm pointer-events-none z-50')
            .style('background', 'var(--dashboard-tooltip-bg)')
            .style('color', 'var(--dashboard-tooltip-text)')
            .style('border', '1px solid var(--dashboard-tooltip-border)')
            .style('box-shadow', 'var(--dashboard-shadow)')
            .style('font-family', FONT_FAMILY);

        // Slices
        const paths = svg
            .selectAll('path')
            .data(dataReady)
            .join('path')
            .attr('d', arcGenerator as any)
            .attr('fill', d => colorScale(d.data.key) as string)
            .attr('stroke', 'var(--dashboard-border)')
            .style('stroke-width', '2px')
            .style('opacity', 0)
            .style('cursor', 'pointer')
            .on('mouseover', function (event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style('opacity', 1)
                    .attr('d', arcHover(d as any));

                tooltip
                    .classed('hidden', false)
                    .html(`<strong>${d.data.key}</strong>: ${d.data.value} (${((d.data.value / data.length) * 100).toFixed(1)}%)`);
            })
            .on('mousemove', function (event) {
                tooltip
                    .style('left', (event.pageX + 15) + 'px')
                    .style('top', (event.pageY - 15) + 'px');
            })
            .on('mouseout', function (event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style('opacity', 0.8)
                    .attr('d', arcGenerator(d as any));
                tooltip.classed('hidden', true);
            });

        // Intro Animation
        paths.transition()
            .duration(1000)
            .style('opacity', 0.8)
            .attrTween('d', function (d: any) {
                const i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
                return function (t) {
                    d.endAngle = i(t);
                    return arcGenerator(d) as string;
                }
            });

        // Add labels
        svg
            .selectAll('text')
            .data(dataReady)
            .join('text')
            .text(d => d.data.key)
            .attr('transform', d => `translate(${arcGenerator.centroid(d as any)})`)
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('fill', 'var(--dashboard-text-strong)')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .transition()
            .delay(800)
            .duration(500)
            .style('opacity', 1);

        // Cleanup tooltip on unmount
        return () => {
            tooltip.remove();
        };
    }, [data, variable]);

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <h3 className="dashboard-text-muted mb-2 text-lg font-medium">{title}</h3>
            <svg ref={svgRef}></svg>
        </div>
    );
}

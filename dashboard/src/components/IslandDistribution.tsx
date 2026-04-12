"use client";

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { SPECIES_COLORS, FONT_FAMILY } from '@/lib/colors';
import { PenguinData } from '@/hooks/usePenguinData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function IslandDistribution({ data }: { data: PenguinData[] }) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [sexFilter, setSexFilter] = useState<'All' | 'Male' | 'Female'>('All');

    useEffect(() => {
        if (!data.length || !svgRef.current || !containerRef.current) return;

        const raf = requestAnimationFrame(() => {
            if (!svgRef.current || !containerRef.current) return;
            const containerWidth = containerRef.current.clientWidth;
            if (containerWidth === 0) return;

            // Filter
            const filteredData = sexFilter === 'All' ? data : data.filter(d => d.sex === sexFilter);

            // Process data: count per island, per species
            type IslandCount = { island: string; Adelie: number; Chinstrap: number; Gentoo: number };
            const counts: Record<string, IslandCount> = {
                Biscoe: { island: 'Biscoe', Adelie: 0, Chinstrap: 0, Gentoo: 0 },
                Dream: { island: 'Dream', Adelie: 0, Chinstrap: 0, Gentoo: 0 },
                Torgersen: { island: 'Torgersen', Adelie: 0, Chinstrap: 0, Gentoo: 0 }
            };

            filteredData.forEach(d => {
                if (counts[d.island]) counts[d.island][d.species]++;
            });

            const parsedData = Object.values(counts);
            const subgroups = ['Adelie', 'Chinstrap', 'Gentoo'] as const;
            const groups = ['Biscoe', 'Dream', 'Torgersen'];

            // D3 Stack layout
            const stackGenerator = d3.stack<IslandCount>()
                .keys(subgroups);
            const stackedData = stackGenerator(parsedData);

            // D3 setup
            d3.select(svgRef.current).selectAll('*').remove();
            d3.select('.island-tooltip').remove();

            const height = 350;
            const margin = { top: 40, right: 30, bottom: 40, left: 50 };
            const innerW = containerWidth - margin.left - margin.right;
            const innerH = height - margin.top - margin.bottom;

            const svg = d3.select(svgRef.current)
                .attr('width', containerWidth)
                .attr('height', height)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            const x = d3.scaleBand()
                .domain(groups)
                .range([0, innerW])
                .padding(0.3); // a bit wider bars

            const xAxis = svg.append('g')
                .attr('transform', `translate(0,${innerH})`)
                .call(d3.axisBottom(x).tickSizeOuter(0));

            xAxis.selectAll('text')
                .style('font-family', FONT_FAMILY)
                .style('font-size', '13px')
                .style('fill', 'var(--dashboard-axis-text)');
            xAxis.select('.domain').attr('stroke', 'var(--dashboard-axis)');

            // Max value calculation for dynamic Y scaling depending on filter (sum across species for each island)
            const maxVal = d3.max(parsedData, d => d.Adelie + d.Chinstrap + d.Gentoo);
            const yMax = maxVal ? Math.ceil(maxVal / 20) * 20 : 180;

            const y = d3.scaleLinear()
                .domain([0, yMax])
                .range([innerH, 0]);

            const yAxis = svg.append('g')
                .call(d3.axisLeft(y).ticks(5));

            yAxis.selectAll('text')
                .style('font-family', FONT_FAMILY)
                .style('fill', 'var(--dashboard-axis-text)');
            yAxis.select('.domain').attr('stroke', 'var(--dashboard-axis)');

            // Grid
            svg.append('g')
                .attr('class', 'grid')
                .call(d3.axisLeft(y).ticks(5).tickSize(-innerW).tickFormat(() => ''))
                .style('stroke', 'var(--dashboard-grid-strong)')
                .style('stroke-dasharray', '4,4')
                .select('.domain').remove();

            const tooltip = d3.select('body').append('div')
                .attr('class', 'island-tooltip absolute hidden px-3 py-2 rounded text-sm pointer-events-none z-50')
                .style('background', 'var(--dashboard-tooltip-bg)')
                .style('color', 'var(--dashboard-tooltip-text)')
                .style('border', '1px solid var(--dashboard-tooltip-border)')
                .style('box-shadow', 'var(--dashboard-shadow)')
                .style('font-family', FONT_FAMILY);

            const barsGroup = svg.append('g')
                .selectAll('g')
                .data(stackedData)
                .join('g')
                .attr('fill', d => (SPECIES_COLORS as Record<string, string>)[d.key]);

            const bars = barsGroup.selectAll('rect')
                .data(d => d.map(item => ({ ...item, key: d.key }))) // inject the species key
                .join('rect')
                .attr('x', d => x(d.data.island)!)
                .attr('y', innerH)
                .attr('height', 0)
                .attr('width', x.bandwidth())
                .attr('stroke', 'var(--dashboard-border-strong)')
                .attr('stroke-width', 1)
                // Add border radius visually by rx if you want, but stacking can get weird. We leave flat for stack.
                .on('mouseover', function (event: MouseEvent, d: any) {
                    const count = d[1] - d[0];
                    if (count === 0) return; // ignore empty parts of stack
                    d3.select(this).style('opacity', 0.8).attr('stroke', 'white');
                    tooltip.classed('hidden', false)
                        .html(`<strong>${d.key}</strong><br>${count} penguins on ${d.data.island}`);
                })
                .on('mousemove', function (event: MouseEvent) {
                    tooltip.style('left', (event.pageX + 10) + 'px').style('top', (event.pageY - 20) + 'px');
                })
                .on('mouseout', function () {
                    d3.select(this).style('opacity', 1).attr('stroke', 'var(--dashboard-border-strong)');
                    tooltip.classed('hidden', true);
                });

            // Animation for bars
            bars.transition()
                .duration(800)
                .delay((d, i) => i * 100)
                .attr('y', d => y(d[1]))
                .attr('height', d => y(d[0]) - y(d[1]));

            // Add text labels inside the stacks
            barsGroup.selectAll('text')
                .data(d => d.map(item => ({ ...item, key: d.key })))
                .join('text')
                .attr('x', d => x(d.data.island)! + x.bandwidth() / 2)
                .attr('y', innerH) // Start at bottom
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', 'middle')
                .style('fill', 'white')
                .style('font-size', '12px')
                .style('font-family', FONT_FAMILY)
                .style('font-weight', 'bold')
                .style('pointer-events', 'none')
                .style('opacity', 0)
                .text(d => {
                    const count = d[1] - d[0];
                    return count > 5 ? count : ''; // Only show if not squished
                })
                .transition()
                .duration(800)
                .delay((_, i) => i * 100 + 400) // Delay text until bars are almost up
                .attr('y', d => y(d[0]) - (y(d[0]) - y(d[1])) / 2) // Middle of the stack
                .style('opacity', 1);

        });

        return () => { d3.select('.island-tooltip').remove(); };
    }, [data, sexFilter]);

    return (
        <div className="w-full">
            <div className="flex justify-end mb-4 mt-2">
                <div className="flex items-center gap-2">
                    <span className="dashboard-text-soft text-xs">Filter Sex:</span>
                    <Select value={sexFilter} onValueChange={(v: string | null) => v && setSexFilter(v as 'All' | 'Male' | 'Female')}>
                        <SelectTrigger className="dashboard-control w-[120px] border text-xs h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Genders</SelectItem>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
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

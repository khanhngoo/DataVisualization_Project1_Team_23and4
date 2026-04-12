"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { SEX_COLORS, FONT_FAMILY } from '@/lib/colors';
import { PenguinData } from '@/hooks/usePenguinData';

export function SexualDimorphism({ data }: { data: PenguinData[] }) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!data.length || !svgRef.current) return;

        // Process data: avg mass per species and sex
        type Stats = { species: string; Male: number; Female: number };
        const averages: Record<string, { m: number, mc: number, f: number, fc: number }> = {
            Adelie: { m: 0, mc: 0, f: 0, fc: 0 },
            Chinstrap: { m: 0, mc: 0, f: 0, fc: 0 },
            Gentoo: { m: 0, mc: 0, f: 0, fc: 0 }
        };

        data.forEach(d => {
            if (d.sex === 'Male') {
                averages[d.species].m += d.body_mass_g;
                averages[d.species].mc++;
            } else if (d.sex === 'Female') {
                averages[d.species].f += d.body_mass_g;
                averages[d.species].fc++;
            }
        });

        const parsedData: Stats[] = Object.keys(averages).map(species => ({
            species,
            Male: averages[species].m / averages[species].mc,
            Female: averages[species].f / averages[species].fc
        }));

        const groups = ['Adelie', 'Chinstrap', 'Gentoo'];
        const subgroups = ['Female', 'Male'];

        d3.select(svgRef.current).selectAll('*').remove();
        d3.select('.dimorphism-tooltip').remove();

        const margin = { top: 40, right: 30, bottom: 40, left: 60 };
        const width = 600 - margin.left - margin.right;
        const height = 350 - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current)
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(groups)
            .range([0, width])
            .padding(0.2);

        const xAxis = svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).tickSizeOuter(0));

        xAxis.selectAll('text')
            .style('font-family', FONT_FAMILY)
            .style('font-size', '13px')
            .style('fill', 'rgba(255,255,255,0.8)');
        xAxis.select('.domain').attr('stroke', 'rgba(255,255,255,0.2)');

        const y = d3.scaleLinear()
            .domain([0, 6000])
            .range([height, 0]);

        const yAxis = svg.append('g')
            .call(d3.axisLeft(y).ticks(6));

        yAxis.selectAll('text')
            .style('font-family', FONT_FAMILY)
            .style('fill', 'rgba(255,255,255,0.8)');
        yAxis.select('.domain').attr('stroke', 'rgba(255,255,255,0.2)');

        // Grid
        svg.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft(y).ticks(6).tickSize(-width).tickFormat(() => ''))
            .style('stroke', 'rgba(255,255,255,0.05)')
            .style('stroke-dasharray', '3,3');

        const xSubgroup = d3.scaleBand()
            .domain(subgroups)
            .range([0, x.bandwidth()])
            .padding(0.05);

        const tooltip = d3.select('body').append('div')
            .attr('class', 'dimorphism-tooltip absolute hidden bg-black/90 backdrop-blur-md text-white px-3 py-2 rounded shadow-2xl text-sm border border-white/10 pointer-events-none z-50')
            .style('font-family', FONT_FAMILY);

        svg.append('g')
            .selectAll('g')
            .data(parsedData)
            .join('g')
            .attr('transform', d => `translate(${x(d.species)}, 0)`)
            .selectAll('rect')
            .data(d => subgroups.map(key => ({ key, value: d[key as keyof Stats] as number })))
            .join('rect')
            .attr('x', d => xSubgroup(d.key)!)
            .attr('y', height)
            .attr('width', xSubgroup.bandwidth())
            .attr('height', 0)
            .attr('fill', d => SEX_COLORS[d.key as keyof typeof SEX_COLORS])
            .attr('rx', 4)
            .on('mouseover', function (event, d) {
                d3.select(this).style('opacity', 0.8);
                tooltip.classed('hidden', false)
                    .html(`<strong>${d.key}</strong>: ${d.value.toFixed(0)}g`);
            })
            .on('mousemove', function (event) {
                tooltip.style('left', (event.pageX + 10) + 'px').style('top', (event.pageY - 20) + 'px');
            })
            .on('mouseout', function () {
                d3.select(this).style('opacity', 1);
                tooltip.classed('hidden', true);
            })
            .transition()
            .duration(800)
            .delay((d, i) => i * 100)
            .attr('y', d => y(d.value))
            .attr('height', d => height - y(d.value));

        // Legend
        svg.append("rect").attr("x", width - 100).attr("y", -20).attr("width", 12).attr("height", 12).attr("fill", SEX_COLORS['Male'])
        svg.append("text").attr("x", width - 80).attr("y", -10).text("Male Avg Mass").style('fill', 'white').style('font-size', '12px').style('font-family', FONT_FAMILY);
        svg.append("rect").attr("x", width - 100).attr("y", 0).attr("width", 12).attr("height", 12).attr("fill", SEX_COLORS['Female'])
        svg.append("text").attr("x", width - 80).attr("y", 10).text("Female Avg Mass").style('fill', 'white').style('font-size', '12px').style('font-family', FONT_FAMILY);

        // Cleanup
        return () => { tooltip.remove(); };
    }, [data]);

    return <svg ref={svgRef} className="w-full max-w-2xl mx-auto"></svg>;
}

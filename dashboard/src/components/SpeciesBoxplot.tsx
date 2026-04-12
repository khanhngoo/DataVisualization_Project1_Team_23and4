"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { SPECIES_COLORS, FONT_FAMILY } from '@/lib/colors';
import { PenguinData } from '@/hooks/usePenguinData';

export function SpeciesBoxplot({ data, species, feature = 'body_mass_g', color }: { data: PenguinData[], species: string, feature?: keyof PenguinData, color: string }) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!data.length || !svgRef.current) return;

        // Filter data for this exact species
        const speciesData = data.filter(d => d.species === species).map(d => d[feature] as number).filter(v => v != null);
        if (speciesData.length === 0) return;

        speciesData.sort(d3.ascending);

        const q1 = d3.quantile(speciesData, 0.25) || 0;
        const median = d3.quantile(speciesData, 0.5) || 0;
        const q3 = d3.quantile(speciesData, 0.75) || 0;
        const iqr = q3 - q1;
        const minVal = Math.max(d3.min(speciesData) || 0, q1 - 1.5 * iqr);
        const maxVal = Math.min(d3.max(speciesData) || 0, q3 + 1.5 * iqr);

        // We know we want a small visualization tailored for the card
        const width = 200;
        const height = 40;
        const margin = { left: 10, right: 10 };
        const innerW = width - margin.left - margin.right;

        d3.select(svgRef.current).selectAll('*').remove();

        const svg = d3.select(svgRef.current)
            .attr('width', '100%') // Let it scale via CSS, but inner coordinate system is fixed ratio
            .attr('viewBox', `0 0 ${width} ${height}`)
            .append('g');

        // To make it comparable across cards, the scale should logically encompass the entire population range. 
        // But for visual clarity, maybe just the min/max of ALL data for this feature?
        const allFeatureData = data.map(d => d[feature] as number).filter(v => v != null);
        const globalExt = d3.extent(allFeatureData) as [number, number];

        // Add a bit of padding to the global extent
        const pad = (globalExt[1] - globalExt[0]) * 0.1;
        const xScale = d3.scaleLinear()
            .domain([globalExt[0] - pad, globalExt[1] + pad])
            .range([margin.left, width - margin.right]);

        // Draw track
        svg.append('line')
            .attr('x1', margin.left)
            .attr('x2', width - margin.right)
            .attr('y1', height / 2)
            .attr('y2', height / 2)
            .attr('stroke', 'rgba(255,255,255,0.1)')
            .attr('stroke-width', 2);

        // Draw Whiskers (Main line)
        svg.append('line')
            .attr('x1', xScale(minVal))
            .attr('x2', xScale(maxVal))
            .attr('y1', height / 2)
            .attr('y2', height / 2)
            .attr('stroke', color)
            .attr('stroke-width', 1.5);

        // Min limit
        svg.append('line')
            .attr('x1', xScale(minVal))
            .attr('x2', xScale(minVal))
            .attr('y1', height / 2 - 4)
            .attr('y2', height / 2 + 4)
            .attr('stroke', color)
            .attr('stroke-width', 1.5);

        // Max limit
        svg.append('line')
            .attr('x1', xScale(maxVal))
            .attr('x2', xScale(maxVal))
            .attr('y1', height / 2 - 4)
            .attr('y2', height / 2 + 4)
            .attr('stroke', color)
            .attr('stroke-width', 1.5);

        // Box
        svg.append('rect')
            .attr('x', xScale(q1))
            .attr('y', height / 2 - 8)
            .attr('width', xScale(q3) - xScale(q1))
            .attr('height', 16)
            .attr('stroke', color)
            .attr('stroke-width', 1.5)
            .attr('fill', `${color}33`) // 20% opacity using hex
            .attr('rx', 2);

        // Median
        svg.append('line')
            .attr('x1', xScale(median))
            .attr('x2', xScale(median))
            .attr('y1', height / 2 - 8)
            .attr('y2', height / 2 + 8)
            .attr('stroke', 'white')
            .attr('stroke-width', 2);

    }, [data, species, feature, color]);

    return <svg ref={svgRef}></svg>;
}

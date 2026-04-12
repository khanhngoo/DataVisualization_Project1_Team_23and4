"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { FONT_FAMILY } from '@/lib/colors';
import { KMeansValidation } from '@/hooks/usePenguinData';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

export function ClusterValidation({ validation }: { validation: KMeansValidation }) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!svgRef.current || !containerRef.current) return;

        const raf = requestAnimationFrame(() => {
            if (!svgRef.current || !containerRef.current) return;
            const containerWidth = containerRef.current.clientWidth;
            if (containerWidth === 0) return;

            d3.select(svgRef.current).selectAll('*').remove();

            const totalWidth = Math.min(containerWidth - 10, 900);
            const chartWidth = (totalWidth - 60) / 2;
            const height = 300;
            const margin = { top: 35, right: 20, bottom: 45, left: 50 };
            const innerW = chartWidth - margin.left - margin.right;
            const innerH = height - margin.top - margin.bottom;

            const svg = d3.select(svgRef.current)
                .attr('width', totalWidth).attr('height', height);

            const { k_range, inertias, silhouettes, ari_scores } = validation;

            // ── Panel 1: Elbow (Inertia) ─────────────────────
            const g1 = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

            const xScale = d3.scaleLinear().domain([d3.min(k_range)!, d3.max(k_range)!]).range([0, innerW]);
            const yInertia = d3.scaleLinear().domain([0, d3.max(inertias)! * 1.1]).range([innerH, 0]);

            // Grid
            g1.append('g').attr('transform', `translate(0,${innerH})`).call(d3.axisBottom(xScale).ticks(7).tickSize(-innerH).tickFormat(() => ''))
                .style('stroke-dasharray', '4,4').style('color', 'var(--dashboard-grid-strong)');

            // Axes
            g1.append('g').attr('transform', `translate(0,${innerH})`).call(d3.axisBottom(xScale).ticks(7).tickFormat(d3.format('d')))
                .attr('color', 'var(--dashboard-axis)')
                .selectAll('text').style('font-family', FONT_FAMILY).style('fill', 'var(--dashboard-axis-text)');
            g1.append('g').call(d3.axisLeft(yInertia).ticks(5))
                .attr('color', 'var(--dashboard-axis)')
                .selectAll('text').style('font-family', FONT_FAMILY).style('fill', 'var(--dashboard-axis-text)').style('font-size', '10px');

            // Line
            const line1 = d3.line<number>().x((_, i) => xScale(k_range[i])).y(d => yInertia(d)).curve(d3.curveMonotoneX);
            g1.append('path').datum(inertias).attr('fill', 'none')
                .attr('stroke', '#15478A').attr('stroke-width', 2.5).attr('d', line1);

            // Dots
            g1.selectAll('.dot').data(inertias).join('circle')
                .attr('cx', (_, i) => xScale(k_range[i])).attr('cy', d => yInertia(d))
                .attr('r', 5).attr('fill', '#15478A').attr('stroke', 'white').attr('stroke-width', 1);

            // Star at k=3
            g1.append('text').attr('x', xScale(3)).attr('y', yInertia(inertias[1]) - 14)
                .style('text-anchor', 'middle').style('fill', '#3B5BBE').style('font-size', '10px')
                .style('font-weight', 'bold').style('font-family', FONT_FAMILY).text('★ Optimal (k=3)');

            // Title
            g1.append('text').attr('x', innerW / 2).attr('y', -18)
                .style('text-anchor', 'middle').style('fill', 'var(--dashboard-text-strong)')
                .style('font-family', FONT_FAMILY).style('font-size', '12px').style('font-weight', '600')
                .text('Elbow Method (Inertia)');

            // X label
            g1.append('text').attr('x', innerW / 2).attr('y', innerH + 38)
                .style('text-anchor', 'middle').style('fill', 'var(--dashboard-text-soft)')
                .style('font-family', FONT_FAMILY).style('font-size', '11px').text('Number of Clusters (k)');

            // ── Panel 2: Silhouette ──────────────────────────
            const g2 = svg.append('g').attr('transform', `translate(${chartWidth + 60 + margin.left},${margin.top})`);

            const ySil = d3.scaleLinear().domain([0, d3.max(silhouettes)! * 1.15]).range([innerH, 0]);

            g2.append('g').attr('transform', `translate(0,${innerH})`).call(d3.axisBottom(xScale).ticks(7).tickSize(-innerH).tickFormat(() => ''))
                .style('stroke-dasharray', '4,4').style('color', 'var(--dashboard-grid-strong)');

            g2.append('g').attr('transform', `translate(0,${innerH})`).call(d3.axisBottom(xScale).ticks(7).tickFormat(d3.format('d')))
                .attr('color', 'var(--dashboard-axis)')
                .selectAll('text').style('font-family', FONT_FAMILY).style('fill', 'var(--dashboard-axis-text)');
            g2.append('g').call(d3.axisLeft(ySil).ticks(5))
                .attr('color', 'var(--dashboard-axis)')
                .selectAll('text').style('font-family', FONT_FAMILY).style('fill', 'var(--dashboard-axis-text)').style('font-size', '10px');

            const line2 = d3.line<number>().x((_, i) => xScale(k_range[i])).y(d => ySil(d)).curve(d3.curveMonotoneX);
            g2.append('path').datum(silhouettes).attr('fill', 'none')
                .attr('stroke', '#5BB5D5').attr('stroke-width', 2.5).attr('d', line2);

            g2.selectAll('.dot').data(silhouettes).join('circle')
                .attr('cx', (_, i) => xScale(k_range[i])).attr('cy', d => ySil(d))
                .attr('r', 5).attr('fill', '#5BB5D5').attr('stroke', 'white').attr('stroke-width', 1);

            // Peak at k=2
            g2.append('text').attr('x', xScale(2)).attr('y', ySil(silhouettes[0]) - 14)
                .style('text-anchor', 'middle').style('fill', '#876EC4').style('font-size', '10px')
                .style('font-weight', 'bold').style('font-family', FONT_FAMILY).text('Peak (k=2)');

            g2.append('text').attr('x', innerW / 2).attr('y', -18)
                .style('text-anchor', 'middle').style('fill', 'var(--dashboard-text-strong)')
                .style('font-family', FONT_FAMILY).style('font-size', '12px').style('font-weight', '600')
                .text('Silhouette Score');

            g2.append('text').attr('x', innerW / 2).attr('y', innerH + 38)
                .style('text-anchor', 'middle').style('fill', 'var(--dashboard-text-soft)')
                .style('font-family', FONT_FAMILY).style('font-size', '11px').text('Number of Clusters (k)');
        });

        return () => cancelAnimationFrame(raf);
    }, [validation]);

    // ARI at k=3
    const ariK3 = validation.ari_scores[validation.k_range.indexOf(3)];

    return (
        <Card className="dashboard-panel w-full">
            <CardHeader className="pb-2">
                <CardTitle className="dashboard-text-strong text-lg font-medium">
                    Cluster Validation: Finding the Optimal k
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div ref={containerRef} className="w-full flex justify-center" style={{ minHeight: 300 }}>
                    <svg ref={svgRef}></svg>
                </div>

                {/* ARI score callout */}
                <div className="mt-4 flex items-center justify-center gap-3">
                    <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-lg px-5 py-3 text-center">
                        <div className="text-xs text-emerald-300/70 uppercase tracking-wider font-medium">Adjusted Rand Index (k=3)</div>
                        <div className="text-3xl font-bold text-emerald-300 mt-1">{ariK3.toFixed(2)}</div>
                        <div className="dashboard-text-soft mt-1 text-xs">Agreement with nature&apos;s species labels</div>
                    </div>
                    <div className="dashboard-text-muted max-w-sm text-xs leading-relaxed">
                        At <strong className="dashboard-text-strong">k=3</strong>, K-Means achieves <strong className="text-emerald-300">{(ariK3 * 100).toFixed(0)}% agreement</strong> with the actual species groupings — the algorithm successfully rediscovers nature&apos;s three tribes from raw body measurements alone.
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

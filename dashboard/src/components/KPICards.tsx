"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PenguinData } from '@/hooks/usePenguinData';

export function KPICards({ data }: { data: PenguinData[] }) {
    const stats = useMemo(() => {
        if (!data.length) return null;

        const count = data.length;
        const avgMass = data.reduce((acc, p) => acc + p.body_mass_g, 0) / count;

        const adelieCount = data.filter(p => p.species === 'Adelie').length;
        const gentooCount = data.filter(p => p.species === 'Gentoo').length;
        const chinstrapCount = data.filter(p => p.species === 'Chinstrap').length;

        return {
            total: count,
            avgMass: avgMass.toLocaleString(undefined, { maximumFractionDigits: 0 }),
            adelieCount,
            gentooCount,
            chinstrapCount
        };
    }, [data]);

    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="dashboard-panel">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="dashboard-text-muted text-sm font-medium">Total Monitored Penguins</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="dashboard-text-strong text-3xl font-bold">{stats.total}</div>
                    <p className="dashboard-text-soft mt-1 text-xs">
                        Complete observations retained
                    </p>
                </CardContent>
            </Card>

            <Card className="dashboard-panel relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="dashboard-text-muted text-sm font-medium">Adelie Tribe</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="dashboard-text-strong text-3xl font-bold">{stats.adelieCount}</div>
                    <p className="mt-1 inline-block rounded px-2 py-0.5 text-xs font-semibold" style={{ color: "#15478A", backgroundColor: "rgba(21, 71, 138, 0.12)" }}>Torgersen, Biscoe, Dream</p>
                </CardContent>
            </Card>

            <Card className="dashboard-panel relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="dashboard-text-muted text-sm font-medium">Gentoo Tribe</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="dashboard-text-strong text-3xl font-bold">{stats.gentooCount}</div>
                    <p className="mt-1 inline-block rounded px-2 py-0.5 text-xs font-semibold" style={{ color: "#876EC4", backgroundColor: "rgba(135, 110, 196, 0.12)" }}>Biscoe Island</p>
                </CardContent>
            </Card>

            <Card className="dashboard-panel relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="dashboard-text-muted text-sm font-medium">Chinstrap Tribe</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="dashboard-text-strong text-3xl font-bold">{stats.chinstrapCount}</div>
                    <p className="mt-1 inline-block rounded px-2 py-0.5 text-xs font-semibold" style={{ color: "#5BB5D5", backgroundColor: "rgba(91, 181, 213, 0.12)" }}>Dream Island</p>
                </CardContent>
            </Card>
        </div>
    );
}

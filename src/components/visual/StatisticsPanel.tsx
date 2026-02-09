'use client';

import { useAllocationStore } from '@/store/allocationStore';
import { motion } from 'framer-motion';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    variant: 'primary' | 'warning' | 'info';
}

function StatCard({ title, value, subtitle, variant }: StatCardProps) {
    const colors = {
        primary: {
            border: 'border-cyan-500/50 hover:border-cyan-400',
            text: 'text-cyan-400',
            glow: 'shadow-[0_0_10px_rgba(0,242,255,0.1)]'
        },
        warning: {
            border: 'border-red-500/50 hover:border-red-400',
            text: 'text-red-400',
            glow: 'shadow-[0_0_10px_rgba(239,68,68,0.1)]'
        },
        info: {
            border: 'border-purple-500/50 hover:border-purple-400',
            text: 'text-purple-400',
            glow: 'shadow-[0_0_10px_rgba(168,85,247,0.1)]'
        }
    };

    const { border, text, glow } = colors[variant];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-black/40 border ${border} ${glow} rounded-lg p-2 flex flex-col items-center justify-center transition-all duration-300`}
        >
            <div className="text-[9px] text-gray-500 font-mono uppercase tracking-wider text-center">
                {title}
            </div>
            <div className={`text-lg font-mono font-bold ${text} mt-0.5 drop-shadow-[0_0_5px_currentColor]`}>
                {value}
            </div>
            {subtitle && (
                <div className="text-[9px] text-gray-400 font-mono mt-0.5">
                    {subtitle}
                </div>
            )}
        </motion.div>
    );
}

export default function StatisticsPanel() {
    const { totalMemory, memoryBlocks, statsHistory } = useAllocationStore();

    // Get current stats from the latest entry in statsHistory
    const currentStats = statsHistory[statsHistory.length - 1];

    // Calculate statistics based on current memory state
    const holes = memoryBlocks.filter(b => b.type === 'HOLE');
    const processes = memoryBlocks.filter(b => b.type === 'PROCESS');

    // Basic memory stats
    const freeMemory = holes.reduce((acc, h) => acc + h.size, 0);
    const usedMemory = totalMemory - freeMemory;
    const usedPercent = ((usedMemory / totalMemory) * 100).toFixed(1);
    const freePercent = ((freeMemory / totalMemory) * 100).toFixed(1);

    // Process stats
    const activeCount = processes.length;
    const avgProcessSize = activeCount > 0
        ? Math.round(usedMemory / activeCount)
        : 0;

    // Hole stats
    const holeCount = holes.length;
    const largestFree = currentStats.largestHole;
    const smallestFree = holes.length > 0
        ? Math.min(...holes.map(h => h.size))
        : 0;
    const avgHoleSize = holeCount > 0
        ? Math.round(freeMemory / holeCount)
        : 0;

    // Fragmentation stats
    const externalFrag = freeMemory - largestFree;
    const externalFragPercent = freeMemory > 0
        ? ((externalFrag / freeMemory) * 100).toFixed(1)
        : '0';

    // Memory utilization (efficiency)
    const utilization = ((usedMemory / totalMemory) * 100).toFixed(1);

    return (
        <div className="flex flex-col h-full">
            {/* Stats Grid - 5 columns x 2 rows = 10 stats */}
            <div className="grid grid-cols-5 gap-2">
                {/* Row 1: Memory Overview */}
                <StatCard
                    title="Total"
                    value={`${(totalMemory / 1000).toFixed(1)}MB`}
                    variant="primary"
                />
                <StatCard
                    title="Used"
                    value={`${(usedMemory / 1000).toFixed(1)}MB`}
                    subtitle={`${usedPercent}%`}
                    variant="warning"
                />
                <StatCard
                    title="Free"
                    value={`${(freeMemory / 1000).toFixed(1)}MB`}
                    subtitle={`${freePercent}%`}
                    variant="primary"
                />
                <StatCard
                    title="Utilization"
                    value={`${utilization}%`}
                    variant="info"
                />
                <StatCard
                    title="Processes"
                    value={activeCount}
                    variant="info"
                />

                {/* Row 2: Fragmentation & Holes */}
                <StatCard
                    title="Ext. Frag"
                    value={`${externalFrag}KB`}
                    subtitle={`${externalFragPercent}%`}
                    variant="warning"
                />
                <StatCard
                    title="Holes"
                    value={holeCount}
                    variant="info"
                />
                <StatCard
                    title="Max Hole"
                    value={`${largestFree}KB`}
                    variant="primary"
                />
                <StatCard
                    title="Min Hole"
                    value={`${smallestFree}KB`}
                    variant="primary"
                />
                <StatCard
                    title="Avg Hole"
                    value={`${avgHoleSize}KB`}
                    variant="info"
                />
            </div>
        </div>
    );
}

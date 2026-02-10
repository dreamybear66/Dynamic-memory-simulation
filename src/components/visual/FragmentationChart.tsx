'use client';

import { useAllocationStore } from '@/store/allocationStore';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

export default function FragmentationChart() {
    const { statsHistory, totalMemory, memoryBlocks } = useAllocationStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Calculate external fragmentation (total free - largest free)
    // This gives us the scattered free space
    const calculateExternalFrag = (stat: typeof statsHistory[0]) => {
        return stat.externalFragmentation - stat.largestHole;
    };

    // Auto-scroll to latest data
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
    }, [statsHistory]);

    // Chart dimensions
    const chartHeight = 180;
    const chartPadding = { top: 20, bottom: 35, left: 50, right: 20 };
    const pointSpacing = 100; // Pixels between each step
    const chartInnerWidth = Math.max(400, statsHistory.length * pointSpacing);

    // Calculate max value for Y-axis scaling
    const maxFrag = Math.max(
        ...statsHistory.map(s => calculateExternalFrag(s)),
        totalMemory * 0.1 // Minimum scale
    );

    // Round up to nice number for Y-axis
    const yMax = Math.ceil(maxFrag / 100) * 100 || 100;

    // Generate Y-axis labels (5 divisions)
    const yLabels = [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax];

    // Calculate points for the line
    const points = statsHistory.map((stat, i) => {
        const x = chartPadding.left + (i * pointSpacing) + pointSpacing / 2;
        const fragValue = calculateExternalFrag(stat);
        const y = chartPadding.top +
            (chartHeight - chartPadding.top - chartPadding.bottom) *
            (1 - fragValue / yMax);
        return { x, y, value: fragValue, step: i + 1 };
    });

    // Create SVG path from points
    const linePath = points.length > 0
        ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`
        : '';

    return (
        <div className="flex flex-col h-full w-full bg-black/40 border border-cyan-900/30 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="px-4 py-2 border-b border-cyan-900/50 bg-charcoal/80">
                <h3 className="text-xs tracking-widest font-bold text-cyan-300 uppercase">
                    Fragmentation Over Time
                </h3>
            </div>

            {/* Legend */}
            <div className="px-4 py-2 flex items-center gap-2 bg-black/20">
                <div className="w-6 h-0.5 bg-cyan-400 rounded" />
                <span className="text-[10px] text-gray-400 font-mono">External Fragmentation (KB)</span>
            </div>

            {/* Chart Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar"
            >
                <svg
                    width={chartInnerWidth + chartPadding.right}
                    height={chartHeight}
                    className="min-w-full"
                >
                    {/* Grid lines */}
                    {yLabels.map((label, i) => {
                        const y = chartPadding.top +
                            (chartHeight - chartPadding.top - chartPadding.bottom) *
                            (1 - label / yMax);
                        return (
                            <g key={i}>
                                <line
                                    x1={chartPadding.left}
                                    y1={y}
                                    x2={chartInnerWidth}
                                    y2={y}
                                    stroke="rgba(0, 242, 255, 0.1)"
                                    strokeWidth="1"
                                />
                                <text
                                    x={chartPadding.left - 8}
                                    y={y + 4}
                                    textAnchor="end"
                                    className="text-[10px] font-mono"
                                    fill="#6b7280"
                                >
                                    {Math.round(label)}
                                </text>
                            </g>
                        );
                    })}

                    {/* Vertical grid lines and step labels */}
                    {points.map((point, i) => (
                        <g key={i}>
                            <line
                                x1={point.x}
                                y1={chartPadding.top}
                                x2={point.x}
                                y2={chartHeight - chartPadding.bottom}
                                stroke="rgba(0, 242, 255, 0.1)"
                                strokeWidth="1"
                                strokeDasharray="4,4"
                            />
                            <text
                                x={point.x}
                                y={chartHeight - chartPadding.bottom + 15}
                                textAnchor="middle"
                                className="text-[10px] font-mono"
                                fill="#6b7280"
                            >
                                Step {point.step}
                            </text>
                        </g>
                    ))}

                    {/* Line connecting points */}
                    {points.length > 1 && (
                        <motion.path
                            d={linePath}
                            fill="none"
                            stroke="#22d3ee"
                            strokeWidth="2"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.5 }}
                            style={{ filter: 'drop-shadow(0 0 3px rgba(34, 211, 238, 0.5))' }}
                        />
                    )}

                    {/* Data points */}
                    {points.map((point, i) => (
                        <g key={i} className="cursor-pointer">
                            <motion.circle
                                cx={point.x}
                                cy={point.y}
                                r="5"
                                fill="#22d3ee"
                                stroke="#0a0a12"
                                strokeWidth="2"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                style={{ filter: 'drop-shadow(0 0 4px rgba(34, 211, 238, 0.6))' }}
                            />
                            {/* Tooltip on hover */}
                            <title suppressHydrationWarning>{point.value} KB at Step {point.step}</title>
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    );
}

'use client';

import { useAllocationStore } from '@/store/allocationStore';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

export default function FragmentationChart() {
    const { statsHistory, totalMemory } = useAllocationStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
    }, [statsHistory]);

    const maxVal = totalMemory; // Max fragmentation is total memory (empty)

    return (
        <div className="flex flex-col h-full w-full bg-black/40 border border-cyan-900/30 rounded-lg p-2 relative overflow-hidden">
            <div className="text-[10px] text-gray-500 font-mono absolute top-2 left-2 z-10">
                EXT_FRAGMENTATION (KB)
            </div>

            <div
                ref={scrollRef}
                className="flex-1 flex items-end gap-1 overflow-x-auto custom-scrollbar pt-6 px-4"
            >
                {statsHistory.map((stat, i) => {
                    const heightPercent = (stat.externalFragmentation / maxVal) * 100;
                    // Color mapping: High fragmentation = Bad (Red), Low = Good (Green)
                    // But typically for "Free Space" high is good if empty, but here it's "Fragmentation" of holes?
                    // Actually `externalFragmentation` here is just "Total Free Space".
                    // Real external fragmentation is "Total Free Space" but scattered? 
                    // Legacy definition: "External Fragmentation" usually means total free space available.
                    // Let's visualize "Total Free Space" as the metric.

                    return (
                        <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercent}%` }}
                            className="w-2 bg-cyan-900/50 border-t border-cyan-400 relative group shrink-0 hover:bg-cyan-500 transition-colors"
                        >
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-black border border-white text-[9px] p-1 whitespace-nowrap z-50">
                                {stat.externalFragmentation} KB
                            </div>
                        </motion.div>
                    );
                })}
                <div className="w-4 shrink-0" /> {/* Spacer */}
            </div>

            {/* Baseline */}
            <div className="w-full h-px bg-cyan-900/50" />
        </div>
    );
}

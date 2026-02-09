'use client';

import { useSentinelStore } from '@/store/sentinelStore';
import { motion } from 'framer-motion';

export default function PulseMonitor() {
    const { history } = useSentinelStore();

    // Calculate max value for scaling
    const maxLeak = Math.max(...history.map(h => h.memoryLeaked), 100);

    // Generate SVG path
    let pathD = "";
    if (history.length > 1) {
        history.forEach((point, i) => {
            const x = (i / (history.length - 1)) * 100;
            const y = 100 - (point.memoryLeaked / maxLeak) * 100;
            pathD += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
        });
    }

    return (
        <div className="w-full h-full p-4 flex flex-col relative text-[10px] font-mono text-xs">
            {/* Grid Lines */}
            <div className="absolute inset-0 border border-red-900/30 bg-[linear-gradient(rgba(220,38,38,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />

            <div className="relative z-10 flex-1 flex items-end">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Area under curve */}
                    <path
                        d={`${pathD} L 100 100 L 0 100 Z`}
                        fill="rgba(239, 68, 68, 0.2)"
                        stroke="none"
                    />
                    {/* Line */}
                    <motion.path
                        d={pathD}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, ease: "linear" }}
                    />
                </svg>
            </div>

            <div className="absolute top-2 left-2 text-red-500 font-bold flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                LIVE LEAK METRICS
            </div>
            <div className="absolute bottom-2 right-2 text-gray-500">
                MAX: {maxLeak} KB
            </div>
        </div>
    );
}

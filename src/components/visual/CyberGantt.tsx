'use client';

import { useSystemStore } from '@/store/memoryStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect } from 'react';
import clsx from 'clsx';

export default function CyberGantt() {
    const { ganttHistory, globalClock, processQueue, activeProcessId } = useSystemStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to end
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
    }, [ganttHistory, globalClock]);

    return (
        <div className="flex flex-col h-full bg-black/40 rounded-lg overflow-hidden border border-cyan-900/50 relative">
            <div className="absolute top-2 left-2 text-[10px] text-cyan-500 font-mono tracking-widest z-10 bg-black/80 px-2 py-1 border border-cyan-900">
                CPU SCHEDULE_TIMELINE
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-x-auto flex items-center p-4 gap-1 custom-scrollbar relative"
                style={{ scrollBehavior: 'smooth' }}
            >
                {/* Render History Blocks */}
                <AnimatePresence>
                    {ganttHistory.map((block, i) => {
                        const process = processQueue.find(p => p.pid === block.pid) ||
                            useSystemStore.getState().completedProcesses.find(p => p.pid === block.pid);

                        const width = (block.endTime - block.startTime) * 20; // 20px per tick
                        const isActive = block.pid === activeProcessId && i === ganttHistory.length - 1; // Only vibrate current tip

                        return (
                            <motion.div
                                key={`${block.pid}-${block.startTime}`}
                                initial={{ opacity: 0, scaleX: 0 }}
                                animate={isActive ? {
                                    opacity: 1,
                                    scaleX: 1,
                                    x: [0, -1, 1, 0], // Vibration Effect
                                } : {
                                    opacity: 1,
                                    scaleX: 1
                                }}
                                transition={isActive ? {
                                    x: { repeat: Infinity, duration: 0.2 }
                                } : {}}
                                className={clsx(
                                    "h-12 rounded-sm border-l-2 border-white/20 relative group shrink-0 transition-opacity",
                                    isActive ? "brightness-125 saturate-150 z-10" : "opacity-80"
                                )}
                                style={{
                                    width: `${width}px`,
                                    backgroundColor: process?.color || '#333',
                                    boxShadow: isActive ? `0 0 15px ${process?.color}` : `0 0 5px ${process?.color}40`
                                }}
                            >
                                {width > 30 && (
                                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/80 mix-blend-difference truncate">
                                        P{block.pid}
                                    </div>
                                )}

                                {/* Hover Tooltip */}
                                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-black border border-cyan-500 p-2 text-xs z-20 whitespace-nowrap">
                                    PID: {block.pid} <br />
                                    Time: {block.startTime} - {block.endTime}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* Scan Line (The "Now" Indicator) */}
                <div className="h-full w-[2px] bg-red-500 shadow-[0_0_10px_#f00] absolute right-8 top-0 z-20 animate-pulse pointer-events-none" />

                {/* Placeholder for "Future" */}
                <div className="w-8 shrink-0" />
            </div>

            {/* Time Axis */}
            <div className="h-6 bg-cyan-950/30 border-t border-cyan-900/50 flex items-center overflow-hidden text-[10px] font-mono text-cyan-700 select-none">
                <div className="px-4">T = {globalClock}</div>
            </div>
        </div>
    );
}

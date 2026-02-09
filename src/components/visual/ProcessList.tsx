'use client';

import { useSystemStore, Process } from '@/store/memoryStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Maximize, Clock } from 'lucide-react';
import clsx from 'clsx';

export default function ProcessList() {
    const { processQueue, activeProcessId } = useSystemStore();

    const sortedQueue = [...processQueue].sort((a, b) => {
        // Running first, then Ready by arrival
        if (a.pid === activeProcessId) return -1;
        if (b.pid === activeProcessId) return 1;
        return a.arrivalTime - b.arrivalTime;
    });

    return (
        <div className="flex flex-col gap-2 h-full overflow-y-auto custom-scrollbar pr-2">
            <AnimatePresence>
                {sortedQueue.map((p) => {
                    const isActive = p.pid === activeProcessId;

                    return (
                        <motion.div
                            key={p.pid}
                            layoutId={`proc-${p.pid}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={clsx(
                                "relative p-3 rounded-md border text-xs font-mono transition-all",
                                isActive
                                    ? "bg-cyan-900/40 border-cyan-400 shadow-[0_0_10px_rgba(0,242,255,0.2)]"
                                    : "bg-gray-900/40 border-gray-800 hover:border-gray-600"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    className="absolute -left-1 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_#00f2ff]"
                                    layoutId="active-indicator"
                                />
                            )}

                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: p.color }}
                                    />
                                    <span className={isActive ? "text-cyan-300 font-bold" : "text-gray-400"}>
                                        PID {p.pid}
                                    </span>
                                </div>
                                <span className={clsx(
                                    "text-[10px] uppercase px-1 rounded",
                                    p.state === 'RUNNING' ? "bg-cyan-500 text-black font-bold" : "bg-gray-800 text-gray-500"
                                )}>
                                    {p.state}
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-cyan-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((p.burstTime - p.remainingTime) / p.burstTime) * 100}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>

                            <div className="flex justify-between mt-2 text-[10px] text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Maximize size={10} /> {p.size}B
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock size={10} /> {p.remainingTime}s / {p.burstTime}s
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {sortedQueue.length === 0 && (
                <div className="text-center text-gray-600 text-xs py-8 italic">
                    No Active Processes
                </div>
            )}
        </div>
    );
}

'use client';

import { useSystemStore } from '@/store/memoryStore';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function MemoryGrid() {
    const { ram, pageTable, activeProcessId, processQueue } = useSystemStore();

    // Find active process color
    const activeProcess = processQueue.find(p => p.pid === activeProcessId);

    return (
        <div className="perspective-1000 w-full h-full flex items-center justify-center p-4">
            <div
                className="grid grid-cols-4 gap-4 w-full max-w-2xl transform-style-3d rotate-x-12"
                style={{ transform: 'rotateX(20deg) scale(0.9)' }}
            >
                {ram.map((page, frameIdx) => {
                    const isOccupied = page !== null;
                    const entry = isOccupied ? pageTable[page!] : null;

                    // Live Link Logic
                    const isOwnedByActive = entry?.pid === activeProcessId && activeProcessId !== null;
                    const frameColor = isOwnedByActive && activeProcess ? activeProcess.color : '#8b5cf6';

                    // Dynamic glow based on last access OR Active Link
                    const isHot = (entry && (Date.now() - entry.lastAccessTime < 1000)) || isOwnedByActive;

                    return (
                        <div
                            key={frameIdx}
                            className={clsx(
                                "relative h-24 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-300",
                                isOccupied ? "bg-cyan-900/20" : "bg-gray-900/10",
                                isOwnedByActive ? "border-transparent" : (isHot ? "border-cyan-400" : (isOccupied ? "border-purple-500" : "border-gray-800"))
                            )}
                            style={{
                                boxShadow: isOwnedByActive
                                    ? `0 0 30px ${frameColor}, inset 0 0 20px ${frameColor}40`
                                    : (isHot ? '0 0 20px #00f2ff' : (isOccupied ? '0 0 10px #8b5cf6' : 'none')),
                                transform: isOwnedByActive ? 'scale(1.05) translateZ(20px)' : 'scale(1) translateZ(0px)',
                                borderColor: isOwnedByActive ? frameColor : undefined
                            }}
                        >
                            <span className="absolute top-1 left-2 text-[10px] text-gray-500 font-mono">
                                FRAME {frameIdx.toString(16).toUpperCase().padStart(2, '0')}
                            </span>

                            <AnimatePresence mode="wait">
                                {isOccupied ? (
                                    <motion.div
                                        key="occupied"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }} // Deallocation Pulse/Explosion
                                        transition={{ duration: 0.2 }}
                                        className="flex flex-col items-center"
                                    >
                                        <motion.div
                                            layoutId={`page-${page}`}
                                            className="text-2xl font-bold font-mono"
                                            style={{ color: isOwnedByActive ? frameColor : '#22d3ee' }}
                                        >
                                            P{page}
                                        </motion.div>
                                        <div className="flex gap-2 mt-1">
                                            {entry?.dirty && <span className="text-[10px] text-red-400">DIRTY</span>}
                                            {isOwnedByActive && <span className="text-[10px] text-white font-bold animate-pulse">ACTIVE</span>}
                                        </div>
                                        {entry?.pid && (
                                            <div className="absolute bottom-1 right-2 text-[10px] text-gray-400">
                                                PID: {entry.pid}
                                            </div>
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.span
                                        key="free"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-gray-700 text-xs"
                                    >
                                        FREE
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

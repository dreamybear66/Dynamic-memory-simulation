'use client';

import { usePagingStore } from '@/store/pagingStore';
import { motion } from 'framer-motion';
import clsx from 'clsx';

/**
 * PhysicalMemoryViewer - Visual representation of physical memory frames
 * Shows frame allocation, process ownership, and animations for page faults
 */
export default function PhysicalMemoryViewer() {
    const frames = usePagingStore(state => state.frames);
    const config = usePagingStore(state => state.config);
    const lastPageFault = usePagingStore(state => state.lastPageFault);
    const pageFaultActive = usePagingStore(state => state.pageFaultActive);

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                    Physical Memory ({config.numFrames} Frames)
                </h3>
                <div className="text-[10px] text-gray-500">
                    {config.physicalMemorySize / 1024}KB Total
                </div>
            </div>

            {/* Frame Grid */}
            <div className="grid gap-2 flex-1 overflow-y-auto pr-2"
                style={{
                    gridTemplateColumns: `repeat(auto-fill, minmax(80px, 1fr))`
                }}>
                {frames.map((frame, frameIndex) => {
                    const isOccupied = frame.pageNumber !== null;
                    const isRecentFault = lastPageFault &&
                        lastPageFault.replacedPage === frame.pageNumber &&
                        pageFaultActive;

                    return (
                        <motion.div
                            key={frameIndex}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                boxShadow: isRecentFault
                                    ? '0 0 20px rgba(239, 68, 68, 0.6)'
                                    : 'none'
                            }}
                            transition={{ delay: frameIndex * 0.02 }}
                            className={clsx(
                                "relative border-2 rounded p-2 transition-all duration-300",
                                "hover:scale-105 cursor-pointer group",
                                isOccupied
                                    ? "bg-green-500/10 border-green-500/50"
                                    : "bg-gray-800/30 border-gray-700/50",
                                isRecentFault && "animate-pulse"
                            )}
                        >
                            {/* Frame Number */}
                            <div className="text-[10px] text-gray-500 font-mono mb-1">
                                F{frameIndex}
                            </div>

                            {/* Content */}
                            {isOccupied ? (
                                <div className="space-y-1">
                                    <div className="text-sm font-bold text-green-400 font-mono">
                                        P{frame.pageNumber}
                                    </div>
                                    <div className="text-[9px] text-gray-400">
                                        PID: {frame.pid}
                                    </div>
                                    {frame.referenced && (
                                        <div className="text-[8px] text-cyan-400">
                                            ● REF
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-xs text-gray-600 font-mono">
                                    FREE
                                </div>
                            )}

                            {/* Hover Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                                opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                                bg-black border border-cyan-500 rounded px-2 py-1 text-[10px] 
                                whitespace-nowrap z-10">
                                {isOccupied ? (
                                    <>
                                        Frame {frameIndex} → Page {frame.pageNumber}<br />
                                        Process: {frame.pid}<br />
                                        Age: {Math.floor((Date.now() - frame.loadedAt) / 1000)}s
                                    </>
                                ) : (
                                    <>Frame {frameIndex}: Available</>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-3 pt-3 border-t border-gray-800 text-[10px]">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500/20 border border-green-500 rounded"></div>
                    <span className="text-gray-400">Allocated</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gray-800/30 border border-gray-700 rounded"></div>
                    <span className="text-gray-400">Free</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500/20 border border-red-500 rounded animate-pulse"></div>
                    <span className="text-gray-400">Page Fault</span>
                </div>
            </div>
        </div>
    );
}

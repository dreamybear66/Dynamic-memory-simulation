'use client';

import { useAllocationStore, MemoryBlock } from '@/store/allocationStore';
import { useSentinelStore } from '@/store/sentinelStore';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function LeakGrid() {
    const { memoryBlocks, totalMemory } = useAllocationStore();
    const { leaks, status } = useSentinelStore();

    // Determine grid size based on totalMemory (e.g., 10KB per cell)
    const cellSize = 10;
    const totalCells = Math.ceil(totalMemory / cellSize);

    // Map blocks to cells
    const cells = Array.from({ length: totalCells }, (_, i) => {
        const addr = i * cellSize;
        // Find which block covers this address
        const block = memoryBlocks.find(b => addr >= b.start && addr < (b.start + b.size));
        return { index: i, addr, block };
    });

    const isScanning = status === 'SCANNING';

    return (
        <div className="w-full h-full p-4 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-12 gap-1 auto-rows-fr">
                {cells.map((cell) => {
                    const block = cell.block;
                    if (!block) return <div key={cell.index} className="bg-gray-900/20" />; // Should not happen if memory is contiguous

                    const isHole = block.type === 'HOLE';
                    const isLeaked = leaks.some(l => l.blockId === block.id);

                    // Glitch animation for leaks
                    const glitchVariants = {
                        stable: { opacity: 1, x: 0 },
                        glitch: {
                            opacity: [1, 0.5, 1, 0.8, 1],
                            x: [0, -2, 2, -1, 0],
                            backgroundColor: ['#ef4444', '#b91c1c', '#ef4444'], // Red pulses
                            transition: {
                                duration: 0.2,
                                repeat: Infinity,
                                repeatType: "mirror" as const
                            }
                        }
                    };

                    return (
                        <motion.div
                            key={`${cell.index}-${block.id}`}
                            variants={glitchVariants}
                            animate={isLeaked ? 'glitch' : 'stable'}
                            className={clsx(
                                "aspect-square rounded-[2px] relative group overflow-hidden transition-all duration-300",
                                isLeaked ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)] border border-red-400 z-10" :
                                    isHole ? "bg-gray-900/30 border border-gray-800" :
                                        "bg-emerald-500/20 border border-emerald-500/50"
                            )}
                        >
                            {/* Scanning Ray */}
                            {isScanning && (
                                <motion.div
                                    className="absolute inset-0 bg-white/20"
                                    initial={{ x: '-100%' }}
                                    animate={{ x: '100%' }}
                                    transition={{ duration: 1.5, delay: cell.index * 0.005, repeat: Infinity }}
                                />
                            )}

                            {/* Tooltip on Hover */}
                            <div className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black/80 flex items-center justify-center pointer-events-none z-20">
                                <span className={clsx(
                                    "text-[8px] font-mono",
                                    isLeaked ? "text-red-500 font-bold" : "text-gray-400"
                                )}>
                                    {isLeaked ? 'LEAK!' : isHole ? '' : `PID ${block.pid}`}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

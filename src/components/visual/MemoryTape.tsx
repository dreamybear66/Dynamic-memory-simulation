'use client';

import { useAllocationStore, MemoryBlock } from '@/store/allocationStore';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useRef, useEffect } from 'react';

export default function MemoryTape() {
    const { memoryBlocks, totalMemory } = useAllocationStore();

    return (
        <div className="w-full h-full flex flex-col gap-2 p-4 bg-black/40 border-2 border-dashed border-gray-800 rounded-lg overflow-hidden relative">
            <div className="flex-1 w-full bg-gray-900/50 rounded flex relative overflow-hidden">
                <AnimatePresence>
                    {memoryBlocks.map((block) => (
                        <BlockVisual key={block.id} block={block} total={totalMemory} />
                    ))}
                </AnimatePresence>
            </div>

            {/* Scale / Ruler */}
            <div className="h-6 w-full flex justify-between text-[10px] text-gray-500 font-mono items-center px-1 border-t border-gray-800">
                <span>0 KB</span>
                <span>{(totalMemory / 2).toFixed(0)} KB</span>
                <span>{totalMemory} KB</span>
            </div>
        </div>
    );
}

function BlockVisual({ block, total }: { block: MemoryBlock, total: number }) {
    const widthPercent = (block.size / total) * 100;
    const isHole = block.type === 'HOLE';

    return (
        <motion.div
            layout // Helper for smooth resizing/shifting
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            className={clsx(
                "h-full flex flex-col items-center justify-center relative group isolate border-r border-black/50 overflow-hidden transition-colors",
                isHole
                    ? "text-gray-400"
                    : "bg-opacity-80 backdrop-blur-sm"
            )}
            style={{
                width: `${widthPercent}%`,
                backgroundColor: !isHole ? block.color || '#3b82f6' : '#1f2937',
                boxShadow: !isHole ? `inset 0 0 10px rgba(0,0,0,0.5)` : 'inset 0 0 20px rgba(0,0,0,0.8)',
                backgroundImage: isHole
                    ? 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(55, 65, 81, 0.5) 5px, rgba(55, 65, 81, 0.5) 10px)'
                    : 'none'
            }}
        >
            {/* Label (Show if width > 3%) */}
            {widthPercent > 3 && (
                <div className="text-[10px] font-mono font-bold text-center z-10 mix-blend-difference text-white/80 pointer-events-none whitespace-nowrap overflow-hidden text-ellipsis px-1">
                    {isHole ? 'HOLE' : `P${block.pid}`}
                    <div className="text-[9px] opacity-70">{block.size}KB</div>
                </div>
            )}

            {/* Tooltip */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full pb-2 hidden group-hover:block z-50">
                <div className="bg-black border border-cyan-500 text-xs p-2 rounded whitespace-nowrap shadow-lg">
                    <div className="font-bold text-cyan-400">{isHole ? 'FREE SPACE' : `PROCESS ${block.pid}`}</div>
                    <div>Start: {block.start}</div>
                    <div>Size: {block.size} KB</div>
                    {!isHole && <div>Allocated via: [Algo]</div>}
                </div>
            </div>
        </motion.div>
    );
}

'use client';

import { usePagingStore } from '@/store/pagingStore';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { Zap, ZapOff } from 'lucide-react';

/**
 * TLBPanel - Translation Lookaside Buffer visualization
 * Shows TLB entries, hit/miss indicators, and replacement animations
 */
export default function TLBPanel() {
    const tlb = usePagingStore(state => state.tlb);
    const config = usePagingStore(state => state.config);
    const stats = usePagingStore(state => state.stats);
    const tlbPolicy = usePagingStore(state => state.tlbPolicy);
    const currentTranslation = usePagingStore(state => state.currentTranslation);

    // Check if current translation had TLB hit
    const hadTLBHit = currentTranslation.result?.tlbHit ?? false;
    const currentPage = currentTranslation.logicalAddress !== null
        ? currentTranslation.logicalAddress >> config.offsetBits
        : null;

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                        TLB
                    </h3>
                    <span className="text-[9px] text-gray-500">
                        ({tlbPolicy})
                    </span>
                </div>
                <div className="flex items-center gap-3 text-[10px]">
                    <div className="flex items-center gap-1">
                        <Zap size={12} className="text-green-400" />
                        <span className="text-gray-400">Hits:</span>
                        <span className="text-green-400 font-mono font-bold">{stats.tlbHits}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <ZapOff size={12} className="text-red-400" />
                        <span className="text-gray-400">Misses:</span>
                        <span className="text-red-400 font-mono font-bold">{stats.tlbMisses}</span>
                    </div>
                </div>
            </div>

            {/* Hit Rate Bar */}
            <div className="mb-3">
                <div className="flex justify-between text-[9px] mb-1">
                    <span className="text-gray-500">Hit Rate</span>
                    <span className={clsx(
                        "font-mono font-bold",
                        stats.tlbHitRate >= 70 ? "text-green-400" :
                            stats.tlbHitRate >= 40 ? "text-yellow-400" : "text-red-400"
                    )}>
                        {stats.tlbHitRate.toFixed(1)}%
                    </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                        className={clsx(
                            "h-full rounded-full",
                            stats.tlbHitRate >= 70 ? "bg-green-500" :
                                stats.tlbHitRate >= 40 ? "bg-yellow-500" : "bg-red-500"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.tlbHitRate}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* TLB Entries */}
            <div className="flex-1 space-y-2 overflow-y-auto pr-2">
                <AnimatePresence mode="popLayout">
                    {tlb.map((entry, index) => {
                        const isActive = entry.pageNumber === currentPage;

                        return (
                            <motion.div
                                key={`${entry.pageNumber}-${entry.insertionOrder}`}
                                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                                animate={{
                                    opacity: 1,
                                    x: 0,
                                    scale: 1,
                                    boxShadow: isActive && hadTLBHit
                                        ? '0 0 15px rgba(34, 211, 238, 0.5)'
                                        : 'none'
                                }}
                                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className={clsx(
                                    "border-2 rounded p-2 transition-all",
                                    isActive && hadTLBHit
                                        ? "bg-cyan-500/20 border-cyan-500"
                                        : "bg-gray-800/30 border-gray-700"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {/* Entry Index */}
                                        <div className="text-[9px] text-gray-500 font-mono w-8">
                                            [{index}]
                                        </div>

                                        {/* Page → Frame */}
                                        <div className="flex items-center gap-2 text-xs font-mono">
                                            <span className="text-cyan-400 font-bold">
                                                P{entry.pageNumber}
                                            </span>
                                            <span className="text-gray-600">→</span>
                                            <span className="text-green-400 font-bold">
                                                F{entry.frameNumber}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Age indicator */}
                                    {tlbPolicy === 'LRU' && (
                                        <div className="text-[9px] text-gray-500">
                                            {Math.floor((Date.now() - entry.lastAccessTime) / 1000)}s
                                        </div>
                                    )}
                                    {tlbPolicy === 'FIFO' && (
                                        <div className="text-[9px] text-gray-500">
                                            #{entry.insertionOrder}
                                        </div>
                                    )}
                                </div>

                                {/* Hit indicator animation */}
                                {isActive && hadTLBHit && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-1 text-[9px] text-cyan-400 font-bold flex items-center gap-1"
                                    >
                                        <Zap size={10} className="animate-pulse" />
                                        TLB HIT!
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* Empty State */}
                {tlb.length === 0 && (
                    <div className="text-center py-8 text-gray-600 text-xs">
                        TLB is empty<br />
                        <span className="text-[10px]">Access memory to populate</span>
                    </div>
                )}

                {/* Capacity Indicator */}
                {tlb.length > 0 && (
                    <div className="text-[9px] text-gray-500 text-center pt-2 border-t border-gray-800">
                        {tlb.length} / {config.tlbSize} entries
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

import { usePagingStore } from '@/store/pagingStore';
import { motion } from 'framer-motion';
import { Activity, Zap, AlertTriangle, TrendingUp } from 'lucide-react';
import clsx from 'clsx';

/**
 * PagingStatsDashboard - Comprehensive statistics and metrics display
 * Shows real-time counters, hit rates, and performance metrics
 */
export default function PagingStatsDashboard() {
    const stats = usePagingStore(state => state.stats);
    const config = usePagingStore(state => state.config);
    const frames = usePagingStore(state => state.frames);

    // Calculate memory utilization
    const usedFrames = frames.filter(f => f.pageNumber !== null).length;
    const memoryUtilization = (usedFrames / config.numFrames) * 100;

    // Get recent page fault trend (last 10 accesses)
    const recentFaults = stats.pageFaultHistory.slice(-10);
    const recentFaultRate = recentFaults.length > 0
        ? (recentFaults.filter(f => f === 1).length / recentFaults.length) * 100
        : 0;

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-3">
                Performance Statistics
            </h3>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {/* Main Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Total Accesses */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-900/50 border border-gray-700 rounded p-3"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Activity size={14} className="text-cyan-400" />
                            <span className="text-[10px] text-gray-400">TOTAL ACCESSES</span>
                        </div>
                        <div className="text-2xl font-mono font-bold text-white">
                            {stats.totalAccesses}
                        </div>
                    </motion.div>

                    {/* Page Faults */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="bg-gray-900/50 border border-red-900/50 rounded p-3"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle size={14} className="text-red-400" />
                            <span className="text-[10px] text-gray-400">PAGE FAULTS</span>
                        </div>
                        <div className="text-2xl font-mono font-bold text-red-400">
                            {stats.pageFaults}
                        </div>
                    </motion.div>

                    {/* TLB Hits */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-900/50 border border-green-900/50 rounded p-3"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Zap size={14} className="text-green-400" />
                            <span className="text-[10px] text-gray-400">TLB HITS</span>
                        </div>
                        <div className="text-2xl font-mono font-bold text-green-400">
                            {stats.tlbHits}
                        </div>
                    </motion.div>

                    {/* TLB Misses */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-gray-900/50 border border-yellow-900/50 rounded p-3"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Zap size={14} className="text-yellow-400" />
                            <span className="text-[10px] text-gray-400">TLB MISSES</span>
                        </div>
                        <div className="text-2xl font-mono font-bold text-yellow-400">
                            {stats.tlbMisses}
                        </div>
                    </motion.div>
                </div>

                {/* Hit Rates */}
                <div className="space-y-3">
                    {/* TLB Hit Rate */}
                    <div className="bg-gray-900/50 border border-gray-700 rounded p-3">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] text-gray-400">TLB HIT RATE</span>
                            <span className={clsx(
                                "text-sm font-mono font-bold",
                                stats.tlbHitRate >= 70 ? "text-green-400" :
                                    stats.tlbHitRate >= 40 ? "text-yellow-400" : "text-red-400"
                            )}>
                                {stats.tlbHitRate.toFixed(1)}%
                            </span>
                        </div>
                        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
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

                    {/* Page Fault Rate */}
                    <div className="bg-gray-900/50 border border-gray-700 rounded p-3">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] text-gray-400">PAGE FAULT RATE</span>
                            <span className={clsx(
                                "text-sm font-mono font-bold",
                                stats.pageFaultRate <= 10 ? "text-green-400" :
                                    stats.pageFaultRate <= 30 ? "text-yellow-400" : "text-red-400"
                            )}>
                                {stats.pageFaultRate.toFixed(1)}%
                            </span>
                        </div>
                        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                                className={clsx(
                                    "h-full rounded-full",
                                    stats.pageFaultRate <= 10 ? "bg-green-500" :
                                        stats.pageFaultRate <= 30 ? "bg-yellow-500" : "bg-red-500"
                                )}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(stats.pageFaultRate, 100)}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>

                    {/* Memory Utilization */}
                    <div className="bg-gray-900/50 border border-gray-700 rounded p-3">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] text-gray-400">MEMORY UTILIZATION</span>
                            <span className="text-sm font-mono font-bold text-purple-400">
                                {memoryUtilization.toFixed(1)}%
                            </span>
                        </div>
                        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full rounded-full bg-purple-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${memoryUtilization}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                        <div className="flex justify-between text-[9px] text-gray-500 mt-1">
                            <span>{usedFrames} / {config.numFrames} frames</span>
                            <span>{(usedFrames * config.pageSize / 1024).toFixed(1)}KB used</span>
                        </div>
                    </div>
                </div>

                {/* Mini Chart - Recent Page Faults */}
                {stats.pageFaultHistory.length > 0 && (
                    <div className="bg-gray-900/50 border border-gray-700 rounded p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp size={14} className="text-cyan-400" />
                            <span className="text-[10px] text-gray-400">RECENT PAGE FAULTS</span>
                        </div>
                        <div className="flex items-end gap-0.5 h-16">
                            {stats.pageFaultHistory.slice(-20).map((fault, index) => (
                                <div
                                    key={index}
                                    className={clsx(
                                        "flex-1 rounded-t transition-all",
                                        fault === 1 ? "bg-red-500" : "bg-gray-700"
                                    )}
                                    style={{
                                        height: fault === 1 ? '100%' : '20%'
                                    }}
                                />
                            ))}
                        </div>
                        <div className="text-[9px] text-gray-500 mt-1 text-center">
                            Last 20 accesses
                        </div>
                    </div>
                )}

                {/* Performance Summary */}
                <div className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border border-cyan-900/50 rounded p-3">
                    <div className="text-[10px] text-cyan-400 mb-2">PERFORMANCE SUMMARY</div>
                    <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Effective Access Time:</span>
                            <span className="text-white font-mono">
                                {/* Simplified EAT calculation */}
                                {(stats.tlbHitRate * 0.01 + (100 - stats.tlbHitRate) * 0.15).toFixed(2)} ns
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Recent Fault Rate:</span>
                            <span className={clsx(
                                "font-mono",
                                recentFaultRate <= 10 ? "text-green-400" :
                                    recentFaultRate <= 30 ? "text-yellow-400" : "text-red-400"
                            )}>
                                {recentFaultRate.toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">System Efficiency:</span>
                            <span className={clsx(
                                "font-mono",
                                stats.tlbHitRate >= 70 && stats.pageFaultRate <= 20 ? "text-green-400" :
                                    stats.tlbHitRate >= 40 && stats.pageFaultRate <= 40 ? "text-yellow-400" : "text-red-400"
                            )}>
                                {stats.tlbHitRate >= 70 && stats.pageFaultRate <= 20 ? 'EXCELLENT' :
                                    stats.tlbHitRate >= 40 && stats.pageFaultRate <= 40 ? 'GOOD' : 'POOR'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

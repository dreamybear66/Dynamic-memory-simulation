'use client';

import { motion } from 'framer-motion';

export default function FragmentationComparison() {
    return (
        <div className="w-full bg-black/40 border border-cyan-900/30 rounded-lg p-6">
            <h3 className="text-cyan-400 font-bold text-sm mb-6 text-center">
                Memory Fragmentation Types
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* External Fragmentation */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]" />
                        <h4 className="text-red-400 font-bold text-xs">EXTERNAL FRAGMENTATION</h4>
                    </div>

                    <div className="space-y-2">
                        <div className="flex gap-1 h-16">
                            <div className="flex items-center justify-center text-[9px] font-mono text-white bg-cyan-500 border border-cyan-400"
                                style={{ width: '25%' }}>
                                P1<br />100KB
                            </div>
                            <div className="flex items-center justify-center text-[9px] font-mono text-gray-400 bg-black border-2 border-dashed border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                                style={{ width: '12%' }}>
                                50KB
                            </div>
                            <div className="flex items-center justify-center text-[9px] font-mono text-white bg-purple-500 border border-purple-400"
                                style={{ width: '30%' }}>
                                P2<br />200KB
                            </div>
                            <div className="flex items-center justify-center text-[9px] font-mono text-gray-400 bg-black border-2 border-dashed border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                                style={{ width: '8%' }}>
                                30KB
                            </div>
                            <div className="flex items-center justify-center text-[9px] font-mono text-white bg-pink-500 border border-pink-400"
                                style={{ width: '25%' }}>
                                P3<br />150KB
                            </div>
                        </div>

                        <div className="p-3 bg-red-900/20 border border-red-500/50 rounded">
                            <p className="text-xs text-red-300 mb-1 font-bold">⚠️ Problem:</p>
                            <p className="text-xs text-gray-300">
                                Total Free: <span className="text-red-400 font-mono">80KB</span> (50+30) scattered
                            </p>
                            <p className="text-xs text-red-400 mt-1">
                                ✗ Cannot allocate 70KB process despite having enough total free space!
                            </p>
                        </div>
                    </div>

                    <div className="text-[10px] text-gray-400 space-y-1">
                        <p>• Free memory exists but scattered in small non-contiguous blocks</p>
                        <p>• Allocation fails even with sufficient total free memory</p>
                        <p className="text-cyan-400">→ Solution: Compaction or Paging</p>
                    </div>
                </motion.div>

                {/* Internal Fragmentation */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.6)]" />
                        <h4 className="text-orange-400 font-bold text-xs">INTERNAL FRAGMENTATION</h4>
                    </div>

                    <div className="space-y-2">
                        <div className="flex gap-1 h-16">
                            <div className="flex flex-col border border-cyan-400" style={{ width: '35%' }}>
                                <div className="flex-1 flex items-center justify-center text-[9px] font-mono text-white bg-cyan-500">
                                    P1: 90KB
                                </div>
                                <div className="h-3 flex items-center justify-center text-[8px] font-mono text-gray-500 bg-gray-700 border-t-2 border-orange-500 shadow-[inset_0_0_10px_rgba(249,115,22,0.3)]">
                                    10KB wasted
                                </div>
                            </div>
                            <div className="flex flex-col border border-purple-400" style={{ width: '45%' }}>
                                <div className="flex-1 flex items-center justify-center text-[9px] font-mono text-white bg-purple-500">
                                    P2: 180KB
                                </div>
                                <div className="h-3 flex items-center justify-center text-[8px] font-mono text-gray-500 bg-gray-700 border-t-2 border-orange-500 shadow-[inset_0_0_10px_rgba(249,115,22,0.3)]">
                                    20KB wasted
                                </div>
                            </div>
                            <div className="flex flex-col border border-pink-400" style={{ width: '20%' }}>
                                <div className="flex-1 flex items-center justify-center text-[9px] font-mono text-white bg-pink-500">
                                    P3: 80KB
                                </div>
                                <div className="h-3 flex items-center justify-center text-[8px] font-mono text-gray-500 bg-gray-700 border-t-2 border-orange-500 shadow-[inset_0_0_10px_rgba(249,115,22,0.3)]">
                                    5KB
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-orange-900/20 border border-orange-500/50 rounded">
                            <p className="text-xs text-orange-300 mb-1 font-bold">⚠️ Problem:</p>
                            <p className="text-xs text-gray-300">
                                Allocated more than needed
                            </p>
                            <p className="text-xs text-orange-400 mt-1">
                                Total Wasted: <span className="font-mono">35KB</span> inside allocated blocks
                            </p>
                        </div>
                    </div>

                    <div className="text-[10px] text-gray-400 space-y-1">
                        <p>• Memory allocated exceeds process requirements</p>
                        <p>• Wasted space trapped within allocated blocks</p>
                        <p className="text-cyan-400">→ Common with fixed partitioning & paging</p>
                    </div>
                </motion.div>
            </div>

            {/* Comparison Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 p-4 bg-cyan-900/10 border border-cyan-500/30 rounded"
            >
                <h5 className="text-cyan-400 text-xs font-bold mb-2">Key Difference:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px]">
                    <div>
                        <span className="text-red-400 font-bold">External:</span>
                        <span className="text-gray-300"> Free space scattered <span className="italic">between</span> allocated blocks</span>
                    </div>
                    <div>
                        <span className="text-orange-400 font-bold">Internal:</span>
                        <span className="text-gray-300"> Wasted space <span className="italic">within</span> allocated blocks</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

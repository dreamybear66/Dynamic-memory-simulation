'use client';

import { useAllocationStore, AllocationAlgo, ComparisonResult } from '@/store/allocationStore';
import { useState } from 'react';
import TerminalWindow from '../visual/TerminalWindow';
import { Plus, Trash2, RefreshCw, BarChart } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function AllocationControls() {
    const {
        algorithm,
        setAlgorithm,
        allocate,
        deallocate,
        compact,
        reset,
        memoryBlocks,
        compareAlgorithms
    } = useAllocationStore();

    const [pid, setPid] = useState(1);
    const [size, setSize] = useState(100);
    const [deallocPid, setDeallocPid] = useState('');
    const [compareResults, setCompareResults] = useState<ComparisonResult[] | null>(null);

    const handleAllocate = () => {
        const success = allocate(pid, size, '#3b82f6');
        if (success) {
            setPid(c => c + 1);
            setCompareResults(null); // Clear comparison on new action
        }
    };

    const handleCompare = () => {
        const results = compareAlgorithms(size);
        setCompareResults(results);
    };

    const handleRandomAlloc = () => {
        reset();

        // Create initial contiguous blocks
        const samples = [
            { pid: 1001, size: 100, color: '#3b82f6' }, // Blue
            { pid: 1002, size: 60, color: '#ef4444' }, // To be deleted (Hole)
            { pid: 1003, size: 200, color: '#10b981' }, // Green
            { pid: 1004, size: 80, color: '#ef4444' }, // To be deleted (Hole)
            { pid: 1005, size: 150, color: '#eab308' }, // Yellow
            { pid: 1006, size: 120, color: '#ef4444' }, // To be deleted (Hole)
            { pid: 1007, size: 180, color: '#8b5cf6' }, // Purple
        ];

        // Allocate all
        samples.forEach(s => allocate(s.pid, s.size, s.color));

        // Create holes by removing specific PIDs
        [1002, 1004, 1006].forEach(pid => deallocate(pid));
    };

    const activeProcesses = memoryBlocks.filter(b => b.type === 'PROCESS');

    return (
        <div className="flex flex-col gap-4">
            <TerminalWindow title="ALLOCATION_ENGINE" className="shrink-0">
                <div className="flex flex-col gap-4">
                    {/* Algorithm Switcher */}
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-500">ALGORITHM</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['FIRST_FIT', 'BEST_FIT', 'WORST_FIT', 'NEXT_FIT'].map((algo) => (
                                <button
                                    key={algo}
                                    onClick={() => setAlgorithm(algo as AllocationAlgo)}
                                    className={clsx(
                                        "px-2 py-1 text-[10px] font-bold border transition-colors",
                                        algorithm === algo
                                            ? "bg-cyan-500 text-black border-cyan-500"
                                            : "bg-black/30 border-gray-700 text-gray-400 hover:border-cyan-500 hover:text-cyan-400"
                                    )}
                                >
                                    {algo.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-gray-800" />

                    {/* Allocation Form */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500">PROCESS ID</label>
                            <input
                                type="number"
                                value={isNaN(pid) ? '' : pid}
                                onChange={(e) => setPid(e.target.value === '' ? parseInt('0') : parseInt(e.target.value))}
                                className="w-full bg-black/50 border border-gray-700 p-1 text-xs text-cyan-400"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500">SIZE (KB)</label>
                            <input
                                type="number"
                                value={isNaN(size) ? '' : size}
                                onChange={(e) => setSize(e.target.value === '' ? parseInt('0') : parseInt(e.target.value))}
                                className="w-full bg-black/50 border border-gray-700 p-1 text-xs text-cyan-400"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={handleAllocate}
                                className="py-2 bg-cyan-900/30 border border-cyan-500 text-cyan-400 text-xs font-bold hover:bg-cyan-500 hover:text-black transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus size={14} /> ALLOCATE
                            </button>
                            <button
                                onClick={handleCompare}
                                className="py-2 bg-yellow-900/30 border border-yellow-500 text-yellow-400 text-xs font-bold hover:bg-yellow-500 hover:text-black transition-colors flex items-center justify-center gap-2"
                            >
                                <BarChart size={14} /> COMPARE
                            </button>
                        </div>
                        <button
                            onClick={handleRandomAlloc}
                            className="w-full py-2 bg-emerald-900/30 border border-emerald-500 text-emerald-400 text-xs font-bold hover:bg-emerald-500 hover:text-black transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={14} /> ALLOCATE SAMPLE MEMORY
                        </button>
                    </div>

                    {/* Comparison Results */}
                    <AnimatePresence>
                        {compareResults && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-black/50 border border-yellow-500/50 p-2 rounded text-[10px] space-y-1">
                                    <div className="text-yellow-400 font-bold mb-1">ALGORITHM EFFICIENCY ({size}KB)</div>
                                    {compareResults.map(res => (
                                        <div key={res.algorithm} className="flex justify-between items-center text-gray-400">
                                            <span>{res.algorithm.replace('_', ' ')}</span>
                                            {res.success ? (
                                                <span className={clsx(
                                                    res.efficiency > 0.9 ? "text-green-400" : "text-yellow-400"
                                                )}>
                                                    {(res.efficiency * 100).toFixed(0)}% Eff.
                                                </span>
                                            ) : (
                                                <span className="text-red-500">FAIL</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="h-px bg-gray-800" />

                    {/* Compaction */}
                    <button
                        onClick={compact}
                        className="w-full py-2 bg-purple-900/30 border border-purple-500 text-purple-400 text-xs font-bold hover:bg-purple-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={14} /> COMPACT MEMORY
                    </button>

                    <button
                        onClick={reset}
                        className="w-full py-2 text-red-500 text-[10px] hover:bg-red-900/20"
                    >
                        RESET SYSTEM
                    </button>
                </div>
            </TerminalWindow>

            {/* Deallocation List */}
            <TerminalWindow title="ACTIVE BLOCK TABLE" className="min-h-[400px]" status="active">
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {activeProcesses.length === 0 ? (
                            <div className="text-gray-600 text-[10px] italic text-center mt-4">No Active Processes</div>
                        ) : (
                            activeProcesses.map(block => (
                                <div key={block.id} className="flex items-center justify-between bg-gray-900/50 p-2 rounded hover:bg-gray-800 border border-gray-800 hover:border-cyan-900 transition-colors group">
                                    <div className="text-xs">
                                        <div className="font-bold text-cyan-400">PID {block.pid}</div>
                                        <div className="text-[10px] text-gray-500">Size: {block.size}KB | Start: {block.start}</div>
                                    </div>
                                    <button
                                        onClick={() => deallocate(block.pid!)}
                                        className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-900/30 rounded transition-opacity"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </TerminalWindow>
        </div>
    );
}

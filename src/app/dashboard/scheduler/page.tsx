'use client';

import { useState, useEffect } from 'react';
import { useSystemStore, SchedulerAlgo } from '@/store/memoryStore';
import CyberGantt from '@/components/visual/CyberGantt';
import ProcessList from '@/components/visual/ProcessList';
import TerminalWindow from '@/components/visual/TerminalWindow';
import ProcessControlCenter from '@/components/controls/ProcessControlCenter';
import SevenSegment from '@/components/ui/SevenSegment';
import { Camera, RefreshCw, BarChart3, ArrowRightLeft } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function SchedulerPage() {
    const [mounted, setMounted] = useState(false);
    const {
        globalClock,
        completedProcesses,
        schedulerConfig,
        setSchedulerAlgo,
        takeSnapshot,
        snapshots,
        tick,
        resetSystem
    } = useSystemStore();

    const [compareSnapshotId, setCompareSnapshotId] = useState<string | null>(null);

    useEffect(() => setMounted(true), []);

    // Tick Loop (if not reusing layout context loop? Check layout... Layout doesn't have loop. 
    // The previous page had the loop. We need the loop here too or move it to a global provider.
    // Ideally user wants simulation running. Let's add the loop here for now.)

    useEffect(() => {
        if (!schedulerConfig.isPaused) {
            const interval = setInterval(tick, 1000 / schedulerConfig.speed);
            return () => clearInterval(interval);
        }
    }, [schedulerConfig.isPaused, schedulerConfig.speed, tick]);


    if (!mounted) return null;

    // Calc Current Metrics
    const avgWait = completedProcesses.length > 0
        ? (completedProcesses.reduce((acc, p) => acc + p.waitingTime, 0) / completedProcesses.length).toFixed(1)
        : '0.0';
    const avgTurnaround = completedProcesses.length > 0
        ? (completedProcesses.reduce((acc, p) => acc + p.turnaroundTime, 0) / completedProcesses.length).toFixed(1)
        : '0.0';
    const throughput = completedProcesses.length > 0
        ? (completedProcesses.length / (globalClock / 10 || 1)).toFixed(2) // Mock scale
        : '0.00';

    const compareSnapshot = snapshots.find(s => s.id === compareSnapshotId);

    return (
        <div className="flex flex-col min-h-full gap-4">
            <header className="border-b border-cyan-900/50 pb-2 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black tracking-tighter text-cyan-400">
                        TEMPORAL FLUX ANALYZER
                    </h1>
                    <div className="text-[10px] text-gray-500 font-mono">
                        SYNC_MODE: ACTIVE // CLK: {globalClock}
                    </div>
                </div>

                {/* Algo Switcher Header */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-black/40 border border-cyan-900 rounded-md p-1">
                        {['FCFS', 'RR', 'PRIORITY'].map((algo) => (
                            <button
                                key={algo}
                                onClick={() => setSchedulerAlgo(algo as SchedulerAlgo)}
                                className={clsx(
                                    "px-3 py-1 text-[10px] font-bold rounded transition-all",
                                    schedulerConfig.algorithm === algo
                                        ? "bg-cyan-500 text-black"
                                        : "text-gray-500 hover:text-cyan-400"
                                )}
                            >
                                {algo}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={resetSystem}
                        className="p-2 text-red-500 hover:bg-red-900/20 rounded border border-red-900/50"
                        title="RESET SYSTEM"
                    >
                        <RefreshCw size={14} />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-12 gap-4">
                {/* Left: Controls & List */}
                <div className="col-span-3 flex flex-col gap-4">
                    <div className="flex-[2] min-h-0">
                        <ProcessList />
                    </div>
                    <div className="min-h-[250px]">
                        <ProcessControlCenter />
                    </div>
                </div>

                {/* Middle: Gantt & Analysis */}
                <div className="col-span-9 flex flex-col gap-4">

                    {/* Gantt Area */}
                    <div className="min-h-[300px] relative group">
                        <CyberGantt />
                        {/* Pulse Overlay Trigger Hint */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-cyan-600 font-mono pointer-events-none">
                            :: LIVE VIBRATION FEED ACTIVE ::
                        </div>
                    </div>

                    {/* Metrics & Compare */}
                    <div className="grid grid-cols-2 gap-4 min-h-[150px]">
                        {/* Current Metrics */}
                        <TerminalWindow title="LIVE METRICS" className="h-full" status="active">
                            <div className="grid grid-cols-3 gap-4 h-full items-center p-2">
                                <SevenSegment value={avgWait} label="AVG WAIT (s)" />
                                <SevenSegment value={avgTurnaround} label="TURNAROUND (s)" />
                                <SevenSegment value={throughput} label="THROUGHPUT" size="sm" color="text-green-400" />
                            </div>
                        </TerminalWindow>

                        {/* Snapshot Compare */}
                        <TerminalWindow title="ALGORITHM SNAPSHOTS" className="h-full">
                            <div className="flex flex-col h-full gap-2 relative">

                                <div className="flex justify-between items-center mb-2">
                                    <select
                                        className="bg-black/50 border border-gray-700 text-[10px] text-gray-300 p-1 w-32"
                                        onChange={(e) => setCompareSnapshotId(e.target.value)}
                                        value={compareSnapshotId || ''}
                                    >
                                        <option value="">-- COMPARE --</option>
                                        {snapshots.map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.algorithm} @ T={s.timestamp}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={takeSnapshot}
                                        className="flex items-center gap-2 px-3 py-1 bg-cyan-900/30 border border-cyan-500 text-cyan-400 text-[10px] hover:bg-cyan-500 hover:text-black transition-colors"
                                    >
                                        <Camera size={12} /> SNAPSHOT
                                    </button>
                                </div>

                                <AnimatePresence mode="wait">
                                    {compareSnapshot ? (
                                        <motion.div
                                            key="stats"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="grid grid-cols-2 gap-2 text-xs font-mono h-full"
                                        >
                                            <div className="space-y-2 p-2 bg-gray-900/30 border border-gray-800 rounded">
                                                <div className="text-gray-500 border-b border-gray-800 pb-1">CURRENT ({schedulerConfig.algorithm})</div>
                                                <div className="flex justify-between">
                                                    <span>A.Wait:</span> <span className="text-cyan-400">{avgWait}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>A.Turn:</span> <span className="text-purple-400">{avgTurnaround}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2 p-2 bg-gray-900/30 border border-gray-800 rounded relative overflow-hidden">
                                                {/* Ghost Overlay Effect */}
                                                <div className="absolute inset-0 bg-cyan-900/10 pointer-events-none" />

                                                <div className="text-gray-500 border-b border-gray-800 pb-1 flex justify-between">
                                                    <span>SAVED ({compareSnapshot.algorithm})</span>
                                                    <ArrowRightLeft size={10} />
                                                </div>

                                                <div className="flex justify-between">
                                                    <span>A.Wait:</span>
                                                    <span className={clsx(
                                                        Number(avgWait) < compareSnapshot.stats.avgWait ? "text-green-400" : "text-red-400"
                                                    )}>
                                                        {compareSnapshot.stats.avgWait.toFixed(1)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>A.Turn:</span>
                                                    <span className={clsx(
                                                        Number(avgTurnaround) < compareSnapshot.stats.avgTurnaround ? "text-green-400" : "text-red-400"
                                                    )}>
                                                        {compareSnapshot.stats.avgTurnaround.toFixed(1)}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="empty"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex items-center justify-center h-full text-gray-600 text-[10px] italic"
                                        >
                                            [ SELECT SNAPSHOT TO COMPARE PERFORMANCE ]
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </TerminalWindow>
                    </div>
                </div>
            </div>
        </div>
    );
}

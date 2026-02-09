'use client';

import { useState, useEffect, useRef } from 'react';
import { useSystemStore, SchedulerAlgo } from '@/store/memoryStore';
import TerminalWindow from '@/components/visual/TerminalWindow';
import MemoryGrid from '@/components/visual/MemoryGrid';
import CyberGantt from '@/components/visual/CyberGantt';
import ProcessList from '@/components/visual/ProcessList';
import { Play, Pause, Square, Plus, Settings, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function MemoryPage() {
    const [mounted, setMounted] = useState(false);
    const [pidCounter, setPidCounter] = useState(1);
    const [newBurst, setNewBurst] = useState(5);
    const [newPri, setNewPri] = useState(1);
    const [newSize, setNewSize] = useState(256); // Default 1 page

    const {
        schedulerConfig,
        memStats,
        globalClock,
        tick,
        setSchedulerAlgo,
        setTimeQuantum,
        setSpeed,
        togglePause,
        resetSystem,
        addProcess,
        processQueue,
        completedProcesses
    } = useSystemStore();

    const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Hydration fix
    useEffect(() => setMounted(true), []);

    // TICK CYCLE
    useEffect(() => {
        if (!schedulerConfig.isPaused) {
            const intervalMs = 1000 / schedulerConfig.speed; // Base 1s per tick / speed
            tickIntervalRef.current = setInterval(() => {
                tick();
            }, intervalMs);
        }

        return () => {
            if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
        }
    }, [schedulerConfig.isPaused, schedulerConfig.speed, tick]);

    const handleAddProcess = () => {
        addProcess({
            pid: pidCounter,
            arrivalTime: globalClock,
            burstTime: newBurst,
            priority: newPri,
            size: newSize,
            color: '' // auto-assigned
        });
        setPidCounter(c => c + 1);
    };

    if (!mounted) return null;

    // Derived Metrics (Live)
    const allCompleted = completedProcesses;
    const avgWait = allCompleted.length > 0
        ? (allCompleted.reduce((acc, p) => acc + p.waitingTime, 0) / allCompleted.length).toFixed(1)
        : '0.0';
    const avgTurnaround = allCompleted.length > 0
        ? (allCompleted.reduce((acc, p) => acc + p.turnaroundTime, 0) / allCompleted.length).toFixed(1)
        : '0.0';

    const cpuLoad = processQueue.filter(p => p.state === 'RUNNING').length > 0 ? 100 : 0;

    return (
        <div className="flex flex-col min-h-full gap-4 pb-4">

            {/* HEADER & METRICS */}
            <header className="flex justify-between items-end border-b border-cyan-900/50 pb-2 shrink-0">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 animate-[pulse_3s_ease-in-out_infinite]">
                        VIRTUAL MEMORY SIM
                    </h1>
                    <div className="flex gap-4 mt-1 text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                        <span>Next.js 15 :: System Online</span>
                        <span className="text-cyan-400">CLK: {globalClock}</span>
                    </div>
                </div>

                <div className="flex gap-6">
                    <div className="text-right">
                        <div className="text-[10px] text-gray-500">AVG WAIT</div>
                        <div className="text-xl font-mono text-cyan-400">{avgWait}s</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-gray-500">AVG TURNAROUND</div>
                        <div className="text-xl font-mono text-purple-400">{avgTurnaround}s</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-gray-500">CPU LOAD</div>
                        <div className={clsx("text-xl font-mono", cpuLoad > 0 ? "text-green-400" : "text-gray-600")}>
                            {cpuLoad}%
                        </div>
                    </div>
                </div>
            </header>

            {/* TOP ROW: Gantt & Memory */}
            <div className="flex gap-4">
                {/* GANTT CHART */}
                <div className="flex-[2] flex flex-col gap-2 min-h-[300px]">
                    <CyberGantt />
                </div>

                {/* MEMORY MAP */}
                <div className="flex-1 flex flex-col">
                    <TerminalWindow title="LIVE MEMORY FLUX" className="min-h-[300px]" status="active">
                        <MemoryGrid />
                    </TerminalWindow>
                </div>
            </div>

            {/* BOTTOM ROW */}
            <div className="flex gap-4">

                {/* Controls */}
                <div className="w-1/4 flex flex-col gap-4">
                    <TerminalWindow title="SYS_CONTROL" className="min-h-[400px]">
                        <div className="flex flex-col gap-4">

                            <div className="flex gap-2">
                                <button
                                    onClick={togglePause}
                                    className={clsx(
                                        "flex-1 py-2 flex items-center justify-center gap-2 border font-bold transition-all",
                                        schedulerConfig.isPaused
                                            ? "bg-green-500/20 border-green-500 text-green-400 hover:bg-green-500/40"
                                            : "bg-yellow-500/20 border-yellow-500 text-yellow-400 hover:bg-yellow-500/40"
                                    )}
                                >
                                    {schedulerConfig.isPaused ? <Play size={16} /> : <Pause size={16} />}
                                    {schedulerConfig.isPaused ? "START" : "PAUSE"}
                                </button>

                                <button
                                    onClick={resetSystem}
                                    className="px-3 bg-red-900/30 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                >
                                    <Square size={16} fill="currentColor" />
                                </button>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-gray-400">
                                    <span>TIME WARP</span>
                                    <span>{schedulerConfig.speed}x</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.5" max="4" step="0.5"
                                    value={schedulerConfig.speed}
                                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                                    className="w-full accent-cyan-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="h-px bg-gray-800 my-2" />

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-cyan-600 block">ALGORITHM</label>
                                    <select
                                        value={schedulerConfig.algorithm}
                                        onChange={(e) => setSchedulerAlgo(e.target.value as SchedulerAlgo)}
                                        className="w-full bg-black/50 border border-cyan-900 text-gray-300 p-1 text-xs focus:outline-none"
                                    >
                                        <option value="FCFS">First Come First Serve</option>
                                        <option value="RR">Round Robin</option>
                                        <option value="PRIORITY">Priority (Preemptive)</option>
                                    </select>
                                </div>

                                {schedulerConfig.algorithm === 'RR' && (
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-cyan-600 block">QUANTUM (Q)</label>
                                        <input
                                            type="number" min="1" max="10"
                                            value={schedulerConfig.timeQuantum}
                                            onChange={(e) => setTimeQuantum(parseInt(e.target.value))}
                                            className="w-full bg-black/50 border border-cyan-900 text-gray-300 p-1 text-xs"
                                        />
                                    </div>
                                )}
                            </div>

                        </div>
                    </TerminalWindow>
                </div>

                {/* Injector */}
                <div className="w-1/4">
                    <TerminalWindow title="PROCESS INJECTOR" className="min-h-[300px]">
                        <div className="flex flex-col gap-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] text-gray-500">BURST TIME</label>
                                    <input
                                        type="number" min="1" value={newBurst}
                                        onChange={(e) => setNewBurst(parseInt(e.target.value))}
                                        className="w-full bg-black/30 border border-gray-700 text-white p-1 text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500">PRIORITY</label>
                                    <input
                                        type="number" min="1" value={newPri}
                                        onChange={(e) => setNewPri(parseInt(e.target.value))}
                                        className="w-full bg-black/30 border border-gray-700 text-white p-1 text-xs"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500">MEMORY SIZE (Bytes)</label>
                                <select
                                    value={newSize}
                                    onChange={(e) => setNewSize(parseInt(e.target.value))}
                                    className="w-full bg-black/30 border border-gray-700 text-white p-1 text-xs"
                                >
                                    <option value={128}>128 B (Small)</option>
                                    <option value={256}>256 B (1 Page)</option>
                                    <option value={512}>512 B (2 Pages)</option>
                                    <option value={1024}>1024 B (4 Pages)</option>
                                </select>
                            </div>

                            <button
                                onClick={handleAddProcess}
                                className="mt-2 w-full bg-cyan-900/30 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black py-2 text-xs font-bold transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={14} /> INJECT PROCESS
                            </button>
                        </div>
                    </TerminalWindow>
                </div>

                {/* Queue */}
                <div className="flex-1">
                    <TerminalWindow title="READY QUEUE" className="min-h-[300px]" status="active">
                        <ProcessList />
                    </TerminalWindow>
                </div>

            </div>

        </div>
    );
}

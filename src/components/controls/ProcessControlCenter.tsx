'use client';

import { useState } from 'react';
import { useSystemStore } from '@/store/memoryStore';
import { Plus, Play, Pause, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import TerminalWindow from '../visual/TerminalWindow';

export default function ProcessControlCenter() {
    const { addProcess, globalClock, schedulerConfig, togglePause, resetSystem, setSpeed } = useSystemStore();

    const [pid, setPid] = useState(1);
    const [burst, setBurst] = useState(5);
    const [priority, setPriority] = useState(1);
    const [arrival, setArrival] = useState(globalClock); // Default to now

    const handleInject = () => {
        addProcess({
            pid,
            arrivalTime: arrival,
            burstTime: burst,
            priority,
            size: 256, // Default specific size or add input? Prompt says "Process ID, Arrival Time, Burst Time, and Priority"
            color: ''
        });
        setPid(pid + 1);
    };

    return (
        <TerminalWindow title="PROCESS_CONTROL_CENTER" className="h-full z-10" status="active">
            <div className="flex flex-col gap-4 h-full">

                {/* Simulation Controls */}
                <div className="flex gap-2">
                    <button
                        onClick={togglePause}
                        className={clsx(
                            "flex-1 py-3 flex items-center justify-center gap-2 border font-bold transition-all text-xs tracking-wider",
                            schedulerConfig.isPaused
                                ? "bg-green-500/20 border-green-500 text-green-400 hover:bg-green-500/40"
                                : "bg-yellow-500/20 border-yellow-500 text-yellow-400 hover:bg-yellow-500/40"
                        )}
                    >
                        {schedulerConfig.isPaused ? <Play size={14} /> : <Pause size={14} />}
                        {schedulerConfig.isPaused ? "RESUME_SIM" : "PAUSE_SIM"}
                    </button>
                    <div className="flex flex-col flex-1 gap-1">
                        <label className="text-[10px] text-gray-400">SPEED: {schedulerConfig.speed}x</label>
                        <input
                            type="range" min="0.5" max="4" step="0.5"
                            value={schedulerConfig.speed}
                            onChange={(e) => setSpeed(parseFloat(e.target.value))}
                            className="w-full accent-cyan-500 h-1 bg-gray-700"
                        />
                    </div>
                </div>

                <div className="h-px bg-cyan-900/50" />

                {/* Input Form */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-500">PROCESS ID</label>
                        <input
                            type="number" value={pid} onChange={(e) => setPid(parseInt(e.target.value))}
                            className="w-full bg-black/40 border border-cyan-900/50 text-cyan-400 p-1 text-xs font-mono"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-500">ARRIVAL TIME</label>
                        <input
                            type="number" value={arrival} onChange={(e) => setArrival(parseInt(e.target.value))}
                            className="w-full bg-black/40 border border-cyan-900/50 text-white p-1 text-xs font-mono"
                            placeholder="Now"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-500">BURST TIME</label>
                        <input
                            type="number" value={burst} onChange={(e) => setBurst(parseInt(e.target.value))}
                            className="w-full bg-black/40 border border-cyan-900/50 text-white p-1 text-xs font-mono"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-500">PRIORITY</label>
                        <input
                            type="number" value={priority} onChange={(e) => setPriority(parseInt(e.target.value))}
                            className="w-full bg-black/40 border border-cyan-900/50 text-white p-1 text-xs font-mono"
                        />
                    </div>
                </div>

                <button
                    onClick={handleInject}
                    className="mt-auto w-full bg-cyan-600/20 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black py-3 text-sm font-black tracking-widest transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-cyan-400/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <Plus size={16} /> INJECT_PROCESS
                </button>
            </div>
        </TerminalWindow>
    );
}

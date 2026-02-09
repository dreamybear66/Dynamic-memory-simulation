'use client';

import { useSentinelStore } from '@/store/sentinelStore';
import LeakGrid from '@/components/visual/LeakGrid';
import SentinelHUD from '@/components/visual/SentinelHUD';
import PulseMonitor from '@/components/visual/PulseMonitor';
import TerminalWindow from '@/components/visual/TerminalWindow';
import SevenSegment from '@/components/ui/SevenSegment';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Zap, Search } from 'lucide-react';
import clsx from 'clsx';
import { useAllocationStore } from '@/store/allocationStore';

export default function SentinelPage() {
    const { status, scanMemory, leaks, scannedBlocks, registerProcess, terminateProcessCrash } = useSentinelStore();
    const { allocate, memoryBlocks } = useAllocationStore();

    const isSafe = status === 'SAFE' || status === 'IDLE';

    // Simulation Helper: Allocates a block & registers it as valid
    const handleSafeAlloc = () => {
        const pid = Math.floor(Math.random() * 9000) + 1000;
        const size = Math.floor(Math.random() * 100) + 50;
        const color = '#10b981'; // Green for safe

        if (allocate(pid, size, color)) {
            registerProcess(pid);
        }
    };

    // Simulation Helper: Simulates a process crash (Orphan creation)
    const handleCreateLeak = () => {
        // Find a valid process
        const processes = memoryBlocks.filter(b => b.type === 'PROCESS');
        if (processes.length === 0) return;

        const victim = processes[Math.floor(Math.random() * processes.length)];
        if (victim.pid) {
            terminateProcessCrash(victim.pid); // Removes from activePids -> Becomes LEAK
            // We don't deallocate here, so it stays in memory
        }
    };

    return (
        <div className="min-h-full w-full p-6 flex flex-col gap-6 relative">
            {/* Sentinel HUD Overlay */}
            <SentinelHUD />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.05)_0%,rgba(0,0,0,0)_60%)] pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between shrink-0 z-10">
                <div>
                    <h1 className={clsx(
                        "text-3xl font-black uppercase tracking-tighter flex items-center gap-3 transition-colors",
                        isSafe ? "text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500" : "text-red-500 animate-pulse"
                    )}>
                        {isSafe ? <ShieldCheck size={32} className="text-emerald-500" /> : <ShieldAlert size={32} />}
                        SENTINEL DIAGNOSTICS
                    </h1>
                    <div className="text-sm text-gray-500 font-mono pl-11">
                        MEMORY INTEGRITY MONITOR // MODE: {status}
                    </div>
                </div>

                <div className="flex gap-4">
                    <SevenSegment
                        value={leaks.length}
                        label="ACTIVE LEAKS"
                        color={leaks.length > 0 ? "text-red-500" : "text-gray-600"}
                        size="sm"
                    />
                    <SevenSegment
                        value={scannedBlocks}
                        label="SECTORS SCANNED"
                        color="text-cyan-600"
                        size="sm"
                    />
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-12 gap-6 z-10 w-full">

                {/* Left: Controls & Stats */}
                <div className="col-span-3 flex flex-col gap-4">
                    <TerminalWindow title="DIAGNOSTIC_CONTROLS" className="min-h-[500px]">
                        <div className="flex flex-col gap-4 h-full p-2">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={scanMemory}
                                disabled={status === 'SCANNING'}
                                className="w-full py-4 bg-cyan-900/30 border border-cyan-500 text-cyan-400 font-bold uppercase tracking-widest rounded flex items-center justify-center gap-2 hover:bg-cyan-500 hover:text-black transition-all disabled:opacity-50"
                            >
                                <Search size={18} /> INITIATE SCAN
                            </motion.button>

                            <div className="h-px bg-gray-800" />

                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-500">SIMULATION TOOLS</label>
                                <button
                                    onClick={handleSafeAlloc}
                                    className="w-full py-2 bg-emerald-900/20 border border-emerald-500/50 text-emerald-400 text-xs hover:bg-emerald-500 hover:text-black transition-colors"
                                >
                                    + SPAWN SAFE PROCESS
                                </button>
                                <button
                                    onClick={handleCreateLeak}
                                    className="w-full py-2 bg-red-900/20 border border-red-500/50 text-red-400 text-xs hover:bg-red-500 hover:text-white transition-colors"
                                >
                                    ! SIMULATE CRASH (LEAK)
                                </button>
                            </div>

                            <div className="mt-auto bg-gray-900/50 p-2 rounded text-[10px] text-gray-500 font-mono">
                                <p>Generate zombie processes to test Sentinel detection capabilities.</p>
                            </div>
                        </div>
                    </TerminalWindow>
                </div>

                {/* Center: Leak Grid */}
                <div className="col-span-6 flex flex-col">
                    <TerminalWindow title="SECTOR_MAP // 0xFF" className="min-h-[600px]" status={status === 'SCANNING' ? 'scanning' : isSafe ? 'idle' : 'error'}>
                        <LeakGrid />
                    </TerminalWindow>
                </div>

                {/* Right: Pulse Monitor */}
                <div className="col-span-3 flex flex-col gap-4">
                    <TerminalWindow title="LEAK_HISTORY_LOG" className="h-64 shrink-0" status="active">
                        <PulseMonitor />
                    </TerminalWindow>

                    <div className="flex-1 bg-black/40 border border-gray-800 rounded p-4 font-mono text-[10px] text-gray-400 overflow-hidden">
                        <div className="font-bold text-gray-500 mb-2">SYSTEM STATUS LOG</div>
                        <div className="space-y-1">
                            {status === 'IDLE' && <div>System Check: OK</div>}
                            {status === 'SCANNING' && <div className="text-cyan-400 animate-pulse">Running heuristic analysis...</div>}
                            {status === 'ALERT' && <div className="text-red-500 font-bold">!! ANOMALY DETECTED !!</div>}
                            {status === 'PURGING' && <div className="text-yellow-400">Reclaiming orphaned sectors...</div>}
                            {status === 'SAFE' && <div className="text-emerald-500">Memory Integrity Verified.</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

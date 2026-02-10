'use client';

import { usePagingStore, PageReplacementAlgo, TLBReplacementPolicy } from '@/store/pagingStore';
import { Play, Pause, SkipForward, RotateCcw, Settings } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

/**
 * PagingControls - Configuration and simulation control panel
 * Allows users to configure memory parameters, select algorithms, and control simulation
 */
export default function PagingControls() {
    const config = usePagingStore(state => state.config);
    const replacementAlgo = usePagingStore(state => state.replacementAlgo);
    const tlbPolicy = usePagingStore(state => state.tlbPolicy);
    const simulation = usePagingStore(state => state.simulation);

    const setMemoryConfig = usePagingStore(state => state.setMemoryConfig);
    const setReplacementAlgo = usePagingStore(state => state.setReplacementAlgo);
    const setTLBPolicy = usePagingStore(state => state.setTLBPolicy);
    const setSimulationMode = usePagingStore(state => state.setSimulationMode);
    const toggleSimulation = usePagingStore(state => state.toggleSimulation);
    const setSpeed = usePagingStore(state => state.setSpeed);
    const stepSimulation = usePagingStore(state => state.stepSimulation);
    const resetSimulation = usePagingStore(state => state.resetSimulation);

    const [showAdvanced, setShowAdvanced] = useState(false);

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-3">
                Simulation Controls
            </h3>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {/* Playback Controls */}
                <div className="space-y-2">
                    <div className="text-[10px] text-gray-400 mb-2">PLAYBACK</div>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={toggleSimulation}
                            className={clsx(
                                "flex items-center justify-center gap-2 py-2 border-2 font-bold transition-all",
                                simulation.isRunning
                                    ? "bg-yellow-500/20 border-yellow-500 text-yellow-400 hover:bg-yellow-500/30"
                                    : "bg-green-500/20 border-green-500 text-green-400 hover:bg-green-500/30"
                            )}
                        >
                            {simulation.isRunning ? <Pause size={16} /> : <Play size={16} />}
                            {simulation.isRunning ? 'PAUSE' : 'PLAY'}
                        </button>

                        <button
                            onClick={stepSimulation}
                            disabled={simulation.isRunning}
                            className="flex items-center justify-center gap-2 py-2 border-2 border-cyan-500 
                                text-cyan-400 bg-cyan-500/20 hover:bg-cyan-500/30 font-bold transition-all
                                disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <SkipForward size={16} />
                            STEP
                        </button>
                    </div>

                    <button
                        onClick={resetSimulation}
                        className="w-full flex items-center justify-center gap-2 py-2 border-2 border-red-500 
                            text-red-400 bg-red-500/20 hover:bg-red-500/30 font-bold transition-all"
                    >
                        <RotateCcw size={16} />
                        RESET
                    </button>
                </div>

                {/* Simulation Mode */}
                <div className="space-y-2">
                    <div className="text-[10px] text-gray-400 mb-2">MODE</div>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setSimulationMode('manual')}
                            className={clsx(
                                "py-2 px-3 border-2 font-bold text-xs transition-all",
                                simulation.mode === 'manual'
                                    ? "bg-cyan-500/30 border-cyan-500 text-cyan-400"
                                    : "bg-gray-800/30 border-gray-700 text-gray-400 hover:border-gray-600"
                            )}
                        >
                            MANUAL
                        </button>
                        <button
                            onClick={() => setSimulationMode('auto')}
                            className={clsx(
                                "py-2 px-3 border-2 font-bold text-xs transition-all",
                                simulation.mode === 'auto'
                                    ? "bg-cyan-500/30 border-cyan-500 text-cyan-400"
                                    : "bg-gray-800/30 border-gray-700 text-gray-400 hover:border-gray-600"
                            )}
                        >
                            AUTO
                        </button>
                    </div>
                </div>

                {/* Speed Control */}
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px]">
                        <span className="text-gray-400">SPEED</span>
                        <span className="text-cyan-400 font-mono">{simulation.speed}x</span>
                    </div>
                    <input
                        type="range"
                        min="0.5"
                        max="4"
                        step="0.5"
                        value={simulation.speed}
                        onChange={(e) => setSpeed(parseFloat(e.target.value))}
                        className="w-full accent-cyan-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                <div className="h-px bg-gray-800" />

                {/* Algorithm Selection */}
                <div className="space-y-2">
                    <div className="text-[10px] text-gray-400 mb-2">PAGE REPLACEMENT</div>
                    <select
                        value={replacementAlgo}
                        onChange={(e) => setReplacementAlgo(e.target.value as PageReplacementAlgo)}
                        className="w-full bg-black/50 border border-cyan-900 text-gray-300 p-2 text-xs 
                            focus:outline-none focus:border-cyan-500"
                    >
                        <option value="FIFO">FIFO (First In First Out)</option>
                        <option value="LRU">LRU (Least Recently Used)</option>
                        <option value="Optimal">Optimal (Future Knowledge)</option>
                        <option value="Clock">Clock (Second Chance)</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <div className="text-[10px] text-gray-400 mb-2">TLB POLICY</div>
                    <select
                        value={tlbPolicy}
                        onChange={(e) => setTLBPolicy(e.target.value as TLBReplacementPolicy)}
                        className="w-full bg-black/50 border border-cyan-900 text-gray-300 p-2 text-xs 
                            focus:outline-none focus:border-cyan-500"
                    >
                        <option value="FIFO">FIFO</option>
                        <option value="LRU">LRU</option>
                    </select>
                </div>

                {/* Advanced Configuration */}
                <div>
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="w-full flex items-center justify-between py-2 px-3 bg-gray-800/30 
                            border border-gray-700 text-gray-400 hover:border-gray-600 transition-all text-xs"
                    >
                        <div className="flex items-center gap-2">
                            <Settings size={14} />
                            <span>ADVANCED CONFIG</span>
                        </div>
                        <span>{showAdvanced ? '▼' : '▶'}</span>
                    </button>

                    {showAdvanced && (
                        <div className="mt-2 space-y-3 p-3 bg-gray-900/50 border border-gray-800 rounded">
                            {/* Page Size */}
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-400">PAGE SIZE</label>
                                <select
                                    value={config.pageSize}
                                    onChange={(e) => setMemoryConfig({ pageSize: parseInt(e.target.value) })}
                                    className="w-full bg-black/50 border border-gray-700 text-gray-300 p-1 text-xs"
                                >
                                    <option value={256}>256 B</option>
                                    <option value={512}>512 B</option>
                                    <option value={1024}>1 KB</option>
                                    <option value={2048}>2 KB</option>
                                    <option value={4096}>4 KB</option>
                                </select>
                            </div>

                            {/* Logical Address Space */}
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-400">LOGICAL MEMORY</label>
                                <select
                                    value={config.logicalAddressSpaceSize}
                                    onChange={(e) => setMemoryConfig({ logicalAddressSpaceSize: parseInt(e.target.value) })}
                                    className="w-full bg-black/50 border border-gray-700 text-gray-300 p-1 text-xs"
                                >
                                    <option value={16384}>16 KB</option>
                                    <option value={32768}>32 KB</option>
                                    <option value={65536}>64 KB</option>
                                    <option value={131072}>128 KB</option>
                                </select>
                            </div>

                            {/* Physical Memory */}
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-400">PHYSICAL MEMORY</label>
                                <select
                                    value={config.physicalMemorySize}
                                    onChange={(e) => setMemoryConfig({ physicalMemorySize: parseInt(e.target.value) })}
                                    className="w-full bg-black/50 border border-gray-700 text-gray-300 p-1 text-xs"
                                >
                                    <option value={8192}>8 KB</option>
                                    <option value={16384}>16 KB</option>
                                    <option value={32768}>32 KB</option>
                                    <option value={65536}>64 KB</option>
                                </select>
                            </div>

                            {/* TLB Size */}
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-400">TLB SIZE</label>
                                <select
                                    value={config.tlbSize}
                                    onChange={(e) => setMemoryConfig({ tlbSize: parseInt(e.target.value) })}
                                    className="w-full bg-black/50 border border-gray-700 text-gray-300 p-1 text-xs"
                                >
                                    <option value={2}>2 entries</option>
                                    <option value={4}>4 entries</option>
                                    <option value={8}>8 entries</option>
                                    <option value={16}>16 entries</option>
                                </select>
                            </div>

                            {/* Calculated Values */}
                            <div className="pt-2 border-t border-gray-800 space-y-1 text-[10px]">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Pages:</span>
                                    <span className="text-cyan-400 font-mono">{config.numPages}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Frames:</span>
                                    <span className="text-green-400 font-mono">{config.numFrames}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Offset Bits:</span>
                                    <span className="text-purple-400 font-mono">{config.offsetBits}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Page# Bits:</span>
                                    <span className="text-purple-400 font-mono">{config.pageNumberBits}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

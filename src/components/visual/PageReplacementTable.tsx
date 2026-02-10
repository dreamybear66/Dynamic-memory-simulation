'use client';

import { useState, useEffect, useRef } from 'react';
import { usePagingStore } from '@/store/pagingStore';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { Plus, Trash2, RotateCcw, Play, Pause, SkipForward, AlertTriangle } from 'lucide-react';

type PageReplacementAlgo = 'FIFO' | 'LRU' | 'Optimal' | 'MFU';

interface FrameState {
    pages: (number | null)[];
    hit: boolean;
}

interface ThrashingMetrics {
    pageFaultFrequency: number[];
    workingSetSizes: number[];
    faultRateHistory: number[];
    thrashingEvents: boolean[];
    isThrashing: boolean;
}

/**
 * PageReplacementTable - Interactive table with thrashing detection
 * Shows page replacement algorithm execution with real-time performance monitoring
 */
export default function PageReplacementTable() {
    const [numFrames, setNumFrames] = useState(3);
    const [algorithm, setAlgorithm] = useState<PageReplacementAlgo>('FIFO');
    const [pageReferences, setPageReferences] = useState<number[]>([]);
    const [newPage, setNewPage] = useState('');
    const [allFrameStates, setAllFrameStates] = useState<FrameState[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [isExecuted, setIsExecuted] = useState(false);

    // Thrashing detection state
    const [thrashingMetrics, setThrashingMetrics] = useState<ThrashingMetrics>({
        pageFaultFrequency: [],
        workingSetSizes: [],
        faultRateHistory: [],
        thrashingEvents: [],
        isThrashing: false
    });

    // Thresholds - More sensitive for better detection
    const workingSetWindow = 5;
    const pffThreshold = 2; // Lowered from 3 - detect with 2 faults in window
    const faultRateThreshold = 50; // Lowered from 70 - detect at 50% fault rate

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Calculate thrashing metrics for current step
    const calculateThrashingMetrics = (step: number, states: FrameState[]): ThrashingMetrics => {
        const windowSize = workingSetWindow;
        const startIdx = Math.max(0, step - windowSize + 1);
        const recentStates = states.slice(startIdx, step + 1);

        // Page Fault Frequency
        const faultsInWindow = recentStates.filter(s => !s.hit).length;
        const pff = faultsInWindow / Math.min(windowSize, step + 1);

        // Fault Rate
        const totalInWindow = recentStates.length;
        const faultRate = totalInWindow > 0 ? (faultsInWindow / totalInWindow) * 100 : 0;

        // Working Set Size
        const uniquePages = new Set(pageReferences.slice(startIdx, step + 1));
        const workingSetSize = uniquePages.size;

        // Memory Pressure
        const memoryPressure = workingSetSize / numFrames;

        // Check for consecutive faults
        let consecutiveFaults = 0;
        let maxConsecutive = 0;
        for (const state of recentStates) {
            if (!state.hit) {
                consecutiveFaults++;
                maxConsecutive = Math.max(maxConsecutive, consecutiveFaults);
            } else {
                consecutiveFaults = 0;
            }
        }

        // Individual step status - Show red for MISS, green for HIT
        // This makes the timeline intuitive and matches the status row
        const currentStepIsMiss = !states[step].hit;

        // System-level thrashing detection (for alert banner and metrics)
        const systemThrashing =
            pff >= pffThreshold ||           // 2+ faults in 5-step window
            faultRate >= faultRateThreshold || // 50%+ fault rate
            memoryPressure > 1.3 ||           // Working set > 1.3x frames
            maxConsecutive >= 2;              // 2+ consecutive faults

        return {
            pageFaultFrequency: [...thrashingMetrics.pageFaultFrequency, pff],
            workingSetSizes: [...thrashingMetrics.workingSetSizes, workingSetSize],
            faultRateHistory: [...thrashingMetrics.faultRateHistory, faultRate],
            thrashingEvents: [...thrashingMetrics.thrashingEvents, currentStepIsMiss], // Use individual step status
            isThrashing: systemThrashing // Use window-based detection for overall system state
        };
    };

    // Add page reference
    const addPageReference = () => {
        const page = parseInt(newPage);
        if (!isNaN(page) && page >= 0) {
            setPageReferences([...pageReferences, page]);
            setNewPage('');
            setIsExecuted(false);
            setCurrentStep(0);
        }
    };

    // Remove last page reference
    const removeLastPage = () => {
        setPageReferences(pageReferences.slice(0, -1));
        setIsExecuted(false);
        setCurrentStep(0);
    };

    // Clear all
    const clearAll = () => {
        setPageReferences([]);
        setAllFrameStates([]);
        setIsExecuted(false);
        setCurrentStep(0);
        setIsPlaying(false);
        setThrashingMetrics({
            pageFaultFrequency: [],
            workingSetSizes: [],
            faultRateHistory: [],
            thrashingEvents: [],
            isThrashing: false
        });
    };

    // Execute algorithm
    const executeAlgorithm = () => {
        const states: FrameState[] = [];
        const frames: (number | null)[] = Array(numFrames).fill(null);
        const accessTimes: number[] = Array(numFrames).fill(0);
        const loadTimes: number[] = Array(numFrames).fill(0);
        const accessCounts: number[] = Array(numFrames).fill(0);

        pageReferences.forEach((page, index) => {
            let hit = false;

            const existingIndex = frames.indexOf(page);
            if (existingIndex !== -1) {
                hit = true;
                accessTimes[existingIndex] = index;
                accessCounts[existingIndex]++;
            } else {
                let victimIndex = -1;
                const emptyIndex = frames.indexOf(null);

                if (emptyIndex !== -1) {
                    victimIndex = emptyIndex;
                } else {
                    switch (algorithm) {
                        case 'FIFO':
                            victimIndex = loadTimes.indexOf(Math.min(...loadTimes));
                            break;
                        case 'LRU':
                            victimIndex = accessTimes.indexOf(Math.min(...accessTimes));
                            break;
                        case 'Optimal':
                            let maxDistance = -1;
                            victimIndex = 0;
                            frames.forEach((framePage, idx) => {
                                if (framePage === null) return;
                                let nextUse = Infinity;
                                for (let i = index + 1; i < pageReferences.length; i++) {
                                    if (pageReferences[i] === framePage) {
                                        nextUse = i;
                                        break;
                                    }
                                }
                                if (nextUse > maxDistance) {
                                    maxDistance = nextUse;
                                    victimIndex = idx;
                                }
                            });
                            break;
                        case 'MFU':
                            victimIndex = accessCounts.indexOf(Math.max(...accessCounts));
                            break;
                    }
                }

                frames[victimIndex] = page;
                loadTimes[victimIndex] = index;
                accessTimes[victimIndex] = index;
                accessCounts[victimIndex] = 1;
            }

            states.push({ pages: [...frames], hit });
        });

        setAllFrameStates(states);
        setIsExecuted(true);
        setCurrentStep(0);
        setIsPlaying(true);

        // Initialize thrashing metrics
        setThrashingMetrics({
            pageFaultFrequency: [],
            workingSetSizes: [],
            faultRateHistory: [],
            thrashingEvents: [],
            isThrashing: false
        });
    };

    // Update thrashing metrics when step changes
    useEffect(() => {
        if (isExecuted && allFrameStates.length > 0) {
            const metrics = calculateThrashingMetrics(currentStep, allFrameStates);
            setThrashingMetrics(metrics);
        }
    }, [currentStep, isExecuted]);

    // Animation loop
    useEffect(() => {
        if (isPlaying && isExecuted && currentStep < allFrameStates.length - 1) {
            const delay = 1000 / speed;
            intervalRef.current = setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, delay);
        } else if (currentStep >= allFrameStates.length - 1) {
            setIsPlaying(false);
        }

        return () => {
            if (intervalRef.current) clearTimeout(intervalRef.current);
        };
    }, [isPlaying, currentStep, allFrameStates.length, speed, isExecuted]);

    const togglePlay = () => {
        if (currentStep >= allFrameStates.length - 1) {
            setCurrentStep(0);
        }
        setIsPlaying(!isPlaying);
    };

    const nextStep = () => {
        if (currentStep < allFrameStates.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    // Calculate current statistics
    const visibleStates = allFrameStates.slice(0, currentStep + 1);
    const totalAccesses = visibleStates.length;
    const hits = visibleStates.filter(s => s.hit).length;
    const misses = visibleStates.filter(s => !s.hit).length;
    const hitRate = totalAccesses > 0 ? (hits / totalAccesses) * 100 : 0;
    const faultRate = totalAccesses > 0 ? (misses / totalAccesses) * 100 : 0;

    // Current working set
    const startIdx = Math.max(0, currentStep - workingSetWindow + 1);
    const currentWorkingSet = new Set(pageReferences.slice(startIdx, currentStep + 1));
    const workingSetSize = currentWorkingSet.size;
    const memoryPressure = workingSetSize / numFrames;

    // Global Store Integration
    const { setStats, setReplacementAlgo, addLog } = usePagingStore();

    // Sync algorithm
    useEffect(() => {
        setReplacementAlgo(algorithm);
    }, [algorithm, setReplacementAlgo]);

    // Update global store when simulation executes or steps change
    useEffect(() => {
        if (isExecuted) {
            // Calculate current visible stats
            const visibleStates = allFrameStates.slice(0, currentStep + 1);
            const totalAccesses = visibleStates.length;
            const hits = visibleStates.filter(s => s.hit).length;
            const misses = visibleStates.filter(s => !s.hit).length;
            const currentHitRate = totalAccesses > 0 ? (hits / totalAccesses) * 100 : 0;
            const currentFaultRate = totalAccesses > 0 ? (misses / totalAccesses) * 100 : 0;

            // Create history arrays (1 for fault/miss, 0 for hit)
            // The report graph looks at pageFaultHistory
            const faultHistory = visibleStates.map(s => s.hit ? 0 : 1);
            const hitHistory = visibleStates.map(s => s.hit ? 1 : 0);

            // Update Global Store
            setStats({
                pageFaultRate: currentFaultRate,
                tlbHitRate: currentHitRate, // Using hit rate as proxy for TLB hit rate in this simplified view
                totalAccesses: totalAccesses,
                pageFaults: misses,
                tlbHits: hits,
                pageFaultHistory: faultHistory,
                tlbHitHistory: hitHistory
            });

            // Add Log for current step
            if (currentStep < pageReferences.length) {
                const page = pageReferences[currentStep];
                const status = visibleStates[currentStep]?.hit ? 'HIT' : 'MISS';
                addLog(`Access Page ${page} -> ${status} (${algorithm})`);
            }
        }
    }, [isExecuted, currentStep, allFrameStates, algorithm, pageReferences, setStats, addLog]);

    // Current PFF Calculation (Restored)
    const recentStates = visibleStates.slice(Math.max(0, visibleStates.length - workingSetWindow));
    const currentPFF = recentStates.filter(s => !s.hit).length / Math.min(workingSetWindow, recentStates.length);

    return (
        <div className="h-full flex flex-col gap-4">
            {/* Configuration */}
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-400">NUMBER OF FRAMES</label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={numFrames}
                            onChange={(e) => {
                                setNumFrames(parseInt(e.target.value) || 1);
                                setIsExecuted(false);
                                setCurrentStep(0);
                            }}
                            disabled={isExecuted}
                            className="w-full bg-black/50 border border-cyan-900 text-white px-3 py-2 text-sm 
                                focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-400">ALGORITHM</label>
                        <select
                            value={algorithm}
                            onChange={(e) => {
                                setAlgorithm(e.target.value as PageReplacementAlgo);
                                setIsExecuted(false);
                                setCurrentStep(0);
                            }}
                            disabled={isExecuted}
                            className="w-full bg-black/50 border border-cyan-900 text-white px-3 py-2 text-sm 
                                focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                        >
                            <option value="FIFO">FIFO</option>
                            <option value="LRU">LRU</option>
                            <option value="Optimal">Optimal</option>
                            <option value="MFU">MFU</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-2">
                    <input
                        type="number"
                        min="0"
                        value={newPage}
                        onChange={(e) => setNewPage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isExecuted && addPageReference()}
                        placeholder="Enter page number..."
                        disabled={isExecuted}
                        className="flex-1 bg-black/50 border border-cyan-900 text-white px-3 py-2 text-sm 
                            focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                    />
                    <button
                        onClick={addPageReference}
                        disabled={isExecuted}
                        className="px-4 py-2 bg-cyan-900/30 border border-cyan-500 text-cyan-400 
                            hover:bg-cyan-500 hover:text-black transition-all font-bold text-sm
                            flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus size={16} />
                        ADD
                    </button>
                </div>

                <div className="bg-gray-900/50 border border-gray-700 rounded p-3">
                    <div className="text-[10px] text-gray-400 mb-2">PAGE REFERENCE STRING</div>
                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                        {pageReferences.length === 0 ? (
                            <span className="text-gray-600 text-sm">No pages added yet...</span>
                        ) : (
                            pageReferences.map((page, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className={clsx(
                                        "px-3 py-1 rounded font-mono font-bold border-2 transition-all",
                                        isExecuted && idx === currentStep
                                            ? "bg-cyan-500 border-cyan-400 text-black scale-110 shadow-[0_0_20px_rgba(34,211,238,0.6)]"
                                            : isExecuted && idx < currentStep
                                                ? "bg-cyan-900/50 border-cyan-700 text-cyan-400"
                                                : "bg-cyan-900/30 border-cyan-500 text-cyan-400"
                                    )}
                                >
                                    {page}
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {!isExecuted ? (
                    <div className="flex gap-2">
                        <button
                            onClick={executeAlgorithm}
                            disabled={pageReferences.length === 0}
                            className="flex-1 px-4 py-2 bg-green-900/30 border border-green-500 text-green-400 
                                hover:bg-green-500 hover:text-black transition-all font-bold text-sm
                                flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Play size={16} />
                            EXECUTE
                        </button>
                        <button
                            onClick={removeLastPage}
                            disabled={pageReferences.length === 0}
                            className="px-4 py-2 bg-orange-900/30 border border-orange-500 text-orange-400 
                                hover:bg-orange-500 hover:text-black transition-all font-bold text-sm
                                disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Trash2 size={16} />
                        </button>
                        <button
                            onClick={clearAll}
                            className="px-4 py-2 bg-red-900/30 border border-red-500 text-red-400 
                                hover:bg-red-500 hover:text-black transition-all font-bold text-sm"
                        >
                            <RotateCcw size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <button
                                onClick={togglePlay}
                                className="flex-1 px-4 py-2 bg-purple-900/30 border border-purple-500 text-purple-400 
                                    hover:bg-purple-500 hover:text-black transition-all font-bold text-sm
                                    flex items-center justify-center gap-2"
                            >
                                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                                {isPlaying ? 'PAUSE' : 'PLAY'}
                            </button>
                            <button
                                onClick={nextStep}
                                disabled={currentStep >= allFrameStates.length - 1}
                                className="px-4 py-2 bg-cyan-900/30 border border-cyan-500 text-cyan-400 
                                    hover:bg-cyan-500 hover:text-black transition-all font-bold text-sm
                                    disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <SkipForward size={16} />
                            </button>
                            <button
                                onClick={clearAll}
                                className="px-4 py-2 bg-red-900/30 border border-red-500 text-red-400 
                                    hover:bg-red-500 hover:text-black transition-all font-bold text-sm"
                            >
                                <RotateCcw size={16} />
                            </button>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-gray-400">
                                <span>ANIMATION SPEED</span>
                                <span className="text-cyan-400">{speed}x</span>
                            </div>
                            <input
                                type="range"
                                min="0.5"
                                max="4"
                                step="0.5"
                                value={speed}
                                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-[9px] text-gray-600">
                                <span>0.5x</span>
                                <span>1x</span>
                                <span>2x</span>
                                <span>4x</span>
                            </div>
                        </div>

                        <div className="bg-gray-900/50 border border-gray-700 rounded p-2">
                            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                <span>PROGRESS</span>
                                <span className="text-cyan-400">Step {currentStep + 1} / {allFrameStates.length}</span>
                            </div>
                            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentStep + 1) / allFrameStates.length) * 100}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* THRASHING ALERT */}
            <AnimatePresence>
                {isExecuted && thrashingMetrics.isThrashing && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="bg-red-900/30 border-2 border-red-500 rounded p-4
                            shadow-[0_0_30px_rgba(239,68,68,0.4)]"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <motion.div
                                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                            >
                                <AlertTriangle className="text-red-500" size={32} />
                            </motion.div>
                            <div>
                                <div className="text-xl font-bold text-red-400">
                                    ⚠️ THRASHING DETECTED!
                                </div>
                                <div className="text-sm text-red-300">
                                    System performance degrading - Too many page faults
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="bg-black/30 rounded p-2">
                                <div className="text-gray-400">Fault Rate</div>
                                <div className="text-red-400 font-bold">{faultRate.toFixed(1)}%</div>
                            </div>
                            <div className="bg-black/30 rounded p-2">
                                <div className="text-gray-400">Working Set</div>
                                <div className="text-red-400 font-bold">{workingSetSize} pages</div>
                            </div>
                            <div className="bg-black/30 rounded p-2">
                                <div className="text-gray-400">Available Frames</div>
                                <div className="text-red-400 font-bold">{numFrames} frames</div>
                            </div>
                        </div>

                        <div className="mt-2 text-xs text-yellow-400">
                            💡 Suggestion: Increase frames to {workingSetSize}+ or reduce working set size
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* THRASHING METRICS DASHBOARD */}
            {isExecuted && (
                <div className="grid grid-cols-4 gap-2">
                    <div className={clsx(
                        "rounded p-2 border",
                        faultRate >= faultRateThreshold
                            ? "bg-red-900/20 border-red-700"
                            : "bg-gray-900/50 border-gray-700"
                    )}>
                        <div className="text-[9px] text-gray-400">FAULT RATE</div>
                        <div className={clsx(
                            "text-xl font-mono font-bold",
                            faultRate >= faultRateThreshold ? "text-red-400" : "text-green-400"
                        )}>
                            {faultRate.toFixed(1)}%
                        </div>
                        <div className="w-full bg-gray-800 h-1 rounded mt-1">
                            <div
                                className={clsx(
                                    "h-full rounded transition-all",
                                    faultRate >= faultRateThreshold ? "bg-red-500" : "bg-green-500"
                                )}
                                style={{ width: `${Math.min(faultRate, 100)}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-gray-900/50 border border-gray-700 rounded p-2">
                        <div className="text-[9px] text-gray-400">WORKING SET</div>
                        <div className="text-xl font-mono font-bold text-cyan-400">
                            {workingSetSize}
                        </div>
                        <div className="text-[8px] text-gray-500">
                            {numFrames} frames
                        </div>
                    </div>

                    <div className={clsx(
                        "rounded p-2 border",
                        memoryPressure > 1.5
                            ? "bg-red-900/20 border-red-700"
                            : memoryPressure > 1.0
                                ? "bg-yellow-900/20 border-yellow-700"
                                : "bg-gray-900/50 border-gray-700"
                    )}>
                        <div className="text-[9px] text-gray-400">MEMORY PRESSURE</div>
                        <div className={clsx(
                            "text-xl font-mono font-bold",
                            memoryPressure > 1.5 ? "text-red-400" :
                                memoryPressure > 1.0 ? "text-yellow-400" : "text-green-400"
                        )}>
                            {memoryPressure.toFixed(2)}x
                        </div>
                    </div>

                    <div className={clsx(
                        "rounded p-2 border",
                        currentPFF >= pffThreshold
                            ? "bg-red-900/20 border-red-700"
                            : "bg-gray-900/50 border-gray-700"
                    )}>
                        <div className="text-[9px] text-gray-400">PAGE FAULT FREQ</div>
                        <div className={clsx(
                            "text-xl font-mono font-bold",
                            currentPFF >= pffThreshold ? "text-red-400" : "text-green-400"
                        )}>
                            {currentPFF.toFixed(2)}
                        </div>
                        <div className="text-[8px] text-gray-500">
                            per {workingSetWindow} steps
                        </div>
                    </div>
                </div>
            )}

            {/* GRAPHS SECTION */}
            {/* THRASHING TIMELINE - ENHANCED */}
            {isExecuted && thrashingMetrics.thrashingEvents.length > 0 && (
                <div className="bg-gray-900/50 border border-gray-700 rounded p-4">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <div className="text-[11px] font-bold text-gray-300 mb-1">
                                PAGE ACCESS TIMELINE
                            </div>
                            <div className="text-[9px] text-gray-500">
                                Visual representation of hits and misses across execution steps
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                <span className="text-[10px] text-gray-400">HIT</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                                <span className="text-[10px] text-gray-400">MISS</span>
                            </div>
                            <div className="text-[10px] text-cyan-400 font-mono">
                                {thrashingMetrics.thrashingEvents.slice(0, currentStep + 1).filter(t => t).length} misses / {currentStep + 1} steps
                            </div>
                        </div>
                    </div>

                    {/* Timeline bars */}
                    <div className="relative">
                        <div className="flex gap-1 mb-2">
                            {thrashingMetrics.thrashingEvents.slice(0, currentStep + 1).map((isThrashing, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ scaleY: 0, opacity: 0 }}
                                    animate={{ scaleY: 1, opacity: 1 }}
                                    transition={{ delay: idx * 0.02, duration: 0.2 }}
                                    className="flex-1 relative group"
                                >
                                    <div
                                        className={clsx(
                                            "h-8 rounded-sm transition-all duration-300 relative overflow-hidden",
                                            idx === currentStep && "ring-2 ring-white scale-105 z-10",
                                            isThrashing
                                                ? "bg-gradient-to-t from-red-600 to-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                                                : "bg-gradient-to-t from-green-600 to-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                                        )}
                                    >
                                        {/* Pulse animation for current step */}
                                        {idx === currentStep && (
                                            <motion.div
                                                className={clsx(
                                                    "absolute inset-0",
                                                    isThrashing ? "bg-red-400" : "bg-green-400"
                                                )}
                                                animate={{ opacity: [0.3, 0, 0.3] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            />
                                        )}

                                        {/* Step number for current or thrashing steps */}
                                        {(idx === currentStep || isThrashing) && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-[8px] font-bold text-white drop-shadow-lg">
                                                    {idx}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Tooltip on hover */}
                                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                        <div className={clsx(
                                            "px-2 py-1 rounded text-[9px] font-mono whitespace-nowrap shadow-lg",
                                            isThrashing
                                                ? "bg-red-500 text-white"
                                                : "bg-green-500 text-white"
                                        )}>
                                            Step {idx}: {isThrashing ? '⚠️ Thrashing' : '✓ Normal'}
                                            <div className="text-[8px] opacity-80">
                                                Page: {pageReferences[idx]}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Step markers */}
                        <div className="flex justify-between text-[8px] text-gray-600 px-1">
                            <span>Step 0</span>
                            {currentStep > 5 && (
                                <span className="text-cyan-400">Current: {currentStep}</span>
                            )}
                            <span>Step {allFrameStates.length - 1}</span>
                        </div>
                    </div>

                    {/* Statistics bar */}
                    <div className="mt-3 grid grid-cols-3 gap-2">
                        <div className="bg-black/30 rounded p-2">
                            <div className="text-[8px] text-gray-500 mb-1">THRASHING %</div>
                            <div className="flex items-baseline gap-1">
                                <span className={clsx(
                                    "text-lg font-mono font-bold",
                                    (thrashingMetrics.thrashingEvents.slice(0, currentStep + 1).filter(t => t).length / (currentStep + 1) * 100) > 50
                                        ? "text-red-400"
                                        : "text-green-400"
                                )}>
                                    {((thrashingMetrics.thrashingEvents.slice(0, currentStep + 1).filter(t => t).length / (currentStep + 1)) * 100).toFixed(0)}
                                </span>
                                <span className="text-[10px] text-gray-500">%</span>
                            </div>
                        </div>

                        <div className="bg-black/30 rounded p-2">
                            <div className="text-[8px] text-gray-500 mb-1">LONGEST THRASH</div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-mono font-bold text-orange-400">
                                    {(() => {
                                        let max = 0, current = 0;
                                        thrashingMetrics.thrashingEvents.slice(0, currentStep + 1).forEach(t => {
                                            if (t) {
                                                current++;
                                                max = Math.max(max, current);
                                            } else {
                                                current = 0;
                                            }
                                        });
                                        return max;
                                    })()}
                                </span>
                                <span className="text-[10px] text-gray-500">steps</span>
                            </div>
                        </div>

                        <div className="bg-black/30 rounded p-2">
                            <div className="text-[8px] text-gray-500 mb-1">CURRENT STATE</div>
                            <div className={clsx(
                                "text-[10px] font-bold uppercase flex items-center gap-1",
                                thrashingMetrics.isThrashing ? "text-red-400" : "text-green-400"
                            )}>
                                {thrashingMetrics.isThrashing ? (
                                    <>
                                        <motion.span
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 0.5, repeat: Infinity }}
                                        >
                                            ⚠️
                                        </motion.span>
                                        Thrashing
                                    </>
                                ) : (
                                    <>✓ Normal</>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Statistics */}
            {isExecuted && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-4 gap-2"
                >
                    <div className="bg-gray-900/50 border border-gray-700 rounded p-2 text-center">
                        <div className="text-[9px] text-gray-400">ACCESSES</div>
                        <div className="text-lg font-mono font-bold text-white">{totalAccesses}</div>
                    </div>
                    <div className="bg-green-900/20 border border-green-700 rounded p-2 text-center">
                        <div className="text-[9px] text-gray-400">HITS</div>
                        <div className="text-lg font-mono font-bold text-green-400">{hits}</div>
                    </div>
                    <div className="bg-red-900/20 border border-red-700 rounded p-2 text-center">
                        <div className="text-[9px] text-gray-400">MISSES</div>
                        <div className="text-lg font-mono font-bold text-red-400">{misses}</div>
                    </div>
                    <div className="bg-cyan-900/20 border border-cyan-700 rounded p-2 text-center">
                        <div className="text-[9px] text-gray-400">HIT RATE</div>
                        <div className="text-lg font-mono font-bold text-cyan-400">{hitRate.toFixed(1)}%</div>
                    </div>
                </motion.div>
            )}

            {/* Page Replacement Table */}
            <div className="flex-1 overflow-auto">
                {isExecuted ? (
                    <div className="border border-gray-700 rounded overflow-hidden">
                        <table className="w-full text-xs font-mono">
                            <thead className="bg-gray-900/80 sticky top-0">
                                <tr>
                                    <th className="border border-gray-700 px-2 py-2 text-gray-400 text-[10px]">
                                        FRAME
                                    </th>
                                    {pageReferences.map((page, idx) => (
                                        <th
                                            key={idx}
                                            className={clsx(
                                                "border border-gray-700 px-3 py-2 font-bold transition-all",
                                                idx === currentStep
                                                    ? "bg-cyan-500 text-black"
                                                    : idx < currentStep
                                                        ? "text-cyan-400"
                                                        : "text-gray-600"
                                            )}
                                        >
                                            {page}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: numFrames }).map((_, frameIdx) => (
                                    <tr key={frameIdx}>
                                        <td className="border border-gray-700 px-2 py-2 text-center bg-gray-900/50 text-gray-400 font-bold">
                                            F{frameIdx}
                                        </td>
                                        {visibleStates.map((state, stepIdx) => {
                                            const pageInFrame = state.pages[frameIdx];
                                            const isCurrentStep = stepIdx === currentStep;
                                            return (
                                                <td
                                                    key={stepIdx}
                                                    className={clsx(
                                                        "border border-gray-700 px-3 py-2 text-center font-bold transition-all",
                                                        isCurrentStep && pageInFrame !== null
                                                            ? "bg-cyan-500 text-black scale-110 shadow-[0_0_20px_rgba(34,211,238,0.6)]"
                                                            : pageInFrame !== null
                                                                ? "bg-cyan-900/20 text-cyan-400"
                                                                : "bg-gray-800/30 text-gray-600"
                                                    )}
                                                >
                                                    <AnimatePresence mode="wait">
                                                        {pageInFrame !== null ? (
                                                            <motion.span
                                                                key={`${stepIdx}-${pageInFrame}`}
                                                                initial={{ scale: 0, rotate: -180 }}
                                                                animate={{ scale: 1, rotate: 0 }}
                                                                exit={{ scale: 0, rotate: 180 }}
                                                                transition={{ duration: 0.3 }}
                                                            >
                                                                {pageInFrame}
                                                            </motion.span>
                                                        ) : (
                                                            <span>—</span>
                                                        )}
                                                    </AnimatePresence>
                                                </td>
                                            );
                                        })}
                                        {Array.from({ length: pageReferences.length - visibleStates.length }).map((_, idx) => (
                                            <td
                                                key={`empty-${idx}`}
                                                className="border border-gray-700 px-3 py-2 text-center bg-gray-900/30 text-gray-700"
                                            >
                                                ?
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                <tr className="bg-gray-900/50">
                                    <td className="border border-gray-700 px-2 py-2 text-center text-gray-400 font-bold text-[10px]">
                                        STATUS
                                    </td>
                                    {visibleStates.map((state, idx) => (
                                        <td
                                            key={idx}
                                            className={clsx(
                                                "border border-gray-700 px-3 py-2 text-center font-bold text-[10px] transition-all",
                                                idx === currentStep
                                                    ? state.hit
                                                        ? "bg-green-500 text-black"
                                                        : "bg-red-500 text-black"
                                                    : state.hit
                                                        ? "bg-green-900/30 text-green-400"
                                                        : "bg-red-900/30 text-red-400"
                                            )}
                                        >
                                            {state.hit ? 'HIT' : 'MISS'}
                                        </td>
                                    ))}
                                    {Array.from({ length: pageReferences.length - visibleStates.length }).map((_, idx) => (
                                        <td
                                            key={`empty-status-${idx}`}
                                            className="border border-gray-700 px-3 py-2 text-center bg-gray-900/30 text-gray-700 text-[10px]"
                                        >
                                            ?
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-600 text-sm">
                        {pageReferences.length === 0
                            ? 'Add page references and click EXECUTE to see the animation'
                            : 'Click EXECUTE to start the step-by-step visualization'}
                    </div>
                )}
            </div>
        </div>
    );
}

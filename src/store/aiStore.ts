import { create } from 'zustand';
import { useAllocationStore } from './allocationStore';
import { useSystemStore } from './memoryStore'; // This holds the scheduler state

export type AIStatus = 'IDLE' | 'ANALYZING' | 'RECOMMENDING';

export interface Recommendation {
    id: string;
    algorithm: string; // e.g., 'BEST_FIT', 'ROUND_ROBIN'
    confidence: number; // 0-100
    reasoning: string;
    actionType: 'ALLOCATION' | 'SCHEDULER';
}

export interface AIState {
    status: AIStatus;
    logs: string[];
    recommendation: Recommendation | null;

    // Actions
    analyzeSystem: () => void;
    applyRecommendation: () => void;
    resetAI: () => void;
}

export const useAIStore = create<AIState>((set, get) => ({
    status: 'IDLE',
    logs: ['Aegis AI System v9.0 initialized...', 'Waiting for analysis command...'],
    recommendation: null,

    analyzeSystem: () => {
        set({ status: 'ANALYZING', logs: [...get().logs, 'Initiating deep system scan...', 'Accessing memory blocks...', 'Reading process queues...'] });

        // Simulate analysis delay
        setTimeout(() => {
            const allocState = useAllocationStore.getState();
            const sysState = useSystemStore.getState();

            const logs = [...get().logs];
            let newRecco: Recommendation | null = null;

            // --- HEURISTIC 1: MEMORY FRAGMENTATION ---
            const totalMem = allocState.totalMemory;
            const freeMem = allocState.statsHistory[allocState.statsHistory.length - 1]?.externalFragmentation || 0;
            const largestHole = allocState.statsHistory[allocState.statsHistory.length - 1]?.largestHole || 0;
            const fragPercent = (freeMem / totalMem) * 100;

            // Check if free memory is fragmented (lots of free space, but small holes)
            // If Largest Hole is significantly smaller than Total Free Space, we have fragmentation.
            const isFragmented = freeMem > 0 && (largestHole < freeMem * 0.6);

            logs.push(`ANALYSIS: Memory Free: ${freeMem}KB (${fragPercent.toFixed(1)}%)`);
            logs.push(`ANALYSIS: Largest Hole: ${largestHole}KB`);

            if (isFragmented && fragPercent > 20) {
                logs.push('WARNING: Critical Fragmentation Detected.');
                newRecco = {
                    id: 'rec-frag',
                    algorithm: 'BEST_FIT',
                    confidence: 85 + Math.floor(Math.random() * 10),
                    reasoning: `Detected ${(100 - (largestHole / freeMem) * 100).toFixed(0)}% scatter in free blocks. 'BEST_FIT' will minimize future hole creation.`,
                    actionType: 'ALLOCATION'
                };
            }
            else if (allocState.algorithm !== 'FIRST_FIT' && !isFragmented) {
                // If mostly contiguous, suggest First Fit for speed
                logs.push('ANALYSIS: Memory structure is contiguous.');
                newRecco = {
                    id: 'rec-speed',
                    algorithm: 'FIRST_FIT',
                    confidence: 92,
                    reasoning: "Memory is currently defragmented. Switching to 'FIRST_FIT' will optimize allocation speed by 40%.",
                    actionType: 'ALLOCATION'
                };
            }

            // --- HEURISTIC 2: SCHEDULER LOAD (If no memory issue overrides) ---
            // If we didn't find a critical memory issue, check CPU
            if (!newRecco) {
                const queueLength = sysState.processQueue.filter(p => p.state === 'READY').length;
                const activeAlgo = sysState.schedulerConfig.algorithm;

                logs.push(`ANALYSIS: CPU Queue Depth: ${queueLength}`);

                if (queueLength > 4 && activeAlgo !== 'RR') {
                    newRecco = {
                        id: 'rec-cpu-load',
                        algorithm: 'ROUND_ROBIN',
                        confidence: 88,
                        reasoning: `High concurrency detected (${queueLength} processes). 'ROUND_ROBIN' will prevent starvation.`,
                        actionType: 'SCHEDULER'
                    };
                } else if (queueLength <= 2 && activeAlgo === 'RR') {
                    newRecco = {
                        id: 'rec-cpu-eff',
                        algorithm: 'FCFS',
                        confidence: 75,
                        reasoning: "Low system load. 'FCFS' eliminates context switch overhead.",
                        actionType: 'SCHEDULER'
                    };
                }
            }

            if (newRecco) {
                set({
                    status: 'RECOMMENDING',
                    recommendation: newRecco,
                    logs: [...logs, `CALCULATION COMPLETE. Recommendation generated: ${newRecco.algorithm}`]
                });
            } else {
                set({
                    status: 'IDLE',
                    logs: [...logs, `SYSTEM OPTIMAL. No changes required.`],
                    recommendation: null
                });
            }

        }, 2000); // 2s "Think" time
    },

    applyRecommendation: () => {
        const rec = get().recommendation;
        if (!rec) return;

        set({ logs: [...get().logs, `APPLYING OPTIMIZATION: ${rec.algorithm}...`] });

        if (rec.actionType === 'ALLOCATION') {
            useAllocationStore.getState().setAlgorithm(rec.algorithm as any);
        } else {
            useSystemStore.getState().setSchedulerAlgo(rec.algorithm as any);
        }

        setTimeout(() => {
            set({ status: 'IDLE', recommendation: null, logs: [...get().logs, `OPTIMIZATION SUCCESSFUL.`] });
        }, 1000);
    },

    resetAI: () => set({ status: 'IDLE', logs: [], recommendation: null })
}));

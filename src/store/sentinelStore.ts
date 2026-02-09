import { create } from 'zustand';
import { useAllocationStore } from './allocationStore';

export interface LeakRecord {
    blockId: string;
    pid: number | string;
    size: number;
    detectedAt: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface SentinelState {
    status: 'IDLE' | 'SCANNING' | 'ALERT' | 'PURGING' | 'SAFE';
    leaks: LeakRecord[];
    scannedBlocks: number;
    history: { timestamp: number, memoryLeaked: number }[];

    // Config
    autoFix: boolean;

    // Simulation State (To create leaks)
    // We track which PIDs are considered "Alive" by the OS
    activePids: Set<string | number>;

    // Actions
    toggleAutoFix: () => void;
    registerProcess: (pid: string | number) => void;
    terminateProcessCrash: (pid: string | number) => void; // Simulates crash without dealloc
    scanMemory: () => void;
    purgeLeaks: () => void;
    resetSentinel: () => void;
}

export const useSentinelStore = create<SentinelState>((set, get) => ({
    status: 'SAFE',
    leaks: [],
    scannedBlocks: 0,
    history: [],
    autoFix: false,
    activePids: new Set(),

    toggleAutoFix: () => set(state => ({ autoFix: !state.autoFix })),

    registerProcess: (pid) => set(state => {
        const newSet = new Set(state.activePids);
        newSet.add(pid);
        return { activePids: newSet };
    }),

    terminateProcessCrash: (pid) => set(state => {
        // Remove from activePids BUT do NOT deallocate from memoryStore
        // This makes the existing memory block an "Orphan"
        const newSet = new Set(state.activePids);
        newSet.delete(pid);
        return { activePids: newSet };
    }),

    scanMemory: () => {
        set({ status: 'SCANNING' });

        setTimeout(() => {
            const memStore = useAllocationStore.getState();
            const { activePids, autoFix } = get();
            const currentBlocks = memStore.memoryBlocks;
            const now = Date.now();

            const detectedLeaks: LeakRecord[] = [];
            let totalLeakedBytes = 0;

            currentBlocks.forEach(block => {
                if (block.type === 'PROCESS' && block.pid !== undefined) {
                    // Check if PID is known to be alive
                    // If not in activePids, it's a LEAK (Orphaned Block)
                    if (!activePids.has(block.pid)) {
                        detectedLeaks.push({
                            blockId: block.id,
                            pid: block.pid,
                            size: block.size,
                            detectedAt: now,
                            severity: block.size > 100 ? 'HIGH' : 'MEDIUM' // Mock heuristic
                        });
                        totalLeakedBytes += block.size;
                    }
                    // Self-healing check: Ensure activePids sync? 
                    // No, we assume activePids is the source of truth for Process Table
                }
            });

            // Update State
            set(state => ({
                status: detectedLeaks.length > 0 ? 'ALERT' : 'SAFE',
                leaks: detectedLeaks,
                scannedBlocks: currentBlocks.length,
                history: detectedLeaks.length > 0
                    ? [...state.history, { timestamp: now, memoryLeaked: totalLeakedBytes }].slice(-20)
                    : state.history
            }));

            // Auto Fix
            if (autoFix && detectedLeaks.length > 0) {
                get().purgeLeaks();
            }
        }, 1500); // Scan duration
    },

    purgeLeaks: () => {
        const { leaks } = get();
        if (leaks.length === 0) return;

        set({ status: 'PURGING' });

        // Execute deallocation for each leak
        setTimeout(() => {
            leaks.forEach(leak => {
                useAllocationStore.getState().deallocate(leak.pid);
            });

            set({
                leaks: [],
                status: 'SAFE'
            });
        }, 1000);
    },

    resetSentinel: () => set({
        status: 'SAFE',
        leaks: [],
        history: [],
        activePids: new Set()
    })
}));

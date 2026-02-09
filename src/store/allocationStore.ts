import { create } from 'zustand';

// --- Types ---

export type AllocationAlgo = 'FIRST_FIT' | 'BEST_FIT' | 'WORST_FIT' | 'NEXT_FIT';
export type BlockType = 'PROCESS' | 'HOLE';

export interface MemoryBlock {
    id: string; // Unique ID
    start: number;
    size: number;
    type: BlockType;
    pid?: number | string; // Only for PROCESS
    color?: string; // Only for PROCESS
}

export interface StatsPoint {
    timestamp: number;
    externalFragmentation: number;
    largestHole: number;
    processCount: number;
}

export interface ComparisonResult {
    algorithm: AllocationAlgo;
    success: boolean;
    fragmentation: number; // Size of the hole created (or remaining)
    efficiency: number;
}

export interface AllocationState {
    // Config
    totalMemory: number;
    algorithm: AllocationAlgo;

    // State
    memoryBlocks: MemoryBlock[];
    lastAllocatedIndex: number; // For Next Fit
    logs: string[];
    statsHistory: StatsPoint[];

    // Actions
    setAlgorithm: (algo: AllocationAlgo) => void;
    allocate: (pid: number | string, size: number, color: string) => boolean;
    deallocate: (pid: number | string) => void;
    compact: () => void;
    reset: () => void;
    resetStatsToCurrentState: () => void;

    // Analysis
    compareAlgorithms: (size: number) => ComparisonResult[];
}

// --- Helper: Coalesce Holes ---
const coalesce = (blocks: MemoryBlock[]): MemoryBlock[] => {
    const newBlocks: MemoryBlock[] = [];
    if (blocks.length === 0) return [];

    let current = blocks[0];

    for (let i = 1; i < blocks.length; i++) {
        const next = blocks[i];
        if (current.type === 'HOLE' && next.type === 'HOLE') {
            // Merge
            current = { ...current, size: current.size + next.size };
        } else {
            newBlocks.push(current);
            current = next;
        }
    }
    newBlocks.push(current);

    // Re-calculate starts
    let ptr = 0;
    return newBlocks.map(b => {
        const block = { ...b, start: ptr };
        ptr += b.size;
        return block;
    });
};

const calcStats = (blocks: MemoryBlock[], timestamp: number): StatsPoint => {
    const holes = blocks.filter(b => b.type === 'HOLE');
    const externalFragmentation = holes.reduce((acc, h) => acc + h.size, 0);
    const largestHole = Math.max(...holes.map(h => h.size), 0);
    const processCount = blocks.filter(b => b.type === 'PROCESS').length;
    return { timestamp, externalFragmentation, largestHole, processCount };
};

export const useAllocationStore = create<AllocationState>((set, get) => ({
    totalMemory: 10000, // Fixed total size for simulation (10MB)
    algorithm: 'FIRST_FIT',

    memoryBlocks: [{ id: 'init-hole', start: 0, size: 10000, type: 'HOLE' }],
    lastAllocatedIndex: 0,
    logs: ["Allocation System Initialized."],
    statsHistory: [{ timestamp: 0, externalFragmentation: 10000, largestHole: 10000, processCount: 0 }],

    setAlgorithm: (algo) => set({ algorithm: algo, logs: [...get().logs, `Algorithm switched to ${algo}`] }),

    reset: () => set({
        memoryBlocks: [{ id: 'init-hole', start: 0, size: 10000, type: 'HOLE' }],
        lastAllocatedIndex: 0,
        logs: ["Memory Reset."],
        statsHistory: [{ timestamp: 0, externalFragmentation: 10000, largestHole: 10000, processCount: 0 }]
    }),

    // Reset stats history to current state (used after sample allocation)
    resetStatsToCurrentState: () => {
        const { memoryBlocks } = get();
        const stats = calcStats(memoryBlocks, 1);
        set({
            statsHistory: [stats]
        });
    },

    allocate: (pid, size, color) => {
        const { algorithm, memoryBlocks, lastAllocatedIndex, totalMemory, statsHistory } = get();

        let candidateIndex = -1;
        let minDiff = Infinity; // For Best Fit
        let maxDiff = -1;       // For Worst Fit

        // 1. Find Candidate Block based on Algorithm
        if (algorithm === 'FIRST_FIT') {
            candidateIndex = memoryBlocks.findIndex(b => b.type === 'HOLE' && b.size >= size);
        }
        else if (algorithm === 'BEST_FIT') {
            memoryBlocks.forEach((b, i) => {
                if (b.type === 'HOLE' && b.size >= size) {
                    const diff = b.size - size;
                    if (diff < minDiff) {
                        minDiff = diff;
                        candidateIndex = i;
                    }
                }
            });
        }
        else if (algorithm === 'WORST_FIT') {
            memoryBlocks.forEach((b, i) => {
                if (b.type === 'HOLE' && b.size >= size) {
                    const diff = b.size - size;
                    if (diff > maxDiff) {
                        maxDiff = diff;
                        candidateIndex = i;
                    }
                }
            });
        }
        else if (algorithm === 'NEXT_FIT') {
            let found = -1;
            for (let i = lastAllocatedIndex; i < memoryBlocks.length; i++) {
                if (memoryBlocks[i].type === 'HOLE' && memoryBlocks[i].size >= size) {
                    found = i;
                    break;
                }
            }
            if (found === -1) {
                for (let i = 0; i < lastAllocatedIndex; i++) {
                    if (memoryBlocks[i].type === 'HOLE' && memoryBlocks[i].size >= size) {
                        found = i;
                        break;
                    }
                }
            }
            candidateIndex = found;
        }

        // 2. Perform Allocation
        if (candidateIndex !== -1) {
            const hole = memoryBlocks[candidateIndex];

            const newProcessBlock: MemoryBlock = {
                id: `proc-${pid}-${Date.now()}`,
                start: hole.start,
                size: size,
                type: 'PROCESS',
                pid,
                color
            };

            const remainingSize = hole.size - size;
            let newBlocks = [...memoryBlocks];

            if (remainingSize === 0) {
                // Exact fit
                newBlocks[candidateIndex] = newProcessBlock;
            } else {
                // Split
                const newHole: MemoryBlock = {
                    id: `hole-${Date.now()}`,
                    start: hole.start + size,
                    size: remainingSize,
                    type: 'HOLE'
                };
                newBlocks.splice(candidateIndex, 1, newProcessBlock, newHole);
            }

            const newStats = calcStats(newBlocks, statsHistory.length);

            set({
                memoryBlocks: newBlocks,
                lastAllocatedIndex: candidateIndex,
                statsHistory: [...statsHistory, newStats],
                logs: [`Allocated ${size}KB to PID ${pid} via ${algorithm}`, ...get().logs].slice(0, 50)
            });
            return true;
        } else {
            set({
                logs: [`Failed to allocate ${size}KB to PID ${pid} (Fragmentation)`, ...get().logs].slice(0, 50)
            });
            return false;
        }
    },

    deallocate: (pid) => {
        const { memoryBlocks, statsHistory } = get();
        const newBlocks = memoryBlocks.map(b => {
            if (b.type === 'PROCESS' && b.pid == pid) {
                return { ...b, type: 'HOLE', pid: undefined, color: undefined } as MemoryBlock;
            }
            return b;
        });

        // Coalesce adjacent holes
        const coalesced = coalesce(newBlocks);
        const newStats = calcStats(coalesced, statsHistory.length);

        set({
            memoryBlocks: coalesced,
            statsHistory: [...statsHistory, newStats],
            logs: [`Deallocated PID ${pid}`, ...get().logs].slice(0, 50)
        });
    },

    compact: () => {
        const { memoryBlocks, totalMemory, statsHistory } = get();
        const processes = memoryBlocks.filter(b => b.type === 'PROCESS');
        if (processes.length === memoryBlocks.length) return;

        let currentStart = 0;
        const compactedProcesses = processes.map(b => {
            const block = { ...b, start: currentStart };
            currentStart += b.size;
            return block;
        });

        const bigHole: MemoryBlock = {
            id: `hole-compacted-${Date.now()}`,
            start: currentStart,
            size: totalMemory - currentStart,
            type: 'HOLE'
        };

        const finalBlocks = [...compactedProcesses, bigHole];
        const newStats = calcStats(finalBlocks, statsHistory.length);

        set({
            memoryBlocks: finalBlocks,
            lastAllocatedIndex: 0,
            statsHistory: [...statsHistory, newStats],
            logs: [`Memory Compacted. Free Space: ${bigHole.size}KB`, ...get().logs].slice(0, 50)
        });
    },

    compareAlgorithms: (size) => {
        const { memoryBlocks, lastAllocatedIndex } = get();
        const results: ComparisonResult[] = [];
        const algos: AllocationAlgo[] = ['FIRST_FIT', 'BEST_FIT', 'WORST_FIT', 'NEXT_FIT'];

        algos.forEach(algo => {
            let candidateIndex = -1;
            let minDiff = Infinity;
            let maxDiff = -1;

            if (algo === 'FIRST_FIT') {
                candidateIndex = memoryBlocks.findIndex(b => b.type === 'HOLE' && b.size >= size);
            }
            else if (algo === 'BEST_FIT') {
                memoryBlocks.forEach((b, i) => {
                    if (b.type === 'HOLE' && b.size >= size) {
                        const diff = b.size - size;
                        if (diff < minDiff) { minDiff = diff; candidateIndex = i; }
                    }
                });
            }
            else if (algo === 'WORST_FIT') {
                memoryBlocks.forEach((b, i) => {
                    if (b.type === 'HOLE' && b.size >= size) {
                        const diff = b.size - size;
                        if (diff > maxDiff) { maxDiff = diff; candidateIndex = i; }
                    }
                });
            }
            else if (algo === 'NEXT_FIT') {
                let found = -1;
                for (let i = lastAllocatedIndex; i < memoryBlocks.length; i++) {
                    if (memoryBlocks[i].type === 'HOLE' && memoryBlocks[i].size >= size) { found = i; break; }
                }
                if (found === -1) {
                    for (let i = 0; i < lastAllocatedIndex; i++) {
                        if (memoryBlocks[i].type === 'HOLE' && memoryBlocks[i].size >= size) { found = i; break; }
                    }
                }
                candidateIndex = found;
            }

            if (candidateIndex !== -1) {
                const holeSize = memoryBlocks[candidateIndex].size;
                results.push({
                    algorithm: algo,
                    success: true,
                    fragmentation: holeSize - size, // Remaining space in this hole (if split)
                    efficiency: size / holeSize
                });
            } else {
                results.push({
                    algorithm: algo,
                    success: false,
                    fragmentation: 0,
                    efficiency: 0
                });
            }
        });

        return results;
    }
}));

import { create } from 'zustand';

// --- Types ---

export type ReplacementAlgo = 'FIFO' | 'LRU' | 'Clock' | 'Optimal';
export type SchedulerAlgo = 'FCFS' | 'RR' | 'PRIORITY';
export type ProcessState = 'READY' | 'RUNNING' | 'WAITING' | 'COMPLETED';

export interface Process {
    pid: number;
    arrivalTime: number;
    burstTime: number;
    priority: number;
    size: number; // Memory size in bytes
    color: string;

    // Dynamic State
    remainingTime: number;
    state: ProcessState;
    startTime: number | null;
    completionTime: number | null;
    waitingTime: number;
    turnaroundTime: number;
    memoryPages: number[]; // Pages allocated to this process
}

export interface SchedulerConfig {
    algorithm: SchedulerAlgo;
    timeQuantum: number; // For RR
    speed: number; // Simulation speed multiplier (0.5x - 4x)
    isPaused: boolean;
}

export interface TLBEntry {
    pageNumber: number;
    frameNumber: number;
    lastAccessTime: number;
}

export interface PageTableEntry {
    frameNumber: number;
    valid: boolean;
    accessed: boolean;
    dirty: boolean;
    loadedAt: number;
    lastAccessTime: number;
    pid: number | null; // Track owner
}

export interface SimulationStats {
    hits: number;
    misses: number;
    faults: number;
    accesses: number;
}

export interface Snapshot {
    id: string;
    algorithm: SchedulerAlgo;
    timestamp: number;
    stats: {
        avgWait: number;
        avgTurnaround: number;
        throughput: number;
        cpuUtil: number;
    };
    processCount: number;
}

export interface SystemState {
    // --- Memory State ---
    pageSize: number;
    totalMemory: number;
    tlbSize: number;
    memAlgorithm: ReplacementAlgo;
    ram: (number | null)[]; // Array of Page Numbers
    pageTable: Record<number, PageTableEntry>;
    tlb: TLBEntry[];
    memStats: SimulationStats;
    clockPointer: number;

    // --- Scheduler State ---
    globalClock: number;
    schedulerConfig: SchedulerConfig;
    processQueue: Process[]; // All processes (Ready/Waiting/Running)
    activeProcessId: number | null;
    completedProcesses: Process[];
    ganttHistory: { pid: number | null, startTime: number, endTime: number }[]; // For visualization
    snapshots: Snapshot[];

    // --- System ---
    systemLogs: string[];

    // --- Actions ---
    // Config
    setSchedulerAlgo: (algo: SchedulerAlgo) => void;
    setTimeQuantum: (q: number) => void;
    setSpeed: (s: number) => void;
    togglePause: () => void;
    resetSystem: () => void;
    addLog: (msg: string) => void;
    takeSnapshot: () => void;

    // Process Management
    addProcess: (p: Omit<Process, 'state' | 'remainingTime' | 'startTime' | 'completionTime' | 'waitingTime' | 'turnaroundTime' | 'memoryPages'>) => void;

    // Simulation Step
    tick: () => void;

    // Memory Actions (Internal or Manual)
    accessMemory: (address: number, pid: number) => void;
}


// --- Store Implementation ---

const COLORS = ['#00f2ff', '#ff00ff', '#f0f', '#0f0', '#ff0', '#00f'];

export const useSystemStore = create<SystemState>((set, get) => ({
    // Defaults
    pageSize: 256,
    totalMemory: 4096,
    tlbSize: 4,
    memAlgorithm: 'FIFO',

    ram: new Array(16).fill(null),
    pageTable: {},
    tlb: [],
    memStats: { hits: 0, misses: 0, faults: 0, accesses: 0 },
    clockPointer: 0,

    globalClock: 0,
    schedulerConfig: {
        algorithm: 'FCFS',
        timeQuantum: 2,
        speed: 1,
        isPaused: true
    },
    processQueue: [],
    activeProcessId: null,
    completedProcesses: [],
    ganttHistory: [],
    snapshots: [],
    systemLogs: ["System Initialized."],

    // --- Actions ---

    addLog: (msg) => set((state) => ({
        systemLogs: [`[T=${state.globalClock}] ${msg}`, ...state.systemLogs].slice(0, 50)
    })),

    setSchedulerAlgo: (algo) => set((state) => ({ schedulerConfig: { ...state.schedulerConfig, algorithm: algo } })),
    setTimeQuantum: (q) => set((state) => ({ schedulerConfig: { ...state.schedulerConfig, timeQuantum: q } })),
    setSpeed: (s) => set((state) => ({ schedulerConfig: { ...state.schedulerConfig, speed: s } })),
    togglePause: () => set((state) => ({ schedulerConfig: { ...state.schedulerConfig, isPaused: !state.schedulerConfig.isPaused } })),

    resetSystem: () => {
        set({
            ram: new Array(16).fill(null),
            pageTable: {},
            tlb: [],
            memStats: { hits: 0, misses: 0, faults: 0, accesses: 0 },
            clockPointer: 0,
            globalClock: 0,
            processQueue: [],
            activeProcessId: null,
            completedProcesses: [],
            ganttHistory: [],
            systemLogs: ["System Reset Complete."]
            // Snapshots persist across reset? Usually yes for comparison.
        });
    },

    takeSnapshot: () => {
        const state = get();
        const completed = state.completedProcesses;
        if (completed.length === 0) return;

        const avgWait = completed.reduce((acc, p) => acc + p.waitingTime, 0) / completed.length;
        const avgTurnaround = completed.reduce((acc, p) => acc + p.turnaroundTime, 0) / completed.length;
        const throughput = completed.length / (state.globalClock / 1000); // Processes per second (simulated)? Or just total count

        // Simple throughput: Completed / Total Time
        const tp = completed.length / state.globalClock;

        const newSnapshot: Snapshot = {
            id: Date.now().toString(),
            algorithm: state.schedulerConfig.algorithm,
            timestamp: state.globalClock,
            stats: {
                avgWait,
                avgTurnaround,
                throughput: tp,
                cpuUtil: 0 // TODO calculate properly
            },
            processCount: completed.length
        };

        set(s => ({ snapshots: [...s.snapshots, newSnapshot] }));
        get().addLog(`Snapshot Taken: ${state.schedulerConfig.algorithm}`);
    },

    addProcess: (p) => {
        const newProcess: Process = {
            ...p,
            state: 'READY',
            remainingTime: p.burstTime,
            startTime: null,
            completionTime: null,
            waitingTime: 0,
            turnaroundTime: 0,
            memoryPages: [],
            color: p.color || COLORS[Math.floor(Math.random() * COLORS.length)]
        };
        set((state) => ({ processQueue: [...state.processQueue, newProcess] }));
        get().addLog(`Process ${p.pid} Added (Burst: ${p.burstTime}, Pri: ${p.priority})`);
    },

    tick: () => {
        const state = get();
        if (state.schedulerConfig.isPaused) return;

        const { processQueue, activeProcessId, globalClock, schedulerConfig, ganttHistory } = state;
        let nextQueue = [...processQueue];
        let nextActiveId = activeProcessId;
        let nextGantt = [...ganttHistory];
        const algo = schedulerConfig.algorithm;

        let readyProcesses = nextQueue.filter(p => p.state === 'READY' || p.state === 'RUNNING');

        if (readyProcesses.length === 0) {
            // Idle
            set({ globalClock: globalClock + 1 });
            return;
        }

        // 2. Scheduler Logic to pick Next Process
        let selectedPid: number | null = null;
        let selectedProcess: Process | undefined;

        if (algo === 'FCFS') {
            readyProcesses.sort((a, b) => a.arrivalTime - b.arrivalTime);
            selectedPid = readyProcesses[0].pid;
        }
        else if (algo === 'PRIORITY') {
            readyProcesses.sort((a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime);
            selectedPid = readyProcesses[0].pid;
        }
        else if (algo === 'RR') {
            if (activeProcessId) {
                const currentRunTime = getCurrentRunDuration(nextGantt, activeProcessId, globalClock);
                if (currentRunTime < schedulerConfig.timeQuantum) {
                    selectedPid = activeProcessId;
                } else {
                    const idx = readyProcesses.findIndex(p => p.pid === activeProcessId);
                    const nextIdx = (idx + 1) % readyProcesses.length;
                    selectedPid = readyProcesses[nextIdx].pid;
                }
            } else {
                selectedPid = readyProcesses[0].pid;
            }
        }

        // 3. Process Transition
        if (selectedPid && selectedPid !== activeProcessId) {
            // Context Switch
            if (activeProcessId) {
                const prevIdx = nextQueue.findIndex(p => p.pid === activeProcessId);
                if (prevIdx !== -1 && nextQueue[prevIdx].state === 'RUNNING') {
                    nextQueue[prevIdx].state = 'READY';
                }
            }

            const newIdx = nextQueue.findIndex(p => p.pid === selectedPid);
            if (newIdx !== -1) {
                nextQueue[newIdx].state = 'RUNNING';
                if (nextQueue[newIdx].startTime === null) nextQueue[newIdx].startTime = globalClock;

                // MEMORY SYNC: Allocate Memory (On-Demand Simulation)
                // Try to allocate 'size' amount of memory (e.g., 1 page per 256B)
                // For visual impact, we'll try to allocate 1-2 frames for the running process if not already present.
                const neededPages = Math.ceil(nextQueue[newIdx].size / state.pageSize);
                const currentPages = nextQueue[newIdx].memoryPages;

                if (currentPages.length < neededPages) {
                    // Try to allocate free frames
                    const freeFrames = state.ram.map((p, i) => p === null ? i : -1).filter(i => i !== -1);
                    if (freeFrames.length > 0) {
                        const frameToUse = freeFrames[0];
                        const pageNum = Math.floor(Math.random() * 1000); // Mock logical address

                        // Update RAM
                        const newRam = [...state.ram];
                        newRam[frameToUse] = pageNum;

                        // Update Page Table with PID owner
                        const newPT = { ...state.pageTable };
                        newPT[pageNum] = {
                            frameNumber: frameToUse,
                            valid: true,
                            accessed: true,
                            dirty: false,
                            loadedAt: globalClock,
                            lastAccessTime: Date.now(),
                            pid: selectedPid
                        };

                        // Update Process State type (we need to track this in store mainly)
                        nextQueue[newIdx].memoryPages = [...currentPages, pageNum];

                        set({ ram: newRam, pageTable: newPT });
                        get().addLog(`Allocated Frame ${frameToUse} to PID ${selectedPid}`);
                    } else {
                        // Replacement would happen here (out of scope for this phase's simple sync)
                        get().addLog(`Memory Full! Swapping needed for PID ${selectedPid}`);
                    }
                }
            }

            nextActiveId = selectedPid;
        }

        // 4. Update Gantt
        const lastGantt = nextGantt[nextGantt.length - 1];
        if (lastGantt && lastGantt.pid === nextActiveId) {
            lastGantt.endTime = globalClock + 1;
        } else {
            nextGantt.push({ pid: nextActiveId, startTime: globalClock, endTime: globalClock + 1 });
        }

        // 5. Execute Process
        if (nextActiveId !== null) {
            const idx = nextQueue.findIndex(p => p.pid === nextActiveId);
            if (idx !== -1) {
                nextQueue[idx].remainingTime -= 1;

                // Check Completion
                if (nextQueue[idx].remainingTime <= 0) {
                    nextQueue[idx].state = 'COMPLETED';
                    nextQueue[idx].completionTime = globalClock + 1;
                    nextQueue[idx].turnaroundTime = (globalClock + 1) - nextQueue[idx].arrivalTime;
                    nextQueue[idx].waitingTime = nextQueue[idx].turnaroundTime - nextQueue[idx].burstTime;

                    get().addLog(`PID ${nextActiveId} Completed.`);

                    // Move to completed
                    const completed = nextQueue[idx];
                    set(s => ({ completedProcesses: [...s.completedProcesses, completed] }));
                    nextQueue.splice(idx, 1);

                    nextActiveId = null;
                }
            }
        }

        // 6. Update Waiting Times
        nextQueue.forEach(p => {
            if (p.state === 'READY') {
                p.waitingTime += 1;
            }
        });

        set({
            globalClock: globalClock + 1,
            processQueue: nextQueue,
            activeProcessId: nextActiveId,
            ganttHistory: nextGantt
        });
    },

    accessMemory: (address, pid) => {
        // Wrapper
    }
}));

// Helper
function getCurrentRunDuration(gantt: any[], pid: number, now: number) {
    for (let i = gantt.length - 1; i >= 0; i--) {
        if (gantt[i].pid !== pid) return 0;
        return gantt[i].endTime - gantt[i].startTime;
    }
    return 0;
}

import { create } from 'zustand';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type PageReplacementAlgo = 'FIFO' | 'LRU' | 'Optimal' | 'Clock';
export type TLBReplacementPolicy = 'FIFO' | 'LRU';
export type SimulationMode = 'manual' | 'auto';

/**
 * Page Table Entry - Represents a single page in the page table
 */
export interface PageTableEntry {
    frameNumber: number | null;  // Physical frame number (null if not in memory)
    valid: boolean;               // Valid bit (true if page is in memory)
    referenced: boolean;          // Reference bit (for Clock algorithm)
    dirty: boolean;               // Dirty/Modified bit
    loadedAt: number;             // Timestamp when loaded (for FIFO)
    lastAccessTime: number;       // Last access timestamp (for LRU)
    pid: number | null;           // Process ID that owns this page
}

/**
 * TLB Entry - Translation Lookaside Buffer entry
 */
export interface TLBEntry {
    pageNumber: number;
    frameNumber: number;
    lastAccessTime: number;
    insertionOrder: number;       // For FIFO replacement
}

/**
 * Physical Memory Frame - Represents a frame in physical memory
 */
export interface Frame {
    pageNumber: number | null;    // Logical page number stored in this frame
    pid: number | null;           // Process ID
    loadedAt: number;             // When this frame was allocated
    lastAccessTime: number;       // Last access time (for LRU)
    referenced: boolean;          // Reference bit (for Clock)
}

/**
 * Translation Step - For step-by-step visualization
 */
export interface TranslationStep {
    step: number;
    title: string;
    description: string;
    data: any;
    highlight: string[];          // IDs of elements to highlight
    status: 'pending' | 'active' | 'complete' | 'error';
}

/**
 * Memory Access Result
 */
export interface AccessResult {
    success: boolean;
    physicalAddress: number | null;
    tlbHit: boolean;
    pageFault: boolean;
    replacedPage: number | null;
    steps: TranslationStep[];
}

/**
 * Statistics for tracking performance
 */
export interface PagingStatistics {
    totalAccesses: number;
    pageFaults: number;
    tlbHits: number;
    tlbMisses: number;
    pageFaultRate: number;        // Calculated
    tlbHitRate: number;           // Calculated
    
    // Historical data for charts
    pageFaultHistory: number[];   // Page faults over time
    tlbHitHistory: number[];      // TLB hits over time
    accessHistory: number[];      // Addresses accessed
}

/**
 * Memory Configuration
 */
export interface MemoryConfig {
    logicalAddressSpaceSize: number;  // In bytes (e.g., 65536 for 64KB)
    physicalMemorySize: number;       // In bytes (e.g., 32768 for 32KB)
    pageSize: number;                 // In bytes (e.g., 4096 for 4KB)
    tlbSize: number;                  // Number of TLB entries
    
    // Calculated values
    numPages: number;                 // Total logical pages
    numFrames: number;                // Total physical frames
    offsetBits: number;               // Bits for offset
    pageNumberBits: number;           // Bits for page number
}

/**
 * Simulation Control State
 */
export interface SimulationControl {
    mode: SimulationMode;
    isRunning: boolean;
    speed: number;                    // Simulation speed (0.5x - 4x)
    currentStep: number;
    autoGenerateInterval: number;     // ms between auto accesses
}

// ============================================================================
// STORE STATE & ACTIONS
// ============================================================================

export interface PagingState {
    // Configuration
    config: MemoryConfig;
    replacementAlgo: PageReplacementAlgo;
    tlbPolicy: TLBReplacementPolicy;
    
    // Memory State
    pageTable: Record<number, PageTableEntry>;
    tlb: TLBEntry[];
    frames: Frame[];
    clockPointer: number;             // For Clock algorithm
    
    // Statistics
    stats: PagingStatistics;
    
    // Simulation Control
    simulation: SimulationControl;
    
    // Current Translation State (for visualization)
    currentTranslation: {
        logicalAddress: number | null;
        steps: TranslationStep[];
        currentStep: number;
        result: AccessResult | null;
    };
    
    // Page Fault State
    pageFaultActive: boolean;
    lastPageFault: {
        pageNumber: number;
        replacedPage: number | null;
        timestamp: number;
    } | null;
    
    // System Logs
    logs: string[];
    
    // ========================================================================
    // ACTIONS
    // ========================================================================
    
    // Configuration Actions
    setMemoryConfig: (config: Partial<MemoryConfig>) => void;
    setReplacementAlgo: (algo: PageReplacementAlgo) => void;
    setTLBPolicy: (policy: TLBReplacementPolicy) => void;
    
    // Simulation Control
    setSimulationMode: (mode: SimulationMode) => void;
    toggleSimulation: () => void;
    setSpeed: (speed: number) => void;
    stepSimulation: () => void;
    resetSimulation: () => void;
    
    // Memory Access
    accessMemory: (logicalAddress: number, pid?: number) => AccessResult;
    generateRandomAccess: () => void;
    
    // Translation Visualization
    setCurrentStep: (step: number) => void;
    clearTranslation: () => void;
    
    // Utility
    addLog: (message: string) => void;
    clearLogs: () => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate number of bits needed for offset
 */
function calculateOffsetBits(pageSize: number): number {
    return Math.log2(pageSize);
}

/**
 * Calculate number of bits needed for page number
 */
function calculatePageNumberBits(logicalSize: number, pageSize: number): number {
    const numPages = logicalSize / pageSize;
    return Math.log2(numPages);
}

/**
 * Extract page number from logical address
 */
function extractPageNumber(logicalAddress: number, offsetBits: number): number {
    return logicalAddress >> offsetBits;
}

/**
 * Extract offset from logical address
 */
function extractOffset(logicalAddress: number, offsetBits: number): number {
    return logicalAddress & ((1 << offsetBits) - 1);
}

/**
 * Generate physical address from frame number and offset
 */
function generatePhysicalAddress(frameNumber: number, offset: number, offsetBits: number): number {
    return (frameNumber << offsetBits) | offset;
}

/**
 * Initialize page table with all invalid entries
 */
function initializePageTable(numPages: number): Record<number, PageTableEntry> {
    const pageTable: Record<number, PageTableEntry> = {};
    for (let i = 0; i < numPages; i++) {
        pageTable[i] = {
            frameNumber: null,
            valid: false,
            referenced: false,
            dirty: false,
            loadedAt: 0,
            lastAccessTime: 0,
            pid: null
        };
    }
    return pageTable;
}

/**
 * Initialize physical memory frames
 */
function initializeFrames(numFrames: number): Frame[] {
    return Array.from({ length: numFrames }, () => ({
        pageNumber: null,
        pid: null,
        loadedAt: 0,
        lastAccessTime: 0,
        referenced: false
    }));
}

// ============================================================================
// ZUSTAND STORE
// ============================================================================

export const usePagingStore = create<PagingState>((set, get) => {
    // Default configuration
    const defaultConfig: MemoryConfig = {
        logicalAddressSpaceSize: 65536,  // 64KB
        physicalMemorySize: 32768,        // 32KB
        pageSize: 4096,                   // 4KB
        tlbSize: 4,
        numPages: 16,                     // 64KB / 4KB
        numFrames: 8,                     // 32KB / 4KB
        offsetBits: 12,                   // log2(4096)
        pageNumberBits: 4                 // log2(16)
    };
    
    return {
        // Initial State
        config: defaultConfig,
        replacementAlgo: 'FIFO',
        tlbPolicy: 'FIFO',
        
        pageTable: initializePageTable(defaultConfig.numPages),
        tlb: [],
        frames: initializeFrames(defaultConfig.numFrames),
        clockPointer: 0,
        
        stats: {
            totalAccesses: 0,
            pageFaults: 0,
            tlbHits: 0,
            tlbMisses: 0,
            pageFaultRate: 0,
            tlbHitRate: 0,
            pageFaultHistory: [],
            tlbHitHistory: [],
            accessHistory: []
        },
        
        simulation: {
            mode: 'manual',
            isRunning: false,
            speed: 1,
            currentStep: 0,
            autoGenerateInterval: 1000
        },
        
        currentTranslation: {
            logicalAddress: null,
            steps: [],
            currentStep: 0,
            result: null
        },
        
        pageFaultActive: false,
        lastPageFault: null,
        
        logs: ['Paging system initialized.'],
        
        // ====================================================================
        // ACTION IMPLEMENTATIONS
        // ====================================================================
        
        setMemoryConfig: (newConfig) => {
            const current = get().config;
            const updated = { ...current, ...newConfig };
            
            // Recalculate derived values
            updated.numPages = updated.logicalAddressSpaceSize / updated.pageSize;
            updated.numFrames = updated.physicalMemorySize / updated.pageSize;
            updated.offsetBits = calculateOffsetBits(updated.pageSize);
            updated.pageNumberBits = calculatePageNumberBits(
                updated.logicalAddressSpaceSize,
                updated.pageSize
            );
            
            // Reinitialize memory structures
            set({
                config: updated,
                pageTable: initializePageTable(updated.numPages),
                frames: initializeFrames(updated.numFrames),
                tlb: [],
                clockPointer: 0
            });
            
            get().addLog(`Memory reconfigured: ${updated.numPages} pages, ${updated.numFrames} frames`);
        },
        
        setReplacementAlgo: (algo) => {
            set({ replacementAlgo: algo });
            get().addLog(`Page replacement algorithm: ${algo}`);
        },
        
        setTLBPolicy: (policy) => {
            set({ tlbPolicy: policy });
            get().addLog(`TLB replacement policy: ${policy}`);
        },
        
        setSimulationMode: (mode) => {
            set(state => ({
                simulation: { ...state.simulation, mode }
            }));
        },
        
        toggleSimulation: () => {
            set(state => ({
                simulation: { ...state.simulation, isRunning: !state.simulation.isRunning }
            }));
        },
        
        setSpeed: (speed) => {
            set(state => ({
                simulation: { ...state.simulation, speed }
            }));
        },
        
        stepSimulation: () => {
            get().generateRandomAccess();
        },
        
        resetSimulation: () => {
            const config = get().config;
            set({
                pageTable: initializePageTable(config.numPages),
                frames: initializeFrames(config.numFrames),
                tlb: [],
                clockPointer: 0,
                stats: {
                    totalAccesses: 0,
                    pageFaults: 0,
                    tlbHits: 0,
                    tlbMisses: 0,
                    pageFaultRate: 0,
                    tlbHitRate: 0,
                    pageFaultHistory: [],
                    tlbHitHistory: [],
                    accessHistory: []
                },
                currentTranslation: {
                    logicalAddress: null,
                    steps: [],
                    currentStep: 0,
                    result: null
                },
                pageFaultActive: false,
                lastPageFault: null,
                logs: ['System reset.']
            });
        },
        
        accessMemory: (logicalAddress, pid = 1) => {
            const state = get();
            const { config, pageTable, tlb, frames, replacementAlgo, tlbPolicy } = state;
            
            // Extract page number and offset
            const pageNumber = extractPageNumber(logicalAddress, config.offsetBits);
            const offset = extractOffset(logicalAddress, config.offsetBits);
            
            const steps: TranslationStep[] = [];
            let tlbHit = false;
            let pageFault = false;
            let replacedPage: number | null = null;
            let frameNumber: number | null = null;
            
            // Step 1: Extract page number and offset
            steps.push({
                step: 1,
                title: 'Extract Page Number & Offset',
                description: `Logical Address: ${logicalAddress} (0x${logicalAddress.toString(16).toUpperCase()})`,
                data: {
                    logicalAddress,
                    pageNumber,
                    offset,
                    binary: logicalAddress.toString(2).padStart(config.offsetBits + config.pageNumberBits, '0')
                },
                highlight: ['logical-address'],
                status: 'complete'
            });
            
            // Step 2: Check TLB
            const tlbEntry = tlb.find(entry => entry.pageNumber === pageNumber);
            if (tlbEntry) {
                tlbHit = true;
                frameNumber = tlbEntry.frameNumber;
                
                steps.push({
                    step: 2,
                    title: 'TLB Hit!',
                    description: `Page ${pageNumber} found in TLB → Frame ${frameNumber}`,
                    data: { pageNumber, frameNumber, tlbEntry },
                    highlight: ['tlb'],
                    status: 'complete'
                });
                
                // Update TLB entry for LRU
                if (tlbPolicy === 'LRU') {
                    tlbEntry.lastAccessTime = Date.now();
                }
            } else {
                steps.push({
                    step: 2,
                    title: 'TLB Miss',
                    description: `Page ${pageNumber} not in TLB. Checking page table...`,
                    data: { pageNumber },
                    highlight: ['tlb'],
                    status: 'complete'
                });
            }
            
            // Step 3: Check Page Table (if TLB miss)
            if (!tlbHit) {
                const pageEntry = pageTable[pageNumber];
                
                if (pageEntry && pageEntry.valid) {
                    frameNumber = pageEntry.frameNumber!;
                    
                    steps.push({
                        step: 3,
                        title: 'Page Table Hit',
                        description: `Page ${pageNumber} is valid → Frame ${frameNumber}`,
                        data: { pageNumber, frameNumber, pageEntry },
                        highlight: ['page-table'],
                        status: 'complete'
                    });
                    
                    // Update TLB
                    const newTLB = [...tlb];
                    if (newTLB.length >= config.tlbSize) {
                        // TLB replacement
                        if (tlbPolicy === 'FIFO') {
                            newTLB.shift(); // Remove oldest
                        } else {
                            // LRU: Remove least recently used
                            const lruIndex = newTLB.reduce((minIdx, entry, idx, arr) =>
                                entry.lastAccessTime < arr[minIdx].lastAccessTime ? idx : minIdx, 0);
                            newTLB.splice(lruIndex, 1);
                        }
                    }
                    
                    newTLB.push({
                        pageNumber,
                        frameNumber,
                        lastAccessTime: Date.now(),
                        insertionOrder: state.stats.totalAccesses
                    });
                    
                    set({ tlb: newTLB });
                } else {
                    // Page Fault!
                    pageFault = true;
                    
                    steps.push({
                        step: 3,
                        title: 'Page Fault!',
                        description: `Page ${pageNumber} is not in memory. Loading...`,
                        data: { pageNumber },
                        highlight: ['page-table'],
                        status: 'error'
                    });
                    
                    // Find free frame or select victim
                    let targetFrame = frames.findIndex(f => f.pageNumber === null);
                    
                    if (targetFrame === -1) {
                        // No free frames - need replacement
                        targetFrame = get().selectVictimFrame();
                        const victimPage = frames[targetFrame].pageNumber!;
                        replacedPage = victimPage;
                        
                        // Invalidate victim page in page table
                        if (pageTable[victimPage]) {
                            pageTable[victimPage].valid = false;
                            pageTable[victimPage].frameNumber = null;
                        }
                        
                        // Remove from TLB if present
                        const tlbIndex = tlb.findIndex(e => e.pageNumber === victimPage);
                        if (tlbIndex !== -1) {
                            tlb.splice(tlbIndex, 1);
                        }
                        
                        steps.push({
                            step: 4,
                            title: 'Page Replacement',
                            description: `Replaced page ${victimPage} with page ${pageNumber} using ${replacementAlgo}`,
                            data: { victimPage, newPage: pageNumber, algorithm: replacementAlgo },
                            highlight: ['physical-memory'],
                            status: 'complete'
                        });
                    }
                    
                    // Load page into frame
                    frameNumber = targetFrame;
                    const now = Date.now();
                    
                    frames[targetFrame] = {
                        pageNumber,
                        pid,
                        loadedAt: now,
                        lastAccessTime: now,
                        referenced: true
                    };
                    
                    pageTable[pageNumber] = {
                        frameNumber: targetFrame,
                        valid: true,
                        referenced: true,
                        dirty: false,
                        loadedAt: now,
                        lastAccessTime: now,
                        pid
                    };
                    
                    // Add to TLB
                    const newTLB = [...tlb];
                    if (newTLB.length >= config.tlbSize) {
                        if (tlbPolicy === 'FIFO') {
                            newTLB.shift();
                        } else {
                            const lruIndex = newTLB.reduce((minIdx, entry, idx, arr) =>
                                entry.lastAccessTime < arr[minIdx].lastAccessTime ? idx : minIdx, 0);
                            newTLB.splice(lruIndex, 1);
                        }
                    }
                    
                    newTLB.push({
                        pageNumber,
                        frameNumber: targetFrame,
                        lastAccessTime: now,
                        insertionOrder: state.stats.totalAccesses
                    });
                    
                    set({
                        frames: [...frames],
                        pageTable: { ...pageTable },
                        tlb: newTLB,
                        pageFaultActive: true,
                        lastPageFault: {
                            pageNumber,
                            replacedPage,
                            timestamp: now
                        }
                    });
                    
                    // Clear page fault indicator after animation
                    setTimeout(() => set({ pageFaultActive: false }), 2000);
                }
            }
            
            // Step 4/5: Generate Physical Address
            const physicalAddress = generatePhysicalAddress(frameNumber!, offset, config.offsetBits);
            
            steps.push({
                step: steps.length + 1,
                title: 'Physical Address Generated',
                description: `Frame ${frameNumber} + Offset ${offset} = Physical Address ${physicalAddress}`,
                data: { frameNumber, offset, physicalAddress },
                highlight: ['physical-address'],
                status: 'complete'
            });
            
            // Update statistics
            const newStats = { ...state.stats };
            newStats.totalAccesses++;
            newStats.accessHistory.push(logicalAddress);
            
            if (tlbHit) {
                newStats.tlbHits++;
                newStats.tlbHitHistory.push(1);
            } else {
                newStats.tlbMisses++;
                newStats.tlbHitHistory.push(0);
            }
            
            if (pageFault) {
                newStats.pageFaults++;
                newStats.pageFaultHistory.push(1);
            } else {
                newStats.pageFaultHistory.push(0);
            }
            
            newStats.tlbHitRate = (newStats.tlbHits / newStats.totalAccesses) * 100;
            newStats.pageFaultRate = (newStats.pageFaults / newStats.totalAccesses) * 100;
            
            set({ stats: newStats });
            
            // Update current translation for visualization
            const result: AccessResult = {
                success: true,
                physicalAddress,
                tlbHit,
                pageFault,
                replacedPage,
                steps
            };
            
            set({
                currentTranslation: {
                    logicalAddress,
                    steps,
                    currentStep: 0,
                    result
                }
            });
            
            get().addLog(
                `Access ${logicalAddress}: Page ${pageNumber} → Frame ${frameNumber} ` +
                `(TLB: ${tlbHit ? 'HIT' : 'MISS'}, PF: ${pageFault ? 'YES' : 'NO'})`
            );
            
            return result;
        },
        
        selectVictimFrame: (): number => {
            const { frames, replacementAlgo, clockPointer } = get();
            
            switch (replacementAlgo) {
                case 'FIFO':
                    // Find oldest frame
                    return frames.reduce((oldest, frame, idx, arr) =>
                        frame.loadedAt < arr[oldest].loadedAt ? idx : oldest, 0);
                
                case 'LRU':
                    // Find least recently used
                    return frames.reduce((lru, frame, idx, arr) =>
                        frame.lastAccessTime < arr[lru].lastAccessTime ? idx : lru, 0);
                
                case 'Clock':
                    // Second chance algorithm
                    let pointer = clockPointer;
                    while (true) {
                        if (!frames[pointer].referenced) {
                            set({ clockPointer: (pointer + 1) % frames.length });
                            return pointer;
                        }
                        frames[pointer].referenced = false;
                        pointer = (pointer + 1) % frames.length;
                    }
                
                case 'Optimal':
                    // For now, use FIFO (Optimal requires future knowledge)
                    return frames.reduce((oldest, frame, idx, arr) =>
                        frame.loadedAt < arr[oldest].loadedAt ? idx : oldest, 0);
                
                default:
                    return 0;
            }
        },
        
        generateRandomAccess: () => {
            const { config } = get();
            const maxAddress = config.logicalAddressSpaceSize - 1;
            const randomAddress = Math.floor(Math.random() * maxAddress);
            get().accessMemory(randomAddress);
        },
        
        setCurrentStep: (step) => {
            set(state => ({
                currentTranslation: {
                    ...state.currentTranslation,
                    currentStep: step
                }
            }));
        },
        
        clearTranslation: () => {
            set({
                currentTranslation: {
                    logicalAddress: null,
                    steps: [],
                    currentStep: 0,
                    result: null
                }
            });
        },
        
        addLog: (message) => {
            set(state => ({
                logs: [`[${state.stats.totalAccesses}] ${message}`, ...state.logs].slice(0, 100)
            }));
        },
        
        clearLogs: () => {
            set({ logs: [] });
        }
    };
});

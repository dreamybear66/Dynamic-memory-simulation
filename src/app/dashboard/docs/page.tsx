'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Cpu, HardDrive, Layers, RefreshCw, ChevronRight, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import AllocationAlgorithmsComparison from '@/components/visual/AllocationAlgorithmsComparison';
import FragmentationComparison from '@/components/visual/FragmentationComparison';
import PagingWorkflowDiagram from '@/components/visual/PagingWorkflowDiagram';

interface Section {
    id: string;
    title: string;
    icon: React.ReactNode;
    content: React.ReactNode;
}

const DocSection = ({
    title,
    children,
    isOpen,
    onToggle
}: {
    title: string;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
}) => (
    <div className="border border-cyan-900/50 rounded-lg overflow-hidden glass-panel">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between p-4 bg-charcoal/50 hover:bg-cyan-900/20 transition-colors"
        >
            <span className="text-cyan-400 font-bold tracking-wide">{title}</span>
            {isOpen ? <ChevronDown size={18} className="text-cyan-500" /> : <ChevronRight size={18} className="text-cyan-500" />}
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                >
                    <div className="p-4 space-y-4 text-gray-300 text-sm leading-relaxed">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const CodeBlock = ({ children }: { children: React.ReactNode }) => (
    <pre className="bg-black/50 border border-cyan-900/30 rounded p-3 text-xs font-mono text-cyan-300 overflow-x-auto">
        {children}
    </pre>
);

const Highlight = ({ children, color = 'cyan' }: { children: React.ReactNode; color?: 'cyan' | 'purple' | 'yellow' | 'green' }) => {
    const colorClasses = {
        cyan: 'text-cyan-400 bg-cyan-900/20',
        purple: 'text-purple-400 bg-purple-900/20',
        yellow: 'text-yellow-400 bg-yellow-900/20',
        green: 'text-green-400 bg-green-900/20',
    };
    return <span className={`px-1 rounded font-mono text-xs ${colorClasses[color]}`}>{children}</span>;
};

export default function DocumentationPage() {
    const [openSections, setOpenSections] = useState<string[]>(['overview']);

    const toggleSection = (id: string) => {
        setOpenSections(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    return (
        <div className="min-h-full w-full p-6 flex flex-col gap-6 overflow-y-auto">
            {/* Header */}
            <header className="shrink-0">
                <div className="flex items-center gap-3">
                    <BookOpen size={32} className="text-cyan-400" />
                    <div>
                        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 uppercase tracking-tighter">
                            System Documentation
                        </h1>
                        <div className="text-sm text-gray-500 font-mono">
                            MEMORY MANAGEMENT & SCHEDULING REFERENCE
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation Pills */}
            <div className="flex flex-wrap gap-2 shrink-0">
                {['overview', 'replacement', 'allocation', 'c-code'].map(section => (
                    <button
                        key={section}
                        onClick={() => {
                            if (!openSections.includes(section)) {
                                toggleSection(section);
                            }
                            document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={clsx(
                            "px-3 py-1 text-xs font-mono uppercase border rounded transition-all",
                            openSections.includes(section)
                                ? "border-cyan-500 text-cyan-400 bg-cyan-900/30"
                                : "border-gray-700 text-gray-500 hover:border-cyan-700 hover:text-cyan-500"
                        )}
                    >
                        {section === 'c-code' ? 'C Code' : section}
                    </button>
                ))}
            </div>

            {/* Content Sections */}
            <div className="space-y-4 pb-8">

                {/* Overview Section */}
                <div id="overview">
                    <DocSection
                        title="📖 SYSTEM OVERVIEW"
                        isOpen={openSections.includes('overview')}
                        onToggle={() => toggleSection('overview')}
                    >
                        <h4 className="text-cyan-400 font-bold mb-3">What is This Simulator?</h4>
                        <p>
                            This is a comprehensive, interactive web-based simulator for visualizing and understanding
                            core <Highlight>Operating System</Highlight> memory management concepts. Built with modern
                            web technologies, it provides real-time visualization of how operating systems manage
                            memory resources efficiently.
                        </p>

                        <h4 className="text-cyan-400 font-bold mb-3 mt-6">Core Concepts Implemented</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 border border-purple-900/50 rounded bg-purple-900/10">
                                <h5 className="text-purple-400 font-bold text-xs mb-2">1. VARIABLE PARTITIONING</h5>
                                <p className="text-xs mb-2">
                                    Dynamic memory allocation with 4 algorithms:
                                </p>
                                <ul className="text-xs space-y-1 ml-3">
                                    <li>• <Highlight color="cyan">First Fit</Highlight> - Fast allocation, first suitable hole</li>
                                    <li>• <Highlight color="purple">Best Fit</Highlight> - Minimizes wasted space</li>
                                    <li>• <Highlight color="yellow">Worst Fit</Highlight> - Leaves larger fragments</li>
                                    <li>• <Highlight color="green">Next Fit</Highlight> - Continues from last position</li>
                                </ul>
                            </div>

                            <div className="p-3 border border-cyan-900/50 rounded bg-cyan-900/10">
                                <h5 className="text-cyan-400 font-bold text-xs mb-2">2. FRAGMENTATION ANALYSIS</h5>
                                <p className="text-xs mb-2">
                                    Real-time tracking of memory fragmentation:
                                </p>
                                <ul className="text-xs space-y-1 ml-3">
                                    <li>• <Highlight color="cyan">External</Highlight> - Free space scattered between blocks</li>
                                    <li>• <Highlight color="purple">Internal</Highlight> - Wasted space within blocks</li>
                                    <li>• Live fragmentation over time graph</li>
                                    <li>• Memory compaction simulation</li>
                                </ul>
                            </div>

                            <div className="p-3 border border-yellow-900/50 rounded bg-yellow-900/10">
                                <h5 className="text-yellow-400 font-bold text-xs mb-2">3. PAGING SYSTEM</h5>
                                <p className="text-xs mb-2">
                                    Complete virtual memory implementation:
                                </p>
                                <ul className="text-xs space-y-1 ml-3">
                                    <li>• Page tables with virtual-to-physical mapping</li>
                                    <li>• <Highlight color="yellow">TLB</Highlight> (Translation Lookaside Buffer)</li>
                                    <li>• Page fault handling and tracking</li>
                                    <li>• Working set and thrashing detection</li>
                                </ul>
                            </div>

                            <div className="p-3 border border-green-900/50 rounded bg-green-900/10">
                                <h5 className="text-green-400 font-bold text-xs mb-2">4. PAGE REPLACEMENT</h5>
                                <p className="text-xs mb-2">
                                    4 replacement algorithms implemented:
                                </p>
                                <ul className="text-xs space-y-1 ml-3">
                                    <li>• <Highlight color="cyan">FIFO</Highlight> - First-In, First-Out</li>
                                    <li>• <Highlight color="purple">LRU</Highlight> - Least Recently Used</li>
                                    <li>• <Highlight color="yellow">Optimal</Highlight> - Theoretical best-case</li>
                                    <li>• <Highlight color="green">Clock</Highlight> - Second Chance algorithm</li>
                                </ul>
                            </div>
                        </div>

                        <h4 className="text-cyan-400 font-bold mb-3 mt-6">System Architecture</h4>
                        <div className="p-4 bg-black/30 border border-cyan-900/30 rounded">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div>
                                    <h6 className="text-cyan-400 font-bold mb-2">Frontend</h6>
                                    <ul className="space-y-1 text-gray-400">
                                        <li>• Next.js 16 (React)</li>
                                        <li>• TypeScript</li>
                                        <li>• Tailwind CSS v4</li>
                                        <li>• Framer Motion</li>
                                    </ul>
                                </div>
                                <div>
                                    <h6 className="text-purple-400 font-bold mb-2">State Management</h6>
                                    <ul className="space-y-1 text-gray-400">
                                        <li>• Zustand stores</li>
                                        <li>• Reactive updates</li>
                                        <li>• Real-time metrics</li>
                                        <li>• Algorithm logic</li>
                                    </ul>
                                </div>
                                <div>
                                    <h6 className="text-green-400 font-bold mb-2">Visualization</h6>
                                    <ul className="space-y-1 text-gray-400">
                                        <li>• Custom SVG charts</li>
                                        <li>• Interactive diagrams</li>
                                        <li>• Animated transitions</li>
                                        <li>• Cyberpunk theme</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <h4 className="text-cyan-400 font-bold mb-3 mt-6">Performance Metrics Tracked</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="p-2 bg-cyan-900/10 border border-cyan-500/30 rounded text-center">
                                <div className="text-cyan-400 font-bold text-xs">Memory Utilization</div>
                                <div className="text-[10px] text-gray-400 mt-1">Allocated vs Free %</div>
                            </div>
                            <div className="p-2 bg-purple-900/10 border border-purple-500/30 rounded text-center">
                                <div className="text-purple-400 font-bold text-xs">Fragmentation</div>
                                <div className="text-[10px] text-gray-400 mt-1">External & Internal</div>
                            </div>
                            <div className="p-2 bg-yellow-900/10 border border-yellow-500/30 rounded text-center">
                                <div className="text-yellow-400 font-bold text-xs">Page Fault Rate</div>
                                <div className="text-[10px] text-gray-400 mt-1">Faults per Access</div>
                            </div>
                            <div className="p-2 bg-green-900/10 border border-green-500/30 rounded text-center">
                                <div className="text-green-400 font-bold text-xs">TLB Hit Ratio</div>
                                <div className="text-[10px] text-gray-400 mt-1">Cache Efficiency</div>
                            </div>
                        </div>

                        <div className="mt-6 p-3 border border-cyan-900/50 rounded bg-cyan-900/10">
                            <p className="text-cyan-400 text-xs font-bold mb-2">💡 TIP</p>
                            <p className="text-xs">
                                Use the <Highlight>PAGING SIM</Highlight> tab to experiment with virtual memory and
                                the <Highlight>ALLOCATION</Highlight> tab to explore dynamic memory partitioning.
                                Try different algorithms and observe their performance characteristics!
                            </p>
                        </div>
                    </DocSection>
                </div>

                {/* Page Replacement Section */}
                <div id="replacement">
                    <DocSection
                        title="🔄 PAGE REPLACEMENT ALGORITHMS"
                        isOpen={openSections.includes('replacement')}
                        onToggle={() => toggleSection('replacement')}
                    >
                        <p>
                            When a <Highlight>page fault</Highlight> occurs and no free frames are available,
                            the OS must select a victim page to replace. Different algorithms have different
                            performance characteristics:
                        </p>

                        <div className="space-y-4 mt-4">
                            {/* FIFO */}
                            <div className="p-4 border border-cyan-900/50 rounded bg-black/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 bg-cyan-900/50 text-cyan-400 text-xs font-bold rounded">FIFO</span>
                                    <span className="text-gray-400 text-sm">First-In, First-Out</span>
                                </div>
                                <p className="text-xs mb-2">
                                    <strong>How it works:</strong> Keeps track of all pages in memory in a queue. When a page needs to be replaced, the page at the front of the queue (the oldest page) is selected for removal.
                                </p>
                                <p className="text-xs mb-2 text-gray-400">
                                    <em>Concept:</em> Fair policy that treats all pages equally based on arrival time, regardless of how frequently or recently they were accessed.
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                                    <span className="text-green-400">✓ Simple to implement (queue)</span>
                                    <span className="text-green-400">✓ Low overhead</span>
                                    <span className="text-red-400">✗ Poor performance (high fault rate)</span>
                                    <span className="text-red-400">✗ Suffers from Belady's Anomaly</span>
                                </div>
                            </div>

                            {/* LRU */}
                            <div className="p-4 border border-purple-900/50 rounded bg-black/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 bg-purple-900/50 text-purple-400 text-xs font-bold rounded">LRU</span>
                                    <span className="text-gray-400 text-sm">Least Recently Used</span>
                                </div>
                                <p className="text-xs mb-2">
                                    <strong>How it works:</strong> Replaces the page that has not been used for the longest period of time. Assumes that pages used recently will essentially be used again soon.
                                </p>
                                <p className="text-xs mb-2 text-gray-400">
                                    <em>Concept:</em> Based on <strong>Temporal Locality</strong>. If a program accesses a memory location, it is likely to access it (and nearby locations) again in the near future.
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                                    <span className="text-green-400">✓ Excellent performance generally</span>
                                    <span className="text-green-400">✓ No Belady's Anomaly</span>
                                    <span className="text-red-400">✗ Requires hardware support (counters)</span>
                                    <span className="text-red-400">✗ High overhead to maintain history</span>
                                </div>
                            </div>

                            {/* Optimal */}
                            <div className="p-4 border border-yellow-900/50 rounded bg-black/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 bg-yellow-900/50 text-yellow-400 text-xs font-bold rounded">OPT</span>
                                    <span className="text-gray-400 text-sm">Optimal (Belady's Algorithm)</span>
                                </div>
                                <p className="text-xs mb-2">
                                    <strong>How it works:</strong> Replaces the page that will not be used for the longest period of time in the future. Guarantees the lowest possible page-fault rate for a fixed number of frames.
                                </p>
                                <p className="text-xs mb-2 text-gray-400">
                                    <em>Concept:</em> Since it requires future knowledge of the reference string, it is impossible to implement in a real-time OS. It is used primarily for benchmarking other algorithms.
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                                    <span className="text-green-400">✓ Absolute minimum page faults</span>
                                    <span className="text-green-400">✓ Best possible performance</span>
                                    <span className="text-red-400">✗ Requires future knowledge</span>
                                    <span className="text-red-400">✗ Impossible to implement practically</span>
                                </div>
                            </div>

                            {/* MRU */}
                            <div className="p-4 border border-green-900/50 rounded bg-black/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 bg-green-900/50 text-green-400 text-xs font-bold rounded">MRU</span>
                                    <span className="text-gray-400 text-sm">Most Recently Used</span>
                                </div>
                                <p className="text-xs mb-2">
                                    <strong>How it works:</strong> Replaces the page that was most recently accessed. This is the exact opposite of LRU.
                                </p>
                                <p className="text-xs mb-2 text-gray-400">
                                    <em>Concept:</em> Useful for patterns where data is accessed cyclically (e.g., repeatedly scanning a file larger than memory). In such cases, the most recently used page is the one that will not be needed for the longest time (until the loop restarts).
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                                    <span className="text-green-400">✓ Good for cyclic access patterns</span>
                                    <span className="text-green-400">✓ Simple to implement</span>
                                    <span className="text-red-400">✗ Poor for standard locality</span>
                                    <span className="text-red-400">✗ Counter-intuitive for most apps</span>
                                </div>
                            </div>
                        </div>
                    </DocSection>
                </div>

                {/* Memory Allocation Section */}
                <div id="allocation">
                    <DocSection
                        title="📦 MEMORY ALLOCATION STRATEGIES"
                        isOpen={openSections.includes('allocation')}
                        onToggle={() => toggleSection('allocation')}
                    >
                        <p>
                            <Highlight>Variable Partitioning</Highlight> allows processes to be allocated
                            exactly as much memory as they need. When a process requests memory, the OS
                            must choose which free block (hole) to allocate. Different strategies exist:
                        </p>

                        <div className="space-y-4 mt-4">
                            {/* First Fit */}
                            <div className="p-4 border border-cyan-900/50 rounded bg-black/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 bg-cyan-900/50 text-cyan-400 text-xs font-bold rounded">FIRST FIT</span>
                                </div>
                                <p className="text-xs mb-2">
                                    Allocates the <strong>first hole</strong> that is big enough. Scans memory from
                                    the beginning and stops at the first suitable block.
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                                    <span className="text-green-400">✓ Fast allocation</span>
                                    <span className="text-green-400">✓ Simple to implement</span>
                                    <span className="text-red-400">✗ May fragment beginning of memory</span>
                                    <span className="text-yellow-400">○ Generally good performance</span>
                                </div>
                            </div>

                            {/* Best Fit */}
                            <div className="p-4 border border-purple-900/50 rounded bg-black/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 bg-purple-900/50 text-purple-400 text-xs font-bold rounded">BEST FIT</span>
                                </div>
                                <p className="text-xs mb-2">
                                    Allocates the <strong>smallest hole</strong> that is big enough. Must search
                                    entire memory to find the optimal fit.
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                                    <span className="text-green-400">✓ Minimizes wasted space per allocation</span>
                                    <span className="text-green-400">✓ Leaves larger holes available</span>
                                    <span className="text-red-400">✗ Slower - must scan all holes</span>
                                    <span className="text-red-400">✗ Creates many tiny unusable fragments</span>
                                </div>
                            </div>

                            {/* Worst Fit */}
                            <div className="p-4 border border-yellow-900/50 rounded bg-black/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 bg-yellow-900/50 text-yellow-400 text-xs font-bold rounded">WORST FIT</span>
                                </div>
                                <p className="text-xs mb-2">
                                    Allocates the <strong>largest hole</strong> available. The idea is to leave
                                    behind fragments large enough to be useful.
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                                    <span className="text-green-400">✓ Leaves larger leftover fragments</span>
                                    <span className="text-red-400">✗ Slowest - must scan all holes</span>
                                    <span className="text-red-400">✗ Breaks up large blocks quickly</span>
                                    <span className="text-red-400">✗ Generally worst performance</span>
                                </div>
                            </div>

                            {/* Next Fit */}
                            <div className="p-4 border border-green-900/50 rounded bg-black/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 bg-green-900/50 text-green-400 text-xs font-bold rounded">NEXT FIT</span>
                                </div>
                                <p className="text-xs mb-2">
                                    Like First Fit, but starts searching from <strong>where the last allocation ended</strong>
                                    instead of from the beginning.
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                                    <span className="text-green-400">✓ Faster than First Fit in many cases</span>
                                    <span className="text-green-400">✓ Distributes allocations more evenly</span>
                                    <span className="text-yellow-400">○ Similar fragmentation to First Fit</span>
                                </div>
                            </div>
                        </div>

                        <h4 className="text-cyan-400 font-bold mb-4 mt-6">Allocation Algorithms Visual Comparison</h4>
                        <AllocationAlgorithmsComparison />

                        <h4 className="text-cyan-400 font-bold mb-4 mt-6">External vs Internal Fragmentation</h4>
                        <FragmentationComparison />
                    </DocSection>
                </div>

                {/* C Code Section */}
                <div id="c-code">
                    <DocSection
                        title="💻 C CODE IMPLEMENTATIONS"
                        isOpen={openSections.includes('c-code')}
                        onToggle={() => toggleSection('c-code')}
                    >
                        <h4 className="text-cyan-400 font-bold mb-3">Memory Allocation Algorithms</h4>

                        {/* First Fit C Code */}
                        <div className="mb-6">
                            <h5 className="text-purple-400 font-bold text-sm mb-2">First Fit Algorithm</h5>
                            <CodeBlock>{`// First Fit Memory Allocation
int firstFit(int blockSize[], int m, int processSize[], int n) {
    int allocation[n];
    
    // Initialize all allocations as -1 (not allocated)
    for (int i = 0; i < n; i++)
        allocation[i] = -1;
    
    // Pick each process and find suitable block
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            if (blockSize[j] >= processSize[i]) {
                // Allocate block j to process i
                allocation[i] = j;
                blockSize[j] -= processSize[i];
                break;  // Stop at first fit
            }
        }
    }
    
    return 0;
}`}</CodeBlock>
                        </div>

                        {/* Best Fit C Code */}
                        <div className="mb-6">
                            <h5 className="text-purple-400 font-bold text-sm mb-2">Best Fit Algorithm</h5>
                            <CodeBlock>{`// Best Fit Memory Allocation
int bestFit(int blockSize[], int m, int processSize[], int n) {
    int allocation[n];
    
    for (int i = 0; i < n; i++)
        allocation[i] = -1;
    
    for (int i = 0; i < n; i++) {
        int bestIdx = -1;
        for (int j = 0; j < m; j++) {
            if (blockSize[j] >= processSize[i]) {
                if (bestIdx == -1 || blockSize[bestIdx] > blockSize[j])
                    bestIdx = j;
            }
        }
        
        // If we found a block, allocate it
        if (bestIdx != -1) {
            allocation[i] = bestIdx;
            blockSize[bestIdx] -= processSize[i];
        }
    }
    
    return 0;
}`}</CodeBlock>
                        </div>

                        {/* Worst Fit C Code */}
                        <div className="mb-6">
                            <h5 className="text-purple-400 font-bold text-sm mb-2">Worst Fit Algorithm</h5>
                            <CodeBlock>{`// Worst Fit Memory Allocation
int worstFit(int blockSize[], int m, int processSize[], int n) {
    int allocation[n];
    
    for (int i = 0; i < n; i++)
        allocation[i] = -1;
    
    for (int i = 0; i < n; i++) {
        int worstIdx = -1;
        for (int j = 0; j < m; j++) {
            if (blockSize[j] >= processSize[i]) {
                if (worstIdx == -1 || blockSize[worstIdx] < blockSize[j])
                    worstIdx = j;
            }
        }
        
        // Allocate largest block
        if (worstIdx != -1) {
            allocation[i] = worstIdx;
            blockSize[worstIdx] -= processSize[i];
        }
    }
    
    return 0;
}`}</CodeBlock>
                        </div>

                        {/* Next Fit C Code */}
                        <div className="mb-6">
                            <h5 className="text-purple-400 font-bold text-sm mb-2">Next Fit Algorithm</h5>
                            <CodeBlock>{`// Next Fit Memory Allocation
int nextFit(int blockSize[], int m, int processSize[], int n) {
    int allocation[n];
    int j = 0;  // Start from beginning
    
    for (int i = 0; i < n; i++)
        allocation[i] = -1;
    
    for (int i = 0; i < n; i++) {
        int count = 0;
        // Search from last position
        while (count < m) {
            if (blockSize[j] >= processSize[i]) {
                allocation[i] = j;
                blockSize[j] -= processSize[i];
                break;
            }
            j = (j + 1) % m;  // Circular search
            count++;
        }
    }
    
    return 0;
}`}</CodeBlock>
                        </div>

                        <h4 className="text-cyan-400 font-bold mb-3 mt-8">Page Replacement Algorithms</h4>

                        {/* FIFO Page Replacement */}
                        <div className="mb-6">
                            <h5 className="text-purple-400 font-bold text-sm mb-2">FIFO Page Replacement</h5>
                            <CodeBlock>{`// FIFO Page Replacement
int fifoPageReplacement(int pages[], int n, int capacity) {
    int frame[capacity];
    int front = 0;
    int pageFaults = 0;
    int count = 0;
    
    for (int i = 0; i < capacity; i++)
        frame[i] = -1;
    
    for (int i = 0; i < n; i++) {
        int found = 0;
        
        // Check if page already in frame
        for (int j = 0; j < capacity; j++) {
            if (frame[j] == pages[i]) {
                found = 1;
                break;
            }
        }
        
        if (!found) {
            if (count < capacity) {
                frame[count++] = pages[i];
            } else {
                frame[front] = pages[i];
                front = (front + 1) % capacity;
            }
            pageFaults++;
        }
    }
    
    return pageFaults;
}`}</CodeBlock>
                        </div>

                        {/* LRU Page Replacement */}
                        <div className="mb-6">
                            <h5 className="text-purple-400 font-bold text-sm mb-2">LRU Page Replacement</h5>
                            <CodeBlock>{`// LRU Page Replacement
int lruPageReplacement(int pages[], int n, int capacity) {
    int frame[capacity];
    int time[capacity];
    int pageFaults = 0;
    int count = 0;
    
    for (int i = 0; i < capacity; i++) {
        frame[i] = -1;
        time[i] = 0;
    }
    
    for (int i = 0; i < n; i++) {
        int found = 0;
        
        // Check if page in frame
        for (int j = 0; j < capacity; j++) {
            if (frame[j] == pages[i]) {
                found = 1;
                time[j] = i;  // Update access time
                break;
            }
        }
        
        if (!found) {
            if (count < capacity) {
                frame[count] = pages[i];
                time[count] = i;
                count++;
            } else {
                // Find LRU page
                int lru = 0;
                for (int j = 1; j < capacity; j++) {
                    if (time[j] < time[lru])
                        lru = j;
                }
                frame[lru] = pages[i];
                time[lru] = i;
            }
            pageFaults++;
        }
    }
    
    return pageFaults;
}`}</CodeBlock>
                        </div>

                        {/* Optimal Page Replacement */}
                        <div className="mb-6">
                            <h5 className="text-purple-400 font-bold text-sm mb-2">Optimal Page Replacement</h5>
                            <CodeBlock>{`// Optimal Page Replacement
int optimalPageReplacement(int pages[], int n, int capacity) {
    int frame[capacity];
    int pageFaults = 0;
    int count = 0;
    
    for (int i = 0; i < capacity; i++)
        frame[i] = -1;
    
    for (int i = 0; i < n; i++) {
        int found = 0;
        
        for (int j = 0; j < capacity; j++) {
            if (frame[j] == pages[i]) {
                found = 1;
                break;
            }
        }
        
        if (!found) {
            if (count < capacity) {
                frame[count++] = pages[i];
            } else {
                // Find page used farthest in future
                int farthest = i + 1;
                int replaceIdx = 0;
                
                for (int j = 0; j < capacity; j++) {
                    int k;
                    for (k = i + 1; k < n; k++) {
                        if (frame[j] == pages[k]) {
                            if (k > farthest) {
                                farthest = k;
                                replaceIdx = j;
                            }
                            break;
                        }
                    }
                    if (k == n) {  // Page not used again
                        replaceIdx = j;
                        break;
                    }
                }
                frame[replaceIdx] = pages[i];
            }
            pageFaults++;
        }
    }
    
    return pageFaults;
}`}</CodeBlock>
                        </div>

                        {/* MRU Page Replacement */}
                        <div className="mb-6">
                            <h5 className="text-purple-400 font-bold text-sm mb-2">MRU (Most Recently Used) Algorithm</h5>
                            <CodeBlock>{`// MRU Page Replacement
int mruPageReplacement(int pages[], int n, int capacity) {
    int frame[capacity];
    int time[capacity];
    int pageFaults = 0;
    int count = 0;
    
    for (int i = 0; i < capacity; i++) {
        frame[i] = -1;
        time[i] = 0;
    }
    
    for (int i = 0; i < n; i++) {
        int found = 0;
        
        // Check if page in frame
        for (int j = 0; j < capacity; j++) {
            if (frame[j] == pages[i]) {
                found = 1;
                time[j] = i;  // Update access time
                break;
            }
        }
        
        if (!found) {
            if (count < capacity) {
                frame[count] = pages[i];
                time[count] = i;
                count++;
            } else {
                // Find MRU page (most recently used)
                int mru = 0;
                for (int j = 1; j < capacity; j++) {
                    if (time[j] > time[mru])
                        mru = j;
                }
                frame[mru] = pages[i];
                time[mru] = i;
            }
            pageFaults++;
        }
    }
    
    return pageFaults;
}`}</CodeBlock>
                        </div>
                    </DocSection>
                </div>

            </div>
        </div>
    );
}


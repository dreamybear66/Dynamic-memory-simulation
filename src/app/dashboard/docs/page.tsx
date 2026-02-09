'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Cpu, HardDrive, Layers, RefreshCw, ChevronRight, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

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
                {['overview', 'paging', 'replacement', 'allocation', 'scheduling'].map(section => (
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
                        {section}
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
                        <p>
                            This simulator demonstrates core <Highlight>Operating System</Highlight> concepts
                            related to memory management and process scheduling. It provides an interactive
                            visualization of how modern operating systems handle:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><Highlight color="purple">Virtual Memory</Highlight> - Abstracting physical memory through paging</li>
                            <li><Highlight color="purple">Page Replacement</Highlight> - Handling page faults efficiently</li>
                            <li><Highlight color="purple">Dynamic Allocation</Highlight> - Variable partition memory management</li>
                            <li><Highlight color="purple">Process Scheduling</Highlight> - CPU time distribution algorithms</li>
                        </ul>
                        <div className="mt-4 p-3 border border-cyan-900/50 rounded bg-cyan-900/10">
                            <p className="text-cyan-400 text-xs font-bold mb-2">💡 TIP</p>
                            <p className="text-xs">
                                Use the <Highlight>PAGING SIM</Highlight> tab to experiment with virtual memory and
                                the <Highlight>ALLOCATION</Highlight> tab to explore dynamic memory partitioning.
                            </p>
                        </div>
                    </DocSection>
                </div>

                {/* Paging Section */}
                <div id="paging">
                    <DocSection
                        title="📄 VIRTUAL MEMORY & PAGING"
                        isOpen={openSections.includes('paging')}
                        onToggle={() => toggleSection('paging')}
                    >
                        <h4 className="text-cyan-400 font-bold mb-2">What is Paging?</h4>
                        <p>
                            <Highlight>Paging</Highlight> is a memory management scheme that eliminates the need
                            for contiguous allocation of physical memory. It divides:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                            <li><strong>Logical Memory</strong> → Fixed-size blocks called <Highlight color="purple">Pages</Highlight></li>
                            <li><strong>Physical Memory</strong> → Fixed-size blocks called <Highlight color="purple">Frames</Highlight></li>
                        </ul>

                        <h4 className="text-cyan-400 font-bold mb-2 mt-6">Key Concepts</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 border border-purple-900/50 rounded bg-purple-900/10">
                                <h5 className="text-purple-400 font-bold text-xs mb-2">PAGE TABLE</h5>
                                <p className="text-xs">
                                    Maps virtual page numbers to physical frame numbers. Each process
                                    has its own page table maintained by the OS.
                                </p>
                            </div>
                            <div className="p-3 border border-purple-900/50 rounded bg-purple-900/10">
                                <h5 className="text-purple-400 font-bold text-xs mb-2">PAGE FAULT</h5>
                                <p className="text-xs">
                                    Occurs when a process accesses a page not currently in physical memory.
                                    The OS must load the page from disk.
                                </p>
                            </div>
                            <div className="p-3 border border-purple-900/50 rounded bg-purple-900/10">
                                <h5 className="text-purple-400 font-bold text-xs mb-2">TLB (Translation Lookaside Buffer)</h5>
                                <p className="text-xs">
                                    A hardware cache that stores recent page table entries for
                                    faster address translation.
                                </p>
                            </div>
                            <div className="p-3 border border-purple-900/50 rounded bg-purple-900/10">
                                <h5 className="text-purple-400 font-bold text-xs mb-2">DEMAND PAGING</h5>
                                <p className="text-xs">
                                    Pages are loaded into memory only when needed, not all at once.
                                    This conserves memory and speeds up process startup.
                                </p>
                            </div>
                        </div>

                        <h4 className="text-cyan-400 font-bold mb-2 mt-6">Address Translation</h4>
                        <CodeBlock>{`Logical Address = Page Number + Page Offset
Physical Address = Frame Number + Page Offset

Example (Page Size = 256 bytes):
Logical Address: 1025
Page Number:     1025 / 256 = 4
Offset:          1025 % 256 = 1
Physical Frame:  Page Table[4] → Frame 7
Physical Addr:   7 × 256 + 1 = 1793`}</CodeBlock>
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
                                    Replaces the <strong>oldest page</strong> in memory. Simple to implement using a queue.
                                </p>
                                <div className="flex gap-4 text-xs">
                                    <span className="text-green-400">✓ Simple implementation</span>
                                    <span className="text-red-400">✗ Suffers from Belady's Anomaly</span>
                                </div>
                                <CodeBlock>{`Queue: [Page1, Page2, Page3]
New Page4 arrives → Evict Page1
Queue: [Page2, Page3, Page4]`}</CodeBlock>
                            </div>

                            {/* LRU */}
                            <div className="p-4 border border-purple-900/50 rounded bg-black/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 bg-purple-900/50 text-purple-400 text-xs font-bold rounded">LRU</span>
                                    <span className="text-gray-400 text-sm">Least Recently Used</span>
                                </div>
                                <p className="text-xs mb-2">
                                    Replaces the page that has <strong>not been used for the longest time</strong>.
                                    Based on temporal locality principle.
                                </p>
                                <div className="flex gap-4 text-xs">
                                    <span className="text-green-400">✓ Good performance</span>
                                    <span className="text-red-400">✗ Expensive to implement perfectly</span>
                                </div>
                                <CodeBlock>{`Access History: [P3, P1, P2, P1, P3]
Most Recent: P3 → Least Recent: P2
On fault → Evict P2`}</CodeBlock>
                            </div>

                            {/* Optimal */}
                            <div className="p-4 border border-yellow-900/50 rounded bg-black/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 bg-yellow-900/50 text-yellow-400 text-xs font-bold rounded">OPT</span>
                                    <span className="text-gray-400 text-sm">Optimal (Belady's Algorithm)</span>
                                </div>
                                <p className="text-xs mb-2">
                                    Replaces the page that <strong>will not be used for the longest time</strong> in future.
                                    Theoretically optimal but impossible to implement in practice.
                                </p>
                                <div className="flex gap-4 text-xs">
                                    <span className="text-green-400">✓ Minimum page faults</span>
                                    <span className="text-red-400">✗ Requires future knowledge</span>
                                </div>
                            </div>

                            {/* Clock */}
                            <div className="p-4 border border-green-900/50 rounded bg-black/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 bg-green-900/50 text-green-400 text-xs font-bold rounded">CLOCK</span>
                                    <span className="text-gray-400 text-sm">Second Chance Algorithm</span>
                                </div>
                                <p className="text-xs mb-2">
                                    Approximates LRU using a circular buffer with <strong>reference bits</strong>.
                                    Gives each page a "second chance" before eviction.
                                </p>
                                <div className="flex gap-4 text-xs">
                                    <span className="text-green-400">✓ Efficient implementation</span>
                                    <span className="text-green-400">✓ Good LRU approximation</span>
                                </div>
                                <CodeBlock>{`Circular Buffer with Reference Bits:
[P1:1] → [P2:0] → [P3:1] → [P4:0]
          ↑ clock hand
If ref=1: clear bit, move on
If ref=0: evict this page`}</CodeBlock>
                            </div>
                        </div>

                        <div className="mt-4 p-3 border border-yellow-900/50 rounded bg-yellow-900/10">
                            <p className="text-yellow-400 text-xs font-bold mb-2">⚠️ BELADY'S ANOMALY</p>
                            <p className="text-xs">
                                Counter-intuitively, FIFO can have <strong>more page faults</strong> with more frames!
                                This phenomenon doesn't occur with LRU or Optimal algorithms.
                            </p>
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
                                <CodeBlock>{`Memory: [100KB free] [200KB used] [300KB free] [150KB free]
Request: 120KB
Result: Allocate from 300KB block (first fit found)
After:  [100KB free] [200KB used] [120KB used][180KB free] [150KB free]`}</CodeBlock>
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
                                <CodeBlock>{`Memory: [100KB free] [200KB used] [300KB free] [150KB free]
Request: 120KB
Scan all: 100KB (too small), 300KB (fit), 150KB (better fit!)
Result: Allocate from 150KB block (smallest fit)
After:  [100KB free] [200KB used] [300KB free] [120KB used][30KB free]`}</CodeBlock>
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
                                <CodeBlock>{`Memory: [100KB free] [200KB used] [300KB free] [150KB free]
Request: 120KB
Find largest: 300KB
Result: Allocate from 300KB block (largest hole)
After:  [100KB free] [200KB used] [120KB used][180KB free] [150KB free]`}</CodeBlock>
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

                        <h4 className="text-cyan-400 font-bold mb-2 mt-6">External vs Internal Fragmentation</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 border border-red-900/50 rounded bg-red-900/10">
                                <h5 className="text-red-400 font-bold text-xs mb-2">EXTERNAL FRAGMENTATION</h5>
                                <p className="text-xs">
                                    Total free memory exists but is scattered in small non-contiguous blocks.
                                    A request may fail even though enough total memory is free.
                                </p>
                                <p className="text-xs mt-2 text-gray-400">
                                    Solution: <Highlight color="green">Compaction</Highlight> or <Highlight color="green">Paging</Highlight>
                                </p>
                            </div>
                            <div className="p-3 border border-orange-900/50 rounded bg-orange-900/10">
                                <h5 className="text-orange-400 font-bold text-xs mb-2">INTERNAL FRAGMENTATION</h5>
                                <p className="text-xs">
                                    Memory allocated to a process is slightly larger than requested.
                                    The unused portion within the allocated block is wasted.
                                </p>
                                <p className="text-xs mt-2 text-gray-400">
                                    Common with <Highlight color="yellow">fixed partitioning</Highlight> and <Highlight color="yellow">paging</Highlight>
                                </p>
                            </div>
                        </div>
                    </DocSection>
                </div>

                {/* Scheduling Section */}
                <div id="scheduling">
                    <DocSection
                        title="⏱️ CPU SCHEDULING ALGORITHMS"
                        isOpen={openSections.includes('scheduling')}
                        onToggle={() => toggleSection('scheduling')}
                    >
                        <p>
                            <Highlight>CPU Scheduling</Highlight> determines which process runs on the CPU at any given time.
                            The goal is to maximize CPU utilization and provide fair access to all processes.
                        </p>

                        <div className="space-y-4 mt-4">
                            {/* FCFS */}
                            <div className="p-4 border border-cyan-900/50 rounded bg-black/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 bg-cyan-900/50 text-cyan-400 text-xs font-bold rounded">FCFS</span>
                                    <span className="text-gray-400 text-sm">First-Come, First-Served</span>
                                </div>
                                <p className="text-xs mb-2">
                                    Processes are executed in the <strong>order they arrive</strong>. Non-preemptive.
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                                    <span className="text-green-400">✓ Simple and fair</span>
                                    <span className="text-green-400">✓ No starvation</span>
                                    <span className="text-red-400">✗ Convoy effect (short waits for long)</span>
                                    <span className="text-red-400">✗ Poor average waiting time</span>
                                </div>
                            </div>

                            {/* Round Robin */}
                            <div className="p-4 border border-purple-900/50 rounded bg-black/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 bg-purple-900/50 text-purple-400 text-xs font-bold rounded">RR</span>
                                    <span className="text-gray-400 text-sm">Round Robin</span>
                                </div>
                                <p className="text-xs mb-2">
                                    Each process gets a fixed <Highlight color="yellow">time quantum</Highlight>.
                                    After the quantum expires, the process is preempted and added to the end of the ready queue.
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                                    <span className="text-green-400">✓ Fair time distribution</span>
                                    <span className="text-green-400">✓ Good for time-sharing systems</span>
                                    <span className="text-yellow-400">○ Performance depends on quantum size</span>
                                    <span className="text-red-400">✗ Context switch overhead</span>
                                </div>
                                <CodeBlock>{`Time Quantum = 4 units
P1(10) → P2(5) → P3(8)

Timeline:
[0-4: P1] → [4-8: P2] → [8-12: P3] → [12-16: P1] → 
[16-17: P2 done] → [17-21: P3] → [21-23: P1 done] → [23-24: P3 done]`}</CodeBlock>
                            </div>

                            {/* Priority */}
                            <div className="p-4 border border-yellow-900/50 rounded bg-black/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 bg-yellow-900/50 text-yellow-400 text-xs font-bold rounded">PRIORITY</span>
                                </div>
                                <p className="text-xs mb-2">
                                    Processes with <strong>higher priority</strong> are executed first.
                                    Can be preemptive or non-preemptive.
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                                    <span className="text-green-400">✓ Important processes run first</span>
                                    <span className="text-green-400">✓ Flexible priority assignment</span>
                                    <span className="text-red-400">✗ Starvation of low-priority processes</span>
                                    <span className="text-yellow-400">○ Solution: Aging (increase priority over time)</span>
                                </div>
                            </div>

                            {/* SJF */}
                            <div className="p-4 border border-green-900/50 rounded bg-black/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 bg-green-900/50 text-green-400 text-xs font-bold rounded">SJF</span>
                                    <span className="text-gray-400 text-sm">Shortest Job First</span>
                                </div>
                                <p className="text-xs mb-2">
                                    Process with the <strong>shortest burst time</strong> is executed first.
                                    Optimal for minimizing average waiting time.
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                                    <span className="text-green-400">✓ Optimal average waiting time</span>
                                    <span className="text-red-400">✗ Requires knowing burst time in advance</span>
                                    <span className="text-red-400">✗ Starvation of long processes</span>
                                </div>
                            </div>
                        </div>

                        <h4 className="text-cyan-400 font-bold mb-2 mt-6">Key Metrics</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-3 border border-cyan-900/50 rounded bg-cyan-900/10 text-center">
                                <h5 className="text-cyan-400 font-bold text-xs mb-1">WAITING TIME</h5>
                                <p className="text-[10px] text-gray-400">Time spent in ready queue</p>
                            </div>
                            <div className="p-3 border border-purple-900/50 rounded bg-purple-900/10 text-center">
                                <h5 className="text-purple-400 font-bold text-xs mb-1">TURNAROUND TIME</h5>
                                <p className="text-[10px] text-gray-400">Total time from arrival to completion</p>
                            </div>
                            <div className="p-3 border border-green-900/50 rounded bg-green-900/10 text-center">
                                <h5 className="text-green-400 font-bold text-xs mb-1">RESPONSE TIME</h5>
                                <p className="text-[10px] text-gray-400">Time until first CPU access</p>
                            </div>
                        </div>
                    </DocSection>
                </div>

            </div>
        </div>
    );
}

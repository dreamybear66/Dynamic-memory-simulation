'use client';

import { useAllocationStore } from '@/store/allocationStore';
import AllocationControls from '@/components/controls/AllocationControls';
import MemoryTape from '@/components/visual/MemoryTape';
import FragmentationChart from '@/components/visual/FragmentationChart';
import SevenSegment from '@/components/ui/SevenSegment';
import TerminalWindow from '@/components/visual/TerminalWindow';

export default function VariablePartitioningPage() {
    const { statsHistory, totalMemory } = useAllocationStore();
    const currentStats = statsHistory[statsHistory.length - 1];

    // Calculate free space percentage
    const freePercent = ((currentStats.externalFragmentation / totalMemory) * 100).toFixed(1);

    return (
        <div className="min-h-full w-full p-6 flex flex-col gap-6">
            {/* Header / HUD */}
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 uppercase tracking-tighter">
                        Variable Partitioning Engine
                    </h1>
                    <div className="text-sm text-gray-500 font-mono">
                        DYNAMIC MEMORY ALLOCATION SIMULATOR
                    </div>
                </div>

                <div className="flex gap-4">
                    <SevenSegment
                        value={currentStats.processCount}
                        label="ACTIVE PROCS"
                        color="text-purple-400"
                        size="sm"
                    />
                    <SevenSegment
                        value={currentStats.largestHole}
                        label="MAX HOLE (KB)"
                        color="text-yellow-400"
                        size="sm"
                    />
                    <SevenSegment
                        value={freePercent}
                        label="FREE RAM %"
                        color="text-cyan-400"
                        size="sm"
                    />
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-12 gap-6 z-10 w-full">

                {/* Left Control Panel */}
                <div className="col-span-4">
                    <AllocationControls />
                </div>

                {/* Right Visualization Panel */}
                <div className="col-span-8 flex flex-col gap-4">

                    {/* Top: Memory Tape */}
                    <TerminalWindow title="PHYSICAL MEMORY TAPE" className="min-h-[400px]" status="scanning">
                        <MemoryTape />
                    </TerminalWindow>

                    {/* Bottom: Fragmentation Chart */}
                    <TerminalWindow title="EXTERNAL FRAGMENTATION MONITOR" className="h-48 shrink-0" status="active">
                        <FragmentationChart />
                    </TerminalWindow>
                </div>
            </div>
        </div>
    );
}

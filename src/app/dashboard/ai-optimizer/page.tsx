'use client';

import { useAIStore } from '@/store/aiStore';
import AICore from '@/components/visual/AICore';
import AILogTerminal from '@/components/visual/AILogTerminal';
import RecommendationCard from '@/components/visual/RecommendationCard';
import { motion } from 'framer-motion';
import { BrainCircuit, RefreshCw } from 'lucide-react';
import SevenSegment from '@/components/ui/SevenSegment';
import TerminalWindow from '@/components/visual/TerminalWindow';
import { useAllocationStore } from '@/store/allocationStore';
import { useSystemStore } from '@/store/memoryStore';

export default function AIOptimizerPage() {
    const { status, analyzeSystem, resetAI } = useAIStore();
    const { algorithm: allocAlgo } = useAllocationStore();
    const { schedulerConfig } = useSystemStore();
    const schedAlgo = schedulerConfig.algorithm;

    return (
        <div className="min-h-full w-full p-6 flex flex-col gap-6 relative">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between shrink-0 z-10">
                <div>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 uppercase tracking-tighter flex items-center gap-3">
                        <BrainCircuit size={32} className="text-yellow-500" />
                        AEGIS OPTIMIZATION ENGINE
                    </h1>
                    <div className="text-sm text-yellow-500/60 font-mono pl-11">
                        HEURISTIC SYSTEM ANALYZER v9.0
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-500 font-mono">CURRENT ALLOCATION</span>
                        <span className="text-cyan-400 font-bold font-mono">{allocAlgo.replace('_', ' ')}</span>
                    </div>
                    <div className="flex flex-col items-end border-l border-gray-800 pl-4">
                        <span className="text-[10px] text-gray-500 font-mono">CURRENT SCHEDULER</span>
                        <span className="text-purple-400 font-bold font-mono">{schedAlgo}</span>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-12 gap-6 z-10 w-full">

                {/* Left: Log Terminal */}
                <div className="col-span-3">
                    <AILogTerminal />
                </div>

                {/* Center: AI Core & Controls */}
                <div className="col-span-6 flex flex-col items-center justify-center relative min-h-[500px]">
                    {/* The Core */}
                    <div className="mb-12">
                        <AICore />
                    </div>

                    {/* Scan Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={analyzeSystem}
                        disabled={status !== 'IDLE'}
                        className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-amber-600 text-black font-black uppercase tracking-widest rounded-full shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:shadow-[0_0_50px_rgba(234,179,8,0.6)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {status === 'IDLE' ? 'INITIATE ANALYSIS' : 'SYSTEM SCANNING...'}
                    </motion.button>
                </div>

                {/* Right: Recommendation */}
                <div className="col-span-3 flex flex-col gap-4 justify-center">
                    <RecommendationCard />
                </div>
            </div>
        </div>
    );
}

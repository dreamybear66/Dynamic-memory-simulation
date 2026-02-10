'use client';

import { useState, useEffect } from 'react';
import TerminalWindow from '@/components/visual/TerminalWindow';
import PageReplacementTable from '@/components/visual/PageReplacementTable';
import { motion } from 'framer-motion';

/**
 * Paging Simulation Page - Page Replacement Algorithm Visualization
 * Focused educational tool for teaching page replacement algorithms
 */
export default function PagingPage() {
    const [mounted, setMounted] = useState(false);

    // Hydration fix
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <div className="flex flex-col min-h-full gap-4 pb-4">
            {/* HEADER */}
            <header className="flex justify-between items-end border-b border-cyan-900/50 pb-2 shrink-0">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text 
                        bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 
                        animate-[pulse_3s_ease-in-out_infinite]">
                        PAGE REPLACEMENT ALGORITHM SIMULATOR
                    </h1>
                    <div className="flex gap-4 mt-1 text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                        <span>Advanced OS Memory Management Visualization</span>
                    </div>
                </div>
            </header>

            {/* PAGE REPLACEMENT TABLE */}
            <TerminalWindow
                title="PAGE REPLACEMENT ALGORITHM VISUALIZATION"
                className="flex-1 min-h-[600px]"
                status="active"
            >
                <PageReplacementTable />
            </TerminalWindow>

            {/* Status Bar */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between px-4 py-2 bg-gray-900/50 border border-cyan-900/50 rounded text-[10px] font-mono"
            >
                <div className="flex gap-6">
                    <span className="text-gray-500">
                        MODE: <span className="text-cyan-400">MANUAL INPUT</span>
                    </span>
                    <span className="text-gray-500">
                        ALGORITHMS: <span className="text-purple-400">FIFO • LRU • Optimal • Clock</span>
                    </span>
                </div>
                <div className="flex gap-6">
                    <span className="text-gray-500">
                        STATUS: <span className="text-green-400">READY</span>
                    </span>
                </div>
            </motion.div>
        </div>
    );
}

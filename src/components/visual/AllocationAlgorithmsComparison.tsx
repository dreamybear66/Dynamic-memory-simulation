'use client';

import { motion } from 'framer-motion';

export default function AllocationAlgorithmsComparison() {
    const algorithms = [
        {
            name: 'First Fit',
            color: '#22d3ee',
            description: 'Allocates first suitable hole',
            blocks: [
                { type: 'process', label: 'P1', size: 20, color: '#22d3ee' },
                { type: 'hole', label: '150KB', size: 15, highlight: true },
                { type: 'process', label: 'P2', size: 25, color: '#ec4899' },
                { type: 'hole', label: '80KB', size: 8 },
                { type: 'process', label: 'P3', size: 22, color: '#a855f7' },
                { type: 'hole', label: '200KB', size: 20 },
            ]
        },
        {
            name: 'Best Fit',
            color: '#a855f7',
            description: 'Allocates smallest suitable hole',
            blocks: [
                { type: 'process', label: 'P1', size: 20, color: '#22d3ee' },
                { type: 'hole', label: '150KB', size: 15, highlight: true },
                { type: 'process', label: 'P2', size: 25, color: '#ec4899' },
                { type: 'hole', label: '80KB', size: 8 },
                { type: 'process', label: 'P3', size: 22, color: '#a855f7' },
                { type: 'hole', label: '200KB', size: 20 },
            ]
        },
        {
            name: 'Worst Fit',
            color: '#eab308',
            description: 'Allocates largest hole',
            blocks: [
                { type: 'process', label: 'P1', size: 20, color: '#22d3ee' },
                { type: 'hole', label: '150KB', size: 15 },
                { type: 'process', label: 'P2', size: 25, color: '#ec4899' },
                { type: 'hole', label: '80KB', size: 8 },
                { type: 'process', label: 'P3', size: 22, color: '#a855f7' },
                { type: 'hole', label: '200KB', size: 20, highlight: true },
            ]
        },
        {
            name: 'Next Fit',
            color: '#10b981',
            description: 'Continues from last allocation',
            blocks: [
                { type: 'process', label: 'P1', size: 20, color: '#22d3ee' },
                { type: 'hole', label: '150KB', size: 15 },
                { type: 'process', label: 'P2', size: 25, color: '#ec4899' },
                { type: 'hole', label: '80KB', size: 8 },
                { type: 'process', label: 'P3', size: 22, color: '#a855f7' },
                { type: 'hole', label: '200KB', size: 20, highlight: true },
            ]
        },
    ];

    return (
        <div className="w-full bg-black/40 border border-cyan-900/30 rounded-lg p-6">
            <h3 className="text-cyan-400 font-bold text-sm mb-4 text-center">
                Memory Allocation Algorithms Comparison
            </h3>
            <div className="text-center mb-6">
                <div className="inline-block px-3 py-1 bg-purple-900/30 border border-purple-500/50 rounded text-xs text-purple-300">
                    New Process: 120KB
                </div>
            </div>

            <div className="space-y-6">
                {algorithms.map((algo, idx) => (
                    <motion.div
                        key={algo.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center gap-2">
                            <span
                                className="px-2 py-0.5 rounded text-xs font-bold"
                                style={{
                                    backgroundColor: `${algo.color}20`,
                                    color: algo.color,
                                    border: `1px solid ${algo.color}50`
                                }}
                            >
                                {algo.name}
                            </span>
                            <span className="text-xs text-gray-400">{algo.description}</span>
                        </div>

                        <div className="flex items-center gap-1 h-12">
                            {algo.blocks.map((block, blockIdx) => (
                                <motion.div
                                    key={blockIdx}
                                    initial={{ scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    transition={{ delay: idx * 0.1 + blockIdx * 0.05 }}
                                    className="relative flex items-center justify-center text-[10px] font-mono"
                                    style={{
                                        width: `${block.size}%`,
                                        height: '100%',
                                        backgroundColor: block.type === 'hole' ? '#1a1a2e' : block.color,
                                        border: block.highlight
                                            ? `2px solid ${algo.color}`
                                            : block.type === 'hole'
                                                ? '1px dashed #374151'
                                                : `1px solid ${block.color}`,
                                        boxShadow: block.highlight
                                            ? `0 0 10px ${algo.color}80`
                                            : 'none',
                                    }}
                                >
                                    <span className={block.type === 'hole' ? 'text-gray-500' : 'text-white'}>
                                        {block.label}
                                    </span>
                                    {block.highlight && (
                                        <motion.div
                                            className="absolute -top-6 left-1/2 transform -translate-x-1/2"
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 + 0.3 }}
                                        >
                                            <div className="text-xs" style={{ color: algo.color }}>▼</div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex justify-between text-[9px] text-gray-600 font-mono">
                            <span>0 KB</span>
                            <span>5000 KB</span>
                            <span>10000 KB</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

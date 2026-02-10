'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export default function PagingWorkflowDiagram() {
    const [highlightStep, setHighlightStep] = useState<number | null>(null);

    const steps = [
        { id: 1, label: 'CPU generates\nLogical Address', color: '#22d3ee', type: 'start' },
        { id: 2, label: 'Check TLB', color: '#a855f7', type: 'decision' },
        { id: 3, label: 'TLB Hit?\nGet Frame #', color: '#10b981', type: 'success', branch: 'hit' },
        { id: 4, label: 'Access\nPage Table', color: '#eab308', type: 'process', branch: 'miss' },
        { id: 5, label: 'Page Valid?', color: '#a855f7', type: 'decision' },
        { id: 6, label: 'Update TLB', color: '#10b981', type: 'success' },
        { id: 7, label: 'PAGE FAULT!', color: '#ef4444', type: 'error' },
        { id: 8, label: 'Load from Disk', color: '#f97316', type: 'process' },
        { id: 9, label: 'Update Page Table', color: '#eab308', type: 'process' },
        { id: 10, label: 'Access Physical\nMemory', color: '#22d3ee', type: 'end' },
    ];

    return (
        <div className="w-full bg-black/40 border border-cyan-900/30 rounded-lg p-6">
            <h3 className="text-cyan-400 font-bold text-sm mb-6 text-center">
                Complete Paging Workflow
            </h3>

            <div className="flex flex-col items-center space-y-3 relative">
                {/* Step 1: CPU */}
                <FlowBox step={steps[0]} highlight={highlightStep === 1} onHover={() => setHighlightStep(1)} />
                <Arrow />

                {/* Step 2: Check TLB */}
                <FlowBox step={steps[1]} highlight={highlightStep === 2} onHover={() => setHighlightStep(2)} diamond />

                {/* Branch: TLB Hit and Miss */}
                <div className="flex gap-8 items-start w-full justify-center">
                    {/* TLB Hit Path (Left) */}
                    <div className="flex flex-col items-center space-y-3">
                        <div className="text-xs text-green-400 font-bold">✓ HIT</div>
                        <Arrow color="#10b981" />
                        <FlowBox step={steps[2]} highlight={highlightStep === 3} onHover={() => setHighlightStep(3)} />
                        <Arrow />
                        <div className="h-20" /> {/* Spacer */}
                        <Arrow />
                        <FlowBox step={steps[9]} highlight={highlightStep === 10} onHover={() => setHighlightStep(10)} />
                    </div>

                    {/* TLB Miss Path (Right) */}
                    <div className="flex flex-col items-center space-y-3">
                        <div className="text-xs text-red-400 font-bold">✗ MISS</div>
                        <Arrow color="#ef4444" />
                        <FlowBox step={steps[3]} highlight={highlightStep === 4} onHover={() => setHighlightStep(4)} />
                        <Arrow />
                        <FlowBox step={steps[4]} highlight={highlightStep === 5} onHover={() => setHighlightStep(5)} diamond />

                        {/* Page Valid Branch */}
                        <div className="flex gap-6 items-start">
                            {/* Valid (Left) */}
                            <div className="flex flex-col items-center space-y-2">
                                <div className="text-[10px] text-green-400">✓ Valid</div>
                                <Arrow color="#10b981" size="small" />
                                <FlowBox step={steps[5]} highlight={highlightStep === 6} onHover={() => setHighlightStep(6)} small />
                            </div>

                            {/* Invalid (Right) */}
                            <div className="flex flex-col items-center space-y-2">
                                <div className="text-[10px] text-red-400">✗ Invalid</div>
                                <Arrow color="#ef4444" size="small" />
                                <FlowBox step={steps[6]} highlight={highlightStep === 7} onHover={() => setHighlightStep(7)} small />
                                <Arrow size="small" />
                                <FlowBox step={steps[7]} highlight={highlightStep === 8} onHover={() => setHighlightStep(8)} small />
                                <Arrow size="small" />
                                <FlowBox step={steps[8]} highlight={highlightStep === 9} onHover={() => setHighlightStep(9)} small />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-8 pt-4 border-t border-gray-800 grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px]">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-cyan-500" />
                    <span className="text-gray-400">Start/End</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rotate-45 bg-purple-500" />
                    <span className="text-gray-400">Decision</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-500" />
                    <span className="text-gray-400">Success Path</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-500" />
                    <span className="text-gray-400">Fault Path</span>
                </div>
            </div>
        </div>
    );
}

function FlowBox({ step, highlight, onHover, diamond, small }: any) {
    const size = small ? 'w-24 h-16' : 'w-32 h-20';
    const textSize = small ? 'text-[9px]' : 'text-xs';

    return (
        <motion.div
            className={`${size} flex items-center justify-center ${textSize} font-bold text-center whitespace-pre-line cursor-pointer transition-all ${diamond ? 'rotate-45' : ''
                }`}
            style={{
                backgroundColor: `${step.color}20`,
                border: `2px solid ${step.color}`,
                boxShadow: highlight ? `0 0 20px ${step.color}80` : `0 0 5px ${step.color}40`,
            }}
            onMouseEnter={onHover}
            onMouseLeave={() => { }}
            whileHover={{ scale: 1.05 }}
        >
            <span className={diamond ? '-rotate-45' : ''} style={{ color: step.color }}>
                {step.label}
            </span>
        </motion.div>
    );
}

function Arrow({ color = '#6b7280', size = 'normal' }: { color?: string; size?: 'normal' | 'small' }) {
    const height = size === 'small' ? 'h-6' : 'h-8';
    return (
        <div className={`w-0.5 ${height}`} style={{ backgroundColor: color }}>
            <div className="relative w-full h-full">
                <div
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
                    style={{
                        width: 0,
                        height: 0,
                        borderLeft: '4px solid transparent',
                        borderRight: '4px solid transparent',
                        borderTop: `6px solid ${color}`,
                    }}
                />
            </div>
        </div>
    );
}

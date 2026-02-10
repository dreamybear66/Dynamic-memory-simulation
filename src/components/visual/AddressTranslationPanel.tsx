'use client';

import { usePagingStore } from '@/store/pagingStore';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { ArrowRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

/**
 * AddressTranslationPanel - Step-by-step visualization of logical to physical address translation
 * Shows binary breakdown, TLB check, page table lookup, and physical address generation
 */
export default function AddressTranslationPanel() {
    const [inputAddress, setInputAddress] = useState('');
    const config = usePagingStore(state => state.config);
    const currentTranslation = usePagingStore(state => state.currentTranslation);
    const accessMemory = usePagingStore(state => state.accessMemory);
    const simulation = usePagingStore(state => state.simulation);

    const handleTranslate = () => {
        const address = parseInt(inputAddress);
        if (!isNaN(address) && address >= 0 && address < config.logicalAddressSpaceSize) {
            accessMemory(address);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleTranslate();
        }
    };

    const pageNumber = currentTranslation.logicalAddress !== null
        ? currentTranslation.logicalAddress >> config.offsetBits
        : null;
    const offset = currentTranslation.logicalAddress !== null
        ? currentTranslation.logicalAddress & ((1 << config.offsetBits) - 1)
        : null;

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="mb-3">
                <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
                    Address Translation
                </h3>

                {/* Input */}
                <div className="flex gap-2">
                    <input
                        type="number"
                        value={inputAddress}
                        onChange={(e) => setInputAddress(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter logical address..."
                        disabled={simulation.mode === 'auto' && simulation.isRunning}
                        className="flex-1 bg-black/50 border border-cyan-900 text-white px-3 py-2 text-sm 
                            focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
                    />
                    <button
                        onClick={handleTranslate}
                        disabled={simulation.mode === 'auto' && simulation.isRunning}
                        className="px-4 py-2 bg-cyan-900/30 border border-cyan-500 text-cyan-400 
                            hover:bg-cyan-500 hover:text-black transition-all font-bold text-sm
                            disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        TRANSLATE
                    </button>
                </div>

                <div className="text-[10px] text-gray-500 mt-1">
                    Range: 0 - {config.logicalAddressSpaceSize - 1} (0x{(config.logicalAddressSpaceSize - 1).toString(16).toUpperCase()})
                </div>
            </div>

            {/* Translation Steps */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {currentTranslation.logicalAddress !== null && (
                    <>
                        {/* Binary Breakdown */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-900/50 border border-cyan-900/50 rounded p-3"
                        >
                            <div className="text-[10px] text-gray-400 mb-2">LOGICAL ADDRESS BREAKDOWN</div>

                            <div className="space-y-2">
                                {/* Decimal */}
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-500 w-16">Decimal:</span>
                                    <span className="text-white font-mono font-bold">
                                        {currentTranslation.logicalAddress}
                                    </span>
                                </div>

                                {/* Hexadecimal */}
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-500 w-16">Hex:</span>
                                    <span className="text-cyan-400 font-mono font-bold">
                                        0x{currentTranslation.logicalAddress.toString(16).toUpperCase().padStart(4, '0')}
                                    </span>
                                </div>

                                {/* Binary */}
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-500 w-16">Binary:</span>
                                    <div className="flex gap-1 font-mono">
                                        <span className="text-purple-400 bg-purple-900/20 px-1 rounded">
                                            {pageNumber?.toString(2).padStart(config.pageNumberBits, '0')}
                                        </span>
                                        <span className="text-green-400 bg-green-900/20 px-1 rounded">
                                            {offset?.toString(2).padStart(config.offsetBits, '0')}
                                        </span>
                                    </div>
                                </div>

                                {/* Page & Offset */}
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800">
                                    <div>
                                        <div className="text-[9px] text-purple-400 mb-1">Page Number</div>
                                        <div className="text-lg font-mono font-bold text-purple-400">
                                            {pageNumber}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] text-green-400 mb-1">Offset</div>
                                        <div className="text-lg font-mono font-bold text-green-400">
                                            {offset}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Translation Steps */}
                        <AnimatePresence mode="popLayout">
                            {currentTranslation.steps.map((step, index) => (
                                <motion.div
                                    key={step.step}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={clsx(
                                        "border-2 rounded p-3 transition-all",
                                        step.status === 'complete' && "bg-gray-900/30 border-gray-700",
                                        step.status === 'error' && "bg-red-900/20 border-red-500/50",
                                        step.title.includes('Hit') && "bg-green-900/20 border-green-500/50"
                                    )}
                                >
                                    <div className="flex items-start gap-2">
                                        {/* Icon */}
                                        <div className="mt-0.5">
                                            {step.status === 'error' ? (
                                                <XCircle size={16} className="text-red-400" />
                                            ) : step.title.includes('Hit') ? (
                                                <CheckCircle size={16} className="text-green-400" />
                                            ) : step.title.includes('Miss') ? (
                                                <AlertCircle size={16} className="text-yellow-400" />
                                            ) : (
                                                <ArrowRight size={16} className="text-cyan-400" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] text-gray-500 font-mono">
                                                    STEP {step.step}
                                                </span>
                                                <span className={clsx(
                                                    "text-xs font-bold",
                                                    step.status === 'error' && "text-red-400",
                                                    step.title.includes('Hit') && "text-green-400",
                                                    step.title.includes('Miss') && "text-yellow-400",
                                                    step.status === 'complete' && !step.title.includes('Hit') && !step.title.includes('Miss') && "text-cyan-400"
                                                )}>
                                                    {step.title}
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-gray-300">
                                                {step.description}
                                            </div>

                                            {/* Additional Data */}
                                            {step.data && step.step === currentTranslation.steps.length && (
                                                <div className="mt-2 pt-2 border-t border-gray-800">
                                                    {step.data.physicalAddress !== undefined && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] text-gray-500">Physical Address:</span>
                                                            <span className="text-sm font-mono font-bold text-green-400">
                                                                {step.data.physicalAddress}
                                                            </span>
                                                            <span className="text-[10px] text-gray-500">
                                                                (0x{step.data.physicalAddress.toString(16).toUpperCase()})
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Final Result */}
                        {currentTranslation.result && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border-2 border-cyan-500/50 rounded p-4"
                            >
                                <div className="text-[10px] text-cyan-400 mb-2">TRANSLATION COMPLETE</div>
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <div className="text-gray-500 mb-1">TLB</div>
                                        <div className={clsx(
                                            "font-bold",
                                            currentTranslation.result.tlbHit ? "text-green-400" : "text-yellow-400"
                                        )}>
                                            {currentTranslation.result.tlbHit ? 'HIT' : 'MISS'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 mb-1">Page Fault</div>
                                        <div className={clsx(
                                            "font-bold",
                                            currentTranslation.result.pageFault ? "text-red-400" : "text-green-400"
                                        )}>
                                            {currentTranslation.result.pageFault ? 'YES' : 'NO'}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </>
                )}

                {/* Empty State */}
                {currentTranslation.logicalAddress === null && (
                    <div className="flex items-center justify-center h-full text-gray-600 text-sm">
                        Enter a logical address to begin translation
                    </div>
                )}
            </div>
        </div>
    );
}
